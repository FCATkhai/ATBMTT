import { useEffect, useState } from "react";
import React from "react"; 
import { DeleteCandidateRequest, ElectionStatus, ICandidate, IElection, IElectionCreate, PublicKeyType } from "../types/election";
import AddCandidateModal from "./AddCandidateModal";
import CandidateList from "./CandidateList";
import apiSlice from "../store/apiSlice";
import { generatePaillierKey } from "../utils/pailer";
import AddVoterModal from "./AddVoterModal";

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
  const [isVoterModalOpen, setIsVoterModalOpen] = useState(false);
  const [publicKeyParams, setPublicKeyParams] = useState({ keyLength: 10n });
  const [candidateList, setCandidateList] = useState<ICandidate[]>([]);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [newElectionData, setNewElectionData] = useState<IElectionCreate>({
    name: '',
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    publicKey: { n: "", g: "", n2: "" },
    status: calculatedStatus
  });

  const [
    getCandidateByElectionId, 
    { data: fetchedCandidatesData, isLoading: isLoadingCandidates, isError: isErrorCandidates, isSuccess: isCandidatesSuccess }
  ] = apiSlice.endpoints.getCandidateByElectionId.useLazyQuery(); 
  
  const [
    getUsersByElectionId, 
    { data: fetchedUsersData }
  ] = apiSlice.endpoints.getUsersByElectionId.useLazyQuery(); 

  const [
    deleteCandidate, 
    { isLoading: isDeletingCandidate }
  ] = apiSlice.endpoints.deleteCandidate.useMutation();

  const [deleteUser] = apiSlice.useDeleteUserMutation();

  useEffect(() => {
    if (isOpen && !isCreateMode && election?._id) {
      getCandidateByElectionId(election._id);
      getUsersByElectionId(election._id);
    }
  }, [isOpen, isCreateMode, election?._id, getCandidateByElectionId, getUsersByElectionId]);

  useEffect(() => {
    if (fetchedUsersData) {
      console.log("Fetched users:", fetchedUsersData.data);
    }
  }, [fetchedUsersData]);

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
    let publicKey: PublicKeyType;
    try {
      publicKey = await generatePaillierKey(keyLength);
    } catch (error) {
      console.error(error);
      return;
    }

    const finalData = {
      ...newElectionData,
      publicKey,
      status: calculateStatus(newElectionData.startTime, newElectionData.endTime)
    };

    console.log("Dữ liệu Cuộc Bầu Cử Mới (FINAL):", finalData);
    await createElection(finalData);
    alert(`Đã chuẩn bị tạo cuộc bầu cử: ${finalData.name} (Status: ${finalData.status}).`);
    onClose();
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
      await deleteUser({
        userId: voterId,
        electionId: null
      }).unwrap();

      alert("Xóa cử tri thành công.");
      setIsDeletingUser(false)
    }
    catch(error) {
      alert(error)
    }
  };

  const closeCandidateModal = () => setIsCandidateModalOpen(false);
  const closeVoterModal = () => setIsVoterModalOpen(false);

  if (!isOpen) return null;

  const title = isCreateMode ? "Tạo Cuộc Bầu Cử Mới" : (election?.name || "Chi Tiết Bầu Cử");
  const currentElectionId = election?._id || null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start z-50 overflow-auto py-10">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-6xl">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl">&times;</button>
        </div>
        <div className="flex gap-4 mb-4">
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
        </div>
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

            {/* RIGHT: Voters */}
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
                          <button
                            onClick={() => handleDeleteVoter(voter._id)}
                            disabled={isDeletingUser}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm shadow"
                          >
                            Xóa
                          </button>
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
