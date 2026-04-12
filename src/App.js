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
    socialCard: { backgroundColor: '#1e293b', padding: '15px', border: '1px solid #334155', marginBottom: '0px' }, // Margin ဖယ်လိုက်တယ်
    yellowBtn: { width: '100%', padding: '15px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }
  };

  return (
    <div style={styles.main}>
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

          {activeTab === 'social' && socialView === 'list' && (
            <div style={{ borderRadius: '15px', overflow: 'hidden', border: '1px solid #334155' }}>
              {socialTasks.filter(t => !completed.includes(t.id)).map((s, index, arr) => (
                <div key={s.id} style={{ 
                  ...styles.socialCard, 
                  borderBottom: index === arr.length - 1 ? 'none' : '1px solid #334155',
                  marginBottom: '0px' // ကပ်လျက်ဖြစ်အောင် margin ဖျောက်ထားပါတယ်
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{s.name}</span>
                    <button id={`btn-${s.id}`} onClick={() => handleAction(s.id, s.link)} style={{ backgroundColor: '#fbbf24', border: 'none', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold' }}>JOIN</button>
                  </div>
                </div>
              ))}
              {/* + ADD TASK ခလုတ်ကို list ရဲ့ အောက်ခြေမှာ တစ်ဆက်တည်း ကပ်လျက်ထည့်ထားပါတယ် */}
              <button 
                style={{ 
                  width: '100%', 
                  padding: '15px', 
                  backgroundColor: '#fbbf24', 
                  color: '#000', 
                  border: 'none', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  borderTop: '1px solid #334155'
                }} 
                onClick={() => setSocialView('add')}
              >
                + ADD TASK
              </button>
            </div>
          )}

          {activeTab === 'social' && socialView === 'add' && (
            <div style={styles.card}>
              <h3 style={{ color: '#fbbf24', marginTop: 0 }}>Add New Task</h3>
              <input style={styles.input} placeholder="Task Name" />
              <input style={styles.input} placeholder="Link" />
              <select style={styles.input}>
                <option>100 Views - 0.2 TON</option>
                <option>200 Views - 0.4 TON</option>
                <option>300 Views - 0.5 TON</option>
              </select>
              <div onClick={() => copyToClipboard(adminWallet)} style={{ background: '#0f172a', padding: '10px', borderRadius: '10px', border: '1px solid #fbbf24', marginBottom: '10px', textAlign: 'center' }}>
                <small style={{color:'#94a3b8'}}>Address (Tap to Copy)</small><br/>
                <span style={{fontSize:'12px'}}>{adminWallet}</span>
              </div>
              <div onClick={() => copyToClipboard(userUID)} style={{ background: '#0f172a', padding: '10px', borderRadius: '10px', border: '1px solid #fbbf24', marginBottom: '15px', textAlign: 'center' }}>
                <small style={{color:'#94a3b8'}}>MEMO / UID (Tap to Copy)</small><br/>
                <span style={{fontSize:'18px', fontWeight:'bold', color:'#fbbf24'}}>{userUID}</span>
              </div>
              <button style={styles.yellowBtn} onClick={() => {alert("Sent!"); setSocialView('list')}}>CONFIRM PAYMENT</button>
              <p style={{textAlign:'center', marginTop:'10px', cursor:'pointer'}} onClick={()=>setSocialView('list')}>Cancel</p>
            </div>
          )}
        </>
      )}

      {/* FOOTER */}
      <div style={styles.footer}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ textAlign: 'center', color: activeNav === n ? '#fbbf24' : '#64748b', flex: 1 }}>
            <span style={{ fontSize: '20px' }}>{n === 'earn' ? '💰' : n === 'invite' ? '👥' : n === 'withdraw' ? '💸' : '👤'}</span><br />
            <small style={{ fontSize: '10px' }}>{n.toUpperCase()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
