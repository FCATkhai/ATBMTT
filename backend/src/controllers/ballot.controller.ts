import type { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import Ballot from '~/models/ballot.model'
import Election from '~/models/election.model'
import userService from '~/services/user.service'

const SECRET_SALT = process.env.VOTE_TOKEN_SALT

/**
 *  @desc    Gửi phiếu bầu (mã hoá + lưu)
 *  @route   POST /api/ballots
 *  @access  Private (voter)
 */
export const submitBallot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { voterId, electionId, encryptedBallot } = req.body

        if (!voterId || !electionId || !encryptedBallot) {
            res.status(400)
            throw new Error('Missing required fields (voterId, electionId, encryptedBallot)')
        }

        // Kiểm tra cuộc bầu cử tồn tại
        const election = await Election.findById(electionId)
        if (!election) {
            res.status(404)
            throw new Error('Election not found')
        }

        // Chỉ cho phép bỏ phiếu trong khoảng thời gian [startTime, endTime]
        const now = new Date()
        const starts = new Date(election.startTime)
        const ends = new Date(election.endTime)

        if (now < starts) {
            res.status(400)
            throw new Error('Election has not started yet')
        }

        if (now > ends) {
            res.status(400)
            throw new Error('Election has already ended')
        }

        // Tạo token duy nhất cho phiếu bầu (ẩn danh)
        const voteToken = crypto
            .createHash('sha256')
            .update(voterId + electionId + SECRET_SALT)
            .digest('hex')

        // Kiểm tra voter đã bỏ phiếu chưa
        const existingBallot = await Ballot.findOne({ voteToken })
        if (existingBallot) {
            res.status(400)
            throw new Error('Voter has already submitted a ballot in this election')
        }

        // Lưu phiếu bầu (đã mã hoá)
        const ballot = await Ballot.create({
            voteToken,
            electionId,
            encryptedBallot: typeof encryptedBallot === 'string' ? encryptedBallot : JSON.stringify(encryptedBallot) // Đảm bảo là string
        })

        // Cập nhật trạng thái đã bỏ phiếu cho voter
        await userService.updateUserById(voterId, { hasVoted: true })

        res.status(201).json({
            success: true,
            message: 'Ballot submitted successfully',
            data: {
                _id: ballot._id,
                electionId: ballot.electionId,
                createdAt: ballot.createdAt,
                updatedAt: ballot.updatedAt
            }
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Lấy danh sách tất cả phiếu bầu của 1 cuộc bầu cử
 *  @route   GET /api/ballots/:electionId
 *  @access  Private/Admin
 */
export const getBallotsByElection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { electionId } = req.params
        const ballots = await Ballot.find({ electionId }).sort({ createdAt: -1 })

        res.json({
            success: true,
            data: ballots
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Kiểm tra voter đã bỏ phiếu chưa
 *  @route   POST /api/ballots/check
 *  @access  Private (voter)
 */
export const checkIfVoted = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { voterId, electionId } = req.body
        if (!voterId || !electionId) {
            res.status(400)
            throw new Error('Missing voterId or electionId')
        }

        const voteToken = crypto
            .createHash('sha256')
            .update(voterId + electionId + SECRET_SALT)
            .digest('hex')

        const existingBallot = await Ballot.findOne({ voteToken })
        const hasVoted = !!existingBallot

        res.json({
            success: true,
            data: hasVoted
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Xoá tất cả phiếu bầu của 1 cuộc bầu cử (dành cho admin reset)
 *  @route   DELETE /api/ballots/:electionId
 *  @access  Private/Admin
 */
export const deleteBallotsByElection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { electionId } = req.params
        const result = await Ballot.deleteMany({ electionId })

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} ballots for election ${electionId}`
        })
    } catch (error: unknown) {
        next(error)
    }
}
