import React, { useState } from 'react';

function App() {
  const [userUID] = useState(() => {
    const tg = window.Telegram?.WebApp;
    return tg?.initDataUnsafe?.user?.id?.toString() || "1793453606"; 
  });

  const [balance, setBalance] = useState(0.0000);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showPayForm, setShowPayForm] = useState(false);
  const [rewardCode, setRewardCode] = useState("");
  const [usedReward, setUsedReward] = useState(false); // Code တစ်ခါပဲသုံးဖို့

  // Task တွေ Join ပြီးရင် List ထဲကဖျောက်ဖို့ State နဲ့သိမ်းမယ်
  const [completedTasks, setCompletedTasks] = useState([]);

  const socialTasks = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", 
    "@M9460", "@USDTcloudminer_channel", "@ADS_TON1", 
    "@goblincrypto", "@WORLDBESTCRYTO", "@kombo_crypta", 
    "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69", 
    "@zrbtua", "@perviu1million"
  ];

  const botTasks = [
    { name: "GrowTea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { name: "GoldenMiner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { name: "WorkersOnTon Bot", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { name: "EasyBonusCode Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { name: "TonDragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const handleTaskAction = (taskName) => {
    setCompletedTasks([...completedTasks, taskName]);
    setBalance(prev => prev + 0.0005);
  };

  const handleRewardClaim = () => {
    if (rewardCode.toUpperCase() === "YTTPO" && !usedReward) {
      setBalance(prev => prev + 0.0005);
      setUsedReward(true);
      alert("Reward Claimed Successfully!");
    } else if (usedReward) {
      alert("You have already used this code.");
    } else {
      alert("Invalid Reward Code.");
    }
  };

  const styles = {
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '15px' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', marginBottom: '12px', fontWeight: '900', outline: 'none', boxSizing: 'border-box' },
    btn: (bg = '#fbbf24') => ({ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: bg, color: bg === 'transparent' ? '#fff' : '#000', fontWeight: '900', cursor: 'pointer' }),
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '2px solid #334155' }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' }}>
      
      <div style={{ textAlign: 'center', background: '#1e293b', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '1px solid #334155' }}>
        <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>AVAILABLE BALANCE</p>
        <h1 style={{ color: '#fbbf24', fontSize: '36px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
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
                  {botTasks.filter(t => !completedTasks.includes(t.name)).map((t, i) => (
                    <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #334155'}}>
                      <span style={{fontSize: '13px', fontWeight: '900'}}>{t.name}</span>
                      <button style={styles.btn()} onClick={() => { window.open(t.link, '_blank'); handleTaskAction(t.name); }}>Start</button>
                    </div>
                  ))}
                  {botTasks.filter(t => !completedTasks.includes(t.name)).length === 0 && <p style={{textAlign:'center', fontSize:'12px', color:'#94a3b8'}}>No tasks available.</p>}
                </div>
              )}

              {activeTab === 'social' && (
                <div style={styles.card}>
                  <button style={{...styles.btn(), width: '100%', marginBottom: '15px', padding: '15px'}} onClick={() => setShowPayForm(true)}>
                    + Add Your Task
                  </button>
                  <h4 style={{fontWeight: '900'}}>Social Channels (0.0005 TON)</h4>
                  {socialTasks.filter(name => !completedTasks.includes(name)).map((name, i) => (
                    <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #334155'}}>
                      <span style={{fontSize: '13px', fontWeight: '900'}}>{name}</span>
                      <button style={styles.btn('#38bdf8')} onClick={() => { window.open(`https://t.me/${name.replace('@','')}`, '_blank'); handleTaskAction(name); }}>Join</button>
                    </div>
                  ))}
                   {socialTasks.filter(name => !completedTasks.includes(name)).length === 0 && <p style={{textAlign:'center', fontSize:'12px', color:'#94a3b8'}}>No tasks available.</p>}
                </div>
              )}

              {activeTab === 'reward' && (
                <div style={{...styles.card, textAlign: 'center'}}>
                  <h4 style={{fontWeight: '900'}}>Redeem Reward Code</h4>
                  <input 
                    style={{...styles.input, textAlign: 'center'}} 
                    placeholder="ENTER CODE HERE" 
                    value={rewardCode}
                    onChange={(e) => setRewardCode(e.target.value)}
                  />
                  <button style={{...styles.btn(), width: '100%'}} onClick={handleRewardClaim}>Claim Now</button>
                </div>
              )}
            </>
          ) : (
            <div style={styles.card}>
              <h4 style={{fontWeight: '900', textAlign: 'center'}}>Order Placement</h4>
              <button style={{...styles.btn(), width: '100%', marginTop:'10px'}} onClick={() => setShowPayForm(false)}>Back</button>
            </div>
          )}
        </>
      )}

      <div style={styles.footer}>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'earn' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('earn')}>💰<br/>Earn</div>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'invite' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('invite')}>👥<br/>Invite</div>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'withdraw' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('withdraw')}>💸<br/>Withdraw</div>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'profile' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('profile')}>👤<br/>Profile</div>
      </div>
    </div>
  );
}

export default App;
