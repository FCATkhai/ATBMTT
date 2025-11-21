
import './App.css'
import { Route, Routes } from 'react-router'
import HeaderComponent from './components/HeaderComponent'
import FooterComponent from './components/FooterComponent'
import LoginPage from './pages/LoginPage'
import MainPage from './pages/MainPage'
import ElectionListPage from './pages/ElectionListPage'
import ElectionDetailPage from './pages/ElectionDetailPage'
import ResultDetailPage from './pages/ResultPage'

function App() {

  return (
    <>
      <header>
        <HeaderComponent />
      </header>
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 min-h-screen">
        <Routes>
          <Route path='/login' element={<LoginPage />}/>
          <Route path='/' element={<MainPage />}/>
          <Route path='/elections' element={<ElectionListPage />} />
          <Route path='/election/:electionId/vote' element={<ElectionDetailPage />} />
          <Route path='/election/:electionId/result' element={<ResultDetailPage />} />
        </Routes>
      </main>
      <footer>
        <FooterComponent />
      </footer>
    </>
  )
}

export default App
