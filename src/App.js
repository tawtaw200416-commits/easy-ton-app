import React, { useState, useEffect } from 'react';

function App() {
  // Balance ကို 0.0000 ကနေ စပါမယ်
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('ton_balance');
    return saved ? parseFloat(saved) : 0.0;
  });

  const [activeTab, setActiveTab] = useState('bot');
  const [activeNav, setActiveNav] = useState('earn');
  const [showPayForm, setShowPayForm] = useState(false);
  const [rewardCode, setRewardCode] = useState("");
  
  const userUID = "UID17934536";
  const adminAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";
  const blockId = "27393"; 

  const [botTasks, setBotTasks] = useState(() => {
    const saved = localStorage.getItem('bot_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'GrowTea Bot', link: 'https://t.me/GrowTeaBot/app?startapp=1793453606' },
      { id: 2, name: 'Golden Miner', link: 'https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD' },
      { id: 3, name: 'Workers On Ton', link: 'https://t.me/WorkersOnTonBot/app?startapp=r_1793453606' },
      { id: 4, name: 'Easy Bonus Code', link: 'https://t.me/easybonuscode_bot?start=1793453606' },
      { id: 5, name: 'Ton Dragon', link: 'https://t.me/TonDragonBot/myapp?startapp=1793453606' },
      { id: 6, name: 'Pobuzz Bot', link: 'https://t.me/Pobuzzbot/app?startapp=1793453606' }
    ];
  });

  const [socialTasks, setSocialTasks] = useState(() => {
    const saved = localStorage.getItem('social_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 101, name: "@GrowTeaNews" }, { id: 102, name: "@GoldenMinerNews" },
      { id: 103, name: "@cryptogold_online_official" }, { id: 104, name: "@M9460" },
      { id: 105, name: "@easytonfree" }, { id: 106, name: "@WORLDBESTCRYTO" }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ton_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('bot_tasks', JSON.stringify(botTasks));
    localStorage.setItem('social_tasks', JSON.stringify(socialTasks));
  }, [botTasks, socialTasks]);

  const handleTaskComplete = (id, type) => {
    setBalance(prev => prev + 0.0005);
    if (type === 'bot') {
      setBotTasks(prev => prev.filter(t => t.id !== id));
    } else {
      setSocialTasks(prev => prev.filter(t => t.id !== id));
    }
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: blockId });
      AdController.show().catch((err) => console.error(err));
    }
  };

  const handleClaimReward = () => {
    if (rewardCode === "YTTPO") {
      setBalance(prev => prev + 0.0005);
      setRewardCode("");
      alert("Success! 0.0005 TON added to your balance.");
    } else {
      alert("Invalid Reward Code!");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', paddingBottom: '110px' },
    header: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px', borderRadius: '25px', border: '1px solid #334155', gap: '15px', marginBottom: '20px' },
    balance: { color: '#fbbf24', fontSize: '24px', fontWeight: '900' },
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '20px', marginBottom: '15px', border: '1px solid #334155' },
    btn: (color='#fbbf24') => ({ backgroundColor: color, color: '#0f172a', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '11px' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#1e293b', display: 'flex', justifyContent: 'space-around', padding: '18px', borderTop: '1px solid #334155' },
    priceRow: { display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #334155', fontSize: '12px' },
    copyBox: { backgroundColor: '#0f172a', padding: '12px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #334155', cursor: 'pointer' },
    historyBox: { backgroundColor: '#0f172a', padding: '12px', borderRadius: '12px', fontSize: '11px', border: '1px solid #334155', marginTop: '10px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{width: '50px', height: '50px', backgroundColor: '#fbbf24', borderRadius: '50%'}}></div>
        <div>
          <div style={{fontWeight: '900'}}>Easy Earn TON</div>
          <div style={styles.balance}>{balance.toFixed(4)} TON</div>
        </div>
      </div>

      {activeNav === 'earn' && (
        <>
          {!showPayForm && (
            <div style={{display: 'flex', backgroundColor: '#1e293b', borderRadius: '12px', padding: '5px', marginBottom: '15px'}}>
              <button style={{...styles.btn(activeTab === 'bot' ? '#fbbf24' : 'transparent'), flex: 1}} onClick={() => setActiveTab('bot')}>Start Bot</button>
              <button style={{...styles.btn(activeTab === 'social' ? '#fbbf24' : 'transparent'), flex: 1}} onClick={() => setActiveTab('social')}>Social</button>
              <button style={{...styles.btn(activeTab === 'reward' ? '#fbbf24' : 'transparent'), flex: 1}} onClick={() => setActiveTab('reward')}>Reward</button>
            </div>
          )}

          {!showPayForm ? (
            <>
              {activeTab === 'bot' && (
                <div style={styles.card}>
                  <h4 style={{fontWeight: '900'}}>Bot Tasks (0.0005 TON)</h4>
                  {botTasks.length > 0 ? botTasks.map(t => (
                    <div key={t.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                      <span style={{fontSize: '13px'}}>{t.name}</span>
                      <button style={styles.btn()} onClick={() => { window.open(t.link, '_blank'); handleTaskComplete(t.id, 'bot'); }}>Start</button>
                    </div>
                  )) : <p style={{textAlign:'center', color:'#94a3b8'}}>No more tasks available.</p>}
                </div>
              )}

              {activeTab === 'social' && (
                <div style={styles.card}>
                  <button style={{...styles.btn(), width: '100%', marginBottom: '15px', padding: '15px'}} onClick={() => setShowPayForm(true)}>
                    + Add Your Task
                  </button>
                  <h4 style={{fontWeight: '900'}}>Social Channels (0.0005 TON)</h4>
                  {socialTasks.length > 0 ? socialTasks.map((t) => (
                    <div key={t.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                      <span style={{fontSize: '13px'}}>{t.name}</span>
                      <button style={styles.btn('#38bdf8')} onClick={() => { window.open(`https://t.me/${t.name.replace('@','')}`, '_blank'); handleTaskComplete(t.id, 'social'); }}>Join</button>
                    </div>
                  )) : <p style={{textAlign:'center', color:'#94a3b8'}}>No more channels available.</p>}
                </div>
              )}

              {activeTab === 'reward' && (
                <div style={{...styles.card, textAlign: 'center'}}>
                  <h4 style={{fontWeight: '900'}}>Redeem Reward Code</h4>
                  <input 
                    style={{...styles.input, textAlign: 'center'}} 
                    placeholder="ENTER CODE" 
                    value={rewardCode}
                    onChange={(e) => setRewardCode(e.target.value.toUpperCase())}
                  />
                  <button style={{...styles.btn(), width: '100%'}} onClick={handleClaimReward}>Claim Now</button>
                </div>
              )}
            </>
          ) : (
            <div style={styles.card}>
              <button style={{...styles.btn('#10b981'), width: '100%', marginBottom: '15px'}} onClick={() => alert("No tasks yet.")}>My Tasks</button>
              <h4 style={{fontWeight: '900', textAlign: 'center'}}>Order Placement</h4>
              <div style={{backgroundColor: '#0f172a', borderRadius: '12px', padding: '5px', marginBottom: '15px', border: '1px solid #334155'}}>
                <div style={styles.priceRow}><span>100 Users</span><span style={{color: '#fbbf24'}}>0.2 TON</span></div>
                <div style={styles.priceRow}><span>200 Users</span><span style={{color: '#fbbf24'}}>0.4 TON</span></div>
                <div style={styles.priceRow}><span>300 Users</span><span style={{color: '#fbbf24'}}>0.5 TON</span></div>
              </div>
              <input style={styles.input} placeholder="Channel Name (@Example)" />
              <input style={styles.input} placeholder="Channel Link" />
              <div style={styles.copyBox} onClick={() => copyToClipboard(adminAddress)}>
                <small style={{color: '#94a3b8', fontSize: '10px'}}>Pay Address (Click to Copy)</small><br/>
                <span style={{fontSize: '11px', color: '#fbbf24', wordBreak: 'break-all'}}>{adminAddress}</span>
              </div>
              <div style={styles.copyBox} onClick={() => copyToClipboard(userUID)}>
                <small style={{color: '#94a3b8', fontSize: '10px'}}>MEMO / UID (Click to Copy)</small><br/>
                <span style={{color: '#fbbf24', fontWeight: '900'}}>{userUID}</span>
              </div>
              <button style={{...styles.btn(), width: '100%'}} onClick={() => setShowPayForm(false)}>Back</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center', fontWeight: '900'}}>Invite Friends</h3>
          <p style={{textAlign: 'center', fontSize: '13px', color: '#fbbf24', fontWeight: 'bold'}}>Get 0.0005 TON per invite!</p>
          <input style={styles.input} value={`https://t.me/EasyTONFree_Bot?start=${userUID}`} readOnly />
          <button style={{...styles.btn(), width: '100%'}} onClick={() => copyToClipboard(`https://t.me/EasyTONFree_Bot?start=${userUID}`)}>Copy Link</button>
          <h4 style={{marginTop: '25px', fontWeight: '900'}}>Invite History</h4>
          <div style={styles.historyBox}>
            <div style={{display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '5px'}}><span>User ID</span><span>Status</span></div>
            <div style={{textAlign: 'center', color: '#64748b', padding: '5px'}}>No invites yet.</div>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{fontWeight: '900'}}>Withdraw TON</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" />
          <input style={styles.input} placeholder="TON Wallet Address" />
          <button style={{...styles.btn(), width: '100%'}}>Withdraw Now</button>
          <h4 style={{marginTop: '25px', fontWeight: '900'}}>Withdraw History</h4>
          <div style={styles.historyBox}>
             <div style={{display: 'flex', justifyContent: 'space-between'}}>
               <div><span style={{display: 'block', fontWeight: '900'}}>0.5000 TON</span><small style={{color: '#94a3b8'}}>2026-04-10</small></div>
               <span style={{color: '#4ade80', fontWeight: '900'}}>Completed</span>
             </div>
          </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center', fontWeight: '900'}}>My Profile</h3>
          <div style={{backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #334155'}}>
            <p style={{fontWeight: '900', margin: '8px 0'}}>UID: <span style={{color: '#fbbf24'}}>{userUID}</span></p>
            <p style={{fontWeight: '900', margin: '8px 0'}}>Status: <span style={{color: '#10b981'}}>Active</span></p>
          </div>
          <div style={{marginTop: '20px', border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '15px'}}>
            <h4 style={{color: '#ef4444', marginTop: 0, fontWeight: '900'}}>⚠️ Policy</h4>
            <p style={{fontSize: '12px', color: '#fca5a5', lineHeight: '1.5'}}>Fake accounts and scripts are strictly prohibited. You will be banned permanently if fraud is detected.</p>
          </div>
        </div>
      )}

      <div style={styles.footer}>
        <div style={{textAlign: 'center', fontSize: '11px', color: activeNav === 'earn' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('earn')}>💰<br/>Earn</div>
        <div style={{textAlign: 'center', fontSize: '11px', color: activeNav === 'invite' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('invite')}>👥<br/>Invite</div>
        <div style={{textAlign: 'center', fontSize: '11px', color: activeNav === 'withdraw' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('withdraw')}>💸<br/>Withdraw</div>
        <div style={{textAlign: 'center', fontSize: '11px', color: activeNav === 'profile' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('profile')}>👤<br/>Profile</div>
      </div>
    </div>
  );
}

export default App;
