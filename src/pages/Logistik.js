import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { addLogistics, getLogistics, getTrip } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const fmtIDR = (n) => `IDR ${Number(n || 0).toLocaleString('id-ID')}`;

export default function Logistik(){
  const { tripId } = useParams();
  const [trip,setTrip]=useState(null);
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState(null);

  // ⬇️ unit ditambahkan ke form state
  const [form,setForm]=useState({ name:'', quantity:1, unit:'unit', price:0, description:'' });

  useEffect(()=>{
    (async()=>{
      setLoading(true); setErr(null);
      try{
        const [t, logs] = await Promise.all([
          getTrip(tripId),
          getLogistics(tripId)
        ]);
        setTrip(t || null);
        setItems(Array.isArray(logs)?logs:[]);
      }catch(e){ setErr('Gagal memuat logistik'); }
      finally{ setLoading(false); }
    })();
  },[tripId]);

  const peopleCount = useMemo(()=>{
    if(!trip) return 1;
    return trip.participantsCount || (trip.participants?.length) || 1;
  },[trip]);

  const total = useMemo(()=> items.reduce((s,i)=> s + (Number(i.price)||0)*(Number(i.quantity)||0), 0), [items]);
  const perPerson = useMemo(()=> total / Math.max(peopleCount,1), [total,peopleCount]);

  const setField=(k,v)=> setForm(s=>({...s,[k]: v}));

  const onSubmit = async (e)=>{
    e.preventDefault();
    if(!form.name || form.quantity<=0 || form.price<0) return alert('Nama, jumlah (>0), dan harga (>=0) wajib.');
    try{
      const payload = {
        name: form.name,
        quantity: Number(form.quantity),
        unit: (form.unit || 'unit').trim(),             // ⬅️ kirim satuan
        price: Number(form.price),
        description: form.description
      };
      const created = await addLogistics(tripId, payload);
      setItems([...items, created || payload]);
      setForm({ name:'', quantity:1, unit:'unit', price:0, description:'' });
    }catch(_){ alert('Gagal menambah logistik'); }
  };

  // ⬇️ Export PDF pakai autoTable(doc, ...)
  const downloadPDF = () => {
    const doc = new jsPDF();
    const title = `Logistik — ${trip?.name || `Trip ${tripId}`}`;
    doc.setFontSize(16);
    doc.text(title, 14, 14);

    autoTable(doc, {
      head: [['Barang', 'Jumlah', 'Satuan', 'Harga', 'Subtotal', 'Keterangan']],
      body: items.map(it => ([
        it.name,
        String(it.quantity ?? ''),
        it.unit || '-',
        fmtIDR(it.price),
        fmtIDR((Number(it.price||0) * Number(it.quantity||0))),
        it.description || '-'
      ])),
      startY: 20,
      styles: { fontSize: 10 }
    });

    const finalY = (doc.lastAutoTable?.finalY ?? 20) + 8;
    doc.setFontSize(12);
    doc.text(`Peserta: ${peopleCount} orang`, 14, finalY);
    doc.text(`Total: ${fmtIDR(total)}`, 14, finalY + 6);
    doc.text(`Per orang: ${fmtIDR(Math.round(perPerson))}`, 14, finalY + 12);

    doc.save(`logistik_trip_${tripId}.pdf`);
  };

  return (
    <div>
      <h1>List Logistik — Trip {trip?.name || tripId}</h1>

      {loading ? (
        <div className="card">Memuat…</div>
      ) : err ? (
        <div className="card" style={{color:'crimson'}}>{err}</div>
      ) : (
        <>
          <div className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div className="row" style={{flex:1}}>
              <div className="col"><div><b>Peserta</b></div><div className="mt-8">{peopleCount} orang</div></div>
              <div className="col"><div><b>Total Biaya</b></div><div className="mt-8">{fmtIDR(total)}</div></div>
              <div className="col"><div><b>Biaya per Orang</b></div><div className="mt-8">{fmtIDR(Math.round(perPerson))}</div></div>
            </div>
            <button className="btn btn-secondary" onClick={downloadPDF}>Download PDF</button>
          </div>

          <div className="card mt-16">
            <table className="table">
              <thead>
                <tr><th>Barang</th><th>Jumlah</th><th>Satuan</th><th>Harga</th><th>Subtotal</th><th>Keterangan</th></tr>
              </thead>
              <tbody>
                {items.map((it,idx)=>(
                  <tr key={it.id || idx}>
                    <td>{it.name}</td>
                    <td>{it.quantity}</td>
                    <td>{it.unit || '-'}</td>
                    <td>{fmtIDR(it.price)}</td>
                    <td>{fmtIDR((Number(it.price||0)*Number(it.quantity||0)))}</td>
                    <td>{it.description || '-'}</td>
                  </tr>
                ))}
                {items.length===0 && (
                  <tr><td colSpan="6" style={{color:'#6b7280'}}>Belum ada logistik.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card mt-16">
            <h3 className="m-0">Tambah Logistik Baru</h3>
            <form onSubmit={onSubmit} className="mt-16">
              <div className="row">
                <div className="col">
                  <label className="label">Nama Barang</label>
                  <input className="input" value={form.name} onChange={e=>setField('name',e.target.value)} required />
                </div>
                <div className="col" style={{maxWidth:140}}>
                  <label className="label">Jumlah</label>
                  <input type="number" min="1" className="input" value={form.quantity} onChange={e=>setField('quantity',e.target.value)} required />
                </div>
                <div className="col" style={{maxWidth:160}}>
                  <label className="label">Satuan</label>
                  <input className="input" value={form.unit} onChange={e=>setField('unit',e.target.value)} placeholder="unit/pcs/set/dll" />
                </div>
                <div className="col" style={{maxWidth:200}}>
                  <label className="label">Harga (IDR)</label>
                  <input type="number" min="0" className="input" value={form.price} onChange={e=>setField('price',e.target.value)} required />
                </div>
              </div>
              <label className="label">Keterangan</label>
              <input className="input" placeholder="opsional" value={form.description} onChange={e=>setField('description',e.target.value)} />
              <div className="mt-16">
                <button className="btn btn-primary">Tambah Logistik</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
