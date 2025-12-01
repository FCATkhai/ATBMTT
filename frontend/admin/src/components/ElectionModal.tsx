import React, { useEffect, useState, useRef } from "react"; // Thêm useRef
import { DeleteCandidateRequest, ElectionStatus, ICandidate, IElection, IElectionCreate, PublicKeyType } from "../types/election";
import AddCandidateModal from "./AddCandidateModal";
import CandidateList from "./CandidateList";
import apiSlice from "../store/apiSlice";
import { generatePaillierKey, decrypt } from "../utils/pailer";
import AddVoterModal from "./AddVoterModal";

interface ElectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  election: IElection | null;
  isCreateMode?: boolean; 
}

const ElectionModal: React.FC<ElectionModalProps> = ({ isOpen, onClose, election, isCreateMode }) => {

  // --- Refs ---
  // Ref để điều khiển input file ẩn
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State quản lý Modal con
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [isVoterModalOpen, setIsVoterModalOpen] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  
  // State dữ liệu Form
  const [calculatedStatus, setCalculatedStatus] = useState<ElectionStatus>('upcoming');
  const [publicKeyParams, setPublicKeyParams] = useState({ keyLength: 512 });
  const [candidateList, setCandidateList] = useState<ICandidate[]>([]);
  
  const [newElectionData, setNewElectionData] = useState<IElectionCreate>({
    name: '',
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    publicKey: { n: "", g: "", n2: "" },
    status: calculatedStatus
  });

  // --- API Hooks ---
  const [createElection] = apiSlice.endpoints.createElection.useMutation();
  const [updateElection, { isLoading: isUpdating }] = apiSlice.useUpdateElectionMutation();
  const [countElection, { isLoading: isCounting }] = apiSlice.useCountElectionMutation();
  const [updateDecryptedResults, { isLoading: isPublishing }] = apiSlice.useUpdateDecryptedResultsMutation();
  
  const [
    getCandidateByElectionId, 
    { data: fetchedCandidatesData, isLoading: isLoadingCandidates, isError: isErrorCandidates, isSuccess: isCandidatesSuccess }
  ] = apiSlice.endpoints.getCandidateByElectionId.useLazyQuery(); 
  
  const [
    getUsersByElectionId, 
    { data: fetchedUsersData }
  ] = apiSlice.endpoints.getUsersByElectionId.useLazyQuery(); 

  const [deleteCandidate, { isLoading: isDeletingCandidate }] = apiSlice.endpoints.deleteCandidate.useMutation();
  const [deleteUser] = apiSlice.useDeleteUserMutation();

  // --- Effects ---
  useEffect(() => {
    if (isOpen && !isCreateMode && election?._id) {
      getCandidateByElectionId(election._id);
      getUsersByElectionId(election._id);
    }
  }, [isOpen, isCreateMode, election?._id, getCandidateByElectionId, getUsersByElectionId]);

  useEffect(() => {
    if (isCandidatesSuccess && fetchedCandidatesData) {
      const candidates = fetchedCandidatesData.data || fetchedCandidatesData; 
      if (Array.isArray(candidates)) setCandidateList(candidates);
    }
  }, [isCandidatesSuccess, fetchedCandidatesData]);

  useEffect(() => {
    if (isCreateMode) {
      setCalculatedStatus(calculateStatus(newElectionData.startTime, newElectionData.endTime));
    }
  }, [newElectionData.startTime, newElectionData.endTime, isCreateMode]);

  // --- Helper Functions ---
  const calculateStatus = (start: Date, end: Date): ElectionStatus => {
    const now = new Date();
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'running';
    return 'finished';
  };

  const toLocalDatetimeString = (date: Date): string => {
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
  };

  // --- Handlers ---
  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'startTime' || name === 'endTime') {
      setNewElectionData(prev => ({ ...prev, [name]: new Date(value) }));
    } else {
      setNewElectionData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePublicKeyParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    try {
      const bigIntValue = BigInt(value || 0); 
      setPublicKeyParams(prev => ({ ...prev, [name]: bigIntValue }));
    } catch {
      setPublicKeyParams(prev => ({ ...prev, [name]: 0n }));
    }
  };

  const handleCreateSubmit = async () => {
    if (newElectionData.startTime >= newElectionData.endTime) {
      alert("Thời gian bắt đầu phải trước thời gian kết thúc.");
      return;
    }

    const { keyLength } = publicKeyParams;
    let generatedPublicKey: PublicKeyType;

    try {
      const { publicKey, privateKey } = await generatePaillierKey(keyLength);
      generatedPublicKey = publicKey;

      // Lưu file Private Key
      const jsonString = JSON.stringify(privateKey, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      const safeName = newElectionData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `private_key_${safeName}_${Date.now()}.json`;
      
      document.body.appendChild(link);
      link.click(); 
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Lỗi sinh khóa:", error);
      alert("Có lỗi xảy ra khi sinh khóa bảo mật.");
      return;
    }

    const finalData = {
      ...newElectionData,
      publicKey: generatedPublicKey,
      status: calculateStatus(newElectionData.startTime, newElectionData.endTime)
    };
    
    try {
      await createElection(finalData).unwrap();
      alert(`✅ Đã tạo cuộc bầu cử: ${finalData.name}.\n\n⚠️ QUAN TRỌNG: Một file chứa Private Key vừa được tải xuống máy của bạn. Hãy giữ nó an toàn để giải mã kết quả sau này!`);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi gọi API tạo bầu cử.");
    }
  };

  const handleAddCandidateClick = () => {
    if (isCreateMode) { alert("Vui lòng tạo cuộc bầu cử trước khi thêm ứng viên."); return; }
    if (election?.status === 'finished') { alert("Cuộc bầu cử đã kết thúc."); return; }
    setIsCandidateModalOpen(true);
  };

  const handleManageVoterClick = () => {
    if (isCreateMode) { alert("Vui lòng tạo cuộc bầu cử trước khi quản lý cử tri."); return; }
    if (election?.status === 'finished') { alert("Cuộc bầu cử đã kết thúc."); return; }
    setIsVoterModalOpen(true);
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (isDeletingCandidate) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa ứng viên này không?")) return;

    const deleteCandidateRequest: DeleteCandidateRequest = {
      candidateId,
      electionId: election?._id || "error"
    };
    try {
      await deleteCandidate(deleteCandidateRequest).unwrap();
      setCandidateList(prev => prev.filter(c => c._id !== candidateId));
      alert("Xóa ứng viên thành công.");
    } catch {
      alert("Lỗi khi xóa ứng viên.");
    }
  };

  const handleDeleteVoter = async (voterId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa cử tri này không?")) return;
    try {
      setIsDeletingUser(true)
      await deleteUser({ userId: voterId, electionId: null }).unwrap();
      alert("Xóa cử tri thành công.");
      setIsDeletingUser(false)
    } catch(error) {
      alert(error)
    }
  };

  // --- LOGIC TỔNG KẾT & CÔNG BỐ (ĐÃ SỬA ĐỔI) ---

  // 1. Hàm kích hoạt khi bấm nút: Chỉ hỏi xác nhận và mở hộp thoại file
  const handleSummarizeBtnClick = () => {
    if (!election?._id) return;
    
    if (!window.confirm("⚠️ XÁC NHẬN TỔNG KẾT & CÔNG BỐ?\n\nHành động này sẽ:\n1. Đóng cổng bình chọn (nếu đang chạy).\n2. Tổng hợp tất cả phiếu bầu.\n3. Giải mã và CÔNG KHAI kết quả lên hệ thống.\n\nBạn sẽ cần chọn file Private Key (.json) ở bước tiếp theo.")) {
      return;
    }
    
    // Kích hoạt input file ẩn
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset giá trị để chọn lại cùng 1 file vẫn kích hoạt onChange
      fileInputRef.current.click();
    }
  };

  // 2. Hàm xử lý khi File đã được chọn
  const handlePrivateKeyFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const privateKeyJson = JSON.parse(content);

        // Validate sơ bộ xem đúng format Key không
        if (!privateKeyJson.lambda || !privateKeyJson.mu || !privateKeyJson.publicKey) {
          throw new Error("File không đúng định dạng Private Key.");
        }

        // Gọi hàm thực thi logic chính với key vừa đọc được
        await executeSummarizeAndPublish(privateKeyJson);

      } catch (error) {
        console.error(error);
        alert("Lỗi đọc file Private Key: " + (error as Error).message);
      }
    };

    reader.readAsText(file);
  };

  // 3. Logic chính (Steps 1-4) đã tách riêng
const executeSummarizeAndPublish = async (privKeyJson: any) => {
    if (!election?._id) return;

    // --- HÀM TIỆN ÍCH: CHUYỂN ĐỔI BIGINT AN TOÀN ---
    const safeBigInt = (val: string | number): bigint => {
      if (!val) return 0n;
      const str = val.toString();
      // Nếu đã có 0x thì giữ nguyên
      if (str.startsWith("0x")) return BigInt(str);
      // Nếu chứa ký tự a-f (Hex) mà chưa có 0x -> Thêm 0x
      if (/[a-fA-F]/.test(str)) {
        return BigInt("0x" + str);
      }
      return BigInt(str);
    };

    try {
      // --- GIAI ĐOẠN 1: ĐÓNG CỔNG BẦU CỬ ---
      console.log("1️⃣ Đang cập nhật trạng thái kết thúc...");
      await updateElection({
        electionId: election._id,
        data: {
          status: 'finished',
          endTime: new Date() 
        }
      }).unwrap();

      // --- GIAI ĐOẠN 2: SERVER CỘNG DỒN PHIẾU MÃ HÓA ---
      console.log("2️⃣ Server đang tổng hợp phiếu bầu mã hóa...");
      const countResult = await countElection(election._id).unwrap();
      
      console.log("📊 Kết quả thô từ server:", countResult);

      if (!countResult.data || !countResult.data.tallies) {
        throw new Error("Không nhận được dữ liệu tổng hợp từ Server.");
      }

      // --- GIAI ĐOẠN 3: CLIENT GIẢI MÃ ---
      console.log("3️⃣ Client đang giải mã kết quả...");
      
      // A. Tái tạo Public Key (n, g, n^2)
      const nVal = safeBigInt(privKeyJson.publicKey.n);
      const publicKey = {
          n: nVal,
          g: safeBigInt(privKeyJson.publicKey.g), // Cần g cho đúng cấu trúc
          n2: nVal * nVal // Tính lại n^2 cho chắc chắn
      };

      // B. Tái tạo Private Key (lambda, mu)
      const privateKey = {
          lambda: safeBigInt(privKeyJson.lambda),
          mu: safeBigInt(privKeyJson.mu)
      };

      // C. Thực hiện giải mã từng ứng viên
      const decryptedTallies = countResult.data.tallies.map((tally: any) => {
        // Áp dụng safeBigInt cho chuỗi encryptedSum từ server trả về
        const encryptedSumBigInt = safeBigInt(tally.encryptedSum);
        
        // 🔥 GỌI HÀM DECRYPT VỚI 3 THAM SỐ (Public, Private, Cipher)
        const decryptedVal = decrypt(publicKey, privateKey, encryptedSumBigInt);
        
        return {
          candidateId: tally.candidateId,
          decryptedSum: Number(decryptedVal)
        };
      });

      console.log("✅ Kết quả giải mã:", decryptedTallies);

      // --- GIAI ĐOẠN 4: GỬI KẾT QUẢ THỰC VỀ SERVER ---
      console.log("4️⃣ Đang cập nhật kết quả lên hệ thống...");
      await updateDecryptedResults({
        electionId: election._id,
        tallies: decryptedTallies
      }).unwrap();

      alert("🎉 TỔNG KẾT THÀNH CÔNG!\nKết quả đã được công bố lên hệ thống.");
      onClose();

    } catch (error: any) {
      console.error("❌ Lỗi quy trình:", error);
      // Xử lý thông báo lỗi an toàn hơn
      const errMsg = error?.data?.message || error?.message || "Vui lòng kiểm tra console";
      alert(`Lỗi xảy ra: ${errMsg}`);
    }
  };

  const closeCandidateModal = () => setIsCandidateModalOpen(false);
  const closeVoterModal = () => setIsVoterModalOpen(false);

  if (!isOpen) return null;

  const title = isCreateMode ? "Tạo Cuộc Bầu Cử Mới" : (election?.name || "Chi Tiết Bầu Cử");
  const currentElectionId = election?._id || null;
  const isProcessing = isUpdating || isCounting || isPublishing;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start z-50 overflow-auto py-10">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-6xl">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl">&times;</button>
        </div>
        
        {/* Button Group */}
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={handleAddCandidateClick}
            className={`py-2 px-4 rounded-full text-white font-semibold shadow
            ${election?.status === 'finished'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.97] transition'
            }`}
          >
            Thêm Ứng viên
          </button>

          <button
            onClick={handleManageVoterClick}
            className={`py-2 px-4 rounded-full text-white font-semibold shadow
            ${election?.status === 'finished'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 active:scale-[0.97] transition'
            }`}
          >
            Quản lý Cử Tri
          </button>

          {/* NÚT TỔNG KẾT VÀ CÔNG BỐ KẾT QUẢ */}
          {!isCreateMode && (
            <>
                <button
                onClick={handleSummarizeBtnClick} // Gọi hàm kích hoạt file input
                disabled={isProcessing}
                className={`py-2 px-4 rounded-full text-white font-semibold shadow 
                bg-purple-600 hover:bg-purple-700 active:scale-[0.97] transition flex items-center gap-2
                ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
                >
                {isProcessing ? (
                    <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>Đang xử lý...</span>
                    </>
                ) : (
                    <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Tổng kết và công bố kết quả</span>
                    </>
                )}
                </button>
                
                {/* Input File Ẩn */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: "none" }} 
                    accept=".json" // Chỉ nhận file JSON
                    onChange={handlePrivateKeyFileChange}
                />
            </>
          )}
        </div>

        {/* Body */}
        {isCreateMode ? (
          <div>
            <h3 className="text-lg font-semibold mb-3">Form Tạo Mới</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-lg font-medium text-gray-700">Tên Cuộc Bầu Cử</label>
                <input type="text" name="name" value={newElectionData.name} onChange={handleCreateInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-lg"/>
              </div>
              <div>
                <label htmlFor="keyLength" className="block text-lg font-medium text-gray-700">Độ dài mô đun n</label>
                <input type="number" name="keyLength" min={4} max={16} value={publicKeyParams.keyLength.toString()} onChange={handlePublicKeyParamChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-lg"/>
              </div>
              <div>
                <label htmlFor="startTime" className="block text-lg font-medium text-gray-700">Thời gian bắt đầu</label>
                <input type="datetime-local" name="startTime" value={toLocalDatetimeString(newElectionData.startTime)} onChange={handleCreateInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-lg"/>
              </div>
              <div>
                <label htmlFor="endTime" className="block text-lg font-medium text-gray-700">Thời gian kết thúc</label>
                <input type="datetime-local" name="endTime" value={toLocalDatetimeString(newElectionData.endTime)} onChange={handleCreateInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-lg"/>
              </div>
              <button onClick={handleCreateSubmit} className="mt-4 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded text-lg">Tạo và Lưu</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT */}
            <div className="flex-1">
              <div className="mb-6 p-6 bg-white shadow-md rounded-xl border border-gray-200 text-lg">
                <h4 className="font-bold text-xl mb-3">Thông tin chung</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <p><span className="font-semibold">ID:</span> {election?._id}</p>
                  <p><span className="font-semibold">Bắt đầu:</span> {election?.startTime ? toLocalDatetimeString(new Date(election.startTime)) : ""}</p>
                  <p><span className="font-semibold">Kết thúc:</span> {election?.endTime ? toLocalDatetimeString(new Date(election.endTime)) : ""}</p>
                  <p><span className="font-semibold">Trạng thái:</span> 
                    <span className={`ml-2 font-bold px-2 py-1 rounded-full ${
                      election?.status === "upcoming" ? "bg-yellow-400 text-yellow-900" :
                      election?.status === "running" ? "bg-green-500 text-white" :
                      "bg-red-500 text-white"
                    }`}>{election?.status}</span>
                  </p>
                  <p><span className="font-semibold">Số ứng viên:</span> {candidateList.length}</p>
                </div>
              </div>

              <h4 className="text-xl font-semibold mb-3 text-gray-800">Danh Sách Ứng Viên</h4>
              {isLoadingCandidates ? <p className="text-center text-blue-500 py-4 text-lg">Đang tải...</p> :
               isErrorCandidates ? <p className="text-center text-red-500 py-4 text-lg">Lỗi tải ứng viên</p> :
               <CandidateList candidates={candidateList} electionId={currentElectionId} onCandidateSelect={() => {}} onDelete={handleDeleteCandidate} />}
            </div>

            {/* RIGHT */}
            <div className="w-full lg:w-1/3 bg-gray-50 p-4 rounded-lg shadow-inner overflow-auto max-h-[600px]">
              <h4 className="text-xl font-semibold mb-4">Danh sách Cử Tri</h4>
              <table className="w-full table-auto border border-gray-300 text-lg">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border px-2 py-1 text-left">#</th>
                    <th className="border px-2 py-1 text-left">Email</th>
                    <th className="border px-2 py-1 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {fetchedUsersData && fetchedUsersData.data.length > 0 ? (
                    fetchedUsersData.data.map((voter, idx) => (
                      <tr key={voter._id}>
                        <td className="border px-2 py-1">{idx + 1}</td>
                        <td className="border px-2 py-1 break-all">{voter.email}</td>
                        <td className="border px-2 py-1 text-center">
                          { !voter.hasVoted ? (
                            <button
                              onClick={() => handleDeleteVoter(voter._id)}
                              disabled={voter.hasVoted}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm shadow"
                            >
                              Xóa
                            </button>
                            ) : "Đã bầu"
                          }
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-2 text-gray-500">
                        Chưa có cử tri
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <AddCandidateModal isOpen={isCandidateModalOpen} onClose={closeCandidateModal} electionId={currentElectionId} />
        <AddVoterModal isOpen={isVoterModalOpen} onClose={closeVoterModal} electionId={currentElectionId} />
      </div>
    </div>
  );
};

export default ElectionModal;