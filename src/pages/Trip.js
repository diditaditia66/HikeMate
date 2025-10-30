import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrip } from '../services/api';

export default function Trip(){
  const navigate = useNavigate();

  const [form,setForm] = useState({
    name:'',            // tujuan / nama trip
    startDate:'', endDate:'',
    peopleCount: 1,
    participants: [{ name:'', role:'' }]
  });
  const [submitting,setSubmitting]=useState(false);

  const setField = (k,v)=> setForm(s=>({...s,[k]:v}));

  const setParticipant = (idx, key, val)=>{
    const arr=[...form.participants];
    arr[idx]={...arr[idx],[key]:val};
    setForm(s=>({...s, participants:arr}));
  };
  const addParticipant = ()=> setForm(s=>({...s, participants:[...s.participants,{name:'',role:''}]}));
  const removeParticipant = (idx)=> setForm(s=>({...s, participants:s.participants.filter((_,i)=>i!==idx)}));

  const onSubmit = async (e)=>{
    e.preventDefault();
    if(!form.name || !form.startDate || !form.endDate) return alert('Nama & tanggal wajib diisi');
    setSubmitting(true);
    try{
      // kirim ke backend (tambahan field peopleCount & participants)
      const payload = {
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
        participantsCount: Number(form.peopleCount) || form.participants.length || 1,
        participants: form.participants
      };
      const trip = await createTrip(payload);
      alert('Trip dibuat!');
      navigate(`/logistik/${trip?.id ?? ''}`);
    }catch(err){
      alert('Gagal membuat trip');
    }finally{ setSubmitting(false); }
  };

  return (
    <div className="card">
      <h1 className="m-0">Buat Trip Baru</h1>

      <form onSubmit={onSubmit} className="mt-24">
        <label className="label">Tujuan / Nama Trip</label>
        <input className="input" value={form.name} onChange={e=>setField('name',e.target.value)} placeholder="Contoh: Gunung Rinjani" required />

        <div className="row">
          <div className="col">
            <label className="label">Mulai</label>
            <input type="date" className="input" value={form.startDate} onChange={e=>setField('startDate',e.target.value)} required />
          </div>
          <div className="col">
            <label className="label">Selesai</label>
            <input type="date" className="input" value={form.endDate} onChange={e=>setField('endDate',e.target.value)} required />
          </div>
          <div className="col" style={{maxWidth:200}}>
            <label className="label">Jumlah Orang</label>
            <input type="number" min="1" className="input" value={form.peopleCount}
              onChange={e=>setField('peopleCount', e.target.value)} />
          </div>
        </div>

        <div className="mt-24">
          <div style={{fontWeight:800, marginBottom:8}}>Peserta & Peran</div>
          {form.participants.map((p,idx)=>(
            <div key={idx} className="row" style={{alignItems:'end', marginBottom:8}}>
              <div className="col">
                <label className="label">Nama</label>
                <input className="input" value={p.name} onChange={e=>setParticipant(idx,'name',e.target.value)} placeholder="Nama peserta" />
              </div>
              <div className="col">
                <label className="label">Peran</label>
                <input className="input" value={p.role} onChange={e=>setParticipant(idx,'role',e.target.value)} placeholder="Leader, Medis, Logistik, dll" />
              </div>
              <div>
                <button type="button" className="btn btn-danger" onClick={()=>removeParticipant(idx)} disabled={form.participants.length<=1}>Hapus</button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-ghost mt-8" onClick={addParticipant}>+ Tambah Peserta</button>
        </div>

        <div className="mt-24">
          <button className="btn btn-primary" disabled={submitting}>{submitting?'Menyimpan…':'Buat Trip'}</button>
        </div>
      </form>
    </div>
  );
}
