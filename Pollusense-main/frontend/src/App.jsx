import React from 'react'
import Navbar from './components/Navbar'
import Mainroutes from './routes/Mainroutes'
import Footer from './components/Footer'

const App = () => {
  return (
    <div className='bg-[#FDFDFD] p-[2rem]  w-screen h-fit'>
      <Navbar />
      <Mainroutes />
      <Footer />
    </div>
  )
}

export default App