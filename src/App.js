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
        setCompleted(prev => [...prev, id]); // Task ကို List ထဲကနေ ဖယ်ထုတ်ဖို့ completed ထဲထည့်လိုက်တာပါ
      }, 3000);
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => alert(`${label} Copied!`));
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '15px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '15px' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', borderTop: '2px solid #fbbf24', padding: '12px 0', height: '80px', alignItems: 'center', zIndex: 100 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #334155' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '12px', boxSizing: 'border-box', fontWeight: '900' }
  };

  return (
    <div style={styles.main}>
      {/* Balance Banner */}
      <div style={{ textAlign: 'center', background: 'linear-gradient(145deg, #1e293b, #0f172a)', padding: '30px', borderRadius: '25px', marginBottom: '25px', border: '2px solid #fbbf24' }}>
        <small style={{ color: '#94a3b8', fontWeight: '900' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', fontSize: '42px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} <span style={{fontSize:'18px'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          {/* Tabs Menu */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowAddTask(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: '900' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={styles.card}>
            {/* Bot Tab - လုပ်ပြီးသား task တွေ မပေါ်အောင် filter စစ်ထားတယ် */}
            {activeTab === 'bot' && botTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}>
                <span style={{fontWeight: '900'}}>{t.name}</span>
                <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>START</button>
              </div>
            ))}

            {/* Social Tab - လုပ်ပြီးသား task တွေ မပေါ်အောင် filter စစ်ထားတယ် */}
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

            {/* Reward Tab */}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Reward Code" />
                <button style={styles.yellowBtn}>CLAIM REWARD</button>
              </div>
            )}

            {/* Promote Ad UI */}
            {showAddTask && (
              <div>
                <h3 style={{fontWeight:'900', color:'#fbbf24', marginTop:0}}>Promote Ad</h3>
                <input style={styles.input} placeholder="Channel Name (@Username)" />
                <input style={styles.input} placeholder="Link" />
                <div style={{background: '#0f172a', padding: '15px', borderRadius: '15px', border: '1px dashed #fbbf24', marginBottom: '15px'}}>
                   <p style={{fontSize: '11px', fontWeight: '900', color: '#fbbf24', wordBreak:'break-all'}}>{APP_CONFIG.ADMIN_WALLET}</p>
                   <button onClick={() => handleCopy(APP_CONFIG.ADMIN_WALLET, "Wallet")} style={{background:'#fbbf24', border:'none', padding:'6px 12px', borderRadius:'8px', fontWeight:'900', fontSize:'10px', marginTop:'8px'}}>COPY ADDRESS</button>
                </div>
                <button style={styles.yellowBtn} onClick={() => { window.open(APP_CONFIG.ADMIN_TELEGRAM); setShowAddTask(false); }}>CONFIRM PAYMENT</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Invite Section */}
      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{color: '#fbbf24', marginTop: 0, fontWeight: '900'}}>INVITE & EARN</h2>
          <p style={{fontSize: '14px', color: '#94a3b8', fontWeight: '900'}}>
             Invite friends and earn <span style={{color: '#fbbf24'}}>0.0005 TON</span> per referral plus <span style={{color: '#fbbf24'}}>10% commission</span>.
          </p>
          <div style={{background: '#0f172a', padding: '15px', borderRadius: '15px', border: '1px dashed #fbbf24', marginBottom: '15px'}}>
            <small style={{color: '#94a3b8', fontSize: '10px', fontWeight: '900'}}>REFERRAL LINK:</small>
            <p style={{fontSize: '11px', color: '#fff', wordBreak: 'break-all', margin: '10px 0'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`, "Invite Link")} style={{...styles.yellowBtn, padding: '10px', fontSize: '12px'}}>COPY LINK</button>
          </div>
          <h4 style={{marginTop: '20px', color: '#fbbf24', borderTop: '1px solid #334155', paddingTop: '15px'}}>INVITE HISTORY</h4>
          <div style={styles.row}><span>Referral Bonus</span><span style={{color: '#10b981'}}>+ 0.0005 TON</span></div>
          <div style={styles.row}><span>Task Commission (10%)</span><span style={{color: '#10b981'}}>+ 0.00005 TON</span></div>
        </div>
      )}

      {/* Withdraw Section */}
      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', fontWeight: '900'}}>WITHDRAW</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" />
          <button style={styles.yellowBtn}>WITHDRAW NOW</button>
        </div>
      )}

      {/* Profile Section */}
      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', fontWeight: '900'}}>USER PROFILE</h3>
          <div style={styles.row}><span>User UID:</span><span>{APP_CONFIG.MY_UID}</span></div>
          <div style={{ background: '#450a0a', border: '2px solid #ef4444', padding: '15px', borderRadius: '15px', textAlign: 'center', marginTop: '20px' }}>
            <p style={{ color: '#fca5a5', fontWeight: '900', margin: 0, fontSize: '13px' }}>
              ⚠️ WARNING: <br/> Using multiple accounts or fake referrals will result in a PERMANENT BAN.
            </p>
          </div>
        </div>
      )}

      {/* Footer Navigation Bar */}
      <div style={styles.navBar}>
        <div onClick={() => setActiveNav('earn')} style={styles.navBtn(activeNav === 'earn')}>
          <span style={{fontSize:'20px'}}>💰</span><span>EARN</span>
        </div>
        <div onClick={() => setActiveNav('invite')} style={styles.navBtn(activeNav === 'invite')}>
          <span style={{fontSize:'20px'}}>👥</span><span>INVITE</span>
        </div>
        <div onClick={() => setActiveNav('withdraw')} style={styles.navBtn(activeNav === 'withdraw')}>
          <span style={{fontSize:'20px'}}>💸</span><span>WITHDRAW</span>
        </div>
        <div onClick={() => setActiveNav('profile')} style={styles.navBtn(activeNav === 'profile')}>
          <span style={{fontSize:'20px'}}>👤</span><span>PROFILE</span>
        </div>
      </div>
    </div>
  );
}

export default App;
