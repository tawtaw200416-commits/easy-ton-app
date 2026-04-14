import React, { useState, useEffect, useRef } from 'react';

// Telegram WebApp Object
const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_CHAT_ID: "5020977059"
};

function App() {
  // --- LocalStorage ကနေ အရင်ရှိပြီးသား Data ကို ဆွဲထုတ်မယ် (Reload လုပ်ရင် 0 မဖြစ်အောင်) ---
  const [balance, setBalance] = useState(() => {
    const savedBal = localStorage.getItem('ton_bal');
    return savedBal !== null ? Number(savedBal) : 0.0000;
  });
  
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referralList, setReferralList] = useState([]);
  const [customTasks, setCustomTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const isDataLoaded = useRef(false);

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('100');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // --- Data ပြောင်းတိုင်း LocalStorage မှာ သိမ်းမယ် ---
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
  }, [balance, completed, withdrawHistory]);

  // --- Firebase နဲ့ Data ချိတ်ဆက်ခြင်း ---
  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }

    const initApp = async () => {
      try {
        const [userRes, tasksRes] = await Promise.all([
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
          fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
        ]);
        const userData = await userRes.json();
        const tasksData = await tasksRes.json();

        if (userData) {
          // Firebase မှာ data ရှိနေရင် အဲ့ဒါကို ယူသုံးမယ်
          setBalance(Number(userData.balance));
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferralList(userData.referralList || []);
        } else {
          // User အသစ်ဆိုမှ Firebase မှာ စာရင်းအသစ်ဖွင့်မယ် (Balance ကို 0 ပြန်မချပါ)
          await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PUT',
            body: JSON.stringify({ balance: balance, completed: completed, withdrawHistory: [], referralList: [] })
          });
        }

        if (tasksData) {
          setCustomTasks(Object.keys(tasksData).map(key => ({ ...tasksData[key], id: key })));
        }
        
        isDataLoaded.current = true;
        setLoading(false);
      } catch (e) { setLoading(false); }
    };
    initApp();
  }, []);

  const syncToFirebase = (data) => {
    if (!isDataLoaded.current) return;
    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  const handleTaskAction = (id, link, reward = 0.0005) => {
    window.open(link, '_blank');
    const completeTask = () => {
      if (!completed.includes(id)) {
        const newBalance = Number((balance + reward).toFixed(5));
        const newCompleted = [...completed, id];
        setBalance(newBalance);
        setCompleted(newCompleted);
        syncToFirebase({ balance: newBalance, completed: newCompleted });
        alert(`Success! +${reward} TON Added.`);
      }
    };
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(completeTask).catch(() => setTimeout(completeTask, 5000));
    } else { setTimeout(completeTask, 5000); }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount >= 0.1 && amount <= balance) {
      const newBalance = Number((balance - amount).toFixed(5));
      const newHistory = [{ id: Date.now(), amount, status: 'Pending' }, ...withdrawHistory];
      setBalance(newBalance);
      setWithdrawHistory(newHistory);
      syncToFirebase({ balance: newBalance, withdrawHistory: newHistory });
      alert("Withdraw success! Pending approval.");
      setWithdrawAmount('');
    } else { alert("Insufficient Balance (Min 0.1)"); }
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif', color: '#000' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 100 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: '900' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    copyBox: { background: '#f1f5f9', padding: '12px', borderRadius: '12px', border: '1px dashed #000', marginBottom: '10px', fontSize: '11px' },
    planBtn: (active) => ({ flex: 1, padding: '10px', border: '2px solid #000', borderRadius: '10px', backgroundColor: active ? '#000' : '#fff', color: active ? '#fff' : '#000', fontSize: '10px', fontWeight: 'bold' }),
    warning: { background: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '15px', fontSize: '11px', marginTop: '10px', border: '1px solid #f87171' }
  };

  const botTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: `https://t.me/GrowTeaBot/app?startapp=${APP_CONFIG.MY_UID}` },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: `https://t.me/WorkersOnTonBot/app?startapp=r_${APP_CONFIG.MY_UID}` },
    { id: 'b4', name: "Easy Bonus Bot", link: `https://t.me/easybonuscode_bot?start=${APP_CONFIG.MY_UID}` },
    { id: 'b5', name: "Ton Dragon Bot", link: `https://t.me/TonDragonBot/myapp?startapp=${APP_CONFIG.MY_UID}` },
    { id: 'b6', name: "Pobuzz Bot", link: `https://t.me/Pobuzzbot/app?startapp=${APP_CONFIG.MY_UID}` },
    ...customTasks.filter(t => t.type === 'bot')
  ];

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>SYNCING DATA...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:18, color:'#facc15'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowAddPromo(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t ? '#000' : '#fff', color: activeTab === t ? '#fff' : '#000', fontWeight: '900' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && botTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.btn, width: '90px', padding: '10px'}}>START</button></div>
            ))}

            {activeTab === 'social' && !showAddPromo && (
              <>
                <button onClick={() => setShowAddPromo(true)} style={{...styles.btn, backgroundColor: '#facc15', color: '#000', marginBottom: '20px', border: '2px solid #000'}}>+ ADD TASK (PROMOTE)</button>
                {[
                  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
                  { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
                  { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" },
                  ...customTasks.filter(t => t.type === 'social')
                ].filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.btn, width: '90px', padding: '10px'}}>JOIN</button></div>
                ))}
              </>
            )}

            {showAddPromo && (
              <div>
                <h3 style={{marginTop:0}}>Promote Ad (Views)</h3>
                <input style={styles.input} placeholder="Channel Name" />
                <input style={styles.input} placeholder="Link (https://t.me/...)" />
                <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
                  {['100','200','300'].map(v => (
                    <button key={v} onClick={() => setSelectedPlan(v)} style={styles.planBtn(selectedPlan === v)}>{v} Views<br/>{v==='100'?'0.2':v==='200'?'0.4':'0.5'} TON</button>
                  ))}
                </div>
                <div style={styles.copyBox}><b>PAY TO WALLET:</b><br/>{APP_CONFIG.ADMIN_WALLET}</div>
                <div style={styles.copyBox}><b>MEMO (YOUR UID):</b><br/>{APP_CONFIG.MY_UID}</div>
                <button style={styles.btn} onClick={() => window.open("https://t.me/GrowTeaNews")}>SEND PROOF TO ADMIN</button>
                <button onClick={() => setShowAddPromo(false)} style={{...styles.btn, background:'none', color:'#000', marginTop:10}}>CANCEL</button>
              </div>
            )}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardInput} onChange={(e) => setRewardInput(e.target.value)} />
                <button style={styles.btn} onClick={() => { if(rewardInput==='EASY1'){ setBalance(p=>p+0.0005); alert("Claimed!"); setRewardInput(''); } else { alert("Invalid Code"); } }}>CLAIM</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>INVITE & EARN</h2>
          <div style={styles.copyBox}>
            <small>REFERRAL LINK:</small>
            <p style={{fontWeight:'bold'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!");}} style={styles.btn}>COPY LINK</button>
          </div>
          <div style={styles.row}><span>Total Friends:</span><strong>{referralList.length}</strong></div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAWAL</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.btn} onClick={handleWithdraw}>WITHDRAW NOW</button>
          <h4 style={{marginTop:20}}>HISTORY</h4>
          {withdrawHistory.map((h, i) => (
            <div key={i} style={styles.row}><span>{h.amount} TON</span><span style={{color:'orange'}}>Pending</span></div>
          ))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0, marginBottom:20}}>USER PROFILE</h2>
          <div style={styles.row}><span>UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Status:</span><b style={{color:'#10b981'}}>VERIFIED</b></div>
          <div style={styles.row}><span>Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
          <div style={styles.warning}>
            ⚠️ <b>WARNING:</b> Fake referrals or bot automation will lead to a <b>PERMANENT BAN</b>.
          </div>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navBtn(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
