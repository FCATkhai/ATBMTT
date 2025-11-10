import { useEffect, useState } from "react";
import ElectionCard from "../components/ElectionCard";
import ElectionModal from "../components/ElectionModal";
import { IElection } from "../types/election";
import apiSlice from "../store/apiSlice";

const MainPage = () => {
  const [selectedElection, setSelectedElection] = useState<IElection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  // --- Gọi API để lấy danh sách cuộc bầu cử ---
  const {
    data: fetchedElections,
    isLoading,
    isError,
    refetch,
  } = apiSlice.endpoints.getElections.useQuery();

  useEffect(() => {
  if (fetchedElections) {
    console.log("✅ fetchedElections:", fetchedElections);
  }
  }, [fetchedElections]);

  const handleCardClick = (election: IElection) => {
    setSelectedElection(election);
    setIsCreateMode(false);
    setTimeout(() => setIsModalOpen(true), 0);
  };
  // --- Khi click vào nút "Tạo cuộc bầu cử" ---
  const handleCreateClick = () => {
    setSelectedElection(null);
    setIsCreateMode(true);
    setIsModalOpen(true);
  };

  // --- Đóng modal ---
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedElection(null);
    setIsCreateMode(false);
    refetch(); // Cập nhật lại danh sách sau khi thêm/sửa
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Đang tải danh sách cuộc bầu cử...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Lỗi khi tải dữ liệu. Vui lòng thử lại.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <main className="max-w-6xl mx-auto">
        {/* --- Header --- */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Danh sách các cuộc bầu cử
          </h1>
          <button
            onClick={handleCreateClick}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            + Tạo cuộc bầu cử
          </button>
        </div>

        {/* --- Grid danh sách bầu cử --- */}
        {fetchedElections && fetchedElections.data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fetchedElections.data.map((election) => (
              <ElectionCard
                key={election._id}
                election={election}
                onClick={() => handleCardClick(election)}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">
            Chưa có cuộc bầu cử nào. Hãy tạo mới để bắt đầu.
          </div>
        )}

        {/* --- Modal tạo / chỉnh sửa --- */}
        {isModalOpen && (isCreateMode || selectedElection) && (
          <ElectionModal
            isOpen={isModalOpen}
            onClose={closeModal}
            election={selectedElection}
            isCreateMode={isCreateMode}
          />
        )}
      </main>
    </div>
  );
};

export default MainPage;
