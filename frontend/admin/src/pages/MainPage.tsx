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
      <div className="min-h-screen bg-gray-100 px-4 py-4">
        <main className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">
              Danh sách cuộc bầu cử
            </h1>

            <button
              onClick={handleCreateClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium 
                        py-2 px-4 rounded-md shadow-sm transition active:scale-95"
            >
              + Tạo cuộc bầu cử
            </button>
          </div>

          {/* Grid Elections */}
          {fetchedElections && fetchedElections.data.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {fetchedElections.data.map((election) => (
                <ElectionCard
                  key={election._id}
                  election={election}
                  onClick={() => handleCardClick(election)}
                  refetch={refetch}
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic text-center py-12 text-base">
              Chưa có cuộc bầu cử nào.
            </div>
          )}

          {/* Modal */}
          {isModalOpen && (isCreateMode || selectedElection) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center 
                            bg-black/40 backdrop-blur-sm">
              <ElectionModal
                isOpen={isModalOpen}
                onClose={closeModal}
                election={selectedElection}
                isCreateMode={isCreateMode}
              />
            </div>
          )}

          {(isLoading || isError) && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-40">
              {isLoading && <p className="text-gray-500 text-lg">Đang tải...</p>}
              {isError && <p className="text-red-500 text-lg">Lỗi tải dữ liệu</p>}
            </div>
          )}
        </main>
      </div>
    );
  };

  export default MainPage;
