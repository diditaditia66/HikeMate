import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrip, } from '../services/api';

export default function Trip() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    peopleCount: 1, // akan dioverride otomatis
    participants: [{ name: '', role: '' }],
  });
  const [submitting, setSubmitting] = useState(false);

  // ============== Helpers ==============
  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const setParticipant = (idx, key, val) => {
    const arr = [...form.participants];
    arr[idx] = { ...arr[idx], [key]: val };
    setForm((s) => ({ ...s, participants: arr }));
  };

  const addParticipant = () =>
    setForm((s) => ({ ...s, participants: [...s.participants, { name: '', role: '' }] }));

  const removeParticipant = (idx) =>
    setForm((s) => ({
      ...s,
      participants: s.participants.filter((_, i) => i !== idx),
    }));

  // ============== Auto peopleCount ==============
  // Hitung dari jumlah baris peserta yang ada (apa pun isinya).
  useEffect(() => {
    setForm((s) => ({
      ...s,
      peopleCount: s.participants.length || 1,
    }));
  }, [form.participants.length]);

  // ============== Submit ==============
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) {
      alert('Nama & tanggal wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
        participantsCount: form.participants.length || 1, // ⬅️ selalu ikut jumlah baris peserta
        participants: form.participants,
      };
      const trip = await createTrip(payload);
      alert('Trip dibuat!');
      navigate(`/logistik/${trip?.id ?? ''}`);
    } catch (err) {
      alert('Gagal membuat trip');
    } finally {
      setSubmitting(false);
    }
  };

  // ============== UI ==============
  return (
    <div className="card" style={{ paddingBottom: 20 }}>
      <h1 className="m-0">Buat Trip Baru</h1>

      <form onSubmit={onSubmit} className="mt-24">
        {/* Nama trip */}
        <label className="label">Tujuan / Nama Trip</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder="Contoh: Gunung Rinjani"
          required
        />

        {/* Tanggal + jumlah orang (otomatis) */}
        <div className="row">
          <div className="col">
            <label className="label">Mulai</label>
            <input
              type="date"
              className="input"
              value={form.startDate}
              onChange={(e) => setField('startDate', e.target.value)}
              required
            />
          </div>
          <div className="col">
            <label className="label">Selesai</label>
            <input
              type="date"
              className="input"
              value={form.endDate}
              onChange={(e) => setField('endDate', e.target.value)}
              required
            />
          </div>

          {/* Jumlah Orang (read-only & auto) */}
          <div className="col" style={{ maxWidth: 180 }}>
            <label className="label">Jumlah Orang</label>
            <div style={{ position: 'relative' }}>
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 12,
                  top: 9,        // sesuaikan jika ingin lebih tengah
                  fontSize: 16,
                  opacity: 0.8,
                }}
              >
                👥
              </span>
              <input
                className="input"
                readOnly
                value={form.peopleCount}
                style={{
                  paddingLeft: 36,         // ruang untuk ikon
                  textAlign: 'center',
                  fontWeight: 700,
                  letterSpacing: 0.3,
                }}
              />
            </div>
          </div>
        </div>

        {/* Peserta & Peran */}
        <div className="mt-24">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Peserta & Peran</div>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>
              Tambah baris untuk menambah jumlah orang.
            </span>
          </div>

          {form.participants.map((p, idx) => (
            <div
              key={idx}
              className="row"
              style={{
                alignItems: 'end',
                marginBottom: 8,
                padding: 8,
                border: '1px solid #eef2f7',
                borderRadius: 12,
                background: '#fafafa',
              }}
            >
              <div className="col">
                <label className="label">Nama</label>
                <input
                  className="input"
                  value={p.name}
                  onChange={(e) => setParticipant(idx, 'name', e.target.value)}
                  placeholder="Nama peserta"
                />
              </div>
              <div className="col">
                <label className="label">Peran</label>
                <input
                  className="input"
                  value={p.role}
                  onChange={(e) => setParticipant(idx, 'role', e.target.value)}
                  placeholder="Leader, Medis, Logistik, dll"
                />
              </div>
              <div>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeParticipant(idx)}
                  disabled={form.participants.length <= 1}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}

          <button type="button" className="btn btn-ghost mt-8" onClick={addParticipant}>
            + Tambah Peserta
          </button>
        </div>

        {/* Submit */}
        <div className="mt-24" style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Menyimpan…' : 'Buat Trip'}
          </button>
        </div>
      </form>
    </div>
  );
}
