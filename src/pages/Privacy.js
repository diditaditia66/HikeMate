import React from 'react';

export default function Privacy() {
  return (
    <div className="card">
      <h1 className="m-0">Kebijakan Privasi HikeMate</h1>
      <p className="mt-16" style={{color:'var(--muted)'}}>
        Terakhir diperbarui: 31 Okt 2025
      </p>

      <h3 className="mt-24">1. Informasi yang Kami Kumpulkan</h3>
      <ul>
        <li>Data akun (email, nama—jika diisi).</li>
        <li>Data operasional: trip, logistik, ROP, dan aktivitas di aplikasi.</li>
        <li>Metadata teknis: alamat IP, jenis perangkat, dan log kesalahan.</li>
      </ul>

      <h3 className="mt-24">2. Cara Kami Menggunakan Data</h3>
      <ul>
        <li>Menyediakan dan meningkatkan layanan HikeMate.</li>
        <li>Autentikasi melalui AWS Cognito dan pengamanan akses.</li>
        <li>Analitik penggunaan secara agregat (tanpa mengidentifikasi pengguna secara langsung).</li>
      </ul>

      <h3 className="mt-24">3. Berbagi Data</h3>
      <p>Kami tidak menjual data Anda. Data dapat dibagikan dengan penyedia infrastruktur (mis. AWS) semata-mata untuk menjalankan layanan.</p>

      <h3 className="mt-24">4. Keamanan</h3>
      <p>Kami menerapkan praktik keamanan yang wajar termasuk enkripsi in-transit (HTTPS) dan kontrol akses berbasis token.</p>

      <h3 className="mt-24">5. Hak Anda</h3>
      <ul>
        <li>Meminta akses, koreksi, atau penghapusan data tertentu.</li>
        <li>Menarik persetujuan untuk pemrosesan tertentu (jika berlaku).</li>
      </ul>

      <h3 className="mt-24">6. Penyimpanan & Retensi</h3>
      <p>Data disimpan di infrastruktur AWS (region ap-northeast-3) dan disimpan selama akun aktif atau sesuai kewajiban hukum.</p>

      <h3 className="mt-24">7. Kontak</h3>
      <p>support@hikemate.didit-aditia.my.id</p>
    </div>
  );
}
