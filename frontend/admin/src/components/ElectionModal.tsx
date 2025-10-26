import { IElection } from "../types/election";

interface ElectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    election: IElection | null;
    isCreateMode?: boolean; // Thêm prop này
}

const ElectionModal: React.FC<ElectionModalProps> = ({ isOpen, onClose, election, isCreateMode }) => {
    
    // Xác định tiêu đề modal dựa trên chế độ
    const title = isCreateMode ? "Tạo Cuộc Bầu Cử Mới" : (election?.name || "Chi Tiết Bầu Cử");

    if (!isOpen) return null;

    return (
        // **********************************************
        // ĐÃ CẬP NHẬT CLASS TẠI ĐÂY:
        // Thay thế "bg-black bg-opacity-50" bằng "bg-black/30 backdrop-blur-sm"
        // **********************************************
        <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50"
            // Nếu `backdrop-blur-sm` không hoạt động, có thể là do cấu hình Tailwind CSS 
            // và bạn sẽ cần dùng style trực tiếp: style={{ backdropFilter: 'blur(4px)' }}
        >
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        &times;
                    </button>
                </div>
                
                {/* Logic render form tạo mới hoặc chi tiết/sửa */}
                {isCreateMode ? (
                    <div>
                        <p>Đây là form để tạo một cuộc bầu cử mới.</p>
                        {/* Thêm form input cho Tên, Thời gian, Ứng viên... */}
                        <button 
                            className="mt-4 bg-green-500 text-white py-2 px-4 rounded"
                            onClick={() => {
                                // Logic xử lý tạo mới
                                alert('Đã tạo bầu cử mới (chưa lưu vào DB)!');
                                onClose();
                            }}
                        >
                            Tạo
                        </button>
                    </div>
                ) : (
                    <div>
                        <p>ID: **{election?._id}**</p>
                        <p>Thời gian bắt đầu: **{election?.startTime.toLocaleDateString()}**</p>
                        {/* Hiển thị chi tiết khác... */}
                        <p>Trạng thái: **{election?.status}**</p>
                        <p>Ứng viên: **{election?.candidateIds.length}**</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ElectionModal;