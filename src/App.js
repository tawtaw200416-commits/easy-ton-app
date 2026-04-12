import React, { useState, useEffect } from 'react';

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: "1793453606",
  ADMIN_TELEGRAM: "https://t.me/GrowTeaNews",
  ADSGRAM_BLOCK_ID: "27578",
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_CHAT_ID: "5020977059"
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referralCount, setReferralCount] = useState(() => Number(localStorage.getItem('ref_count')) || 0);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTask, setShowAddTask] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('ref_count', referralCount.toString());
  }, [balance, completed, withdrawHistory, referralCount]);

  const sendWithdrawNotification = (amount) => {
    const message = `🔔 *Withdraw Request!*\n\n👤 User UID: ${APP_CONFIG.MY_UID}\n💰 Amount: ${amount} TON\n📅 Date: ${new Date().toLocaleString()}`;
    fetch(`https://api.telegram.org/bot${APP_CONFIG.ADMIN_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: APP_CONFIG.ADMIN_CHAT_ID, text: message, parse_mode: 'Markdown' })
    }).catch(err => console.error(err));
  };

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    const reward = 0.0005;
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then(() => {
        setBalance(prev => Number((prev + reward).toFixed(5)));
        setCompleted(prev => [...prev, id]);
      }).catch(() => alert("Please watch the full ad!"));
    } else {
      setTimeout(() => {
        setBalance(prev => Number((prev + reward).toFixed(5)));
        setCompleted(prev => [...prev, id]);
      }, 5000);
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => alert(`${label} Copied!`));
  };

  // --- Styles ---
  const styles = {
    // ပိုလင်းတဲ့ Forest Green Background
    main: { backgroundColor: '#064e3b', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    
    // Balance ပေါ်မယ့် Header အကွက် (ပိုလင်းပြီး ရှင်းလင်းအောင် လုပ်ထားပါတယ်)
    headerCard: { 
      textAlign: 'center', 
      background: 'linear-gradient(135deg, #065f46, #022c22)', 
      padding: '25px', 
      borderRadius: '20px', 
      marginBottom: '20px', 
      border: '2px solid #fbbf24',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
    },

    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '15px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '15px' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', borderTop: '2px solid #fbbf24', padding: '15px 0', height: '85px', zIndex: 100 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #334155' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#064e3b', color: 'white', border: '1px solid #334155', marginBottom: '12px', boxSizing: 'border-box', fontWeight: '900' },
    copyBox: { background: '#022c22', padding: '12px', borderRadius: '12px', border: '1px dashed #fbbf24', marginBottom: '10px' }
  };

  return (
    <div style={styles.main}>
      {/* Header - Total Balance Section (ဒါက အပေါ်ဆုံး အလွတ်နေရာမှာ ပေါ်လာမှာပါ) */}
      <div style={styles.headerCard}>
        <small style={{ color: '#fbbf24', fontWeight: '900', letterSpacing: '1px' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0', fontWeight: '900' }}>
          {balance.toFixed(4)} <span style={{fontSize:'18px', color: '#fbbf24'}}>TON</span>
        </h1>
      </div>

      {/* --- EARN SECTION --- */}
      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowAddTask(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: '900' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
              { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
              { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
              { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
              { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
              { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
            ].filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}>
                <span style={{fontWeight: '900'}}>{t.name}</span>
                <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>START</button>
              </div>
            ))}
            
            {/* Social Tasks & Other Tabs (အဟောင်းအတိုင်း ရှိနေပါမည်) */}
          </div>
        </>
      )}

      {/* --- WITHDRAW & INVITE SECTIONS (အဟောင်းအတိုင်း ထိန်းသိမ်းထားပါသည်) --- */}
      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', fontWeight: '900'}}>WITHDRAW</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.yellowBtn} onClick={() => {
            const amount = parseFloat(withdrawAmount);
            if (amount >= 0.1 && amount <= balance) {
              sendWithdrawNotification(amount);
              setWithdrawHistory([{id: Date.now(), amount, timestamp: Date.now()}, ...withdrawHistory]);
              setBalance(prev => Number((prev - amount).toFixed(5)));
              setWithdrawAmount('');
              alert("Withdraw Request Sent!");
            } else alert("Invalid Amount!");
          }}>WITHDRAW NOW</button>
        </div>
      )}

      {/* Navigation Footer */}
      <div style={styles.navBar}>
        <div onClick={() => setActiveNav('earn')} style={styles.navBtn(activeNav === 'earn')}><span style={{fontSize:'22px'}}>💰</span><span>EARN</span></div>
        <div onClick={() => setActiveNav('invite')} style={styles.navBtn(activeNav === 'invite')}><span style={{fontSize:'22px'}}>👥</span><span>INVITE</span></div>
        <div onClick={() => setActiveNav('withdraw')} style={styles.navBtn(activeNav === 'withdraw')}><span style={{fontSize:'22px'}}>💸</span><span>WITHDRAW</span></div>
        <div onClick={() => setActiveNav('profile')} style={styles.navBtn(activeNav === 'profile')}><span style={{fontSize:'22px'}}>👤</span><span>PROFILE</span></div>
      </div>
    </div>
  );
}

export default App;
