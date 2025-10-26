import { useState } from "react";
import ElectionCard from "../components/ElectionCard";
import { IElection } from "../types/election";
import ElectionModal from "../components/ElectionModal";

const elections: IElection[] = [
  {
    _id: "E2025-001",
    name: "Bầu cử Chủ tịch năm 2025",
    startTime: new Date("2025-10-25"),
    endTime: new Date("2025-10-30"),
    candidateIds: ["c1", "c2"],
    status: "upcoming",
  },
  {
    _id: "E2025-002",
    name: "Bầu cử Hội đồng Sinh viên",
    startTime: new Date("2025-09-01"),
    endTime: new Date("2025-09-05"),
    candidateIds: ["a", "b", "c"],
    status: "finished",
  },
];

const MainPage = () => {

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

      "
    >
      <main
        className="
          col-span-12 sm:col-span-10
          overflow-y-auto
        "
      >
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Danh sách các cuộc bầu cử</h1>
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
            {elections.map((election) => (
                <ElectionCard
                key={election._id}
                election={election}
                onClick={handleCardClick}
                />
            ))}

            <ElectionModal
                isOpen={isModalOpen}
                onClose={closeModal}
                election={selectedElection} 
                isCreateMode={isCreateMode} 
            />
            </div>
        </div>
      </main>
    </div>
  );
}

export default MainPage;
