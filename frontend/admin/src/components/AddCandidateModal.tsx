import React, { useState } from 'react';
import { ICandidateCreate } from '../types/election'; 
import { processExcelFile } from '../services/electionService';
import apiSlice from '../store/apiSlice';

type CandidateAddMode = 'single' | 'batch';

interface AddCandidateModalProps {
    isOpen: boolean;
    onClose: () => void;
    electionId: string | null;
}

interface ImageUploadOverlayProps {
    candidate: ICandidateCreate;
    onClose: () => void;
    onImageSet: (base64Image: string) => void;
}

const ImageUploadOverlay: React.FC<ImageUploadOverlayProps> = ({ candidate, onClose, onImageSet }) => {
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Tách phần Base64 (sau dấu phẩy)
                const base64String = reader.result?.toString().split(',')[1] || ''; 
                onImageSet(base64String);
                onClose();
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[70]">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm">
                <h4 className="text-lg font-bold mb-4 text-center">Thêm Ảnh cho: {candidate.name}</h4>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
                <button 
                    onClick={onClose} 
                    className="mt-4 w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded"
                >
                    Hủy
                </button>
            </div>
        </div>
    );
};

const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ isOpen, onClose, electionId }) => {
    
    const [mode, setMode] = useState<CandidateAddMode>('single'); 
    const [candidateData, setCandidateData] = useState<ICandidateCreate>({
        name: '',
        image: '',
        electionId: electionId || '',
    });
    const [currentProgress, setCurrentProgress] = useState(0);
    const [totalProgress, setTotalProgress] = useState(0);
    const [batchCandidatesData, setBatchCandidatesData] = useState<ICandidateCreate[]>([])
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedCandidateIndex, setSelectedCandidateIndex] = useState<number | null>(null);
    const [createCandidate] = apiSlice.useCreateCandidateMutation()
    const [isLoading, setIsLoading] = useState(false);


    const resizeImageToBase64 = (
    file: File,
    maxWidth = 300,
    maxHeight = 300,
    targetKB = 60,
    maxIterations = 10
    ): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = e => {
        img.src = e.target?.result as string;
        };
        reader.onerror = reject;

        img.onload = async () => {
        let width = img.width;
        let height = img.height;

        // Giảm kích thước nhưng giữ tỉ lệ
        if (width > height) {
            if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
            }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject("Canvas không hỗ trợ");
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.9; // Bắt đầu quality cao
        let iteration = 0;
        let base64 = "";

        while (iteration < maxIterations) {
            base64 = canvas.toDataURL("image/jpeg", quality).split(",")[1];
            const sizeKB = base64.length * (3/4) / 1024; // chuyển từ base64 -> KB xấp xỉ
            if (sizeKB <= targetKB || quality <= 0.1) break; // đạt target hoặc quality quá thấp
            quality -= 0.1; // giảm quality
            iteration++;
        }

        resolve(base64);
        };

        reader.readAsDataURL(file);
    });
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCandidateData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Resize và chuyển thành base64
            const base64String = await resizeImageToBase64(file, 300, 300, 60);

            // Lưu vào state
            setCandidateData(prev => ({ ...prev, image: base64String }));
        } catch (err) {
            console.error("Lỗi xử lý ảnh:", err);
        }
    };

    const handleRemoveCandidate = (indexToRemove: number) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa ứng viên "${batchCandidatesData[indexToRemove].name}" khỏi danh sách thêm hàng loạt?`)) {
            setBatchCandidatesData(prev => 
                // Sử dụng filter để tạo mảng mới mà không có phần tử tại index cần xóa
                prev.filter((_, index) => index !== indexToRemove)
            );
            alert("Đã xóa ứng viên khỏi danh sách tạm.");
        }
    };

    const handleSingleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalCandidateData = { ...candidateData, electionId: electionId || '' };
        if (!finalCandidateData.electionId) {
             alert("Lỗi: Không tìm thấy ID Cuộc Bầu Cử!");
             return;
        }
        const result = await createCandidate(candidateData);
        if (result) {
            alert(`Ứng viên ${finalCandidateData.name} đã được thêm thành công (Chế độ Đơn).`);
        }
        setCandidateData({ name: '', image: '', electionId: electionId || '' });
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFile(e.target.files?.[0] || null);
        setBatchCandidatesData([]); 
    };

    const handleBatchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!electionId || !selectedFile) {
            alert("Thiếu ID Bầu cử hoặc Tệp Excel.");
            return;
        }

        const candidates = await processExcelFile<ICandidateCreate>(
            selectedFile,
            (row, electionId) => ({
                name: (row[0] || '').trim(),
                image: '',
                electionId
            }),
            electionId
        );
        
        if (candidates && candidates.length > 0){
            setBatchCandidatesData(candidates); 
            console.log("Ứng viên đọc từ Excel:", candidates);
        } else {
            alert("Không tìm thấy ứng viên hợp lệ nào trong tệp hoặc có lỗi xảy ra.");
            setBatchCandidatesData([]);
        }
    };

    const handleImageSet = (base64Image: string) => {
        if (selectedCandidateIndex !== null) {
            setBatchCandidatesData(prev => {
                const newCandidates = [...prev];
                newCandidates[selectedCandidateIndex] = {
                    ...newCandidates[selectedCandidateIndex],
                    image: base64Image
                };
                return newCandidates;
            });
            setSelectedCandidateIndex(null); 
        }
    };
    
    const handleFinalBatchSubmit = async () => {
        if (batchCandidatesData.length === 0) return;

        setIsLoading(true);
        setCurrentProgress(0);
        setTotalProgress(batchCandidatesData.length);

        try {
            for (let i = 0; i < batchCandidatesData.length; i++) {
                await createCandidate(batchCandidatesData[i]);

                // ✅ Update progress
                setCurrentProgress(i + 1);
            }

            alert(`Đã gửi ${batchCandidatesData.length} ứng viên.`);
            setBatchCandidatesData([]);
            setSelectedFile(null);
            onClose();
        } catch (err) {
            alert("Có lỗi xảy ra khi gửi danh sách ứng viên!");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[60]">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-blue-700">Thêm Ứng viên</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
                </div>
        
                <div className="flex justify-center space-x-2 mb-6 p-1 bg-gray-100 rounded-full">
                    <button
                        onClick={() => setMode('single')}
                        className={`py-2 px-4 rounded-full transition duration-200 text-sm font-medium w-1/2 ${
                            mode === 'single' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Thêm Từng Ứng viên
                    </button>
                    <button
                        onClick={() => setMode('batch')}
                        className={`py-2 px-4 rounded-full transition duration-200 text-sm font-medium w-1/2 ${
                            mode === 'batch' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Thêm Hàng loạt (Excel)
                    </button>
                </div>

                <p className="text-sm text-gray-500 mb-4 text-center p-2 bg-gray-50 rounded-md">
                    ID Cuộc Bầu Cử: {electionId || "Chưa xác định"}
                </p>
                
                {mode === 'single' && (
                    <form onSubmit={handleSingleSubmit}>
                         <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên Ứng viên</label>
                            <input type="text" name="name" id="name" required value={candidateData.name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700">Ảnh Ứng viên</label>
                            <input type="file" name="image" id="image" accept="image/*" required onChange={handleImageUpload} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                            {candidateData.image && <p className="text-xs text-green-600 mt-2">✅ Đã tải ảnh thành công.</p>}
                        </div>
                        <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md transition duration-150" disabled={!electionId}>Thêm Ứng viên</button>
                    </form>
                )}
                
                {/* --- CHẾ ĐỘ THÊM HÀNG LOẠT (EXCEL) --- */}
                {mode === 'batch' && (
                    <>
                        {batchCandidatesData.length > 0 && (
                            <div className="mt-2 mb-4 p-4 border border-blue-300 bg-blue-50 rounded-lg">
                                <h4 className="font-semibold text-blue-800 mb-3">
                                    Ứng viên cần xử lý ({batchCandidatesData.length}):
                                </h4>
                                <ol className="max-h-48 overflow-y-auto space-y-2">
                                    {batchCandidatesData.map((candidate, index) => (
                                    <li key={index} className="flex justify-between items-center text-sm p-2 bg-white rounded shadow-sm">
                                        <span className="font-medium text-gray-700">
                                            {index + 1}. {candidate.name}
                                        </span>
                                        <div className="flex space-x-2"> 
                                            {/* NÚT THÊM/SỬA ẢNH */}
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCandidateIndex(index)}
                                                className={`py-1 px-3 text-xs rounded-full transition duration-150 ${
                                                    candidate.image 
                                                        ? 'bg-teal-500 text-white hover:bg-teal-600'
                                                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                }`}
                                            >
                                                {candidate.image ? 'Sửa Ảnh' : 'Thêm Ảnh'}
                                            </button>

                                            {/* NÚT XÓA ỨNG VIÊN */}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCandidate(index)}
                                                className="py-1 px-3 text-xs rounded-full transition duration-150 bg-red-500 text-white hover:bg-red-600"
                                            >
                                                ❌ Xóa
                                            </button>
                                        </div>
                                    </li>
                                    ))}
                                </ol>
                                <button
                                    onClick={handleFinalBatchSubmit}
                                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition duration-150"
                                >
                                    Xác nhận & Gửi {batchCandidatesData.length} Ứng viên
                                </button>
                            </div>
                        )}
                        
                        {/* FORM UPLOAD FILE */}
                        <form onSubmit={handleBatchSubmit} className="mb-4">
                            <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                                <label htmlFor="excelFile" className="block text-sm font-medium text-gray-700 mb-2">
                                    Tải lên tệp Excel/CSV
                                </label>
                                <input
                                    type="file"
                                    name="excelFile"
                                    id="excelFile"
                                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                    required
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                />
                                {selectedFile && <p className="text-xs text-green-600 mt-2">Tệp đã chọn: **{selectedFile.name}**</p>}
                            </div>
                            
                            <button
                                type="submit"
                                className="w-full mt-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-md transition duration-150"
                                disabled={!selectedFile || !electionId}
                            >
                                Đọc Dữ liệu từ Tệp
                            </button>
                        </form>
                    </>
                )}
                {isLoading && (
                    <div className="fixed inset-0 bg-black/40 flex flex-col items-center justify-center z-[100] backdrop-blur-sm px-6">
                        
                        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                            <h3 className="text-center font-semibold text-gray-700 mb-4">
                                Đang gửi {currentProgress}/{totalProgress} ứng viên...
                            </h3>

                            {/* Thanh tiến trình */}
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-4 transition-all duration-200"
                                    style={{ width: `${(currentProgress / totalProgress) * 100}%` }}
                                ></div>
                            </div>

                            <p className="text-center text-sm text-gray-500 mt-3">
                                Vui lòng không đóng cửa sổ...
                            </p>
                        </div>
                    </div>
                )}
            </div>
            
            {selectedCandidateIndex !== null && (
                <ImageUploadOverlay
                    candidate={batchCandidatesData[selectedCandidateIndex]}
                    onClose={() => setSelectedCandidateIndex(null)}
                    onImageSet={handleImageSet}
                />
            )}
        </div>
    );
};

export default AddCandidateModal;