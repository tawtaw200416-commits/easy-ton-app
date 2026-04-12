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
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '8px', border: '1px solid #334155' },
    taskRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    copyBox: { background: 'rgba(251,191,36,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid #fbbf24', textAlign: 'center', cursor: 'pointer', marginBottom: '10px' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', zIndex: 1000 }
  };

  return (
    <div style={styles.main}>
      {/* --- BALANCE --- */}
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

          {/* SOCIAL LIST - ပုံထဲကအတိုင်း ကပ်လျက်ဖြစ်အောင် Card တစ်ခုတည်းထဲထည့်ထားပါတယ် */}
          {activeTab === 'social' && socialView === 'list' && (
            <div style={styles.card}>
              {socialTasks.filter(t => !completed.includes(t.id)).map(s => (
                <div key={s.id} style={styles.taskRow}>
                  <span style={{ fontSize: '13px' }}>{s.name}</span>
                  <button id={`btn-${s.id}`} onClick={() => handleAction(s.id, s.link)} style={{ ...styles.yellowBtn, width: '75px', padding: '6px', fontSize: '11px' }}>JOIN</button>
                </div>
              ))}
              <button 
                style={{ ...styles.yellowBtn, marginTop: '10px' }} 
                onClick={() => setSocialView('add')}
              >
                + ADD TASK
              </button>
            </div>
          )}

          {/* ADD TASK FORM */}
          {activeTab === 'social' && socialView === 'add' && (
            <div style={styles.card}>
              <h3 style={{ marginTop: 0, color: '#fbbf24' }}>Add New Task</h3>
              <input style={styles.input} placeholder="Task Name" />
              <input style={styles.input} placeholder="Link (https://...)" />
              <select style={styles.input}>
                <option>100 Views - 0.2 TON</option>
                <option>200 Views - 0.4 TON</option>
                <option>300 Views - 0.5 TON</option>
              </select>
              <div style={styles.copyBox} onClick={() => copyToClipboard(adminWallet)}>
                <small style={{color: '#94a3b8'}}>Address (Click to Copy)</small><br/>
                <span style={{fontWeight: 'bold', fontSize: '11px'}}>{adminWallet}</span>
              </div>
              <div style={styles.copyBox} onClick={() => copyToClipboard(userUID)}>
                <small style={{color: '#94a3b8'}}>MEMO / UID (Click to Copy)</small><br/>
                <span style={{fontWeight: 'bold', fontSize: '18px', color: '#fbbf24'}}>{userUID}</span>
              </div>
              <button style={styles.yellowBtn} onClick={() => {alert("Submitted!"); setSocialView('list')}}>CONFIRM PAYMENT</button>
              <button style={{ ...styles.yellowBtn, background: 'none', color: '#94a3b8', marginTop: '5px' }} onClick={() => setSocialView('list')}>Cancel</button>
            </div>
          )}
        </>
      )}

      {/* --- INVITE SECTION WITH HISTORY --- */}
      {activeNav === 'invite' && (
        <div>
          <div style={styles.card}>
            <h2 style={{ color: '#fbbf24', marginBottom: '5px', textAlign:'center' }}>INVITE FRIENDS</h2>
            <p style={{textAlign:'center'}}>Reward: <b>0.0005 TON</b> + <b>10% Com</b></p>
            <div onClick={() => copyToClipboard(`https://t.me/YourBot?start=${userUID}`)} style={{ ...styles.input, color: '#fbbf24', fontSize: '12px', marginTop: '10px', cursor: 'pointer', textAlign:'center' }}>
                https://t.me/YourBot?start={userUID}
            </div>
            <button onClick={() => copyToClipboard(`https://t.me/YourBot?start=${userUID}`)} style={{...styles.yellowBtn, marginTop: '10px'}}>COPY LINK</button>
          </div>

          <h4 style={{ marginLeft: '5px', marginBottom: '10px' }}>INVITE HISTORY</h4>
          <div style={styles.card}>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#64748b', borderBottom: '1px solid #334155' }}>
                  <th style={{ paddingBottom: '10px', textAlign: 'left' }}>User ID</th>
                  <th style={{ paddingBottom: '10px', textAlign: 'center' }}>Status</th>
                  <th style={{ paddingBottom: '10px', textAlign: 'right' }}>Bonus</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No active referrals found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
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
