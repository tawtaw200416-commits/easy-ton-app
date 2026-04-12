import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [taskSubTab, setTaskSubTab] = useState('add');
  const [showPayForm, setShowPayForm] = useState(false);
  const [checking, setChecking] = useState(null);

  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
  }, [balance, completedTasks]);

  // --- ADSGRAM INTEGRATION (Block ID: 27393) ---
  const showAdAndVerify = (taskId) => {
    if (!window.Adsgram) {
      alert("Adsgram SDK is loading... Please wait.");
      return;
    }

    // Block ID 27393 ကို အသုံးပြုထားပါသည်
    const AdController = window.Adsgram.init({ blockId: "27393" });

    AdController.show().then((result) => {
      // ကြော်ငြာကြည့်ပြီးမှ ပိုက်ဆံပေါင်းပေးမည်
      if (!completedTasks.includes(taskId)) {
        setBalance(prev => prev + 0.0005);
        setCompletedTasks(prev => [...prev, taskId]);
        setChecking(null);
        alert("✅ Ads Finished! 0.0005 TON added to balance.");
      }
    }).catch((result) => {
      // ကြော်ငြာကို အဆုံးထိမကြည့်လျှင် သို့မဟုတ် error ဖြစ်လျှင်
      alert("⚠️ You must watch the full ad to verify the task.");
    });
  };

  // --- START BOT LIST (၆ ခု အတိအကျ) ---
  const botTasks = [
    { id: 'bot_1', name: "GROW TEA BOT", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'bot_2', name: "GOLDEN MINER BOT", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'bot_3', name: "WORKERS ON TON BOT", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'bot_4', name: "EASY BONUS BOT", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'bot_5', name: "TON DRAGON BOT", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'bot_6', name: "POBUZZ BOT", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const socialTasks = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460",
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO",
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69",
    "@zrbtua", "@perviu1million"
  ].map((name, i) => ({ id: `soc_${i}`, name: name.toUpperCase(), link: `https://t.me/${name.replace('@','')}` }));

  const startTask = (task) => {
    window.open(task.link, '_blank');
    setChecking(task.id); 
  };

  const copyText = (t) => { navigator.clipboard.writeText(t); alert("✅ Copied!"); };

  const styles = {
    container: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '22px', border: '1px solid #334155', marginBottom: '12px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: '900', fontSize: '12px' }),
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', marginBottom: '12px', boxSizing: 'border-box' },
    btn: { width: '100%', padding: '16px', borderRadius: '15px', backgroundColor: '#fbbf24', border: 'none', fontWeight: '900', cursor: 'pointer' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }
  };

  return (
    <div style={styles.container}>
      {/* Balance Section */}
      <div style={{...styles.card, textAlign: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #020617 100%)', border: '1px solid #fbbf24'}}>
        <p style={{color: '#94a3b8', fontSize: '11px', fontWeight: '900'}}>TOTAL BALANCE</p>
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
              {/* START BOT LIST */}
              {activeTab === 'bot' && botTasks.filter(t => !completedTasks.includes(t.id)).map(t => (
                <div key={t.id} style={styles.card}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                    <b style={{fontSize: '14px', color: '#fff'}}>{t.name}</b>
                    {checking === t.id ? (
                      <button style={{backgroundColor: '#10b981', color: '#fff', padding: '8px 15px', borderRadius: '10px', border: 'none', fontWeight: '900'}} onClick={() => showAdAndVerify(t.id)}>CHECK</button>
                    ) : (
                      <button style={{backgroundColor: '#fbbf24', color: '#000', padding: '8px 15px', borderRadius: '10px', border: 'none', fontWeight: '900'}} onClick={() => startTask(t)}>START</button>
                    )}
                  </div>
                </div>
              ))}

              {/* SOCIAL LIST */}
              {activeTab === 'social' && socialTasks.filter(t => !completedTasks.includes(t.id)).map(t => (
                <div key={t.id} style={styles.card}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                    <b style={{fontSize: '12px', color: '#fff'}}>{t.name}</b>
                    {checking === t.id ? (
                      <button style={{backgroundColor: '#10b981', color: '#fff', padding: '8px 15px', borderRadius: '10px', border: 'none', fontWeight: '900'}} onClick={() => showAdAndVerify(t.id)}>CHECK</button>
                    ) : (
                      <button style={{color:'#38bdf8', background:'none', border:'none', fontWeight:'900'}} onClick={() => startTask(t)}>JOIN</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.card}>
              <div style={{display: 'flex', gap: '5px', marginBottom: '20px'}}>
                <button style={styles.tabBtn(taskSubTab === 'add')} onClick={() => setTaskSubTab('add')}>ADD TASK</button>
                <button style={styles.tabBtn(taskSubTab === 'my')} onClick={() => setTaskSubTab('my')}>MY TASK</button>
              </div>
              <input style={styles.input} placeholder="TASK NAME" />
              <input style={styles.input} placeholder="LINK" />
              <button style={styles.btn} onClick={() => alert("✅ Order Sent!")}>CONFIRM & PAY</button>
              <button style={{...styles.btn, background:'none', color:'#94a3b8', marginTop: '10px'}} onClick={() => setShowPayForm(false)}>BACK</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h2 style={{fontWeight: '950', marginBottom: '20px', color: '#fbbf24'}}>WITHDRAW</h2>
          <input style={styles.input} placeholder="AMOUNT (MIN 0.1)" />
          <input style={styles.input} placeholder="TON WALLET ADDRESS" />
          <button style={styles.btn}>WITHDRAW NOW</button>
          
          <h4 style={{marginTop:'40px', fontWeight: '900', borderTop: '1px solid #334155', paddingTop: '15px'}}>WITHDRAW HISTORY</h4>
          <div style={{width: '100%', overflowX: 'auto', marginTop: '10px'}}>
            <table style={{width: '100%', fontSize: '12px', textAlign: 'left', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{color: '#94a3b8', borderBottom: '1px solid #334155'}}>
                  <th style={{padding: '10px 5px'}}>Amount</th>
                  <th style={{padding: '10px 5px'}}>Status</th>
                  <th style={{padding: '10px 5px'}}>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="3" style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>No Withdraw Data Found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FOOTER NAVIGATION */}
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
​
