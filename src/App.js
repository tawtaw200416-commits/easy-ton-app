import React, { useState, useEffect } from 'react';

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: "1793453606",
  ADMIN_TELEGRAM: "https://t.me/GrowTeaNews",
  ADSGRAM_BLOCK_ID: "YOUR_BLOCK_ID_HERE"
};

function App() {
  // --- Data Persistence Layer ---
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

  // --- Task Data ---
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
    { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
  ];

  // --- Handlers ---
  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then(() => {
        setBalance(prev => Number((prev + 0.0005).toFixed(5)));
        setCompleted(prev => [...prev, id]);
      }).catch(() => alert("Please watch the full ad to verify!"));
    } else {
      setTimeout(() => {
        setBalance(prev => Number((prev + 0.0005).toFixed(5)));
        setCompleted(prev => [...prev, id]);
      }, 5000);
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => alert(`${label} Copied!`));
  };

  const getStatus = (item) => {
    const hoursPast = (Date.now() - item.timestamp) / (1000 * 60 * 60);
    return hoursPast >= 24 ? 'Complete' : 'Pending';
  };

  // --- Styles ---
  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '15px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '15px' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', borderTop: '2px solid #fbbf24', padding: '15px 0', height: '85px', zIndex: 100 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #334155' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '12px', boxSizing: 'border-box', fontWeight: '900' },
    planBtn: (active) => ({ flex: 1, padding: '10px', borderRadius: '10px', border: active ? '2px solid #fbbf24' : '1px solid #334155', backgroundColor: active ? '#fbbf24' : '#1e293b', color: active ? '#000' : '#fff', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }),
    copyBox: { background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px dashed #fbbf24', marginBottom: '10px' }
  };

  return (
    <div style={styles.main}>
      {/* Header - Total Balance */}
      <div style={{ textAlign: 'center', background: 'linear-gradient(145deg, #1e293b, #0f172a)', padding: '30px', borderRadius: '25px', marginBottom: '25px', border: '2px solid #fbbf24' }}>
        <small style={{ color: '#94a3b8', fontWeight: '900' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', fontSize: '42px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} <span style={{fontSize:'18px'}}>TON</span></h1>
      </div>

      {/* --- EARN SECTION --- */}
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

            {showAddTask && (
              <div>
                <h3 style={{fontWeight:'900', color:'#fbbf24', marginTop:0}}>Promote Ad</h3>
                <input style={styles.input} placeholder="Channel Name (@Username)" />
                <input style={styles.input} placeholder="Channel Link" />
                <p style={{fontSize: '12px', fontWeight: '900', marginBottom: '10px'}}>Select Plan:</p>
                <div style={{display: 'flex', gap: '5px', marginBottom: '15px'}}>
                  <button onClick={() => setSelectedPlan('100')} style={styles.planBtn(selectedPlan === '100')}>100 Ads<br/>0.2 TON</button>
                  <button onClick={() => setSelectedPlan('200')} style={styles.planBtn(selectedPlan === '200')}>200 Ads<br/>0.4 TON</button>
                  <button onClick={() => setSelectedPlan('300')} style={styles.planBtn(selectedPlan === '300')}>300 Ads<br/>0.5 TON</button>
                </div>
                <div style={styles.copyBox}>
                  <small style={{color: '#94a3b8', fontSize: '10px'}}>TON ADDRESS</small>
                  <p style={{fontSize: '11px', color: '#fff', wordBreak: 'break-all', margin: '5px 0'}}>{APP_CONFIG.ADMIN_WALLET}</p>
                  <button onClick={() => handleCopy(APP_CONFIG.ADMIN_WALLET, "Address")} style={{background:'#fbbf24', border:'none', padding:'4px 10px', borderRadius:'6px', fontWeight:'900', fontSize:'10px'}}>COPY ADDRESS</button>
                </div>
                <div style={styles.copyBox}>
                  <small style={{color: '#94a3b8', fontSize: '10px'}}>MEMO (IMPORTANT)</small>
                  <p style={{fontSize: '16px', color: '#fbbf24', fontWeight: '900', margin: '5px 0'}}>{APP_CONFIG.MY_UID}</p>
                  <button onClick={() => handleCopy(APP_CONFIG.MY_UID, "Memo")} style={{background:'#fbbf24', border:'none', padding:'4px 10px', borderRadius:'6px', fontWeight:'900', fontSize:'10px'}}>COPY MEMO</button>
                </div>
                <button style={styles.yellowBtn} onClick={() => { window.open(APP_CONFIG.ADMIN_TELEGRAM); setShowAddTask(false); }}>CONFIRM PAYMENT</button>
              </div>
            )}

            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Reward Code" />
                <button style={styles.yellowBtn}>CLAIM REWARD</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* --- INVITE SECTION --- */}
      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{color: '#fbbf24', marginTop: 0, fontWeight: '900', textAlign: 'center'}}>INVITE & EARN</h2>
          <div style={{textAlign: 'center', padding: '10px 0'}}>
            <span style={{fontSize: '50px'}}>👥</span>
          </div>
          <p style={{textAlign: 'center', fontSize: '14px', color: '#94a3b8', marginBottom: '20px'}}>
            Share your referral link and earn <br/>
            <strong style={{color: '#fbbf24'}}>0.0005 TON</strong> for each user!
          </p>
          
          <div style={styles.copyBox}>
            <small style={{color: '#94a3b8', fontSize: '10px'}}>YOUR REFERRAL LINK:</small>
            <p style={{fontSize: '11px', color: '#fff', wordBreak: 'break-all', margin: '10px 0'}}>
              https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}
            </p>
            <button onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`, "Invite Link")} style={styles.yellowBtn}>COPY LINK</button>
          </div>

          <div style={{...styles.row, borderBottom: 'none', background: '#0f172a', padding: '15px', borderRadius: '15px', marginTop: '10px'}}>
            <span style={{fontWeight: '900'}}>My Referrals:</span>
            <span style={{color: '#fbbf24', fontWeight: '900', fontSize: '18px'}}>{referralCount} Users</span>
          </div>
        </div>
      )}

      {/* --- WITHDRAW SECTION --- */}
      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', fontWeight: '900'}}>WITHDRAW</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.yellowBtn} onClick={() => {
            const amount = parseFloat(withdrawAmount);
            if (amount >= 0.1 && amount <= balance) {
              setWithdrawHistory([{id: Date.now(), amount, timestamp: Date.now()}, ...withdrawHistory]);
              setBalance(prev => Number((prev - amount).toFixed(5)));
              setWithdrawAmount('');
              alert("Withdraw Requested!");
            } else alert("Invalid Amount!");
          }}>WITHDRAW NOW</button>
          
          <h4 style={{marginTop: '20px', color: '#fbbf24'}}>HISTORY</h4>
          {withdrawHistory.map(item => (
            <div key={item.id} style={styles.row}>
              <span>{item.amount} TON</span>
              <span style={{color: getStatus(item) === 'Complete' ? '#10b981' : '#fbbf24'}}>{getStatus(item)}</span>
            </div>
          ))}
        </div>
      )}

      {/* --- PROFILE SECTION --- */}
      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{color: '#fbbf24', marginTop: 0, fontWeight: '900', textAlign: 'center'}}>USER PROFILE</h2>
          <div style={{textAlign: 'center', marginBottom: '20px'}}>
             <div style={{width: '70px', height: '70px', background: '#fbbf24', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px'}}>👤</div>
          </div>

          <div style={styles.row}>
            <span style={{color: '#94a3b8', fontWeight: '900'}}>UID:</span>
            <span style={{fontWeight: '900'}}>{APP_CONFIG.MY_UID}</span>
          </div>
          <div style={styles.row}>
            <span style={{color: '#94a3b8', fontWeight: '900'}}>Wallet Status:</span>
            <span style={{color: '#10b981', fontWeight: '900'}}>CONNECTED</span>
          </div>
          <div style={styles.row}>
            <span style={{color: '#94a3b8', fontWeight: '900'}}>Current Balance:</span>
            <span style={{color: '#fbbf24', fontWeight: '900'}}>{balance.toFixed(4)} TON</span>
          </div>
          <div style={styles.row}>
            <span style={{color: '#94a3b8', fontWeight: '900'}}>Verification:</span>
            <span style={{color: '#fbbf24', fontWeight: '900'}}>LEVEL 1</span>
          </div>

          <button onClick={() => window.open(APP_CONFIG.ADMIN_TELEGRAM)} style={{...styles.yellowBtn, marginTop: '20px', background: '#334155', color: '#fff'}}>CONTACT SUPPORT</button>
        </div>
      )}

      {/* Navigation Footer */}
      <div style={styles.navBar}>
        <div onClick={() => setActiveNav('earn')} style={styles.navBtn(activeNav === 'earn')}><span style={{fontSize:'22px'}}>💰</span><span>EARN</span></div>
        <div onClick={() => setActiveNav('invite')} style={styles.navBtn(activeNav === 'invite')}><span style={{fontSize:'22px'}}>👥</span><span>INVITE</span></div>
        <div onClick={() => setActiveNav('withdraw')} style={styles.navBtn(activeNav === 'withdraw')}><span style={{fontSize:'22px'}}>💸</span><span>WITHDRAW</span></div>
        <div onClick={() => setActiveNav('profile')} style={styles.navBtn(activeNav === 'profile')}><span style={{fontSize:'22px'}}>👤</span><span>PROFILE</span></div>
      </div>
    </div>
  );
}

export default App;
