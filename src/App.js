import React, { useState, useEffect } from 'react';

const APP_CONFIG = {
  ADS_BLOCK_ID: "27393",
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: "1793453606",
  ADMIN_TELEGRAM_LINK: "https://t.me/GrowTeaNews" // ငွေထုတ်ရင် အကြောင်းကြားဖို့ Admin Link
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showAddTask, setShowAddTask] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
  }, [balance, completed, withdrawHistory]);

  // ✅ ၂၄ နာရီပြည့်ရင် Success ပြောင်းပေးမယ့် Logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const updatedHistory = withdrawHistory.map(item => {
        if (item.status === "Pending" && now - item.timestamp > 24 * 60 * 60 * 1000) {
          return { ...item, status: "Success" };
        }
        return item;
      });
      if (JSON.stringify(updatedHistory) !== JSON.stringify(withdrawHistory)) {
        setWithdrawHistory(updatedHistory);
      }
    }, 60000); // မိနစ်တိုင်း စစ်ပေးမယ်
    return () => clearInterval(timer);
  }, [withdrawHistory]);

  const handleWithdraw = () => {
    const amt = Number(withdrawAmount);
    if (amt >= 0.1 && balance >= amt) {
      const newWithdraw = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        amount: amt.toFixed(4),
        status: "Pending",
        timestamp: Date.now()
      };
      setBalance(prev => prev - amt);
      setWithdrawHistory([newWithdraw, ...withdrawHistory]);
      setWithdrawAmount('');
      
      // Admin ဆီ Message ပို့ဖို့ Link ပွင့်လာမယ်
      alert("Withdrawal Request Sent! Please notify admin on Telegram.");
      window.open(`${APP_CONFIG.ADMIN_TELEGRAM_LINK}?text=Withdraw_Request_UID_${APP_CONFIG.MY_UID}_Amount_${amt}_TON`, '_blank');
    } else {
      alert("Minimum withdraw 0.1 TON and check your balance!");
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    alert(`${type} Copied!`);
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '18px', marginBottom: '15px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', textTransform: 'uppercase', transition: '0.3s' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: 'white', border: '2px solid #334155', marginBottom: '12px', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', borderTop: '2px solid #fbbf24', padding: '12px 0', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }),
    historyTable: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    statusBadge: (status) => ({ color: status === 'Success' ? '#10b981' : '#fbbf24', fontWeight: '900' })
  };

  return (
    <div style={styles.main}>
      {/* Top Balance Card */}
      <div style={{ textAlign: 'center', background: 'linear-gradient(145deg, #1e293b, #0f172a)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '2px solid #fbbf24' }}>
        <small style={{ color: '#94a3b8', fontWeight: '800', letterSpacing: '1px' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', fontSize: '32px', margin: '10px 0', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: '900', fontSize: '12px' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'social' && (
            <div style={styles.card}>
              {!showAddTask ? (
                <button onClick={() => setShowAddTask(true)} style={styles.yellowBtn}>+ ADD TASK (PROMOTE)</button>
              ) : (
                <div>
                  <h3 style={{ fontWeight: '900', color: '#fbbf24' }}>Add New Task</h3>
                  <input style={styles.input} placeholder="Channel Name (@Channel)" />
                  <input style={styles.input} placeholder="Link" />
                  <div style={{ background: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #fbbf24', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Wallet: {APP_CONFIG.ADMIN_WALLET.substring(0, 10)}...</span>
                      <button style={{ background: '#fbbf24', border: 'none', padding: '4px 8px', borderRadius: '5px', fontWeight: 'bold' }} onClick={() => handleCopy(APP_CONFIG.ADMIN_WALLET, 'Address')}>COPY</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>MEMO: {APP_CONFIG.MY_UID}</span>
                      <button style={{ background: '#fbbf24', border: 'none', padding: '4px 8px', borderRadius: '5px', fontWeight: 'bold' }} onClick={() => handleCopy(APP_CONFIG.MY_UID, 'MEMO')}>COPY</button>
                    </div>
                  </div>
                  <button style={styles.yellowBtn} onClick={() => setShowAddTask(false)}>CONFIRM PAYMENT</button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3 style={{ fontWeight: '900', color: '#fbbf24', marginTop: 0 }}>WITHDRAWAL</h3>
            <input 
              style={styles.input} 
              type="number" 
              placeholder="Amount (Min 0.1)" 
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <button style={styles.yellowBtn} onClick={handleWithdraw}>WITHDRAW NOW</button>
          </div>

          <div style={styles.card}>
            <h4 style={{ fontWeight: '900', margin: '0 0 10px 0' }}>WITHDRAW HISTORY</h4>
            <table style={styles.historyTable}>
              <thead>
                <tr style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'left', borderBottom: '1px solid #334155' }}>
                  <th style={{ paddingBottom: '10px' }}>DATE</th>
                  <th style={{ paddingBottom: '10px' }}>AMT</th>
                  <th style={{ paddingBottom: '10px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '13px', fontWeight: '700' }}>
                {withdrawHistory.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No history yet</td></tr>
                ) : (
                  withdrawHistory.map((w) => (
                    <tr key={w.id} style={{ borderBottom: '1px solid #0f172a' }}>
                      <td style={{ padding: '12px 0', fontSize: '11px' }}>{w.date}</td>
                      <td>{w.amount}</td>
                      <td style={styles.statusBadge(w.status)}>{w.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Nav Bar */}
      <div style={styles.navBar}>
        <div onClick={() => setActiveNav('earn')} style={styles.navBtn(activeNav === 'earn')}>💰<br/><b>EARN</b></div>
        <div onClick={() => setActiveNav('invite')} style={styles.navBtn(activeNav === 'invite')}>👥<br/><b>INVITE</b></div>
        <div onClick={() => setActiveNav('withdraw')} style={styles.navBtn(activeNav === 'withdraw')}>💸<br/><b>WITHDRAW</b></div>
        <div onClick={() => setActiveNav('profile')} style={styles.navBtn(activeNav === 'profile')}>👤<br/><b>PROFILE</b></div>
      </div>
    </div>
  );
}

export default App;
