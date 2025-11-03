### 🔁 Luồng hoạt động chi tiết

### 🧱 Giai đoạn 1: Khởi tạo election (Admin)

1. **Admin** tạo election:
    - `Election.create({ name, startTime, endTime })`
2. **Admin** thêm ứng cử viên:
    - `Candidate.create({ fullName, image, electionId })`
3. **Admin** thêm cử tri:
    - Import danh sách → tạo `User` (role = voter, hashed password)
4. Sinh **publicKey/privateKey** Paillier, lưu:
    - `publicKey` vào `Election`
    - `privateKey` chỉ lưu cục bộ (không trong DB hoặc mã hóa riêng)

📦 `Election` có thể có thêm:

```tsx
publicKey: { n: String, g: String }
```

---

### 🗳️ Giai đoạn 2: Voter bỏ phiếu

1. Voter đăng nhập → nhận danh sách `Candidate` và `publicKey`.
2. Ở frontend:
    - Tạo vector phiếu (ví dụ `[1,0,1,0]`).
    - Dùng Paillier để mã hóa từng phần tử.
    - Hash `voteToken = SHA256(voterId + electionId + secretSalt)`.
3. Gửi đến API `POST /api/ballots/`.

📦 Lưu vào MongoDB:

```tsx
await Ballot.create({
  electionId,
  voteToken, // hash của voterId
  encryptedBallot: JSON.stringify(encryptedVotes),
});
```

enryptedBallot có dạng đã được JSON.stringify() như sau:
```[
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
```
cipher là ciphertext của giá trị 0 hoặc 1 tùy theo việc ứng cử viên đó có được bầu hay không

✅ Kiểm tra “bỏ phiếu 1 lần”:

```tsx
const exists = await Ballot.findOne({ voteToken });
if (exists) throw new Error('Voter already voted');
```

---

### 📊 Giai đoạn 3: Kiểm phiếu (Homomorphic Aggregation)

1. Khi bầu cử kết thúc, admin chạy “Kiểm phiếu tự động”.
2. Server lấy **tất cả phiếu** theo `electionId`:
    
    ```tsx
    const ballots = await Ballot.find({ electionId });
    ```
    
3. Mỗi `Ballot` có `encryptedBallot` là JSON mảng ciphertext (BigInt dạng chuỗi).
4. Server nhân tất cả ciphertext lại theo vị trí:

    ```tsx
    const encryptedTotals = ballots.reduce((acc, ballot) => {
      const votes = JSON.parse(ballot.encryptedBallot).map(BigInt);
      if (acc.length === 0) return votes;
      return acc.map((v, i) => (v * votes[i]) % publicKey.n2);
    }, []);
    ```
    * thực tế thì việc giải mã thực hiện ở frontend, sau đó kết quả sẽ được post lại lên backend
5. Dùng `privateKey` (chỉ có ElectionCommittee) để **giải mã tổng**:
    
    ```tsx
    const decryptedCounts = encryptedTotals.map(c => privateKey.decrypt(c));
    ```
    * thực tế
6. Lưu kết quả vào `Result`:
    
    ```tsx
    const candidates = await Candidate.find({ electionId });
    const tallies = candidates.map((c, i) => ({
      candidateId: c._id,
      encryptedSum: encryptedTotals[i].toString(),
      decryptedCount: Number(decryptedCounts[i]),
    }));
    
    await Result.create({ electionId, tallies });
    ```
    

---

### 📢 Giai đoạn 4: Công bố kết quả

- Admin có thể gọi `/api/results/:electionId` để:
    - Truy xuất `Result`.
    - Xuất file Excel/PDF thống kê.
    - (Tuỳ chọn) Tính `proof = SHA256(JSON.stringify(tallies))` để xác minh.