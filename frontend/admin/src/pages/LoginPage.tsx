import LoginForm from "../components/LoginForm"

function LoginPage() {

  return (
    <div className="
      min-h-screen w-full 
      flex flex-col items-center justify-center
      bg-gradient-to-br from-blue-50 to-blue-100
      px-4
    ">
      
      {/* Title */}
      <p className="
        text-4xl sm:text-5xl font-extrabold mb-10 
        bg-gradient-to-r from-blue-600 to-purple-600 
        bg-clip-text text-transparent
        text-center drop-shadow-sm
      ">
        Hệ Thống Quản Lý Bỏ Phiếu
      </p>

      {/* Login Card */}
      <div className="
        w-full max-w-md bg-white
        p-8 rounded-2xl shadow-xl border border-gray-200
      ">
        <LoginForm />
      </div>

    </div>
  )
}

export default LoginPage
