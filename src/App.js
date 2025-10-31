// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import Home from './pages/Home';
import DaftarTrip from './pages/DaftarTrip';
import Trip from './pages/Trip';
import Logistik from './pages/Logistik';
import ROP from './pages/ROP';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { AuthProvider, ProtectedRoute, useAuth } from './auth';
import AuthForm from './components/AuthForm';

function Shell({ children }) {
  // AMBIL displayName dari context
  const { user, displayName, signOut } = useAuth();

  return (
    <>
      <header className="app-header">
        <div className="container">
          <nav className="nav">
            <div style={{fontWeight:800, letterSpacing:.2}}>HikeMate</div>
            <Link to="/">Home</Link>
            <Link to="/daftartrip">Daftar Trip</Link>
            <Link to="/trip">Buat Trip</Link>

            <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:12}}>
              {user ? (
                <>
                  <span style={{fontSize:14}}>
                    Hi, <b>{displayName || user.getUsername()}</b>
                  </span>
                  <button className="btn btn-ghost" onClick={signOut}>Logout</button>
                </>
              ) : (
                <Link to="/login">
                  <button className="btn btn-ghost">Login</button>
                </Link>
              )}
            </div>
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


function LogistikRoute() {
  const { tripId } = useParams();
  return <Logistik key={tripId} />;
}
function ROPRoute() {
  const { tripId } = useParams();
  return <ROP key={tripId} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Shell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<AuthForm />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* proteksi halaman yang perlu login */}
            <Route path="/daftartrip" element={<ProtectedRoute element={<DaftarTrip />} />} />
            <Route path="/trip" element={<ProtectedRoute element={<Trip />} />} />
            <Route path="/logistik/:tripId" element={<ProtectedRoute element={<LogistikRoute />} />} />
            <Route path="/rop/:tripId" element={<ProtectedRoute element={<ROPRoute />} />} />
            <Route path="*" element={<div className="card">404 — Halaman tidak ditemukan</div>} />
          </Routes>
        </Shell>
      </Router>
    </AuthProvider>
  );
}
