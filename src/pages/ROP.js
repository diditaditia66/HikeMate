import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createROP, getROP, getTrip } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ROP(){
  const { tripId } = useParams();
  const [trip,setTrip]=useState(null);
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState(null);

  // ⬇️ tambahkan startTime, endTime, notes
  const [form,setForm]=useState({
    date:'', startTime:'', endTime:'', activity:'', personInCharge:'', notes:''
  });

  useEffect(()=>{
    (async()=>{
      setLoading(true); setErr(null);
      try{
        const [t, data] = await Promise.all([ getTrip(tripId), getROP(tripId) ]);
        setTrip(t || null);
        setItems(Array.isArray(data)?data:[]);
      }catch(e){ setErr('Gagal memuat ROP'); }
      finally{ setLoading(false); }
    })();
  },[tripId]);

  const minDate = trip?.startDate || '';
  const maxDate = trip?.endDate || '';
  const peopleOptions = useMemo(()=> (trip?.participants || []).map(p=>p.name).filter(Boolean), [trip]);

  const setField=(k,v)=> setForm(s=>({...s,[k]:v}));

  const onSubmit = async (e)=>{
    e.preventDefault();
    if(!form.date || !form.activity) return alert('Tanggal & kegiatan wajib diisi.');
    if(form.startTime && form.endTime && form.startTime > form.endTime){
      return alert('Waktu mulai harus lebih awal atau sama dengan waktu selesai.');
    }
    try{
      const payload = {
        date: form.date,
        startTime: form.startTime || null,
        endTime: form.endTime || null,
        activity: form.activity,
        personInCharge: form.personInCharge || '',
        notes: form.notes || ''
      };
      const created = await createROP(tripId, payload);
      setItems([...items, created || payload]);
      setForm({ date:'', startTime:'', endTime:'', activity:'', personInCharge:'', notes:'' });
    }catch(_){ alert('Gagal menambah ROP'); }
  };

  // Group by date for nicer view
  const grouped = useMemo(()=>{
    const by = {};
    // urutkan dulu by date & time
    const sorted = [...items].sort((a,b)=>{
      if (a.date === b.date) return (a.startTime||'') < (b.startTime||'') ? -1 : 1;
      return a.date < b.date ? -1 : 1;
    });
    for(const it of sorted){
      const key = it.date || '—';
      if(!by[key]) by[key]=[];
      by[key].push(it);
    }
    return by;
  },[items]);

  const timeRangeOf = (r) => {
    if (r.startTime && r.endTime) return `${r.startTime} - ${r.endTime}`;
    return r.startTime || r.endTime || '-';
  };

  const downloadPDF = ()=>{
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`ROP — ${trip?.name || `Trip ${tripId}`}`, 14, 14);

    const rows = [...items]
      .sort((a,b)=> (a.date===b.date ? (a.startTime||'') < (b.startTime||'') ? -1 : 1 : (a.date<b.date? -1:1)))
      .map(r => [
        r.date,
        timeRangeOf(r),
        r.activity,
        r.personInCharge || '-',
        r.notes || '-'
      ]);

    autoTable(doc, {
      head: [['Tanggal','Waktu','Kegiatan','PIC','Keterangan']],
      body: rows,
      startY: 20,
      styles: { fontSize: 10 }
    });

    doc.save(`rop_trip_${tripId}.pdf`);
  };

  return (
    <div>
      <h1>Rencana Operasional Perjalanan (ROP) — Trip {trip?.name || tripId}</h1>

      {loading ? (
        <div className="card">Memuat…</div>
      ) : err ? (
        <div className="card" style={{color:'crimson'}}>{err}</div>
      ) : (
        <>
          <div className="card" style={{display:'flex', justifyContent:'flex-end'}}>
            <button className="btn btn-secondary" onClick={downloadPDF}>Download PDF</button>
          </div>

          <div className="card">
            {Object.keys(grouped).length===0 ? (
              <div>Belum ada ROP.</div>
            ) : (
              Object.entries(grouped).map(([d,rows])=>(
                <div key={d} className="mt-16">
                  <div style={{fontWeight:800}}>{d}</div>
                  <table className="table mt-8">
                    <thead>
                      <tr>
                        <th>Waktu</th><th>Kegiatan</th><th>PIC</th><th>Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r,idx)=>(
                        <tr key={idx}>
                          <td>{timeRangeOf(r)}</td>
                          <td>{r.activity}</td>
                          <td>{r.personInCharge || '-'}</td>
                          <td>{r.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>

          <div className="card mt-16">
            <h3 className="m-0">Tambah ROP Baru</h3>
            <form onSubmit={onSubmit} className="mt-16">
              <div className="row">
                <div className="col">
                  <label className="label">Tanggal</label>
                  <input type="date" min={minDate} max={maxDate} className="input"
                         value={form.date} onChange={e=>setField('date',e.target.value)} required />
                </div>
                <div className="col" style={{maxWidth:160}}>
                  <label className="label">Mulai</label>
                  <input type="time" className="input"
                         value={form.startTime} onChange={e=>setField('startTime',e.target.value)} />
                </div>
                <div className="col" style={{maxWidth:160}}>
                  <label className="label">Selesai</label>
                  <input type="time" className="input"
                         value={form.endTime} onChange={e=>setField('endTime',e.target.value)} />
                </div>
              </div>

              <label className="label">Kegiatan</label>
              <input className="input" value={form.activity} onChange={e=>setField('activity',e.target.value)} required />

              <label className="label">Penanggung Jawab (PIC)</label>
              <select className="select" value={form.personInCharge} onChange={e=>setField('personInCharge',e.target.value)}>
                <option value="">— pilih (opsional) —</option>
                {peopleOptions.map((n,i)=> <option key={i} value={n}>{n}</option>)}
              </select>

              <label className="label">Keterangan</label>
              <input className="input" placeholder="opsional" value={form.notes} onChange={e=>setField('notes',e.target.value)} />

              <div className="mt-16">
                <button className="btn btn-primary">Tambah ROP</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
