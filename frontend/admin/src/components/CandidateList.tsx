import { useMemo } from "react";
import { ICandidate } from "../types/election";
import CandidateCard from "./CandidateCard";

interface CandidateListProps {
    candidates: ICandidate[];
    electionId: string | null;
    onCandidateSelect: (id: string) => void;
    onDelete?: (id: string) => void; // <--- DÒNG MỚI
}

const CandidateList: React.FC<CandidateListProps> = ({
    candidates,
    electionId,
    onCandidateSelect,
    onDelete, // <--- DÒNG MỚI
}) => {
    const handleCandidateSelect = (id: string) => {
        onCandidateSelect(id);
    };

    const filteredCandidates = useMemo(() => {
        if (!electionId) {
            return candidates;
        }

        return candidates.filter(
            (candidate) => candidate.electionId === electionId
        );
    }, [candidates, electionId]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-2 h-[200px] overflow-scroll overflow-x-hidden">
            {filteredCandidates.length > 0 ? (
                filteredCandidates.map((candidate) => (
                    <CandidateCard
                        key={candidate._id}
                        candidate={candidate}
                        onClick={() => handleCandidateSelect(candidate._id)}
                        onDelete={onDelete} // <--- DÒNG MỚI
                    />
                ))
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