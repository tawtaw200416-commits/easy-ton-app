import React, { useState, useEffect } from 'react';

const APP_CONFIG = {
  ADS_BLOCK_ID: "27393",
  MY_UID: "1793453606"
};

function App() {
  // ✅ အသစ်စသုံးသူအတွက် 0.0000 ဖြစ်ရမည်၊ အဟောင်းဆိုလျှင် သိမ်းထားသည့် balance ပြမည်
  const [balance, setBalance] = useState(() => {
    const savedBal = localStorage.getItem('ton_bal');
    return savedBal !== null ? Number(savedBal) : 0.0000;
  });

  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [isClaimed, setIsClaimed] = useState(() => localStorage.getItem('gift_claimed') === 'true');
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [socialView, setSocialView] = useState('list');

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
  }, [balance, completed, isClaimed]);

  // ✅ Ads ကြည့်ပြီးမှ Reward (0.0005 + 10%) ပေးမည့် Logic
  const handleRewardLogic = (id) => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADS_BLOCK_ID });
      AdController.show().then(() => {
        const reward = 0.0005;
        const bonus = reward * 0.10; // 10% Extra commission
        setBalance(prev => Number((prev + reward + bonus).toFixed(5)));
        setCompleted(prev => [...prev, id]);
        alert("Success! 0.0005 TON and 10% Bonus added.");
      }).catch(() => alert("Ads failed. Please try again later."));
    } else {
      // Test Mode (SDK မရှိလျှင်)
      setBalance(prev => Number((prev + 0.0005).toFixed(5)));
      setCompleted(prev => [...prev, id]);
    }
  };

  const handleTaskClick = (id, link) => {
    window.open(link, '_blank');
    const btn = document.getElementById(`btn-${id}`);
    if (btn) {
      btn.innerText = "VERIFY TASK";
      btn.style.backgroundColor = "#50C878"; // ပုံထဲကအတိုင်း အစိမ်းရောင်
      btn.onclick = () => handleRewardLogic(id);
    }
  };

  const styles = {
    main: { backgroundColor: '#0A0F1E', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'Arial, sans-serif' },
    balanceCard: { border: '1px solid #fbbf24', borderRadius: '20px', padding: '25px', textAlign: 'center', marginBottom: '20px' },
    tabGroup: { display: 'flex', gap: '10px', marginBottom: '20px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: active ? '#fbbf24' : '#1e293b', color: active ? '#000' : '#fff', fontWeight: 'bold' }),
    taskCard: { backgroundColor: '#1e293b', borderRadius: '15px', padding: '15px', marginBottom: '12px' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', padding: '10px 0', borderTop: '1px solid #334155' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', fontSize: '12px' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', marginBottom: '10px', boxSizing: 'border-box' }
  };

  return (
    <div style={styles.main}>
      {/* Total Balance (ပုံထဲကအတိုင်း) */}
      <div style={styles.balanceCard}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', fontSize: '32px' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.tabGroup}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={styles.tabBtn(activeTab === t)}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'bot' && (
            [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" },
              { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot" },
              { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot" }
            ].map(b => (
              <div key={b.id} style={styles.taskCard}>
                <p style={{ fontWeight: 'bold' }}>{b.name}</p>
                <button id={`btn-${b.id}`} onClick={() => handleTaskClick(b.id, b.link)} style={styles.yellowBtn}>
                  {completed.includes(b.id) ? "COMPLETED ✅" : "START BOT"}
                </button>
              </div>
            ))
          )}

          {activeTab === 'social' && socialView === 'list' && (
            <>
              <button style={{ ...styles.yellowBtn, marginBottom: '15px' }} onClick={() => setSocialView('add')}>+ ADD TASK (PROMOTE CHANNEL)</button>
              <div style={styles.taskCard}>
                {[
                  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
                  { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
                  { id: 's3', name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" }
                ].map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #334155' }}>
                    <span style={{fontSize: '14px'}}>{s.name}</span>
                    <button id={`btn-${s.id}`} onClick={() => handleTaskClick(s.id, s.link)} style={{ ...styles.yellowBtn, width: '100px', marginTop: 0 }}>
                       {completed.includes(s.id) ? "DONE" : "JOIN"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'social' && socialView === 'add' && (
            <div style={styles.taskCard}>
              <h3>Add New Task</h3>
              <input style={styles.input} placeholder="Channel Name" />
              <input style={styles.input} placeholder="Invite Link" />
              <select style={styles.input}>
                <option>100 Views - 0.2 TON</option>
                <option>200 Views - 0.4 TON</option>
                <option>400 Views - 0.5 TON</option>
              </select>
              <button style={styles.yellowBtn} onClick={() => setSocialView('list')}>CONFIRM PAYMENT</button>
              <p onClick={() => setSocialView('list')} style={{textAlign:'center', marginTop:'10px', fontSize:'14px'}}>Back</p>
            </div>
          )}

          {activeTab === 'reward' && (
            <div style={styles.taskCard}>
              <h3 style={{marginTop: 0}}>DAILY GIFT CODE</h3>
              <input id="giftInput" style={styles.input} placeholder="Enter GIFT77" />
              <button onClick={() => {
                const val = document.getElementById('giftInput').value;
                if(val === "GIFT77" && !isClaimed) {
                  setBalance(b => b + 0.01);
                  setIsClaimed(true);
                  alert("Claimed 0.01 TON!");
                } else { alert("Invalid or already claimed"); }
              }} style={styles.yellowBtn}>CLAIM</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={{textAlign:'center'}}>
          <div style={styles.taskCard}>
            <h3>INVITE FRIENDS</h3>
            <p style={{fontSize:'13px', color:'#fbbf24'}}>Get 0.0005 TON + 10% commission per invite!</p>
            <button style={styles.yellowBtn}>COPY LINK</button>
          </div>
          <h4 style={{textAlign:'left'}}>INVITATION HISTORY</h4>
          <div style={styles.taskCard}>
             <div style={{display:'flex', justifyContent:'space-between', color:'#94a3b8', fontSize:'12px'}}>
                <span>UID</span><span>Status</span><span>Reward</span>
             </div>
             <div style={{display:'flex', justifyContent:'space-between', marginTop:'10px', fontSize:'13px'}}>
                <span>189455...</span><span style={{color:'#10b981'}}>Completed</span><span>0.0005 TON</span>
             </div>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div>
          <div style={styles.taskCard}>
            <h3>WITHDRAWAL</h3>
            <input style={styles.input} placeholder="Amount (Min 0.1)" />
            <input style={styles.input} placeholder="TON Wallet Address" />
            <button style={styles.yellowBtn}>WITHDRAW NOW</button>
          </div>
          <h4>WITHDRAWAL HISTORY</h4>
          <div style={{...styles.taskCard, textAlign:'center', color:'#94a3b8'}}>No records</div>
        </div>
      )}

      {/* ✅ Footer Navigation (ပုံထဲကအတိုင်း) */}
      <div style={styles.navBar}>
        <div onClick={() => setActiveNav('earn')} style={styles.navBtn(activeNav === 'earn')}>
          <div style={{fontSize:'20px'}}>💰</div>EARN
        </div>
        <div onClick={() => setActiveNav('invite')} style={styles.navBtn(activeNav === 'invite')}>
          <div style={{fontSize:'20px'}}>👥</div>INVITE
        </div>
        <div onClick={() => setActiveNav('withdraw')} style={styles.navBtn(activeNav === 'withdraw')}>
          <div style={{fontSize:'20px'}}>💸</div>WITHDRAW
        </div>
        <div onClick={() => setActiveNav('profile')} style={styles.navBtn(activeNav === 'profile')}>
          <div style={{fontSize:'20px'}}>👤</div>PROFILE
        </div>
      </div>
    </div>
  );
}

export default App;
