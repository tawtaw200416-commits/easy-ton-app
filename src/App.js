import React, { useState, useEffect } from 'react';

// Telegram WebApp Object
const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "http://t.me/EasyTonHelp_Bot",
  ADMIN_BOT_TOKEN: "8181403217:AAG6j7tS7Ue_qR-l7I1B7H0i9m_P3ZzS7f4", // စာပို့ရန် Token
  ADMIN_CHAT_ID: "5020977059"
};

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]); // Invite History အတွက်
  const [loading, setLoading] = useState(true);
  
  const [customTasks, setCustomTasks] = useState([]); 
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTask, setShowAddTask] = useState(false);
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  // --- Firebase Sync ---
  const syncToFirebase = (path, data) => {
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  // Admin ဆီ စာပို့ပေးတဲ့ Function
  const notifyAdmin = (msg) => {
    fetch(`https://api.telegram.org/bot${APP_CONFIG.ADMIN_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: APP_CONFIG.ADMIN_CHAT_ID, text: msg })
    });
  };

  // --- Initial Data Load ---
  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }

    const loadData = async () => {
      try {
        const [userRes, tasksRes] = await Promise.all([
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
          fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
        ]);
        
        const userData = await userRes.json();
        const tasksData = await tasksRes.json();

        if (userData) {
          setBalance(userData.balance || 0);
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferrals(userData.referrals || []);
        } else {
          await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PUT',
            body: JSON.stringify({ balance: 0, completed: [], withdrawHistory: [], referrals: [] })
          });
        }

        if (tasksData) setCustomTasks(Object.values(tasksData));
        setLoading(false);
      } catch (e) { setLoading(false); }
    };
    loadData();
  }, []);

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount >= 0.1 && amount <= balance) {
      const newBalance = Number((balance - amount).toFixed(5));
      const requestTime = Date.now();
      const newHistory = [{ id: requestTime, amount, status: 'Pending', time: requestTime }, ...withdrawHistory];
      
      setBalance(newBalance);
      setWithdrawHistory(newHistory);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, withdrawHistory: newHistory });
      
      notifyAdmin(`🚨 New Withdrawal Request!\nUID: ${APP_CONFIG.MY_UID}\nAmount: ${amount} TON`);
      alert("Withdraw success! Your TON has been deducted. Pending for approval.");
      setWithdrawAmount('');
    } else { alert("Insufficient Balance (Min 0.1)"); }
  };

  const handleWatchAds = () => {
    const rewardUser = () => {
      const newBalance = Number((balance + 0.0001).toFixed(5));
      setBalance(newBalance);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance });
      alert("Reward Received! +0.0001 TON");
    };

    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(rewardUser).catch(() => setTimeout(rewardUser, 3000));
    } else {
      setTimeout(rewardUser, 3000);
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    headerCard: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 1000 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: '900' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    copyBox: { background: '#f1f5f9', padding: '12px', borderRadius: '12px', border: '1px dashed #000', marginBottom: '10px' },
    adsBox: { background: '#000', color: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '2px solid #fff' }
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>SYNCING DATA...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.headerCard}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:'18px', color: '#facc15'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['bot', 'social', 'reward', 'admin'].map(t => (
              (t !== 'admin' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => {setActiveTab(t); setShowAddTask(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t ? '#000' : '#fff', color: activeTab === t ? '#fff' : '#000', fontWeight: '900', fontSize: '10px' }}>{t.toUpperCase()}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && (
              <>
                {/* Watch Ads Section */}
                <div style={styles.adsBox}>
                  <div><b>Watch Video Ads</b><br/><small style={{color: '#facc15'}}>Reward: 0.0001 TON</small></div>
                  <button onClick={handleWatchAds} style={{...styles.yellowBtn, width: '100px', background: '#facc15', color: '#000', padding: '10px'}}>WATCH</button>
                </div>

                {[
                  { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=" + APP_CONFIG.MY_UID },
                  { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
                  { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_" + APP_CONFIG.MY_UID },
                  { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=" + APP_CONFIG.MY_UID },
                  { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=" + APP_CONFIG.MY_UID }
                ].concat(customTasks.filter(t => t.type === 'bot'))
                 .filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => window.open(t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>START</button></div>
                ))}
              </>
            )}
            
            {/* Social, Admin, Reward tabs coding... အဟောင်းအတိုင်းရှိနေပါမည် */}
            {activeTab === 'social' && !showAddTask && (
                <>
                <button onClick={() => setShowAddTask(true)} style={{...styles.yellowBtn, backgroundColor: '#facc15', color: '#000', marginBottom: '20px', border: '2px solid #000'}}>+ ADD TASK (PROMOTE)</button>
                {[
                  { id: 's1', name: "@easytonfree", link: "https://t.me/easytonfree" },
                  { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" }
                ].concat(customTasks.filter(t => t.type === 'social'))
                 .filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => window.open(t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>JOIN</button></div>
                ))}
                </>
            )}

            {showAddTask && (
                <div>
                <h3 style={{marginTop:0}}>Promote Ad (Views)</h3>
                <input style={styles.input} placeholder="Channel Name" />
                <input style={styles.input} placeholder="Channel Link" />
                <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
                  {['100','200','300'].map(v => (
                    <button key={v} onClick={() => setSelectedPlan(v)} style={styles.planBtn(selectedPlan === v)}>{v} Views<br/>{v==='100'?'0.2':v==='200'?'0.4':'0.5'} TON</button>
                  ))}
                </div>
                <div style={styles.copyBox}>
                  <small>ADMIN WALLET:</small>
                  <p style={{fontSize:10, fontWeight:'bold', wordBreak:'break-all'}}>{APP_CONFIG.ADMIN_WALLET}</p>
                </div>
                <button style={styles.yellowBtn} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONFIRM & SEND PROOF</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>INVITE & EARN</h2>
          <p style={{fontSize: '13px', textAlign: 'center', margin: '10px 0'}}>
             Invite your friends and earn <b>0.0005 TON</b> per referral!<br/>
             You also get <b>10% commission</b> from their earnings.
          </p>
          <div style={styles.copyBox}>
            <small>YOUR REFERRAL LINK:</small>
            <p style={{fontSize:12, fontWeight:'bold'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Link Copied!"); }} style={styles.yellowBtn}>COPY LINK</button>
          </div>
          
          <div style={{marginTop: 20}}>
              <h4 style={{borderBottom: '2px solid #000', paddingBottom: '5px'}}>INVITE HISTORY</h4>
              {referrals.length === 0 ? <small>No one invited yet.</small> : (
                  <>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom: 10}}>
                      <span>Total Invited:</span><strong>{referrals.length} Users</strong>
                  </div>
                  {referrals.map((refId, index) => (
                      <div key={index} style={styles.row}>
                          <span>User UID: {refId}</span>
                          <span style={{color: '#10b981', fontWeight: 'bold'}}>+0.0005 TON</span>
                      </div>
                  ))}
                  </>
              )}
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.yellowBtn} onClick={handleWithdraw}>WITHDRAW NOW</button>
          
          <h4 style={{marginTop:20}}>HISTORY</h4>
          {withdrawHistory.length === 0 ? <small>No history yet.</small> : withdrawHistory.map((h, i) => {
            // ၂၄ နာရီကျော်ရင် Success ပြပေးမယ့် Logic
            const isSuccess = (Date.now() - h.time) > 86400000;
            return (
              <div key={i} style={styles.row}>
                <span>{h.amount} TON</span>
                <span style={{color: isSuccess ? '#10b981' : 'orange', fontWeight: 'bold'}}>
                    {isSuccess ? 'Success' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0, marginBottom:20}}>USER PROFILE</h2>
          <div style={styles.row}><span>UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
          <button style={styles.yellowBtn} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
        </div>
      )}

      <div style={styles.navBar}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navBtn(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
