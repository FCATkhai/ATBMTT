export type UserRole = 'voter' | 'admin'

export interface IUser{
    _id: string
    name: string
    email: string
    password: string
    role: UserRole
    electionId?: string | null
    hasVoted: boolean
}

export interface IUSerResponse {
    user: IUser
    success: boolean
    existed: IUser
    message: string
    
}

export interface UpdateUserRequest {
    userId: string,
    electionId: string | null
}

export interface ICandidate{
    _id: string
    name: string
    image: string //base64
    electionId: string
}

export interface ICandidateResponse{
    data: ICandidate[]
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

export interface IElectionResponse {
    data: IElection[]
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



export interface DeleteCandidateRequest {
    electionId: string,
    candidateId: string
}

export interface DeleteElectionRequest {
    electionId: string
}

export type tally = {
    candidateId: string
    encryptedSum: string 
    decryptedSum: number 
}
export interface IResult extends Document {
    _id: string
    electionId: string
    tallies: tally[]
    createdAt: Date
    updatedAt: Date
}