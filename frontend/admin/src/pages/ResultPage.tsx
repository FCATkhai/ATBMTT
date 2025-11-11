import { useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import apiSlice from "../store/apiSlice";

const ElectionResultsPage = () => {
  const { electionId } = useParams();

  // --- Gọi API ---
  const {
    data: resultData,
    isLoading: resultLoading,
    refetch: refetchResult,
  } = apiSlice.endpoints.getElectionResults.useQuery(electionId!, { skip: !electionId });

  const {
    data: candidateData,
    isLoading: candidateLoading,
  } = apiSlice.endpoints.getCandidateByElectionId.useQuery(electionId!, { skip: !electionId });

  const tallies = resultData?.data?.tallies || [];
  const candidates = candidateData?.data || [];

  // Map candidateId -> name
  const enrichedData = useMemo(() => {
    return tallies.map((tally: any) => {
      const candidate = candidates.find((c: any) => c._id === tally.candidateId);
      return {
        candidateName: candidate ? candidate.name : `Ứng viên ${tally.candidateId.slice(-4)}`,
        decryptedSum: tally.decryptedSum,
        encryptedSum: tally.encryptedSum,
      };
    });
  }, [tallies, candidates]);

  useEffect(() => {
    if (resultData) console.log("✅ Kết quả kiểm phiếu:", resultData);
    if (candidateData) console.log("👤 Danh sách ứng viên:", candidateData);
  }, [resultData, candidateData]);

  if (resultLoading || candidateLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Đang tải kết quả bầu cử...
      </div>
    );
  }

  if (!resultData?.data || !candidateData?.data) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Không tìm thấy kết quả cho cuộc bầu cử này.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <main className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🗳️ Kết quả bầu cử
        </h1>

        {/* --- Biểu đồ kết quả --- */}
        {enrichedData.length > 0 ? (
          <>
            <div className="w-full h-80 mb-10">
              <ResponsiveContainer>
                <BarChart data={enrichedData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="candidateName" angle={-15} textAnchor="end" interval={0} height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => `${value} phiếu`} />
                  <Bar dataKey="decryptedSum" fill="#3b82f6" name="Số phiếu" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* --- Danh sách chi tiết --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrichedData.map((item) => (
                <div
                  key={item.candidateName}
                  className="border border-gray-200 rounded-lg shadow-sm p-6 bg-gray-50 hover:shadow-md transition"
                >
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    {item.candidateName}
                  </h2>
                  <p className="text-gray-600 text-sm break-words mb-3">
                    <strong>Mã hoá:</strong> <span className="text-xs">{item.encryptedSum.slice(0, 30)}...</span>
                  </p>
                  <p className="text-lg">
                    <strong>Kết quả:</strong>{" "}
                    {item.decryptedSum !== 0 ? (
                      <span className="text-green-600 font-bold">
                        {item.decryptedSum} phiếu
                      </span>
                    ) : (
                      <span className="text-yellow-600 italic">Chờ giải mã...</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-500 italic text-center py-10 text-lg">
            Chưa có kết quả kiểm phiếu.
          </p>
        )}

        {/* --- Nút làm mới --- */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => refetchResult()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            🔄 Làm mới kết quả
          </button>
        </div>
      </main>
    </div>
  );
};

export default ElectionResultsPage;
