import { ChangeEvent, FormEvent, useState } from "react"
import { useNavigate } from "react-router";
import authApi from "../api/authApi";
import { LoginResponse, UserLogin } from "../types/auth";
import { AxiosResponse } from "axios";
import { useDispatch } from "react-redux";
import { logout, setCredentials } from "../store/authSlice";

const LoginForm = () => {
  const [userLogin, setUserLogin] = useState<UserLogin>({
    email: "",
    password: ""
  });
  const dispatch = useDispatch()
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserLogin((prev) => ({ ...prev, [name]: value }));
  };

  const handleShowPass = (e: ChangeEvent<HTMLInputElement>) => {
    setShowPass(e.target.checked);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const res: AxiosResponse<LoginResponse> = await authApi.login(userLogin);
      if (res) {
        if (res.data.user.role !== "admin") {
          alert("Tài khoản hoặc mật khẩu đăng nhập không chính xác");
          dispatch(logout());
          location.reload();
        }
      }

      dispatch(setCredentials({
        user: res.data.user,
        token: res.data.access_token.replace(/^"(.*)"$/, '$1')
      }));
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Đăng nhập thất bại, vui lòng thử lại");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        flex flex-col gap-5 
        w-full
      "
    >

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Email</label>
        <div className="relative">
          <input
            name="email"
            type="email"
            value={userLogin.email}
            onChange={handleChange}
            className="
              w-full border border-gray-300 rounded-lg px-10 py-2
              focus:outline-none focus:ring-2 focus:ring-blue-400
              shadow-sm text-gray-700
            "
            placeholder="Nhập email"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            📧
          </span>
        </div>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
        <div className="relative">
          <input
            name="password"
            type={showPass ? "text" : "password"}
            value={userLogin.password}
            onChange={handleChange}
            className="
              w-full border border-gray-300 rounded-lg px-10 py-2
              focus:outline-none focus:ring-2 focus:ring-blue-400
              shadow-sm text-gray-700
            "
            placeholder="Nhập mật khẩu"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            🔒
          </span>
        </div>
      </div>

      {/* Show password */}
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showPass}
          onChange={handleShowPass}
          className="accent-blue-600 w-4 h-4"
        />
        Hiện mật khẩu
      </label>

      {/* Error message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Submit button */}
      <button
        type="submit"
        className="
          w-full py-2 mt-3 text-white font-semibold rounded-lg
          bg-gradient-to-r from-blue-500 to-blue-600
          hover:from-blue-600 hover:to-blue-700
          shadow-md transition-all duration-200
        "
      >
        Đăng nhập
      </button>

    </form>
  );
};

export default LoginForm;
