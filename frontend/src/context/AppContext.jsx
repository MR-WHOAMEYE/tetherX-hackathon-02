import { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
    defaultPatients, defaultVitals, defaultPrescriptions,
    defaultReports, defaultQuestions, defaultNotifications, defaultUsers
} from '../data/mockData';

import { sendPatientEmail } from '../services/emailService';

const AppContext = createContext(null);

export const useApp = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
};

export const AppProvider = ({ children }) => {
    const [patients, setPatients] = useState(defaultPatients);
    const [vitals, setVitals] = useState(defaultVitals);
    const [prescriptions, setPrescriptions] = useState(defaultPrescriptions);
    const [reports, setReports] = useState(defaultReports);
    const [questions, setQuestions] = useState(defaultQuestions);
    const [notifications, setNotifications] = useState(defaultNotifications);
    const [toasts, setToasts] = useState([]);
    const toastId = useRef(0);

    // ─── Toast Notifications ──────────────────────────────
    const addToast = useCallback((message, type = 'info') => {
        const id = ++toastId.current;
        setToasts(prev => [...prev, { id, message, type, timestamp: Date.now() }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    }, []);

    // ─── Helpers ──────────────────────────────────────────
    const getUser = useCallback((userId) => {
        return defaultUsers.find(u => u.id === userId);
    }, []);

    const getPatient = useCallback((patientId) => {
        return patients.find(p => p.id === patientId);
    }, [patients]);

    const getPatientByUserId = useCallback((userId) => {
        return patients.find(p => p.userId === userId);
    }, [patients]);

    // ─── Patient Management (Nurse) ───────────────────────
    const registerPatient = useCallback((patientData, nurseId) => {
        const newPatient = {
            id: `PAT${Date.now()}`,
            userId: patientData.userId || null,
            name: patientData.name,
            email: patientData.email,
            phone: patientData.phone,
            age: parseInt(patientData.age),
            gender: patientData.gender,
            dateOfBirth: patientData.dateOfBirth || '',
            bloodGroup: patientData.bloodGroup,
            address: patientData.address,
            emergencyContact: patientData.emergencyContact || '',
            conditions: patientData.conditions
                ? patientData.conditions.split(',').map(c => c.trim()).filter(Boolean)
                : [],
            allergies: patientData.allergies
                ? patientData.allergies.split(',').map(a => a.trim()).filter(Boolean)
                : [],
            registeredBy: nurseId,
            registeredAt: new Date().toISOString(),
            verified: false,
            status: 'active',
        };

        setPatients(prev => [...prev, newPatient]);
        addToast(`Patient ${newPatient.name} registered successfully`, 'success');

        // Notify doctors
        const doctors = defaultUsers.filter(u => u.role === 'doctor');
        const newNotifs = doctors.map(doc => ({
            id: `N${Date.now()}_${doc.id}`,
            userId: doc.id,
            type: 'new_patient',
            title: 'New Patient Registered',
            message: `${getUser(nurseId)?.name || 'A nurse'} registered a new patient: ${newPatient.name}.`,
            relatedQuestionId: null,
            read: false,
            createdAt: new Date().toISOString(),
        }));
        setNotifications(prev => [...newNotifs, ...prev]);

        return newPatient;
    }, [addToast, getUser]);

    const verifyPatient = useCallback((patientId) => {
        setPatients(prev => prev.map(p =>
            p.id === patientId ? { ...p, verified: true } : p
        ));
        addToast('Patient email verified', 'success');
    }, [addToast]);

    // ─── Vitals (Nurse) ──────────────────────────────────
    const recordVitals = useCallback((vitalsData, nurseId) => {
        const newVital = {
            id: `V${Date.now()}`,
            patientId: vitalsData.patientId,
            nurseId: nurseId,
            temperature: parseFloat(vitalsData.temperature),
            bloodPressureSystolic: parseInt(vitalsData.bloodPressureSystolic),
            bloodPressureDiastolic: parseInt(vitalsData.bloodPressureDiastolic),
            heartRate: parseInt(vitalsData.heartRate),
            respiratoryRate: parseInt(vitalsData.respiratoryRate),
            oxygenSaturation: parseInt(vitalsData.oxygenSaturation),
            weight: parseFloat(vitalsData.weight),
            height: parseFloat(vitalsData.height),
            bloodSugarFasting: parseInt(vitalsData.bloodSugarFasting) || 0,
            bloodSugarPP: parseInt(vitalsData.bloodSugarPP) || 0,
            notes: vitalsData.notes || '',
            recordedAt: new Date().toISOString(),
        };

        setVitals(prev => [newVital, ...prev]);
        addToast('Vitals recorded successfully', 'success');
        return newVital;
    }, [addToast]);

    // ─── Prescriptions (Doctor) ───────────────────────────
    const addPrescription = useCallback((prescData, doctorId) => {
        const newRx = {
            id: `RX${Date.now()}`,
            patientId: prescData.patientId,
            doctorId: doctorId,
            diagnosis: prescData.diagnosis,
            medicines: prescData.medicines,
            notes: prescData.notes || '',
            prescribedAt: new Date().toISOString(),
            status: 'active',
        };

        setPrescriptions(prev => [newRx, ...prev]);
        addToast('Prescription created successfully', 'success');
        return newRx;
    }, [addToast]);

    // ─── Reports (Doctor) ────────────────────────────────
    const generateReport = useCallback((reportData, doctorId) => {
        const newReport = {
            id: `RPT${Date.now()}`,
            patientId: reportData.patientId,
            doctorId: doctorId,
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

        // Notify patient
        const patient = patients.find(p => p.id === reportData.patientId);
        if (patient?.userId) {
            setNotifications(prev => [{
                id: `N${Date.now()}`,
                userId: patient.userId,
                type: 'new_report',
                title: 'New Report Available',
                message: `Dr. ${getUser(doctorId)?.name || 'Your doctor'} has generated a new report: ${reportData.title}`,
                relatedQuestionId: null,
                read: false,
                createdAt: new Date().toISOString(),
            }, ...prev]);
        }

        return newReport;
    }, [addToast, patients, getUser]);

    // ─── Patient Questions (AI Q&A) ──────────────────────
    const submitQuestion = useCallback((patientId, patientUserId, questionText, aiSuggestion) => {
        const newQuestion = {
            id: `Q${Date.now()}`,
            patientId,
            patientUserId,
            question: questionText,
            aiSuggestion,
            doctorResponse: null,
            nurseResponse: null,
            respondedBy: null,
            status: 'pending',
            createdAt: new Date().toISOString(),
            answeredAt: null,
        };

        setQuestions(prev => [newQuestion, ...prev]);
        addToast('Your question has been submitted with AI suggestions', 'success');

        // Notify all doctors and nurses
        const staffUsers = defaultUsers.filter(u => u.role === 'doctor' || u.role === 'nurse');
        const patient = patients.find(p => p.id === patientId);

        const newNotifs = staffUsers.map(staff => ({
            id: `N${Date.now()}_${staff.id}`,
            userId: staff.id,
            type: 'patient_question',
            title: 'New Patient Question',
            message: `${patient?.name || 'A patient'} has a new question. AI suggestion is available for review.`,
            relatedQuestionId: newQuestion.id,
            read: false,
            createdAt: new Date().toISOString(),
        }));

        setNotifications(prev => [...newNotifs, ...prev]);
        return newQuestion;
    }, [addToast, patients]);

    // Answer a patient question (Doctor/Nurse)
    const answerQuestion = useCallback((questionId, responseText, responderId) => {
        const responder = getUser(responderId);
        const isDoctor = responder?.role === 'doctor';

        setQuestions(prev => prev.map(q => {
            if (q.id === questionId) {
                return {
                    ...q,
                    ...(isDoctor ? { doctorResponse: responseText } : { nurseResponse: responseText }),
                    respondedBy: responderId,
                    status: 'answered',
                    answeredAt: new Date().toISOString(),
                };
            }
            return q;
        }));

        // Find the question to notify the patient
        const question = questions.find(q => q.id === questionId);
        if (question?.patientUserId) {
            setNotifications(prev => [{
                id: `N${Date.now()}`,
                userId: question.patientUserId,
                type: 'question_answered',
                title: 'Your Question Was Answered',
                message: `${responder?.name || 'A staff member'} has responded to your question.`,
                relatedQuestionId: questionId,
                read: false,
                createdAt: new Date().toISOString(),
            }, ...prev]);
        }

        // Send email to patient via EmailJS
        const patient = patients.find(p => p.id === question?.patientId);
        if (patient?.email) {
            sendPatientEmail({
                patientName: patient.name,
                patientEmail: patient.email,
                subject: `Response to: ${question?.question?.slice(0, 60) || 'Your Query'}`,
                message: responseText,
                staffName: responder?.name || 'TetherX Medical Team',
            }).catch(err => console.error('[EmailJS] Send failed:', err));
        }

        addToast('Response sent to patient', 'success');
    }, [addToast, getUser, questions, patients]);

    // Send AI suggestion as response
    const sendAISuggestion = useCallback((questionId, responderId) => {
        const question = questions.find(q => q.id === questionId);
        if (question?.aiSuggestion) {
            answerQuestion(questionId, question.aiSuggestion, responderId);
        }
    }, [questions, answerQuestion]);

    // ─── Notifications ───────────────────────────────────
    const getUserNotifications = useCallback((userId) => {
        return notifications.filter(n => n.userId === userId).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }, [notifications]);

    const markNotificationRead = useCallback((notifId) => {
        setNotifications(prev => prev.map(n =>
            n.id === notifId ? { ...n, read: true } : n
        ));
    }, []);

    const markAllNotificationsRead = useCallback((userId) => {
        setNotifications(prev => prev.map(n =>
            n.userId === userId ? { ...n, read: true } : n
        ));
    }, []);

    // ─── Data Getters ────────────────────────────────────
    const getPatientVitals = useCallback((patientId) => {
        return vitals.filter(v => v.patientId === patientId).sort(
            (a, b) => new Date(b.recordedAt) - new Date(a.recordedAt)
        );
    }, [vitals]);

    const getPatientPrescriptions = useCallback((patientId) => {
        return prescriptions.filter(p => p.patientId === patientId).sort(
            (a, b) => new Date(b.prescribedAt) - new Date(a.prescribedAt)
        );
    }, [prescriptions]);

    const getPatientReports = useCallback((patientId) => {
        return reports.filter(r => r.patientId === patientId).sort(
            (a, b) => new Date(b.generatedAt) - new Date(a.generatedAt)
        );
    }, [reports]);

    const getPatientQuestions = useCallback((patientId) => {
        return questions.filter(q => q.patientId === patientId).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }, [questions]);

    const getPendingQuestions = useCallback(() => {
        return questions.filter(q => q.status === 'pending').sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }, [questions]);

    const value = {
        patients, vitals, prescriptions, reports, questions, notifications, toasts,
        addToast,
        getUser, getPatient, getPatientByUserId,
        registerPatient, verifyPatient,
        recordVitals, getPatientVitals,
        addPrescription, getPatientPrescriptions,
        generateReport, getPatientReports,
        submitQuestion, answerQuestion, sendAISuggestion,
        getPatientQuestions, getPendingQuestions,
        getUserNotifications, markNotificationRead, markAllNotificationsRead,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
