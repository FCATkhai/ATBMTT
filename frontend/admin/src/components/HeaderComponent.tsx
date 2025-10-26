import { Link } from "react-router"

function HeaderComponent() {

  return (
    <div className="fixed">
      <h2 className="text-lg font-semibold mb-4">Thanh điều hướng</h2>
      <ul className="flex sm:flex-col gap-4 sm:gap-2 justify-center sm:justify-start">
        <li className="hover:text-blue-500 cursor-pointer"><Link to="/">Danh sách bầu cử</Link></li>
        <li className="hover:text-blue-500 cursor-pointer"><Link to="/result">Kết quả bầu cử</Link></li>
      </ul>
    </div>
  ) 
}

export default HeaderComponent
