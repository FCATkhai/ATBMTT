import { useState } from "react";
import ElectionCard from "../components/ElectionCard";
import { IElection } from "../types/election";
import ElectionModal from "../components/ElectionModal";

const ResultPage = () => {

    const [selectedElection, setSelectedElection] = useState<IElection | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateMode, setIsCreateMode] = useState(false)

    const handleCardClick = (election: IElection) => {
        setSelectedElection(election);
        setIsModalOpen(true);
    };

    const handleCreateClick = () => {
        setSelectedElection(null); // Đảm bảo không có cuộc bầu cử nào được chọn
        setIsCreateMode(true);
        setIsModalOpen(true);
    };    

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedElection(null);
        setIsCreateMode(false)
    };
return (
    <div
        className="
          col-span-12 sm:col-span-10
          overflow-y-auto
        "
    >
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Kết quả các cuộc bầu cử</h1>
            {/* Nút Tạo cuộc bầu cử */}
            <button
                onClick={handleCreateClick}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-300"
            >
                Tạo cuộc bầu cử
            </button>
        </div>
        <div className="text-gray-700">
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-h-screen bg-gray-50">
            </div>
        </div>
    </div>
  );
}

export default ResultPage;
