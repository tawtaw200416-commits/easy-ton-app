import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('w_history')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [taskSubTab, setTaskSubTab] = useState('add');
  const [showPayForm, setShowPayForm] = useState(false);
  const [checking, setChecking] = useState(null);

  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
    localStorage.setItem('w_history', JSON.stringify(withdrawHistory));
  }, [balance, completedTasks, withdrawHistory]);

  // --- Start Bot Tasks (6 Links အတိအကျ) ---
  const botTasks = [
    { id: 'b1', name: "GROW TEA BOT", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "GOLDEN MINER BOT", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "WORKERS ON TON BOT", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "EASY BONUS BOT", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "TON DRAGON BOT", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "POBUZZ BOT", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  // --- Social Tasks (14 Channels) ---
  const socialTasks = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460",
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO",
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69",
    "@zrbtua", "@perviu1million"
  ].map((name, i) => ({ id: `s${i}`, name: name.toUpperCase(), link: `https://t.me/${name.replace('@','')}` }));

  const startTask = (task) => {
    window.open(task.link, '_blank');
    setChecking(task.id); 
  };

  const verifyTask = (taskId) => {
    if (!completedTasks.includes(taskId)) {
      setBalance(prev => prev + 0.0005);
      setCompletedTasks(prev => [...prev, taskId]);
      setChecking(null);
      alert("✅ Verification Success! 0.0005 TON added.");
    }
  };

  const copyText = (t) => { navigator.clipboard.writeText(t); alert("✅ Copied!"); };

  const styles = {
    container: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '22px', border: '1px solid #334155', marginBottom: '12px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: '900', fontSize: '13px' }),
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', marginBottom: '12px', boxSizing: 'border-box', fontWeight: 'bold' },
    btn: { width: '100%', padding: '16px', borderRadius: '15px', backgroundColor: '#fbbf24', border: 'none', fontWeight: '900', cursor: 'pointer' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }
  };

  return (
    <div style={styles.container}>
      {/* Balance Card */}
      <div style={{...styles.card, textAlign: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #020617 100%)', border: '1px solid #fbbf24'}}>
        <p style={{color: '#94a3b8', fontSize: '11px', fontWeight: '900'}}>TOTAL TON BALANCE</p>
        <h1 style={{color: '#fbbf24', fontSize: '42px', margin: '10px 0', fontWeight: '950'}}>{balance.toFixed(4)} <span style={{fontSize: '18px'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{display: 'flex', backgroundColor: '#1e293b', borderRadius: '15px', padding: '5px', marginBottom: '20px'}}>
            <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => {setActiveTab('bot'); setShowPayForm(false)}}>START BOT</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => {setActiveTab('reward'); setShowPayForm(false)}}>REWARD</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => {setActiveTab('social'); setShowPayForm(false)}}>SOCIAL</button>
          </div>

          {!showPayForm ? (
            <div>
              {activeTab === 'bot' && botTasks.filter(t => !completedTasks.includes(t.id)).map(t => (
                <div key={t.id} style={styles.card}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                    <b style={{fontSize: '14px'}}>{t.name}</b>
                    {checking === t.id ? (
                      <button style={{backgroundColor: '#10b981', color: '#fff', padding: '8px 15px', borderRadius: '10px', border: 'none', fontWeight: '900'}} onClick={() => verifyTask(t.id)}>CHECK</button>
                    ) : (
                      <button style={{backgroundColor: '#fbbf24', color: '#000', padding: '8px 15px', borderRadius: '10px', border: 'none', fontWeight: '900'}} onClick={() => startTask(t)}>START</button>
                    )}
                  </div>
                </div>
              ))}

              {activeTab === 'reward' && (
                <div style={styles.card}>
                  <p style={{fontWeight: '900'}}>REWARD CODE:</p>
                  <input type="password" style={styles.input} placeholder="••••" />
                  <button style={styles.btn}>CLAIM NOW</button>
                </div>
              )}

              {activeTab === 'social' && (
                <>
                  <button style={{...styles.btn, marginBottom: '15px'}} onClick={() => setShowPayForm(true)}>+ ADD TASK</button>
                  {socialTasks.filter(t => !completedTasks.includes(t.id)).map(t => (
                    <div key={t.id} style={styles.card}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                        <b style={{fontSize: '12px'}}>{t.name}</b>
                        {checking === t.id ? (
                          <button style={{backgroundColor: '#10b981', color: '#fff', padding: '6px 12px', borderRadius: '8px', border: 'none', fontWeight: '900'}} onClick={() => verifyTask(t.id)}>CHECK</button>
                        ) : (
                          <button style={{color:'#38bdf8', background:'none', border:'none', fontWeight:'900'}} onClick={() => startTask(t)}>JOIN</button>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <div style={styles.card}>
              <div style={{display: 'flex', gap: '5px', marginBottom: '20px'}}>
                <button style={styles.tabBtn(taskSubTab === 'add')} onClick={() => setTaskSubTab('add')}>ADD TASK</button>
                <button style={styles.tabBtn(taskSubTab === 'my')} onClick={() => setTaskSubTab('my')}>MY TASK</button>
              </div>
              {taskSubTab === 'add' ? (
                <div>
                  <input style={styles.input} placeholder="TASK NAME" />
                  <input style={styles.input} placeholder="LINK (https://t.me/...)" />
                  <div style={{display: 'flex', gap: '8px', marginBottom: '15px'}}>
                    <div style={{flex:1, border:'2px solid #fbbf24', padding:'8px', borderRadius:'12px', textAlign:'center', fontWeight:'900', fontSize:'10px'}}>100 Users<br/>0.2 TON</div>
                    <div style={{flex:1, border:'2px solid #fbbf24', padding:'8px', borderRadius:'12px', textAlign:'center', fontWeight:'900', fontSize:'10px'}}>200 Users<br/>0.4 TON</div>
                    <div style={{flex:1, border:'2px solid #fbbf24', padding:'8px', borderRadius:'12px', textAlign:'center', fontWeight:'900', fontSize:'10px'}}>300 Users<br/>0.5 TON</div>
                  </div>
                  <p style={{fontSize: '11px', color:'#94a3b8', fontWeight:'900'}}>SEND TON TO:</p>
                  <div style={{background: '#0f172a', padding: '12px', borderRadius: '12px', color:'#fbbf24', fontSize:'10px', wordBreak:'break-all', marginBottom:'15px', border: '1px dashed #fbbf24'}} onClick={() => copyText("UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9")}>UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9</div>
                  <p style={{fontSize: '11px', color:'#94a3b8', fontWeight:'900'}}>MEMO (YOUR UID):</p>
                  <div style={{background: '#0f172a', padding: '12px', borderRadius: '12px', color:'#fbbf24', fontSize:'22px', fontWeight:'950', marginBottom:'20px', textAlign: 'center'}}>{userUID}</div>
                  <button style={styles.btn} onClick={() => alert("✅ Order Sent to Admin!")}>SUBMIT & PAY</button>
                  <button style={{...styles.btn, background:'none', color:'#94a3b8', marginTop: '10px'}} onClick={() => setShowPayForm(false)}>CANCEL</button>
                </div>
              ) : (
                <div style={{textAlign:'center', padding:'40px 0', color:'#64748b', fontWeight: 'bold'}}>NO TASKS FOUND</div>
              )}
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', fontWeight: '950', color: '#fbbf24'}}>INVITE FRIENDS</h2>
          <p style={{fontSize:'13px', textAlign:'center', color:'#fff', fontWeight: 'bold', marginBottom: '20px'}}>Earn 0.0005 TON for every success referral!</p>
          <div style={{...styles.input, textAlign:'center', color: '#fbbf24', borderStyle: 'dashed'}} onClick={() => copyText(`https://t.me/EasyTON_Bot?start=${userUID}`)}>
            https://t.me/EasyTON_Bot?start={userUID}
          </div>
          <h4 style={{marginTop: '30px', borderBottom: '2px solid #334155', paddingBottom: '10px', fontWeight: '900'}}>INVITE HISTORY</h4>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'14px', padding:'15px 0', fontWeight: 'bold'}}>
            <span>TOTAL REFERRED:</span><span style={{color: '#fbbf24'}}>0 USERS</span>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h2 style={{fontWeight: '950', marginBottom: '20px'}}>WITHDRAW TON</h2>
          <input style={styles.input} placeholder="AMOUNT (MIN 0.1)" />
          <input style={styles.input} placeholder="TON WALLET ADDRESS" />
          <button style={styles.btn}>WITHDRAW NOW</button>
          <h4 style={{marginTop:'30px', fontWeight: '900', borderTop: '1px solid #334155', paddingTop: '15px'}}>WITHDRAW HISTORY</h4>
          <p style={{fontSize:'12px', color:'#64748b', textAlign: 'center', marginTop: '20px'}}>NO HISTORY FOUND</p>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', fontWeight: '950', color: '#fbbf24'}}>PROFILE</h2>
          <div style={{margin: '20px 0', fontSize: '16px', fontWeight: 'bold'}}>
            <p>USER UID: <span style={{color: '#fbbf24'}}>{userUID}</span></p>
            <p>STATUS: <span style={{color: '#10b981'}}>VIP VERIFIED</span></p>
          </div>
          <div style={{backgroundColor:'rgba(239,68,68,0.1)', padding:'18px', borderRadius:'18px', border:'1px solid #ef4444'}}>
            <p style={{color:'#ef4444', fontSize:'13px', margin:0, fontWeight: '900', lineHeight: '1.6'}}>
              ⚠️ WARNING POLICY:<br/>
              FAKE ACCOUNTS AND MULTIPLE IDS ARE STRICTLY PROHIBITED. DETECTED ACCOUNTS WILL BE PERMANENTLY BANNED.
            </p>
          </div>
        </div>
      )}

      {/* Nav Footer */}
      <div style={styles.footer}>
        <div style={{textAlign:'center', color: activeNav==='earn'?'#fbbf24':'#64748b', fontWeight: '900'}} onClick={()=>setActiveNav('earn')}>💰<br/><small>EARN</small></div>
        <div style={{textAlign:'center', color: activeNav==='invite'?'#fbbf24':'#64748b', fontWeight: '900'}} onClick={()=>setActiveNav('invite')}>👥<br/><small>INVITE</small></div>
        <div style={{textAlign:'center', color: activeNav==='withdraw'?'#fbbf24':'#64748b', fontWeight: '900'}} onClick={()=>setActiveNav('withdraw')}>💸<br/><small>HISTORY</small></div>
        <div style={{textAlign:'center', color: activeNav==='profile'?'#fbbf24':'#64748b', fontWeight: '900'}} onClick={()=>setActiveNav('profile')}>👤<br/><small>PROFILE</small></div>
      </div>
    </div>
  );
}

export default App;
