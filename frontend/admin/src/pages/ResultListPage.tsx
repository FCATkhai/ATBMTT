import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import hook điều hướng
import ElectionCard from "../components/ElectionCard";
import { IElection } from "../types/election";
import apiSlice from "../store/apiSlice";

const ResultListPage = () => {
  const navigate = useNavigate(); // 2. Khởi tạo navigate

  // --- Gọi API để lấy danh sách cuộc bầu cử ---
  const {
    data: fetchedElections,
    isLoading,
    isError,
    refetch,
  } = apiSlice.endpoints.getElections.useQuery();

  // 3. Lọc chỉ lấy các cuộc bầu cử đã KẾT THÚC (finished)
  const finishedElections = useMemo(() => {
    if (!fetchedElections?.data) return [];
    return fetchedElections.data.filter((e) => e.status === "finished");
  }, [fetchedElections]);

  useEffect(() => {
    if (fetchedElections) {
      console.log("✅ All Elections:", fetchedElections);
      console.log("✅ Finished Elections:", finishedElections);
    }
  }, [fetchedElections, finishedElections]);

  // 4. Xử lý khi click vào card: Chuyển đến trang chi tiết kết quả
  const handleCardClick = (election: IElection) => {
    // Giả sử route chi tiết là /results/:id
    navigate(`/results/${election._id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Đang tải danh sách kết quả...
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
            Kết quả các cuộc bầu cử đã kết thúc
          </h1>

          {/* Nút Refresh danh sách */}
          <button
            onClick={refetch}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition active:scale-95"
          >
            🔄 Làm mới
          </button>
        </div>

        {/* Grid Elections */}
        {finishedElections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {finishedElections.map((election) => (
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
            Chưa có cuộc bầu cử nào đã kết thúc.
          </div>
        )}

        {/* Loading Overlay (Dùng khi refetch background) */}
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

export default ResultListPage;