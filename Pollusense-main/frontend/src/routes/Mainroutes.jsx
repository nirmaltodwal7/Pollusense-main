import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import Map from './../pages/Map';
import About from './../pages/About';
import Dashboard from '../pages/Dashboard';
import Contact from './../pages/Contact';


const Mainroutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/map' element={<Map />} />
      <Route path='/about' element={<About />} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path="/contact" element={<Contact />} />
      <Route path='*' element={<div>404 Not Found</div>} />
    </Routes>
  )
}

export default Mainroutes