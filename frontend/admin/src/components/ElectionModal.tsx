import { FC } from "react";
import { IElection } from "../types/election";

interface ElectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  election: IElection | null;
}

const ElectionModal: FC<ElectionModalProps> = ({ isOpen, onClose, election }) => {
  if (!isOpen || !election) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative animate-fadeIn">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        {/* Tiêu đề */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {election.name}
        </h2>

        {/* Thông tin chi tiết */}
        <div className="space-y-2 text-gray-700 text-sm">
          <p><span className="font-medium">ID:</span> {election._id}</p>
          <p><span className="font-medium">Bắt đầu:</span> {new Date(election.startTime).toLocaleString()}</p>
          <p><span className="font-medium">Kết thúc:</span> {new Date(election.endTime).toLocaleString()}</p>
          <p>
            <span className="font-medium">Trạng thái:</span>{" "}
            {election.status === "running"
              ? "Đang diễn ra"
              : election.status === "upcoming"
              ? "Sắp diễn ra"
              : "Đã kết thúc"}
          </p>
          <p>
            <span className="font-medium">Ứng viên:</span>{" "}
            {election.candidateIds.join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ElectionModal;