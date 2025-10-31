import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ paddingBottom: 64 }}>
      {/* Hero Section */}
      <section
        className="card"
        style={{
          marginTop: 32,
          textAlign: 'left',
          background: 'linear-gradient(to bottom right, #f9fafb, #fefefe)',
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Rencanakan Pendakian Lebih Rapi
        </h1>
        <p style={{ fontSize: 18, color: '#475569', maxWidth: 720, lineHeight: 1.6 }}>
          <strong>HikeMate</strong> membantu timmu menyusun <strong>trip</strong>,
          mengelola <strong>logistik</strong>, dan membuat <strong>ROP</strong> dengan efisien
          dan kolaboratif.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          <Link to="/trip">
            <button className="btn btn-primary" style={{ fontSize: 16, height: 44 }}>
              + Buat Trip Baru
            </button>
          </Link>
          <Link to="/daftartrip">
            <button className="btn btn-ghost" style={{ fontSize: 16, height: 44 }}>
              📋 Lihat Daftar Trip
            </button>
          </Link>
        </div>
      </section>

      {/* Fitur Section */}
      <section className="features">
        <article className="feature-card">
          <div className="feature-icon" aria-hidden>🧾</div>
          <div>
            <h3 className="feature-title">ROP Cepat</h3>
            <p className="feature-desc">
              Gunakan template <b>Rencana Operasional Perjalanan</b> agar tim
              tetap fokus dan siap di lapangan.
            </p>
          </div>
        </article>

        <article className="feature-card">
          <div className="feature-icon" aria-hidden>🎒</div>
          <div>
            <h3 className="feature-title">Logistik Terkelola</h3>
            <p className="feature-desc">
              Hitung kebutuhan perlengkapan bersama dengan transparan untuk seluruh anggota.
            </p>
          </div>
        </article>

        <article className="feature-card">
          <div className="feature-icon" aria-hidden>👥</div>
          <div>
            <h3 className="feature-title">Kolaboratif</h3>
            <p className="feature-desc">
              Ajak anggota, atur peran, dan pantau progres persiapan perjalanan secara bersama.
            </p>
          </div>
        </article>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 48,
          textAlign: 'center',
          color: '#6b7280',
          fontSize: 14,
          borderTop: '1px solid #e5e7eb',
          paddingTop: 24,
        }}
      >
        © {new Date().getFullYear()} HikeMate — Rencanakan petualanganmu dengan cerdas.
      </footer>
    </div>
  );
}
