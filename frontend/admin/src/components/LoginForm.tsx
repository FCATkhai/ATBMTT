import { ChangeEvent, useState } from "react"
import { Link } from "react-router";

const LoginForm = () => {

    const [showPass,setShowPass] = useState<boolean>(false)

    const handleShowPass = (e: ChangeEvent<HTMLInputElement>) => {
        setShowPass(e.target.checked);
    };

    return (
        <form className="flex flex-col items-center gap-4 w-1/2 min-w-[300px] mx-auto mt-12 p-6 border border-gray-300 rounded-lg shadow-md bg-white">
        <div className="flex justify-between items-center w-full">
            <label htmlFor="username" className="w-28 font-medium text-gray-700">
            Tài khoản:
            </label>
            <input
            name="username"
            type="text"
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
            className="flex-1 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
        </div>
        <div className="w-full text-left text-sm text-gray-700 p-5">
            <label className="flex items-center gap-1">
            <input
                type="checkbox"
                onChange={handleShowPass}
                className="accent-blue-500"
            />
            Hiện mật khẩu
            </label>
        </div>
        <p className="text-gray-700">
        Không có tài khoản?{" "}
        <Link
            to="/signup"
            className="text-blue-500 hover:text-blue-600 cursor-pointer font-medium"
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
}

export default LoginForm