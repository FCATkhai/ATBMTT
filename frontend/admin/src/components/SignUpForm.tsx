import { FormEvent, useState, ChangeEvent } from "react";
import { Link } from "react-router";
import { UserSignUp } from "../types/auth";
import authApi from "../api/authApi";

const SignUpForm = () => {
  const [userSignUp, setUserSignUp] = useState<UserSignUp>({
    name: "",
    email: "",
    password: "",
    role: "admin"
  });
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>(""); 
  const [confirmError, setConfirmError] = useState<string>(""); 
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserSignUp((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmPassword = (value: string) => {
    setConfirmPassword(value);
    if (userSignUp.password && value !== userSignUp.password) {
      setConfirmError("Mật khẩu nhập lại không khớp");
    } else {
      setConfirmError("");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userSignUp.password !== confirmPassword) {
      setConfirmError("Mật khẩu nhập lại không khớp");
      return;
    }

    setConfirmError("");
    setError("");

    try {
      const result = await authApi.signUp(userSignUp);
      if (!result) {
        alert("Lỗi đăng ký");
        return;
      }
      alert("Đăng ký thành công");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại");
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

      {/* Name */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Họ và tên</label>
        <div className="relative">
          <input
            name="name"
            type="text"
            value={userSignUp.name}
            onChange={handleChange}
            placeholder="Nhập họ và tên"
            className="w-full border border-gray-300 rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-gray-700"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">👤</span>
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Email</label>
        <div className="relative">
          <input
            name="email"
            type="email"
            value={userSignUp.email}
            onChange={handleChange}
            placeholder="Nhập email"
            className="w-full border border-gray-300 rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-gray-700"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">📧</span>
        </div>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
        <div className="relative">
          <input
            name="password"
            type={showPass ? "text" : "password"}
            value={userSignUp.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu"
            className="w-full border border-gray-300 rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-gray-700"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔒</span>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Nhập lại mật khẩu</label>
        <div className="relative">
          <input
            name="confirmPassword"
            type={showPass ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => handleConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            className={`w-full border rounded-lg px-10 py-2 focus:outline-none focus:ring-2 shadow-sm text-gray-700 ${
              confirmError ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
            }`}
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔒</span>
        </div>
        {confirmError && <p className="text-red-500 text-sm mt-1">{confirmError}</p>}
      </div>

      {/* Show Password */}
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showPass}
          onChange={(e) => setShowPass(e.target.checked)}
          className="accent-blue-600 w-4 h-4"
        />
        Hiện mật khẩu
      </label>

      {/* Error message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Link to login */}
      <p className="text-gray-700 text-sm text-center">
        Đã có tài khoản?{" "}
        <Link
          to="/login"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Đăng nhập
        </Link>
      </p>

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
        Đăng ký
      </button>

    </form>
  );
};

export default SignUpForm;
