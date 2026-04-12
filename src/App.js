import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [taskSubTab, setTaskSubTab] = useState('add'); // 'add' or 'my'
  const [showPayForm, setShowPayForm] = useState(false);

  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
  }, [balance, completedTasks]);

  const botTasks = [
    { id: 'b1', name: "GrowTea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "GoldenMiner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "WorkersOnTon Bot", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const socialTasks = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460",
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO",
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69",
    "@zrbtua", "@perviu1million"
  ].map((name, i) => ({ id: `s${i}`, name, link: `https://t.me/${name.replace('@','')}` }));

  const handleAction = (task) => {
    window.open(task.link, '_blank');
    if (!completedTasks.includes(task.id)) {
      setBalance(prev => prev + 0.0005);
      setCompletedTasks(prev => [...prev, task.id]);
    }
  };

  const copyText = (t) => { navigator.clipboard.writeText(t); alert("Copied!"); };

  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '10px' },
    tabBtn: (active) => ({ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: 'bold' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    btn: { width: '100%', padding: '15px', borderRadius: '12px', backgroundColor: '#fbbf24', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }
  };

  return (
    <div style={styles.container}>
      {/* Balance Section */}
      <div style={{...styles.card, textAlign: 'center', background: 'linear-gradient(to bottom, #1e293b, #0f172a)'}}>
        <p style={{color: '#94a3b8', fontSize: '12px'}}>TOTAL BALANCE</p>
        <h1 style={{color: '#fbbf24', fontSize: '35px', margin: '5px 0'}}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{display: 'flex', gap: '5px', marginBottom: '15px'}}>
            <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => {setActiveTab('bot'); setShowPayForm(false)}}>Start Bot</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => {setActiveTab('reward'); setShowPayForm(false)}}>Reward</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => {setActiveTab('social'); setShowPayForm(false)}}>Social</button>
          </div>

          {!showPayForm ? (
            <div>
              {activeTab === 'bot' && botTasks.filter(t => !completedTasks.includes(t.id)).map(t => (
                <div key={t.id} style={styles.card} onClick={() => handleAction(t)}>
                  <div style={{display:'flex', justifyContent:'space-between'}}><b>{t.name}</b><span style={{color:'#fbbf24'}}>+0.0005</span></div>
                </div>
              ))}

              {activeTab === 'reward' && (
                <div style={styles.card}>
                  <p>Enter Reward Code:</p>
                  <input type="password" style={styles.input} placeholder="****" />
                  <button style={styles.btn}>Claim Reward</button>
                </div>
              )}

              {activeTab === 'social' && (
                <>
                  <button style={{...styles.btn, marginBottom: '15px'}} onClick={() => setShowPayForm(true)}>+ ADD TASK</button>
                  {socialTasks.filter(t => !completedTasks.includes(t.id)).map(t => (
                    <div key={t.id} style={styles.card} onClick={() => handleAction(t)}>
                      <div style={{display:'flex', justifyContent:'space-between'}}><b>{t.name}</b><span style={{color:'#38bdf8'}}>Join</span></div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <div style={styles.card}>
              <div style={{display: 'flex', gap: '5px', marginBottom: '15px'}}>
                <button style={styles.tabBtn(taskSubTab === 'add')} onClick={() => setTaskSubTab('add')}>Add Task</button>
                <button style={styles.tabBtn(taskSubTab === 'my')} onClick={() => setTaskSubTab('my')}>My Task</button>
              </div>

              {taskSubTab === 'add' ? (
                <div>
                  <input style={styles.input} placeholder="Channel/Bot Name" />
                  <input style={styles.input} placeholder="Link (https://t.me/...)" />
                  <div style={{display: 'flex', gap: '5px', marginBottom: '15px'}}>
                    <div style={{flex:1, border:'1px solid #fbbf24', padding:'5px', borderRadius:'5px', textAlign:'center', fontSize:'10px'}}>100 Users<br/>0.2 TON</div>
                    <div style={{flex:1, border:'1px solid #fbbf24', padding:'5px', borderRadius:'5px', textAlign:'center', fontSize:'10px'}}>200 Users<br/>0.4 TON</div>
                    <div style={{flex:1, border:'1px solid #fbbf24', padding:'5px', borderRadius:'5px', textAlign:'center', fontSize:'10px'}}>300 Users<br/>0.5 TON</div>
                  </div>
                  <div style={{fontSize: '11px', color:'#94a3b8'}}>Send Payment to:</div>
                  <div style={{color:'#fbbf24', fontSize:'10px', wordBreak:'break-all', marginBottom:'10px'}} onClick={() => copyText("UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9")}>UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9</div>
                  <div style={{fontSize: '11px', color:'#94a3b8'}}>MEMO (Your UID):</div>
                  <div style={{color:'#fbbf24', fontSize:'18px', fontWeight:'bold', marginBottom:'15px'}}>{userUID}</div>
                  <button style={styles.btn} onClick={() => alert("Order Sent to Admin!")}>Submit & Pay</button>
                  <button style={{...styles.btn, background:'none', color:'#94a3b8'}} onClick={() => setShowPayForm(false)}>Back</button>
                </div>
              ) : (
                <div style={{textAlign:'center', padding:'20px', color:'#64748b'}}>No tasks found.</div>
              )}
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{textAlign:'center'}}>Invite Program</h3>
          <p style={{fontSize:'12px', textAlign:'center', color:'#fbbf24'}}>Earn 0.0005 TON for each friend!</p>
          <div style={{...styles.input, textAlign:'center'}} onClick={() => copyText(`https://t.me/EasyTON_Bot?start=${userUID}`)}>
            https://t.me/EasyTON_Bot?start={userUID}
          </div>
          <h4 style={{borderBottom:'1px solid #334155', paddingBottom:'5px'}}>Invite History</h4>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', padding:'5px 0'}}>
            <span>Total Invited:</span><span>0 Users</span>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" />
          <input style={styles.input} placeholder="TON Wallet Address" />
          <button style={styles.btn}>Withdraw Now</button>
          <h4 style={{marginTop:'20px'}}>History</h4>
          <p style={{fontSize:'12px', color:'#64748b'}}>No history found.</p>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>User Profile</h3>
          <p>UID: <b>{userUID}</b></p>
          <p>Status: <span style={{color:'#fbbf24'}}>VIP Member</span></p>
          <div style={{backgroundColor:'rgba(239,68,68,0.1)', padding:'10px', borderRadius:'10px', border:'1px solid #ef4444'}}>
            <p style={{color:'#ef4444', fontSize:'12px', margin:0}}>
              <b>WARNING:</b> Fake accounts and multiple IDs are strictly prohibited. Detected accounts will be permanently banned.
            </p>
          </div>
        </div>
      )}

      <div style={styles.footer}>
        <div style={{textAlign:'center', color: activeNav==='earn'?'#fbbf24':'#64748b'}} onClick={()=>setActiveNav('earn')}>💰<br/><small>Earn</small></div>
        <div style={{textAlign:'center', color: activeNav==='invite'?'#fbbf24':'#64748b'}} onClick={()=>setActiveNav('invite')}>👥<br/><small>Invite</small></div>
        <div style={{textAlign:'center', color: activeNav==='withdraw'?'#fbbf24':'#64748b'}} onClick={()=>setActiveNav('withdraw')}>💸<br/><small>Withdraw</small></div>
        <div style={{textAlign:'center', color: activeNav==='profile'?'#fbbf24':'#64748b'}} onClick={()=>setActiveNav('profile')}>👤<br/><small>Profile</small></div>
      </div>
    </div>
  );
}

export default App;
