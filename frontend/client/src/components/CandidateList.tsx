import { useMemo } from "react";
import { ICandidate } from "../types/election";
import CandidateCard from "./CandidateCard";

interface CandidateListProps {
  candidates: ICandidate[];
  electionId: string | null;
  selectedCandidates: [string, boolean][]; // 🔹 Mảng [candidateId, có_được_chọn_không]
  onCandidateSelect: (id: string) => void; // toggle chọn
  onDelete?: (id: string) => void;
}

const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  electionId,
  selectedCandidates,
  onCandidateSelect,
  onDelete,
}) => {
  const filteredCandidates = useMemo(() => {
    if (!electionId) return candidates;
    return candidates.filter((c) => c.electionId === electionId);
  }, [candidates, electionId]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-y-auto">
      {filteredCandidates.length > 0 ? (
        filteredCandidates.map((candidate) => {
          // 🔹 Kiểm tra xem ứng viên này có được chọn không
          const isSelected =
            selectedCandidates.find(([cid]) => cid === candidate._id)?.[1] ?? false;

          return (
            <CandidateCard
              key={candidate._id}
              candidate={candidate}
              onClick={() => onCandidateSelect(candidate._id)}
              onDelete={onDelete}
              isSelected={isSelected}
            />
          );
        })
      ) : (
        <p className="text-gray-500 col-span-full text-center py-4">
          {electionId
            ? `Không có ứng viên nào cho cuộc bầu cử này (${electionId}).`
            : "Không có danh sách ứng viên nào được cung cấp."}
        </p>
      )}
    </div>
  );
};

export default CandidateList;
