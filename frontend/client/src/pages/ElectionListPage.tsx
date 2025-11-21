import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { ClickedStatusMap, ElectionStatus } from "../types/election";
import React from "react";
import apiSlice from "../store/apiSlice";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const getStatusBadge = (status: ElectionStatus) => {
  switch (status) {
    case "running":
      return (
        <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
          Đang diễn ra
        </span>
      );
    case "upcoming":
      return (
        <span className="px-3 py-1 text-sm font-semibold text-yellow-800 bg-yellow-100 rounded-full">
          Sắp diễn ra
        </span>
      );
    case "finished":
      return (
        <span className="px-3 py-1 text-sm font-semibold text-gray-800 bg-red-200 rounded-full">
          Đã kết thúc
        </span>
      );
    default:
      return (
        <span className="px-3 py-1 text-sm font-semibold text-gray-500 bg-gray-100 rounded-full">
          Không rõ
        </span>
      );
  }
};

const formatDate = (date: Date) => {
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const LOCAL_STORAGE_KEY_PER_ITEM = "elections_item_clicked_status";

const ElectionListPage = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // ---- State lưu trạng thái click ----
  const getInitialClickedStatus = (): ClickedStatusMap => {
    const storedStatus = localStorage.getItem(LOCAL_STORAGE_KEY_PER_ITEM);
    if (storedStatus) {
      try {
        return JSON.parse(storedStatus) as ClickedStatusMap;
      } catch {
        return {};
      }
    }
    return {};
  };

  const [clickedStatus, setClickedStatus] =
    useState<ClickedStatusMap>(getInitialClickedStatus);

  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY_PER_ITEM,
      JSON.stringify(clickedStatus)
    );
  }, [clickedStatus]);

  const handleButtonClick = (electionId: string) => {
    setClickedStatus((prev) => ({
      ...prev,
      [electionId]: true,
    }));
  };

  const isElectionClicked = (electionId: string): boolean =>
    clickedStatus[electionId] === true;

  // ---- Lazy query ----
  const [getElectionsByUserId, { data, isLoading, isError }] =
    apiSlice.endpoints.getElectionsByUserId.useLazyQuery();

  // ---- SỬA QUAN TRỌNG: thêm currentUser vào dependency ----
  useEffect(() => {
    if (currentUser?._id) {
      getElectionsByUserId(currentUser._id);
    }
  }, [currentUser, getElectionsByUserId]);

  const rawData = data?.data;

    let elections: any[] = [];

    if (rawData) {
      if (Array.isArray(rawData)) {
        elections = rawData;
      } else if (typeof rawData === 'object') {
        elections = [rawData];
      }
    }

  // ---- Loading ----
  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">Đang tải danh sách...</div>
    );
  }

  // ---- Error ----
  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Lỗi khi tải danh sách bầu cử.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Danh sách cuộc bầu cử được mời
      </h1>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên cuộc bầu cử
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bắt đầu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kết thúc
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
            {elections.length > 0 ? (
              elections.map((election: any) => {
                const clicked = isElectionClicked(election._id);
                return (
                  <tr
                    key={election._id}
                    className={`hover:bg-gray-50 relative ${
                      clicked ? "bg-indigo-50/50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 relative">
                      {clicked ? (
                        <span className="absolute top-0 left-0 bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-br-lg shadow-md">
                          ✅ Đã Xem
                        </span>
                      ) : (
                        <span className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-br-lg shadow-md animate-pulse">
                          🔥 MỚI
                        </span>
                      )}
                      {election.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(new Date(election.startTime))}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(new Date(election.endTime))}
                    </td>

                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(election.status)}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-medium">
                      {election.status === "running" && (
                        <Link
                          to={`/election/${election._id}/vote`}
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => handleButtonClick(election._id)}
                        >
                          Bình chọn ngay
                        </Link>
                      )}

                      {election.status === "finished" && (
                        <Link
                          to={`/election/${election._id}/result`}
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => handleButtonClick(election._id)}
                        >
                          Xem Kết quả
                        </Link>
                      )}

                      {election.status === "upcoming" && (
                        <span className="text-gray-400">Chờ đợi</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-gray-500 italic"
                >
                  Bạn hiện không có cuộc bầu cử nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ElectionListPage;
