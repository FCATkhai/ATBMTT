import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import type { ClickedStatusMap, ElectionStatus, IElection } from "../types/election"
import React from "react" 

const mockElections: IElection[] = [
    // ... (Giữ nguyên dữ liệu mock) ...
    {
        _id: 'e001',
        name: 'Bầu cử Ban chấp hành Chi đoàn 2024',
        startTime: new Date('2025-11-15T09:00:00Z'),
        endTime: new Date('2025-11-15T12:00:00Z'),
        candidateIds: ['c01', 'c02', 'c03'],
        status: 'running',
    },
    {
        _id: 'e002',
        name: 'Tuyển chọn Lãnh đạo Dự án Q3',
        startTime: new Date('2025-12-01T14:00:00Z'),
        endTime: new Date('2025-12-05T17:00:00Z'),
        candidateIds: ['c04', 'c05'],
        status: 'upcoming',
    },
    {
        _id: 'e003',
        name: 'Thăm dò ý kiến Cải tiến Sản phẩm',
        startTime: new Date('2025-10-01T00:00:00Z'),
        endTime: new Date('2025-10-15T23:59:59Z'),
        candidateIds: ['c06'],
        status: 'finished',
    },
]

const getStatusBadge = (status: ElectionStatus) => {
    // ... (Hàm giữ nguyên) ...
    switch (status) {
        case 'running':
            return <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">Đang diễn ra</span>
        case 'upcoming':
            return <span className="px-3 py-1 text-sm font-semibold text-yellow-800 bg-yellow-100 rounded-full">Sắp diễn ra</span>
        case 'finished':
            return <span className="px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-200 rounded-full">Đã kết thúc</span>
        default:
            return <span className="px-3 py-1 text-sm font-semibold text-gray-500 bg-gray-100 rounded-full">Không rõ</span>
    }
}

const formatDate = (date: Date) => {
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const LOCAL_STORAGE_KEY_PER_ITEM = 'elections_item_clicked_status' 

const ElectionListPage = () => {
    
    // Logic khởi tạo và đồng bộ state (GIỮ NGUYÊN)
    const getInitialClickedStatus = (): ClickedStatusMap => {
        const storedStatus = localStorage.getItem(LOCAL_STORAGE_KEY_PER_ITEM)
        if (storedStatus) {
            try {
                return JSON.parse(storedStatus) as ClickedStatusMap
            } catch (error) {
                console.error("Lỗi khi đọc trạng thái click từ localStorage:", error)
                return {}
            }
        }
        return {}
    }
    
    const [clickedStatus, setClickedStatus] = useState<ClickedStatusMap>(getInitialClickedStatus)

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY_PER_ITEM, JSON.stringify(clickedStatus))
    }, [clickedStatus])

    const handleButtonClick = (electionId: string) => {
        setClickedStatus(prevStatus => ({
            ...prevStatus,
            [electionId]: true
        }))
    }

    const isElectionClicked = (electionId: string): boolean => {
        return clickedStatus[electionId] === true
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Danh sách các Cuộc bầu cử được mời
            </h1>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tên cuộc bầu cử
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thời gian Bắt đầu
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thời gian Kết thúc
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    
                    <tbody className="bg-white divide-y divide-gray-200">
                        {mockElections.map((election) => {
                            const clicked = isElectionClicked(election._id)
                            return (
                                <tr 
                                    key={election._id} 
                                    className={`hover:bg-gray-50 relative ${clicked ? 'bg-indigo-50/50' : ''}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 relative"> 
                                        
                                        {clicked ? (
                                                // HIỆN THẺ "ĐÃ XEM" nếu đã click (trạng thái cũ)
                                                <span 
                                                    className="absolute top-0 left-0 bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-br-lg transform -translate-x-0.5 -translate-y-0.5 shadow-md"
                                                    title="Đã tương tác với mục này"
                                                >
                                                    ✅ Đã Xem
                                                </span>
                                            ) : (
                                                // HIỆN THẺ "MỚI" nếu chưa click (trạng thái mới)
                                                <span 
                                                    className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-br-lg transform -translate-x-0.5 -translate-y-0.5 shadow-md animate-pulse"
                                                    title="Cuộc bầu cử mới chưa được xem"
                                                >
                                                    🔥 MỚI
                                                </span>
                                        )}
                                        {election.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(election.startTime)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(election.endTime)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {getStatusBadge(election.status)}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {election.status === 'running' && (
                                            <Link
                                                to={`/election/${election._id}/vote`}
                                                className="text-indigo-600 hover:text-indigo-900 transition duration-150"
                                                onClick={() => handleButtonClick(election._id)}
                                            >
                                                Bình chọn ngay
                                            </Link>
                                        )}
                                        {election.status === 'finished' && (
                                            <Link
                                                to={`/election/${election._id}/result`}
                                                className="text-blue-600 hover:text-blue-900 transition duration-150"
                                                onClick={() => handleButtonClick(election._id)}
                                            >
                                                Xem Kết quả
                                            </Link>
                                        )}
                                        {election.status === 'upcoming' && (
                                            <span className="text-gray-400">Chờ đợi</span>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ElectionListPage