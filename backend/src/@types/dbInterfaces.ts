import { Document, Types } from 'mongoose'
// import { Request } from "express";

export type UserRole = 'voter' | 'admin'

export interface IUser extends Document {
    _id: Types.ObjectId
    name: string
    email: string
    password: string
    role: UserRole
    electionId?: string | null
    comparePassword(candidatePassword: string): Promise<boolean>
}

export interface ICandidate extends Document {
    _id: Types.ObjectId
    name: string
    image: string //base64
    electionId: string
}

export type ElectionStatus = 'upcoming' | 'running' | 'finished'

export interface IElection extends Document {
    _id: Types.ObjectId
    name: string
    startTime: Date
    endTime: Date
    candidateIds: string[]
    status: ElectionStatus
}

export interface IBallot extends Document {
    _id: Types.ObjectId
    voterId: string
    electionId: string
    encryptedVotes: string[] // Mảng ciphertext dạng base64 (1 cho được chọn, 0 cho không chọn)
    timestamp: Date
    // hashPrev?: string | null // cho hash chain (có thể implement ledger)
    // hashThis: string
}

export interface IResult extends Document {
    electionId: string
    candidateId: string
    encryptedSum: string // ciphertext tổng phiếu
    decryptedSum?: number | null // chỉ có sau khi giải mã
}
