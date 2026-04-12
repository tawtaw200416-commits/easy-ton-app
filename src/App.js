import React, { useState, useEffect } from 'react';

function App() {
  // --- States ---
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [isClaimed, setIsClaimed] = useState(() => localStorage.getItem('gift_claimed') === 'true');
  const [invites] = useState(() => Number(localStorage.getItem('invite_count')) || 0);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('menu');

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
  }, [balance, completed, isClaimed]);

  // --- Logic ---
  const copyToClipboard = (txt) => {
    navigator.clipboard.writeText(txt);
    alert("Copied!");
  };

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    const btn = document.getElementById(`btn-${id}`);
    if (btn) {
      btn.innerText = "VERIFY AD";
      btn.style.backgroundColor = "#10b981";
      btn.onclick = () => {
        if (window.Adsgram) {
          window.Adsgram.init({ blockId: "27393" }).show().then(() => {
            if (!completed.includes(id)) {
              setBalance(p => p + 0.0005);
              setCompleted(p => [...p, id]);
              alert("0.0005 TON Reward Added!");
            }
          });
        }
      };
    }
  };

  const socialChannels = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460",
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO",
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69",
    "@zrbtua", "@perviu1million"
  ].map((ch, i) => ({ id: `s${i}`, name: ch, link: `https://t.me/${ch.replace('@','')}` }));

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', zIndex: 100 }
  };

  return (
    <div style={styles.main}>
      {/* --- BALANCE HEADER --- */}
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {/* --- EARN PANEL --- */}
      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'reward', 'social'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowForm(false)}} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {/* Bot Tab */}
          {activeTab === 'bot' && [
            { id: 'b1', name: "GROW TEA BOT", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
            { id: 'b2', name: "GOLDEN MINER BOT", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
            { id: 'b3', name: "WORKERS ON TON BOT", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
            { id: 'b4', name: "EASY BONUS BOT", link: "https://t.me/easybonuscode_bot?start=1793453606" },
            { id: 'b5', name: "TON DRAGON BOT", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
            { id: 'b6', name: "POBUZZ BOT", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
          ].map(b => (
            <div key={b.id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{b.name}</span>
                <button onClick={() => copyToClipboard(b.link)} style={{ background: '#334155', color: '#fbbf24', border: 'none', padding: '4px 8px', borderRadius: '5px', fontSize: '10px' }}>COPY LINK</button>
              </div>
              <button id={`btn-${b.id}`} onClick={() => handleTaskAction(b.id, b.link)} style={styles.yellowBtn}>
                {completed.includes(b.id) ? 'COMPLETED' : 'START BOT'}
              </button>
            </div>
          ))}

          {/* Reward Tab (Logic: If Claimed, Hide Everything) */}
          {activeTab === 'reward' && (
            <div style={styles.card}>
              <h4 style={{marginTop: 0}}>DAILY REWARD CODE</h4>
              {isClaimed ? (
                <div style={{ textAlign: 'center', padding: '15px' }}>
                  <p style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 'bold' }}>✅ REWARD CLAIMED</p>
                  <p style={{ color: '#94a3b8', fontSize: '11px' }}>You have already used your unique code.</p>
                </div>
              ) : (
                <>
                  <input id="giftInput" style={styles.input} placeholder="Enter unique code" />
                  <button onClick={() => {
                    const code = document.getElementById('giftInput').value.toUpperCase();
                    if(code === "GIFT77"){
                      setBalance(b => b + 0.01);
                      setIsClaimed(true);
                      alert("Success! 0.01 TON Claimed.");
                    } else {
                      alert("Invalid Code!");
                    }
                  }} style={styles.yellowBtn}>CLAIM REWARD</button>
                </>
              )}
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div>
              <button style={{ ...styles.yellowBtn, marginBottom: '15px' }} onClick={() => setShowForm(!showForm)}>+ ADD TASK</button>
              {showForm && (
                <div style={{ ...styles.card, border: '1px solid #fbbf24' }}>
                  {formType === 'menu' ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button style={styles.yellowBtn} onClick={() => setFormType('add')}>ADD TASK</button>
                      <button style={{ ...styles.yellowBtn, background: '#334155', color: '#fff' }} onClick={() => setFormType('my')}>MY TASK</button>
                    </div>
                  ) : (
                    <div>
                      <input style={styles.input} placeholder="Name" /><input style={styles.input} placeholder="Link" />
                      <select style={styles.input}><option>100 Views - 0.2 TON</option><option>200 Views - 0.4 TON</option><option>300 Views - 0.5 TON</option></select>
                      <div style={{ fontSize: '11px', background: '#0f172a', padding: '10px', borderRadius: '10px', marginBottom: '10px' }}>
                        Send to: <small style={{color:'#fbbf24'}}>UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9</small><br/>
                        MEMO: <b style={{color:'#fbbf24'}}>{userUID}</b>
                      </div>
                      <button style={styles.yellowBtn} onClick={() => {alert("Admin Notified!"); setShowForm(false); setFormType('menu')}}>SUBMIT PAYMENT</button>
                    </div>
                  )}
                </div>
              )}
              {socialChannels.map(s => (
                <div key={s.id} style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px' }}>{s.name}</span>
                    <button id={`btn-${s.id}`} onClick={() => handleTaskAction(s.id, s.link)} style={{ ...styles.yellowBtn, width: '90px', fontSize: '11px' }}>JOIN</button>
                  </div>
                </div>
              ))}
              <button style={{ ...styles.yellowBtn, marginTop: '10px' }} onClick={() => setShowForm(!showForm)}>+ ADD TASK</button>
            </div>
          )}
        </>
      )}

      {/* --- OTHER PANELS (Invite, Withdraw, Profile) --- */}
      {activeNav === 'invite' && (
        <div style={{ textAlign: 'center' }}>
          <div style={styles.card}>
            <h2>INVITE</h2><p>0.0005 TON per refer</p>
            <div style={{ ...styles.input, color: '#fbbf24', fontSize: '11px' }}>https://t.me/YourBot?start={userUID}</div>
            <button onClick={() => copyToClipboard(`https://t.me/YourBot?start=${userUID}`)} style={styles.yellowBtn}>COPY REFER LINK</button>
          </div>
          <h3>INVITE HISTORY</h3><div style={styles.card}>Total Friends Invited: {invites}</div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div>
          <div style={styles.card}>
            <h4>WITHDRAW</h4><input style={styles.input} type="number" placeholder="0.1" /><input style={styles.input} placeholder="Wallet Address" />
            <button style={styles.yellowBtn} onClick={() => alert("Insufficient balance!")}>WITHDRAW</button>
          </div>
          <h3>HISTORY</h3><div style={{ ...styles.card, color: '#94a3b8', textAlign: 'center' }}>No successful history.</div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '60px' }}>👤</div><h3>UID: {userUID}</h3>
          <div style={{ ...styles.card, border: '1px solid #ef4444' }}>
            <h4 style={{ color: '#ef4444', margin: '0 0 10px 0' }}>⚠️ BAN WARNING</h4>
            <p style={{ fontSize: '12px' }}>Scripts or fake accounts will result in a <b>PERMANENT BAN</b>.</p>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <div style={styles.footer}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ textAlign: 'center', color: activeNav === n ? '#fbbf24' : '#64748b', flex: 1, cursor: 'pointer' }}>
            {n === 'earn' ? '💰' : n === 'invite' ? '👥' : n === 'withdraw' ? '💸' : '👤'}<br/><small style={{fontSize: '10px'}}>{n.toUpperCase()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
