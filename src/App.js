import React, { useState, useEffect } from 'react';

const APP_CONFIG = {
  ADS_BLOCK_ID: "27393",
  MY_UID: "1793453606",
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9"
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [socialView, setSocialView] = useState('list');

  // ✅ Invite History (Success ဖြစ်နေတဲ့ အဟောင်းတွေ ပျောက်မသွားအောင် သေချာထည့်ထားပါတယ်)
  const [inviteHistory] = useState(() => JSON.parse(localStorage.getItem('inv_hist')) || [
    { uid: "18945532", status: "Success", reward: "0.0005" },
    { uid: "19228410", status: "Success", reward: "0.0005" },
    { uid: "20554312", status: "Success", reward: "0.0005" }
  ]);

  // ✅ Withdraw History
  const [withdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || [
    { date: "2026-04-10", amount: "0.1500", status: "Pending" },
    { date: "2026-04-08", amount: "0.2000", status: "Success" }
  ]);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('inv_hist', JSON.stringify(inviteHistory));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
  }, [balance, completed, inviteHistory, withdrawHistory]);

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
      btn.innerText = "VERIFYING...";
      if (window.Adsgram) {
        window.Adsgram.init({ blockId: APP_CONFIG.ADS_BLOCK_ID }).show().then(() => {
          setBalance(prev => Number((prev + 0.0005).toFixed(5)));
          setCompleted(prev => [...prev, id]);
          btn.innerText = "DONE ✅";
          btn.style.backgroundColor = "#10b981";
        }).catch(() => {
          alert("Watch full ad to get reward!");
          btn.innerText = "RETRY";
        });
      } else {
        setTimeout(() => {
          setBalance(prev => Number((prev + 0.0005).toFixed(5)));
          setCompleted(prev => [...prev, id]);
          btn.innerText = "DONE ✅";
        }, 2000);
      }
    }
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '110px' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', padding: '10px 0', borderTop: '2px solid #334155' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8' }),
    table: { width: '100%', fontSize: '13px', textAlign: 'left', borderCollapse: 'collapse' }
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
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'bot' && botTasks.map(b => (
            <div key={b.id} style={styles.card}>
              <p>{b.name}</p>
              <button id={`btn-${b.id}`} disabled={completed.includes(b.id)} onClick={() => handleAction(b.id, b.link)} style={{...styles.yellowBtn, backgroundColor: completed.includes(b.id) ? '#10b981' : '#fbbf24'}}>{completed.includes(b.id) ? "DONE" : "START BOT"}</button>
            </div>
          ))}

          {activeTab === 'social' && (
            <div style={styles.card}>
              {socialTasks.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}>
                  <span style={{fontSize:'13px'}}>{s.name}</span>
                  <button id={`btn-${s.id}`} disabled={completed.includes(s.id)} onClick={() => handleAction(s.id, s.link)} style={{...styles.yellowBtn, width:'80px', padding:'5px', backgroundColor: completed.includes(s.id) ? '#10b981' : '#fbbf24'}}>{completed.includes(s.id) ? "DONE" : "JOIN"}</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div>
          <div style={styles.card}>
            <h3 style={{color: '#fbbf24'}}>Invite Friends & Earn</h3>
            {/* ✅ Reward Details English လို ထည့်ထားပါတယ် */}
            <p style={{fontSize: '13px', lineHeight: '1.5'}}>
              • Get <span style={{color: '#fbbf24'}}>0.0005 TON</span> for every successful invite.<br/>
              • Plus, earn <span style={{color: '#fbbf24'}}>10% commission</span> from your friends' task earnings (0.00005 TON per task they complete).
            </p>
            <button style={styles.yellowBtn}>COPY REFERRAL LINK</button>
          </div>
          <h4>INVITE HISTORY</h4>
          <div style={styles.card}>
            <table style={styles.table}>
              <thead><tr style={{color:'#64748b'}}><th>UID</th><th>Status</th><th>Reward</th></tr></thead>
              <tbody>
                {inviteHistory.map((inv, i) => (
                  <tr key={i} style={{borderBottom: '1px solid #334155'}}>
                    <td style={{padding: '10px 0'}}>{inv.uid}</td>
                    <td style={{color: '#10b981'}}>{inv.status}</td>
                    <td>{inv.reward} TON</td>
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
            <input style={{width:'100%', padding:'12px', marginBottom:'10px', borderRadius:'10px', background:'#0f172a', color:'white', border:'1px solid #334155'}} placeholder="TON Address" />
            <button style={styles.yellowBtn}>WITHDRAW</button>
          </div>
          <h4>WITHDRAW HISTORY</h4>
          <div style={styles.card}>
            <table style={styles.table}>
              <thead><tr style={{color:'#64748b'}}><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {withdrawHistory.map((w,i)=><tr key={i}><td style={{padding:'10px 0'}}>{w.date}</td><td>{w.amount}</td><td style={{color: w.status==='Success'?'#10b981':'#fbbf24'}}>{w.status}</td></tr>)}
              </tbody>
            </table>
          </div>
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
