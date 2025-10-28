import { Schema, model } from 'mongoose'
import crypto from 'crypto'
import type { IBallot } from '~/@types/dbInterfaces'
import dotenv from 'dotenv'
dotenv.config()

// Secret salt dùng để tạo token an toàn
const SECRET_SALT = process.env.VOTE_TOKEN_SALT

const BallotSchema = new Schema<IBallot>(
    {
        /* Collection phiếu bầu */
        voteToken: { type: String, required: true, unique: true },
        electionId: { type: Schema.Types.ObjectId, ref: 'Election', required: true },
        encryptedBallot: { type: String, required: true } // ciphertext (Paillier)
    },
    { timestamps: true }
)

/*ecryptedBallot có dạng đã được JSON.stringify() như sau:
[
  {
    "candidateId": "672a91f3c2b4d3fbc65e1234",
    "cipher": "0x3baf12c4e08f91abcf47d..."
  },
  {
    "candidateId": "672a91f3c2b4d3fbc65e1235",
    "cipher": "0x82ff02a1dd94b21f3329c..."
  },
  {
    "candidateId": "672a91f3c2b4d3fbc65e1236",
    "cipher": "0x19c5ff28a2cc13a4..."
  }
]
cipher là ciphertext của giá trị 0 hoặc 1 tùy theo việc ứng cử viên đó có được bầu hay không
*/

/**
 * So sánh token bỏ phiếu (phát hiện bỏ phiếu trùng)
 * Dùng cùng công thức SHA256(voterId + electionId + secretSalt)
 */
BallotSchema.methods.compareVoteToken = function (voterId: string, electionId: string): boolean {
    const computed = crypto
        .createHash('sha256')
        .update(voterId + electionId + SECRET_SALT)
        .digest('hex')
    return this.voteToken === computed
}

const BallotModel = model<IBallot>('Ballot', BallotSchema)
export default BallotModel
