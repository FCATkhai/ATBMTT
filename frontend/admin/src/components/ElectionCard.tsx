import { FC } from "react";
import { IElection } from "../types/election";

interface ElectionCardProps {
  election: IElection;
  onClick: (election: IElection) => void;
}

const ElectionCard: FC<ElectionCardProps> = ({ election, onClick }) => {
  const getStatusColor = (status: IElection["status"]) => {
    switch (status) {
      case "running":
        return "text-green-600 bg-green-100";
      case "upcoming":
        return "text-gray-600 bg-gray-100";
      case "finished":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div
      onClick={() => onClick(election)}
      className="cursor-pointer border border-gray-300 rounded-lg 
                shadow-sm p-4 bg-white hover:shadow-md hover:-translate-y-1 
                transition h-[250px]"
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-2">{election.name}</h2>
      <p className="text-sm text-gray-500 mb-2">
        <span className="font-medium text-gray-700">ID:</span> {election._id}
      </p>
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-medium text-gray-700">Bắt đầu:</span>{" "}
        {new Date(election.startTime).toLocaleDateString()}
      </p>
      <p className="text-sm text-gray-600 mb-3">
        <span className="font-medium text-gray-700">Kết thúc:</span>{" "}
        {new Date(election.endTime).toLocaleDateString()}
      </p>
      <span
        className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
          election.status
        )}`}
      >
        {election.status === "running"
          ? "Đang diễn ra"
          : election.status === "upcoming"
          ? "Sắp diễn ra"
          : "Đã kết thúc"}
      </span>
    </div>
  );
};

export default ElectionCard;