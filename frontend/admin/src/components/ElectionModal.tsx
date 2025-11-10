import { useEffect, useState } from "react";
import React from "react"; 
import { ElectionStatus, ICandidate, IElection, IElectionCreate, PublicKeyType } from "../types/election";
import AddCandidateModal from "./AddCandidateModal";
import CandidateList from "./CandidateList";
import apiSlice from "../store/apiSlice";
import { generatePaillierKey } from "../utils/pailer";

interface ElectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  election: IElection | null;
  isCreateMode?: boolean; 
}

const ElectionModal: React.FC<ElectionModalProps> = ({ isOpen, onClose, election, isCreateMode }) => {
    
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [calculatedStatus, setCalculatedStatus] = useState<ElectionStatus>('upcoming');
  const [createElection] = apiSlice.endpoints.createElection.useMutation()
  // STATE ĐÃ SỬA: Chỉ cần một tham số keyLength (BigInt)
  const [publicKeyParams, setPublicKeyParams] = useState({
      keyLength: 10n, // Độ dài mong muốn của mô đun n (Ví dụ 10 chữ số)
  });
  
  const [newElectionData, setNewElectionData] = useState<IElectionCreate>({
    name: '',
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    publicKey: {n: "", g: "", n2: ""}, // Đã sửa lại theo PublicKeyType đầy đủ của Paillier
    status: calculatedStatus
  });
    const [candidateList, setCandidateList] = useState<ICandidate[]>([]);

    const [
        getCandidateByElectionId, 
        { data: fetchedCandidatesData, isLoading: isLoadingCandidates, isError: isErrorCandidates,isSuccess: isCandidatesSuccess }
    ] = apiSlice.endpoints.getCandidateByElectionId.useLazyQuery(); 

    useEffect(() => {
        if (isOpen && !isCreateMode && election?._id) {
            getCandidateByElectionId(election._id); 
        }
    }, [isOpen, isCreateMode, election?._id, getCandidateByElectionId]); 

    useEffect(() => {
        if (isCandidatesSuccess && fetchedCandidatesData) {
            const candidates = fetchedCandidatesData.data || fetchedCandidatesData; 
            if (Array.isArray(candidates)) {
                setCandidateList(candidates);
            }
            console.log(candidates)
        }
    }, [isCandidatesSuccess, fetchedCandidatesData]);


  useEffect(() => {
    if (isCreateMode) {
        setCalculatedStatus(calculateStatus(newElectionData.startTime, newElectionData.endTime));
    }
  }, [newElectionData.startTime, newElectionData.endTime, isCreateMode]);
  
  const title = isCreateMode ? "Tạo Cuộc Bầu Cử Mới" : (election?.name || "Chi Tiết Bầu Cử");

  if (!isOpen) return null;

  const currentElectionId = election?._id || null;
  const currentStatus = election?.status;

  const toLocalDatetimeString = (date: Date): string => {
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  // Loại bỏ hàm generatePublicKey thủ công
  
  const calculateStatus = (start: Date, end: Date): ElectionStatus => {
    const now = new Date();
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'running';
    return 'finished';
  };

  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startTime' || name === 'endTime') {
      setNewElectionData(prev => ({
        ...prev,
        [name]: new Date(value),
      }));
    } else {
      setNewElectionData(prev => ({ ...prev, [name]: value }));
    }
  };   

  // Hàm xử lý input cho độ dài khóa (chuyển sang BigInt)
  const handlePublicKeyParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      try {
            const bigIntValue = BigInt(value || 0); 
            setPublicKeyParams(prev => ({ 
                ...prev, 
                [name]: bigIntValue 
            }));
        } catch (e) {
            console.error("Invalid BigInt input", e);
             setPublicKeyParams(prev => ({ 
                ...prev, 
                [name]: 0n // Đặt về 0n nếu có lỗi
            }));
        }
  };

  const handleCreateSubmit = async () => {
      if (newElectionData.startTime >= newElectionData.endTime) {
          alert("Thời gian bắt đầu phải trước thời gian kết thúc.");
          return;
      }
      
      // GỌI HÀM generatePaillierKey
      const { keyLength } = publicKeyParams;
      let publicKey: PublicKeyType;
      
      try {
          // GỌI HÀM PAIlLIER HOÀN CHỈNH
          publicKey = await generatePaillierKey(keyLength); 

      } catch (error) {
          console.error(error);
          return;
      }
      

      const finalData = {
          ...newElectionData,
          publicKey: publicKey, // Gắn Public Key Paillier đã tạo
          status: calculateStatus(newElectionData.startTime, newElectionData.endTime)
      };
      
      console.log("Dữ liệu Cuộc Bầu Cử Mới (FINAL):", finalData);
      console.log(`Khóa n (len ${keyLength}): ${publicKey.n.substring(0, 5)}...`);
      const result = createElection(finalData)
      if (!result) {
        alert('Lỗi khi tạo cuộc bầu cử')
        return 
      }
      alert(`Đã chuẩn bị tạo cuộc bầu cử: ${finalData.name} (Status: ${finalData.status}).`);
      onClose();
  };

  const handleAddCandidateClick = () => {
      if (isCreateMode) {
          alert("Vui lòng tạo cuộc bầu cử trước khi thêm ứng viên.");
          return;
      }

      if (currentStatus === 'finished') {
          alert("Cuộc bầu cử này đã kết thúc, không thể thêm ứng viên.");
          return;
      }

      setIsCandidateModalOpen(true);
  };

  const handleCandidateSelect = () => { /* Logic xử lý chọn ứng viên */ }

  const closeCandidateModal = () => {
      setIsCandidateModalOpen(false);
  };

  return (
  <div 
    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50"
  >
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
      <div className="flex justify-between items-center border-b pb-3 mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          &times;
        </button>
      </div>

      {isCreateMode ? (
        <div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800 text-sm">
            Vui lòng tạo cuộc bầu cử trước khi thêm ứng viên.
          </p>
        </div>
      ) : (
        <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg flex justify-between items-center">
          <p className="text-blue-700 font-semibold">
              Quản lý Ứng viên (Trạng thái: {currentStatus})
          </p>
          <button
            onClick={handleAddCandidateClick}
            className={`
              bg-blue-600 text-white font-semibold py-1 px-3 rounded-full transition duration-150 text-sm shadow-md
              ${currentStatus === 'finished' ? 'opacity-50 cursor-not-allowed bg-gray-500' : 'hover:bg-blue-700'}
            `}
            disabled={currentStatus === 'finished'}
          >
            Thêm Ứng viên
          </button>
        </div>
        )}
        
        {isCreateMode ? (
            <div>
              <h3 className="text-lg font-semibold mb-3">Form Tạo Mới</h3>
              <div className="space-y-4">
        
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên Cuộc Bầu Cử</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={newElectionData.name}
                      onChange={handleCreateInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                    
                    {/* INPUT ĐÃ SỬA: Chỉ còn một ô cho keyLength */}
                    <div className="grid grid-cols-1 gap-4"> 
                        <div>
                            <label htmlFor="keyLength" className="block text-sm font-medium text-gray-700">Độ dài mô đun n (chữ số)</label>
                            <input
                                type="number"
                                name="keyLength"
                                id="keyLength"
                                required
                                min="4"
                                max="16"
                                value={publicKeyParams.keyLength.toString()}
                                onChange={handlePublicKeyParamChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>

                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Thời gian Bắt đầu (Start Time)</label>
                    <input
                      type="datetime-local"
                      name="startTime"
                      id="startTime"
                      required
                      value={toLocalDatetimeString(newElectionData.startTime)}
                      onChange={handleCreateInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Thời gian Kết thúc (End Time)</label>
                    <input
                      type="datetime-local"
                      name="endTime"
                      id="endTime"
                      required
                      value={toLocalDatetimeString(newElectionData.endTime)}
                      onChange={handleCreateInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                <div className="p-3 bg-indigo-50 rounded-md">
                  <span className="font-medium text-sm text-indigo-800">Trạng thái Dự kiến: </span>
                  <span className={`font-bold uppercase text-xs px-2 py-1 rounded-full ${
                    calculatedStatus === 'upcoming' ? 'bg-yellow-400 text-yellow-900' :
                    calculatedStatus === 'running' ? 'bg-green-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                      {calculatedStatus}
                  </span>
                </div>
                
              </div>

              <button 
                className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition duration-150"
                onClick={handleCreateSubmit} 
                disabled={newElectionData.name === ''}
              >
                Tạo và Lưu
              </button>
            </div>
        ) : (
            // ... (phần Chi Tiết Bầu Cử khi không phải chế độ tạo mới) ...
          <div>
            <h3 className="text-xl font-bold mb-4">Chi Tiết Bầu Cử: {election?.name}</h3>
            
            <div className="mb-6 text-sm text-gray-700 space-y-1 p-4 border rounded-md">
                <p>ID: {election?._id}</p>
                <p>Thời gian bắt đầu: {election?.startTime ? toLocalDatetimeString(new Date(election.startTime)) : ""}</p>
                <p>Thời gian kết thúc: {election?.endTime ? toLocalDatetimeString(new Date(election.endTime)) : ""}</p>
                <p>Trạng thái: {election?.status}</p>
                <p>Số lượng Ứng viên (Tổng): {candidateList.length}</p>
            </div>

            <h4 className="text-lg font-semibold mt-6 mb-3 border-t pt-4">Danh Sách Ứng Viên</h4>
            
            {isLoadingCandidates ? (
                <p className="text-center text-blue-500 py-4">Đang tải danh sách ứng viên...</p>
            ) : isErrorCandidates ? (
                <p className="text-center text-red-500 py-4">Lỗi khi tải ứng viên.</p>
            ) : (
                <CandidateList 
                    candidates={candidateList} 
                    electionId={currentElectionId}
                    onCandidateSelect={handleCandidateSelect}
                />
            )}
            
          </div>
        )}
    </div>
    <AddCandidateModal
      isOpen={isCandidateModalOpen}
      onClose={closeCandidateModal}
      electionId={currentElectionId}
    />
  </div>);
};
export default ElectionModal;