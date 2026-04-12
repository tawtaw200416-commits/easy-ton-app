import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [isClaimed, setIsClaimed] = useState(() => localStorage.getItem('gift_claimed') === 'true');
  const [invites] = useState(0);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('menu');

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
  }, [balance, completed, isClaimed]);

  const socialChannels = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460",
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO",
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69",
    "@zrbtua", "@perviu1million"
  ].map((ch, i) => ({ id: `s${i}`, name: ch, link: `https://t.me/${ch.replace('@','')}` }));

  const copyToClipboard = (txt) => {
    navigator.clipboard.writeText(txt);
    alert("Copied!");
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
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'reward' && (
            <div style={styles.card}>
              <h4 style={{marginTop: 0}}>DAILY REWARD CODE</h4>
              {isClaimed ? (
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <p style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 'bold' }}>✅ CODE ALREADY CLAIMED</p>
                </div>
              ) : (
                <><input id="giftInput" style={styles.input} placeholder="Enter code..." />
                <button onClick={() => {if(document.getElementById('giftInput').value.toUpperCase()==="GIFT77"){setBalance(b=>b+0.01);setIsClaimed(true);alert("0.01 TON Claimed!")}}} style={styles.yellowBtn}>CLAIM</button></>
              )}
            </div>
          )}

          {activeTab === 'social' && (
            <div>
              <button style={{ ...styles.yellowBtn, marginBottom: '15px' }} onClick={() => setShowForm(!showForm)}>+ ADD TASK</button>
              {socialChannels.map(s => (
                <div key={s.id} style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px' }}>{s.name}</span>
                    <button style={{ ...styles.yellowBtn, width: '90px', fontSize: '11px' }}>JOIN</button>
                  </div>
                </div>
              ))}
              <button style={{ ...styles.yellowBtn, marginTop: '10px' }} onClick={() => setShowForm(!showForm)}>+ ADD TASK</button>
            </div>
          )}
        </>
      )}

      {/* --- INVITE PANEL (Updated UI) --- */}
      {activeNav === 'invite' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...styles.card, border: '1px solid #fbbf24' }}>
            <h2 style={{ margin: '0 0 10px 0', color: '#fbbf24' }}>INVITE FRIENDS</h2>
            
            <div style={{ padding: '10px', background: '#0f172a', borderRadius: '10px', marginBottom: '15px' }}>
               <p style={{ fontSize: '14px', margin: '5px 0' }}>
                 လူတစ်ယောက်ဖိတ်လျှင် <b style={{ color: '#fbbf24' }}>0.0005 TON</b> ရရှိမည်။
               </p>
               <div style={{ height: '1px', background: '#334155', margin: '10px 0' }}></div>
               <p style={{ fontSize: '14px', margin: '5px 0', color: '#10b981' }}>
                 ဖိတ်ထားသောသူ Task တစ်ခုလုပ်တိုင်း <b style={{ fontSize: '16px' }}>10%</b> ထပ်ဆောင်းရရှိမည်။
               </p>
            </div>

            <div style={{ ...styles.input, color: '#fbbf24', fontSize: '11px', overflow: 'hidden' }}>https://t.me/YourBot?start={userUID}</div>
            <button onClick={() => copyToClipboard(`https://t.me/YourBot?start=${userUID}`)} style={styles.yellowBtn}>COPY REFER LINK</button>
          </div>
          
          <h3 style={{ marginTop: '20px' }}>INVITE HISTORY</h3>
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Invited:</span>
              <b style={{ color: '#fbbf24' }}>{invites} Users</b>
            </div>
          </div>
        </div>
      )}

      {/* --- FOOTER NAV --- */}
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
