import { Document, Types } from 'mongoose'
// import { Request } from "express";

export type UserRole = 'voter' | 'admin'

export interface IUser extends Document {
    _id: Types.ObjectId
    name: string
    email: string
    password: string
    role: UserRole
    hasVoted: boolean
    electionId?: string | null
    comparePassword(candidatePassword: string): Promise<boolean>
}

export interface ICandidate extends Document {
    _id: Types.ObjectId
    name: string
    image?: string //base64
    electionId: Types.ObjectId
}

export const ELECTION_STATUSES = ['upcoming', 'running', 'finished'] as const
export type ElectionStatus = (typeof ELECTION_STATUSES)[number]

export interface IElection extends Document {
    _id: Types.ObjectId
    name: string
    publicKey: { n: string; g: string; n2: string } // Paillier public key (n, g)
    startTime: Date
    endTime: Date
    status: ElectionStatus
}

export interface IBallot extends Document {
    _id: Types.ObjectId
    voteToken: string // token dùng để xác thực phiếu bầu (SHA256(voterId + electionId + secretSalt))
    electionId: Types.ObjectId
    encryptedBallot: string // ciphertext
    createdAt: Date
    updatedAt: Date
    // hashPrev?: string | null // cho hash chain (có thể implement ledger)
    // hashThis: string
    compareVoteToken(voterId: string, electionId: string): boolean
}

type tally = {
    candidateId: Types.ObjectId
    encryptedSum: string // Tổng mã hoá Pallier
    decryptedSum: number // chỉ có sau khi giải mã
}

export interface IResult extends Document {
    _id: Types.ObjectId
    electionId: Types.ObjectId
    tallies: tally[]
    createdAt: Date
    updatedAt: Date
}
