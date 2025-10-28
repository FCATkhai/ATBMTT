import type { Request, Response, NextFunction } from 'express'
import Candidate from '~/models/candidate.model'
import Election from '~/models/election.model'
import candidateService from '~/services/candidate.service'
import { Types } from 'mongoose'
import type { ICandidate } from '~/@types/dbInterfaces'
//TODO: thêm chức năng thêm candidate theo bulk
/**
 *  @desc    Tạo mới ứng cử viên
 *  @route   POST /api/candidates
 *  @access  Private/Admin
 */
export const createCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, image, electionId } = req.body

        if (!name || !electionId) {
            res.status(400)
            throw new Error('Missing required fields: name or electionId')
        }

        const candidate = await candidateService.createCandidate({ name, image, electionId })
        res.status(201).json({
            success: true,
            message: 'Candidate created successfully',
            data: candidate
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Tạo mới nhiều ứng cử viên
 *  @route   POST /api/candidates/multiple
 *  @access  Private/Admin
 */
export const createMultipleCandidates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const candidatesData: Array<{ name: string; image?: string; electionId: string }> = req.body.candidates
        if (!Array.isArray(candidatesData) || candidatesData.length === 0) {
            res.status(400)
            throw new Error('Invalid candidates data')
        }
        const createdCandidates = []
        for (const candidateData of candidatesData) {
            const { name, image, electionId } = candidateData

            if (!name || !electionId) {
                res.status(400)
                throw new Error('Missing required fields: name or electionId')
            }

            let electionObjectId: Types.ObjectId
            try {
                electionObjectId = new Types.ObjectId(electionId)
            } catch (error) {
                res.status(400)
                throw new Error('Invalid election ID format')
            }

            const candidateInput: Partial<ICandidate> = {
                name,
                electionId: electionObjectId
            }
            // Only add image if it exists
            if (image) {
                candidateInput.image = image
            }

            const candidate = await candidateService.createCandidate(candidateInput)
            createdCandidates.push(candidate)
        }
        res.status(201).json({
            success: true,
            message: 'Multiple candidates created successfully',
            data: createdCandidates
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Lấy danh sách tất cả ứng cử viên (tuỳ chọn lọc theo election)
 *  @route   GET /api/candidates
 *  @access  Public
 */
export const getAllCandidates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { electionId } = req.query

        const filter = electionId ? { electionId } : {}
        const candidates = await Candidate.find(filter).sort({ createdAt: -1 })

        res.json({
            success: true,
            data: candidates
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Lấy thông tin chi tiết 1 ứng cử viên
 *  @route   GET /api/candidates/:id
 *  @access  Public
 */
export const getCandidateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const candidate = await Candidate.findById(req.params.id)
        if (!candidate) {
            res.status(404)
            throw new Error('Candidate not found')
        }

        res.json({ success: true, data: candidate })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Cập nhật thông tin ứng cử viên
 *  @route   PUT/PATCH /api/candidates/:id
 *  @access  Private/Admin
 */
export const updateCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, image } = req.body
        const candidate = await Candidate.findById(req.params.id)

        if (!candidate) {
            res.status(404)
            throw new Error('Candidate not found')
        }

        if (name) candidate.name = name
        if (image) candidate.image = image

        const updatedCandidate = await candidate.save()
        res.json({
            success: true,
            message: 'Candidate updated successfully',
            data: updatedCandidate
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Xóa ứng cử viên
 *  @route   DELETE /api/candidates/:id
 *  @access  Private/Admin
 */
export const deleteCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const candidate = await Candidate.findById(req.params.id)
        if (!candidate) {
            res.status(404)
            throw new Error('Candidate not found')
        }

        await candidate.deleteOne()
        res.json({
            success: true,
            message: 'Candidate deleted successfully'
        })
    } catch (error: unknown) {
        next(error)
    }
}
