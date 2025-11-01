
import './App.css'
import { Route, Routes} from 'react-router'
import LoginPage from './pages/LoginPage'
import MainPage from './pages/MainPage'
import SignUpPage from './pages/SignUpPage'
import AdminRoute from './routers/AdminRoute'
import HeaderComponent from './components/HeaderComponent'
import ResultPage from './pages/ResultPage'
import { useSelector } from 'react-redux'
import { RootState } from './store/store'

function App() {

  const { user } = useSelector((state: RootState) => state.auth)
  const isLoggedIn = !!user

  return (
    <div className="grid grid-cols-12 h-screen">
      {isLoggedIn && (
        <div className="col-span-2">
          <HeaderComponent />
        </div>
      )}
      <div className={isLoggedIn ? "col-span-10" : "col-span-12"}> 
        <Routes>
          {/* Các Route không cần đăng nhập */}
          <Route path='/login' element={<LoginPage />}/>
          <Route path='/signup' element={<SignUpPage />} />
          
          {/* Các Route cần đăng nhập (AdminRoute) */}
          <Route path='/' element={<AdminRoute element={<MainPage />}/>}/>
          <Route path='/result' element={<AdminRoute element={<ResultPage />}/>}/>
        </Routes>
        {/* <footer> */}
        {/* <FooterComponent /> */}
        {/* </footer> */}
      </div>
    </div>
  );
}

export default App
