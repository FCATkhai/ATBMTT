import React from 'react';

interface CandidateCardProps {
    candidate: {
        _id: string;
        name: string;
        image: string; // Base64 encoded image string
        electionId: string;
    };
    onClick?: (candidateId: string) => void; 
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onClick }) => {
    
    const handleClick = () => {
        if (onClick) {
            onClick(candidate._id);
        }
    };

    return (
        <div 
            className={`
                bg-white rounded-xl shadow-lg p-4 transition-transform duration-300 ease-in-out
                flex flex-col items-center space-y-3 border-2 border-gray-100 
                ${onClick ? 'hover:shadow-xl hover:border-blue-400 cursor-pointer' : ''}
            `}
            onClick={handleClick}
        >
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 shadow-md">
                <img 
                    src={`data:image/jpeg;base64,${candidate.image}`} 
                    alt={`Ảnh của ${candidate.name}`} 
                    className="w-full h-full object-cover"

                    // Xử lý lỗi ảnh nếu chuỗi Base64 không hợp lệ
                    onError={(e) => {
                        e.currentTarget.onerror = null; 
                        e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image'; // Ảnh placeholder
                    }}
                />
            </div>

            <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800">{candidate.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Election ID: <span className="font-mono text-xs">{candidate.electionId}</span>
                </p>
            </div>
        </div>
    );
};

export default CandidateCard;