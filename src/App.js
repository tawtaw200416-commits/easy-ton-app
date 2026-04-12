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
  // ✅ စသုံးသူတွေအတွက် 0.0000 ကနေစမယ်
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('ton_bal');
    return saved !== null ? Number(saved) : 0.0000;
  });
  
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

  // ✅ Ads ကြည့်ပြီးမှ Reward (0.0005 + 10%) ပေါင်းမည့် Logic
  const handleRewardAds = (id) => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADS_BLOCK_ID });
      AdController.show().then(() => {
        const baseReward = 0.0005;
        const referralBonus = baseReward * 0.10; // 10% Referral Logic
        setBalance(prev => Number((prev + baseReward + referralBonus).toFixed(5)));
        setCompleted(prev => [...prev, id]);
        alert("Success! 0.0005 TON and 10% Bonus added.");
      }).catch(() => alert("Ads not ready. Please try again."));
    } else {
      // Test Mode
      setBalance(prev => Number((prev + 0.0005).toFixed(5)));
      setCompleted(prev => [...prev, id]);
      alert("Test: 0.0005 TON added.");
    }
  };

  const handleTaskClick = (id, link) => {
    window.open(link, '_blank');
    const btn = document.getElementById(`btn-${id}`);
    if (btn) {
      btn.innerText = "VERIFY TASK";
      btn.style.backgroundColor = "#10b981"; // Green color
      btn.onclick = () => handleRewardAds(id);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '110px' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    copyBox: { background: 'rgba(251,191,36,0.1)', padding: '10px', borderRadius: '10px', border: '1px dashed #fbbf24', textAlign: 'center', cursor: 'pointer', marginBottom: '10px' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', backgroundColor: '#1e293b', borderTop: '2px solid #334155', padding: '10px 0' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', cursor: 'pointer', borderRadius: '10px', margin: '0 5px', border: active ? '1px solid #fbbf24' : 'none' })
  };

  return (
    <div style={styles.main}>
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'bot' && (
            [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
              { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
              { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
              { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
              { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
              { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" },
              { id: 'b7', name: "Check In Bot", link: "https://t.me/check_in_bot" }
            ].filter(t => !completed.includes(t.id)).map(b => (
              <div key={b.id} style={styles.card}>
                <p style={{ fontWeight: 'bold' }}>{b.name}</p>
                <button id={`btn-${b.id}`} onClick={() => handleTaskClick(b.id, b.link)} style={styles.yellowBtn}>START BOT</button>
              </div>
            ))
          )}

          {activeTab === 'social' && socialView === 'list' && (
            <>
              <button style={{ ...styles.yellowBtn, marginBottom: '10px' }} onClick={() => setSocialView('add')}>+ ADD TASK (PROMOTE)</button>
              <div style={styles.card}>
                {[
                  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
                  { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
                  { id: 's3', name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
                  { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
                  { id: 's5', name: "@USDTcloudminer_channel", link: "https://t.me/USDTcloudminer_channel" },
                  { id: 's6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
                  { id: 's7', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
                  { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
                  { id: 's9', name: "@kombo_crypta", link: "https://t.me/kombo_crypta" },
                  { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
                ].filter(t => !completed.includes(t.id)).map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}>
                    <span style={{fontSize: '14px'}}>{s.name}</span>
                    <button id={`btn-${s.id}`} onClick={() => handleTaskClick(s.id, s.link)} style={{ ...styles.yellowBtn, width: '80px', padding: '5px' }}>JOIN</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'social' && socialView === 'add' && (
            <div style={styles.card}>
              <h3 style={{textAlign:'center', marginTop:0}}>Add New Task</h3>
              <input style={styles.input} placeholder="Channel Name" />
              <input style={styles.input} placeholder="Invite Link" />
              <select style={styles.input}>
                <option>100 Views - 0.2 TON</option>
                <option>200 Views - 0.4 TON</option>
                <option>300 Views - 0.5 TON</option>
                <option>400 Views - 0.5 TON</option>
              </select>
              <div style={styles.copyBox} onClick={() => copyToClipboard(APP_CONFIG.ADMIN_WALLET)}>
                <small>Admin Wallet (Click to Copy):</small><br/>
                <b style={{fontSize:'10px'}}>{APP_CONFIG.ADMIN_WALLET}</b>
              </div>
              <div style={styles.copyBox} onClick={() => copyToClipboard(APP_CONFIG.MY_UID)}>
                <small>Your UID (Memo):</small><br/>
                <b>{APP_CONFIG.MY_UID}</b>
              </div>
              <button style={styles.yellowBtn} onClick={() => setSocialView('list')}>CONFIRM PAYMENT</button>
              <p style={{textAlign:'center', cursor:'pointer'}} onClick={()=>setSocialView('list')}>Back</p>
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

      {activeNav === 'invite' && (
        <div>
          <div style={styles.card}>
            <h3>INVITE FRIENDS</h3>
            <p style={{fontSize:'13px', color:'#fbbf24', marginBottom:'10px'}}>🎁 Get 0.0005 TON for each friend invited!<br/>💰 Plus 10% commission from your friends' task earnings!</p>
            <button onClick={() => copyToClipboard(`https://t.me/Bot?start=${APP_CONFIG.MY_UID}`)} style={styles.yellowBtn}>COPY LINK</button>
          </div>
          <h4>HISTORY</h4>
          <div style={styles.card}>
            <table style={{width:'100%', fontSize:'13px'}}>
              <thead><tr style={{color:'#94a3b8'}}><th>UID</th><th>Status</th><th>Reward</th></tr></thead>
              <tbody>
                <tr><td>18945532</td><td style={{color:'#10b981'}}>Success</td><td>0.0005 TON</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAWAL</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" />
          <input style={styles.input} placeholder="Wallet Address" />
          <button style={styles.yellowBtn}>WITHDRAW NOW</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={{ textAlign: 'center' }}>
          <div style={styles.card}>👤 UID: {APP_CONFIG.MY_UID} <button onClick={()=>copyToClipboard(APP_CONFIG.MY_UID)} style={{marginLeft:'5px', padding:'3px'}}>Copy</button></div>
          <div style={{ color: '#ef4444', padding: '10px', borderRadius: '15px', background: 'rgba(239, 68, 68, 0.1)' }}>⚠️ NOTICE: NO MULTIPLE ACCOUNTS!</div>
        </div>
      )}

      <div style={styles.navBar}>
        <div onClick={() => setActiveNav('earn')} style={styles.navBtn(activeNav === 'earn')}>💰<br/><small>EARN</small></div>
        <div onClick={() => setActiveNav('invite')} style={styles.navBtn(activeNav === 'invite')}>👥<br/><small>INVITE</small></div>
        <div onClick={() => setActiveNav('withdraw')} style={styles.navBtn(activeNav === 'withdraw')}>💸<br/><small>WITHDRAW</small></div>
        <div onClick={() => setActiveNav('profile')} style={styles.navBtn(activeNav === 'profile')}>👤<br/><small>PROFILE</small></div>
      </div>
    </div>
  );
}

export default App;
