import React, { useState, useEffect } from 'react';

const APP_CONFIG = {
  ADS_BLOCK_ID: "27393",
  MY_UID: "1793453606", // User ရဲ့ UID (MEMO အတွက်)
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9"
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("0.2");

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
  }, [balance, completed]);

  // Social Task List
  const socialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 's3', name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
    { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
    { id: 's11', name: "@WORLDBESTCRYTO1", link: "https://t.me/WORLDBESTCRYTO1" },
  ];

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #334155' },
    input: { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', boxSizing: 'border-box' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', padding: '10px 0', borderTop: '2px solid #334155' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', fontSize: '12px', cursor: 'pointer' }),
    badge: { backgroundColor: '#fbbf24', color: 'black', padding: '2px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 'bold' }
  };

  return (
    <div style={styles.main}>
      {/* Total Balance Header */}
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['bot', 'social', 'reward'].map(t => (
          <button key={t} onClick={() => {setActiveTab(t); setShowAddTask(false);}} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold' }}>{t.toUpperCase()}</button>
        ))}
      </div>

      {activeNav === 'earn' && (
        <>
          {activeTab === 'reward' && (
            <div style={styles.card}>
              <h4 style={{marginTop: 0}}>DAILY GIFT CODE</h4>
              <input style={styles.input} placeholder="Enter GIFT77" />
              <button style={styles.yellowBtn} onClick={() => alert("Invalid or Expired Code")}>CLAIM</button>
            </div>
          )}

          {activeTab === 'social' && (
            <>
              {!showAddTask ? (
                <div style={styles.card}>
                  <button onClick={() => setShowAddTask(true)} style={{...styles.yellowBtn, marginBottom: '15px'}}>+ ADD TASK (PROMOTE CHANNEL)</button>
                  {socialTasks.map(s => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' }}>
                      <span style={{fontSize:'14px'}}>{s.name}</span>
                      <button style={{backgroundColor: completed.includes(s.id) ? '#10b981' : '#fbbf24', border:'none', padding:'8px 15px', borderRadius:'8px', fontWeight:'bold', width:'80px'}}>{completed.includes(s.id) ? "DONE" : "JOIN"}</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.card}>
                  <h3 style={{marginTop:0}}>Add New Task</h3>
                  <input style={styles.input} placeholder="Channel Name (@YourChannel)" />
                  <input style={styles.input} placeholder="Invite Link (https://t.me/...)" />
                  
                  <label style={{fontSize:'12px', color:'#94a3b8'}}>Select View Package:</label>
                  <select 
                    value={selectedPackage} 
                    onChange={(e) => setSelectedPackage(e.target.value)} 
                    style={{...styles.input, marginTop:'5px'}}
                  >
                    <option value="0.2">100 Views - 0.2 TON</option>
                    <option value="0.4">200 Views - 0.4 TON</option>
                    <option value="0.5">300 Views - 0.5 TON</option>
                  </select>

                  <div style={{backgroundColor:'#0f172a', padding:'10px', borderRadius:'10px', marginBottom:'15px', border:'1px dotted #fbbf24'}}>
                    <p style={{margin:0, fontSize:'11px', color:'#94a3b8'}}>Send Payment to Address:</p>
                    <p style={{margin:'5px 0', fontSize:'11px', wordBreak:'break-all', color:'#fbbf24'}}>{APP_CONFIG.ADMIN_WALLET}</p>
                    <p style={{margin:0, fontSize:'11px', color:'#fff'}}><strong>MEMO (Required):</strong> <span style={{color:'#fbbf24', fontSize:'14px'}}>{APP_CONFIG.MY_UID}</span></p>
                  </div>

                  <button style={styles.yellowBtn} onClick={() => alert("Payment info sent to Admin. Waiting for verification.")}>CONFIRM PAYMENT</button>
                  <button onClick={() => setShowAddTask(false)} style={{width:'100%', background:'none', border:'none', color:'#94a3b8', marginTop:'10px'}}>Back</button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <div style={{textAlign:'center', marginBottom:'20px'}}>
            <div style={{width:'60px', height:'60px', borderRadius:'50%', backgroundColor:'#fbbf24', margin:'0 auto 10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>👤</div>
            <h3>User Profile</h3>
            <p style={{color:'#94a3b8'}}>UID: {APP_CONFIG.MY_UID}</p>
          </div>
          
          {/* ✅ Fake Account Warning English လို ထည့်ထားပါတယ် */}
          <div style={{backgroundColor:'rgba(239, 68, 68, 0.1)', border:'1px solid #ef4444', padding:'15px', borderRadius:'10px', color:'#f87171', fontSize:'13px'}}>
            <strong>⚠️ WARNING:</strong><br/>
            Creating fake accounts or using multiple accounts from the same device is strictly prohibited. If caught, your account will be <strong>BANNED</strong> and your balance will be <strong>FORFEITED</strong> without notice.
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div style={styles.navBar}>
        <div onClick={() => setActiveNav('earn')} style={styles.navBtn(activeNav === 'earn')}>💰<br/>EARN</div>
        <div onClick={() => setActiveNav('invite')} style={styles.navBtn(activeNav === 'invite')}>👥<br/>INVITE</div>
        <div onClick={() => setActiveNav('withdraw')} style={styles.navBtn(activeNav === 'withdraw')}>💸<br/>WITHDRAW</div>
        <div onClick={() => setActiveNav('profile')} style={styles.navBtn(activeNav === 'profile')}>👤<br/>PROFILE</div>
      </div>
    </div>
  );
}

export default App;
