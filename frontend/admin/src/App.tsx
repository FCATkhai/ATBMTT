
import './App.css'
import { Route, Routes} from 'react-router'
// import HeaderComponent from './components/HeaderComponent'
// import FooterComponent from './components/FooterComponent'
import LoginPage from './pages/LoginPage'
import MainPage from './pages/MainPage'
import SignUpPage from './pages/SignUpPage'
import AdminRoute from './routers/AdminRoute'

function App() {

  return (
    <>
      {/* <header>
        <HeaderComponent />
      </header> */}
      <main>
        <Routes>
          <Route path='/login' element={<LoginPage />}/>
          <Route path='/signup' element={<SignUpPage />} />
          {/* <Route path='/' element={<AdminRoute element={<MainPage />} />} /> */}
          <Route path='/' element={<MainPage />}/>
        </Routes>
      </main>
      {/* <footer>
        <FooterComponent />
      </footer> */}
    </>
  )
}

export default App
