import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTrips, deleteTrip } from '../services/api';

export default function DaftarTrip() {
  const nav = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('newest'); // newest | oldest | az | za

  useEffect(() => {
    (async () => {
      try {
        const data = await getTrips();
        setTrips(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e?.response?.status === 401) {
          nav('/login');
          return;
        }
        setErr('Gagal memuat trip');
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  const filtered = useMemo(() => {
    const norm = (s) => (s || '').toString().toLowerCase();
    let list = trips.filter((t) => {
      const hay = `${t.name ?? ''} ${t.startDate ?? ''} ${t.endDate ?? ''}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });

    const byDateDesc = (a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0);
    const byDateAsc = (a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0);
    const byName = (a, b) => norm(a.name).localeCompare(norm(b.name));

    if (sort === 'newest') list.sort(byDateDesc);
    else if (sort === 'oldest') list.sort(byDateAsc);
    else if (sort === 'az') list.sort(byName);
    else if (sort === 'za') list.sort((a, b) => -byName(a, b));

    return list;
  }, [trips, q, sort]);

  // Function to delete trip
  const handleDelete = async (tripId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus trip ini?')) {
      try {
        await deleteTrip(tripId); // Call deleteTrip to delete the trip
        alert('Trip berhasil dihapus!');
        setTrips(trips.filter((trip) => trip.id !== tripId)); // Remove from state
      } catch (err) {
        alert('Gagal menghapus trip');
      }
    }
  };

  if (loading) return <div className="card">Memuat daftar trip…</div>;
  if (err) return <div className="card" style={{ color: 'crimson' }}>{err}</div>;

  return (
    <div>
      {/* Header */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="row" style={{ alignItems: 'center' }}>
          <div className="col" style={{ flex: '2 1 520px' }}>
            <h1 className="m-0" style={{ fontSize: 40, letterSpacing: .2 }}>Daftar Trip</h1>
            <p className="mt-8" style={{ color: 'var(--muted)', fontSize: 16 }}>
              Cari atau urutkan trip yang sudah kamu buat.
            </p>
          </div>
          <div>
            <Link to="/trip">
              <button className="btn btn-primary" style={{ height: 44, padding: '0 18px' }}>+ Buat Trip Baru</button>
            </Link>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar mt-16">
          <div className="input-with-icon" style={{ flex: '1 1 420px' }}>
            <span className="icon">🔎</span>
            <input
              className="input"
              placeholder="Cari trip (nama / tanggal)…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="kpi" title="Jumlah trip yang ditampilkan">
              <span>Menampilkan</span><b>{filtered.length}</b><span>trip</span>
            </div>
            <select
              className="select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ width: 220 }}
            >
              <option value="newest">Terbaru terlebih dulu</option>
              <option value="oldest">Terlama terlebih dulu</option>
              <option value="az">Nama A → Z</option>
              <option value="za">Nama Z → A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data / Empty */}
      {filtered.length === 0 ? (
        <div className="card" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: 24
        }}>
          <div style={{ fontSize: 42, lineHeight: 1 }}>🏔️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Belum ada trip</div>
            <div style={{ color: 'var(--muted)' }}>
              Buat trip pertamamu untuk mulai menyusun logistik dan ROP.
            </div>
          </div>
          <Link to="/trip">
            <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Buat Trip Baru</button>
          </Link>
        </div>
      ) : (
        <div className="grid-cards">
          {filtered.map((t) => {
            const count = t.participants?.length ?? t.participantsCount ?? 0;
            return (
              <div key={t.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}>{t.name}</div>
                  {/* optional lokasi badge */}
                  {t.location && (
                    <span className="badge" style={{ background: '#ecfeff', color: '#0369a1', borderColor: '#cffafe' }}>
                      📍 {t.location}
                    </span>
                  )}
                </div>

                {/* Meta */}
                <div className="row" style={{ alignItems: 'center', gap: 8 }}>
                  <span className="badge">{t.startDate || '—'} s/d {t.endDate || '—'}</span>
                  {count > 0 && (
                    <span className="badge" style={{ background: '#eef2ff', color: '#3730a3', borderColor: '#e0e7ff' }}>
                      👥 {count} peserta
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="row mt-8" style={{ gap: 8 }}>
                  <Link to={`/logistik/${t.id}`}>
                    <button className="btn btn-ghost">Kelola Logistik</button>
                  </Link>
                  <Link to={`/rop/${t.id}`}>
                    <button className="btn btn-primary">Kelola ROP</button>
                  </Link>
                  {/* Add delete button */}
                  <button className="btn btn-danger" onClick={() => handleDelete(t.id)}>
                    Hapus Trip
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
