import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [isClaimed, setIsClaimed] = useState(() => localStorage.getItem('gift_claimed') === 'true');
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTask, setShowAddTask] = useState(false);
  const [formStep, setFormStep] = useState('menu');

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
  }, [balance, completed, isClaimed]);

  const botTasks = [
    { id: 'b1', name: "GROW TEA BOT", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "GOLDEN MINER BOT", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "WORKERS ON TON BOT", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "EASY BONUS BOT", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "TON DRAGON BOT", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "POBUZZ BOT", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const copyLink = (txt) => {
    navigator.clipboard.writeText(txt);
    alert("Copied!");
  };

  const handleClaim = () => {
    const code = document.getElementById('giftInput').value.trim();
    if (code.toUpperCase() === "GIFT77") { // Code ကို ဒီမှာ ပြောင်းနိုင်ပါတယ်
      setBalance(prev => prev + 0.01);
      setIsClaimed(true);
      alert("0.01 TON Claimed!");
    } else {
      alert("Invalid Code!");
    }
  };

  const startTask = (id, link) => {
    window.open(link, '_blank');
    const btn = document.getElementById(`btn-${id}`);
    btn.innerText = "VERIFY AD";
    btn.style.backgroundColor = "#10b981";
    btn.onclick = () => {
      if (window.Adsgram) {
        window.Adsgram.init({ blockId: "27393" }).show().then(() => {
          if (!completed.includes(id)) {
            setBalance(prev => prev + 0.0005);
            setCompleted(prev => [...prev, id]);
            alert("Added 0.0005 TON");
          }
        }).catch(() => alert("Please watch the full ad."));
      }
    };
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '80px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }
  };

  return (
    <div style={styles.main}>
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
        {['bot', 'reward', 'social'].map(t => (
          <button key={t} onClick={() => {setActiveTab(t); setShowAddTask(false)}} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px' }}>{t.toUpperCase()}</button>
        ))}
      </div>

      {activeTab === 'bot' && botTasks.map(b => (
        <div key={b.id} style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{b.name}</span>
            <button onClick={() => copyLink(b.link)} style={{ background: '#334155', color: '#fbbf24', border: 'none', padding: '4px 8px', borderRadius: '5px', fontSize: '10px' }}>COPY LINK</button>
          </div>
          <button id={`btn-${b.id}`} onClick={() => startTask(b.id, b.link)} style={styles.yellowBtn}>
            {completed.includes(b.id) ? 'COMPLETED' : 'START BOT'}
          </button>
        </div>
      ))}

      {activeTab === 'reward' && (
        <div style={styles.card}>
          <h4 style={{marginTop:0}}>DAILY REWARD CODE</h4>
          {isClaimed ? <p style={{ color: '#fbbf24', textAlign: 'center' }}>✅ Reward Already Claimed</p> : (
            <>
              <input id="giftInput" style={{ width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box', borderRadius: '10px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} placeholder="Enter code..." />
              <button onClick={handleClaim} style={styles.yellowBtn}>CLAIM NOW</button>
            </>
          )}
        </div>
      )}

      {activeTab === 'social' && (
        <div>
          <button style={{ ...styles.yellowBtn, marginBottom: '15px' }} onClick={() => setShowAddTask(true)}>+ ADD TASK</button>
          {showAddTask && (
            <div style={styles.card}>
              {formStep === 'menu' ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={styles.yellowBtn} onClick={() => setFormStep('add')}>ADD TASK</button>
                  <button style={{ ...styles.yellowBtn, background: '#334155', color: '#fff' }} onClick={() => setFormStep('my')}>MY TASK</button>
                </div>
              ) : (
                <div>
                  <h5 style={{margin: '0 0 10px 0'}}>CREATE TASK</h5>
                  <input style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }} placeholder="Channel/Link" />
                  <div style={{ fontSize: '11px', color: '#fbbf24', marginBottom: '10px' }}>MEMO: {userUID}</div>
                  <button style={styles.yellowBtn} onClick={() => {setShowAddTask(false); setFormStep('menu')}}>SUBMIT</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={styles.footer}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ textAlign: 'center', color: activeNav === n ? '#fbbf24' : '#64748b', cursor: 'pointer', flex: 1 }}>
            {n === 'earn' ? '💰' : n === 'invite' ? '👥' : n === 'withdraw' ? '💸' : '👤'}<br/><small style={{fontSize: '10px'}}>{n.toUpperCase()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
