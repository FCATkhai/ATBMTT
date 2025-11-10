import React, { useState } from "react";
import apiSlice from "../store/apiSlice";
import { processExcelFile } from "../services/electionService";
import { UserSignUp } from "../types/auth";

interface AddVoterModalProps {
    isOpen: boolean;
    onClose: () => void;
    electionId: string | null;
}

const AddVoterModal: React.FC<AddVoterModalProps> = ({ isOpen, onClose, electionId }) => {
    const [mode, setMode] = useState<"single" | "batch">("single");
    const [email, setEmail] = useState("");
    const [usersBatch, setUsersBatch] = useState<UserSignUp[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentProgress, setCurrentProgress] = useState(0);
    const [totalProgress, setTotalProgress] = useState(0);

    const [createUser] = apiSlice.useCreateUserMutation();

    if (!isOpen) return null;

    // --- HÀM HỖ TRỢ ---
    const generateRandomPassword = (length = 10) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*';
        let pass = '';
        for (let i = 0; i < length; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pass;
    };

    const generateNameFromEmail = (email: string) => {
        const localPart = email.split('@')[0];
        return localPart
            .split(/[\.\-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // --- XỬ LÝ FILE BATCH ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFile(e.target.files?.[0] || null);
        setUsersBatch([]);
    };

    const handleBatchRead = async () => {
        if (!selectedFile || !electionId) return;

        const users = await processExcelFile<UserSignUp>(
            selectedFile,
            (row, electionId) => ({
                email: (row[0] || '').trim(),
                name: (row[0] || '').trim().split('@')[0],
                password: generateRandomPassword(),
                role: 'user'
            }),
            electionId
        );
        console.log(users)
        if (users && users.length > 0) {
            const batchUsers: UserSignUp[] = users.map(u => ({
                email: u.name, 
                password: generateRandomPassword(),
                name: generateNameFromEmail(u.name),
                role: "user"
            }));
            setUsersBatch(batchUsers);
        } else {
            alert("Không tìm thấy email hợp lệ trong tệp hoặc có lỗi.");
            setUsersBatch([]);
        }
    };

    // --- GỬI SINGLE ---
    const handleSubmitSingle = async () => {
        if (!email || !electionId) return;

        const user: UserSignUp = {
            email,
            password: generateRandomPassword(),
            name: generateNameFromEmail(email),
            role: "user"
        };

        try {
            await createUser({ electionId, ...user }).unwrap();
            alert(`Đã thêm cử tri: ${user.email}`);
            setEmail("");
            onClose();
        } catch (err) {
            console.error(err);
            alert("Lỗi khi thêm cử tri!");
        }
    };

    // --- GỬI BATCH ---
    const handleSubmitBatch = async () => {
        if (!usersBatch.length || !electionId) return;

        setIsLoading(true);
        setCurrentProgress(0);
        setTotalProgress(usersBatch.length);

        for (let i = 0; i < usersBatch.length; i++) {
            const email = usersBatch[i];
            try {
                await createUser({ electionId, ...email}).unwrap();
            } catch (err) {
                console.error(`Lỗi khi thêm cử tri ${email}:`, err);
            }

            setCurrentProgress(i + 1);
        }

        alert(`Đã thêm ${usersBatch.length} cử tri.`);
        setUsersBatch([]);
        setSelectedFile(null);
        setIsLoading(false);
        onClose();
    };

    // --- XÓA EMAIL TỪ DANH SÁCH ---
    const handleRemoveEmail = (index: number) => {
        setUsersBatch(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-700">Quản lý Cử Tri</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
                </div>

                {/* Mode Switch */}
                <div className="flex justify-center space-x-2 mb-4">
                    <button
                        className={`py-2 px-4 rounded-full w-1/2 ${mode === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                        onClick={() => setMode("single")}
                    >
                        Thêm lẻ
                    </button>
                    <button
                        className={`py-2 px-4 rounded-full w-1/2 ${mode === 'batch' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                        onClick={() => setMode("batch")}
                    >
                        Thêm từ Excel/CSV
                    </button>
                </div>

                {/* SINGLE MODE */}
                {mode === "single" && (
                    <div className="space-y-4">
                        <input
                            type="email"
                            placeholder="Nhập email cử tri"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2"
                        />
                        <button
                            onClick={handleSubmitSingle}
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md"
                            disabled={!email || !electionId}
                        >
                            Thêm cử tri
                        </button>
                    </div>
                )}

                {/* BATCH MODE */}
                {mode === "batch" && (
                    <div className="space-y-4">
                        {/* Chọn file */}
                        <input
                            type="file"
                            accept=".csv,.txt"
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />

                        {/* Nút đọc dữ liệu */}
                        {selectedFile && (
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-gray-700">Tệp đã chọn: {selectedFile.name}</p>
                                <button
                                    onClick={handleBatchRead}
                                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md"
                                >
                                    Đọc dữ liệu
                                </button>
                            </div>
                        )}

                        {/* Danh sách email tạm */}
                        {usersBatch.length > 0 && (
                            <div className="mt-2 p-4 border border-blue-300 bg-blue-50 rounded-lg max-h-64 overflow-y-auto">
                                <h4 className="font-semibold text-blue-800 mb-2">
                                    Email cần xử lý ({usersBatch.length})
                                </h4>
                                <ol className="space-y-1">
                                    {usersBatch.map((email, index) => (
                                        <li key={index} className="flex justify-between items-center text-sm p-1 bg-white rounded shadow-sm">
                                            <span className="text-gray-700">{index + 1}. {email.email}</span>
                                            <button
                                                onClick={() => handleRemoveEmail(index)}
                                                className="py-1 px-2 text-xs rounded-full bg-red-500 text-white hover:bg-red-600"
                                            >
                                                ❌ Xóa
                                            </button>
                                        </li>
                                    ))}
                                </ol>
                                <button
                                    onClick={handleSubmitBatch}
                                    className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
                                >
                                    Xác nhận & Thêm {usersBatch.length} cử tri
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Progress Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/40 flex flex-col items-center justify-center z-[60] backdrop-blur-sm px-6">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-center font-semibold text-gray-700 mb-4">
                            Đang thêm {currentProgress}/{totalProgress} cử tri...
                        </h3>
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
    );
};

export default AddVoterModal;
