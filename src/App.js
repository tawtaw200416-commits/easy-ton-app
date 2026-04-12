import React, { useState, useEffect } from 'react';

function App() {
  // Persistence Data: LocalStorage မှ Data များ ပြန်ခေါ်ခြင်း
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [rewardClaimed, setRewardClaimed] = useState(() => JSON.parse(localStorage.getItem('reward_claimed')) || false);
  
  // UI States
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showPayForm, setShowPayForm] = useState(false);
  const [rewardInput, setRewardInput] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(100);

  // User & Admin Info
  const userUID = "1793453606";
  const adminWallet = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  // Data ပြောင်းလဲတိုင်း LocalStorage မှာ အလိုအလျောက် သိမ်းခြင်း
  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
    localStorage.setItem('reward_claimed', JSON.stringify(rewardClaimed));
  }, [balance, completedTasks, rewardClaimed]);

  // Social Tasks List (image_7.png ပါအတိုင်း)
  const socialTasks = [
    { id: "s1", name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: "s2", name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: "s3", name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
    { id: "s4", name: "@M9460", link: "https://t.me/M9460" }
  ];

  // Bot Missions List (image_8.png ပါအတိုင်း)
  const botTasks = [
    { id: "b1", name: "GrowTea Bot Mission", link: "https://t.me/GrowTeaBot" },
    { id: "b2", name: "GoldenMiner Bot Mission", link: "https://t.me/GoldenMinerBot" }
  ];

  // Task Verification Logic
  const handleVerify = (id) => {
    // ဤနေရာတွင် နောင် Backend နှင့် ချိတ်ဆက်ရန်
    if (!completedTasks.includes(id)) {
      setCompletedTasks([...completedTasks, id]);
      setBalance(prev => prev + 0.0005);
      alert("Verification Success! 0.0005 TON added to your balance.");
    } else {
      alert("Already Completed!");
    }
  };

  // Reward Code Logic
  const handleClaimReward = () => {
    if (rewardClaimed) return alert("You have already claimed this reward!");
    if (rewardInput.toUpperCase() === "YTTPO") {
      setBalance(prev => prev + 0.0005);
      setRewardClaimed(true);
      setRewardInput("");
      alert("Reward Claimed! 0.0005 TON added.");
    } else {
      alert("Wrong Code! Please try again.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  // Styles based on screenshots
  const styles = {
    container: { backgroundColor: '#0b1120', color: 'white', minHeight: '100vh', padding: '15px', fontFamily: 'Inter, sans-serif', paddingBottom: '90px' },
    balanceCard: { background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', borderRadius: '28px', padding: '30px 20px', textAlign: 'center', marginBottom: '20px', boxShadow: '0 10px 25px -5px rgba(234, 179, 8, 0.3)' },
    tabBar: { display: 'flex', backgroundColor: '#1e293b', borderRadius: '16px', padding: '6px', marginBottom: '20px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: active ? '#eab308' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: '0.3s' }),
    card: { backgroundColor: '#1e293b', borderRadius: '24px', padding: '20px', border: '1px solid #334155' },
    input: { width: '100%', padding: '16px', borderRadius: '14px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '12px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
    taskRow: { marginBottom: '25px', borderBottom: '1px solid #334155', paddingBottom: '15px' },
    joinBtn: { flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: '#38bdf8', border: 'none', color: '#fff', fontWeight: '800', cursor: 'pointer' },
    verifyBtn: { flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: '#eab308', border: 'none', color: '#000', fontWeight: '800', cursor: 'pointer' },
    planBtn: (active) => ({ flex: 1, padding: '10px', borderRadius: '10px', border: active ? '2px solid #eab308' : '1px solid #334155', backgroundColor: active ? 'rgba(234,179,8,0.1)' : 'transparent', textAlign: 'center', cursor: 'pointer', transition: '0.2s' }),
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px', backgroundColor: '#0f172a', borderTop: '1px solid #1e293b' }
  };

  return (
    <div style={styles.container}>
      {/* Header Balance (image_7.png style) */}
      <div style={styles.balanceCard}>
        <div style={{ fontSize: '13px', fontWeight: '800', color: 'rgba(0,0,0,0.6)', marginBottom: '5px' }}>AVAILABLE BALANCE</div>
        <div style={{ fontSize: '42px', fontWeight: '900', color: '#000' }}>{balance.toFixed(4)} TON</div>
      </div>

      {activeNav === 'earn' && (
        <>
          {/* Tabs (image_8.png style) */}
          <div style={styles.tabBar}>
            {['Start Bot', 'Social', 'Reward'].map(tab => (
              <button key={tab} style={styles.tabBtn(activeTab === tab.toLowerCase())} onClick={() => {setActiveTab(tab.toLowerCase()); setShowPayForm(false)}}>
                {tab}
              </button>
            ))}
          </div>

          <div style={styles.card}>
            {/* Social Tasks (image_7.png style) */}
            {activeTab === 'social' && !showPayForm && (
              <>
                <button style={{ width: '100%', padding: '16px', borderRadius: '14px', backgroundColor: '#eab308', border: 'none', fontWeight: '900', color: '#000', marginBottom: '25px', fontSize: '16px' }} onClick={() => setShowPayForm(true)}>
                  + Add Your Task
                </button>
                {socialTasks.filter(t => !completedTasks.includes(t.id)).map(task => (
                  <div key={task.id} style={styles.taskRow}>
                    <div style={{ fontWeight: '800', marginBottom: '10px', fontSize: '15px' }}>{task.name}</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => window.open(task.link, '_blank')} style={styles.joinBtn}>1. Join Link</button>
                      <button onClick={() => handleVerify(task.id)} style={styles.verifyBtn}>2. Check Join</button>
                    </div>
                  </div>
                ))}
                {socialTasks.filter(t => !completedTasks.includes(t.id)).length === 0 && <p style={{textAlign:'center', color:'#94a3b8'}}>All Social Tasks Completed!</p>}
              </>
            )}

            {/* Start Bot (image_8.png style) */}
            {activeTab === 'start bot' && (
              <>
                <h3 style={{ textAlign: 'center', color: '#eab308' }}>Start Bot Missions</h3>
                {botTasks.filter(t => !completedTasks.includes(t.id)).map(task => (
                  <div key={task.id} style={styles.taskRow}>
                    <div style={{ fontWeight: '800', marginBottom: '10px', fontSize: '15px' }}>{task.name}</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => window.open(task.link, '_blank')} style={styles.joinBtn}>1. Start Bot</button>
                      <button onClick={() => handleVerify(task.id)} style={styles.verifyBtn}>2. Check Start</button>
                    </div>
                  </div>
                ))}
                {botTasks.filter(t => !completedTasks.includes(t.id)).length === 0 && <p style={{textAlign:'center', color:'#94a3b8'}}>All Bot Missions Completed!</p>}
              </>
            )}

            {/* Reward Section (image_8.png style) */}
            {activeTab === 'reward' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ marginBottom: '20px' }}>Redeem Reward Code</h3>
                <input 
                  type="password"
                  style={styles.input} 
                  placeholder="ENTER CODE (YTTPO)" 
                  value={rewardInput}
                  onChange={(e) => setRewardInput(e.target.value)}
                />
                <button style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#eab308', border: 'none', fontWeight: '900', color: '#000', marginTop: '10px' }} onClick={handleClaimReward}>Claim Now</button>
              </div>
            )}

            {/* Order Placement Form (image_9.png style) */}
            {showPayForm && (
              <div>
                <h3 style={{ textAlign: 'center', color: '#eab308', marginBottom: '20px' }}>Order Placement</h3>
                <input style={styles.input} placeholder="Channel Username (e.g. @yourchannel)" />
                <input style={styles.input} placeholder="Link (e.g. https://t.me/...)" />
                
                <p style={{ fontWeight: '800', fontSize: '13px', marginBottom: '10px' }}>Select Members:</p>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  {[{m:100, p:0.2}, {m:200, p:0.4}, {m:300, p:0.5}].map((plan, i) => (
                    <div key={i} onClick={() => setSelectedPlan(plan.m)} style={styles.planBtn(selectedPlan === plan.m)}>
                      <div style={{ fontWeight: '900' }}>{plan.m}</div>
                      <div style={{ fontSize: '10px' }}>{plan.p} TON</div>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '16px', border: '1px solid #eab308', marginBottom: '15px' }}>
                  <small style={{ color: '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '5px' }}>ADMIN ADDRESS & MEMO (UID):</small>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <code style={{ fontSize: '11px', wordBreak: 'break-all', color: '#fff' }}>{adminWallet}</code>
                    <button onClick={() => copyToClipboard(adminWallet)} style={{ background: '#eab308', border: 'none', padding: '4px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '10px' }}>COPY</button>
                  </div>
                  <div style={{ height: '1px', background: '#334155', margin: '10px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b style={{ color: '#eab308', fontSize: '18px' }}>MEMO: {userUID}</b>
                    <button onClick={() => copyToClipboard(userUID)} style={{ background: '#eab308', border: 'none', padding: '4px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '10px' }}>COPY</button>
                  </div>
                </div>

                <button style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#eab308', border: 'none', fontWeight: '900', color: '#000', marginTop: '10px' }}>Confirm Payment</button>
                <button style={{ width: '100%', background: 'none', border: 'none', color: '#94a3b8', marginTop: '15px', fontWeight: 'bold' }} onClick={() => setShowPayForm(false)}>Back</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Other Nav Sections Placeholders based on your logic */}
      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{ textAlign: 'center', fontWeight: '900', color: '#eab308' }}>Withdraw TON</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" />
          <input style={styles.input} placeholder="TON Wallet Address" />
          <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: '15px', borderRadius: '15px', border: '1px solid #eab308', textAlign: 'center', marginBottom: '15px' }}>
            <span style={{ fontWeight: '900', color: '#eab308' }}>MEMO: {userUID}</span>
          </div>
          <button style={{ width: '100%', padding: '16px', borderRadius: '14px', backgroundColor: '#eab308', border: 'none', fontWeight: '900', color: '#000' }}>Withdraw Now</button>
        </div>
      )}

      {/* Footer Nav */}
      <div style={styles.footer}>
        {['Earn', 'Invite', 'Withdraw', 'Profile'].map(nav => (
          <div key={nav} onClick={() => {setActiveNav(nav.toLowerCase()); setShowPayForm(false);}} style={{ textAlign: 'center', flex: 1, cursor: 'pointer', transition: '0.3s' }}>
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>{nav === 'Earn' ? '💰' : nav === 'Invite' ? '👥' : nav === 'Withdraw' ? '💸' : '👤'}</div>
            <div style={{ fontSize: '10px', fontWeight: '900', color: activeNav === nav.toLowerCase() ? '#eab308' : '#94a3b8' }}>{nav.toUpperCase()}</div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;
