// src/services/api.js
// Util API untuk HikeMate Frontend

import axios from 'axios';

// =====================================================
// Konfigurasi dasar
// - Bisa override via .env: REACT_APP_API_BASE_URL
//   (Contoh: https://api.hikemate.didit-aditia.my.id/api)
// =====================================================
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'https://server.cartenz-vpn.my.id/api';

// ======== Auth Token Provider ========
// Kita tidak menyimpan token statis agar selalu fresh.
// AuthContext akan mendaftarkan provider ini.
let tokenProvider = null;
/**
 * Daftarkan provider pengambil token.
 * @param {() => (string|null|undefined)} fn - fungsi yang mengembalikan idToken terbaru
 */
export const bindAuthTokenProvider = (fn) => {
  tokenProvider = typeof fn === 'function' ? fn : null;
};

// Buat axios instance agar konsisten
const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject Authorization header jika ada token (selalu ambil paling baru)
http.interceptors.request.use((config) => {
  const raw = tokenProvider ? tokenProvider() : null;
  const token = typeof raw === 'string' ? raw : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

// Normalisasi error (tambahkan status & message yang enak dibaca)
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const message =
      data?.error ||
      data?.message ||
      error?.message ||
      (status ? `HTTP ${status}` : 'Network error');
    const wrapped = new Error(message);
    wrapped.status = status;
    wrapped.data = data;
    throw wrapped;
  }
);

// Helper unwrap
const ok = (res) => res.data;

// =====================================================
// TRIP ENDPOINTS
// =====================================================

// GET /trips
export const getTrips = async () => {
  const res = await http.get('/trips');
  return ok(res);
};

// GET /trips/:tripId
export const getTrip = async (tripId) => {
  const res = await http.get(`/trips/${tripId}`);
  return ok(res);
};

// POST /trips
export const createTrip = async (tripData) => {
  const res = await http.post('/trips', tripData);
  return ok(res);
};

// DELETE /trips/:tripId
export const deleteTrip = async (tripId) => {
  const res = await http.delete(`/trips/${tripId}`);
  return ok(res);
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
    if (e.status === 404) return [];
    throw e;
  }
};

// POST /trips/:tripId/logistics
export const addLogistics = async (tripId, logisticsData) => {
  const res = await http.post(`/trips/${tripId}/logistics`, logisticsData);
  return ok(res);
};

// PUT /trips/:tripId/logistics/:logisticsId
export const updateLogistics = async (tripId, logisticsId, logisticsData) => {
  const res = await http.put(
    `/trips/${tripId}/logistics/${logisticsId}`,
    logisticsData
  );
  return ok(res);
};

// DELETE /trips/:tripId/logistics/:logisticsId
export const deleteLogistics = async (tripId, logisticsId) => {
  const res = await http.delete(`/trips/${tripId}/logistics/${logisticsId}`);
  return ok(res);
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
    if (e.status === 404) return [];
    throw e;
  }
};

// POST /trips/:tripId/rop
export const createROP = async (tripId, ropData) => {
  const res = await http.post(`/trips/${tripId}/rop`, ropData);
  return ok(res);
};

// DELETE /trips/:tripId/rop/:ropId
export const deleteROP = async (tripId, ropId) => {
  const res = await http.delete(`/trips/${tripId}/rop/${ropId}`);
  return ok(res);
};

// (Opsional) PUT /trips/:tripId/rop/:ropId
export const updateROP = async (tripId, ropId, ropData) => {
  const res = await http.put(`/trips/${tripId}/rop/${ropId}`, ropData);
  return ok(res);
};

// =====================================================
// COST SUMMARY
// =====================================================

// GET /trips/:tripId/cost-summary[?people=5]
export const getTripCostSummary = async (tripId, people /* optional */) => {
  const res = await http.get(`/trips/${tripId}/cost-summary`, {
    params: { people },
  });
  return ok(res);
};

// =====================================================
// Export default (opsional jika ingin import * as api from ...)
// =====================================================
const api = {
  API_BASE_URL,
  bindAuthTokenProvider,

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
  deleteROP,
  updateROP,

  // Cost
  getTripCostSummary,
};

export default api;
