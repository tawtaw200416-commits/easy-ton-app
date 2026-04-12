import React, { useState, useEffect } from 'react';

const APP_CONFIG = {
  ADS_BLOCK_ID: "27393",
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: "1793453606"
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showAddTask, setShowAddTask] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // ✅ Auto Save Data
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
  }, [balance, completed, withdrawHistory]);

  // ✅ ၂၄ နာရီပြည့်ရင် Success ပြောင်းပေးမည့် စနစ်
  useEffect(() => {
    const checkStatus = () => {
      const now = Date.now();
      const updatedHistory = withdrawHistory.map(item => {
        // 86400000 ms = ၂၄ နာရီ
        if (item.status === "Pending" && (now - item.timestamp > 86400000)) {
          return { ...item, status: "Success" };
        }
        return item;
      });
      
      if (JSON.stringify(updatedHistory) !== JSON.stringify(withdrawHistory)) {
        setWithdrawHistory(updatedHistory);
      }
    };
    checkStatus();
  }, [withdrawHistory]);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text).then(() => alert(`${type} Copied!`));
  };

  const handleWithdraw = () => {
    const amt = Number(withdrawAmount);
    if (amt >= 0.1 && balance >= amt) {
      const newRequest = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        date: new Date().toLocaleString(),
        amount: amt.toFixed(4),
        status: "Pending"
      };
      setBalance(prev => prev - amt);
      setWithdrawHistory([newRequest, ...withdrawHistory]);
      setWithdrawAmount('');
      alert("Withdraw Request Submitted! Please wait 24 hours.");
    } else {
      alert("Insufficient balance or below min withdraw (0.1 TON)");
    }
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '18px', marginBottom: '12px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '15px' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '12px', boxSizing: 'border-box', fontWeight: '900', fontSize: '15px' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', borderTop: '2px solid #fbbf24', padding: '10px 0' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', fontSize: '12px', fontWeight: '900', cursor: 'pointer' }),
    historyRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #334155', fontSize: '13px', fontWeight: '900' }
  };

  return (
    <div style={styles.main}>
      {/* Balance Section */}
      <div style={{ textAlign: 'center', background: 'linear-gradient(145deg, #1e293b, #0f172a)', padding: '30px', borderRadius: '25px', marginBottom: '25px', border: '2px solid #fbbf24' }}>
        <small style={{ color: '#94a3b8', fontWeight: '900', letterSpacing: '1px' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', fontSize: '40px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} <span style={{fontSize: '18px'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: '900' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'social' && (
            <div style={styles.card}>
              {!showAddTask ? (
                <button onClick={() => setShowAddTask(true)} style={styles.yellowBtn}>+ ADD TASK (PROMOTE)</button>
              ) : (
                <div>
                  <h3 style={{ marginTop: 0, fontWeight: '900', color: '#fbbf24' }}>Create Task</h3>
                  <input style={styles.input} placeholder="Channel @Username" />
                  <input style={styles.input} placeholder="Link" />
                  <select style={styles.input}>
                    <option>100 Views - 0.2 TON</option>
                    <option>200 Views - 0.4 TON</option>
                  </select>

                  <div style={{ background: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px dashed #fbbf24', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '900' }}>WALLET: <b style={{fontSize:'9px'}}>{APP_CONFIG.ADMIN_WALLET.substring(0, 15)}...</b></span>
                      <button style={{ background: '#fbbf24', border: 'none', padding: '5px 10px', borderRadius: '5px', fontWeight: '900', fontSize: '10px' }} onClick={() => handleCopy(APP_CONFIG.ADMIN_WALLET, 'Address')}>COPY</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '900' }}>MEMO: <b style={{ color: '#fbbf24' }}>{APP_CONFIG.MY_UID}</b></span>
                      <button style={{ background: '#fbbf24', border: 'none', padding: '5px 10px', borderRadius: '5px', fontWeight: '900', fontSize: '10px' }} onClick={() => handleCopy(APP_CONFIG.MY_UID, 'MEMO')}>COPY</button>
                    </div>
                  </div>

                  <button style={styles.yellowBtn} onClick={() => setShowAddTask(false)}>CONFIRM PAYMENT</button>
                  <button onClick={() => setShowAddTask(false)} style={{ width: '100%', background: 'none', border: 'none', color: '#94a3b8', marginTop: '15px', fontWeight: '900' }}>Cancel</button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h2 style={{ marginTop: 0, fontWeight: '900', color: '#fbbf24' }}>WITHDRAWAL</h2>
          <input 
            style={styles.input} 
            type="number" 
            placeholder="Amount (Min 0.1)" 
            value={withdrawAmount} 
            onChange={(e) => setWithdrawAmount(e.target.value)} 
          />
          <button style={styles.yellowBtn} onClick={handleWithdraw}>WITHDRAW NOW</button>

          <h4 style={{ marginTop: '30px', fontWeight: '900', borderTop: '1px solid #334155', paddingTop: '15px' }}>WITHDRAW HISTORY</h4>
          {withdrawHistory.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '900' }}>No history found</p>
          ) : (
            withdrawHistory.map((w) => (
              <div key={w.id} style={styles.historyRow}>
                <span style={{color:'#94a3b8'}}>{w.date.split(',')[0]}</span>
                <span>{w.amount} TON</span>
                <span style={{ color: w.status === 'Success' ? '#10b981' : '#fbbf24' }}>{w.status}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Nav Bar */}
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
