import React, { useState } from 'react';

function App() {
  const [balance, setBalance] = useState(0.0015);
  const [activeTab, setActiveTab] = useState('bot');
  const [activeNav, setActiveNav] = useState('earn');
  const [showPayForm, setShowPayForm] = useState(false);
  const [rewardCode, setRewardCode] = useState("");
  
  const userUID = "UID17934536";
  const adminAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";
  const blockId = "27393"; 

  // Invite Link အတွက် Domain အသစ်
  const botUsername = "EasyTONFree_Bot"; 
  const inviteLink = `https://t.me/${botUsername}?start=${userUID}`;

  const [botTasks, setBotTasks] = useState([
    { id: 1, name: 'GrowTea Bot', link: 'https://t.me/GrowTeaBot/app?startapp=1793453606' },
    { id: 2, name: 'Golden Miner', link: 'https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD' },
    { id: 3, name: 'Workers On Ton', link: 'https://t.me/WorkersOnTonBot/app?startapp=r_1793453606' },
    { id: 4, name: 'Easy Bonus Code', link: 'https://t.me/easybonuscode_bot?start=1793453606' },
    { id: 5, name: 'Ton Dragon', link: 'https://t.me/TonDragonBot/myapp?startapp=1793453606' },
    { id: 6, name: 'Pobuzz Bot', link: 'https://t.me/Pobuzzbot/app?startapp=1793453606' }
  ]);

  const [socialTasks, setSocialTasks] = useState([
    { id: 101, name: "@GrowTeaNews" }, { id: 102, name: "@GoldenMinerNews" },
    { id: 103, name: "@cryptogold_online_official" }, { id: 104, name: "@M9460" },
    { id: 105, name: "@easytonfree" }, { id: 106, name: "@WORLDBESTCRYTO" }
  ]);

  const handleTaskComplete = (id, type) => {
    if (type === 'bot') {
      setBotTasks(prev => prev.filter(t => t.id !== id));
    } else {
      setSocialTasks(prev => prev.filter(t => t.id !== id));
    }
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: blockId });
      AdController.show().then(() => {
        setBalance(prev => prev + 0.0005);
      }).catch((err) => console.error(err));
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
                  {botTasks.map(t => (
                    <div key={t.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                      <span style={{fontSize: '13px'}}>{t.name}</span>
                      <button style={styles.btn()} onClick={() => { window.open(t.link, '_blank'); handleTaskComplete(t.id, 'bot'); }}>Start</button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'social' && (
                <div style={styles.card}>
                  <button style={{...styles.btn(), width: '100%', marginBottom: '15px', padding: '15px'}} onClick={() => setShowPayForm(true)}>
                    + Add Your Task
                  </button>
                  <h4 style={{fontWeight: '900'}}>Social Channels (0.0005 TON)</h4>
                  {socialTasks.map((t) => (
                    <div key={t.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                      <span style={{fontSize: '13px'}}>{t.name}</span>
                      <button style={styles.btn('#38bdf8')} onClick={() => { window.open(`https://t.me/${t.name.replace('@','')}`, '_blank'); handleTaskComplete(t.id, 'social'); }}>Join</button>
                    </div>
                  ))}
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
          <input style={styles.input} value={inviteLink} readOnly />
          <button style={{...styles.btn(), width: '100%'}} onClick={() => copyToClipboard(inviteLink)}>Copy Link</button>
          <h4 style={{marginTop: '25px', fontWeight: '900'}}>Invite History</h4>
          <div style={styles.historyBox}>
            <div style={{display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '5px'}}><span>User ID</span><span>Status</span></div>
            <div style={{textAlign: 'center', color: '#64748b', padding: '5px'}}>No invites yet.</div>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{fontWeight
