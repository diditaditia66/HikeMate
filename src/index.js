import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Opsional: kalau aws-exports ada, konfig Amplify. Kalau belum, jangan bikin crash.
(async () => {
  try {
    const { Amplify } = await import('aws-amplify');
    const awsconfig = (await import('./aws-exports')).default;
    Amplify.configure(awsconfig);
  } catch (e) {
    // Biarkan jalan tanpa Amplify (mis. saat dev lokal atau belum setup Cognito)
    // console.info('Amplify tidak dikonfigurasi (abaikan jika belum perlu).');
  }

  const container = document.getElementById('root');
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
})();
