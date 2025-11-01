import * as XLSX from 'xlsx';
import { ICandidateCreate } from '../types/election';


export const processExcelFile = (
    file: File, 
    electionId: string | null
): Promise<ICandidateCreate[] | null> => {

    return new Promise((resolve) => {
        if (!file || !electionId) {
            console.error("Thiếu File hoặc Election ID.");
            resolve(null);
            return;
        }

        const reader = new FileReader();

        reader.onload = (e: ProgressEvent<FileReader>) => {
            const data = e.target?.result;
            if (!data) {
                resolve(null);
                return;
            }

            try {
                const workbook = XLSX.read(data as ArrayBuffer, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                if (jsonData.length <= 1) {
                    alert("Tệp không có dữ liệu ứng viên.");
                    resolve([]);
                    return;
                }

                const rows = jsonData.slice(1);
                
                const candidates: ICandidateCreate[] = rows.map(row => {
                    const dataRow = row as any[]; 
                    const name = (dataRow[0] as string || '').trim(); 

                    return {
                        name: name,
                        image: '',           
                        electionId: electionId 
                    };
                    
                }).filter(candidate => candidate.name.length > 0);

                resolve(candidates);

            } catch (error) {
                console.error("Lỗi khi xử lý file Excel:", error);
                alert("Có lỗi xảy ra khi đọc file Excel. Vui lòng kiểm tra định dạng.");
                resolve(null);
            }
        };

        reader.onerror = () => {
            console.error("Lỗi FileReader khi đọc tệp.");
            alert("Lỗi khi đọc tệp.");
            resolve(null);
        };
        reader.readAsArrayBuffer(file); 
    });
};