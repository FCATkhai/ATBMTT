
import './App.css'
import { Route, Routes} from 'react-router'
import LoginPage from './pages/LoginPage'
import MainPage from './pages/MainPage'
import SignUpPage from './pages/SignUpPage'
import AdminRoute from './routers/AdminRoute'
import HeaderComponent from './components/HeaderComponent'
import ResultPage from './pages/ResultPage'

function App() {

  return (
    <div className="grid grid-cols-12 h-screen">
      <div className="col-span-2">
        <HeaderComponent />
      </div>
      <div className="col-span-10"> 
          <Routes>
            <Route path='/login' element={<LoginPage />}/>
            <Route path='/signup' element={<SignUpPage />} />
            <Route path='/' element={<MainPage />}/>
            <Route path='/result' element={<ResultPage />}/>
          </Routes>
        {/* <footer> */}
        {/* <FooterComponent /> */}
        {/* </footer> */}
      </div>
    </div>
  );
}

export default App
