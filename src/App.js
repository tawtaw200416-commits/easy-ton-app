import React, { useState, useEffect } from 'react';

function App() {
  const [balance, setBalance] = useState(0.0015);
  const [activeTab, setActiveTab] = useState('bot');
  const [activeNav, setActiveNav] = useState('earn');
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);
  const [inviteCount, setInviteCount] = useState(0);
  
  // Fake Account Detection (Ban Logic)
  const [isBanned, setIsBanned] = useState(false);

  const userUID = "UID17934536";
  const adminAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";
  const blockId = "27393";

  // Histories State
  const [withdrawHistory, setWithdrawHistory] = useState([
    { id: 1, amount: 0.5, status: 'Completed', date: '2026-04-10' }
  ]);
  const [inviteHistory, setInviteHistory] = useState([]);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const [botTasks, setBotTasks] = useState([
    { id: 1, name: 'GrowTea Bot', link: 'https://t.me/GrowTeaBot/app?startapp=1793453606' },
    { id: 2, name: 'Golden Miner', link: 'https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD' },
    { id: 3, name: 'Workers On Ton', link: 'https://t.me/WorkersOnTonBot/app?startapp=r_1793453606' },
    { id: 4, name: 'Easy Bonus Code', link: 'https://t.me/easybonuscode_bot?start=1793453606' },
    { id: 5, name: 'Ton Dragon', link: 'https://t.me/TonDragonBot/myapp?startapp=1793453606' },
    { id: 6, name: 'Pobuzz Bot', link: 'https://t.me/Pobuzzbot/app?startapp=1793453606' }
  ]);

  const [socialTasks, setSocialTasks] = useState([
    { name: "@GrowTeaNews", id: 1 }, { name: "@GoldenMinerNews", id: 2 }, 
    { name: "@easytonfree", id: 3 }, { name: "@WORLDBESTCRYTO", id: 4 }
  ]);

  // Handle Task with Adsgram Integration
  const completeTask = (id, type) => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: blockId });
      AdController.show().then(() => {
        // Success Logic: Reward only after Ad finish
        setBalance(prev => prev + 0.0005);
        if (type === 'bot') {
          setBotTasks(prev => prev.filter(t => t.id !== id));
        } else {
          setSocialTasks(prev => prev.filter(t => t.id !== id));
        }
        alert("Task Completed! +0.0005 TON added.");
      }).catch(() => {
        alert("Please watch the full video to get reward.");
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (isBanned) {
    return <div style={{color: 'red', textAlign: 'center', marginTop: '50px'}}><h1>ACCOUNT BANNED</h1><p>Multiple fake accounts detected.</p></div>;
  }

  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', paddingBottom: '110px' },
    header: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px', borderRadius: '25px', border: '1px solid #334155', gap: '15px', marginBottom: '20px' },
    tonHeaderImg: { width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #fbbf24' },
    balance: { color: '#fbbf24', fontSize: '26px', fontWeight: '900' },
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '20px', marginBottom: '15px', border: '1px solid #334155' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#0f172a' : '#94a3b8', fontWeight: '900' },
    btn: (color='#fbbf24') => ({ backgroundColor: color, color: '#0f172a', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: '900', cursor: 'pointer' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white' },
    historyItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155', fontSize: '12px' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#1e293b', display: 'flex', justifyContent: 'space-around', padding: '18px', borderTop: '1px solid #334155' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img src="https://cryptologos.cc/logos/toncoin-ton-logo.png" alt="TON" style={styles.tonHeaderImg} />
        <div>
          <div style={{fontWeight: '900'}}>Easy Earn TON</div>
          <div style={styles.balance}>{balance.toFixed(4)} TON</div>
        </div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{display: 'flex', backgroundColor: '#1e293b', borderRadius: '12px', padding: '5px', marginBottom: '15px'}}>
            <button style={{...styles.btn(activeTab === 'bot' ? '#fbbf24' : 'transparent'), flex: 1}} onClick={() => setActiveTab('bot')}>Start Bot</button>
            <button style={{...styles.btn(activeTab === 'social' ? '#fbbf24' : 'transparent'), flex: 1}} onClick={() => setActiveTab('social')}>Social</button>
            <button style={{...styles.btn(activeTab === 'reward' ? '#fbbf24' : 'transparent'), flex: 1}} onClick={() => setActiveTab('reward')}>Reward</button>
          </div>

          {activeTab === 'bot' && (
            <div style={styles.card}>
              <h4>Bot Tasks</h4>
              {botTasks.map(t => (
                <div key={t.id} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span>{t.name}</span>
                  <button style={styles.btn()} onClick={() => { window.open(t.link, '_blank'); completeTask(t.id, 'bot'); }}>Start</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'social' && (
            <div style={styles.card}>
              <h4>Social Channels</h4>
              {socialTasks.map(t => (
                <div key={t.id} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span>{t.name}</span>
                  <button style={styles.btn('#38bdf8')} onClick={() => { window.open(`https://t.me/${t.name.replace('@','')}`, '_blank'); completeTask(t.id, 'social'); }}>Join</button>
                </div>
              ))}
              <button style={{...styles.btn(), width: '100%', marginTop: '10px'}} onClick={() => setShowPayForm(true)}>+ Add Your Task</button>
            </div>
          )}

          {showPayForm && (
             <div style={styles.card}>
                <h4>Promote Your Channel</h4>
                <p style={{fontSize: '11px', color: '#94a3b8'}}>Send 1 TON to the address below with your UID as MEMO.</p>
                <div style={{backgroundColor: '#0f172a', padding: '10px', borderRadius: '10px', marginBottom: '10px'}}>
                  <small>Address: {adminAddress}</small><br/>
                  <small>MEMO: {userUID}</small>
                </div>
                <button style={{...styles.btn(), width: '100%'}} onClick={() => setShowPayForm(false)}>Back</button>
             </div>
          )}

          {activeTab === 'reward' && (
            <div style={{...styles.card, textAlign: 'center'}}>
              <h4>Redeem Code</h4>
              <input style={styles.input} placeholder="Enter Code (e.g. YTTPO)" id="rewardCode" />
              <button style={{...styles.btn(), width: '100%'}} onClick={() => {
                const code = document.getElementById('rewardCode').value;
                if(code === 'YTTPO' && !rewardClaimed) {
                  setBalance(prev => prev + 0.0005);
                  setRewardClaimed(true);
                  alert("Reward Claimed!");
                } else {
                  alert("Invalid or already claimed.");
                }
              }}>Claim Reward</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center'}}>Referral Program</h3>
          <p style={{fontSize: '13px', textAlign: 'center'}}>Invite friends and earn 10% of their earnings.</p>
          <input style={styles.input} value={`https://t.me/EasyEarnBot?start=${userUID}`} readOnly />
          <button style={{...styles.btn(), width: '100%'}} onClick={() => copyToClipboard(`https://t.me/EasyEarnBot?start=${userUID}`)}>Copy Link</button>
          
          <h4 style={{marginTop: '20px'}}>Invite History</h4>
          {inviteHistory.length === 0 ? <p style={{fontSize: '12px', color: '#94a3b8'}}>No invites yet.</p> : 
            inviteHistory.map((inv, i) => <div key={i} style={styles.historyItem}><span>{inv.uid}</span><span>+0.0001 TON</span></div>)
          }
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw TON</h3>
          <input style={styles.input} placeholder="Min 0.5 TON" type="number" />
          <input style={styles.input} placeholder="TON Wallet Address" />
          <button style={{...styles.btn(), width: '100%'}}>Withdraw Now</button>

          <h4 style={{marginTop: '20px'}}>Withdrawal History</h4>
          {withdrawHistory.map(w => (
            <div key={w.id} style={styles.historyItem}>
              <span>{w.amount} TON</span>
              <span style={{color: '#4ade80'}}>{w.status}</span>
              <span>{w.date}</span>
            </div>
          ))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>My Profile</h3>
          <div style={styles.historyItem}><span>UID:</span><span>{userUID}</span></div>
          <div style={styles.historyItem}><span>Status:</span><span style={{color: '#4ade80'}}>Active</span></div>
          <div style={styles.historyItem}><span>Total Earned:</span><span>{balance.toFixed(4)} TON</span></div>
          <div style={styles.historyItem}><span>Banned Status:</span><span>None</span></div>
          <button style={{...styles.btn('red'), width: '100%', marginTop: '20px', color: 'white'}}>Logout</button>
        </div>
      )}

      <div style={styles.footer}>
        <div style={{textAlign: 'center', color: activeNav === 'earn' ? '#fbbf24' : '#94a3b8'}} onClick={() => setActiveNav('earn')}>💰<br/><small>Earn</small></div>
        <div style={{textAlign: 'center', color: activeNav === 'invite' ? '#fbbf24' : '#94a3b8'}} onClick={() => setActiveNav('invite')}>👥<br/><small>Invite</small></div>
        <div style={{textAlign: 'center', color: activeNav === 'withdraw' ? '#fbbf24' : '#94a3b8'}} onClick={() => setActiveNav('withdraw')}>💸<br/><small>Withdraw</small></div>
        <div style={{textAlign: 'center', color: activeNav === 'profile' ? '#fbbf24' : '#94a3b8'}} onClick={() => setActiveNav('profile')}>👤<br/><small>Profile</small></div>
      </div>
    </div>
  );
}

export default App;
