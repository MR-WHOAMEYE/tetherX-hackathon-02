import { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
    apiGetMyVitals, apiGetMyPrescriptions, apiGetMyDiagnoses,
    apiRecordVitals, apiAddPrescription, apiAddDiagnosis,
    apiGetMyPatients, apiListUsers, apiGetNotifications, apiMarkNotificationRead,
    apiSubmitPatientQuery, apiGetPatientQueries, apiGenerateDraft,
    apiGetDrafts, apiReviewDraft, apiSendDraft, apiGetResponseStats,
    apiRegister,
} from '../services/api';

const AppContext = createContext(null);

export const useApp = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
};

export const AppProvider = ({ children }) => {
    const [patients, setPatients] = useState([]);
    const [vitals, setVitals] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [reports, setReports] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [toasts, setToasts] = useState([]);
    const toastId = useRef(0);

    // ─── Toast Notifications ──────────────────────────────
    const addToast = useCallback((message, type = 'info') => {
        const id = ++toastId.current;
        setToasts(prev => [...prev, { id, message, type, timestamp: Date.now() }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    }, []);

    // ─── Users (from backend) ─────────────────────────────
    const getUser = useCallback(async (userId) => {
        try {
            const data = await apiListUsers();
            return (data.users || []).find(u => u.id === userId);
        } catch { return null; }
    }, []);

    const getPatient = useCallback((patientId) => {
        return patients.find(p => p.id === patientId);
    }, [patients]);

    const getPatientByUserId = useCallback((userId) => {
        return patients.find(p => p.userId === userId);
    }, [patients]);

    // ─── Patient Management (Nurse registers via backend) ─
    const registerPatient = useCallback(async (patientData) => {
        try {
            const data = await apiRegister({
                name: patientData.name,
                email: patientData.email,
                password: patientData.password || 'patient123',
                role: 'patient',
                department: patientData.department || '',
                assigned_doctor: patientData.assigned_doctor || '',
                assigned_doctor_name: patientData.assigned_doctor_name || '',
                issue: patientData.issue || '',
            });
            addToast(`Patient ${patientData.name} registered successfully`, 'success');
            return data.user;
        } catch (err) {
            addToast(err.message || 'Registration failed', 'error');
            return null;
        }
    }, [addToast]);

    const verifyPatient = useCallback(() => {
        addToast('Patient verified', 'success');
    }, [addToast]);

    // ─── Vitals (Nurse records via backend) ───────────────
    const recordVitals = useCallback(async (vitalsData) => {
        try {
            const result = await apiRecordVitals({
                patient_email: vitalsData.patient_email,
                patient_name: vitalsData.patient_name,
                bp_systolic: vitalsData.bloodPressureSystolic ? parseInt(vitalsData.bloodPressureSystolic) : undefined,
                bp_diastolic: vitalsData.bloodPressureDiastolic ? parseInt(vitalsData.bloodPressureDiastolic) : undefined,
                sugar_level: vitalsData.bloodSugarFasting ? parseInt(vitalsData.bloodSugarFasting) : undefined,
                temperature: vitalsData.temperature ? parseFloat(vitalsData.temperature) : undefined,
                heart_rate: vitalsData.heartRate ? parseInt(vitalsData.heartRate) : undefined,
                notes: vitalsData.notes || '',
            });
            addToast('Vitals recorded successfully', 'success');
            return result;
        } catch (err) {
            addToast(err.message || 'Failed to record vitals', 'error');
            return null;
        }
    }, [addToast]);

    // ─── Prescriptions (Doctor) ───────────────────────────
    const addPrescription = useCallback(async (prescData) => {
        try {
            const result = await apiAddPrescription({
                patient_email: prescData.patient_email,
                patient_name: prescData.patient_name,
                medication: prescData.medication,
                dosage: prescData.dosage,
                frequency: prescData.frequency,
                duration: prescData.duration,
                notes: prescData.notes || '',
            });
            addToast('Prescription created successfully', 'success');
            return result;
        } catch (err) {
            addToast(err.message || 'Failed to create prescription', 'error');
            return null;
        }
    }, [addToast]);

    // ─── Diagnoses (Doctor) ─────────────────────────────
    const addDiagnosisRecord = useCallback(async (diagData) => {
        try {
            const result = await apiAddDiagnosis({
                patient_email: diagData.patient_email,
                patient_name: diagData.patient_name,
                condition: diagData.condition,
                severity: diagData.severity,
                notes: diagData.notes || '',
            });
            addToast('Diagnosis added successfully', 'success');
            return result;
        } catch (err) {
            addToast(err.message || 'Failed to add diagnosis', 'error');
            return null;
        }
    }, [addToast]);

    // ─── Reports (kept in local state for PDF generation) ─
    const generateReport = useCallback((reportData) => {
        const newReport = {
            id: `RPT${Date.now()}`,
            patientId: reportData.patientId,
            doctorId: reportData.doctorId,
            title: reportData.title,
            type: reportData.type,
            diagnosis: reportData.diagnosis,
            findings: reportData.findings,
            recommendations: reportData.recommendations,
            prescriptionId: reportData.prescriptionId || null,
            generatedAt: new Date().toISOString(),
        };
        setReports(prev => [newReport, ...prev]);
        addToast('Report generated successfully', 'success');
        return newReport;
    }, [addToast]);

    // ─── Patient Questions (AI Pipeline via backend) ──────
    const submitQuestion = useCallback(async (patientEmail, patientName, questionText, category = 'general') => {
        try {
            const result = await apiSubmitPatientQuery({
                patient_email: patientEmail,
                patient_name: patientName,
                subject: questionText.slice(0, 80),
                category,
                message: questionText,
                priority: 'medium',
            });

            // Auto-generate AI draft
            if (result.id) {
                try {
                    const draft = await apiGenerateDraft(result.id);
                    addToast('Question submitted and AI draft generated', 'success');
                    return { queryId: result.id, draft };
                } catch {
                    addToast('Question submitted (AI draft generation pending)', 'success');
                    return { queryId: result.id };
                }
            }
            addToast('Question submitted successfully', 'success');
            return result;
        } catch (err) {
            addToast(err.message || 'Failed to submit question', 'error');
            return null;
        }
    }, [addToast]);

    const answerQuestion = useCallback(async (draftId, responseText, staffEmail, action = 'edit_and_approve') => {
        try {
            await apiReviewDraft(draftId, {
                action,
                edited_text: responseText,
                staff_email: staffEmail,
            });
            await apiSendDraft(draftId, { staff_email: staffEmail });
            addToast('Response sent to patient', 'success');
        } catch (err) {
            addToast(err.message || 'Failed to send response', 'error');
        }
    }, [addToast]);

    const sendAISuggestion = useCallback(async (draftId, staffEmail) => {
        try {
            await apiReviewDraft(draftId, { action: 'approve', staff_email: staffEmail });
            await apiSendDraft(draftId, { staff_email: staffEmail });
            addToast('AI suggestion approved and sent', 'success');
        } catch (err) {
            addToast(err.message || 'Failed to send AI suggestion', 'error');
        }
    }, [addToast]);

    // ─── Data Fetchers ───────────────────────────────────
    const fetchPatientVitals = useCallback(async (email) => {
        try {
            const data = await apiGetMyVitals(email);
            return data.vitals || [];
        } catch { return []; }
    }, []);

    const fetchPatientPrescriptions = useCallback(async (email) => {
        try {
            const data = await apiGetMyPrescriptions(email);
            return data.prescriptions || [];
        } catch { return []; }
    }, []);

    const fetchPatientDiagnoses = useCallback(async (email) => {
        try {
            const data = await apiGetMyDiagnoses(email);
            return data.diagnoses || [];
        } catch { return []; }
    }, []);

    const fetchMyPatients = useCallback(async (doctorEmail) => {
        try {
            const data = await apiGetMyPatients(doctorEmail);
            return data.patients || [];
        } catch { return []; }
    }, []);

    const fetchPatientQueries = useCallback(async (params = {}) => {
        try {
            const data = await apiGetPatientQueries(params);
            return data.queries || [];
        } catch { return []; }
    }, []);

    const fetchDrafts = useCallback(async (status) => {
        try {
            const data = await apiGetDrafts(status);
            return data.drafts || [];
        } catch { return []; }
    }, []);

    const fetchNotifications = useCallback(async (doctorEmail) => {
        try {
            const data = await apiGetNotifications(doctorEmail);
            return data.notifications || [];
        } catch { return []; }
    }, []);

    const markNotificationRead = useCallback(async (notifId) => {
        try { await apiMarkNotificationRead(notifId); } catch {}
    }, []);

    // ─── Compatibility getters (local state) ─────────────
    const getPatientVitals = useCallback((patientId) => {
        return vitals.filter(v => v.patientId === patientId);
    }, [vitals]);

    const getPatientPrescriptions = useCallback((patientId) => {
        return prescriptions.filter(p => p.patientId === patientId);
    }, [prescriptions]);

    const getPatientReports = useCallback((patientId) => {
        return reports.filter(r => r.patientId === patientId);
    }, [reports]);

    const getPatientQuestions = useCallback((patientId) => {
        return questions.filter(q => q.patientId === patientId);
    }, [questions]);

    const getPendingQuestions = useCallback(() => {
        return questions.filter(q => q.status === 'pending');
    }, [questions]);

    const getUserNotifications = useCallback((userId) => {
        return notifications.filter(n => n.userId === userId);
    }, [notifications]);

    const markAllNotificationsRead = useCallback(() => {}, []);

    const value = {
        patients, vitals, prescriptions, reports, questions, notifications, toasts,
        addToast,
        getUser, getPatient, getPatientByUserId,
        registerPatient, verifyPatient,
        recordVitals, getPatientVitals, fetchPatientVitals,
        addPrescription, getPatientPrescriptions, fetchPatientPrescriptions,
        addDiagnosisRecord, fetchPatientDiagnoses,
        generateReport, getPatientReports,
        submitQuestion, answerQuestion, sendAISuggestion,
        getPatientQuestions, getPendingQuestions,
        fetchPatientQueries, fetchDrafts, fetchMyPatients,
        fetchNotifications, getUserNotifications, markNotificationRead, markAllNotificationsRead,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
