// src/auth.js
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { signIn as doSignIn, signOut as doSignOut, getCurrentSession } from './services/authService';
import { bindAuthTokenProvider } from './services/api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

// decode payload JWT sederhana (tanpa lib)
function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
}

// ambil 'name' dari atribut user (fallback)
async function fetchNameFromAttributes(cognitoUser) {
  return new Promise((resolve) => {
    if (!cognitoUser) return resolve(null);
    cognitoUser.getUserAttributes((err, attrs) => {
      if (err || !attrs) return resolve(null);
      const nameAttr = attrs.find((a) => a.getName() === 'name');
      const emailAttr = attrs.find((a) => a.getName() === 'email');
      resolve(nameAttr?.getValue() || emailAttr?.getValue() || null);
    });
  });
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    loading: true,
    user: null,
    idToken: null,
    displayName: null,
  });

  // simpan id timeout untuk auto-refresh token
  const refreshTimerRef = useRef(null);

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  // set jadwal refresh ~60 detik sebelum kadaluarsa
  const scheduleRefresh = (idToken) => {
    clearRefreshTimer();
    const claims = decodeJwtPayload(idToken);
    const expMs = (claims?.exp ? claims.exp * 1000 : Date.now() + 10 * 60 * 1000); // fallback 10 menit
    const now = Date.now();
    const ahead = 60 * 1000; // refresh 60 detik sebelum exp
    const delay = Math.max(expMs - now - ahead, 5000); // minimal 5 detik supaya aman

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const res = await getCurrentSession(); // minta sesi terbaru dari Cognito
        if (res?.session) {
          await applySession(res.user, res.session); // ini akan menjadwalkan ulang
        } else {
          // sesi sudah habis
          bindAuthTokenProvider(() => null);
          setState({ loading: false, user: null, idToken: null, displayName: null });
        }
      } catch {
        bindAuthTokenProvider(() => null);
        setState({ loading: false, user: null, idToken: null, displayName: null });
      }
    }, delay);
  };

  const applySession = async (user, session) => {
    const idToken = session.getIdToken().getJwtToken();
    const claims = decodeJwtPayload(idToken);

    // urutan prioritas sumber nama
    let displayName = claims.name || claims.given_name || null;
    if (!displayName) displayName = await fetchNameFromAttributes(user);
    if (!displayName) displayName = claims.email || user?.getUsername() || 'Pengguna';

    setState({ loading: false, user, idToken, displayName });

    // pastikan semua request API selalu pakai token terbaru
    bindAuthTokenProvider(() => idToken);

    // jadwalkan auto-refresh
    scheduleRefresh(idToken);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await getCurrentSession();
        if (res?.session) {
          await applySession(res.user, res.session);
        } else {
          setState({ loading: false, user: null, idToken: null, displayName: null });
          bindAuthTokenProvider(() => null);
        }
      } catch {
        setState({ loading: false, user: null, idToken: null, displayName: null });
        bindAuthTokenProvider(() => null);
      }
    })();

    // cleanup timer saat unmount
    return () => clearRefreshTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email, password) => {
    const { session, user } = await doSignIn(email, password);
    await applySession(user, session);
    return { user, idToken: session.getIdToken().getJwtToken() };
  };

  const signOut = () => {
    try {
      doSignOut();
    } catch {}
    clearRefreshTimer();
    setState({ loading: false, user: null, idToken: null, displayName: null });
    bindAuthTokenProvider(() => null);
  };

  return (
    <AuthCtx.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function ProtectedRoute({ element }) {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <div className="card">Memuat autentikasi…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return element;
}
