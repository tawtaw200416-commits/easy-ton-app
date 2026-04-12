import React, { useState, useEffect } from 'react';

// ✅ Configuration
const APP_CONFIG = {
  BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_ID: "5020977059",
  ADS_BLOCK_ID: "27393",
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: "1793453606"
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [isClaimed, setIsClaimed] = useState(() => localStorage.getItem('gift_claimed') === 'true');
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [socialView, setSocialView] = useState('list');

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
  }, [balance, completed, isClaimed, withdrawHistory]);

  const botTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" },
    { id: 'b7', name: "Check In Bot", link: "https://t.me/check_in_bot" }
  ];

  const socialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 's3', name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
    { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
    { id: 's5', name: "@USDTcloudminer_channel", link: "https://t.me/USDTcloudminer_channel" },
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

  const handleAction = (id, link) => {
    window.open(link, '_blank');
    const btn = document.getElementById(`btn-${id}`);
    if (btn) {
      btn.innerText = "VERIFY TASK";
      btn.style.backgroundColor = "#10b981";
      btn.onclick = () => {
        if (window.Adsgram) {
          window.Adsgram.init({ blockId: APP_CONFIG.ADS_BLOCK_ID }).show().then(() => {
            setBalance(prev => prev + 0.0005);
            setCompleted(prev => [...prev, id]);
            alert("Reward 0.0005 TON Added!");
          });
        }
      };
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '12px', boxSizing: 'border-box' },
    copyBox: { background: 'rgba(251,191,36,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid #fbbf24', textAlign: 'center', cursor: 'pointer', marginBottom: '10px' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '10px', backgroundColor: '#1e293b', borderTop: '2px solid #334155', height: '70px' },
    navItem: (active) => ({ textAlign: 'center', flex: 1, padding: '5px', borderRadius: '10px', border: active ? '1px solid #fbbf24' : '1px solid transparent', color: active ? '#fbbf24' : '#94a3b8', cursor: 'pointer', transition: '0.3s' })
  };

  return (
    <div style={styles.main}>
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '25px', borderRadius: '20px', marginBottom: '25px' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', fontSize: '32px', margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'bot' && botTasks.filter(t => !completed.includes(t.id)).map(b => (
            <div key={b.id} style={styles.card}>
              <p style={{ fontWeight: 'bold', fontSize: '18px' }}>{b.name}</p>
              <button id={`btn-${b.id}`} onClick={() => handleAction(b.id, b.link)} style={styles.yellowBtn}>START BOT</button>
            </div>
          ))}

          {activeTab === 'social' && socialView === 'list' && (
            <>
              <button style={{ ...styles.yellowBtn, marginBottom: '15px' }} onClick={() => setSocialView('add')}>+ ADD TASK (PROMOTE CHANNEL)</button>
              <div style={styles.card}>
                {socialTasks.filter(t => !completed.includes(t.id)).map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' }}>
                    <span style={{ fontSize: '15px' }}>{s.name}</span>
                    <button id={`btn-${s.id}`} onClick={() => handleAction(s.id, s.link)} style={{ ...styles.yellowBtn, width: '90px', padding: '8px' }}>JOIN</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'social' && socialView === 'add' && (
            <div style={styles.card}>
              <h3 style={{ marginTop: 0, color: '#fbbf24', textAlign: 'center' }}>Add New Task</h3>
              <input id="chan_name" style={styles.input} placeholder="Channel Name" />
              <input id="inv_link" style={styles.input} placeholder="Invite Link" />
              
              <label style={{fontSize: '12px', color: '#94a3b8'}}>Select Plan:</label>
              <select id="plan_select" style={styles.input}>
                <option value="0.2">100 Views - 0.2 TON</option>
                <option value="0.4">200 Views - 0.4 TON</option>
                <option value="0.5">300 Views - 0.5 TON</option>
              </select>

              <div style={styles.copyBox} onClick={() => copyToClipboard(APP_CONFIG.ADMIN_WALLET)}>
                <small style={{ color: '#94a3b8' }}>Pay to Wallet (Copy):</small><br/>
                <b style={{fontSize: '11px'}}>{APP_CONFIG.ADMIN_WALLET}</b>
              </div>

              <div style={styles.copyBox} onClick={() => copyToClipboard(APP_CONFIG.MY_UID)}>
                <small style={{ color: '#94a3b8' }}>Your Memo/UID (Copy):</small><br/>
                <b style={{fontSize: '18px', color: '#fbbf24'}}>{APP_CONFIG.MY_UID}</b>
              </div>

              <button style={styles.yellowBtn} onClick={() => { alert("Order details sent! Wait for Admin confirmation."); setSocialView('list'); }}>CONFIRM PAYMENT</button>
              <p style={{textAlign:'center', marginTop:'15px', color: '#94a3b8', cursor: 'pointer'}} onClick={()=>setSocialView('list')}>Back</p>
            </div>
          )}

          {activeTab === 'reward' && (
            <div style={styles.card}>
              <h4>DAILY GIFT CODE</h4>
              {isClaimed ? <p style={{ color: '#10b981', textAlign: 'center' }}>CLAIMED ✅</p> : (
                <>
                  <input id="gift" type="password" style={styles.input} placeholder="Enter Code" />
                  <button onClick={() => {if(document.getElementById('gift').value==="GIFT77"){setBalance(b=>b+0.01);setIsClaimed(true);alert("Success!")}}} style={styles.yellowBtn}>CLAIM</button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Navigation Footer */}
      <div style={styles.navBar}>
        <div onClick={() => setActiveNav('earn')} style={styles.navItem(activeNav === 'earn')}>
          <span style={{ fontSize: '20px' }}>💰</span><br/><small>EARN</small>
        </div>
        <div onClick={() => setActiveNav('invite')} style={styles.navItem(activeNav === 'invite')}>
          <span style={{ fontSize: '20px' }}>👥</span><br/><small>INVITE</small>
        </div>
        <div onClick={() => setActiveNav('withdraw')} style={styles.navItem(activeNav === 'withdraw')}>
          <span style={{ fontSize: '20px' }}>💸</span><br/><small>WITHDRAW</small>
        </div>
        <div onClick={() => setActiveNav('profile')} style={styles.navItem(activeNav === 'profile')}>
          <span style={{ fontSize: '20px' }}>👤</span><br/><small>PROFILE</small>
        </div>
      </div>
    </div>
  );
}

export default App;
