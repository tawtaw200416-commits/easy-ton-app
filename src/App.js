import React, { useState, useEffect } from 'react';

function App() {
  // --- 1. Persistence & State Management ---
  const [userUID] = useState(() => {
    const tg = window.Telegram?.WebApp;
    return tg?.initDataUnsafe?.user?.id?.toString() || "1793453606"; 
  });

  // LocalStorage ကနေ Data တွေ ပြန်ယူမယ်
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('withdraw_history')) || []);
  const [inviteHistory, setInviteHistory] = useState(() => JSON.parse(localStorage.getItem('invite_history')) || []);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showPayForm, setShowPayForm] = useState(false);
  const adminAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  // Data ပြောင်းတိုင်း သိမ်းဆည်းပေးခြင်း
  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
    localStorage.setItem('withdraw_history', JSON.stringify(withdrawHistory));
    localStorage.setItem('invite_history', JSON.stringify(inviteHistory));
  }, [balance, completedTasks, withdrawHistory, inviteHistory]);

  // --- 2. Data Lists ---
  const socialTasks = [
    { id: 's1', name: "@GrowTeaNews" }, { id: 's2', name: "@GoldenMinerNews" },
    { id: 's3', name: "@cryptogold_online_official" }, { id: 's4', name: "@M9460" },
    { id: 's5', name: "@USDTcloudminer_channel" }, { id: 's6', name: "@ADS_TON1" }
  ];

  const botTasks = [
    { id: 'b1', name: "GrowTea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "GoldenMiner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" }
  ];

  // --- 3. Functional Logic ---
  
  // Task တစ်ခုပြီးရင် ပေါင်းပေးမယ့် Logic
  const completeTask = (id, reward) => {
    if (!completedTasks.includes(id)) {
      setBalance(prev => prev + reward);
      setCompletedTasks(prev => [...prev, id]);
      alert(`Success! ${reward} TON added.`);
    }
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amount = parseFloat(e.target.amount.value);
    const addr = e.target.address.value;
    if (amount >= 0.1 && balance >= amount) {
      const newEntry = { id: Date.now(), amount, addr, status: 'Pending', date: new Date().toLocaleDateString() };
      setWithdrawHistory([newEntry, ...withdrawHistory]);
      setBalance(prev => prev - amount);
      alert("Withdraw Request Submitted!");
    } else {
      alert("Check Min 0.1 TON or Balance.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  const styles = {
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '15px' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', marginBottom: '12px', outline: 'none', boxSizing: 'border-box', fontWeight: 'bold' },
    btn: (bg = '#fbbf24') => ({ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: bg, color: bg === 'transparent' ? '#fff' : '#000', fontWeight: '900', cursor: 'pointer' }),
    copyBtn: { backgroundColor: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px dashed #fbbf24', color: '#fbbf24', textAlign: 'center', marginBottom: '10px', cursor: 'pointer', fontSize: '11px' },
    historyItem: { backgroundColor: '#0f172a', padding: '12px', borderRadius: '12px', marginBottom: '8px', border: '1px solid #334155', fontSize: '12px' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '2px solid #334155', zIndex: 100 }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' }}>
      
      {/* Balance Section */}
      <div style={{ textAlign: 'center', background: 'linear-gradient(45deg, #1e293b, #334155)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '1px solid #475569' }}>
        <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>AVAILABLE BALANCE</p>
        <h1 style={{ color: '#fbbf24', fontSize: '38px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{display: 'flex', backgroundColor: '#1e293b', borderRadius: '12px', padding: '5px', marginBottom: '15px'}}>
            {['bot', 'social', 'reward'].map(tab => (
              <button key={tab} style={{...styles.btn(activeTab === tab ? '#fbbf24' : 'transparent'), flex: 1, textTransform: 'capitalize'}} onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
          </div>

          {!showPayForm ? (
            <>
              {activeTab === 'bot' && (
                <div style={styles.card}>
                  <h4 style={{fontWeight: '900', marginBottom: '15px'}}>Start Bot Missions</h4>
                  {botTasks.filter(t => !completedTasks.includes(t.id)).map(t => (
                    <div key={t.id} style={{marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #334155'}}>
                      <p style={{fontSize: '14px', fontWeight: '900', margin: '0 0 10px 0'}}>{t.name}</p>
                      <div style={{display: 'flex', gap: '10px'}}>
                        <button style={{...styles.btn('#38bdf8'), flex: 1}} onClick={() => window.open(t.link, '_blank')}>1. Start Bot</button>
                        <button style={{...styles.btn(), flex: 1}} onClick={() => completeTask(t.id, 0.0005)}>2. Check Start</button>
                      </div>
                    </div>
                  ))}
                  {botTasks.filter(t => !completedTasks.includes(t.id)).length === 0 && <p style={{textAlign:'center', color:'#64748b'}}>All missions completed!</p>}
                </div>
              )}

              {activeTab === 'social' && (
                <div style={styles.card}>
                  <button style={{...styles.btn(), width: '100%', marginBottom: '20px', height: '50px'}} onClick={() => setShowPayForm(true)}>+ Add Your Task</button>
                  <h4 style={{fontWeight: '900', marginBottom: '15px'}}>Social Tasks</h4>
                  {socialTasks.filter(t => !completedTasks.includes(t.id)).map(t => (
                    <div key={t.id} style={{marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #334155'}}>
                      <p style={{fontSize: '14px', fontWeight: '900', margin: '0 0 10px 0'}}>{t.name}</p>
                      <div style={{display: 'flex', gap: '10px'}}>
                        <button style={{...styles.btn('#38bdf8'), flex: 1}} onClick={() => window.open(`https://t.me/${t.name.replace('@','')}`, '_blank')}>1. Join Link</button>
                        <button style={{...styles.btn(), flex: 1}} onClick={() => completeTask(t.id, 0.0005)}>2. Check Join</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={styles.card}>
              <h4 style={{textAlign: 'center', fontWeight: '900'}}>Order Placement</h4>
              <input style={styles.input} placeholder="Channel @Username" />
              <div style={styles.copyBtn} onClick={() => copyToClipboard(adminAddress)}>
                ADMIN ADDRESS (Tap to Copy)<br/><b>{adminAddress}</b>
              </div>
              <div style={styles.copyBtn} onClick={() => copyToClipboard(userUID)}>
                YOUR MEMO / UID (Tap to Copy)<br/><b>{userUID}</b>
              </div>
              <button style={{...styles.btn('#10b981'), width: '100%', marginTop: '10px'}} onClick={() => {alert("Payment submitted for review!"); setShowPayForm(false);}}>Confirm Payment</button>
              <button style={{...styles.btn('transparent'), width: '100%', marginTop: '5px'}} onClick={() => setShowPayForm(false)}>Back</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center', fontWeight: '900'}}>Invite History</h3>
          <div style={styles.copyBtn} onClick={() => copyToClipboard(`https://t.me/EasyTONFree_Bot?start=${userUID}`)}>
            Tap to Copy Invite Link
          </div>
          <div style={{marginTop: '20px'}}>
            {inviteHistory.length > 0 ? inviteHistory.map(h => (
              <div key={h.id} style={styles.historyItem}>
                Joined: {h.user} <span style={{float: 'right', color: '#10b981'}}>+0.0005 TON</span>
              </div>
            )) : <p style={{textAlign:'center', color:'#64748b'}}>No invites yet.</p>}
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{fontWeight: '900'}}>Withdraw History</h3>
          <form onSubmit={handleWithdraw}>
            <input name="amount" type="number" step="0.0001" style={styles.input} placeholder="Amount (Min 0.1)" required />
            <input name="address" style={styles.input} placeholder="TON Wallet Address" required />
            <button type="submit" style={{...styles.btn(), width: '100%', marginBottom: '20px'}}>Withdraw Now</button>
          </form>
          
          <h4 style={{fontWeight: '900', borderTop: '1px solid #334155', paddingTop: '15px'}}>Transaction Logs</h4>
          {withdrawHistory.map(h => (
            <div key={h.id} style={styles.historyItem} onClick={() => copyToClipboard(h.addr)}>
              <div><b>{h.amount} TON</b> <span style={{float: 'right', color: h.status === 'Pending' ? '#fbbf24' : '#10b981'}}>{h.status}</span></div>
              <div style={{fontSize: '10px', color: '#94a3b8', marginTop: '5px', wordBreak: 'break-all'}}>{h.addr}</div>
              <div style={{fontSize: '10px', color: '#64748b'}}>{h.date}</div>
            </div>
          ))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center', fontWeight: '900'}}>Tasks & Missions</h3>
          <div style={{textAlign: 'center', padding: '20px', color: '#94a3b8'}}>
             <p>ပြီးမြောက်ထားသော Task များမှ ဆုလာဘ်များကို ဤနေရာတွင် ရယူနိုင်ပါသည်။</p>
             <h2 style={{color: '#fbbf24'}}>{completedTasks.length} Tasks Done</h2>
          </div>
        </div>
      )}

      {/* Footer Nav */}
      <div style={styles.footer}>
        <div style={{textAlign: 'center', flex: 1, color: activeNav === 'earn' ? '#fbbf24' : '#94a3b8', fontWeight: '900'}} onClick={() => setActiveNav('earn')}>💰<br/>EARN</div>
        <div style={{textAlign: 'center', flex: 1, color: activeNav === 'invite' ? '#fbbf24' : '#94a3b8', fontWeight: '900'}} onClick={() => setActiveNav('invite')}>👥<br/>INVITE</div>
        <div style={{textAlign: 'center', flex: 1, color: activeNav === 'withdraw' ? '#fbbf24' : '#94a3b8', fontWeight: '900'}} onClick={() => setActiveNav('withdraw')}>💸<br/>HISTORY</div>
        <div style={{textAlign: 'center', flex: 1, color: activeNav === 'profile' ? '#fbbf24' : '#94a3b8', fontWeight: '900'}} onClick={() => setActiveNav('profile')}>👤<br/>PROFILE</div>
      </div>
    </div>
  );
}

export default App;
