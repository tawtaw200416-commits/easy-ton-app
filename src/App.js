import React, { useState, useEffect } from 'react';

// ✅ Bro ပုံထဲကအတိုင်း Block ID နဲ့ Admin Wallet သေချာပြန်ထည့်ထားပါတယ်
const APP_CONFIG = {
  ADS_BLOCK_ID: "27393", 
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: "1793453606",
  ADMIN_TELEGRAM_LINK: "https://t.me/GrowTeaNews" 
};

function App() {
  // ✅ Data State (အဟောင်းတွေမပျက်အောင် LocalStorage ကနေ ပြန်ခေါ်ထားပါတယ်)
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0143);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showAddTask, setShowAddTask] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // ✅ Data သိမ်းဆည်းခြင်း
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
  }, [balance, completed, withdrawHistory]);

  // ✅ ၂၄ နာရီပြည့်ရင် Success ပြောင်းပေးမည့် Logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const updatedHistory = withdrawHistory.map(item => {
        if (item.status === "Pending" && (now - item.id > 86400000)) {
          return { ...item, status: "Success" };
        }
        return item;
      });
      setWithdrawHistory(updatedHistory);
    }, 60000); 
    return () => clearInterval(timer);
  }, [withdrawHistory]);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text).then(() => alert(`${type} ကို Copy ကူးလိုက်ပါပြီ!`));
  };

  const handleWithdraw = () => {
    const amt = Number(withdrawAmount);
    if (amt >= 0.1 && balance >= amt) {
      const newWithdraw = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        amount: amt.toFixed(4),
        status: "Pending"
      };
      setBalance(prev => prev - amt);
      setWithdrawHistory([newWithdraw, ...withdrawHistory]);
      setWithdrawAmount('');
      alert("Withdraw Request တင်ပြီးပါပြီ။");
      window.open(`${APP_CONFIG.ADMIN_TELEGRAM_LINK}?text=Withdraw_UID_${APP_CONFIG.MY_UID}_Amt_${amt}`, '_blank');
    } else {
      alert("လက်ကျန်ငွေမလုံလောက်ပါ သို့မဟုတ် Minimum 0.1 မပြည့်ပါ။");
    }
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '15px' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box', fontWeight: 'bold' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', borderTop: '2px solid #334155', padding: '10px 0' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }),
    historyRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #334155', fontSize: '13px', fontWeight: 'bold' }
  };

  return (
    <div style={styles.main}>
      {/* Total Balance Section */}
      <div style={{ textAlign: 'center', border: '2px solid #fbbf24', padding: '25px', borderRadius: '20px', marginBottom: '25px' }}>
        <small style={{ color: '#94a3b8', fontWeight: '900' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', margin: '5px 0', fontSize: '36px', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: '900' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'social' && (
            <div style={styles.card}>
              {!showAddTask ? (
                <button onClick={() => setShowAddTask(true)} style={styles.yellowBtn}>+ ADD TASK (PROMOTE CHANNEL)</button>
              ) : (
                <div>
                  <h3 style={{ fontWeight: '900', marginTop: 0 }}>Add Task</h3>
                  <input style={styles.input} placeholder="Channel Name (@Channel)" />
                  <input style={styles.input} placeholder="Link" />
                  <select style={styles.input}>
                    <option>100 Views - 0.2 TON</option>
                  </select>
                  <div style={{ background: '#0f172a', padding: '12px', borderRadius: '10px', border: '1px dashed #fbbf24', marginBottom: '10px' }}>
                    <p style={{ fontSize: '11px', margin: '0 0 5px 0' }}>Send to: <br/><b style={{wordBreak:'break-all'}}>{APP_CONFIG.ADMIN_WALLET}</b></p>
                    <p style={{ fontSize: '11px', margin: 0 }}>MEMO (Required): <b style={{ color: '#fbbf24' }}>{APP_CONFIG.MY_UID}</b></p>
                  </div>
                  <button style={styles.yellowBtn} onClick={() => setShowAddTask(false)}>CONFIRM PAYMENT</button>
                  <button onClick={() => setShowAddTask(false)} style={{ width: '100%', background: 'none', border: 'none', color: '#94a3b8', marginTop: '15px', fontWeight: 'bold' }}>Back</button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h2 style={{ marginTop: 0, fontWeight: '900' }}>WITHDRAWAL</h2>
          <input 
            style={styles.input} 
            type="number" 
            placeholder="Amount (Min 0.1)" 
            value={withdrawAmount} 
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <button style={styles.yellowBtn} onClick={handleWithdraw}>WITHDRAW NOW</button>
          
          <h3 style={{ marginTop: '30px', fontWeight: '900', borderTop: '1px solid #334155', paddingTop: '20px' }}>WITHDRAW HISTORY</h3>
          {withdrawHistory.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>No history yet</p>
          ) : (
            withdrawHistory.map((w) => (
              <div key={w.id} style={styles.historyRow}>
                <span style={{color: '#94a3b8'}}>{w.date.split(',')[0]}</span>
                <span>{w.amount} TON</span>
                <span style={{ color: w.status === 'Success' ? '#10b981' : '#fbbf24' }}>{w.status}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Navigation Bar */}
      <div style={styles.navBar}>
        <div onClick={() => setActiveNav('earn')} style={styles.navBtn(activeNav === 'earn')}>💰<br/>EARN</div>
        <div onClick={() => setActiveNav('invite')} style={styles.navBtn(activeNav === 'invite')}>👥<br/>INVITE</div>
        <div onClick={() => setActiveNav('withdraw')} style={styles.navBtn(activeNav === 'withdraw')}>💸<br/>WITHDRAW</div>
        <div onClick={() => setActiveNav('profile')} style={styles.navBtn(activeNav === 'profile')}>👤<br/>PROFILE</div>
      </div>
    </div>
  );
}

export default App;
