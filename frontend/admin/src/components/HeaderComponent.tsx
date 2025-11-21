import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { logout } from "../store/authSlice";
import { useDispatch } from "react-redux";
import { LogOut, BarChart2, ListChecks, Menu, X } from "lucide-react";

function HeaderComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <>
      {/* Nút mở sidebar - chỉ hiện trên mobile */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow px-3 py-2 rounded-md"
      >
        <Menu size={22} />
      </button>

      {/* Overlay khi sidebar mở */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-60 z-50
          bg-white shadow-lg p-6 flex flex-col gap-6
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Nút đóng sidebar khi trên mobile */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-gray-600"
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-bold text-gray-700 mt-2 lg:mt-0">
          Dashboard
        </h2>

        <ul className="flex flex-col gap-2 mt-4">

          <li>
            <Link
              to="/"
              onClick={() => setOpen(false)}
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
              onClick={() => setOpen(false)}
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
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
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
    </>
  );
}

export default HeaderComponent;
