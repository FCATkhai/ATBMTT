
import { Link, useNavigate } from "react-router"
import { logout } from "../store/authSlice"
import { useDispatch } from "react-redux"

function HeaderComponent() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const handleLogout = async () => {
    dispatch(logout())  
    navigate("/login")
  }

  return (
    <div className="fixed">
      <h2 className="text-lg font-semibold mb-4">Thanh điều hướng</h2>
      <ul className="flex sm:flex-col gap-4 sm:gap-2 justify-center sm:justify-start">
        <li className="hover:text-blue-500 cursor-pointer"><Link to="/">Danh sách bầu cử</Link></li>
        <li className="hover:text-blue-500 cursor-pointer"><Link to="/result">Kết quả bầu cử</Link></li>
        <li className="hover:text-blue-500 cursor-pointer"><button type="button" onClick={handleLogout}>Đăng xuất</button></li>
      </ul>
    </div>
  ) 
}

export default HeaderComponent
