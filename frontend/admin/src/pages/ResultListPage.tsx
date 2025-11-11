import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ElectionCard from "../components/ElectionCard";
import { IElection } from "../types/election";
import apiSlice from "../store/apiSlice";

const ResultListPage = () => {
  const navigate = useNavigate();

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

  // --- Khi click vào 1 card ---
  const handleCardClick = (election: IElection) => {
    navigate(`/results/${election._id}`); // 👉 điều hướng đến trang kết quả
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
            Kết quả các cuộc bầu cử
          </h1>
          <button
            onClick={() => refetch()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            🔄 Làm mới danh sách
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
            Chưa có cuộc bầu cử nào được tổ chức.
          </div>
        )}
      </main>
    </div>
  );
};

export default ResultListPage;
