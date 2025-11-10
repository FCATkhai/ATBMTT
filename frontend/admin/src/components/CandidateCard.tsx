import React from 'react';

interface CandidateCardProps {
    candidate: {
        _id: string;
        name: string;
        image: string;
        electionId: string;
    };
    onClick?: (candidateId: string) => void;
    onDelete?: (candidateId: string) => void; // thêm callback xóa
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onClick, onDelete }) => {
    
    const handleClick = () => {
        if (onClick) onClick(candidate._id);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // tránh trigger click của card
        if (onDelete) onDelete(candidate._id);
    };

    return (
        <div
            onClick={handleClick}
            className={`
                group relative bg-white rounded-2xl shadow-md p-5
                border border-gray-200 
                flex flex-col items-center
                transition-all duration-300 ease-out
                ${onClick ? "cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-blue-400" : ""}
            `}
        >
            {/* Nút xóa */}
            {onDelete && (
                <button
                    onClick={handleDelete}
                    className="absolute top-2 right-2 hidden group-hover:flex z-50 bg-red-500 text-white w-6 h-6 rounded-full items-center justify-center text-xs shadow hover:bg-red-600 transition"
                    title="Xóa ứng viên"
                >
                    ×
                </button>
            )}

            {/* Avatar */}
            <div className="relative w-28 h-28">
                <div className="
                    absolute inset-0 rounded-full 
                    bg-gradient-to-br from-blue-400 to-purple-500 
                    blur-sm opacity-30 group-hover:opacity-50 transition
                "></div>

                <div className="
                    w-full h-full relative rounded-full overflow-hidden 
                    border-[4px] border-white shadow-lg
                ">
                    <img
                        src={`data:image/jpeg;base64,${candidate.image}`}
                        alt={candidate.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://via.placeholder.com/150?text=No+Image";
                        }}
                    />
                </div>
            </div>

            {/* Info */}
            <div className="text-center mt-4">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition">
                    {candidate.name}
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                    <span className="text-gray-600">Election:</span>{" "}
                    <span className="font-mono text-[11px] px-2 py-0.5 bg-gray-100 rounded-md">
                        {candidate.electionId}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default CandidateCard;
