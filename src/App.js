import React, { useState, useEffect } from 'react';

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: "1793453606",
  ADMIN_TELEGRAM: "https://t.me/GrowTeaNews",
  ADSGRAM_BLOCK_ID: "27578", 
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_CHAT_ID: "5020977059"
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referralCount, setReferralCount] = useState(() => Number(localStorage.getItem('ref_count')) || 0);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTask, setShowAddTask] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('ref_count', referralCount.toString());
  }, [balance, completed, withdrawHistory, referralCount]);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => alert(`${label} Copied!`));
  };

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then(() => {
        setBalance(prev => Number((prev + 0.0005).toFixed(5)));
        setCompleted(prev => [...prev, id]);
      }).catch(() => alert("Please watch the full ad!"));
    } else {
      setTimeout(() => {
        setBalance(prev => Number((prev + 0.0005).toFixed(5)));
        setCompleted(prev => [...prev, id]);
      }, 5000);
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    headerCard: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '12px', fontWeight: '900' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    copyBox: { background: '#f1f5f9', padding: '10px', borderRadius: '12px', border: '1px dashed #000', marginBottom: '10px' },
    planBtn: (active) => ({ flex: 1, padding: '10px', border: '2px solid #000', borderRadius: '10px', backgroundColor: active ? '#000' : '#fff', color: active ? '#fff' : '#000', fontSize: '11px', fontWeight: 'bold' })
  };

  return (
    <div style={styles.main}>
      <div style={styles.headerCard}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '38px', margin: '5px 0' }}>{balance.toFixed(5)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowAddTask(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t ? '#000' : '#fff', color: activeTab === t ? '#fff' : '#000', fontWeight: '900' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
              { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
              { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
              { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
              { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
              { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
            ].filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><span>{t.name}</span><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '80px', padding: '8px'}}>START</button></div>
            ))}

            {activeTab === 'social' && !showAddTask && (
              <>
                <button onClick={() => setShowAddTask(true)} style={{...styles.yellowBtn, backgroundColor: '#facc15', color: '#000', marginBottom: '20px', border: '2px solid #000'}}>+ ADD TASK (PROMOTE)</button>
                {[
                  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
                  { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
                  { id: 's3', name: "@cryptogold_online", link: "https://t.me/cryptogold_online_official" },
                  { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
                ].filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><span>{t.name}</span><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '80px', padding: '8px'}}>JOIN</button></div>
                ))}
              </>
            )}

            {showAddTask && (
              <div>
                <h4 style={{marginTop:0}}>Promote Ad (Views)</h4>
                <input style={styles.input} placeholder="Channel Name (@Username)" />
                <input style={styles.input} placeholder="Channel Link" />
                <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
                  <button onClick={() => setSelectedPlan('100')} style={styles.planBtn(selectedPlan === '100')}>100 Views<br/>0.2 TON</button>
                  <button onClick={() => setSelectedPlan('200')} style={styles.planBtn(selectedPlan === '200')}>200 Views<br/>0.4 TON</button>
                  <button onClick={() => setSelectedPlan('300')} style={styles.planBtn(selectedPlan === '300')}>300 Views<br/>0.5 TON</button>
                </div>
                <div style={styles.copyBox}>
                  <small>ADMIN WALLET:</small>
                  <p style={{fontSize:'10px', wordBreak:'break-all'}}>{APP_CONFIG.ADMIN_WALLET}</p>
                  <button onClick={() => handleCopy(APP_CONFIG.ADMIN_WALLET, "Address")} style={{padding:'2px 8px', fontSize:'10px'}}>COPY ADDRESS</button>
                </div>
                <div style={styles.copyBox}>
                  <small>USER UID (MEMO):</small>
                  <p style={{fontWeight:'bold'}}>{APP_CONFIG.MY_UID}</p>
                  <button onClick={() => handleCopy(APP_CONFIG.MY_UID, "UID")} style={{padding:'2px 8px', fontSize:'10px'}}>COPY UID</button>
                </div>
                <button style={styles.yellowBtn} onClick={() => window.open(APP_CONFIG.ADMIN_TELEGRAM)}>CONFIRM & SEND SCREENSHOT</button>
              </div>
            )}
            {activeTab === 'reward' && (<div><input style={styles.input} placeholder="Enter Reward Code" /><button style={styles.yellowBtn}>CLAIM</button></div>)}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>INVITE & EARN</h2>
          <p style={{textAlign:'center', fontSize:'14px'}}>Earn <strong>0.0005 TON</strong> + <strong>10% Bonus</strong> from friends!</p>
          <div style={styles.copyBox}>
            <small>YOUR LINK:</small>
            <p style={{fontSize:'12px'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`, "Link")} style={styles.yellowBtn}>COPY LINK</button>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:'20px'}}><span>Total Referrals:</span><strong>{referralCount} Users</strong></div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h4>WITHDRAW</h4>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" />
          <button style={styles.yellowBtn}>WITHDRAW NOW</button>
          <h4 style={{marginTop:'20px'}}>HISTORY</h4>
          {withdrawHistory.map(h => (
            <div key={h.id} style={styles.row}><span>{h.amount} TON</span><span style={{color:'orange'}}>Pending</span></div>
          ))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>PROFILE</h2>
          <div style={{textAlign:'center', marginBottom:'15px'}}><span style={{background:'#10b981', color:'#fff', padding:'3px 10px', borderRadius:'15px', fontSize:'11px'}}>● ACTIVE</span></div>
          <div style={styles.row}><span>UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Status:</span><span style={{color:'#10b981'}}>VERIFIED</span></div>
          <div style={{background:'#fff1f2', padding:'10px', borderRadius:'10px', marginTop:'15px', border:'1px solid #f43f5e', fontSize:'11px'}}>
            ⚠️ WARNING: Using fake accounts or cheating will result in a PERMANENT BAN.
          </div>
        </div>
      )}

      <div style={styles.navBar}>
        <div onClick={() => setActiveNav('earn')} style={styles.navBtn(activeNav === 'earn')}>EARN</div>
        <div onClick={() => setActiveNav('invite')} style={styles.navBtn(activeNav === 'invite')}>INVITE</div>
        <div onClick={() => setActiveNav('withdraw')} style={styles.navBtn(activeNav === 'withdraw')}>WITHDRAW</div>
        <div onClick={() => setActiveNav('profile')} style={styles.navBtn(activeNav === 'profile')}>PROFILE</div>
      </div>
    </div>
  );
}

export default App;
