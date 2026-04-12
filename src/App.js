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
  const [activeTab, setActiveTab] = useState('social');
  const [showAddTask, setShowAddTask] = useState(false);

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
      if (JSON.stringify(updatedHistory) !== JSON.stringify(withdrawHistory)) {
        setWithdrawHistory(updatedHistory);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [withdrawHistory]);

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

  const handleTask = (id, link) => {
    window.open(link, '_blank');
    if (!completed.includes(id)) {
      setTimeout(() => {
        setBalance(prev => Number((prev + 0.0005).toFixed(5)));
        setCompleted(prev => [...prev, id]);
      }, 2000);
    }
  };

  const handlePaymentConfirm = () => {
    alert("Payment Request Sent to Admin!");
    window.open(`${APP_CONFIG.ADMIN_TELEGRAM}?text=New_Ad_Task_Payment_Confirm_UID_${APP_CONFIG.MY_UID}`, '_blank');
    setShowAddTask(false);
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '18px', marginBottom: '12px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '14px' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box', fontWeight: '900' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', borderTop: '2px solid #fbbf24', padding: '10px 0' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }),
    taskRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' }
  };

  return (
    <div style={styles.main}>
      {/* Balance UI */}
      <div style={{ textAlign: 'center', background: 'linear-gradient(145deg, #1e293b, #0f172a)', padding: '30px', borderRadius: '25px', marginBottom: '20px', border: '2px solid #fbbf24' }}>
        <small style={{ color: '#94a3b8', fontWeight: '900' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', fontSize: '38px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} <span style={{fontSize:'16px'}}>TON</span></h1>
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
              <button onClick={() => setShowAddTask(true)} style={{...styles.yellowBtn, marginBottom: '20px'}}>+ ADD TASK (PROMOTE)</button>
              {socialTasks.filter(t => !completed.includes(t.id)).map(t => (
                <div key={t.id} style={styles.taskRow}>
                  <span style={{fontWeight: '900'}}>{t.name}</span>
                  <button onClick={() => handleTask(t.id, t.link)} style={{...styles.yellowBtn, width: '80px', padding: '8px'}}>JOIN</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'bot' && (
            <div style={styles.card}>
              {botTasks.filter(t => !completed.includes(t.id)).map(t => (
                <div key={t.id} style={styles.taskRow}>
                  <span style={{fontWeight: '900'}}>{t.name}</span>
                  <button onClick={() => handleTask(t.id, t.link)} style={{...styles.yellowBtn, width: '80px', padding: '8px'}}>START</button>
                </div>
              ))}
            </div>
          )}

          {showAddTask && (
            <div style={styles.card}>
              <h3 style={{fontWeight: '900', color: '#fbbf24', marginTop: 0}}>Create Promotion</h3>
              <input style={styles.input} placeholder="Channel Name (@Username)" />
              <input style={styles.input} placeholder="Task Link" />
              <select style={styles.input}>
                <option value="0.2">100 Views - 0.2 TON</option>
                <option value="0.4">200 Views - 0.4 TON</option>
                <option value="0.5">300 Views - 0.5 TON</option>
              </select>
              
              <div style={{background: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px dashed #fbbf24', marginBottom: '15px'}}>
                <p style={{fontSize: '11px', margin: '0 0 5px 0', fontWeight: '900', color: '#94a3b8'}}>PAY TO TON ADDRESS:</p>
                <p style={{fontSize: '12px', fontWeight: '900', wordBreak: 'break-all'}}>{APP_CONFIG.ADMIN_WALLET}</p>
                <p style={{fontSize: '11px', margin: '10px 0 5px 0', fontWeight: '900', color: '#fbbf24'}}>REQUIRED MEMO (UID):</p>
                <p style={{fontSize: '18px', fontWeight: '900'}}>{APP_CONFIG.MY_UID}</p>
              </div>
              
              <button style={styles.yellowBtn} onClick={handlePaymentConfirm}>CONFIRM PAYMENT</button>
              <button onClick={() => setShowAddTask(false)} style={{width:'100%', background:'none', border:'none', color:'#94a3b8', marginTop:'10px', fontWeight:'900'}}>Cancel</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{fontWeight: '900', color: '#fbbf24'}}>Invite Friends</h2>
          <p style={{fontWeight: '900', color: '#94a3b8'}}>Earn 10% from your friends' earnings!</p>
          <div style={{...styles.input, padding: '15px', fontSize: '13px'}}>{`https://t.me/YourBot?start=${APP_CONFIG.MY_UID}`}</div>
          <button style={styles.yellowBtn} onClick={() => {navigator.clipboard.writeText(`https://t.me/YourBot?start=${APP_CONFIG.MY_UID}`); alert("Link Copied!");}}>COPY INVITE LINK</button>
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
