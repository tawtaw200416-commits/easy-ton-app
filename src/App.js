import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606"); // User ရဲ့ Memo ID အဖြစ် သုံးမည်
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [socialView, setSocialView] = useState('list');

  // အရင် Code အဟောင်းမှ Logic များ
  const adminWallet = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";
  const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN"; 
  const ADMIN_CHAT_ID = "YOUR_CHAT_ID";

  const copyToClipboard = (text) => { 
    navigator.clipboard.writeText(text); 
    alert("Copied: " + text); 
  };

  const handleConfirmPayment = () => {
    const channelName = document.getElementById('chan_name').value;
    const inviteLink = document.getElementById('inv_link').value;
    const plan = document.getElementById('plan_select').value;

    if (channelName && inviteLink) {
      const message = `📢 *New Social Task Order*\n\n` +
                      `👤 User Memo: \`${userUID}\`\n` +
                      `📺 Channel: ${channelName}\n` +
                      `🔗 Link: ${inviteLink}\n` +
                      `💳 Plan: ${plan}`;

      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${ADMIN_CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=Markdown`)
        .then(() => {
          alert("Payment details sent to Admin. Your task will be active after verification!");
          setSocialView('list');
        })
        .catch(() => alert("Error sending request."));
    } else {
      alert("Please fill in all details.");
    }
  };

  const styles = {
    // အရင် style များအတိုင်းထားရှိသည်
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '8px', border: '1px solid #334155' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    copyBox: { background: 'rgba(251,191,36,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid #fbbf24', textAlign: 'center', cursor: 'pointer', marginBottom: '10px' },
    label: { color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '5px', textAlign: 'left' }
  };

  return (
    <div style={{ backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px' }}>
      {/* Earn Header & Tabs (Code အဟောင်းအတိုင်း) */}
      
      {activeTab === 'social' && socialView === 'add' && (
        <div style={styles.card}>
          <h3 style={{ color: '#fbbf24', marginTop: 0 }}>Add New Task</h3>
          
          <input id="chan_name" style={styles.input} placeholder="Channel Name" />
          <input id="inv_link" style={styles.input} placeholder="Invite Link" />
          
          <select id="plan_select" style={styles.input}>
            <option>100 Views - 0.2 TON</option>
            <option>200 Views - 0.4 TON</option>
          </select>

          {/* TON Wallet Address Box */}
          <span style={styles.label}>TON Wallet (Click to Copy)</span>
          <div style={styles.copyBox} onClick={() => copyToClipboard(adminWallet)}>
            <b style={{ fontSize: '13px' }}>{adminWallet.slice(0, 15)}...{adminWallet.slice(-5)}</b>
          </div>

          {/* Memo ID Box (အသစ်ထည့်သွင်းမှု) */}
          <span style={styles.label}>Required Memo ID (Click to Copy)</span>
          <div style={{ ...styles.copyBox, borderStyle: 'dashed', borderColor: '#ef4444' }} onClick={() => copyToClipboard(userUID)}>
            <b style={{ fontSize: '18px', color: '#fbbf24' }}>{userUID}</b>
            <p style={{ margin: '5px 0 0', fontSize: '10px', color: '#ef4444' }}>*Must include this Memo in your transaction</p>
          </div>

          <button style={styles.yellowBtn} onClick={handleConfirmPayment}>
            CONFIRM PAYMENT
          </button>
          
          <p style={{ textAlign: 'center', marginTop: '15px', cursor: 'pointer', color: '#94a3b8' }} 
             onClick={() => setSocialView('list')}>Back</p>
        </div>
      )}

      {/* ကျန်ရှိသော Code အဟောင်းများ */}
    </div>
  );
}

export default App;
