import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrips } from '../services/api';

export default function Home(){
  const [trips,setTrips]=useState([]);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState(null);

  useEffect(()=>{
    (async()=>{
      try{
        const data = await getTrips();
        setTrips(Array.isArray(data)?data:[]);
      }catch(e){ setErr('Gagal memuat trip'); }
      finally{ setLoading(false); }
    })();
  },[]);

  if(loading) return <div className="card">Memuat daftar trip…</div>;
  if(err) return <div className="card" style={{color:'crimson'}}>{err}</div>;

  return (
    <div>
      <div className="row" style={{alignItems:'center', marginBottom:16}}>
        <h1 className="m-0">Daftar Trip Pendakian</h1>
        <div style={{marginLeft:'auto'}}>
          <Link to="/trip"><button className="btn btn-primary">Buat Trip Baru</button></Link>
        </div>
      </div>

      {trips.length===0 ? (
        <div className="card">Belum ada trip. Buat dulu ya.</div>
      ) : (
        trips.map((t)=>(
          <div key={t.id} className="card">
            <div className="row">
              <div className="col" style={{flex:'2 1 360px'}}>
                <div style={{fontWeight:800, fontSize:18}}>{t.name}</div>
                <div className="mt-8">
                  <span className="badge">{t.startDate || '—'} s/d {t.endDate || '—'}</span>
                </div>
                {!!(t.participants?.length || t.participantsCount) && (
                  <div className="mt-8" style={{color:'#475569', fontSize:14}}>
                    {t.participants?.length ?? t.participantsCount} orang peserta
                  </div>
                )}
              </div>
              <div style={{display:'flex', gap:8, alignItems:'center'}}>
                <Link to={`/logistik/${t.id}`}><button className="btn btn-ghost">Kelola Logistik</button></Link>
                <Link to={`/rop/${t.id}`}><button className="btn btn-primary">Kelola ROP</button></Link>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
