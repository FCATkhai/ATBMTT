import React, { useState } from "react";
import { useParams } from "react-router-dom";
import apiSlice from "../store/apiSlice";
import CandidateList from "../components/CandidateList";
import { toLocalDatetimeString } from "../utils";
import { encrypt } from "../utils/pailer";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const ElectionDetailPage: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const { user } = useSelector((state: RootState) => state.auth);

  // --- API Calls ---
  const { data: candidateData, isLoading, isError } =
    apiSlice.endpoints.getCandidateByElectionId.useQuery(electionId!, { skip: !electionId });
  const { data: electionData, isLoading: isElectionLoading, isError: isElectionError } =
    apiSlice.endpoints.getElectionById.useQuery(electionId ?? "", { skip: !electionId });

  const [selectedCandidates, setSelectedCandidates] = useState<[string, boolean][]>([]);
  const [voteCandidate] = apiSlice.useVoteCandidateMutation();

  // --- Handlers ---
  const handleCandidateSelect = (id: string) => {
    setSelectedCandidates((prev) => {
      const index = prev.findIndex(([cid]) => cid === id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index][1] = !updated[index][1];
        return updated;
      } else {
        return [...prev, [id, true]];
      }
    });
  };

  const handleConfirmVote = async () => {
    if (!candidateData?.data || !electionData?.data) return;

    const encryptedResults = candidateData.data.map((candidate) => {
      const selectedEntry = selectedCandidates.find(([id]) => id === candidate._id);
      const selected = selectedEntry ? selectedEntry[1] : false;
      const voteValue = selected ? 1n : 0n;
      const cipher = encrypt(electionData.data.publicKey, voteValue);

      return {
        candidateId: candidate._id,
        cipher: "0x" + cipher.toString(16),
      };
    });

    if (!user) return;

    const result = await voteCandidate({
      electionId: electionData.data._id,
      voterId: user?._id,
      encryptedBallot: JSON.stringify(encryptedResults),
    });
    console.log(result)
    if (result.error?.data?.success === false) { // Type casting an toàn hơn chút
      alert("Bạn đã bầu chọn rồi");
      return
    }
    alert(result.data?.message)
  };

  // --- Loading / Error States ---
  if (isElectionLoading) return <div className="p-6 text-center text-gray-500">Đang tải thông tin bầu cử...</div>;
  if (isElectionError) return <div className="p-6 text-center text-red-500">Không thể tải thông tin bầu cử.</div>;
  if (isLoading) return <div className="p-6 text-center text-gray-500 text-lg">Đang tải danh sách ứng viên...</div>;
  if (isError) return <div className="p-6 text-center text-red-500 text-lg">Lỗi khi tải danh sách ứng viên.</div>;

  const candidates = candidateData?.data || [];

  return (
    // 1. Bỏ 'pb-32' ở đây, giữ layout clean
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-gray-50">
      
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Thông tin cuộc bầu cử
      </h1>

      {/* Thông tin chung Card */}
      <div className="mb-8 p-6 bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl border border-gray-200">
        <h4 className="font-bold text-xl text-gray-800 mb-4 border-b pb-2">
          Thông tin chung
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-gray-700">
          <p><span className="font-semibold text-gray-900">ID:</span> <span className="text-sm text-gray-500">{electionData?.data._id}</span></p>
          <p><span className="font-semibold text-gray-900">Tên:</span> {electionData?.data.name}</p>
          <p><span className="font-semibold text-gray-900">Bắt đầu:</span> {electionData?.data.startTime ? toLocalDatetimeString(new Date(electionData.data.startTime)) : ""}</p>
          <p><span className="font-semibold text-gray-900">Kết thúc:</span> {electionData?.data.endTime ? toLocalDatetimeString(new Date(electionData.data.endTime)) : ""}</p>
          <div className="col-span-1 md:col-span-2">
            <span className="font-semibold text-gray-900 mr-2">Trạng thái:</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                electionData?.data.status === "upcoming" ? "bg-yellow-100 text-yellow-800"
                  : electionData?.data.status === "running" ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {electionData?.data.status}
            </span>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Danh sách Ứng viên
      </h1>

      {/* Danh sách Candidates */}
      <CandidateList
        candidates={candidates}
        electionId={electionId || null}
        selectedCandidates={selectedCandidates}
        onCandidateSelect={handleCandidateSelect}
      />

      {/* 2. 🔥 SPACER DIV (QUAN TRỌNG)
          Thẻ này rỗng, chỉ có chiều cao. Nhiệm vụ của nó là đẩy nội dung trang dài ra thêm một khoảng
          bằng đúng (hoặc hơn) chiều cao của cái footer cố định.
          h-32 tương đương 128px, đủ để card cuối cùng hiển thị trọn vẹn trên nút.
      */}
      <div className="h-32 w-full"></div>

      {/* 3. FOOTER CỐ ĐỊNH 
          Ghim xuống đáy màn hình. Có z-index cao để nổi lên trên nội dung khi cuộn.
      */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)]">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
            {/* Text tổng kết bên trái (Hiển thị trên màn hình lớn hơn mobile) */}
            <div className="hidden sm:block text-gray-600 font-medium">
                Đã chọn: <span className="text-indigo-600 font-bold text-lg">{selectedCandidates.filter(([, isSelected]) => isSelected).length}</span> ứng viên
            </div>

            {/* Nút Action */}
            <button
                onClick={handleConfirmVote}
                disabled={selectedCandidates.filter(([, isSelected]) => isSelected).length === 0 || (user?.hasVoted)}
                className={`w-full sm:w-auto px-8 py-3 rounded-lg font-bold shadow-lg transition-all transform active:scale-95 ${
                    selectedCandidates.filter(([, isSelected]) => isSelected).length === 0 || (user?.hasVoted)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/30"
                }`}
            >
                {user?.hasVoted ? "Bạn đã bình chọn rồi" : "Xác nhận bình chọn"}
            </button>
        </div>
      </div>

    </div>
  );
};

export default ElectionDetailPage;