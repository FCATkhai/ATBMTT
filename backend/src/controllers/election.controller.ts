import type { Request, Response, NextFunction } from 'express'
import userService from '~/services/user.service'
import Election from '~/models/election.model'
import CandidateModel from '~/models/candidate.model'
import UserModel from '~/models/user.model'
import BallotModel from '~/models/ballot.model'
import ResultModel from '~/models/result.model'

/**
 *  @desc    Tạo mới một cuộc bầu cử
 *  @route   POST /api/elections
 *  @access  Private/Admin
 */
export const createElection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, startTime, endTime, publicKey, status } = req.body

        // Kiểm tra dữ liệu cơ bản
        if (!name || !startTime || !endTime || !publicKey?.n || !publicKey?.g || !status) {
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
            status,
            endTime,
            publicKey
        })

        res.status(201).json({
            success: true,
            message: 'Election created successfully',
            data: election
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
        res.json({ success: true, data: elections })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Lấy thông tin chi tiết một cuộc bầu cử
 *  @route   GET /api/elections/:id
 *  @access  Private
 */
export const getElectionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const election = await Election.findById(req.params.id)
        if (!election) {
            res.status(404)
            throw new Error('Election not found')
        }

        res.json({ success: true, data: election })
    } catch (error: unknown) {
        next(error)
    }
}

/*
 *  @desc    Lấy cuộc bầu cử mà một user đang tham gia
 *  @route   GET /api/elections/user/:userId
 *  @access  Private
 */

export const getElectionByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.params.userId
        if (!userId) {
            res.status(400)
            throw new Error('Missing userId parameter')
        }
        // Giả sử mỗi user chỉ tham gia một cuộc bầu cử tại một thời điểm
        const user = await userService.getUserById(userId)
        if (!user) {
            res.status(404)
            throw new Error('User not found')
        }
        const election = await Election.findOne({ _id: user.electionId })
        if (!election) {
            res.status(404)
            throw new Error('No ongoing election found')
        }

        res.json({ success: true, data: election })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Cập nhật thông tin hoặc trạng thái cuộc bầu cử
 *  @route   PATCH /api/elections/:id
 *  @access  Private/Admin
 */
export const updateElection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, startTime, endTime, status } = req.body

        const election = await Election.findById(req.params.id)
        if (!election) {
            res.status(404)
            throw new Error('Election not found')
        }

        if (name) election.name = name
        if (startTime) election.startTime = new Date(startTime)
        if (endTime) election.endTime = new Date(endTime)
        if (status) election.status = status

        const updatedElection = await election.save()
        res.json({ success: true, message: 'Election updated', data: updatedElection })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @desc    Xóa cuộc bầu cử và reset trạng thái cử tri
 * @route   DELETE /api/elections/:id
 * @access  Private/Admin
 */
export const deleteElection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const electionId = req.params.id

        const election = await Election.findById(electionId)
        if (!election) {
            res.status(404)
            throw new Error('Election not found')
        }
        await UserModel.updateMany(
            { electionId: electionId },
            { 
                $set: { 
                    hasVoted: false, 
                    electionId: null 
                } 
            }
        )

        await CandidateModel.deleteMany({ electionId }) // Xóa hết ứng viên
        await BallotModel.deleteMany({ electionId })    // Xóa hết phiếu bầu cũ
        await ResultModel.deleteMany({ electionId })    // Xóa kết quả kiểm phiếu
        await election.deleteOne()

        res.json({ 
            success: true, 
            message: 'Election deleted, voters reset, and related data cleaned up successfully' 
        })
        
    } catch (error: unknown) {
        next(error)
    }
}