import React, { useState, useEffect } from 'react';

const APP_CONFIG = {
  ADS_BLOCK_ID: "27393",
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: "1793453606"
};

function App() {
  // ✅ Data State
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showAddTask, setShowAddTask] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // ✅ Auto Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
  }, [balance, completed, withdrawHistory]);

  // ✅ ၂၄ နာရီပြည့်လျှင် Success ပြောင်းပေးမည့် Logic
  useEffect(() => {
    const checkStatus = setInterval(() => {
      const now = Date.now();
      const updatedHistory = withdrawHistory.map(item => {
        // ထုတ်ခဲ့တဲ့အချိန်ကနေ ၂၄ နာရီ (86400000 ms) ကျော်သွားရင် Success ပြောင်းမယ်
        if (item.status === "Pending" && (now - item.id > 86400000)) {
          return { ...item, status: "Success" };
        }
        return item;
      });
      if (JSON.stringify(updatedHistory) !== JSON.stringify(withdrawHistory)) {
        setWithdrawHistory(updatedHistory);
      }
    }, 60000); // ၁ မိနစ်တစ်ခါ စစ်ပေးမယ်
    return () => clearInterval(checkStatus);
  }, [withdrawHistory]);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text).then(() => alert(`${type} ကို Copy ကူးလိုက်ပါပြီ!`));
  };

  const handleWithdraw = () => {
    const amt = Number(withdrawAmount);
    if (amt >= 0.1 && balance >= amt) {
      const newRequest = {
        id: Date.now(), // Unique ID အဖြစ် သုံးထားတယ်
        date: new Date().toLocaleString(),
        amount: amt.toFixed(4),
        status: "Pending"
      };
      setBalance(prev => prev - amt);
      setWithdrawHistory([newRequest, ...withdrawHistory]);
      setWithdrawAmount('');
      alert("Withdraw Request တင်ပြီးပါပြီ။ ၂၄ နာရီအတွင်း စစ်ဆေးပေးပါမည်။");
    } else {
      alert("အနည်းဆုံး 0.1 TON ရှိရပါမည် သို့မဟုတ် လက်ကျန်ငွေမလုံလောက်ပါ။");
    }
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '15px' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box', fontWeight: 'bold' },
    bold: { fontWeight: '900' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', borderTop: '2px solid #334155', padding: '10px 0' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', fontSize: '11px', cursor: 'pointer', fontWeight: '900' })
  };

  return (
    <div style={styles.main}>
      {/* Balance Display */}
      <div style={{ textAlign: 'center', border: '2px solid #fbbf24', padding: '25px', borderRadius: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#94a3b8', ...styles.bold }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', margin: '5px 0', fontSize: '36px', ...styles.bold }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: '900' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'social' && (
            <div style={styles.card}>
              {!showAddTask ? (
                <>
                  <button onClick={() => setShowAddTask(true)} style={styles.yellowBtn}>+ ADD TASK (PROMOTE)</button>
                  <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '15px', ...styles.bold }}>Available Tasks will appear here</p>
                </>
              ) : (
                <div>
                  <h3 style={{ marginTop: 0, ...styles.bold }}>Add Task</h3>
                  <input style={styles.input} placeholder="Channel Name (@Channel)" />
                  <input style={styles.input} placeholder="Link" />
                  <select style={styles.input}>
                    <option>100 Views - 0.2 TON</option>
                    <option>200 Views - 0.4 TON</option>
                  </select>

                  <div style={{ background: '#0f172a', padding: '15px', borderRadius: '10px', border: '1px dashed #fbbf24', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', ...styles.bold }}>Address: <b>{APP_CONFIG.ADMIN_WALLET.substring(0, 15)}...</b></span>
                      <button style={{ backgroundColor: '#fbbf24', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: '900' }} onClick={() => handleCopy(APP_CONFIG.ADMIN_WALLET, 'Wallet Address')}>COPY</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', ...styles.bold }}>MEMO: <b style={{ color: '#fbbf24' }}>{APP_CONFIG.MY_UID}</b></span>
                      <button style={{ backgroundColor: '#fbbf24', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: '900' }} onClick={() => handleCopy(APP_CONFIG.MY_UID, 'MEMO ID')}>COPY</button>
                    </div>
                  </div>

                  <button style={{ ...styles.yellowBtn, marginTop: '20px' }} onClick={() => setShowAddTask(false)}>CONFIRM PAYMENT</button>
                  <button onClick={() => setShowAddTask(false)} style={{ width: '100%', background: 'none', border: 'none', color: '#94a3b8', marginTop: '15px', fontWeight: 'bold' }}>Back</button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h2 style={{ marginTop: 0, ...styles.bold, color: '#fbbf24' }}>WITHDRAW</h2>
          <input 
            style={styles.input} 
            type="number" 
            placeholder="Min 0.1 TON" 
            value={withdrawAmount} 
            onChange={(e) => setWithdrawAmount(e.target.value)} 
          />
          <button style={styles.yellowBtn} onClick={handleWithdraw}>WITHDRAW NOW</button>

          <div style={{ marginTop: '25px' }}>
            <h4 style={{ marginBottom: '15px', ...styles.bold, borderTop: '1px solid #334155', paddingTop: '15px' }}>HISTORY</h4>
            {withdrawHistory.map((w, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #334155', fontSize: '13px' }}>
                <span style={{color: '#94a3b8'}}>{w.date.split(',')[0]}</span>
                <span style={styles.bold}>{w.amount} TON</span>
                <span style={{ color: w.status === 'Success' ? '#10b981' : '#fbbf24', ...styles.bold }}>{w.status}</span>
              </div>
            ))}
          </div>
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
