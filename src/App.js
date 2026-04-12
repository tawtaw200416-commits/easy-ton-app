import React, { useState, useEffect } from 'react';

function App() {
  // --- States ---
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [isClaimed, setIsClaimed] = useState(() => localStorage.getItem('gift_claimed') === 'true');
  const [invites, setInvites] = useState(() => Number(localStorage.getItem('invite_count')) || 0);
  
  const [activeNav, setActiveNav] = useState('earn'); // earn, invite, withdraw, profile
  const [activeTab, setActiveTab] = useState('bot'); // bot, reward, social
  const [showAddTask, setShowAddTask] = useState(false);
  const [formStep, setFormStep] = useState('menu'); // menu, add, my

  // --- Sync Storage ---
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
    localStorage.setItem('invite_count', invites.toString());
  }, [balance, completed, isClaimed, invites]);

  // --- Data ---
  const botTasks = [
    { id: 'b1', name: "GROW TEA BOT", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "GOLDEN MINER BOT", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "WORKERS ON TON BOT", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "EASY BONUS BOT", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "TON DRAGON BOT", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "POBUZZ BOT", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const socialChannels = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460",
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO",
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69",
    "@zrbtua", "@perviu1million"
  ].map((ch, i) => ({ id: `s${i}`, name: ch, link: `https://t.me/${ch.replace('@','')}` }));

  // --- Handlers ---
  const copyText = (txt) => {
    navigator.clipboard.writeText(txt);
    alert("Copied to clipboard!");
  };

  const startTask = (id, link) => {
    window.open(link, '_blank');
    const btn = document.getElementById(`btn-${id}`);
    if (btn) {
      btn.innerText = "VERIFY AD";
      btn.style.backgroundColor = "#10b981";
      btn.onclick = () => {
        if (window.Adsgram) {
          window.Adsgram.init({ blockId: "27393" }).show().then(() => {
            if (!completed.includes(id)) {
              setBalance(prev => prev + 0.0005);
              setCompleted(prev => [...prev, id]);
              alert("Reward Added!");
            }
          });
        }
      };
    }
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', zIndex: 100 }
  };

  return (
    <div style={styles.main}>
      {/* Header Balance */}
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {/* --- EARN PANEL --- */}
      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'reward', 'social'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowAddTask(false)}} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'bot' && botTasks.map(b => (
            <div key={b.id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{b.name}</span>
                <button onClick={() => copyText(b.link)} style={{ background: '#334155', color: '#fbbf24', border: 'none', padding: '4px 8px', borderRadius: '5px', fontSize: '10px' }}>COPY LINK</button>
              </div>
              <button id={`btn-${b.id}`} onClick={() => startTask(b.id, b.link)} style={styles.yellowBtn}>
                {completed.includes(b.id) ? 'COMPLETED' : 'START BOT'}
              </button>
            </div>
          ))}

          {activeTab === 'reward' && (
            <div style={styles.card}>
              <h4>ENTER REWARD CODE</h4>
              {isClaimed ? <p style={{ color: '#fbbf24', textAlign: 'center' }}>✅ Code Claimed</p> : (
                <><input id="giftInput" style={styles.input} placeholder="Enter code..." />
                <button onClick={() => {if(document.getElementById('giftInput').value.toUpperCase()==="GIFT77"){setBalance(b=>b+0.01);setIsClaimed(true);alert("Claimed!")}}} style={styles.yellowBtn}>CLAIM</button></>
              )}
            </div>
          )}

          {activeTab === 'social' && (
            <div>
              {socialChannels.map(s => (
                <div key={s.id} style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px' }}>{s.name}</span>
                    <button id={`btn-${s.id}`} onClick={() => startTask(s.id, s.link)} style={{ ...styles.yellowBtn, width: '100px', fontSize: '10px' }}>JOIN</button>
                  </div>
                </div>
              ))}
              <button style={{ ...styles.yellowBtn, marginTop: '10px' }} onClick={() => setShowAddTask(true)}>+ ADD TASK</button>
              
              {showAddTask && (
                <div style={{ ...styles.card, marginTop: '15px', border: '1px solid #fbbf24' }}>
                  {formStep === 'menu' ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button style={styles.yellowBtn} onClick={() => setFormStep('add')}>ADD TASK</button>
                      <button style={{ ...styles.yellowBtn, background: '#334155', color: '#fff' }} onClick={() => setFormStep('my')}>MY TASK</button>
                    </div>
                  ) : formStep === 'add' ? (
                    <div>
                      <input style={styles.input} placeholder="Channel Name" />
                      <input style={styles.input} placeholder="Telegram Link" />
                      <select style={styles.input}>
                        <option>100 Views - 0.2 TON</option>
                        <option>200 Views - 0.4 TON</option>
                        <option>300 Views - 0.5 TON</option>
                      </select>
                      <div style={{ fontSize: '11px', background: '#0f172a', padding: '10px', borderRadius: '10px', marginBottom: '10px' }}>
                        Address: <small style={{color:'#fbbf24'}}>UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9</small><br/>
                        MEMO: <b style={{color:'#fbbf24'}}>{userUID}</b>
                      </div>
                      <button style={styles.yellowBtn} onClick={() => {alert("Admin notified!"); setShowAddTask(false); setFormStep('menu')}}>SUBMIT PAYMENT</button>
                    </div>
                  ) : <button onClick={() => setFormStep('menu')} style={styles.yellowBtn}>BACK</button>}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* --- INVITE PANEL --- */}
      {activeNav === 'invite' && (
        <div style={{ textAlign: 'center' }}>
          <div style={styles.card}>
            <h2>INVITE</h2>
            <p>0.0005 TON + 10% Commission</p>
            <div style={{ ...styles.input, fontSize: '11px', color: '#fbbf24' }}>https://t.me/YourBot?start={userUID}</div>
            <button onClick={() => copyText(`https://t.me/YourBot?start=${userUID}`)} style={styles.yellowBtn}>COPY REFER LINK</button>
          </div>
          <h3>INVITE HISTORY</h3>
          <div style={styles.card}>Total Friends Invited: {invites}</div>
        </div>
      )}

      {/* --- WITHDRAW PANEL --- */}
      {activeNav === 'withdraw' && (
        <div>
          <div style={styles.card}>
            <h4>WITHDRAW</h4>
            <input style={styles.input} type="number" placeholder="Amount (Min 0.1)" />
            <input style={styles.input} placeholder="TON Address" />
            <button style={styles.yellowBtn} onClick={() => alert("Insufficient balance!")}>WITHDRAW</button>
          </div>
          <h3>WITHDRAW HISTORY</h3>
          <div style={{ ...styles.card, textAlign: 'center', color: '#94a3b8' }}>No successful history.</div>
        </div>
      )}

      {/* --- PROFILE PANEL --- */}
      {activeNav === 'profile' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '50px' }}>👤</div>
          <h3>UID: {userUID}</h3>
          <div style={{ ...styles.card, border: '1px solid #ef4444' }}>
            <h4 style={{ color: '#ef4444', margin: '0 0 10px 0' }}>⚠️ WARNING</h4>
            <p style={{ fontSize: '12px' }}>Using scripts or fake accounts will lead to a <b>PERMANENT BAN</b>.</p>
          </div>
        </div>
      )}

      {/* --- FOOTER NAV --- */}
      <div style={styles.footer}>
        <div onClick={() => setActiveNav('earn')} style={{ textAlign: 'center', color: activeNav === 'earn' ? '#fbbf24' : '#64748b', flex: 1 }}>💰<br/><small>EARN</small></div>
        <div onClick={() => setActiveNav('invite')} style={{ textAlign: 'center', color: activeNav === 'invite' ? '#fbbf24' : '#64748b', flex: 1 }}>👥<br/><small>INVITE</small></div>
        <div onClick={() => setActiveNav('withdraw')} style={{ textAlign: 'center', color: activeNav === 'withdraw' ? '#fbbf24' : '#64748b', flex: 1 }}>💸<br/><small>WITHDRAW</small></div>
        <div onClick={() => setActiveNav('profile')} style={{ textAlign: 'center', color: activeNav === 'profile' ? '#fbbf24' : '#64748b', flex: 1 }}>👤<br/><small>PROFILE</small></div>
      </div>
    </div>
  );
}

export default App;
