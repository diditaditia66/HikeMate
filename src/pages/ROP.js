// src/pages/ROP.js
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createROP, getROP, getTrip } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ===== Modal konfirmasi kecil =====
function ConfirmModal({ open, title, desc, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.25)',
        display: 'grid', placeItems: 'center', zIndex: 50
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{ width: 420, maxWidth: '92vw', padding: 18 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontWeight: 800, fontSize: 18 }}>{title}</div>
        <p style={{ marginTop: 8, color: '#475569' }}>{desc}</p>
        <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button className="btn btn-ghost" onClick={onCancel}>Batal</button>
          <button className="btn btn-danger" onClick={onConfirm}>Hapus</button>
        </div>
      </div>
    </div>
  );
}

const timeRangeOf = (r) =>
  r.startTime && r.endTime ? `${r.startTime} - ${r.endTime}` : (r.startTime || r.endTime || '—');

export default function ROP() {
  const nav = useNavigate();
  const { tripId } = useParams();

  const [trip, setTrip] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // form
  const [form, setForm] = useState({
    date: '', startTime: '', endTime: '', activity: '', personInCharge: '', notes: ''
  });

  // modal hapus
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setErr(null);
      try {
        const [t, data] = await Promise.all([getTrip(tripId), getROP(tripId)]);
        setTrip(t || null);
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e?.status === 401) return nav('/login');
        setErr('Gagal memuat ROP');
      } finally {
        setLoading(false);
      }
    })();
  }, [tripId, nav]);

  const minDate = trip?.startDate || '';
  const maxDate = trip?.endDate || '';
  const peopleOptions = useMemo(
    () => (trip?.participants || []).map((p) => p.name).filter(Boolean),
    [trip]
  );

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.activity) return alert('Tanggal & kegiatan wajib diisi.');
    if (form.startTime && form.endTime && form.startTime > form.endTime) {
      return alert('Waktu mulai harus ≤ waktu selesai.');
    }
    try {
      const payload = {
        date: form.date,
        startTime: form.startTime || null,
        endTime: form.endTime || null,
        activity: form.activity.trim(),
        personInCharge: form.personInCharge || '',
        notes: (form.notes || '').trim()
      };
      const created = await createROP(tripId, payload);
      setItems([...items, created || payload]);
      setForm({ date: '', startTime: '', endTime: '', activity: '', personInCharge: '', notes: '' });
    } catch {
      alert('Gagal menambah ROP');
    }
  };

  // ====== Delete: panggil endpoint via fetch (tanpa menunggu update api.js) ======
  const doDelete = async (row) => {
    try {
      // pakai fetch agar tidak bergantung perubahan services; jika sudah menambah api.deleteROP, boleh ganti
      const token = localStorage.getItem('hikemate_id_token') || '';
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'https://server.cartenz-vpn.my.id/api'}/trips/${tripId}/rop/${row.id}`,
        { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      if (!res.ok) throw new Error('delete failed');
      setItems((arr) => arr.filter((it) => it.id !== row.id));
    } catch {
      alert('Gagal menghapus item ROP');
    } finally {
      setModalOpen(false);
      setPendingDelete(null);
    }
  };

  // urutkan & group by date untuk tampilan
  const grouped = useMemo(() => {
    const by = {};
    const sorted = [...items].sort((a, b) => {
      if (a.date === b.date) return (a.startTime || '') < (b.startTime || '') ? -1 : 1;
      return a.date < b.date ? -1 : 1;
    });
    for (const it of sorted) {
      const key = it.date || '—';
      if (!by[key]) by[key] = [];
      by[key].push(it);
    }
    return by;
  }, [items]);

  // ====== PDF yang rapi ======
  const downloadPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 40;
    const marginY = 48;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(`ROP — ${trip?.name || `Trip ${tripId}`}`, marginX, marginY);

    const rows = [...items]
      .sort((a, b) => (a.date === b.date ? ((a.startTime || '') < (b.startTime || '') ? -1 : 1) : (a.date < b.date ? -1 : 1)))
      .map((r) => [r.date, timeRangeOf(r), r.activity, r.personInCharge || '-', r.notes || '-']);

    autoTable(doc, {
      startY: marginY + 16,
      head: [['Tanggal', 'Waktu', 'Kegiatan', 'PIC', 'Keterangan']],
      body: rows,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 6, lineColor: [230, 230, 230] },
      headStyles: { fillColor: [16, 110, 190], textColor: 255, halign: 'left', fontSize: 10.5 },
      alternateRowStyles: { fillColor: [248, 249, 251] },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 90 },
        2: { cellWidth: 210 },
        3: { cellWidth: 80 },
        4: { cellWidth: 'auto' }
      },
      margin: { left: marginX, right: marginX }
    });

    const ts = new Date().toLocaleString('id-ID');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(120);
    doc.text(`Dibuat: ${ts}`, marginX, doc.internal.pageSize.getHeight() - 20);

    doc.save(`rop_${(trip?.name || `trip_${tripId}`).replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) return <div className="card">Memuat…</div>;
  if (err) return <div className="card" style={{ color: 'crimson' }}>{err}</div>;

  return (
    <div>
      {/* Header */}
      <div className="row" style={{ alignItems: 'center', gap: 12 }}>
        <h1 className="m-0">Rencana Operasional Perjalanan (ROP) — Trip {trip?.name || tripId}</h1>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-secondary" onClick={downloadPDF}>Download PDF</button>
        </div>
      </div>

      {/* Tabel per tanggal */}
      <div className="card" style={{ paddingTop: 8 }}>
        {Object.keys(grouped).length === 0 ? (
          <div>Belum ada ROP.</div>
        ) : (
          Object.entries(grouped).map(([d, rows]) => (
            <div key={d} className="mt-16">
              <div
                style={{
                  fontWeight: 800, fontSize: 14, color: '#0f172a',
                  background: '#f8fafc', border: '1px solid #eef2f7',
                  padding: '8px 12px', borderRadius: 8
                }}
              >
                {d}
              </div>
              <table className="table mt-8" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: 130 }}>Waktu</th>
                    <th>Kegiatan</th>
                    <th style={{ width: 140 }}>PIC</th>
                    <th style={{ width: 240 }}>Keterangan</th>
                    <th style={{ width: 90 }} />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{timeRangeOf(r)}</td>
                      <td>{r.activity}</td>
                      <td>{r.personInCharge || '-'}</td>
                      <td>{r.notes || '-'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-danger"
                          onClick={() => { setPendingDelete(r); setModalOpen(true); }}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>

      {/* Form tambah */}
      <div className="card mt-16">
        <div className="row" style={{ alignItems: 'center' }}>
          <h3 className="m-0">Tambah ROP Baru</h3>
          <div style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 13 }}>
            Isi tanggal & waktu dengan benar ya.
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-16">
          <div className="row" style={{ gap: 12 }}>
            <div className="col" style={{ minWidth: 220 }}>
              <label className="label">Tanggal</label>
              <input
                type="date"
                min={minDate}
                max={maxDate}
                className="input"
                value={form.date}
                onChange={(e) => setField('date', e.target.value)}
                required
              />
            </div>
            <div className="col" style={{ maxWidth: 160 }}>
              <label className="label">Mulai</label>
              <input type="time" className="input"
                value={form.startTime} onChange={(e) => setField('startTime', e.target.value)} />
            </div>
            <div className="col" style={{ maxWidth: 160 }}>
              <label className="label">Selesai</label>
              <input type="time" className="input"
                value={form.endTime} onChange={(e) => setField('endTime', e.target.value)} />
            </div>
          </div>

          <label className="label mt-12">Kegiatan</label>
          <input className="input" value={form.activity}
            onChange={(e) => setField('activity', e.target.value)} required />

          <label className="label">Penanggung Jawab (PIC)</label>
          <select className="select" value={form.personInCharge}
            onChange={(e) => setField('personInCharge', e.target.value)}>
            <option value="">— pilih (opsional) —</option>
            {peopleOptions.map((n, i) => <option key={i} value={n}>{n}</option>)}
          </select>

          <label className="label">Keterangan</label>
          <input className="input" placeholder="opsional"
            value={form.notes} onChange={(e) => setField('notes', e.target.value)} />

          <div className="mt-16">
            <button className="btn btn-primary">Tambah ROP</button>
          </div>
        </form>
      </div>

      {/* Modal konfirmasi hapus */}
      <ConfirmModal
        open={modalOpen}
        title="Hapus item ROP?"
        desc={pendingDelete ? `Kegiatan: “${pendingDelete.activity}” pada ${pendingDelete.date}.` : ''}
        onCancel={() => { setModalOpen(false); setPendingDelete(null); }}
        onConfirm={() => doDelete(pendingDelete)}
      />
    </div>
  );
}
