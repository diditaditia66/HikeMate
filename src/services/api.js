// src/services/api.js
// Util API untuk HikeMate Frontend

import axios from 'axios';

// =====================================================
// Konfigurasi dasar
// - Bisa override via .env: REACT_APP_API_BASE_URL
// =====================================================
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'https://server.cartenz-vpn.my.id/api';

// Jika nanti pakai Cognito, token bisa disuntik via setAuthToken()
let authToken = null;
export const setAuthToken = (token) => {
  authToken = token || null;
};

// Buat axios instance agar konsisten
const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject Authorization header jika ada token
http.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Helper unwrap & error
const ok = (res) => res.data;
const onErr = (label) => (err) => {
  // Debug friendly logging
  // eslint-disable-next-line no-console
  console.error(`${label}:`, {
    message: err?.message,
    status: err?.response?.status,
    data: err?.response?.data,
  });
  throw err;
};

// =====================================================
// TRIP ENDPOINTS
// =====================================================

// GET /trips
export const getTrips = async () => {
  try {
    const res = await http.get('/trips');
    return ok(res);
  } catch (e) {
    return onErr('Error fetching trips')(e);
  }
};

// GET /trips/:tripId
export const getTrip = async (tripId) => {
  try {
    const res = await http.get(`/trips/${tripId}`);
    return ok(res);
  } catch (e) {
    return onErr('Error fetching trip details')(e);
  }
};

// POST /trips
// tripData contoh:
// {
//   name: 'Trip Semeru',
//   startDate: '2025-11-10',
//   endDate: '2025-11-13',
//   dateRange: '2025-11-10 s/d 2025-11-13', // opsional
//   participants: [{ name: 'Andi', role: 'Ketua' }, { name: 'Budi', role: 'Logistik' }], // opsional
//   participantsCount: 10 // opsional (kalau tidak ada, akan dihitung dari participants jika tersedia)
// }
export const createTrip = async (tripData) => {
  try {
    const res = await http.post('/trips', tripData);
    return ok(res);
  } catch (e) {
    return onErr('Error creating trip')(e);
  }
};

// =====================================================
// LOGISTICS ENDPOINTS
// =====================================================

// GET /trips/:tripId/logistics
export const getLogistics = async (tripId) => {
  try {
    const res = await http.get(`/trips/${tripId}/logistics`);
    return ok(res);
  } catch (e) {
    // Jika backend balas 404 untuk trip tidak ada → lempar error,
    // jika 404 karena list kosong (seharusnya 200[]), kita fallback ke []
    if (e?.response?.status === 404) return [];
    return onErr('Error fetching logistics')(e);
  }
};

// POST /trips/:tripId/logistics
// logisticsData contoh: { name:'Tenda', quantity:2, description:'Kapasitas 4', price:350000 }
export const addLogistics = async (tripId, logisticsData) => {
  try {
    const res = await http.post(`/trips/${tripId}/logistics`, logisticsData);
    return ok(res);
  } catch (e) {
    return onErr('Error adding logistics')(e);
  }
};

// PUT /trips/:tripId/logistics/:logisticsId
export const updateLogistics = async (tripId, logisticsId, logisticsData) => {
  try {
    const res = await http.put(
      `/trips/${tripId}/logistics/${logisticsId}`,
      logisticsData
    );
    return ok(res);
  } catch (e) {
    return onErr('Error updating logistics')(e);
  }
};

// DELETE /trips/:tripId/logistics/:logisticsId
export const deleteLogistics = async (tripId, logisticsId) => {
  try {
    const res = await http.delete(`/trips/${tripId}/logistics/${logisticsId}`);
    return ok(res);
  } catch (e) {
    return onErr('Error deleting logistics')(e);
  }
};

// =====================================================
// ROP ENDPOINTS
// =====================================================

// GET /trips/:tripId/rop
export const getROP = async (tripId) => {
  try {
    const res = await http.get(`/trips/${tripId}/rop`);
    return ok(res);
  } catch (e) {
    // Sama seperti logistics: toleransi 404 → []
    if (e?.response?.status === 404) return [];
    return onErr('Error fetching ROP')(e);
  }
};

// POST /trips/:tripId/rop
// ropData contoh: { date:'2025-11-10 05:00', activity:'Start trekking', personInCharge:'Andi' }
export const createROP = async (tripId, ropData) => {
  try {
    const res = await http.post(`/trips/${tripId}/rop`, ropData);
    return ok(res);
  } catch (e) {
    return onErr('Error creating ROP')(e);
  }
};

// =====================================================
// COST SUMMARY
// =====================================================

// GET /trips/:tripId/cost-summary[?people=5]
export const getTripCostSummary = async (tripId, people /* optional */) => {
  try {
    const res = await http.get(`/trips/${tripId}/cost-summary`, {
      params: { people },
    });
    return ok(res);
  } catch (e) {
    return onErr('Error fetching trip cost summary')(e);
  }
};

// =====================================================
// Export default (opsional jika ingin import * as api from ...)
// =====================================================
const api = {
  API_BASE_URL,
  setAuthToken,

  // Trip
  getTrips,
  getTrip,
  createTrip,

  // Logistics
  getLogistics,
  addLogistics,
  updateLogistics,
  deleteLogistics,

  // ROP
  getROP,
  createROP,

  // Cost
  getTripCostSummary,
};

export default api;
