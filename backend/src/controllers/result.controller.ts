import type { Request, Response, NextFunction } from 'express'
import Ballot from '~/models/ballot.model'
import Result from '~/models/result.model'
import Election from '~/models/election.model'
import { homomorphicAdd, deserializePublicKey } from '~/utils/paillier'

/**
 *  @desc    Kiểm phiếu tự động cho một cuộc bầu cử
 *  @route   POST /api/results/count/:electionId
 *  @access  Private/Admin
 */
export const countElectionResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { electionId } = req.params

        const election = await Election.findById(electionId)
        if (!election) {
            res.status(404)
            throw new Error('Election not found')
        }

        const publicKey = election.publicKey
        if (!publicKey) {
            res.status(404)
            throw new Error('publicKey not found')
        }
        const pk = deserializePublicKey(publicKey)

        const ballots = await Ballot.find({ electionId })
        if (ballots.length === 0) {
            res.status(400)
            throw new Error('No ballots found for this election')
        }

        const candidateSums: Record<string, string> = {}

        for (const ballot of ballots) {
            const entries = JSON.parse(ballot.encryptedBallot) as Array<{
                candidateId: string
                cipher: string
            }>
            for (const { candidateId, cipher } of entries) {
                const c = BigInt(cipher)
                if (!candidateSums[candidateId]) {
                    candidateSums[candidateId] = c.toString(16)
                } else {
                    // cộng dồn ciphertext
                    candidateSums[candidateId] = homomorphicAdd(pk, BigInt(candidateSums[candidateId]), c).toString(16)
                }
            }
        }

        // Check if result already exists to preserve decryptedSum values
        const existingResult = await Result.findOne({ electionId })

        const tallies = Object.entries(candidateSums).map(([candidateId, encryptedSum]) => {
            // Find existing tally for this candidate to preserve decryptedSum
            const existingTally = existingResult?.tallies.find((t) => t.candidateId.toString() === candidateId)

            return {
                candidateId,
                encryptedSum,
                decryptedSum: existingTally?.decryptedSum ?? 0 // Preserve existing or default to 0
            }
        })

        const result = await Result.findOneAndUpdate({ electionId }, { tallies }, { new: true, upsert: true })

        res.status(200).json({
            success: true,
            message: 'Encrypted tally computed. Ready for decryption on frontend.',
            data: result
        })
    } catch (error) {
        next(error)
    }
}
/*
 *  @desc    Cập nhật kết quả kiểm phiếu đã giải mã cho một cuộc bầu cử
 *  @route   PUT /api/results/decrypt/:electionId
 *  @access  Private/Admin
 */
export const updateDecryptedResults = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { electionId } = req.params
        const { tallies } = req.body

        const result = await Result.findOne({ electionId })
        if (!result) {
            res.status(404)
            throw new Error('Result not found')
        }

        // Gộp decryptedSum vào từng tally tương ứng
        for (const item of tallies) {
            const match = result.tallies.find((t) => t.candidateId.toString() === item.candidateId)
            if (match) match.decryptedSum = item.decryptedSum
        }

        await result.save()

        res.json({
            success: true,
            message: 'Decrypted results updated successfully',
            data: result
        })
    } catch (error) {
        next(error)
    }
}

/**
 *  @desc    Lấy kết quả kiểm phiếu cho một cuộc bầu cử
 *  @route   GET /api/results/:electionId
 *  @access  Public/Admin
 */
export const getElectionResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { electionId } = req.params
        const result = await Result.findOne({ electionId })

        if (!result) {
            res.status(404)
            throw new Error('Result not found for this election')
        }

        res.json({ success: true, data: result })
    } catch (error: unknown) {
        next(error)
    }
}
