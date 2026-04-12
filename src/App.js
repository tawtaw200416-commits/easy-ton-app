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
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then(() => {
        setBalance(prev => Number((prev + 0.0005).toFixed(5)));
        setCompleted(prev => [...prev, id]);
      }).catch(() => alert("Please watch the full ad!"));
    } else {
      setTimeout(() => {
        setBalance(prev => Number((prev + 0.0005).toFixed(5)));
        setCompleted(prev => [...prev, id]);
      }, 5000);
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => alert(`${label} Copied!`));
  };

  const getStatus = (item) => {
    const hoursPast = (Date.now() - item.timestamp) / (1000 * 60 * 60);
    return hoursPast >= 24 ? 'Complete' : 'Pending';
  };

  // --- Styles (Bro တောင်းဆိုထားတဲ့ လင်းလက်တဲ့ အဝါရောင် Theme) ---
  const styles = {
    // လင်းလက်တဲ့ အဝါရောင် နောက်ခံ
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    
    // Balance ပေါ်မယ့် Header အကွက် (အပေါ်ဆုံးက အလွတ်နေရာမှာ ပေါ်မှာပါ)
    headerCard: { 
      textAlign: 'center', 
      background: 'linear-gradient(135deg, #000, #1e293b)', 
      padding: '30px', 
      borderRadius: '25px', 
      marginBottom: '20px', 
      border: '3px solid #fff',
      boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
    },

    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', color: '#000' },
    yellowBtn: { width: '100%', padding: '15px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '15px' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', height: '85px', zIndex: 100 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#94a3b8', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #e2e8f0' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#f1f5f9', color: '#000', border: '2px solid #000', marginBottom: '12px', boxSizing: 'border-box', fontWeight: '900' },
    copyBox: { background: '#f1f5f9', padding: '12px', borderRadius: '12px', border: '1px dashed #000', marginBottom: '10px' }
  };

  return (
    <div style={styles.main}>
      {/* Header - Total Balance (အပေါ်ဆုံးက အလွတ်မှာ ပေါ်လာမယ့် အကွက်) */}
      <div style={styles.headerCard}>
        <small style={{ color: '#facc15', fontWeight: '900', letterSpacing: '2px' }}>MY TOTAL BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '45px', margin: '5px 0', fontWeight: '900' }}>
          {balance.toFixed(4)} <span style={{fontSize:'20px', color: '#facc15'}}>TON</span>
        </h1>
      </div>

      {/* --- EARN SECTION --- */}
      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowAddTask(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: activeTab === t ? '2px solid #fff' : 'none', backgroundColor: activeTab === t ? '#000' : '#fff', color: activeTab === t ? '#fff' : '#000', fontWeight: '900' }}>{t.toUpperCase()}</button>
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

            {activeTab === 'social' && !showAddTask && (
              <>
                <button onClick={() => setShowAddTask(true)} style={{...styles.yellowBtn, backgroundColor: '#facc15', color: '#000', marginBottom: '20px', border: '2px solid #000'}}>+ ADD TASK (PROMOTE)</button>
                {[
                  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
                  { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
                  { id: 's3', name: "@cryptogold_online", link: "https://t.me/cryptogold_online_official" },
                  { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
                  { id: 's5', name: "@USDTcloudminer", link: "https://t.me/USDTcloudminer_channel" },
                  { id: 's6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
                  { id: 's7', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
                  { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
                  { id: 's9', name: "@kombo_crypta", link: "https://t.me/kombo_crypta" },
                  { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
                ].filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}>
                    <span style={{fontWeight: '900'}}>{t.name}</span>
                    <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>JOIN</button>
                  </div>
                ))}
              </>
            )}

            {showAddTask && (
              <div>
                <h3 style={{fontWeight:'900', color:'#000', marginTop:0}}>Promote Ad</h3>
                <input style={styles.input} placeholder="Channel Name (@Username)" />
                <input style={styles.input} placeholder="Channel Link" />
                <button style={styles.yellowBtn} onClick={() => { window.open(APP_CONFIG.ADMIN_TELEGRAM); setShowAddTask(false); }}>CONTACT ADMIN</button>
              </div>
            )}
            
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Reward Code" />
                <button style={styles.yellowBtn}>CLAIM REWARD</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* --- INVITE SECTION --- */}
      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{marginTop: 0, fontWeight: '900', textAlign: 'center'}}>INVITE & EARN</h2>
          <p style={{textAlign: 'center', fontSize: '14px', color: '#64748b', marginBottom: '20px'}}>Earn <strong style={{color: '#000'}}>0.0005 TON</strong> per referral!</p>
          <div style={styles.copyBox}>
            <p style={{fontSize: '11px', wordBreak: 'break-all'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`, "Link")} style={styles.yellowBtn}>COPY LINK</button>
          </div>
        </div>
      )}

      {/* --- WITHDRAW SECTION --- */}
      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{fontWeight: '900'}}>WITHDRAW</h3>
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
