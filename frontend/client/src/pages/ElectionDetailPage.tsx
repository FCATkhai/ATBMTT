import React, { useState } from "react";
import { useParams } from "react-router-dom";
import apiSlice from "../store/apiSlice";
import CandidateList from "../components/CandidateList";
import { ICandidate } from "../types/election";
import { toLocalDatetimeString } from "../utils";
import { encrypt } from "../utils/pailer";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const ElectionDetailPage: React.FC = () => {
  // 🔹 Lấy electionId từ URL
  const { electionId } = useParams<{ electionId: string }>();


  // 🔹 Gọi API lấy danh sách ứng viên
  const { data: candidateData, isLoading, isError } =
    apiSlice.endpoints.getCandidateByElectionId.useQuery(electionId!, {
      skip: !electionId,
    });
  const { data: electionData, isLoading: isElectionLoading, isError: isElectionError} =
    apiSlice.endpoints.getElectionById.useQuery(electionId ?? "", {
      skip: !electionId,
    });

  const [selectedCandidates, setSelectedCandidates] = useState<[string, boolean][]>([]);
  const [voteCandidate] = apiSlice.useVoteCandidateMutation()
  const { user } = useSelector((state: RootState) => state.auth)

  // 🔹 Toggle chọn / bỏ chọn ứng viên
  const handleCandidateSelect = (id: string) => {
    setSelectedCandidates((prev) => {
      const index = prev.findIndex(([cid]) => cid === id);
      if (index !== -1) {
        // Đảo trạng thái boolean nếu đã tồn tại
        const updated = [...prev];
        updated[index][1] = !updated[index][1];
        return updated;
      } else {
        // Thêm mới nếu chưa có
        return [...prev, [id, true]];
      }
    });
  };

  const handleConfirmVote = async () => {
    if (!candidateData?.data || !electionData?.data) return;

    const encryptedResults = candidateData.data.map((candidate) => {
      // Tìm trạng thái chọn trong danh sách selectedCandidates
      const selectedEntry = selectedCandidates.find(([id]) => id === candidate._id);
      const selected = selectedEntry ? selectedEntry[1] : false;

      // Mã hóa giá trị 1 nếu chọn, 0 nếu không
      const voteValue = selected ? 1n : 0n;
      const cipher = encrypt(electionData.data.publicKey, voteValue);

      return {
        candidateId: candidate._id,
        cipher: "0x" + cipher.toString(16),
      };
    });
    if (!user) return;

    const result = await voteCandidate({electionId: electionData.data._id, voterId: user?._id,encryptedVotes: JSON.stringify(encryptedResults)}) 
    console.log("🗳️ Encrypted results:", encryptedResults);
    console.log(result)
  };

  if (isElectionLoading) {
    return <div className="p-6 text-center text-gray-500">Đang tải thông tin bầu cử...</div>;
  }

  if (isElectionError) {
    return <div className="p-6 text-center text-red-500">Không thể tải thông tin bầu cử.</div>;
  }

  // 🔹 Xử lý trạng thái tải
  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500 text-lg">
        Đang tải danh sách ứng viên...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500 text-lg">
        Lỗi khi tải danh sách ứng viên.
      </div>
    );
  }

  const candidates = candidateData?.data || [];

  
  console.log("📦 Candidate data:", candidateData);
  console.log(electionData)

  return (
    <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Thông tin cuộc bầu cử</h1>
        <div className="flex-1">
            <div className="mb-6 p-6 bg-white shadow-md rounded-xl border border-gray-200 text-lg">
            <h4 className="font-bold text-xl mb-3">Thông tin chung</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p><span className="font-semibold">ID:</span> {electionData?.data._id}</p>
                <p><span className="font-semibold">Tên:</span> {electionData?.data.name}</p>
                <p><span className="font-semibold">Bắt đầu:</span> {electionData?.data.startTime ? toLocalDatetimeString(new Date(electionData.data.startTime)) : ""}</p>
                <p><span className="font-semibold">Kết thúc:</span> {electionData?.data.endTime ? toLocalDatetimeString(new Date(electionData.data.endTime)) : ""}</p>
                <p><span className="font-semibold">Trạng thái:</span> 
                <span className={`ml-2 font-bold px-2 py-1 rounded-full ${
                    electionData?.data.status === "upcoming" ? "bg-yellow-400 text-yellow-900" :
                    electionData?.data.status === "running" ? "bg-green-500 text-white" :
                    "bg-red-500 text-white"
                }`}>{electionData?.data.status}</span>
                </p>
            </div>
            </div>   
        </div>     
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Danh sách Ứng viên
        </h1>

      <CandidateList
        candidates={candidates}
        electionId={electionId || null}
        selectedCandidates={selectedCandidates}
        onCandidateSelect={handleCandidateSelect}
      />

      {/* Nút xác nhận chọn */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleConfirmVote}
          disabled={selectedCandidates.length === 0}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            selectedCandidates.length === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          Xác nhận bình chọn ({selectedCandidates.length})
        </button>
      </div>
    </div>
  );
};

export default ElectionDetailPage;
