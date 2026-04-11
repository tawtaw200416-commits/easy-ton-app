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
  const [usedReward, setUsedReward] = useState(false);
  
  // History & Task Tracker
  const [completedTasks, setCompletedTasks] = useState([]);
  const [inviteHistory, setInviteHistory] = useState([]);

  // Data
  const socialTasks = ["@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460", "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO", "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69", "@zrbtua", "@perviu1million"];
  const botTasks = [
    { name: "GrowTea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { name: "GoldenMiner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { name: "WorkersOnTon Bot", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { name: "EasyBonusCode Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { name: "TonDragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const handleTask = (name) => {
    if (!completedTasks.includes(name)) {
      setCompletedTasks([...completedTasks, name]);
      setBalance(prev => prev + 0.0005);
      // ပထမဆုံး Task လုပ်ရင် Referral အောင်မြင်တယ်လို့ ယူဆပြီး History ထဲထည့်မယ်
      if (inviteHistory.length === 0) {
        setInviteHistory([{id: "User_8829", status: "Success", amount: "+0.0005"}]);
      }
    }
  };

  const styles = {
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '15px' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', marginBottom: '12px', fontWeight: '900', outline: 'none', boxSizing: 'border-box' },
    btn: (bg = '#fbbf24') => ({ padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: bg, color: bg === 'transparent' ? '#fff' : '#000', fontWeight: '900', cursor: 'pointer' }),
    historyBox: { backgroundColor: '#0f172a', padding: '15px', borderRadius: '15px', marginTop: '10px' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '2px solid #334155' }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' }}>
      
      {/* Balance Header */}
      <div style={{ textAlign: 'center', background: '#1e293b', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '1px solid #334155' }}>
        <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>TOTAL BALANCE</p>
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
            <div style={styles.card}>
              {activeTab === 'bot' && botTasks.filter(t=>!completedTasks.includes(t.name)).map((t,i) => (
                <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                  <span style={{fontSize:'13px', fontWeight:'900'}}>{t.name}</span>
                  <button style={styles.btn()} onClick={()=>{window.open(t.link); handleTask(t.name)}}>Start</button>
                </div>
              ))}
              {activeTab === 'social' && (
                <>
                  <button style={{...styles.btn(), width:'100%', marginBottom:'15px'}} onClick={()=>setShowPayForm(true)}>+ Add Your Task</button>
                  {socialTasks.filter(n=>!completedTasks.includes(n)).map((n,i) => (
                    <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                      <span style={{fontSize:'13px', fontWeight:'900'}}>{n}</span>
                      <button style={styles.btn('#38bdf8')} onClick={()=>{window.open(`https://t.me/${n.replace('@','')}`); handleTask(n)}}>Join</button>
                    </div>
                  ))}
                </>
              )}
              {activeTab === 'reward' && (
                <div style={{textAlign:'center'}}>
                  <h4 style={{fontWeight:'900'}}>Redeem Code</h4>
                  <input style={{...styles.input, textAlign:'center'}} placeholder="ENTER CODE" value={rewardCode} onChange={(e)=>setRewardCode(e.target.value)} />
                  <button style={{...styles.btn(), width:'100%'}} onClick={()=>{ if(rewardCode==='YTTPO' && !usedReward){ setBalance(balance+0.0005); setUsedReward(true); alert("Success"); } }}>Claim Now</button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.card}>
              <h4 style={{textAlign:'center', fontWeight:'900'}}>Order Placement</h4>
              <input style={styles.input} placeholder="Channel Username" />
              <input style={styles.input} placeholder="Link" />
              <button style={{...styles.btn(), width:'100%'}} onClick={()=>setShowPayForm(false)}>Back</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center', fontWeight: '900'}}>Invite Friends</h3>
          <p style={{textAlign: 'center', fontSize: '13px', color: '#fbbf24', fontWeight: 'bold'}}>Earn 0.0005 TON for every friend who joins and completes one task!</p>
          <input style={styles.input} value={`https://t.me/EasyTONFree_Bot?start=${userUID}`} readOnly />
          <button style={{...styles.btn(), width: '100%'}} onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${userUID}`); alert("Copied!")}}>Copy Link</button>
          
          <h4 style={{marginTop: '25px', fontWeight: '900'}}>Invite History</h4>
          <div style={styles.historyBox}>
            <div style={{display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px', fontWeight: '900', borderBottom:'1px solid #1e293b', paddingBottom:'5px'}}><span>User ID</span><span>Status</span></div>
            {inviteHistory.length > 0 ? inviteHistory.map((h,i)=>(
              <div key={i} style={{display:'flex', justifyContent:'space-between', fontSize:'13px', marginTop:'8px'}}>
                <span>{h.id}</span><span style={{color:'#10b981'}}>{h.status} ({h.amount})</span>
              </div>
            )) : <div style={{textAlign: 'center', color: '#64748b', padding: '10px', fontSize: '12px'}}>No successful invites yet.</div>}
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{fontWeight: '900', textAlign:'center'}}>Withdraw TON</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" />
          <input style={styles.input} placeholder="TON Wallet Address" />
          <div style={{backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '15px', borderRadius: '15px', marginBottom: '12px', border: '1px solid #fbbf24', textAlign:'center'}}>
             <small style={{color: '#fbbf24', fontWeight: '900', fontSize:'12px'}}>REQUIRED MEMO: {userUID}</small>
          </div>
          <button style={{...styles.btn(), width: '100%'}}>Withdraw Now</button>
          
          <h4 style={{marginTop: '25px', fontWeight: '900'}}>Withdrawal History</h4>
          <div style={styles.historyBox}>
            <div style={{textAlign: 'center', color: '#64748b', fontSize: '12px'}}>No withdrawal history found.</div>
          </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center', fontWeight: '900'}}>User Profile</h3>
          <div style={{backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #334155'}}>
            <p style={{fontWeight: '900', margin: '8px 0'}}>UID: <span style={{color: '#fbbf24'}}>{userUID}</span></p>
            <p style={{fontWeight: '900', margin: '8px 0'}}>Account Status: <span style={{color: '#10b981'}}>Active Verified</span></p>
          </div>
          <div style={{marginTop: '20px', border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '15px'}}>
            <h4 style={{color: '#ef4444', marginTop: 0, fontWeight: '900'}}>⚠️ SECURITY POLICY</h4>
            <ul style={{fontSize: '12px', color: '#fca5a5', paddingLeft: '15px', lineHeight: '1.6', fontWeight: '900'}}>
              <li>Multiple accounts on the same device/IP are strictly forbidden.</li>
              <li>Use of VPN, scripts, or emulators will result in a permanent ban.</li>
              <li>Withdrawals are manually reviewed to prevent fraud.</li>
            </ul>
          </div>
        </div>
      )}

      <div style={styles.footer}>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'earn' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => {setActiveNav('earn'); setShowPayForm(false);}}>💰<br/>Earn</div>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'invite' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('invite')}>👥<br/>Invite</div>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'withdraw' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('withdraw')}>💸<br/>Withdraw</div>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'profile' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('profile')}>👤<br/>Profile</div>
      </div>
    </div>
  );
}

export default App;
