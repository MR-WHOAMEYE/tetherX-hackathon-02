// ===== TetherX Healthcare Platform — Data Layer =====

// ─── Pre-seeded Users (Required for Login Demo) ──────────────────────
export const defaultUsers = [
    {
        id: 'U001',
        name: 'Dr. Rajesh Kumar',
        email: 'doctor@tetherx.com',
        password: 'doctor123',
        role: 'doctor',
        verified: true,
        specialization: 'Internal Medicine',
        department: 'General',
        phone: '+91-98765-43210',
        licenseNo: 'MCI-2019-4521',
    },
    {
        id: 'U003',
        name: 'Nurse Kavitha',
        email: 'nurse@tetherx.com',
        password: 'nurse123',
        role: 'nurse',
        verified: true,
        department: 'General Ward',
        phone: '+91-87654-32109',
        nursingId: 'NRS-2020-1122',
    },
    {
        id: 'U005',
        name: 'Ananya Sharma',
        email: 'patient@tetherx.com',
        password: 'patient123',
        role: 'patient',
        verified: true,
        patientId: 'PAT001', // Pre-linked to the first patient record
    },
];

// ─── Initial Patient Records ─────────────────────────────────────────
// We keep one base patient record so the Patient Demo Login has a linked profile
export const defaultPatients = [
    {
        id: 'PAT001',
        userId: 'U005',
        name: 'Ananya Sharma',
        email: 'patient@tetherx.com',
        phone: '+91-76543-21098',
        age: 34,
        gender: 'Female',
        dateOfBirth: '1992-05-15',
        bloodGroup: 'B+',
        address: '42, MG Road, Bangalore 560001',
        emergencyContact: '+91-98765-00001',
        conditions: [],
        allergies: [],
        registeredBy: 'U003',
        registeredAt: new Date().toISOString(),
        verified: true,
        status: 'active',
    }
];

// ─── Empty Initial States ──────────────────────────────────────────
export const defaultVitals = [];
export const defaultPrescriptions = [];
export const defaultReports = [];
export const defaultQuestions = [];
export const defaultNotifications = [];

// ─── Knowledge Base (Static Medical References) ────────────────────
export const knowledgeBase = [
    { id: 'KB-DM-001', category: 'Endocrinology', title: 'Hyperglycemia Management Protocol', content: 'If BG > 200mg/dL for >5 consecutive days despite compliance, consider medication adjustment. Check HbA1c, renal panel.', lastUpdated: '2026-02-15', tags: ['diabetes', 'hyperglycemia'] },
    { id: 'KB-CARD-007', category: 'Cardiology', title: 'Statin-Induced Myopathy Assessment', content: 'Statins can cause myalgia in 5-10% of patients. Order CK levels. If CK > 10x ULN, discontinue immediately.', lastUpdated: '2026-02-01', tags: ['statin', 'myopathy'] },
];

export const dashboardStats = {
    totalPatients: 0,
    totalDoctors: 0,
    totalNurses: 0,
    pendingQuestions: 0,
    activeReports: 0,
    activePrescriptions: 0,
};

// ─── AI Intent Categories ──────────────────────────────────────────
export const intentCategories = [
    { id: 'appointment', label: 'Scheduling & Appointments' },
    { id: 'medication', label: 'Medication Query' },
    { id: 'symptom', label: 'Symptom Assessment' },
    { id: 'billing', label: 'Billing & Insurance' },
    { id: 'lab_results', label: 'Lab & Test Results' },
    { id: 'referral', label: 'Specialist Referral' },
    { id: 'prescription', label: 'Prescription Refill' },
    { id: 'general', label: 'General Inquiry' },
    { id: 'urgent', label: 'Urgent Care Request' },
    { id: 'follow_up', label: 'Follow-up' },
];
