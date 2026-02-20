/* =====================================================
   CyberSaathi - script.js
   UI interactions only; n8n hooks are TODO stubs
   ===================================================== */

// =====================
// NAVBAR SCROLL EFFECT
// =====================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
});

// =====================
// SCAM ANALYZER
// =====================
const msgInput = document.getElementById('msg-input');
const charCount = document.getElementById('char-count');
const analyzeBtn = document.getElementById('analyze-btn');
const resultBox = document.getElementById('analyzer-result');

// Character counter
msgInput.addEventListener('input', () => {
    charCount.textContent = `${msgInput.value.length} / 2000`;
});

// Keyword-based risk scoring (mock logic; replace with n8n webhook later)
function analyzeRisk(text) {
    const lower = text.toLowerCase();

    const highKeywords = [
        'otp', 'cvv', 'pin', 'password', 'urgent', 'immediately', 'expire',
        'blocked', 'arrested', 'court', 'aadhaar', 'lottery won', 'prize money',
        'click here', 'verify now', 'limited time', 'claim your', 'free money',
        'transfer now', 'send money', 'congratulations you'
    ];
    const medKeywords = [
        'offer', 'discount', 'reward', 'job offer', 'work from home',
        'part time', 'earn daily', 'investment', 'upi', 'link', 'confirm',
        'bank account', 'kyc', 'your account'
    ];

    let score = 0;
    highKeywords.forEach(kw => { if (lower.includes(kw)) score += 3; });
    medKeywords.forEach(kw => { if (lower.includes(kw)) score += 1; });

    // Suspicious URL patterns
    if (/http[s]?:\/\//.test(lower)) score += 2;
    if (/bit\.ly|tinyurl|t\.co|rb\.gy/i.test(lower)) score += 3;

    if (score >= 6) {
        return {
            level: 'High',
            cls: 'high',
            icon: 'fa-triangle-exclamation',
            explanation: 'This message contains multiple indicators of a scam — urgency language, sensitive data requests, or suspicious links.',
            action: 'Do NOT respond or click any link. Block the sender immediately and report via the form below.'
        };
    } else if (score >= 2) {
        return {
            level: 'Medium',
            cls: 'medium',
            icon: 'fa-circle-exclamation',
            explanation: 'This message has some suspicious patterns. It may be promotional spam or an early-stage phishing attempt.',
            action: 'Proceed with caution. Verify the sender through official channels before taking any action.'
        };
    } else {
        return {
            level: 'Low',
            cls: 'low',
            icon: 'fa-circle-check',
            explanation: 'No significant scam indicators detected. The message appears benign based on available signals.',
            action: 'Seems safe. Still, never share OTP, PIN, or passwords with anyone.'
        };
    }
}

analyzeBtn.addEventListener('click', async () => {
    const text = msgInput.value.trim();
    if (!text) {
        msgInput.focus();
        msgInput.style.borderColor = 'var(--danger)';
        setTimeout(() => { msgInput.style.borderColor = ''; }, 2000);
        return;
    }

    // Loading state
    analyzeBtn.classList.add('spinning');
    analyzeBtn.disabled = true;
    resultBox.classList.remove('show');

    // TODO: Replace with n8n webhook call
    // const response = await fetch('YOUR_N8N_WEBHOOK_URL/analyze', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ message: text })
    // });
    // const data = await response.json();

    // Simulate async (remove when n8n is connected)
    await sleep(1400);

    const result = analyzeRisk(text);

    // Render result
    document.getElementById('risk-badge-container').innerHTML =
        `<span class="risk-badge ${result.cls}">
           <i class="fas ${result.icon}"></i> Risk Level: ${result.level}
         </span>`;
    document.getElementById('result-explanation').textContent = result.explanation;
    document.getElementById('result-action').textContent = result.action;

    resultBox.classList.add('show');
    analyzeBtn.classList.remove('spinning');
    analyzeBtn.disabled = false;
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// =====================
// AI CHAT
// =====================
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

// Mock AI responses (replace with n8n AI webhook)
const aiResponses = {
    default: "I'm here to help with any cybersecurity concern. Could you give me a bit more detail?",
    "suspicious link": "⚠️ Never click on suspicious links! If you received one, do NOT open it. Check the URL carefully — scammers often use look-alike domains (e.g., 'amaz0n.com'). Report it to your bank or platform immediately.",
    "otp": "🚨 No legitimate bank, government body, or company will EVER ask for your OTP. If someone asked for your OTP, it is a scam. Do not share it. If you already did, call your bank immediately to block your account.",
    "job offer": "🛑 Fake job offers are very common. Red flags: no interview, high pay for easy work, upfront fees, asking for personal documents. Always verify through the official company website before applying.",
    "bank verification": "🏦 Banks will never call asking for your card number, CVV, OTP, or net banking password. If you received such a call, hang up and call your bank directly using the number on their official website.",
    "kyc": "📄 KYC fraud involves scammers posing as bank/Aadhaar representatives. They ask for documents or OTPs to 'update your KYC'. Your bank will never ask for OTP over a KYC call. Report this to your bank.",
    "phishing": "🎣 Phishing attempts come as fake emails/SMS from trusted-looking sources. Check the sender's email domain, avoid clicking links, and go directly to the official website.",
    "upi": "💳 UPI frauds often involve 'collect requests' sent to your UPI app. Entering your PIN sends money OUT — not in. Never approve requests you didn't initiate.",
};

function getAIReply(query) {
    const lower = query.toLowerCase();
    for (const [key, val] of Object.entries(aiResponses)) {
        if (lower.includes(key)) return val;
    }
    return aiResponses.default;
}

function appendMsg(text, type) {
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.innerHTML = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
    const el = document.createElement('div');
    el.className = 'typing-indicator';
    el.id = 'typing';
    el.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
function removeTyping() {
    const el = document.getElementById('typing');
    if (el) el.remove();
}

async function sendMessage(query) {
    const text = query || chatInput.value.trim();
    if (!text) return;

    appendMsg(text, 'user');
    chatInput.value = '';
    showTyping();

    // TODO: Replace with n8n AI webhook
    // const response = await fetch('YOUR_N8N_WEBHOOK_URL/chat', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ message: text })
    // });
    // const data = await response.json();
    // const reply = data.reply;

    await sleep(1200);
    removeTyping();
    const reply = getAIReply(text);
    appendMsg(reply, 'bot');
}

sendBtn.addEventListener('click', () => sendMessage());
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.query));
});

// =====================
// REPORTING FORM + FIR PREVIEW
// =====================
const form = document.getElementById('cybercrime-form');
const evidenceInput = document.getElementById('f-evidence');
const fileLabelText = document.getElementById('file-label-text');

// Live FIR Preview
function updateFIR() {
    const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const fraudType = document.getElementById('f-fraud-type').value;
    const desc = document.getElementById('f-description').value.trim();

    const firType = document.getElementById('fir-type');
    const firDesc = document.getElementById('fir-desc');

    document.getElementById('fir-date').textContent = now;

    firType.textContent = fraudType || 'Not selected';
    firType.className = `fir-val ${fraudType ? 'has-content' : ''}`;

    firDesc.textContent = desc || 'No details provided yet.';
    firDesc.className = `fir-val ${desc ? 'has-content' : ''}`;
}

['f-fraud-type', 'f-description'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateFIR);
});

evidenceInput.addEventListener('change', () => {
    if (evidenceInput.files.length > 0) {
        const name = evidenceInput.files[0].name;
        fileLabelText.textContent = name;
        document.getElementById('fir-evidence').textContent = name;
        document.getElementById('fir-evidence').className = 'fir-val has-content';
    }
});

// Set date on load
document.getElementById('fir-date').textContent = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

// Form submit
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const contact = document.getElementById('f-contact').value.trim();
    const type = document.getElementById('f-fraud-type').value;
    const desc = document.getElementById('f-description').value.trim();

    if (!contact || !type || !desc) {
        alert('Please fill in all required fields.');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    // TODO: Replace with n8n webhook
    // await fetch('YOUR_N8N_WEBHOOK_URL/report', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ contact, type, description: desc })
    // });

    await sleep(1500);

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-flag"></i> Submit Report';
    document.getElementById('success-toast').classList.add('show');

    // Auto-hide after 5s
    setTimeout(() => document.getElementById('success-toast').classList.remove('show'), 5000);
});

// =====================
// UTILITY
// =====================
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// Initialize FIR date
updateFIR();
