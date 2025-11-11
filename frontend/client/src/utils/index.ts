import { ElectionStatus } from "../types/election";

export const calculateStatus = (start: Date, end: Date): ElectionStatus => {
    const now = new Date();
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'running';
    return 'finished';
  };

export const toLocalDatetimeString = (date: Date): string => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  const day = local.getDate().toString().padStart(2, "0");
  const month = (local.getMonth() + 1).toString().padStart(2, "0");
  const year = local.getFullYear();
  const hour = local.getHours().toString().padStart(2, "0");
  const minute = local.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hour}:${minute}`;
};
