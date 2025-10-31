// src/pages/Logistik.js
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addLogistics, getLogistics, getTrip, deleteLogistics } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const fmtIDR = (n) => `IDR ${Number(n || 0).toLocaleString('id-ID')}`;

export default function Logistik() {
  const nav = useNavigate();
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // form tambah
  const [form, setForm] = useState({
    name: '',
    quantity: 1,
    unit: 'unit',
    price: 0,
    description: '',
  });

  // --- state untuk konfirmasi hapus ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [target, setTarget] = useState(null); // { id, name }

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [t, logs] = await Promise.all([getTrip(tripId), getLogistics(tripId)]);
        setTrip(t || null);
        setItems(Array.isArray(logs) ? logs : []);
      } catch (e) {
        if (e.status === 401) return nav('/login');
        setErr('Gagal memuat logistik');
      } finally {
        setLoading(false);
      }
    })();
  }, [tripId, nav]);

  const peopleCount = useMemo(() => {
    if (!trip) return 1;
    return trip.participantsCount || trip.participants?.length || 1;
  }, [trip]);

  const total = useMemo(
    () => items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0),
    [items]
  );
  const perPerson = useMemo(() => total / Math.max(peopleCount, 1), [total, peopleCount]);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.quantity <= 0 || form.price < 0)
      return alert('Nama, jumlah (>0), dan harga (>=0) wajib.');
    try {
      const payload = {
        name: form.name.trim(),
        quantity: Number(form.quantity),
        unit: (form.unit || 'unit').trim(),
        price: Number(form.price),
        description: (form.description || '').trim(),
      };
      const created = await addLogistics(tripId, payload);
      setItems((prev) => [...prev, created || payload]);
      setForm({ name: '', quantity: 1, unit: 'unit', price: 0, description: '' });
    } catch (e) {
      if (e.status === 401) return nav('/login');
      alert('Gagal menambah logistik');
    }
  };

  // ========= PDF =========
  const downloadPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 40;
    const marginY = 48;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(`Logistik — ${trip?.name || `Trip ${tripId}`}`, marginX, marginY);

    const yBox = marginY + 16;
    const boxW = 515;
    const boxH = 58;
    doc.setDrawColor(224);
    doc.setFillColor(248, 249, 251);
    doc.roundedRect(marginX, yBox, boxW, boxH, 6, 6, 'F');

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('Peserta', marginX + 14, yBox + 20);
    doc.text('Total Biaya', marginX + 180, yBox + 20);
    doc.text('Biaya per Orang', marginX + 360, yBox + 20);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30);
    doc.text(`${peopleCount} orang`, marginX + 14, yBox + 40);
    doc.text(fmtIDR(total), marginX + 180, yBox + 40);
    doc.text(fmtIDR(Math.round(perPerson)), marginX + 360, yBox + 40);

    autoTable(doc, {
      startY: yBox + boxH + 18,
      head: [['Barang', 'Jumlah', 'Satuan', 'Harga', 'Subtotal', 'Ket.']],
      body: items.map((it) => [
        it.name,
        String(it.quantity ?? ''),
        it.unit || '-',
        fmtIDR(it.price),
        fmtIDR((Number(it.price || 0) * Number(it.quantity || 0)) || 0),
        it.description || '-',
      ]),
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 6, lineColor: [230, 230, 230] },
      headStyles: { fillColor: [16, 110, 190], textColor: 255, halign: 'left', fontSize: 10.5 },
      alternateRowStyles: { fillColor: [248, 249, 251] },
      columnStyles: {
        0: { cellWidth: 180 },
        1: { cellWidth: 60, halign: 'right' },
        2: { cellWidth: 60 },
        3: { cellWidth: 80, halign: 'right' },
        4: { cellWidth: 90, halign: 'right' },
        5: { cellWidth: 'auto' },
      },
      margin: { left: marginX, right: marginX },
    });

    const ts = new Date().toLocaleString('id-ID');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Dibuat: ${ts}`, marginX, doc.internal.pageSize.getHeight() - 20);

    doc.save(`logistik_${(trip?.name || `trip_${tripId}`).replace(/\s+/g, '_')}.pdf`);
  };

  // --- aksi hapus: buka modal ---
  const askDelete = (it) => {
    setTarget({ id: it.id, name: it.name });
    setConfirmOpen(true);
  };

  // --- konfirmasi hapus ---
  const doDelete = async () => {
    if (!target?.id) return;
    try {
      setDeleting(true);
      await deleteLogistics(tripId, target.id);
      setItems((list) => list.filter((x) => (x.id || x._tmp) !== target.id));
      setConfirmOpen(false);
    } catch (e) {
      if (e.status === 401) return nav('/login');
      alert('Gagal menghapus item');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="card">Memuat…</div>;
  if (err) return <div className="card" style={{ color: 'crimson' }}>{err}</div>;

  return (
    <div>
      {/* Header */}
      <div className="row" style={{ alignItems: 'center', gap: 12 }}>
        <h1 className="m-0">Logistik — Trip {trip?.name || tripId}</h1>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-secondary" onClick={downloadPDF}>Download PDF</button>
        </div>
      </div>

      {/* Summary */}
      <div
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        <SummaryItem label="Peserta" value={`${peopleCount} orang`} />
        <SummaryItem label="Total Biaya" value={fmtIDR(total)} />
        <SummaryItem label="Biaya per Orang" value={fmtIDR(Math.round(perPerson))} />
      </div>

      {/* Table */}
      <div className="card mt-16">
        <table className="table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Barang</th>
              <th style={{ width: 90, textAlign: 'right' }}>Jumlah</th>
              <th style={{ width: 100 }}>Satuan</th>
              <th style={{ width: 140, textAlign: 'right' }}>Harga</th>
              <th style={{ width: 160, textAlign: 'right' }}>Subtotal</th>
              <th>Keterangan</th>
              <th style={{ width: 110 }}></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ color: '#6b7280', textAlign: 'center' }}>
                  Belum ada logistik.
                </td>
              </tr>
            ) : (
              items.map((it, idx) => (
                <tr key={it.id || idx}>
                  <td>{it.name}</td>
                  <td style={{ textAlign: 'right' }}>{it.quantity}</td>
                  <td>{it.unit || '-'}</td>
                  <td style={{ textAlign: 'right' }}>{fmtIDR(it.price)}</td>
                  <td style={{ textAlign: 'right' }}>
                    {fmtIDR((Number(it.price || 0) * Number(it.quantity || 0)) || 0)}
                  </td>
                  <td>{it.description || '-'}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => askDelete(it)}>Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form tambah */}
      <div className="card mt-16">
        <div className="row" style={{ alignItems: 'center' }}>
          <h3 className="m-0">Tambah Logistik Baru</h3>
          <div style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 13 }}>
            Pastikan jumlah & satuan sesuai ya.
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-16">
          <div
            className="row"
            style={{
              alignItems: 'end',
              gap: 12,
              gridTemplateColumns: '2fr 0.6fr 0.8fr 1fr',
              display: 'grid',
            }}
          >
            <div>
              <label className="label">Nama Barang</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Jumlah</label>
              <input
                type="number"
                min="1"
                className="input"
                value={form.quantity}
                onChange={(e) => setField('quantity', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Satuan</label>
              <input
                className="input"
                value={form.unit}
                onChange={(e) => setField('unit', e.target.value)}
                placeholder="unit/pcs/set/dll"
              />
            </div>
            <div>
              <label className="label">Harga (IDR)</label>
              <input
                type="number"
                min="0"
                className="input"
                value={form.price}
                onChange={(e) => setField('price', e.target.value)}
                required
              />
            </div>
          </div>

          <label className="label mt-12">Keterangan</label>
          <input
            className="input"
            placeholder="opsional"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
          />

          <div className="mt-16">
            <button className="btn btn-primary">Tambah Logistik</button>
          </div>
        </form>
      </div>

      {/* Modal Konfirmasi Hapus */}
      <ConfirmModal
        open={confirmOpen}
        title="Hapus logistik ini?"
        message={`Item “${target?.name || ''}” akan dihapus dan tidak bisa dikembalikan.`}
        confirmText="Ya, hapus"
        cancelText="Batal"
        onConfirm={doDelete}
        onCancel={() => setConfirmOpen(false)}
        busy={deleting}
      />
    </div>
  );
}

// ===== Sub-komponen ringkasan =====
function SummaryItem({ label, value }) {
  return (
    <div
      style={{
        border: '1px solid #eef2f7',
        borderRadius: 12,
        padding: '14px 16px',
        background: 'linear-gradient(180deg, #fff, #fafcff)',
      }}
    >
      <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 6 }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 18 }}>{value}</div>
    </div>
  );
}

// ===== Modal Konfirmasi Reusable =====
function ConfirmModal({
  open,
  title,
  message,
  confirmText = 'Ya',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
  busy,
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,.45)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 50,
        padding: 12,
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{ width: 480, maxWidth: '92vw', padding: 18, boxShadow: '0 12px 30px rgba(0,0,0,.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontWeight: 800, fontSize: 18 }}>{title}</div>
        <div className="mt-8" style={{ color: '#475569' }}>{message}</div>
        <div className="row mt-16" style={{ justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            {cancelText}
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Menghapus…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
