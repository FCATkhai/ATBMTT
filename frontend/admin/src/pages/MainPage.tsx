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

    const handleCardClick = (election: IElection) => {
        setSelectedElection(election);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedElection(null);
    };

  return (
    <div
      className="
        grid h-screen
        grid-cols-1 sm:grid-cols-12
        grid-rows-[auto_1fr]
        sm:grid-rows-1
      "
    >
      {/* Navbar */}
      <aside
        className="
          bg-gray-100 border-b sm:border-b-0 sm:border-r border-gray-300 p-4
          sm:col-span-2 sm:row-span-1
          col-span-12
        "
      >
        <h2 className="text-lg font-semibold mb-4">Navbar</h2>
        <ul className="flex sm:flex-col gap-4 sm:gap-2 justify-center sm:justify-start">
          <li className="hover:text-blue-500 cursor-pointer">Trang chủ</li>
          <li className="hover:text-blue-500 cursor-pointer">Hồ sơ</li>
          <li className="hover:text-blue-500 cursor-pointer">Cài đặt</li>
        </ul>
      </aside>

      {/* Nội dung chính */}
      <main
        className="
          col-span-12 sm:col-span-10
          p-6 overflow-y-auto
        "
      >
        <h1 className="text-2xl font-bold mb-4">Main Content</h1>
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
            />
            </div>
        </div>
      </main>
    </div>
  );
}

export default MainPage;
