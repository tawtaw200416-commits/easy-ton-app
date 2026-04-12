import React, { useState, useEffect } from 'react';

function App() {
  // --- States & Data ---
  const [userUID] = useState("1793453606"); // ဒါက Memo ID အဖြစ်လည်း သုံးမှာပါ
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [isClaimed, setIsClaimed] = useState(() => localStorage.getItem('gift_claimed') === 'true');
  
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [inviteHistory, setInviteHistory] = useState(() => JSON.parse(localStorage.getItem('inv_hist')) || [
    { uid: "189455...", status: "Completed", reward: "0.0005" }
  ]);

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [socialView, setSocialView] = useState('list');

  const adminWallet = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";
  const adsBlockId = "27393";
  
  // Admin Info - ဒါတွေကို Bro ရဲ့ Bot Token နဲ့ Chat ID ပြောင်းပေးပါ
  const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN"; 
  const ADMIN_CHAT_ID = "YOUR_CHAT_ID";

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('inv_hist', JSON.stringify(inviteHistory));
  }, [balance, completed, isClaimed, withdrawHistory, inviteHistory]);

  const botTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" }
  ];

  const socialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" }
  ];

  // --- Handlers ---
  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert("Copied: " + text); };

  const handleAction = (id, link) => {
    window.open(link, '_blank');
    const btn = document.getElementById(`btn-${id}`);
    if (btn) {
      btn.innerText = "VERIFY TASK";
      btn.style.backgroundColor = "#10b981";
      btn.onclick = () => {
        if (window.Adsgram) {
          window.Adsgram.init({ blockId: adsBlockId }).show().then(() => {
            setBalance(p => p + 0.0005);
            setCompleted(p => [...p, id]);
            alert("Reward Added!");
          });
        }
      };
    }
  };

  const handleConfirmPayment = () => {
    const channelName = document.getElementById('chan_name').value;
    const inviteLink = document.getElementById('inv_link').value;
    const plan = document.getElementById('plan_select').value;

    if (channelName && inviteLink) {
      const message = `🔔 *New Order*\n\nUser Memo: \`${userUID}\`\nChannel: ${channelName}\nLink: ${inviteLink}\nPlan: ${plan}`;
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${ADMIN_CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=Markdown`)
        .then(() => { alert("Order Sent to Admin!"); setSocialView('list'); });
    } else { alert("Fill all details!"); }
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '8px', border: '1px solid #334155' },
    socialRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    copyBox: { background: 'rgba(251,191,36,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid #fbbf24', textAlign: 'center', cursor: 'pointer', marginBottom: '10px' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155' },
    warning: { color: '#ef4444', fontSize: '12px', fontWeight: 'bold', border: '1px solid #ef4444', padding: '10px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', marginTop: '15px' }
  };

  return (
    <div style={styles.main}>
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'social' && socialView === 'list' && (
            <>
              <button style={{ ...styles.yellowBtn, marginBottom: '15px' }} onClick={() => setSocialView('add')}>+ ADD TASK (PROMOTE CHANNEL)</button>
              <div style={styles.card}>
                {socialTasks.filter(t => !completed.includes(t.id)).map((s, index) => (
                  <div key={s.id} style={styles.socialRow}>
                    <span>{s.name}</span>
                    <button id={`btn-${s.id}`} onClick={() => handleAction(s.id, s.link)} style={{ ...styles.yellowBtn, width: '85px', padding: '8px' }}>JOIN</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'social' && socialView === 'add' && (
            <div style={styles.card}>
              <h3 style={{ color: '#fbbf24', marginTop: 0, textAlign: 'center' }}>Add New Task</h3>
              <input id="chan_name" style={styles.input} placeholder="Channel Name" />
              <input id="inv_link" style={styles.input} placeholder="Invite Link" />
              <select id="plan_select" style={styles.input}>
                <option>100 Views - 0.2 TON</option>
                <option>200 Views - 0.4 TON</option>
              </select>
              <div style={styles.copyBox} onClick={() => copyToClipboard(adminWallet)}>
                <small style={{ color: '#94a3b8' }}>TON Wallet (Copy)</small><br/>
                <b style={{ fontSize: '13px' }}>{adminWallet.slice(0, 20)}...</b>
              </div>
              <div style={{ ...styles.copyBox, marginTop: '10px' }} onClick={() => copyToClipboard(userUID)}>
                <small style={{ color: '#94a3b8' }}>Memo ID (Copy)</small><br/>
                <b style={{ fontSize: '18px', color: '#fbbf24' }}>{userUID}</b>
              </div>
              <button style={{ ...styles.yellowBtn, marginTop: '15px' }} onClick={handleConfirmPayment}>CONFIRM PAYMENT</button>
              <p style={{ textAlign: 'center', marginTop: '15px', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setSocialView('list')}>Back</p>
            </div>
          )}
          {/* BOT & REWARD sections (အရင်အတိုင်း) */}
        </>
      )}

      {activeNav === 'profile' && (
        <div style={{ textAlign: 'center' }}>
          <div style={styles.card}><p>UID: {userUID}</p></div>
          <div style={styles.warning}>
            ⚠️ NOTICE: FAKE ACCOUNTS AND BOT USERS ARE STRICTLY PROHIBITED. 
            MULTIPLE REGISTRATIONS FROM THE SAME IP WILL RESULT IN AN INSTANT BAN.
          </div>
        </div>
      )}

      <div style={styles.footer}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ textAlign: 'center', color: activeNav === n ? '#fbbf24' : '#64748b', flex: 1, cursor: 'pointer' }}>
            <small>{n.toUpperCase()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
