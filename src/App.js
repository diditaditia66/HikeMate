import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import Home from './pages/Home';
import Trip from './pages/Trip';
import Logistik from './pages/Logistik';
import ROP from './pages/ROP';

function Shell({ children }) {
  return (
    <>
      <header className="app-header">
        <div className="container">
          <nav className="nav">
            <div style={{fontWeight:800, letterSpacing:.2}}>HikeMate</div>
            <Link to="/">Home</Link>
            <Link to="/trip">Buat Trip</Link>
          </nav>
        </div>
      </header>
      <main className="container" style={{paddingTop:24}}>{children}</main>
      <footer className="container app-footer">
        <p className="m-0 mt-16">© HikeMate</p>
      </footer>
    </>
  );
}

function LogistikRoute(){ const {tripId}=useParams(); return <Logistik key={tripId} />; }
function ROPRoute(){ const {tripId}=useParams(); return <ROP key={tripId} />; }

export default function App(){
  return (
    <Router>
      <Shell>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/trip" element={<Trip/>} />
          <Route path="/logistik/:tripId" element={<LogistikRoute/>} />
          <Route path="/rop/:tripId" element={<ROPRoute/>} />
          <Route path="*" element={<div className="card">404 — Halaman tidak ditemukan</div>} />
        </Routes>
      </Shell>
    </Router>
  );
}
