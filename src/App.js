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
  
  // ✅ Invite History (Success, Completed Status အဟောင်းများ)
  const [inviteHistory] = useState(() => JSON.parse(localStorage.getItem('inv_hist')) || [
    { uid: "18945532", status: "Completed", reward: "0.0005" }
  ]);

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [socialView, setSocialView] = useState('list');

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
  }, [balance, completed, isClaimed, withdrawHistory]);

  // ✅ Task Reward Logic (0.0005 TON + 10% Invite Bonus)
  const completeTaskLogic = () => {
    const baseReward = 0.0005;
    const inviteBonus = baseReward * 0.10; // 10% Extra Commission
    setBalance(prev => prev + baseReward + inviteBonus);
  };

  const handleAction = (id, link) => {
    window.open(link, '_blank');
    const btn = document.getElementById(`btn-${id}`);
    if (btn) {
      btn.innerText = "VERIFYING...";
      setTimeout(() => {
        btn.innerText = "COMPLETED ✅";
        btn.style.backgroundColor = "#10b981";
        completeTaskLogic(); // Logic ခေါ်ယူခြင်း
        setCompleted(prev => [...prev, id]);
      }, 3000);
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
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', backgroundColor: '#1e293b', borderTop: '1px solid #334155', padding: '10px 0' },
    navBtn: (active) => ({ textAlign: 'center', cursor: 'pointer', border: active ? '1px solid #fbbf24' : '1px solid transparent', borderRadius: '12px', flex: 1, margin: '0 5px', color: active ? '#fbbf24' : '#94a3b8', padding: '5px' })
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
                <button id={`btn-${b.id}`} onClick={() => handleAction(b.id, b.link)} style={styles.yellowBtn}>START BOT</button>
              </div>
            ))
          )}

          {activeTab === 'social' && socialView === 'list' && (
            <>
              <button style={{ ...styles.yellowBtn, marginBottom: '10px' }} onClick={() => setSocialView('add')}>+ ADD TASK</button>
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
                    <span>{s.name}</span>
                    <button id={`btn-${s.id}`} onClick={() => handleAction(s.id, s.link)} style={{ ...styles.yellowBtn, width: '80px', padding: '5px' }}>JOIN</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'social' && socialView === 'add' && (
            <div style={styles.card}>
              <h3>Add New Task</h3>
              <input style={styles.input} placeholder="Channel Name" />
              <input style={styles.input} placeholder="Invite Link" />
              <select style={styles.input}>
                <option>100 Views - 0.2 TON</option>
                <option>200 Views - 0.4 TON</option>
                <option>400 Views - 0.5 TON</option>
              </select>
              <button style={styles.yellowBtn} onClick={() => setSocialView('list')}>CONFIRM</button>
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
            {/* ✅ Invite Reward စာသားများ ထည့်သွင်းထားပါတယ် */}
            <p style={{fontSize:'13px', color:'#fbbf24', marginBottom:'10px'}}>
               🎁 Get 0.0005 TON for each friend invited!<br/>
               💰 Plus 10% commission from your friends' task earnings!
            </p>
            <button onClick={() => copyToClipboard(`https://t.me/Bot?start=${APP_CONFIG.MY_UID}`)} style={styles.yellowBtn}>COPY LINK</button>
          </div>
          <h4>INVITATION HISTORY</h4>
          <div style={styles.card}>
            <table style={{ width: '100%', fontSize: '13px', textAlign: 'left' }}>
              <thead><tr style={{ color: '#64748b' }}><th>UID</th><th>Status</th><th>Reward</th></tr></thead>
              <tbody>
                {inviteHistory.map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '8px 0' }}>{h.uid}</td>
                    <td style={{ color: '#10b981' }}>{h.status}</td>
                    <td>{h.reward} TON</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div>
          <div style={styles.card}>
            <h3>WITHDRAWAL</h3>
            <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" />
            <input style={styles.input} placeholder="Wallet Address" />
            <button style={styles.yellowBtn}>WITHDRAW NOW</button>
          </div>
          <h4>WITHDRAWAL HISTORY</h4>
          <div style={styles.card}>No records found.</div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={{ textAlign: 'center' }}>
          <div style={styles.card}>👤 UID: {APP_CONFIG.MY_UID}</div>
          <div style={{ color: '#ef4444', padding: '15px', borderRadius: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' }}>⚠️ NOTICE: MULTIPLE ACCOUNTS ARE BANNED!</div>
        </div>
      )}

      {/* ✅ Navigation Buttons (ပုံစံအမှန်) */}
      <div style={styles.navBar}>
        <div onClick={() => setActiveNav('earn')} style={styles.navBtn(activeNav === 'earn')}>
          <span style={{ fontSize: '22px' }}>💰</span><br/><small>EARN</small>
        </div>
        <div onClick={() => setActiveNav('invite')} style={styles.navBtn(activeNav === 'invite')}>
          <span style={{ fontSize: '22px' }}>👥</span><br/><small>INVITE</small>
        </div>
        <div onClick={() => setActiveNav('withdraw')} style={styles.navBtn(activeNav === 'withdraw')}>
          <span style={{ fontSize: '22px' }}>💸</span><br/><small>WITHDRAW</small>
        </div>
        <div onClick={() => setActiveNav('profile')} style={styles.navBtn(activeNav === 'profile')}>
          <span style={{ fontSize: '22px' }}>👤</span><br/><small>PROFILE</small>
        </div>
      </div>
    </div>
  );
}

export default App;
