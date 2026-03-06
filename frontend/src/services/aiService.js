// ===== AI Processing Service =====
// Simulates the AI pipeline: NLP → Intent Classification → Context Retrieval → Response Generation

import { knowledgeBase, intentCategories } from '../data/mockData';

// Simulate NLP processing delay
const simulateDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Extract entities from text using keyword matching (simplified NLP)
export const extractEntities = (text) => {
    const medicalTerms = [
        'blood sugar', 'glucose', 'insulin', 'diabetes', 'hypertension', 'blood pressure',
        'medication', 'prescription', 'inhaler', 'statin', 'metformin', 'atorvastatin',
        'pain', 'headache', 'migraine', 'fatigue', 'swelling', 'edema', 'fever',
        'nausea', 'dizziness', 'chest pain', 'shortness of breath', 'anxiety',
        'appointment', 'reschedule', 'refill', 'lab results', 'test results',
        'billing', 'insurance', 'copay', 'consultation',
        'weight', 'BMI', 'cholesterol', 'kidney', 'cardiac', 'echocardiogram',
    ];

    const lower = text.toLowerCase();
    return medicalTerms.filter(term => lower.includes(term));
};

// Classify intent from text
export const classifyIntent = (text) => {
    const lower = text.toLowerCase();
    const scores = {};

    const intentKeywords = {
        appointment: ['appointment', 'schedule', 'reschedule', 'book', 'visit', 'session', 'available', 'slot'],
        medication: ['medication', 'medicine', 'drug', 'side effect', 'dosage', 'statin', 'metformin', 'atorvastatin', 'prescribed'],
        symptom: ['symptom', 'pain', 'ache', 'swelling', 'fever', 'nausea', 'dizzy', 'thirsty', 'fatigue', 'worse', 'blood sugar high'],
        billing: ['bill', 'billing', 'charge', 'insurance', 'payment', 'cost', 'copay', 'invoice', 'coverage'],
        lab_results: ['lab', 'test results', 'blood work', 'report', 'echocardiogram', 'MRI', 'scan', 'X-ray'],
        referral: ['refer', 'referral', 'specialist', 'second opinion'],
        prescription: ['refill', 'prescription', 'inhaler', 'renewal', 'pharmacy', 'running low', 'out of'],
        general: ['question', 'information', 'wondering', 'curious', 'how does'],
        urgent: ['emergency', 'urgent', 'severe', 'can\'t breathe', 'chest pain', 'unconscious', 'bleeding'],
        follow_up: ['follow up', 'following up', 'update', 'checking in', 'any news'],
    };

    for (const [intent, keywords] of Object.entries(intentKeywords)) {
        scores[intent] = keywords.reduce((score, keyword) => {
            return score + (lower.includes(keyword) ? 1 : 0);
        }, 0);
    }

    const sortedIntents = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topIntent = sortedIntents[0];
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? Math.min(0.99, 0.65 + (topIntent[1] / totalScore) * 0.35) : 0.5;

    return {
        intent: topIntent[1] > 0 ? topIntent[0] : 'general',
        confidence: parseFloat(confidence.toFixed(2)),
        allScores: scores,
    };
};

// Analyze sentiment
export const analyzeSentiment = (text) => {
    const lower = text.toLowerCase();
    const worried = ['worried', 'concerned', 'scared', 'afraid', 'anxious', 'nervous', 'worse', 'serious', 'emergency'];
    const positive = ['thank', 'grateful', 'better', 'improving', 'helpful', 'great', 'fine', 'good'];
    const frustrated = ['frustrated', 'angry', 'upset', 'ridiculous', 'unfair', 'wrong', 'complaint'];
    const confused = ['confused', 'don\'t understand', 'unclear', 'not sure', 'thought'];

    const worryScore = worried.filter(w => lower.includes(w)).length;
    const positiveScore = positive.filter(w => lower.includes(w)).length;
    const frustratedScore = frustrated.filter(w => lower.includes(w)).length;
    const confusedScore = confused.filter(w => lower.includes(w)).length;

    const scores = { worried: worryScore, positive: positiveScore, frustrated: frustratedScore, confused: confusedScore, neutral: 1 };
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return top[0] === 'neutral' && Object.values(scores).every(v => v <= 1) ? 'neutral' : top[0];
};

// Determine urgency
export const assessUrgency = (text, entities, intent) => {
    const lower = text.toLowerCase();
    const criticalTerms = ['emergency', 'can\'t breathe', 'chest pain', 'unconscious', 'severe bleeding', 'stroke'];
    const highTerms = ['high blood sugar', 'above 200', 'worsening', 'severe pain', 'muscle damage', 'swelling', 'blood pressure high'];
    const mediumTerms = ['side effect', 'concerning', 'worried', 'changed', 'different'];

    if (criticalTerms.some(t => lower.includes(t))) return 'critical';
    if (intent === 'urgent') return 'critical';
    if (highTerms.some(t => lower.includes(t))) return 'high';
    if (mediumTerms.some(t => lower.includes(t))) return 'medium';
    return 'low';
};

// Retrieve relevant knowledge base articles
export const retrieveContext = (entities, intent) => {
    const relevant = knowledgeBase.filter(kb => {
        const tagMatch = kb.tags.some(tag =>
            entities.some(entity => entity.toLowerCase().includes(tag) || tag.includes(entity.toLowerCase()))
        );
        const categoryMatch = kb.category.toLowerCase().includes(intent) || intent.includes(kb.category.toLowerCase());
        return tagMatch || categoryMatch;
    });

    return relevant.slice(0, 4).map(kb => ({
        id: kb.id,
        title: kb.title,
        content: kb.content,
        category: kb.category,
        relevanceScore: Math.random() * 0.3 + 0.7, // Simulated relevance score
    }));
};

// Generate AI response draft
export const generateResponseDraft = (message, classification, context, patient) => {
    const { intent, confidence } = classification;
    const intentInfo = intentCategories.find(i => i.id === intent);

    // Template-based generation (simulating LLM output)
    const templates = {
        symptom: `Dear ${patient.name.split(' ')[0]},\n\nThank you for reporting your symptoms. Based on your description and medical history, I want to address your concerns.\n\n**Assessment:**\nYour symptoms have been noted and cross-referenced with your medical records. Given your conditions (${patient.conditions.join(', ')}), this warrants careful attention.\n\n**Recommendations:**\n1. Please monitor your symptoms closely and note any changes\n2. I recommend scheduling an appointment within the next 24-48 hours\n3. Continue your current medications as prescribed\n4. Stay well hydrated and get adequate rest\n\n**When to seek immediate care:**\nIf you experience severe symptoms such as chest pain, difficulty breathing, or sudden worsening, please visit the emergency department.\n\nWe'll review your case thoroughly at your next visit.\n\nBest regards,\n${patient.provider}`,

        medication: `Dear ${patient.name.split(' ')[0]},\n\nThank you for reaching out about your medication concerns. Your proactive approach to managing your health is appreciated.\n\n**Regarding your medication query:**\nI've reviewed your current prescriptions and medical history. Side effects you're experiencing should be evaluated to ensure your treatment remains optimal.\n\n**Action Plan:**\n1. Do not discontinue any medication without consulting us first\n2. I'm ordering relevant lab work to assess any potential complications\n3. We may need to adjust your current medication regimen\n4. Let's schedule a follow-up to discuss alternatives if needed\n\nPlease get the lab work done within the next 48 hours.\n\nBest regards,\n${patient.provider}`,

        appointment: `Dear ${patient.name.split(' ')[0]},\n\nThank you for your scheduling request. I'd be happy to help accommodate your needs.\n\n**Available slots:**\n• Option 1: Tomorrow at 10:00 AM\n• Option 2: Day after tomorrow at 2:30 PM\n• Option 3: Next week Monday at 11:00 AM\n\nPlease let us know your preferred time and we'll confirm the booking right away.\n\nBest regards,\n${patient.provider}'s Office`,

        prescription: `Dear ${patient.name.split(' ')[0]},\n\nYour prescription refill request has been received and processed.\n\n**Refill Details:**\n• Your pharmacy has been notified\n• Expected availability: Within 24 hours\n• Please pick up with a valid ID\n\n**Reminders:**\n• Your next check-up is due in approximately 3 months\n• Continue taking medications as prescribed\n• Contact us if you experience any new symptoms\n\nBest regards,\n${patient.provider}'s Office`,

        billing: `Dear ${patient.name.split(' ')[0]},\n\nThank you for your billing inquiry. I've looked into your account.\n\n**Account Review:**\nWe've reviewed the charges in question and are working on resolving this with your insurance provider.\n\n**Next Steps:**\n1. A corrected claim is being submitted to your insurance\n2. Please hold off on payment until you receive an updated statement\n3. You should hear back within 5-7 business days\n\nIf you have further questions, please contact our billing department.\n\nBest regards,\nTetherX Billing Support`,

        general: `Dear ${patient.name.split(' ')[0]},\n\nThank you for your message. I'd be happy to help with your inquiry.\n\nI've reviewed your question and here's what I can share:\n\n${message.body ? 'Your message has been carefully reviewed by our team. We want to ensure you receive accurate and helpful information.' : ''}\n\nPlease don't hesitate to reach out if you need any further clarification.\n\nBest regards,\n${patient.provider}`,
    };

    const content = templates[intent] || templates.general;

    return {
        content,
        generatedAt: new Date().toISOString(),
        status: 'pending',
        knowledgeRefs: context.map(c => c.id),
        confidence,
        intentLabel: intentInfo?.label || 'General Inquiry',
    };
};

// Full AI pipeline: processes a raw message end-to-end
export const processMessage = async (messageText, patient, onStageUpdate) => {


    // Stage 1: Ingestion
    onStageUpdate?.('ingestion', 'processing');
    await simulateDelay(600);
    onStageUpdate?.('ingestion', 'complete');

    // Stage 2: NLP
    onStageUpdate?.('nlp', 'processing');
    await simulateDelay(800);
    const entities = extractEntities(messageText);
    const sentiment = analyzeSentiment(messageText);
    onStageUpdate?.('nlp', 'complete');

    // Stage 3: Intent Classification
    onStageUpdate?.('intent', 'processing');
    await simulateDelay(600);
    const classification = classifyIntent(messageText);
    const urgency = assessUrgency(messageText, entities, classification.intent);
    onStageUpdate?.('intent', 'complete');

    // Stage 4: Context Retrieval
    onStageUpdate?.('context', 'processing');
    await simulateDelay(700);
    const context = retrieveContext(entities, classification.intent);
    onStageUpdate?.('context', 'complete');

    // Stage 5: Response Generation
    onStageUpdate?.('generation', 'processing');
    await simulateDelay(1000);
    const draft = generateResponseDraft(
        { body: messageText },
        classification,
        context,
        patient
    );
    onStageUpdate?.('generation', 'complete');

    return {
        classification: {
            intent: classification.intent,
            confidence: classification.confidence,
            sentiment,
            urgency,
            entities,
        },
        contextReferences: context,
        draft,
    };
};
