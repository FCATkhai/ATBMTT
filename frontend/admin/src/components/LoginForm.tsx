import { ChangeEvent, FormEvent, useState } from "react"
import { Link, useNavigate } from "react-router";
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
      if(res) {
        console.log(res)
        if (res.data.user.role != "admin"){
          alert("Tài khoản hoặc mật khẩu đăng nhập không chính xác")
          dispatch(logout())
          location.reload()
        }
      }
      dispatch(setCredentials({ 
        user: res.data.user, 
        token: res.data.access_token 
      }));
      navigate("/")
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Đăng nhập thất bại, vui lòng thử lại");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-4 w-1/2 min-w-[300px] mx-auto mt-12 p-6 border border-gray-300 rounded-lg shadow-md bg-white"
    >
      <div className="flex justify-between items-center w-full">
        <label htmlFor="email" className="w-28 font-medium text-gray-700">
          Email:
        </label>
        <input
          name="email"
          type="email"
          value={userLogin.email}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      <div className="flex justify-between items-center w-full">
        <label htmlFor="password" className="w-28 font-medium text-gray-700">
          Mật khẩu:
        </label>
        <input
          name="password"
          type={showPass ? "text" : "password"}
          value={userLogin.password}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      <div className="w-full text-left text-sm text-gray-700 p-5">
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={showPass}
            onChange={handleShowPass}
            className="accent-blue-500"
          />
          Hiện mật khẩu
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <p className="text-gray-700">
        Không có tài khoản?{" "}
        <Link
          to="/signup"
          className="text-blue-500 hover:text-blue-600 cursor-pointer font-medium transition-colors duration-200"
        >
          Đăng ký
        </Link>{" "}
        tại đây
      </p>

      <button
        type="submit"
        className="mt-2 w-full bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600 transition"
      >
        Đăng nhập
      </button>
    </form>
  );
};

export default LoginForm;