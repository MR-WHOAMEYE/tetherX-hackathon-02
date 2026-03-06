import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    FileText, Download, MessageSquare, Brain, Send, Bell,
    ChevronDown, ChevronUp, CheckCircle, Clock, Pill,
    Activity, AlertCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { apiGetPatientProfile, apiGetMyVitals } from '../../services/api';
import { generateReportPDF } from '../../services/pdfService';
import HeroBanner from '../../components/HeroBanner';

// ─── AI suggestion generator ─────────────────────────────────────
const generateAISuggestion = (question) => {
    const q = question.toLowerCase();

    if (q.includes('sugar') || q.includes('diabetes') || q.includes('glucose') || q.includes('metformin')) {
        return `Regarding your blood sugar concern:\n\n**Do NOT adjust medication dosages on your own.** Persistently elevated blood sugar may indicate:\n\n1. **Medication adjustment needed** — Your doctor may need to modify your regimen\n2. **Dietary factors** — High carbohydrate intake can override medication\n3. **Illness or stress** — These temporarily raise blood sugar\n\n**Immediate steps:**\n- Continue current medications as prescribed\n- Monitor fasting and post-meal blood sugar levels\n- Reduce refined carbohydrate intake\n- Stay well hydrated\n- Schedule a follow-up within 2-3 days\n\n**⚠️ Seek emergency care if you experience:** Nausea/vomiting, fruity-smelling breath, rapid breathing, or confusion.\n\n*This is an AI-generated suggestion. Your doctor will review and provide a personalized response.*`;
    }

    if (q.includes('pain') || q.includes('ache') || q.includes('hurt')) {
        return `Regarding your pain concern:\n\n**General pain management guidance:**\n\n1. **Location and severity** — Note the exact location, intensity (1-10), and type (sharp, dull, throbbing)\n2. **Over-the-counter options** — Paracetamol (500mg) may help for mild to moderate pain. Avoid NSAIDs if you have kidney issues.\n3. **When to worry** — Sudden severe pain, pain with fever, or pain that prevents normal activities\n\n**Do:**\n- Rest the affected area\n- Apply ice/heat as appropriate\n- Keep a pain diary\n\n**Don't:**\n- Don't take more medication than prescribed\n- Don't ignore worsening symptoms\n\n**⚠️ Seek immediate care if:** Chest pain, sudden severe headache, or pain with numbness/weakness.\n\n*This is an AI-generated suggestion. Your doctor will review and respond.*`;
    }

    if (q.includes('medication') || q.includes('medicine') || q.includes('side effect') || q.includes('drug')) {
        return `Regarding your medication concern:\n\n**Important medication safety guidelines:**\n\n1. **Never stop or adjust** medication without consulting your doctor\n2. **Common side effects** may include nausea, dizziness, headache — most are temporary\n3. **Report immediately** if you experience: severe allergic reaction, difficulty breathing, unusual bleeding\n\n**Steps to take:**\n- Continue your current medications\n- Note the specific symptoms and when they started\n- Take medications with food if causing stomach upset\n- Keep a record of all medications including OTC\n\n**Your doctor will review** this concern and may adjust your prescription if needed.\n\n*This is an AI-generated suggestion. A personalized response will follow.*`;
    }

    if (q.includes('appointment') || q.includes('schedule') || q.includes('visit') || q.includes('follow')) {
        return `Regarding your appointment/follow-up:\n\n**Scheduling guidance:**\n\n1. Your care team has been notified of your request\n2. For routine follow-ups, appointments are typically within 1-2 weeks\n3. For urgent concerns, same-day or next-day slots may be available\n\n**Before your appointment:**\n- List all current symptoms and concerns\n- Bring your medication list\n- Note any changes since your last visit\n- Have your insurance information ready\n\n*Your doctor or nurse will confirm scheduling details.*`;
    }

    // Default suggestion
    return `Thank you for reaching out.\n\n**Your question has been received and forwarded to your care team.**\n\nBased on your query, here are some general health tips:\n\n1. **Continue prescribed medications** as directed\n2. **Monitor your symptoms** — keep a diary of any changes\n3. **Stay hydrated** and maintain a balanced diet\n4. **Rest adequately** — sleep 7-8 hours\n5. **Contact emergency services (112)** for any severe or life-threatening symptoms\n\n**Your doctor and nurse have been notified** and will review your question along with this AI analysis. You will receive a personalized response.\n\n*This is an AI-generated preliminary suggestion. Professional medical advice will follow.*`;
};


// ═══ SUB-TAB: My Reports ════════════════════════════════════════
function MyReports({ reports, patientId, getUser, prescriptions, vitals, patient }) {
    const [expandedId, setExpandedId] = useState(null);

    const handleDownloadPDF = (report) => {
        const doctor = getUser(report.doctorId);
        const rx = prescriptions.find(p => p.id === report.prescriptionId);
        const patientVitals = vitals.filter(v => v.patientId === report.patientId)
            .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
        generateReportPDF(report, patient, doctor || {}, rx, patientVitals);
    };

    return (
        <div>
            {reports.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                    <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ fontSize: '1rem', fontWeight: 500 }}>No reports yet</p>
                    <p style={{ fontSize: '0.875rem' }}>Your doctor will generate reports after your consultations</p>
                </div>
            ) : (
                reports.map(report => {
                    const doctor = getUser(report.doctorId);
                    const isExpanded = expandedId === report.id;

                    return (
                        <div key={report.id} className="card-flat" style={{ marginBottom: '0.75rem', padding: 0, overflow: 'hidden' }}>
                            <div onClick={() => setExpandedId(isExpanded ? null : report.id)} style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer' }}>
                                <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FileText size={20} color="#10b981" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{report.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.125rem' }}>
                                        {report.type} · {doctor?.name || 'Doctor'} · {new Date(report.generatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDownloadPDF(report); }} className="btn btn-sm btn-primary" style={{ fontSize: '0.75rem' }}>
                                    <Download size={14} /> Download PDF
                                </button>
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>

                            {isExpanded && (
                                <div className="animate-fade-in" style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--color-border-light)' }}>
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <div style={{ padding: '0.75rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                                            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Diagnosis</div>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{report.diagnosis}</div>
                                        </div>

                                        {report.findings && (
                                            <div style={{ padding: '0.75rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                                                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Clinical Findings</div>
                                                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{report.findings}</div>
                                            </div>
                                        )}

                                        {report.recommendations && (
                                            <div style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                                                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Recommendations</div>
                                                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{report.recommendations}</div>
                                            </div>
                                        )}

                                        <button onClick={() => handleDownloadPDF(report)} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                                            <Download size={16} /> Download Full Report as PDF
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}


// ═══ SUB-TAB: Ask AI Question ═══════════════════════════════════
function AskQuestion({ patientId, patientUserId, submitQuestion }) {
    const [question, setQuestion] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleAskAI = async () => {
        if (!question.trim()) return;
        setIsGenerating(true);
        setAiSuggestion('');

        // Simulate AI generation with typing effect
        await new Promise(resolve => setTimeout(resolve, 1500));
        const suggestion = generateAISuggestion(question);
        setAiSuggestion(suggestion);
        setIsGenerating(false);
    };

    const handleSubmit = () => {
        if (!question.trim() || !aiSuggestion) return;
        submitQuestion(patientId, patientUserId, question, aiSuggestion);
        setQuestion('');
        setAiSuggestion('');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
    };

    return (
        <div>
            {submitted && (
                <div className="animate-fade-in" style={{ padding: '1rem', marginBottom: '1.25rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle size={20} color="#10b981" />
                    <div>
                        <div style={{ fontWeight: 600, color: '#059669', fontSize: '0.875rem' }}>Question Submitted Successfully!</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.125rem' }}>
                            Your doctor and nurse have been notified. You'll receive a response via notifications.
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>
                    What would you like to ask your medical team?
                </label>
                <textarea
                    className="input"
                    rows={5}
                    placeholder="Type your health question here... e.g., 'My blood sugar readings have been above 200 for the past week even though I am taking Metformin. Should I increase the dose?'"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}
                />
            </div>

            <button
                className="btn btn-accent"
                onClick={handleAskAI}
                disabled={!question.trim() || isGenerating}
                style={{ marginBottom: '1.5rem' }}
            >
                {isGenerating ? (
                    <><Loader2 size={16} className="spin" /> Analyzing your question...</>
                ) : (
                    <><Brain size={16} /> Get AI Analysis</>
                )}
            </button>

            {/* AI Suggestion Display */}
            {aiSuggestion && (
                <div className="animate-fade-in" style={{ marginBottom: '1.25rem' }}>
                    <div style={{
                        padding: '1.25rem', background: 'rgba(6,182,212,0.06)',
                        border: '1px solid rgba(6,182,212,0.2)', borderRadius: 'var(--radius-lg)',
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-accent-light)',
                        }}>
                            <Brain size={18} color="var(--color-accent)" />
                            AI Health Analysis
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                            {aiSuggestion}
                        </div>
                    </div>
                </div>
            )}

            {aiSuggestion && (
                <div style={{
                    padding: '1rem', background: 'rgba(245,158,11,0.06)',
                    border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                }}>
                    <p style={{ fontSize: '0.8125rem', color: '#d97706' }}>
                        <AlertCircle size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
                        Your question along with the AI analysis will be sent to your doctor and nurse for review. They will provide a professional response.
                    </p>
                </div>
            )}

            {aiSuggestion && (
                <button className="btn btn-primary" onClick={handleSubmit} style={{ minWidth: 280 }}>
                    <Send size={16} /> Submit Question to Medical Team
                </button>
            )}

            {/* Quick Question Presets */}
            <div style={{ marginTop: '2rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Common Questions
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[
                        'My blood sugar is too high, what should I do?',
                        'I feel pain after taking my medication',
                        'When is my next appointment?',
                        'Can I take ibuprofen with my current medications?',
                        'I have a headache and mild fever',
                    ].map((q) => (
                        <button
                            key={q}
                            className="btn btn-sm btn-secondary"
                            onClick={() => setQuestion(q)}
                            style={{ fontSize: '0.75rem' }}
                        >
                            {q.slice(0, 40)}...
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}


// ═══ SUB-TAB: Patient Notifications ═════════════════════════════
function PatientNotifications({ questions, getUserNotifications, markNotificationRead, userId, getUser }) {
    const notifs = getUserNotifications(userId);

    return (
        <div>
            {notifs.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                    <Bell size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p>No notifications yet</p>
                </div>
            ) : (
                notifs.map(notif => {
                    const relatedQ = questions.find(q => q.id === notif.relatedQuestionId);

                    return (
                        <div
                            key={notif.id}
                            onClick={() => markNotificationRead(notif.id)}
                            className="card-flat"
                            style={{
                                marginBottom: '0.5rem', padding: '1rem 1.25rem',
                                cursor: 'pointer',
                                borderLeft: `4px solid ${notif.read ? 'var(--color-border)' : notif.type === 'question_answered' ? '#059669' : '#0d9488'}`,
                                opacity: notif.read ? 0.6 : 1,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: notif.type === 'question_answered' ? 'rgba(5,150,105,0.1)' : 'rgba(13,148,136,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    {notif.type === 'question_answered' ? <CheckCircle size={18} color="#059669" /> : <Bell size={18} color="#0d9488" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                        {notif.title}
                                        {!notif.read && <span style={{ marginLeft: 8, width: 8, height: 8, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />}
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{notif.message}</div>
                                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                        {new Date(notif.createdAt).toLocaleString()}
                                    </div>

                                    {/* Show response if it's a question_answered notification */}
                                    {notif.type === 'question_answered' && relatedQ && relatedQ.status === 'answered' && (
                                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                                Response from {getUser(relatedQ.respondedBy)?.name || 'Medical Staff'}
                                            </div>
                                            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                                {relatedQ.doctorResponse || relatedQ.nurseResponse}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════
// ═══ MAIN PATIENT DASHBOARD ═════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
export default function PatientDashboard() {
    const { user } = useAuth();
    const {
        patients, vitals, prescriptions, reports, questions,
        getPatientByUserId, getPatientReports, getPatientPrescriptions,
        getPatientVitals, getPatientQuestions, getUser,
        submitQuestion, getUserNotifications, markNotificationRead
    } = useApp();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'reports');
    const [patient, setPatient] = useState(null);
    const [dbVitals, setDbVitals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
        else setActiveTab('reports');
    }, [searchParams]);

    // Fetch patient profile from MongoDB
    useEffect(() => {
        if (!user?.email) return;
        (async () => {
            try {
                const resp = await apiGetPatientProfile(user.email);
                if (resp?.profile) {
                    setPatient(resp.profile);
                    // Also fetch vitals
                    try {
                        const vResp = await apiGetMyVitals(user.email);
                        setDbVitals(vResp?.vitals || []);
                    } catch {}
                }
            } catch (err) { console.error('Failed to load patient profile:', err); }
            finally { setLoading(false); }
        })();
    }, [user?.email]);

    // Fallback to mock data if not in MongoDB
    const mockPatient = getPatientByUserId(user?.id);
    const effectivePatient = patient || mockPatient;

    const patientReports = effectivePatient ? getPatientReports(effectivePatient.id) : [];
    const patientRx = effectivePatient ? getPatientPrescriptions(effectivePatient.id) : [];
    const patientVitals = dbVitals.length > 0 ? dbVitals : (effectivePatient ? getPatientVitals(effectivePatient.id) : []);
    const patientQuestions = effectivePatient ? getPatientQuestions(effectivePatient.id) : [];
    const notifs = getUserNotifications(user?.id);
    const unreadCount = notifs.filter(n => !n.read).length;

    const tabs = [
        { id: 'reports', label: 'My Reports', icon: FileText },
        { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
        { id: 'vitals', label: 'My Vitals', icon: Activity },
        { id: 'ask', label: 'Ask AI Question', icon: Brain },
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    ];

    if (loading) {
        return (
            <div className="page-container">
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Loader2 size={40} color="#059669" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--color-text-secondary)' }}>Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!effectivePatient) {
        return (
            <div className="page-container">
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <AlertCircle size={56} color="#f59e0b" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Profile Not Linked</h2>
                    <p style={{ color: 'var(--color-text-secondary)', maxWidth: 450, margin: '0 auto' }}>
                        Your account has not been linked to a patient record yet. Please ask the front desk or nurse to register you, or contact support.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <HeroBanner
                role="patient"
                title={`Welcome, ${effectivePatient.name}`}
                subtitle={`${effectivePatient.email} · ${effectivePatient.age} yrs · ${effectivePatient.gender || ''} · Blood Group: ${effectivePatient.blood_group || effectivePatient.bloodGroup || ''}`}
            >
                {(effectivePatient.conditions || []).length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8, color: '#5eead4' }}>Known Conditions:</div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {effectivePatient.conditions.map(c => (
                                <span key={c} style={{
                                    background: 'rgba(94, 234, 212, 0.1)',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: '#5eead4',
                                    border: '1px solid rgba(94, 234, 212, 0.2)'
                                }}>
                                    {c}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </HeroBanner>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Reports', value: patientReports.length, icon: FileText, color: '#10b981' },
                    { label: 'Prescriptions', value: patientRx.length, icon: Pill, color: '#0d9488' },
                    { label: 'Vitals Records', value: patientVitals.length, icon: Activity, color: '#047857' },
                    { label: 'Notifications', value: unreadCount, icon: Bell, color: unreadCount > 0 ? '#f59e0b' : '#10b981' },
                ].map(s => (
                    <div key={s.label} className="card-flat" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <s.icon size={22} color={s.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border-light)', overflowX: 'auto' }}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="btn" style={{
                            background: 'none', border: 'none', borderBottom: isActive ? '2px solid #059669' : '2px solid transparent',
                            borderRadius: 0, color: isActive ? '#059669' : 'var(--color-text-secondary)',
                            fontWeight: isActive ? 600 : 400, padding: '0.75rem 1rem', fontSize: '0.8125rem', whiteSpace: 'nowrap',
                        }}>
                            <Icon size={15} /> {tab.label}
                            {tab.badge > 0 && <span style={{ marginLeft: 6, background: '#ef4444', color: 'white', fontSize: '0.625rem', fontWeight: 700, padding: '0.0625rem 0.375rem', borderRadius: 'var(--radius-full)', minWidth: 18, textAlign: 'center', display: 'inline-block' }}>{tab.badge}</span>}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
                {activeTab === 'reports' && (
                    <MyReports reports={patientReports} patientId={effectivePatient.id} getUser={getUser} prescriptions={prescriptions} vitals={vitals} patient={effectivePatient} />
                )}

                {activeTab === 'prescriptions' && (
                    <div>
                        {patientRx.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                                <Pill size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>No prescriptions yet</p>
                            </div>
                        ) : (
                            patientRx.map(rx => {
                                const doctor = getUser(rx.doctorId);
                                return (
                                    <div key={rx.id} className="card-flat" style={{ marginBottom: '0.75rem', padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{rx.diagnosis}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.125rem' }}>
                                                    {rx.id} · {doctor?.name || 'Doctor'} · {new Date(rx.prescribedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <span className="badge badge-success">{rx.status}</span>
                                        </div>

                                        <div className="table-container" style={{ marginBottom: rx.notes ? '0.75rem' : 0 }}>
                                            <table>
                                                <thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead>
                                                <tbody>
                                                    {rx.medicines.map((m, i) => (
                                                        <tr key={i}>
                                                            <td style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{m.name}</td>
                                                            <td>{m.dosage}</td>
                                                            <td>{m.frequency}</td>
                                                            <td>{m.duration}</td>
                                                            <td style={{ fontSize: '0.8125rem' }}>{m.instructions}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {rx.notes && (
                                            <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(245,158,11,0.06)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: '#d97706' }}>
                                                <strong>Note:</strong> {rx.notes}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {activeTab === 'vitals' && (
                    <div>
                        {patientVitals.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                                <Activity size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>No vitals recorded yet</p>
                            </div>
                        ) : (
                            patientVitals.map((v, idx) => (
                                <div key={v.id || idx} className="card-flat" style={{ marginBottom: '0.75rem', padding: '1.25rem' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: '0.75rem' }}>
                                        Recorded on {new Date(v.recorded_at || v.recordedAt).toLocaleString()}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                        {[
                                            { l: 'Temperature', v: `${v.temperature}°F`, w: v.temperature > 99.5 },
                                            { l: 'Blood Pressure', v: `${v.bp_systolic || v.bloodPressureSystolic}/${v.bp_diastolic || v.bloodPressureDiastolic} mmHg`, w: (v.bp_systolic || v.bloodPressureSystolic) > 140 },
                                            { l: 'Heart Rate', v: `${v.heart_rate || v.heartRate} bpm` },
                                            { l: 'SpO2', v: `${v.oxygen_saturation || v.oxygenSaturation}%`, w: (v.oxygen_saturation || v.oxygenSaturation) < 95 },
                                            { l: 'Weight', v: `${v.weight} kg` },
                                            { l: 'Resp Rate', v: `${v.respiratory_rate || v.respiratoryRate}/min` },
                                            { l: 'Blood Sugar (Fasting)', v: `${v.blood_sugar_fasting || v.bloodSugarFasting} mg/dL`, w: (v.blood_sugar_fasting || v.bloodSugarFasting) > 130 },
                                            { l: 'Blood Sugar (PP)', v: `${v.blood_sugar_pp || v.bloodSugarPP} mg/dL`, w: (v.blood_sugar_pp || v.bloodSugarPP) > 180 },
                                        ].map(item => (
                                            <div key={item.l} style={{ padding: '0.5rem', background: item.w ? 'rgba(245,158,11,0.06)' : 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)', border: item.w ? '1px solid rgba(245,158,11,0.2)' : 'none' }}>
                                                <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>{item.l}</div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: item.w ? '#fbbf24' : 'var(--color-text-primary)' }}>{item.v}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {v.notes && <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>Note: {v.notes}</div>}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'ask' && (
                    <AskQuestion patientId={effectivePatient.id} patientUserId={user.id} submitQuestion={submitQuestion} />
                )}

                {activeTab === 'notifications' && (
                    <PatientNotifications questions={patientQuestions} getUserNotifications={getUserNotifications} markNotificationRead={markNotificationRead} userId={user.id} getUser={getUser} />
                )}
            </div>
        </div>
    );
}
