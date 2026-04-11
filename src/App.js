import React, { useState, useEffect } from 'react';

function App() {
  // 1. Core States
  const [userUID] = useState(() => {
    const tg = window.Telegram?.WebApp;
    return tg?.initDataUnsafe?.user?.id?.toString() || "1793453606";
  });
  
  const [balance, setBalance] = useState(0.0000);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showPayForm, setShowPayForm] = useState(false);
  const [rewardCode, setRewardCode] = useState("");
  const [usedReward, setUsedReward] = useState(false);
  
  // 2. Data Persistence States
  const [completedTasks, setCompletedTasks] = useState([]);
  const [inviteHistory, setInviteHistory] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [isReferralActive, setIsReferralActive] = useState(true); // ပထမဆုံး Task အတွက်ပဲ Success ပြဖို့

  // 3. Task Data
  const socialTasks = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460", 
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO", 
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69", 
    "@zrbtua", "@perviu1million"
  ];

  const botTasks = [
    { name: "GrowTea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { name: "GoldenMiner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { name: "WorkersOnTon Bot", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" }
  ];

  // 4. Logic Handlers
  const handleTaskAction = (taskName) => {
    if (!completedTasks.includes(taskName)) {
      setCompletedTasks(prev => [...prev, taskName]);
      setBalance(prev => prev + 0.0005);

      // Invite Logic: referral ကဝင်လာပြီး ပထမဆုံး task လုပ်ရင် referral bonus ပေါင်းမယ်
      if (isReferralActive) {
        setInviteHistory(prev => [{ id: "Referral_User_01", amount: 0.0005, status: "Success", date: new Date().toLocaleDateString() }, ...prev]);
        setBalance(prev => prev + 0.0005);
        setIsReferralActive(false); // တစ်ခါပဲပေါင်းဖို့
        alert("Invite Reward Success: +0.0005 TON");
      }
    }
  };

  const handleRewardClaim = () => {
    if (rewardCode.toUpperCase() === "YTTPO" && !usedReward) {
      setBalance(prev => prev + 0.0005);
      setUsedReward(true);
      setRewardCode("");
      alert("Reward Claimed!");
    } else {
      alert(usedReward ? "Code already used!" : "Invalid Code!");
    }
  };

  // 5. Styles (Based on Screenshots)
  const styles = {
    container: { backgroundColor: '#131926', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px', fontFamily: 'sans-serif' },
    balanceCard: { background: '#1c2536', padding: '30px 20px', borderRadius: '24px', textAlign: 'center', marginBottom: '20px', border: '1px solid #2d3748' },
    tabRow: { display: 'flex', backgroundColor: '#1c2536', borderRadius: '14px', padding: '5px', marginBottom: '20px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: active ? '#facc15' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }),
    card: { backgroundColor: '#1c2536', borderRadius: '24px', padding: '20px', marginBottom: '15px', border: '1px solid #2d3748' },
    input: { width: '100%', padding: '16px', borderRadius: '14px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', marginBottom: '15px', boxSizing: 'border-box', fontSize: '14px' },
    yellowBtn: { width: '100%', padding: '16px', borderRadius: '14px', backgroundColor: '#facc15', color: '#000', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '16px' },
    taskRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #2d3748' },
    joinBtn: { backgroundColor: '#60a5fa', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px 0', backgroundColor: '#1c2536', borderTop: '1px solid #2d3748' },
    navItem: (active) => ({ textAlign: 'center', flex: 1, fontSize: '11px', color: active ? '#facc15' : '#94a3b8', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }),
    warningBox: { border: '1px solid #f87171', backgroundColor: 'rgba(248, 113, 113, 0.1)', padding: '15px', borderRadius: '16px', marginTop: '15px' }
  };

  return (
    <div style={styles.container}>
      
      {/* Balance Display */}
      <div style={styles.balanceCard}>
        <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '10px' }}>AVAILABLE BALANCE</p>
        <h1 style={{ color: '#facc15', fontSize: '38px', margin: 0, fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {/* Main Content Area */}
      {activeNav === 'earn' && (
        <>
          <div style={styles.tabRow}>
            <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => {setActiveTab('bot'); setShowPayForm(false);}}>Start Bot</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => {setActiveTab('social'); setShowPayForm(false);}}>Social</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => {setActiveTab('reward'); setShowPayForm(false);}}>Reward</button>
          </div>

          {!showPayForm ? (
            <div style={styles.card}>
              {activeTab === 'social' && (
                <>
                  <button style={{...styles.yellowBtn, marginBottom: '20px'}} onClick={() => setShowPayForm(true)}>+ Add Your Task</button>
                  <h4 style={{margin: '0 0 10px 0'}}>Social Channels (0.0005 TON)</h4>
                  {socialTasks.filter(n => !completedTasks.includes(n)).map((name, i) => (
                    <div key={i} style={styles.taskRow}>
                      <span style={{fontSize: '14px'}}>{name}</span>
                      <button style={styles.joinBtn} onClick={() => { window.open(`https://t.me/${name.replace('@','')}`, '_blank'); handleTaskAction(name); }}>Join</button>
                    </div>
                  ))}
                </>
              )}

              {activeTab === 'bot' && (
                <>
                  <h4 style={{margin: '0 0 10px 0'}}>Bot Tasks (0.0005 TON)</h4>
                  {botTasks.filter(t => !completedTasks.includes(t.name)).map((t, i) => (
                    <div key={i} style={styles.taskRow}>
                      <span style={{fontSize: '14px'}}>{t.name}</span>
                      <button style={{...styles.joinBtn, backgroundColor: '#facc15', color: '#000'}} onClick={() => { window.open(t.link, '_blank'); handleTaskAction(t.name); }}>Start</button>
                    </div>
                  ))}
                </>
              )}

              {activeTab === 'reward' && (
                <div style={{textAlign: 'center'}}>
                  <h3 style={{marginBottom: '20px'}}>Redeem Reward Code</h3>
                  <input style={{...styles.input, textAlign: 'center'}} placeholder="ENTER CODE" value={rewardCode} onChange={(e) => setRewardCode(e.target.value)} />
                  <button style={styles.yellowBtn} onClick={handleRewardClaim}>Claim Now</button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.card}>
              <h3 style={{textAlign: 'center', marginBottom: '20px'}}>Order Placement</h3>
              <button style={styles.yellowBtn} onClick={() => setShowPayForm(false)}>Back</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center'}}>Invite Friends</h3>
          <p style={{textAlign: 'center', fontSize: '13px', color: '#94a3b8'}}>Earn 0.0005 TON when your friend joins and completes 1 task.</p>
          <input style={styles.input} value={`https://t.me/EasyTONFree_Bot?start=${userUID}`} readOnly />
          <button style={styles.yellowBtn} onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${userUID}`); alert("Copied!");}}>Copy Link</button>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center', marginBottom: '20px'}}>Withdrawal Request</h3>
          <label style={{fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px'}}>Amount to Withdraw (TON):</label>
          <input style={styles.input} placeholder="0.00" type="number" />
          <label style={{fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px'}}>TON Wallet Address:</label>
          <input style={styles.input} placeholder="Enter Address" />
          
          <div style={{backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #facc15'}}>
            <p style={{fontSize: '13px', color: '#facc15', margin: 0, fontWeight: 'bold'}}>MEMO (Required): {userUID}</p>
          </div>
          
          <button style={styles.yellowBtn}>CONFIRM WITHDRAWAL</button>
        </div>
      )}

      {activeNav === 'history' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center'}}>Activity History</h3>
          <h4 style={{color: '#94a3b8', fontSize: '14px'}}>Invite Success</h4>
          {inviteHistory.length > 0 ? inviteHistory.map((h, i) => (
            <div key={i} style={styles.taskRow}>
              <span style={{fontSize: '12px'}}>{h.id}</span>
              <span style={{color: '#4ade80', fontWeight: 'bold'}}>+{h.amount} TON</span>
            </div>
          )) : <p style={{fontSize: '12px', color: '#475569'}}>No invite history found.</p>}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center'}}>My Profile</h3>
          <div style={{backgroundColor: '#0f172a', padding: '15px', borderRadius: '14px', marginBottom: '15px'}}>
            <p style={{margin: '5px 0'}}>User ID: <b>{userUID}</b></p>
            <p style={{margin: '5px 0'}}>Account Status: <span style={{color: '#4ade80'}}>Verified</span></p>
          </div>
          
          <div style={styles.warningBox}>
            <h4 style={{color: '#f87171', marginTop: 0}}>⚠️ SECURITY POLICY</h4>
            <ul style={{fontSize: '12px', color: '#fca5a5', paddingLeft: '20px', lineHeight: '1.6'}}>
              <li>Multiple accounts on the same IP address are strictly banned.</li>
              <li>Fake account creation or bot automation will lead to permanent ban.</li>
              <li>Withdrawal will be canceled if any fraud is detected.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div style={styles.footer}>
        <div style={styles.navItem(activeNav === 'earn')} onClick={() => setActiveNav('earn')}>💰<span>Earn</span></div>
        <div style={styles.navItem(activeNav === 'invite')} onClick={() => setActiveNav('invite')}>👥<span>Invite</span></div>
        <div style={styles.navItem(activeNav === 'withdraw')} onClick={() => setActiveNav('withdraw')}>💸<span>Withdraw</span></div>
        <div style={styles.navItem(activeNav === 'history')} onClick={() => setActiveNav('history')}>📜<span>History</span></div>
        <div style={styles.navItem(activeNav === 'profile')} onClick={() => setActiveNav('profile')}>👤<span>Profile</span></div>
      </div>

    </div>
  );
}

export default App;
