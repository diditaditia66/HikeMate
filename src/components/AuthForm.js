// src/components/AuthForm.js
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { signUp, confirmSignUp, resendConfirmationCode } from '../services/authService';

function pwChecks(pw) {
  return {
    len: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    num: /[0-9]/.test(pw),
    sym: /[^A-Za-z0-9]/.test(pw),
    space: !/\s/.test(pw),
  };
}

export default function AuthForm() {
  const { signIn, user, signOut, displayName } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('login');     // 'login' | 'signup'
  const [stage, setStage] = useState('form');  // 'form' | 'confirm'

  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [agree, setAgree]       = useState(false);
  const [code, setCode]         = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [busy, setBusy]         = useState(false);
  const [note, setNote]         = useState({ type: '', text: '' }); // 'error' | 'success'

  const checks   = useMemo(()=>pwChecks(password), [password]);
  const pwValid  = checks.len && checks.upper && checks.lower && checks.num && checks.sym && checks.space;
  const pwMatch  = password && password2 && password === password2;
  const nameOk   = fullName.trim().length >= 3; // minimal 3 karakter

  const canLogin   = useMemo(() => email && password && !busy, [email, password, busy]);
  const canSignup  = useMemo(
    () => nameOk && email && pwValid && pwMatch && agree && !busy,
    [nameOk, email, pwValid, pwMatch, agree, busy]
  );
  const canConfirm = useMemo(() => email && code && !busy, [email, code, busy]);

  if (user) {
    return (
      <div className="auth-wrap center">
        <div className="card" style={{maxWidth: 440, width: '100%'}}>
          <div style={{fontWeight:800, fontSize:22}}>HikeMate</div>
          <div className="mt-8" style={{color:'#334155', fontSize:16}}>Anda sudah masuk</div>
          <p className="mt-8" style={{color:'var(--muted)'}}>Sebagai <b>{displayName}</b></p>
          <div className="row mt-16">
            <button className="btn btn-ghost" onClick={signOut}>Keluar</button>
            <button className="btn btn-primary" onClick={()=>navigate('/')}>Ke Beranda</button>
          </div>
        </div>
      </div>
    );
  }

  const setInfo = (type, text) => setNote({ type, text });

  const handleLogin = async () => {
    setInfo('', ''); setBusy(true);
    try {
      await signIn(email.trim(), password);
      // navigate('/'); // aktifkan jika ingin redirect otomatis
    } catch (e) {
      if (e.code === 'UserNotConfirmedException') {
        setStage('confirm');
        setInfo('error','Akun belum terkonfirmasi. Masukkan kode yang dikirim ke email.');
      } else {
        setInfo('error', e.message || 'Gagal login');
      }
    } finally { setBusy(false); }
  };

  const handleSignup = async () => {
    setInfo('', ''); setBusy(true);
    try {
      await signUp(email.trim(), password, { name: fullName.trim() }); // <-- kirim nama ke Cognito
      setStage('confirm');
      setInfo('success','Pendaftaran berhasil. Kode konfirmasi telah dikirim ke email.');
    } catch (e) {
      setInfo('error', e.message || 'Gagal mendaftar');
    } finally { setBusy(false); }
  };

  const handleConfirm = async () => {
    setInfo('', ''); setBusy(true);
    try {
      await confirmSignUp(email.trim(), code.trim());
      setInfo('success','Berhasil dikonfirmasi. Silakan login.');
      setStage('form');
      setTab('login');
      setCode('');
    } catch (e) {
      setInfo('error', e.message || 'Konfirmasi gagal');
    } finally { setBusy(false); }
  };

  const handleResend = async () => {
    setInfo('', ''); setBusy(true);
    try {
      await resendConfirmationCode(email.trim());
      setInfo('success','Kode konfirmasi telah dikirim ulang.');
    } catch (e) {
      setInfo('error', e.message || 'Gagal mengirim ulang kode');
    } finally { setBusy(false); }
  };

  return (
    <div className="auth-wrap center" style={{padding:'24px'}}>
      <div className="card" style={{maxWidth: 520, width:'100%'}}>
        <div style={{fontWeight:800, fontSize:22, letterSpacing:.3}}>HikeMate</div>
        <div className="mt-8" style={{color:'#334155', fontSize:18}}>
          {stage==='confirm' ? 'Konfirmasi Akun' : (tab==='login' ? 'Selamat datang' : 'Buat akun baru')}
        </div>

        {/* Tabs: hanya Masuk / Daftar */}
        {stage==='form' && (
          <div className="tabs mt-16">
            <button
              className={`tab ${tab==='login'?'active':''}`}
              onClick={()=>setTab('login')}
            >Masuk</button>
            <button
              className={`tab ${tab==='signup'?'active':''}`}
              onClick={()=>setTab('signup')}
            >Daftar</button>
          </div>
        )}

        {/* Alert */}
        {note.text && (
          <div
            className="mt-16"
            style={{
              borderRadius:10, padding:'10px 12px', fontSize:14,
              border:'1px solid',
              background: note.type==='error' ? '#fef2f2' : '#f0fdf4',
              borderColor: note.type==='error' ? '#fecaca' : '#bbf7d0',
              color: note.type==='error' ? '#991b1b' : '#166534',
            }}
          >
            {note.text}
          </div>
        )}

        {/* ========== FORM LOGIN / SIGNUP ========== */}
        {stage==='form' && (
          <>
            {tab==='signup' && (
              <>
                <label className="label">Nama Lengkap</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Nama lengkap sesuai identitas"
                  value={fullName}
                  onChange={(e)=>setFullName(e.target.value)}
                  autoComplete="name"
                />
                <div className="mt-8" style={{fontSize:13, color: nameOk ? '#166534' : 'var(--muted)'}}>
                  {fullName ? (nameOk ? '✔ Nama terlihat valid' : '✖ Nama terlalu pendek') : 'Masukkan nama lengkap'}
                </div>
              </>
            )}

            {/* Email */}
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              autoComplete="email"
            />

            {/* Password + (ulang) */}
            <label className="label">Password{tab==='signup' ? ' (buat password)' : ''}</label>
            <div style={{display:'flex', gap:8}}>
              <input
                className="input"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                autoComplete={tab==='login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={()=>setShowPw(s=>!s)}
                style={{whiteSpace:'nowrap'}}
              >
                {showPw ? 'Sembunyi' : 'Lihat'}
              </button>
            </div>

            {tab==='signup' && (
              <>
                <label className="label">Ulangi Password</label>
                <input
                  className="input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Ulangi password"
                  value={password2}
                  onChange={(e)=>setPassword2(e.target.value)}
                  autoComplete="new-password"
                />

                {/* Daftar aturan password */}
                <ul className="mt-8" style={{listStyle:'none', padding:0, fontSize:13, color:'var(--muted)'}}>
                  <li>{checks.len   ? '✅' : '❌'} Minimal 8 karakter</li>
                  <li>{checks.upper ? '✅' : '❌'} Ada huruf <b>besar</b></li>
                  <li>{checks.lower ? '✅' : '❌'} Ada huruf <b>kecil</b></li>
                  <li>{checks.num   ? '✅' : '❌'} Ada <b>angka</b></li>
                  <li>{checks.sym   ? '✅' : '❌'} Ada <b>simbol</b></li>
                </ul>

                <div className="mt-8" style={{fontSize:13, color: pwMatch ? '#166534' : '#991b1b'}}>
                  {password2 ? (pwMatch ? '✔ Password cocok' : '✖ Ulangi password belum cocok') : 'Ulangi password untuk konfirmasi'}
                </div>

                {/* Checkbox persetujuan */}
                <label className="mt-16" style={{display:'flex', gap:10, alignItems:'center', fontSize:14}}>
                  <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} />
                  <span>
                    Saya menyetujui{' '}
                    <Link to="/terms" style={{color:'var(--brand)'}}>Ketentuan</Link>
                    {' '}&{' '}
                    <Link to="/privacy" style={{color:'var(--brand)'}}>Kebijakan Privasi</Link>.
                  </span>
                </label>
              </>
            )}

            {/* Actions */}
            <div className="row mt-16" style={{gap:8}}>
              {tab==='login' ? (
                <button className="btn btn-primary" onClick={handleLogin} disabled={!canLogin}>
                  {busy ? 'Memproses…' : 'Masuk'}
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleSignup} disabled={!canSignup}>
                  {busy ? 'Memproses…' : 'Daftar'}
                </button>
              )}
            </div>
          </>
        )}

        {/* ========== LANGKAH KONFIRMASI ========== */}
        {stage==='confirm' && (
          <>
            <div className="mt-16" style={{fontSize:14, color:'var(--muted)'}}>
              Kami telah mengirim <b>kode konfirmasi</b> ke email <b>{email}</b>.
              Masukkan kode di bawah untuk mengaktifkan akun.
            </div>

            <label className="label">Kode Konfirmasi</label>
            <input
              className="input"
              placeholder="Masukkan 6 digit kode"
              value={code}
              onChange={(e)=>setCode(e.target.value)}
              inputMode="numeric"
            />

            <div className="row mt-16" style={{gap:8}}>
              <button className="btn btn-primary" onClick={handleConfirm} disabled={!canConfirm}>
                {busy ? 'Memproses…' : 'Konfirmasi'}
              </button>
              <button className="btn btn-ghost" onClick={handleResend} disabled={busy || !email}>
                Kirim Ulang Kode
              </button>
              <button className="btn" onClick={()=>{ setStage('form'); setTab('login'); }}>
                Kembali ke Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
