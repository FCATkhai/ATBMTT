import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiSlice from "../store/apiSlice";

const ResultDetailPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();

  // ... (Giữ nguyên phần logic hooks: electionData, candidateData, triggerGetResults) ...
  const { data: electionData } = apiSlice.endpoints.getElectionResults.useQuery(electionId!, { skip: !electionId });
  const { data: candidateData } = apiSlice.endpoints.getCandidateByElectionId.useQuery(electionId!, { skip: !electionId });
  const [triggerGetResults, { data: resultData, isLoading, isError }] = apiSlice.endpoints.getElectionResults.useLazyQuery();

  useEffect(() => {
    if (electionId) triggerGetResults(electionId);
  }, [electionId, triggerGetResults]);

  const stats = useMemo(() => {
    if (!candidateData?.data || !resultData?.data?.tallies) return [];
    const tallies = resultData.data.tallies;
    const totalVotes = tallies.reduce((sum: number, t: any) => sum + (t.decryptedSum || 0), 0);

    const merged = candidateData.data.map((candidate) => {
      const tally = tallies.find((t: any) => t.candidateId === candidate._id);
      const votes = tally ? (tally.decryptedSum || 0) : 0;
      const percentage = totalVotes === 0 ? 0 : ((votes / totalVotes) * 100).toFixed(1);
      return { ...candidate, votes, percentage: Number(percentage) };
    });
    return merged.sort((a, b) => b.votes - a.votes);
  }, [candidateData, resultData]);

  const totalVotes = stats.reduce((sum, item) => sum + item.votes, 0);
  const winner = stats.length > 0 && totalVotes > 0 ? stats[0] : null;

  const handleRefresh = () => { if (electionId) triggerGetResults(electionId); };

  if (isLoading) return <div className="flex h-screen justify-center items-center text-gray-400 font-medium">Đang tải kết quả...</div>;
  if (isError) return <div className="flex h-screen flex-col justify-center items-center text-red-500 gap-4"><p>Không thể tải dữ liệu.</p><button onClick={() => navigate(-1)} className="text-blue-600 underline">Quay lại</button></div>;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10 font-sans text-gray-800">
      <main className="max-w-3xl mx-auto">
        
        {/* Header Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Quay lại
          </button>
          <button onClick={handleRefresh} className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
            Cập nhật
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Header Section */}
          <div className="px-8 py-8 border-b border-gray-300 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ID: {electionData?.data?._id || "Kết quả Bầu cử"}</h1>
            <p className="text-gray-500 text-sm">Tổng số phiếu hợp lệ: <span className="font-semibold text-gray-900">{totalVotes}</span></p>
            
            {/* Winner Banner - Tinh tế hơn */}
            {winner && (
              <div className="mt-6 inline-flex items-center bg-green-50 border border-green-100 px-4 py-2 rounded-full">
                <span className="text-lg mr-2">🎉</span>
                <span className="text-sm font-medium text-green-800">
                  Người dẫn đầu: <span className="font-bold">{winner.name}</span>
                </span>
              </div>
            )}
          </div>

          {/* Results List */}
          <div className="px-8 py-6 space-y-8">
            {stats.length > 0 ? (
              stats.map((item, index) => {
                const isWinner = index === 0 && totalVotes > 0;
                return (
                  <div key={item._id} className="relative group">
                    <div className="flex items-center gap-5 mb-3">
                      
                      {/* Rank Number */}
                      <div className={`w-6 text-center font-bold text-sm ${isWinner ? 'text-yellow-500' : 'text-gray-400'}`}>
                        #{index + 1}
                      </div>

                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-14 h-14 rounded-full overflow-hidden border-2 ${isWinner ? 'border-yellow-400' : 'border-gray-100'}`}>
                          <img
                            src={item.image ? `data:image/jpeg;base64,${item.image}` : "https://via.placeholder.com/150?text=No+Image"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "https://via.placeholder.com/150?text=" + item.name.charAt(0);
                            }}
                          />
                        </div>
                        {isWinner && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                            1st
                          </div>
                        )}
                      </div>

                      {/* Info & Stats */}
                      <div className="flex-1">
                        <div className="flex justify-between items-end mb-1">
                          <h3 className={`font-bold text-lg leading-none ${isWinner ? 'text-gray-900' : 'text-gray-700'}`}>
                            {item.name}
                          </h3>
                          <div className="text-right">
                            <span className="block font-bold text-gray-900">{item.votes}</span>
                            <span className="text-xs text-gray-400 font-medium">phiếu</span>
                          </div>
                        </div>

                        {/* Progress Bar - Minimalist */}
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                isWinner ? 'bg-blue-600' : 'bg-gray-400'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        
                        <div className="mt-1 text-right">
                           <span className="text-xs font-medium text-gray-500">{item.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm">
                Chưa có dữ liệu hiển thị.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultDetailPage;