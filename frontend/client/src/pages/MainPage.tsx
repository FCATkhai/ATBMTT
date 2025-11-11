import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../store/store";

function MainPage() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleNavigate = () => {
    if (user) navigate("/elections");
    else navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Hệ thống quản lý bỏ phiếu trực tuyến
      </h1>
      <p className="text-gray-600 max-w-lg mb-8 leading-relaxed">
        Chào mừng bạn đến với nền tảng bỏ phiếu online.  
        Vui lòng tuân thủ các quy tắc:  
        <br />- Mỗi người chỉ được bỏ phiếu một lần duy nhất.  
        <br />- Không chia sẻ thông tin cá nhân hoặc mã định danh.  
        <br />- Kiểm tra kỹ lựa chọn của bạn trước khi xác nhận.
      </p>

      <button
        onClick={handleNavigate}
        className="px-6 py-3 bg-gray-800 font-bold text-white rounded-xl hover:bg-blue-700 transition-colors"
      >
        {user ? "Vào danh sách bầu cử" : "Đăng nhập để bỏ phiếu"}
      </button>
    </div>
  );
}

export default MainPage;
