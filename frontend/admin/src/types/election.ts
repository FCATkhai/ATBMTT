export type UserRole = 'voter' | 'admin'

export interface IUser{
    _id: string
    name: string
    email: string
    password: string
    role: UserRole
    electionId?: string | null
    comparePassword(candidatePassword: string): Promise<boolean>
}

export interface ICandidate{
    _id: string
    name: string
    image: string //base64
    electionId: string
}

export interface ICandidateCreate {
    name: string,
    image: string,
    electionId: string
}

export type ElectionStatus = 'upcoming' | 'running' | 'finished'

export type PublicKeyType = {
    g: string,
    n: string,
    n2: string
}

export interface IElection{
    _id: string
    name: string
    startTime: Date
    endTime: Date
    publicKey: PublicKeyType
    candidateIds: string[]
    status: ElectionStatus
}

export interface IElectionCreate {
    name: string,
    startTime: Date,
    endTime: Date,
    publicKey: PublicKeyType,
    status: ElectionStatus
}

export interface IBallot{
    _id: string
    voterId: string
    electionId: string
    encryptedVotes: string[] // Mảng ciphertext dạng base64 (1 cho được chọn, 0 cho không chọn)
    timestamp: Date
    // hashPrev?: string | null // cho hash chain (có thể implement ledger)
    // hashThis: string
}

export interface IResult{
    electionId: string
    candidateId: string
    encryptedSum: string // ciphertext tổng phiếu
    decryptedSum?: number | null // chỉ có sau khi giải mã
}
