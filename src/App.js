import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [isClaimed, setIsClaimed] = useState(() => localStorage.getItem('gift_claimed') === 'true');
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [socialView, setSocialView] = useState('list');

  const adminWallet = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";
  const adsBlockId = "27393";

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
  }, [balance, completed, isClaimed]);

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
      btn.style.backgroundColor = "#10b981";
      setTimeout(() => {
        if (window.Adsgram) {
          window.Adsgram.init({ blockId: adsBlockId }).show().then(() => {
            setBalance(p => p + 0.0005);
            setCompleted(p => [...p, id]);
          });
        }
      }, 1000);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '8px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    copyBox: { background: 'rgba(251,191,36,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid #fbbf24', textAlign: 'center', cursor: 'pointer', marginBottom: '10px' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }
  };

  return (
    <div style={styles.main}>
      {/* BALANCE HEADER */}
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {/* BOT TAB */}
          {activeTab === 'bot' && botTasks.filter(t => !completed.includes(t.id)).map(b => (
            <div key={b.id} style={styles.card}>
              <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>{b.name}</p>
              <button id={`btn-${b.id}`} onClick={() => handleAction(b.id, b.link)} style={styles.yellowBtn}>START BOT</button>
            </div>
          ))}

          {/* SOCIAL TAB - +ADD TASK ကို list အောက်မှာ ကပ်လျက်ထားထားပါတယ် */}
          {activeTab === 'social' && socialView === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {socialTasks.filter(t => !completed.includes(t.id)).map(s => (
                <div key={s.id} style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{s.name}</span>
                    <button id={`btn-${s.id}`} onClick={() => handleAction(s.id, s.link)} style={{ ...styles.yellowBtn, width: '85px', padding: '8px' }}>JOIN</button>
                  </div>
                </div>
              ))}
              {/* ပုံထဲကအတိုင်း social list တွေနဲ့ ကပ်လျက် Button */}
              <button 
                style={{ ...styles.yellowBtn, marginTop: '2px', height: '50px' }} 
                onClick={() => setSocialView('add')}
              >
                + ADD TASK
              </button>
            </div>
          )}

          {/* ADD TASK SYSTEM */}
          {activeTab === 'social' && socialView === 'add' && (
            <div style={styles.card}>
              <h3 style={{ marginTop: 0, color: '#fbbf24' }}>Add New Task</h3>
              <input style={styles.input} placeholder="Task Name" />
              <input style={styles.input} placeholder="Telegram Link" />
              <select style={styles.input}>
                <option>100 Views - 0.2 TON</option>
                <option>200 Views - 0.4 TON</option>
                <option>300 Views - 0.5 TON</option>
              </select>
              
              <div style={styles.copyBox} onClick={() => copyToClipboard(adminWallet)}>
                <small style={{color: '#94a3b8'}}>TON Address (Click to Copy)</small><br/>
                <span style={{fontWeight: 'bold', fontSize: '13px'}}>{adminWallet}</span>
              </div>

              <div style={styles.copyBox} onClick={() => copyToClipboard(userUID)}>
                <small style={{color: '#94a3b8'}}>MEMO / UID (Click to Copy)</small><br/>
                <span style={{fontWeight: 'bold', fontSize: '20px', color: '#fbbf24'}}>{userUID}</span>
              </div>

              <button style={styles.yellowBtn} onClick={() => {alert("Submitted to Admin!"); setSocialView('list')}}>CONFIRM PAYMENT</button>
              <p style={{textAlign:'center', marginTop:'15px', cursor:'pointer', color:'#94a3b8'}} onClick={()=>setSocialView('list')}>Back to list</p>
            </div>
          )}

          {activeTab === 'reward' && (
            <div style={styles.card}>
              <h4>GIFT CODE</h4>
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

      {/* INVITE & OTHERS */}
      {activeNav === 'invite' && (
        <div style={{ textAlign: 'center' }}>
          <div style={styles.card}>
            <h2 style={{ color: '#fbbf24', marginBottom: '10px' }}>INVITE FRIENDS</h2>
            <p>Reward: <b style={{ color: '#fbbf24' }}>0.0005 TON</b></p>
            <p style={{ color: '#10b981', fontWeight: 'bold' }}>+ 10% COMMISSION</p>
            <div onClick={() => copyToClipboard(`https://t.me/YourBot?start=${userUID}`)} style={{ ...styles.input, color: '#fbbf24', fontSize: '12px', marginTop: '15px', cursor: 'pointer' }}>
                https://t.me/YourBot?start={userUID}
            </div>
            <button onClick={() => copyToClipboard(`https://t.me/YourBot?start=${userUID}`)} style={{...styles.yellowBtn, marginTop: '10px'}}>COPY LINK</button>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div>
          <div style={styles.card}>
            <h3>WITHDRAW</h3>
            <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" />
            <input style={styles.input} placeholder="Wallet Address" />
            <button style={styles.yellowBtn} onClick={() => alert("Insufficient Balance")}>WITHDRAW NOW</button>
          </div>
          <div style={styles.card}>
            <h4>HISTORY</h4>
            <table style={{ width: '100%', fontSize: '12px' }}>
              <thead><tr style={{ color: '#64748b', textAlign: 'left' }}><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody><tr><td colSpan="3" style={{ textAlign: 'center', padding: '10px' }}>No records found</td></tr></tbody>
            </table>
          </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={{ textAlign: 'center' }}>
          <div style={styles.card}>
            <div style={{ fontSize: '50px' }}>👤</div>
            <p>UID: {userUID}</p>
            <p>Status: <span style={{ color: '#fbbf24' }}>Active</span></p>
          </div>
          <div style={{ ...styles.card, border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
            <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>
              ⚠️ WARNING: NO SCREENSHOT REQUIRED. Fake accounts will be banned instantly.
            </p>
          </div>
        </div>
      )}

      {/* FOOTER NAV */}
      <div style={styles.footer}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ textAlign: 'center', color: activeNav === n ? '#fbbf24' : '#64748b', flex: 1, cursor: 'pointer' }}>
            <span style={{ fontSize: '20px' }}>{n === 'earn' ? '💰' : n === 'invite' ? '👥' : n === 'withdraw' ? '💸' : '👤'}</span><br />
            <small style={{ fontSize: '10px' }}>{n.toUpperCase()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
