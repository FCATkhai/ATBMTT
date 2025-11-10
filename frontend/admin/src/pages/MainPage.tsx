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
    <div className="min-h-screen bg-gray-100 p-6">
      <main className="max-w-7xl mx-auto">
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Danh sách các cuộc bầu cử
          </h1>
          <button
            onClick={handleCreateClick}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            + Tạo cuộc bầu cử
          </button>
        </div>

        {/* --- Grid danh sách bầu cử --- */}
        {fetchedElections && fetchedElections.data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fetchedElections.data.map((election) => (
              <ElectionCard
                key={election._id}
                election={election}
                onClick={() => handleCardClick(election)}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic text-center py-20 text-lg">
            Chưa có cuộc bầu cử nào. Hãy tạo mới để bắt đầu.
          </div>
        )}

        {/* --- Modal tạo / chỉnh sửa --- */}
        {isModalOpen && (isCreateMode || selectedElection) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <ElectionModal
              isOpen={isModalOpen}
              onClose={closeModal}
              election={selectedElection}
              isCreateMode={isCreateMode}
            />
          </div>
        )}

        {/* --- Loading / Error --- */}
        {(isLoading || isError) && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-50/70 z-40">
            {isLoading && <p className="text-gray-500 text-xl">Đang tải danh sách cuộc bầu cử...</p>}
            {isError && <p className="text-red-500 text-xl">Lỗi khi tải dữ liệu. Vui lòng thử lại.</p>}
          </div>
        )}
      </main>
    </div>
  );
};

export default MainPage;
