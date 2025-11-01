import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router"
import { RootState } from "../store/store"
import { logout } from "../store/authSlice"

function HeaderComponent() {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const isLoggedIn = !!user

  const handleLogout = () => {
      dispatch(logout()) 
      location.reload()
  }

  return (
      <nav className="bg-gray-800 p-4 shadow-lg">
          <ul className="flex justify-between space-x-8 text-white">
              <div className="flex space-x-8">
                  <li className="text-lg font-medium hover:text-blue-400 transition duration-300">
                      <Link to='/'>Trang chủ</Link>
                  </li>
                  <li className="text-lg font-medium hover:text-blue-400 transition duration-300">
                      <Link to='/elections'>Danh sách các cuộc bầu cử của tôi</Link>
                  </li>
              </div>

              <div>
                  {isLoggedIn ? (
                      <li className="text-lg font-medium hover:text-red-400 transition duration-300 cursor-pointer">
                          <button type="button" onClick={handleLogout}>
                              Đăng xuất
                          </button>
                      </li>
                  ) : (
                      <li className="text-lg font-medium hover:text-green-400 transition duration-300">
                          <Link to='/login'>Đăng nhập</Link>
                      </li>
                  )}
              </div>
          </ul>
      </nav>
  )
}

export default HeaderComponent
