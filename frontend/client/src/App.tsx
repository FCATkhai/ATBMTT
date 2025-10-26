
import './App.css'
import { Route, Routes } from 'react-router'
import HeaderComponent from './components/HeaderComponent'
import FooterComponent from './components/FooterComponent'
import LoginPage from './pages/LoginPage'
import MainPage from './pages/MainPage'

function App() {

  return (
    <>
      <header>
        <HeaderComponent />
      </header>
      <main>
        <Routes>
          <Route path='/login' element={<LoginPage />}/>
          <Route path='/main' element={<MainPage />}/>
        </Routes>
      </main>
      <footer>
        <FooterComponent />
      </footer>
    </>
  )
}

export default App
