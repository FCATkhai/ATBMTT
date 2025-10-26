import type { Request, Response, NextFunction } from 'express'
import Election from '~/models/election.model'

/**
 *  @desc    Tạo mới một cuộc bầu cử
 *  @route   POST /api/elections
 *  @access  Private/Admin
 */
export const createElection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, startTime, endTime, publicKey } = req.body

        // Kiểm tra dữ liệu cơ bản
        if (!name || !startTime || !endTime || !publicKey?.n || !publicKey?.g) {
            res.status(400)
            throw new Error('Missing required fields (name, startTime, endTime, publicKey)')
        }

        // Kiểm tra thời gian
        if (new Date(startTime) >= new Date(endTime)) {
            res.status(400)
            throw new Error('Invalid time range: startTime must be before endTime')
        }

        const election = await Election.create({
            name,
            startTime,
            endTime,
            publicKey
        })

        res.status(201).json({
            success: true,
            message: 'Election created successfully',
            election
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Lấy danh sách tất cả các cuộc bầu cử
 *  @route   GET /api/elections
 *  @access  Private/Admin
 */
export const getAllElections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const elections = await Election.find().sort({ createdAt: -1 })
        res.json({ success: true, elections })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Lấy thông tin chi tiết một cuộc bầu cử
 *  @route   GET /api/elections/:id
 *  @access  Public (hoặc Admin)
 */
export const getElectionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const election = await Election.findById(req.params.id)
        if (!election) {
            res.status(404)
            throw new Error('Election not found')
        }

        res.json({ success: true, election })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Cập nhật thông tin hoặc trạng thái cuộc bầu cử
 *  @route   PUT /api/elections/:id
 *  @access  Private/Admin
 */
export const updateElection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, startTime, endTime, status, candidateIds } = req.body

        const election = await Election.findById(req.params.id)
        if (!election) {
            res.status(404)
            throw new Error('Election not found')
        }

        if (name) election.name = name
        if (startTime) election.startTime = new Date(startTime)
        if (endTime) election.endTime = new Date(endTime)
        if (status) election.status = status
        if (candidateIds) election.candidateIds = candidateIds

        const updatedElection = await election.save()
        res.json({ success: true, message: 'Election updated', election: updatedElection })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Xóa cuộc bầu cử
 *  @route   DELETE /api/elections/:id
 *  @access  Private/Admin
 */
export const deleteElection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const election = await Election.findById(req.params.id)
        if (!election) {
            res.status(404)
            throw new Error('Election not found')
        }

        await election.deleteOne()
        res.json({ success: true, message: 'Election deleted successfully' })
    } catch (error: unknown) {
        next(error)
    }
}
