import { FC } from "react";
import { IElection } from "../types/election";
import apiSlice from "../store/apiSlice";
import { Trash2 } from "lucide-react";

interface ElectionCardProps {
  election: IElection;
  onClick: (election: IElection) => void;
  refetch: () => void;
}

const ElectionCard: FC<ElectionCardProps> = ({ election, onClick, refetch }) => {
  const [deleteElection, { isLoading }] = apiSlice.useDeleteElectionMutation();

  const getStatusStyle = (status: IElection["status"]) => {
    switch (status) {
      case "running":
        return "bg-green-500/10 text-green-700 border-green-300";
      case "upcoming":
        return "bg-blue-500/10 text-blue-700 border-blue-300";
      case "finished":
        return "bg-red-500/10 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // ❗ Không cho click vào card mở modal

    const confirmDelete = confirm("Bạn có chắc muốn xóa cuộc bầu cử này?");
    if (!confirmDelete) return;

    try {
      await deleteElection({electionId: election._id}).unwrap();
      alert("Xóa cuộc bầu cử thành công!");
      refetch(); // 🔄 Reload danh sách
    } catch (err) {
      alert("Xóa thất bại, vui lòng thử lại.");
    }
  };

  return (
    <div
      onClick={() => onClick(election)}
      className="cursor-pointer relative border border-gray-200 rounded-xl 
                 shadow-sm p-4 bg-white hover:shadow-lg 
                 hover:-translate-y-[2px] transition-all duration-150
                 flex flex-col gap-3 h-[210px]"
    >
      {/* Nút xóa */}
      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="absolute top-0 right-0 text-red-500 hover:text-red-600 
                   hover:bg-red-100 p-1 rounded transition"
      >
        <Trash2 size={18} />
      </button>

      {/* Title */}
      <h2 className="text-[24px] leading-tight font-semibold text-gray-900">
        {election.name}
      </h2>

      {/* ID */}
      <p className="text-[16px] text-gray-400 mb-1 select-text">
        ID: {election._id}
      </p>

      {/* Time Info */}
      <div className="text-[20px] text-gray-700 space-y-1">
        <p>
          <span className="font-medium">Bắt đầu:</span>{" "}
          {new Date(election.startTime).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p>
          <span className="font-medium">Kết thúc:</span>{" "}
          {new Date(election.endTime).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Status */}
      <div className="mt-auto">
        <span
          className={`inline-block text-xs font-semibold px-3 py-[5px] rounded-full border ${getStatusStyle(
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
    </div>
  );
};

export default ElectionCard;
