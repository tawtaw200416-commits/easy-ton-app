import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [taskSubTab, setTaskSubTab] = useState('add');
  const [showPayForm, setShowPayForm] = useState(false);

  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
  }, [balance, completedTasks]);

  // --- Start Bot New List (0.0005 TON per task) ---
  const botTasks = [
    { id: 'b1', name: "GROW TEA BOT", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "GOLDEN MINER BOT", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "WORKERS ON TON BOT", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "EASY BONUS BOT", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "TON DRAGON BOT", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "POBUZZ BOT", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const socialTasks = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460",
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO",
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69",
    "@zrbtua", "@perviu1million"
  ].map((name, i) => ({ id: `s${i}`, name: name.toUpperCase(), link: `https://t.me/${name.replace('@','')}` }));

  const handleAction = (task) => {
    window.open(task.link, '_blank');
    if (!completedTasks.includes(task.id)) {
      setBalance(prev => prev + 0.0005);
      setCompletedTasks(prev => [...prev, task.id]);
    }
  };

  const copyText = (t) => { navigator.clipboard.writeText(t); alert("✅ Copied to clipboard!"); };

  const styles = {
    container: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '22px', border: '1px solid #334155', marginBottom: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: '900', fontSize: '13px', transition: '0.3s' }),
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', marginBottom: '12px', boxSizing: 'border-box', fontWeight: 'bold' },
    btn: { width: '100%', padding: '16px', borderRadius: '15px', backgroundColor: '#fbbf24', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '15px' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '1px solid #334155', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }
  };

  return (
    <div style={styles.container}>
      {/* Header Balance Card */}
      <div style={{...styles.card, textAlign: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #020617 100%)', border: '1px solid #fbbf24'}}>
        <p style={{color: '#94a3b8', fontSize: '11px', fontWeight: '900', letterSpacing: '1px'}}>TOTAL TON BALANCE</p>
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
                <div key={t.id} style={styles.card} onClick={() => handleAction(t)}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                    <b style={{fontSize: '15px', letterSpacing: '0.5px'}}>{t.name}</b>
                    <span style={{backgroundColor: 'rgba(251,191,36,0.1)', color:'#fbbf24', padding: '6px 12px', borderRadius: '10px', fontWeight: '900'}}>+0.0005</span>
                  </div>
                </div>
              ))}

              {activeTab === 'reward' && (
                <div style={styles.card}>
                  <p style={{fontWeight: '900', marginBottom: '10px'}}>ENTER REWARD CODE:</p>
                  <input type="password" style={styles.input} placeholder="••••" />
                  <button style={styles.btn}>CLAIM NOW</button>
                </div>
              )}

              {activeTab === 'social' && (
                <>
                  <button style={{...styles.btn, marginBottom: '15px'}} onClick={() => setShowPayForm(true)}>+ ADD NEW TASK</button>
                  {socialTasks.filter(t => !completedTasks.includes(t.id)).map(t => (
                    <div key={t.id} style={styles.card} onClick={() => handleAction(t)}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                        <b style={{fontSize: '14px'}}>{t.name}</b>
                        <span style={{color:'#38bdf8', fontWeight: '900'}}>JOIN +</span>
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
                  <input style={styles.input} placeholder="CHANNEL / BOT NAME" />
                  <input style={styles.input} placeholder="TELEGRAM LINK" />
                  <div style={{display: 'flex', gap: '8px', marginBottom: '20px'}}>
                    <div style={{flex:1, border:'2px solid #fbbf24', padding:'8px', borderRadius:'12px', textAlign:'center', fontWeight: '900', fontSize:'10px'}}>100 USERS<br/>0.2 TON</div>
                    <div style={{flex:1, border:'2px solid #fbbf24', padding:'8px', borderRadius:'12px', textAlign:'center', fontWeight: '900', fontSize:'10px'}}>200 USERS<br/>0.4 TON</div>
                    <div style={{flex:1, border:'2px solid #fbbf24', padding:'8px', borderRadius:'12px', textAlign:'center', fontWeight: '900', fontSize:'10px'}}>300 USERS<br/>0.5 TON</div>
                  </div>
                  <p style={{fontSize: '11px', color:'#94a3b8', fontWeight: '900', marginBottom: '5px'}}>SEND TON TO:</p>
                  <div style={{background: '#0f172a', padding: '12px', borderRadius: '12px', color:'#fbbf24', fontSize:'10px', wordBreak:'break-all', marginBottom:'15px', border: '1px dashed #fbbf24'}} onClick={() => copyText("UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9")}>UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9</div>
                  <p style={{fontSize: '11px', color:'#94a3b8', fontWeight: '900', marginBottom: '5px'}}>REQUIRED MEMO (YOUR UID):</p>
                  <div style={{background: '#0f172a', padding: '12px', borderRadius: '12px', color:'#fbbf24', fontSize:'22px', fontWeight:'950', marginBottom:'20px', textAlign: 'center'}}>{userUID}</div>
                  <button style={styles.btn} onClick={() => alert("✅ Order Sent to Admin!")}>CONFIRM & PAY</button>
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
          <h4 style={{marginTop:'30px', fontWeight: '900', borderTop: '1px solid #334155', paddingTop: '15px'}}>TRANSACTION HISTORY</h4>
          <p style={{fontSize:'12px', color:'#64748b', textAlign: 'center', marginTop: '20px'}}>NO HISTORY FOUND</p>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', fontWeight: '950', color: '#fbbf24'}}>USER PROFILE</h2>
          <div style={{margin: '20px 0', fontSize: '16px', fontWeight: 'bold'}}>
            <p>USER UID: <span style={{color: '#fbbf24'}}>{userUID}</span></p>
            <p>STATUS: <span style={{color: '#10b981'}}>VIP MEMBER</span></p>
          </div>
          <div style={{backgroundColor:'rgba(239,68,68,0.1)', padding:'18px', borderRadius:'18px', border:'1px solid #ef4444'}}>
            <p style={{color:'#ef4444', fontSize:'13px', margin:0, fontWeight: '900', lineHeight: '1.6'}}>
              ⚠️ WARNING POLICY:<br/>
              FAKE ACCOUNTS AND MULTIPLE IDS ARE STRICTLY PROHIBITED. DETECTED ACCOUNTS WILL BE PERMANENTLY BANNED WITHOUT REFUND.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div style={styles.footer}>
        <div style={{textAlign:'center', color: activeNav==='earn'?'#fbbf24':'#64748b', fontWeight: '900'}} onClick={()=>setActiveNav('earn')}>💰<br/><small style={{fontSize: '10px'}}>EARN</small></div>
        <div style={{textAlign:'center', color: activeNav==='invite'?'#fbbf24':'#64748b', fontWeight: '900'}} onClick={()=>setActiveNav('invite')}>👥<br/><small style={{fontSize: '10px'}}>INVITE</small></div>
        <div style={{textAlign:'center', color: activeNav==='withdraw'?'#fbbf24':'#64748b', fontWeight: '900'}} onClick={()=>setActiveNav('withdraw')}>💸<br/><small style={{fontSize: '10px'}}>WITHDRAW</small></div>
        <div style={{textAlign:'center', color: activeNav==='profile'?'#fbbf24':'#64748b', fontWeight: '900'}} onClick={()=>setActiveNav('profile')}>👤<br/><small style={{fontSize: '10px'}}>PROFILE</small></div>
      </div>
    </div>
  );
}

export default App;
