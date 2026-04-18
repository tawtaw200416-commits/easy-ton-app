import React, { useState, useEffect } from 'react';

// Telegram WebApp Object
const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "Guest_ID",
  ADSGRAM_BLOCK_ID: "27633", 
  TASK_REWARD: 0.001,       // 0.001 TON သို့ တိုးမြှင့်ထားသည်
  VIDEO_REWARD: 0.0005,
  CODE_REWARD_AMOUNT: 0.001,
  REWARD_CODE: "EASY3"
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referralCount, setReferralCount] = useState(() => Number(localStorage.getItem('ref_count')) || 0);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showAddTask, setShowAddTask] = useState(false);
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isAdLoading, setIsAdLoading] = useState(false);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('ref_count', referralCount.toString());
  }, [balance, completed, withdrawHistory, referralCount]);

  // --- Universal Ads Function ---
  const handleActionWithAds = (reward, taskId = null, link = null) => {
    if (isAdLoading) return;

    if (window.Adsgram) {
      setIsAdLoading(true);
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      
      AdController.show()
        .then(() => {
          setIsAdLoading(false);
          setBalance(prev => Number((prev + reward).toFixed(5)));
          if (taskId) setCompleted(prev => [...prev, taskId]);
          if (link) window.open(link, '_blank');
          alert(`Success! +${reward} TON Received.`);
        })
        .catch((err) => {
          setIsAdLoading(false);
          alert("Ad failed or skipped. No reward added.");
        });
    } else {
      alert("Adsgram not loaded. Please check your internet.");
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => alert(`${label} Copied!`));
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    balanceCard: { background: 'linear-gradient(135deg, #000, #1e293b)', padding: '30px', borderRadius: '25px', textAlign: 'center', marginBottom: '20px', border: '4px solid #fff', color: '#fff' },
    videoBtn: { background: '#ef4444', color: '#fff', width: '100%', padding: '18px', borderRadius: '15px', border: '3px solid #000', fontWeight: 'bold', fontSize: '16px', marginBottom: '15px', cursor: 'pointer' },
    tabRow: { display: 'flex', gap: '5px', marginBottom: '15px' },
    tabBtn: (active) => ({ flex: 1, padding: '10px', background: active ? '#000' : '#fff', color: active ? '#fff' : '#000', border: '2px solid #000', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }),
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '25px', marginBottom: '12px', border: '3px solid #000' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 1000 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: '900' })
  };

  return (
    <div style={styles.main}>
      {/* 1. Balance Header */}
      <div style={styles.balanceCard}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ fontSize: '45px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:'18px'}}>TON</span></h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></div>
          <small style={{ color: '#22c55e' }}>ACTIVE STATUS</small>
        </div>
      </div>

      {/* 2. Watch Video Section */}
      <button style={styles.videoBtn} onClick={() => handleActionWithAds(APP_CONFIG.VIDEO_REWARD)}>
        📺 WATCH VIDEO (+{APP_CONFIG.VIDEO_REWARD} TON)
      </button>

      {/* 3. Earn Section with Tabs */}
      {activeNav === 'earn' && (
        <>
          <div style={styles.tabRow}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowAddTask(false);}} style={styles.tabBtn(activeTab === t)}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={styles.card}>
            <button onClick={() => setShowAddTask(!showAddTask)} style={{...styles.yellowBtn, backgroundColor: '#facc15', color: '#000', marginBottom: '15px', border: '2px solid #000'}}>
              {showAddTask ? "CLOSE ADD TASK" : "+ ADD TASK (PROMOTE)"}
            </button>

            {showAddTask ? (
              <div>
                <input style={styles.input} placeholder="Channel Name" />
                <input style={styles.input} placeholder="Channel Link" />
                <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
                  {['100','200','300'].map(v => (
                    <button key={v} onClick={() => setSelectedPlan(v)} style={{...styles.tabBtn(selectedPlan === v), fontSize: '10px'}}>{v} Views<br/>{v==='100'?'0.2':v==='200'?'0.4':'0.5'} TON</button>
                  ))}
                </div>
                <div style={{background:'#f1f5f9', padding:'10px', borderRadius:'10px', fontSize:'10px', border:'1px dashed #000', marginBottom:'10px'}}>
                   <b>ADMIN WALLET:</b><br/>{APP_CONFIG.ADMIN_WALLET}<br/>
                   <button onClick={() => handleCopy(APP_CONFIG.ADMIN_WALLET, "Wallet")}>COPY</button>
                </div>
                <button style={styles.yellowBtn} onClick={() => window.open("https://t.me/GrowTeaNews")}>SEND PROOF</button>
              </div>
            ) : (
              <>
                {activeTab === 'bot' && [
                  { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=" + APP_CONFIG.MY_UID },
                  { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot" },
                  { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot" }
                ].filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleActionWithAds(APP_CONFIG.TASK_REWARD, t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>START</button></div>
                ))}

                {activeTab === 'social' && [
                  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
                  { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
                  { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
                ].filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleActionWithAds(APP_CONFIG.TASK_REWARD, t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>JOIN</button></div>
                ))}

                {activeTab === 'reward' && (
                  <div>
                    <input style={styles.input} placeholder="Enter EASY3 Code" value={rewardInput} onChange={(e) => setRewardInput(e.target.value)} />
                    <button style={styles.yellowBtn} onClick={() => { 
                      if(rewardInput === APP_CONFIG.REWARD_CODE) handleActionWithAds(APP_CONFIG.CODE_REWARD_AMOUNT, 'code_claimed');
                      else alert("Invalid Code!");
                    }}>CLAIM CODE</button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Invite/Withdraw/Profile Sections - (Bro's existing logic preserved) */}
      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>INVITE & EARN</h2>
          <div style={{background:'#f1f5f9', padding:'15px', borderRadius:'15px', border:'1px dashed #000'}}>
            <small>REFERRAL LINK:</small>
            <p style={{fontSize:12, fontWeight:'bold', wordBreak:'break-all'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`, "Link")} style={styles.yellowBtn}>COPY LINK</button>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.yellowBtn} onClick={() => alert("Withdraw processing...")}>WITHDRAW NOW</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>PROFILE</h3>
          <p>UID: {APP_CONFIG.MY_UID}</p>
          <p>Balance: {balance.toFixed(5)} TON</p>
        </div>
      )}

      {/* 4. Bottom Navigation */}
      <div style={styles.navBar}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navBtn(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
