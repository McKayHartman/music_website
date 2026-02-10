import { useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'

// Components
import Navbar from '../components/Navbar.jsx'

// Pages
import Home from '../pages/Home.jsx'
import About from '../pages/About.jsx'
import Login from '../pages/Login.jsx'
import CreateAccount from '../pages/CreateAccount.jsx'
import MyAccount from '../pages/MyAccount.jsx'
import Footer from '../components/Footer.jsx'
import AdminDashboard from '../pages/AdminDashboard.jsx'
import UploadPage from '../pages/UploadPage.jsx'
import Browse from '../pages/Browse.jsx'

function App() {

  return (
    <BrowserRouter>
      <Navbar />
      <main className='pt-16 min-h-screen'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path='admin' element={<AdminDashboard />} />
          <Route path='/music' element={<Browse />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}

export default App
