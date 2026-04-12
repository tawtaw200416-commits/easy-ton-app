import React, { useState, useEffect } from 'react';

// ✅ Configuration
const APP_CONFIG = {
  ADS_BLOCK_ID: "27393", 
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: "1793453606",
  ADMIN_TELEGRAM_LINK: "https://t.me/GrowTeaNews" 
};

function App() {
  // ✅ Data States (LocalStorage နဲ့ ချိတ်ဆက်ထားသည်)
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0143);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [inviteHistory] = useState(() => JSON.parse(localStorage.getItem('inv_hist')) || [
    { uid: "18945532", status: "Success", reward: "0.0005" },
    { uid: "19228410", status: "Success", reward: "0.0005" }
  ]);

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

  // ✅ ၂၄ နာရီပြည့်ရင် Pending မှ Success သို့ ပြောင်းလဲခြင်း
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const updatedHistory = withdrawHistory.map(item => {
        if (item.status === "Pending" && (now - item.id > 86400000)) {
          return { ...item, status: "Success" };
        }
        return item;
      });
      if (JSON.stringify(updatedHistory) !== JSON.stringify(withdrawHistory)) {
        setWithdrawHistory(updatedHistory);
      }
    }, 60000); 
    return () => clearInterval(timer);
  }, [withdrawHistory]);

  // ✅ Task Data Lists
  const botTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" }
  ];

  const socialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's2', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" }
  ];

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    if (!completed.includes(id)) {
      setTimeout(() => {
        setBalance(prev => Number((prev + 0.0005).toFixed(5)));
        setCompleted(prev => [...prev, id]);
      }, 3000);
    }
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
      alert("Withdraw Request Sent!");
      window.open(`${APP_CONFIG.ADMIN_TELEGRAM_LINK}?text=Withdraw_UID_${APP_CONFIG.MY_UID}_Amt_${amt}_TON`, '_blank');
    } else {
      alert("Min Withdraw 0.1 TON လိုအပ်ပါသည်။");
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    alert(`${type} Copied!`);
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '18px', marginBottom: '12px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '14px' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box', fontWeight: '900' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', borderTop: '2px solid #fbbf24', padding: '10px 0' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', fontSize: '11px', cursor: 'pointer', fontWeight: '900' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' }
  };

  return (
    <div style={styles.main}>
      {/* Top Balance UI */}
      <div style={{ textAlign: 'center', background: 'linear-gradient(145deg, #1e293b, #0f172a)', padding: '30px', borderRadius: '25px', marginBottom: '20px', border: '2px solid #fbbf24' }}>
        <small style={{ color: '#94a3b8', fontWeight: '900', letterSpacing: '1px' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', fontSize: '36px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} <span style={{fontSize: '18px'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowAddTask(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: '900' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && botTasks.map(t => (
              <div key={t.id} style={styles.row}>
                <span style={{fontWeight: '900'}}>{t.name}</span>
                <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '80px', padding: '8px', backgroundColor: completed.includes(t.id) ? '#10b981' : '#fbbf24'}}>{completed.includes(t.id) ? "DONE" : "START"}</button>
              </div>
            ))}

            {activeTab === 'social' && !showAddTask && (
              <>
                <button onClick={() => setShowAddTask(true)} style={{...styles.yellowBtn, marginBottom: '15px'}}>+ ADD TASK (PROMOTE)</button>
                {socialTasks.map(t => (
                  <div key={t.id} style={styles.row}>
                    <span style={{fontWeight: '900'}}>{t.name}</span>
                    <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '80px', padding: '8px', backgroundColor: completed.includes(t.id) ? '#10b981' : '#fbbf24'}}>{completed.includes(t.id) ? "DONE" : "JOIN"}</button>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'social' && showAddTask && (
              <div>
                <h3 style={{fontWeight: '900', color: '#fbbf24'}}>Promote Channel</h3>
                <input style={styles.input} placeholder="Channel @Username" />
                <input style={styles.input} placeholder="Link" />
                <div style={{background: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px dashed #fbbf24', marginBottom: '10px'}}>
                  <p style={{fontSize: '11px', margin: '0 0 5px 0', fontWeight: '900'}}>Admin Address: <br/>{APP_CONFIG.ADMIN_WALLET.substring(0, 20)}...</p>
                  <button onClick={() => handleCopy(APP_CONFIG.ADMIN_WALLET, "Wallet")} style={{background: '#fbbf24', border: 'none', padding: '5px 10px', borderRadius: '5px', fontWeight: '900', fontSize: '10px'}}>COPY ADDRESS</button>
                </div>
                <button style={styles.yellowBtn} onClick={() => setShowAddTask(false)}>CONFIRM PAYMENT</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h2 style={{fontWeight: '900', color: '#fbbf24'}}>WITHDRAW</h2>
          <input style={styles.input} type="number" placeholder="0.1" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.yellowBtn} onClick={handleWithdraw}>WITHDRAW NOW</button>
          
          <h4 style={{marginTop: '30px', fontWeight: '900', borderTop: '1px solid #334155', paddingTop: '15px'}}>WITHDRAW HISTORY</h4>
          {withdrawHistory.map(w => (
            <div key={w.id} style={styles.row}>
              <span style={{fontSize: '12px', fontWeight: '900'}}>{w.date.split(',')[0]}</span>
              <span style={{fontWeight: '900'}}>{w.amount} TON</span>
              <span style={{color: w.status === 'Success' ? '#10b981' : '#fbbf24', fontWeight: '900'}}>{w.status}</span>
            </div>
          ))}
        </div>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{fontWeight: '900', color: '#fbbf24'}}>INVITE FRIENDS</h2>
          <p style={{fontSize: '12px', fontWeight: '900'}}>Earn 0.0005 TON for each friend!</p>
          <div style={styles.input}>{`https://t.me/YourBot?start=${APP_CONFIG.MY_UID}`}</div>
          <button style={styles.yellowBtn} onClick={() => handleCopy(`https://t.me/YourBot?start=${APP_CONFIG.MY_UID}`, "Invite Link")}>COPY LINK</button>
          
          <h4 style={{marginTop: '25px', fontWeight: '900'}}>INVITE HISTORY</h4>
          {inviteHistory.map((inv, idx) => (
            <div key={idx} style={styles.row}>
              <span style={{fontWeight: '900'}}>UID: {inv.uid}</span>
              <span style={{color: '#10b981', fontWeight: '900'}}>+{inv.reward} TON</span>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
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
