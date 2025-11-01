import { FormEvent, useState, ChangeEvent } from "react";
import { Link } from "react-router";
import { UserSignUp } from "../types/auth";
import authApi from "../api/authApi";
// import authApi from "../api/authApi";

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

    console.log(userSignUp)

    const result = await authApi.signUp(userSignUp)
    if (!result) {
      alert("Lỗi đăng ký")
      return
    }
    alert("Đăng ký thành công")
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-4 w-1/2 min-w-[300px] mx-auto mt-12 p-6 border border-gray-300 rounded-lg shadow-md bg-white"
    >
      <div className="flex justify-between items-center w-full">
        <label htmlFor="name" className="w-28 font-medium text-gray-700">
          Họ và tên:
        </label>
        <input
          name="name"
          type="text"
          value={userSignUp.name}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      <div className="flex justify-between items-center w-full">
        <label htmlFor="email" className="w-28 font-medium text-gray-700">
          Email:
        </label>
        <input
          name="email"
          type="email"
          value={userSignUp.email}
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
          type="password"
          value={userSignUp.password}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center">
          <label
            htmlFor="confirmPassword"
            className="w-28 font-medium text-gray-700"
          >
            Nhập lại mật khẩu:
          </label>
          <input
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => handleConfirmPassword(e.target.value)}
            className={`flex-1 border rounded px-2 py-1 focus:outline-none focus:ring-1 ${
              confirmError
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-400"
            }`}
          />
        </div>

        {confirmError && (
          <p className="text-red-500 text-sm mt-1 ml-[7rem]">{confirmError}</p>
        )}
      </div>

      <p className="text-gray-700">
        Đã có tài khoản?{" "}
        <Link
          to="/login"
          className="text-blue-500 hover:text-blue-600 cursor-pointer font-medium transition-colors duration-200"
        >
          Đăng nhập
        </Link>{" "}
        tại đây
      </p>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <button
        type="submit"
        className="mt-2 w-full bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600 transition"
      >
        Đăng ký
      </button>
    </form>
  );
};

export default SignUpForm;
