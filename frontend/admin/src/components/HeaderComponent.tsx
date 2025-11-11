import { Link, useNavigate } from "react-router"
import { logout } from "../store/authSlice"
import { useDispatch } from "react-redux"
import { LogOut, BarChart2, ListChecks } from "lucide-react"

function HeaderComponent() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    dispatch(logout())
    navigate("/login")
  }

  return (
    <aside className="
      fixed top-0 left-0 h-full w-60
      bg-white shadow-lg 
      p-6 flex flex-col gap-6
    ">
      <h2 className="text-xl font-bold text-gray-700">
        Dashboard
      </h2>

      <ul className="flex flex-col gap-2">

        <li>
          <Link
            to="/"
            className="
              flex items-center gap-3 p-3 rounded-lg
              text-gray-700 font-medium
              hover:bg-blue-50 hover:text-blue-600
              transition
            "
          >
            <ListChecks size={18} />
            Danh sách bầu cử
          </Link>
        </li>

        <li>
          <Link
            to="/results"
            className="
              flex items-center gap-3 p-3 rounded-lg
              text-gray-700 font-medium
              hover:bg-blue-50 hover:text-blue-600
              transition
            "
          >
            <BarChart2 size={18} />
            Kết quả bầu cử
          </Link>
        </li>

        <li>
          <button
            type="button"
            onClick={handleLogout}
            className="
              w-full text-left flex items-center gap-3 p-3 rounded-lg
              text-red-600 font-medium
              hover:bg-red-50 hover:text-red-700
              transition
            "
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </li>

      </ul>
    </aside>
  )
}

export default HeaderComponent
