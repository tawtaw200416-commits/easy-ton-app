import React, { useState, useEffect } from 'react';

const APP_CONFIG = {
  ADS_BLOCK_ID: "27393",
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: "1793453606",
  ADMIN_TELEGRAM: "https://t.me/GrowTeaNews"
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTask, setShowAddTask] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
  }, [balance, completed, withdrawHistory]);

  // ✅ 24-Hour Success System
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const updatedHistory = withdrawHistory.map(item => {
        if (item.status === "Pending" && (now - item.timestamp > 86400000)) {
          return { ...item, status: "Success" };
        }
        return item;
      });
      if (JSON.stringify(updatedHistory) !== JSON.stringify(withdrawHistory)) {
        setWithdrawHistory(updatedHistory);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [withdrawHistory]);

  // ✅ Updated Bot Tasks (၆ ခု အတိအကျ)
  const botTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const socialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 's3', name: "@cryptogold_online", link: "https://t.me/cryptogold_online_official" },
    { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
    { id: 's5', name: "@USDTcloudminer", link: "https://t.me/USDTcloudminer_channel" },
    { id: 's6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
    { id: 's7', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
    { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
    { id: 's9', name: "@kombo_crypta", link: "https://t.me/kombo_crypta" },
    { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" },
    { id: 's11', name: "@WORLDBESTCRYTO1", link: "https://t.me/WORLDBESTCRYTO1" },
    { id: 's12', name: "@MONEYHUB9_69", link: "https://t.me/MONEYHUB9_69" },
    { id: 's13', name: "@zrbtua", link: "https://t.me/zrbtua" },
    { id: 's14', name: "@perviu1million", link: "https://t.me/perviu1million" }
  ];

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    if (!completed.includes(id)) {
      setTimeout(() => {
        setBalance(prev => Number((prev + 0.0005).toFixed(5)));
        setCompleted(prev => [...prev, id]);
      }, 2500);
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => alert(`${label} Copied!`));
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '15px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '15px' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '12px', boxSizing: 'border-box', fontWeight: '900', fontSize: '15px' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', borderTop: '2px solid #fbbf24', padding: '10px 0' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #334155' },
    warningCard: { marginTop: '20px', padding: '15px', backgroundColor: '#450a0a', border: '2px solid #ef4444', borderRadius: '15px', textAlign: 'center' }
  };

  return (
    <div style={styles.main}>
      {/* 💰 Balance Banner */}
      <div style={{ textAlign: 'center', background: 'linear-gradient(145deg, #1e293b, #0f172a)', padding: '30px', borderRadius: '25px', marginBottom: '25px', border: '2px solid #fbbf24' }}>
        <small style={{ color: '#94a3b8', fontWeight: '900', letterSpacing: '1px' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', fontSize: '42px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} <span style={{fontSize:'18px'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowAddTask(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: '900' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && botTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}>
                <span style={{fontWeight: '900'}}>{t.name}</span>
                <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>START</button>
              </div>
            ))}

            {activeTab === 'social' && !showAddTask && (
              <>
                <button onClick={() => setShowAddTask(true)} style={{...styles.yellowBtn, marginBottom: '20px'}}>+ ADD TASK (PROMOTE)</button>
                {socialTasks.filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}>
                    <span style={{fontWeight: '900'}}>{t.name}</span>
                    <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>JOIN</button>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Reward Code" />
                <button style={styles.yellowBtn}>CLAIM REWARD</button>
              </div>
            )}

            {showAddTask && (
              <div>
                <h3 style={{fontWeight:'900', color:'#fbbf24', marginTop:0}}>Promote Channel</h3>
                <input style={styles.input} placeholder="Channel Name (@Username)" />
                <input style={styles.input} placeholder="Link" />
                <select style={styles.input}>
                  <option>100 Views - 0.2 TON</option>
                  <option>200 Views - 0.4 TON</option>
                  <option>300 Views - 0.5 TON</option>
                </select>
                <div style={{background: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px dashed #fbbf24', marginBottom: '15px'}}>
                  <p style={{fontSize: '11px', fontWeight: '900'}}>ADDRESS: <b style={{color:'#fbbf24'}}>{APP_CONFIG.ADMIN_WALLET}</b></p>
                  <button onClick={() => handleCopy(APP_CONFIG.ADMIN_WALLET, "Address")} style={{background:'#fbbf24', border:'none', padding:'5px 10px', borderRadius:'5px', fontWeight:'900', fontSize:'10px', marginBottom:'10px'}}>COPY ADDRESS</button>
                  <p style={{fontSize: '11px', fontWeight: '900'}}>MEMO (UID): <b style={{color:'#fbbf24'}}>{APP_CONFIG.MY_UID}</b></p>
                  <button onClick={() => handleCopy(APP_CONFIG.MY_UID, "MEMO")} style={{background:'#fbbf24', border:'none', padding:'5px 10px', borderRadius:'5px', fontWeight:'900', fontSize:'10px'}}>COPY MEMO</button>
                </div>
                <button style={styles.yellowBtn} onClick={() => { window.open(`${APP_CONFIG.ADMIN_TELEGRAM}?text=Payment_Done_UID_${APP_CONFIG.MY_UID}`, '_blank'); setShowAddTask(false); }}>CONFIRM PAYMENT</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h2 style={{fontWeight:'900', color:'#fbbf24', marginTop:0}}>WITHDRAW</h2>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.yellowBtn} onClick={() => {
            const amt = Number(withdrawAmount);
            if (amt >= 0.1 && balance >= amt) {
              const newWD = { id: Math.random().toString(36).substr(2, 9), timestamp: Date.now(), date: new Date().toLocaleString(), amount: amt.toFixed(4), status: "Pending" };
              setBalance(prev => prev - amt);
              setWithdrawHistory([newWD, ...withdrawHistory]);
              setWithdrawAmount('');
              alert("Submitted Successfully!");
            } else { alert("Minimum 0.1 TON required!"); }
          }}>WITHDRAW NOW</button>
          <h4 style={{marginTop:'30px', fontWeight:'900', borderTop:'1px solid #334155', paddingTop:'15px'}}>WITHDRAW HISTORY</h4>
          {withdrawHistory.map(w => (
            <div key={w.id} style={{...styles.row, fontSize:'13px', fontWeight:'900'}}>
              <span>{w.amount} TON</span>
              <span style={{color: w.status === 'Success' ? '#10b981' : '#fbbf24'}}>{w.status}</span>
            </div>
          ))}
        </div>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{fontWeight:'900', color:'#fbbf24', marginTop:0}}>INVITE FRIENDS</h2>
          <p style={{fontWeight:'900', color:'#94a3b8'}}>Earn 10% bonus from each friend!</p>
          <div style={{...styles.input, padding:'15px', fontSize:'12px', background:'#0f172a'}}>{`https://t.me/YourBot?start=${APP_CONFIG.MY_UID}`}</div>
          <button style={styles.yellowBtn} onClick={() => handleCopy(`https://t.me/YourBot?start=${APP_CONFIG.MY_UID}`, "Invite Link")}>COPY LINK</button>
          <h4 style={{marginTop:'30px', fontWeight:'900', borderTop:'1px solid #334155', paddingTop:'15px'}}>HISTORY</h4>
          <div style={styles.row}><span style={{fontWeight:'900'}}>Friend Joining Reward</span><span style={{color:'#10b981', fontWeight:'900'}}>+ 0.0005 TON</span></div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{fontWeight:'900', color:'#fbbf24', marginTop:0}}>USER PROFILE</h2>
          <div style={{...styles.row, border:'none'}}><span style={{fontWeight:'900'}}>User UID:</span><span style={{fontWeight:'900'}}>{APP_CONFIG.MY_UID}</span></div>
          <div style={{...styles.row, border:'none'}}><span style={{fontWeight:'900'}}>Status:</span><span style={{color:'#10b981', fontWeight:'900'}}>Verified</span></div>
          
          {/* ✅ Mandatory Fake Account Warning */}
          <div style={styles.warningCard}>
            <p style={{ color: '#fca5a5', fontWeight: '900', margin: 0, fontSize: '14px' }}>
              ⚠️ WARNING: <br/> Using fake accounts or multiple IDs to cheat the system will lead to a PERMANENT BAN.
            </p>
          </div>
        </div>
      )}

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
