import React, { useState, useEffect } from 'react';

const APP_CONFIG = {
  ADS_BLOCK_ID: "27393",
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: "1793453606",
  ADMIN_TELEGRAM: "https://t.me/GrowTeaNews"
};

function App() {
  // ✅ DATA PERSISTENCE (အဟောင်းတွေ ပြန်ပေါ်ဖို့ Key တွေကို အဟောင်းအတိုင်း သုံးထားပါတယ်)
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
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

  // Save data to LocalStorage
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
    }, 60000); 
    return () => clearInterval(timer);
  }, [withdrawHistory]);

  // Task List Data
  const botTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" }
  ];

  const socialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
    { id: 's11', name: "@WORLDBESTCRYTO1", link: "https://t.me/WORLDBESTCRYTO1" }
  ];

  const handleAction = (id, link) => {
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
        status: "Pending",
        timestamp: Date.now()
      };
      setBalance(prev => prev - amt);
      setWithdrawHistory([newWithdraw, ...withdrawHistory]);
      setWithdrawAmount('');
      alert("Withdrawal Request Sent! Please notify admin.");
      window.open(`${APP_CONFIG.ADMIN_TELEGRAM}?text=Withdraw_Request_UID_${APP_CONFIG.MY_UID}_Amount_${amt}_TON`, '_blank');
    } else {
      alert("Min withdraw 0.1 TON!");
    }
  };

  const copyToClipboard = (text, msg) => {
    navigator.clipboard.writeText(text);
    alert(msg);
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '18px', marginBottom: '12px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '14px', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', fontWeight: 'bold' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', borderTop: '2px solid #fbbf24', padding: '10px 0' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', fontSize: '11px', fontWeight: '800' }),
    copyBox: { display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', padding: '10px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #334155' }
  };

  return (
    <div style={styles.main}>
      {/* Total Balance Header */}
      <div style={{ textAlign: 'center', background: 'linear-gradient(145deg, #1e293b, #0f172a)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '2px solid #fbbf24' }}>
        <small style={{ color: '#94a3b8', fontWeight: '800' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', fontSize: '32px', margin: '10px 0', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowAddTask(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: '900' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'social' && !showAddTask && (
            <div style={styles.card}>
              <button onClick={() => setShowAddTask(true)} style={{...styles.yellowBtn, marginBottom:'15px'}}>+ ADD TASK (PROMOTE)</button>
              {socialTasks.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' }}>
                  <span style={{fontWeight:'800'}}>{s.name}</span>
                  <button onClick={() => handleAction(s.id, s.link)} style={{...styles.yellowBtn, width:'80px', padding:'8px', backgroundColor: completed.includes(s.id) ? '#10b981' : '#fbbf24'}}>{completed.includes(s.id) ? "DONE" : "JOIN"}</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'social' && showAddTask && (
            <div style={styles.card}>
              <h3 style={{fontWeight:'900', color:'#fbbf24'}}>Add New Task</h3>
              <input style={styles.input} placeholder="Channel Name (@Channel)" />
              <input style={styles.input} placeholder="Link" />
              <div style={{background:'#0f172a', padding:'15px', borderRadius:'12px', border:'1px dotted #fbbf24', marginBottom:'15px'}}>
                <small style={{color:'#94a3b8', fontWeight:'bold'}}>Admin Address:</small>
                <div style={styles.copyBox}>
                  <div style={{fontSize:'10px', color:'#fbbf24', flex:1}}>{APP_CONFIG.ADMIN_WALLET.substring(0,20)}...</div>
                  <button onClick={() => copyToClipboard(APP_CONFIG.ADMIN_WALLET, "Address Copied!")} style={{background:'#fbbf24', border:'none', padding:'5px 10px', borderRadius:'5px', fontWeight:'900', fontSize:'10px'}}>COPY</button>
                </div>
                <small style={{color:'#94a3b8', fontWeight:'bold'}}>MEMO (UID):</small>
                <div style={styles.copyBox}>
                  <div style={{fontSize:'14px', fontWeight:'900', flex:1}}>{APP_CONFIG.MY_UID}</div>
                  <button onClick={() => copyToClipboard(APP_CONFIG.MY_UID, "MEMO Copied!")} style={{background:'#fbbf24', border:'none', padding:'5px 10px', borderRadius:'5px', fontWeight:'900', fontSize:'10px'}}>COPY</button>
                </div>
              </div>
              <button style={styles.yellowBtn} onClick={() => setShowAddTask(false)}>CONFIRM PAYMENT</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3 style={{fontWeight:'900', color:'#fbbf24', marginTop:0}}>WITHDRAWAL</h3>
            <input style={styles.input} type="number" placeholder="Amount (Min 0.1)" value={withdrawAmount} onChange={(e)=>setWithdrawAmount(e.target.value)} />
            <button style={styles.yellowBtn} onClick={handleWithdraw}>WITHDRAW NOW</button>
          </div>
          <div style={styles.card}>
            <h4 style={{fontWeight:'900', marginBottom:'10px'}}>HISTORY</h4>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{color:'#94a3b8', fontSize:'11px', textAlign:'left', borderBottom:'1px solid #334155'}}>
                  <th style={{paddingBottom:'8px'}}>DATE</th>
                  <th style={{paddingBottom:'8px'}}>AMT</th>
                  <th style={{paddingBottom:'8px'}}>STATUS</th>
                </tr>
              </thead>
              <tbody style={{fontWeight:'800', fontSize:'12px'}}>
                {withdrawHistory.map(w => (
                  <tr key={w.id} style={{borderBottom:'1px solid #0f172a'}}>
                    <td style={{padding:'12px 0'}}>{w.date.split(',')[0]}</td>
                    <td>{w.amount}</td>
                    <td style={{color: w.status==='Success'?'#10b981':'#fbbf24'}}>{w.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Navigation */}
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
