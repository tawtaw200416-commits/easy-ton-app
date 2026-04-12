import React, { useState, useEffect } from 'react';

const APP_CONFIG = {
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

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
  }, [balance, completed, withdrawHistory]);

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
      }, 3000);
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => alert(`${label} Copied!`));
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', borderTop: '2px solid #fbbf24', padding: '12px 0' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' }
  };

  return (
    <div style={styles.main}>
      <div style={{ textAlign: 'center', background: '#1e293b', padding: '25px', borderRadius: '20px', marginBottom: '20px', border: '1px solid #fbbf24' }}>
        <small style={{ color: '#94a3b8', fontWeight: '900' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', fontSize: '38px', margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'social'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowAddTask(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: '900' }}>{t.toUpperCase()}</button>
            ))}
          </div>
          <div style={styles.card}>
            {activeTab === 'bot' && botTasks.map(t => (
              <div key={t.id} style={styles.row}>
                <span style={{fontWeight: '900'}}>{t.name}</span>
                <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '80px', padding: '8px'}}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            {activeTab === 'social' && socialTasks.map(t => (
              <div key={t.id} style={styles.row}>
                <span style={{fontWeight: '900'}}>{t.name}</span>
                <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '80px', padding: '8px'}}>{completed.includes(t.id) ? 'DONE' : 'JOIN'}</button>
              </div>
            ))}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', marginTop: 0}}>REFERRAL PROGRAM</h3>
          <p style={{fontSize: '14px', color: '#94a3b8', fontWeight: '900', lineHeight: '1.5'}}>
            Invite your friends and earn <span style={{color: '#fbbf24'}}>0.0005 TON</span> for each valid referral.
          </p>
          <p style={{fontSize: '13px', color: '#10b981', fontWeight: '900', marginBottom: '20px'}}>
            + Get 10% lifetime commission on your friends' earnings!
          </p>
          
          <div style={{background: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px dashed #fbbf24', marginBottom: '15px'}}>
            <small style={{color: '#94a3b8', fontSize: '10px'}}>YOUR REFERRAL LINK:</small>
            <p style={{fontSize: '11px', margin: '5px 0', color: '#fff', wordBreak: 'break-all'}}>
              https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}
            </p>
          </div>
          
          <button onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`, "Invite Link")} style={styles.yellowBtn}>
            COPY INVITE LINK
          </button>

          <h4 style={{marginTop: '25px', color: '#fbbf24', borderTop: '1px solid #334155', paddingTop: '15px'}}>INVITE HISTORY</h4>
          <div style={{fontSize: '12px', fontWeight: '900'}}>
             <div style={styles.row}>
                <span>Successful Invite</span>
                <span style={{color: '#10b981'}}>+ 0.0005 TON</span>
             </div>
             <div style={styles.row}>
                <span>Referral Bonus (10%)</span>
                <span style={{color: '#10b981'}}>+ 0.00005 TON</span>
             </div>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24'}}>WITHDRAW</h3>
          <input style={{width:'100%', padding:'12px', borderRadius:'10px', background:'#0f172a', border:'1px solid #334155', color:'white', marginBottom:'15px'}} placeholder="Enter Amount" />
          <button style={styles.yellowBtn}>WITHDRAW NOW</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24'}}>MY PROFILE</h3>
          <p>UID: {APP_CONFIG.MY_UID}</p>
          <div style={{ background: '#450a0a', border: '1px solid #ef4444', padding: '15px', borderRadius: '12px', textAlign: 'center', marginTop: '20px' }}>
            <p style={{ color: '#fca5a5', fontWeight: '900', margin: 0 }}>
              ⚠️ WARNING: <br/> Using fake accounts will lead to a PERMANENT BAN.
            </p>
          </div>
        </div>
      )}

      <div style={styles.navBar}>
        <div onClick={() => setActiveNav('earn')} style={styles.navBtn(activeNav === 'earn')}>💰 EARN</div>
        <div onClick={() => setActiveNav('invite')} style={styles.navBtn(activeNav === 'invite')}>👥 INVITE</div>
        <div onClick={() => setActiveNav('withdraw')} style={styles.navBtn(activeNav === 'withdraw')}>💸 WITHDRAW</div>
        <div onClick={() => setActiveNav('profile')} style={styles.navBtn(activeNav === 'profile')}>👤 PROFILE</div>
      </div>
    </div>
  );
}

export default App;
