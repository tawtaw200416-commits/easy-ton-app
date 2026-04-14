import React, { useState, useEffect } from 'react';

// Telegram WebApp Object
const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com" 
};

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referralCount, setReferralCount] = useState(0);
  const [referralList, setReferralList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [customTasks, setCustomTasks] = useState([]); 
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTask, setShowAddTask] = useState(false);
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const syncToFirebase = (path, data) => {
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    const initApp = async () => {
      try {
        const [userRes, tasksRes] = await Promise.all([
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
          fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
        ]);
        
        const userData = await userRes.json();
        const tasksData = await tasksRes.json();

        if (userData) {
          setBalance(Number(userData.balance) || 0);
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferralCount(userData.referralCount || 0);
          setReferralList(userData.referralList || []);
          
          // --- Referral Logic Check ---
          // Bot ကနေတစ်ဆင့် start parameter ပါလာခဲ့ရင် (လူသစ်ဖြစ်ခဲ့ရင်)
          const urlParams = new URLSearchParams(window.location.search);
          const referrerId = urlParams.get('tgWebAppStartParam');
          
          if (referrerId && !userData.joinedViaReferral) {
            handleReferralReward(referrerId);
          }
        }
        if (tasksData) {
          setCustomTasks(Object.values(tasksData));
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    initApp();
  }, []);

  const handleReferralReward = async (refId) => {
    try {
      // ၁။ Referrer (ဖိတ်ခေါ်တဲ့သူ) ရဲ့ Data ကို ယူမယ်
      const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${refId}.json`);
      const refData = await res.json();

      if (refData) {
        const newRefBalance = Number((refData.balance + 0.0005).toFixed(5));
        const newRefList = [...(refData.referralList || []), { uid: APP_CONFIG.MY_UID, date: Date.now() }];
        const newRefCount = (refData.referralCount || 0) + 1;

        // Referrer ဆီကို Reward ပို့မယ်
        await syncToFirebase(`users/${refId}`, {
          balance: newRefBalance,
          referralList: newRefList,
          referralCount: newRefCount
        });

        // ကိုယ့်ကိုယ်ကိုလည်း Referral သုံးထားတယ်လို့ မှတ်သားမယ် (တစ်ကြိမ်ပဲရအောင်)
        await syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { joinedViaReferral: true });
      }
    } catch (e) { console.error("Referral Error:", e); }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => alert(`${label} Copied!`));
  };

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    const completeTask = () => {
      if (!completed.includes(id)) {
        const newBalance = Number((balance + 0.0005).toFixed(5));
        const newCompleted = [...completed, id];
        setBalance(newBalance);
        setCompleted(newCompleted);
        syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, completed: newCompleted });
        alert("Reward Received! +0.0005 TON");
      }
    };
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show().then(completeTask).catch(() => setTimeout(completeTask, 5000));
    } else { setTimeout(completeTask, 5000); }
  };

  // UI Styles (ထိန်းသိမ်းထားသည်)
  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    headerCard: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 1000 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: '900' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    copyBox: { background: '#f1f5f9', padding: '12px', borderRadius: '12px', border: '1px dashed #000', marginBottom: '10px', position: 'relative' },
    copyBtn: { position: 'absolute', right: '10px', top: '10px', padding: '5px 10px', fontSize: '10px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '5px' },
    planBtn: (active) => ({ flex: 1, padding: '10px', border: '2px solid #000', borderRadius: '10px', backgroundColor: active ? '#000' : '#fff', color: active ? '#fff' : '#000', fontSize: '10px', fontWeight: 'bold' }),
    badge: { background: '#10b981', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' },
    warning: { background: '#fff1f2', color: '#e11d48', padding: '15px', borderRadius: '15px', border: '1px solid #f43f5e', fontSize: '11px', marginTop: '10px' }
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>SYNCING DATA...</b></div>;

  return (
    <div style={styles.main}>
      {/* Header */}
      <div style={styles.headerCard}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:'18px', color: '#facc15'}}>TON</span></h1>
        <div style={{display:'flex', justifyContent:'center'}}><span style={styles.badge}>● ACCOUNT ACTIVE</span></div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['BOTS', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => {setActiveTab(t.toLowerCase()); setShowAddTask(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: '900', fontSize: '10px' }}>{t}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && (
              <>
              {[
                { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=" + APP_CONFIG.MY_UID },
                { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
                { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_" + APP_CONFIG.MY_UID },
                { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=" + APP_CONFIG.MY_UID },
                { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=" + APP_CONFIG.MY_UID },
                { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=" + APP_CONFIG.MY_UID }
              ].concat(customTasks.filter(t => t.type === 'bot')).filter(t => !completed.includes(t.id)).map(t => (
                <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>START</button></div>
              ))}
              </>
            )}

            {activeTab === 'social' && !showAddTask && (
              <>
                <button onClick={() => setShowAddTask(true)} style={{...styles.yellowBtn, backgroundColor: '#facc15', color: '#000', marginBottom: '20px', border: '2px solid #000'}}>+ ADD TASK (PROMOTE)</button>
                {[
                  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
                  { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
                  { id: 's3', name: "@cryptogold_online", link: "https://t.me/cryptogold_online_official" },
                  { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
                  { id: 's5', name: "@USDTcloudminer", link: "https://t.me/USDTcloudminer_channel" },
                  { id: 's6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
                  { id: 's7', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
                  { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
                  { id: 's9', name: "@kombo_crypta", link: "https://t.me/kombo_crypta" },
                  { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" },
                  { id: 's11', name: "@ton_news_daily", link: "https://t.me/ton_news_daily" },
                  { id: 's12', name: "@crypto_king_mm", link: "https://t.me/crypto_king_mm" },
                  { id: 's13', name: "@earn_with_ton", link: "https://t.me/earn_with_ton" },
                  { id: 's14', name: "@ton_reward_center", link: "https://t.me/ton_reward_center" }
                ].concat(customTasks.filter(t => t.type === 'social')).filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>JOIN</button></div>
                ))}
              </>
            )}
            
            {/* ShowAddTask, Reward, Admin Sections remain same... */}
            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <h3 style={{marginTop:0, textAlign: 'center'}}>ADD NEW TASK</h3>
                <input style={styles.input} placeholder="Task Name" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link (https://...)" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
                <select style={{...styles.input, appearance: 'none', background: '#fff'}} value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})}>
                  <option value="bot">BOT TASK</option>
                  <option value="social">SOCIAL TASK</option>
                </select>
                <button style={styles.yellowBtn} onClick={() => {
                  if (!newTask.name || !newTask.link) return alert("Fill all fields");
                  const id = 'task_' + Date.now();
                  fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${id}.json`, { method: 'PUT', body: JSON.stringify({...newTask, id}) }).then(() => { alert("Saved!"); window.location.reload(); });
                }}>SAVE TO DATABASE</button>
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
            <p style={{fontSize:11, fontWeight:'bold'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`, "Link")} style={styles.yellowBtn}>COPY LINK</button>
          </div>
          <div style={{marginTop:20}}>
            <h4>Invited History ({referralCount})</h4>
            {referralList.length > 0 ? [...referralList].reverse().map((ref, i) => (
              <div key={i} style={styles.row}>
                <span>User ID: {ref.uid}</span>
                <span style={{color:'#10b981', fontWeight:'bold'}}>+0.0005 TON</span>
              </div>
            )) : <small style={{color:'#666'}}>No referrals yet. Share link to earn!</small>}
          </div>
        </div>
      )}

      {/* Withdraw & Profile remain same... */}
      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW TON</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.yellowBtn} onClick={() => {
            const amt = parseFloat(withdrawAmount);
            if(amt >= 0.1 && amt <= balance) {
              const nb = Number((balance - amt).toFixed(5));
              const nh = [{ id: Date.now(), amount: amt, status: 'Pending' }, ...withdrawHistory];
              setBalance(nb); setWithdrawHistory(nh);
              syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: nb, withdrawHistory: nh });
              alert("Requested!"); setWithdrawAmount('');
            } else { alert("Error"); }
          }}>WITHDRAW NOW</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0, marginBottom:15}}>USER PROFILE</h2>
          <div style={styles.row}><span>Status:</span><span style={styles.badge}>VERIFIED</span></div>
          <div style={styles.row}><span>UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
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
