import React, { useState, useEffect } from 'react';

function App() {
  // --- States ---
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [isClaimed, setIsClaimed] = useState(() => localStorage.getItem('gift_claimed') === 'true');
  const [invites, setInvites] = useState(() => Number(localStorage.getItem('invite_count')) || 0);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('menu');

  const walletAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
    localStorage.setItem('invite_count', invites.toString());
  }, [balance, completed, isClaimed, invites]);

  // --- Data Lists ---
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

  // --- Logic ---
  const copyToClipboard = (txt, msg = "Copied!") => {
    navigator.clipboard.writeText(txt);
    alert(msg);
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

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    copySmall: { background: '#334155', color: '#fbbf24', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '10px', cursor: 'pointer' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', zIndex: 100 }
  };

  return (
    <div style={styles.main}>
      {/* --- HEADER --- */}
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'reward', 'social'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowForm(false)}} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'bot' && botTasks.map(b => (
            <div key={b.id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{b.name}</span>
                <button onClick={() => copyToClipboard(b.link)} style={styles.copySmall}>COPY LINK</button>
              </div>
              <button id={`btn-${b.id}`} onClick={() => handleTaskAction(b.id, b.link)} style={styles.yellowBtn}>
                {completed.includes(b.id) ? 'COMPLETED' : 'START BOT'}
              </button>
            </div>
          ))}

          {activeTab === 'reward' && (
            <div style={styles.card}>
              <h4 style={{marginTop: 0}}>DAILY REWARD CODE</h4>
              {isClaimed ? <p style={{ color: '#fbbf24', textAlign: 'center' }}>✅ Code Already Claimed</p> : (
                <><input id="giftInput" style={styles.input} placeholder="Enter code (e.g. GIFT77)" />
                <button onClick={() => {if(document.getElementById('giftInput').value.toUpperCase()==="GIFT77"){setBalance(b=>b+0.01);setIsClaimed(true);alert("0.01 TON Claimed!")}}} style={styles.yellowBtn}>CLAIM REWARD</button></>
              )}
            </div>
          )}

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
                      <input style={styles.input} placeholder="Name" />
                      <input style={styles.input} placeholder="Link" />
                      <div style={{ fontSize: '11px', background: '#0f172a', padding: '12px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #334155' }}>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                          <span>Addr: {walletAddress.slice(0,8)}...</span>
                          <button onClick={() => copyToClipboard(walletAddress)} style={styles.copySmall}>COPY ADDR</button>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                          <span>MEMO: <b style={{color:'#fbbf24'}}>{userUID}</b></span>
                          <button onClick={() => copyToClipboard(userUID)} style={styles.copySmall}>COPY MEMO</button>
                        </div>
                      </div>
                      <button style={styles.yellowBtn} onClick={() => setFormType('menu')}>BACK</button>
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

      {activeNav === 'invite' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...styles.card, border: '1px solid #fbbf24' }}>
            <h2 style={{ color: '#fbbf24', marginBottom: '15px' }}>INVITE FRIENDS</h2>
            <div style={{ background: '#0f172a', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
              <p style={{ fontSize: '14px', margin: '0' }}>Get <b style={{color:'#fbbf24'}}>0.0005 TON</b> per friend</p>
              <div style={{ height: '1px', background: '#334155', margin: '12px 0' }}></div>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', margin: '0' }}>+ 10% COMMISSION</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '5px' }}>(from every task they complete)</p>
            </div>
            <div style={{ ...styles.input, color: '#fbbf24', fontSize: '11px' }}>https://t.me/Bot?start={userUID}</div>
            <button onClick={() => copyToClipboard(`https://t.me/Bot?start=${userUID}`)} style={styles.yellowBtn}>COPY REFER LINK</button>
          </div>
          <h3 style={{ textAlign: 'left', paddingLeft: '5px' }}>INVITE HISTORY</h3>
          <div style={styles.card}>
             <div style={{display:'flex', justifyContent:'space-between'}}><span>Total Invited:</span><b>{invites} Users</b></div>
          </div>
        </div>
      )}

      {/* Footer Nav as per user style */}
      <div style={styles.footer}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ textAlign: 'center', color: activeNav === n ? '#fbbf24' : '#64748b', flex: 1, cursor: 'pointer' }}>
            {n === 'earn' ? '💰' : n === 'invite' ? '👥' : n === 'withdraw' ? '💸' : '👤'}<br/><small style={{fontSize:'10px'}}>{n.toUpperCase()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
