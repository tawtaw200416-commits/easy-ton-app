import React, { useState, useEffect } from 'react';

// Config Settings
const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: "1793453606", // ဒါက User ရဲ့ UID ပါ
  ADMIN_TELEGRAM: "https://t.me/GrowTeaNews",
  ADSGRAM_BLOCK_ID: "YOUR_BLOCK_ID_HERE"
};

function App() {
  // State Management with LocalStorage (Data မပျောက်အောင် ထိန်းထားပေးခြင်း)
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referralCount, setReferralCount] = useState(() => Number(localStorage.getItem('ref_count')) || 0);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTask, setShowAddTask] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  // အချက်အလက်တွေ ပြောင်းလဲတိုင်း LocalStorage မှာ သိမ်းဆည်းခြင်း
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('ref_count', referralCount.toString());
  }, [balance, completed, withdrawHistory, referralCount]);

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then(() => {
        setBalance(prev => Number((prev + 0.0005).toFixed(5)));
        setCompleted(prev => [...prev, id]);
      }).catch(() => alert("Please watch the full ad to verify!"));
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

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '15px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '15px' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', borderTop: '2px solid #fbbf24', padding: '15px 0', height: '85px', zIndex: 100 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #334155' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '12px', boxSizing: 'border-box', fontWeight: '900' },
    copyBox: { background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px dashed #fbbf24', marginBottom: '10px' }
  };

  return (
    <div style={styles.main}>
      {/* Header Balance Section (အမြဲပေါ်နေမည်) */}
      <div style={{ textAlign: 'center', background: 'linear-gradient(145deg, #1e293b, #0f172a)', padding: '30px', borderRadius: '25px', marginBottom: '25px', border: '2px solid #fbbf24' }}>
        <small style={{ color: '#94a3b8', fontWeight: '900' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', fontSize: '42px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} <span style={{fontSize:'18px'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowAddTask(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: '900' }}>{t.toUpperCase()}</button>
            ))}
          </div>
          {/* Earn Task List Logic (အရင်အတိုင်း) */}
          <div style={styles.card}>
            {activeTab === 'bot' && (
              <p style={{textAlign:'center', color:'#94a3b8'}}>No new bot tasks available.</p>
            )}
            {activeTab === 'social' && !showAddTask && (
              <button onClick={() => setShowAddTask(true)} style={styles.yellowBtn}>+ ADD TASK (PROMOTE)</button>
            )}
            {showAddTask && (
               <div>
                  <h3 style={{color:'#fbbf24'}}>Promote Ad</h3>
                  <input style={styles.input} placeholder="Channel Name (@Username)" />
                  <input style={styles.input} placeholder="Channel Link" />
                  <div style={styles.copyBox}>
                    <small style={{color:'#94a3b8'}}>MEMO (UID): {APP_CONFIG.MY_UID}</small>
                    <button onClick={() => handleCopy(APP_CONFIG.MY_UID, "Memo")} style={{float:'right', background:'#fbbf24', border:'none', borderRadius:'5px', cursor:'pointer'}}>Copy</button>
                    <div style={{clear:'both'}}></div>
                  </div>
                  <button style={styles.yellowBtn} onClick={() => setShowAddTask(false)}>CONFIRM PAYMENT</button>
               </div>
            )}
          </div>
        </>
      )}

      {/* Invite Page (Data မပျောက်အောင် ပြင်ဆင်ထားမှု) */}
      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{color: '#fbbf24', marginTop: 0, fontWeight: '900'}}>INVITE & EARN</h2>
          <p style={{fontSize: '14px', color: '#94a3b8', fontWeight: '900'}}>Invite friends and earn <span style={{color: '#fbbf24'}}>0.0005 TON</span> per referral.</p>
          
          <div style={styles.copyBox}>
            <small style={{color: '#94a3b8', fontSize: '10px'}}>YOUR REFERRAL LINK:</small>
            <p style={{fontSize: '11px', color: '#fff', wordBreak: 'break-all', margin: '10px 0'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`, "Invite Link")} style={styles.yellowBtn}>COPY INVITE LINK</button>
          </div>

          <div style={{...styles.row, borderBottom:'none', marginTop:'20px'}}>
            <span style={{fontWeight:'900'}}>Total Referrals:</span>
            <span style={{color: '#fbbf24', fontWeight:'900', fontSize:'20px'}}>{referralCount} Users</span>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', fontWeight: '900'}}>WITHDRAW</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.yellowBtn} onClick={() => alert("Withdraw logic...")}>WITHDRAW NOW</button>
        </div>
      )}

      {/* Profile Page (UID နဲ့ Status မပျောက်အောင် ပြင်ဆင်ထားမှု) */}
      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{color: '#fbbf24', marginTop: 0, fontWeight: '900', textAlign:'center'}}>USER PROFILE</h2>
          <div style={{textAlign:'center', marginBottom:'20px'}}>
            <div style={{width:'80px', height:'80px', background:'#fbbf24', borderRadius:'50%', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px'}}>👤</div>
          </div>
          
          <div style={styles.row}>
            <span style={{color:'#94a3b8'}}>User ID (UID):</span>
            <span style={{fontWeight:'900'}}>{APP_CONFIG.MY_UID}</span>
          </div>
          <div style={styles.row}>
            <span style={{color:'#94a3b8'}}>Balance:</span>
            <span style={{fontWeight:'900', color:'#fbbf24'}}>{balance.toFixed(4)} TON</span>
          </div>
          <div style={styles.row}>
            <span style={{color:'#94a3b8'}}>Status:</span>
            <span style={{color:'#10b981', fontWeight:'900'}}>ACTIVE</span>
          </div>

          <div style={{ background: '#450a0a', border: '1px solid #ef4444', padding: '15px', borderRadius: '15px', textAlign: 'center', marginTop: '20px' }}>
            <p style={{ color: '#fca5a5', fontWeight: '900', margin: 0, fontSize: '12px' }}>⚠️ Anti-Cheat Active: Multiple accounts are not allowed.</p>
          </div>
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
