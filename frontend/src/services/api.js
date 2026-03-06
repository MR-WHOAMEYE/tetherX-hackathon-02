// ===== Backend API Client =====
// Centralized HTTP client for all backend API calls

const API_BASE = '/api';

const getToken = () => {
    const session = localStorage.getItem('tetherx_session');
    if (session) {
        try { return JSON.parse(session).token; } catch { return null; }
    }
    return null;
};

const headers = (extra = {}) => {
    const h = { 'Content-Type': 'application/json', ...extra };
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
};

const handleRes = async (res) => {
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const err = new Error(body.detail || `API error ${res.status}`);
        err.status = res.status;
        throw err;
    }
    return res.json();
};

const get = (path, params = {}) => {
    const url = new URL(`${API_BASE}${path}`, window.location.origin);
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
    return fetch(url.toString(), { headers: headers() }).then(handleRes);
};

const post = (path, body = {}) =>
    fetch(`${API_BASE}${path}`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handleRes);

const put = (path, body = {}) =>
    fetch(`${API_BASE}${path}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handleRes);

const del = (path) =>
    fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: headers() }).then(handleRes);

// ── Auth ──────────────────────────────────────────
export const apiLogin = (email, password) => post('/auth/login', { email, password });
export const apiRegister = (data) => post('/auth/register', data);
export const apiGetMe = () => get('/auth/me');
export const apiListUsers = () => get('/auth/users');
export const apiListDoctors = (department) => get('/auth/doctor-list', { department });
export const apiGetNotifications = (doctorEmail, unreadOnly) => get('/auth/notifications', { doctor_email: doctorEmail, unread_only: unreadOnly });
export const apiMarkNotificationRead = (notifId) => put(`/auth/notifications/${notifId}/read`);

// ── Patient ───────────────────────────────────────
export const apiGetMyPrescriptions = (email) => get('/patient/my-prescriptions', { patient_email: email });
export const apiGetMyDiagnoses = (email) => get('/patient/my-diagnoses', { patient_email: email });
export const apiGetMyVitals = (email) => get('/patient/my-vitals', { patient_email: email });
export const apiGetMyBookings = (email) => get('/patient/bookings', { patient_email: email });
export const apiCreateBooking = (data) => post('/patient/bookings', data);
export const apiGetPatientProfile = (email) => get('/patient/profile', { email });
export const apiUpdatePatientProfile = (email, data) => put(`/patient/profile?email=${encodeURIComponent(email)}`, data);
export const apiSubmitFeedback = (data) => post('/patient/feedback', data);

// ── Doctor ────────────────────────────────────────
export const apiDoctorDashboard = (department, staffId) => get('/doctor/dashboard', { department, staff_id: staffId });
export const apiGetMyPatients = (doctorEmail) => get('/doctor/my-patients', { doctor_email: doctorEmail });
export const apiAddPrescription = (data) => post('/doctor/prescriptions', data);
export const apiGetPrescriptions = (patientEmail) => get('/doctor/prescriptions', { patient_email: patientEmail });
export const apiAddDiagnosis = (data) => post('/doctor/diagnoses', data);
export const apiGetDiagnoses = (patientEmail) => get('/doctor/diagnoses', { patient_email: patientEmail });
export const apiGetDoctorBookings = (department, status) => get('/doctor/bookings', { department, status });
export const apiUpdateBooking = (bookingId, data) => put(`/doctor/bookings/${bookingId}`, data);

// ── Nurse ─────────────────────────────────────────
export const apiNurseDashboard = (department, nurseEmail) => get('/nurse/dashboard', { department, nurse_email: nurseEmail });
export const apiRecordVitals = (data) => post('/nurse/vitals', data);
export const apiGetVitals = (patientEmail) => get('/nurse/vitals', { patient_email: patientEmail });

// ── Response Suggestions (AI Pipeline) ────────────
export const apiSubmitPatientQuery = (data) => post('/response-suggestions/queries', data);
export const apiGetPatientQueries = (params = {}) => get('/response-suggestions/queries', params);
export const apiGenerateDraft = (queryId) => post(`/response-suggestions/queries/${queryId}/generate-draft`);
export const apiGetDrafts = (status) => get('/response-suggestions/drafts', { status });
export const apiReviewDraft = (draftId, data) => put(`/response-suggestions/drafts/${draftId}/review`, data);
export const apiSendDraft = (draftId, data = {}) => post(`/response-suggestions/drafts/${draftId}/send`, data);
export const apiGetResponseStats = () => get('/response-suggestions/stats');

// ── Dashboard ─────────────────────────────────────
export const apiDashboardSummary = () => get('/dashboard/summary');
