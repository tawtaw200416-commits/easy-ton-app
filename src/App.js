import React, { useState, useEffect, useRef } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "http://t.me/EasyTonHelp_Bot" 
};

function App() {
  const [balance, setBalance] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const isDataLoaded = useRef(false);

  const [customTasks, setCustomTasks] = useState([]); 
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });
  const [promoForm, setPromoForm] = useState({ name: '', link: '', plan: '100 Views - 0.2 TON' });

  // Firebase Sync Function
  const syncToFirebase = (path, data) => {
    if (!isDataLoaded.current) return;
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    if (tg) {
        tg.HapticFeedback.notificationOccurred('success');
        tg.showAlert("Copied!");
    } else {
        alert("Copied!");
    }
  };

  useEffect(() => {
    // Adsgram Script ကို Dynamic ခေါ်ခြင်း
    const script = document.createElement('script');
    script.src = "https://adsgram.ai/js/adsgram.js";
    script.async = true;
    document.body.appendChild(script);

    if (tg) { tg.ready(); tg.expand(); }

    const initApp = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const refId = urlParams.get('tgWebAppStartParam');

        const [userRes, tasksRes] = await Promise.all([
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
          fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
        ]);

        const userData = await userRes.json();
        const tasksData = await tasksRes.json();

        // အဓိက ပြင်ဆင်ချက်- null မဟုတ်ရင် data အဟောင်းကိုပဲ သုံးမယ်
        if (userData !== null) {
          setBalance(Number(userData.balance) || 0);
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferrals(userData.referrals || []);
        } else {
          // User အသစ်ဆိုရင်မှ Database မှာ သွားဆောက်မယ်
          const newUser = { balance: 0, completed: [], referrals: [], withdrawHistory: [] };
          await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PUT',
            body: JSON.stringify(newUser)
          });

          // Referral စနစ်
          if (refId && refId !== APP_CONFIG.MY_UID) {
            const referrerRes = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${refId}.json`);
            const referrerData = await referrerRes.json();
            if (referrerData) {
              const newRefBal = Number(((referrerData.balance || 0) + 0.0005).toFixed(5));
              const newRefList = referrerData.referrals ? [...referrerData.referrals, APP_CONFIG.MY_UID] : [APP_CONFIG.MY_UID];
              await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${refId}.json`, {
                method: 'PATCH',
                body: JSON.stringify({ balance: newRefBal, referrals: newRefList })
              });
            }
          }
        }
        
        if (tasksData) setCustomTasks(Object.values(tasksData));
        isDataLoaded.current = true;
        setLoading(false);
      } catch (e) { 
        console.error(e);
        setLoading(false); 
      }
    };
    initApp();
  }, []);

  const handleTaskAction = (id, link, reward = 0.0005) => {
    window.open(link, '_blank');
    const completeTask = () => {
      if (!completed.includes(id)) {
        const newBalance = Number((balance + reward).toFixed(5));
        const newCompleted = [...completed, id];
        setBalance(newBalance);
        setCompleted(newCompleted);
        syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, completed: newCompleted });
        alert(`Success! +${reward} TON Added.`);
      }
    };

    // ကြော်ငြာတက်အောင် စောင့်ခြင်း
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(completeTask)
        .catch(() => setTimeout(completeTask, 5000));
    } else { 
      setTimeout(completeTask, 5000); 
    }
  };

  const handleWatchAds = () => {
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
      .then(() => {
        const newBalance = Number((balance + 0.0001).toFixed(5));
        setBalance(newBalance);
        syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance });
        alert("Ads Reward: +0.0001 TON Added!");
      })
      .catch(() => alert("Ads not ready. Please check internet."));
    } else { 
      alert("Ads provider is still loading..."); 
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 100 },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    promoBox: { backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '15px', border: '2px dashed #000', margin: '15px 0' },
    adsBox: { background: 'linear-gradient(to right, #000, #334155)', color: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '2px solid #fff' },
    copyItem: { display: 'flex', gap: '8px', alignItems: 'center', background: '#e2e8f0', padding: '10px', borderRadius: '10px', marginTop: '5px' },
    smallCopyBtn: { background: '#000', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '10px', fontWeight: 'bold' }
  };

  const botList = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" },
    ...customTasks.filter(t => t.type === 'bot')
  ];

  const socialList = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460", 
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO", 
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69", "@zrbtua", "@perviu1million"
  ].map((tag, i) => ({ id: `s_${i}`, name: tag, link: `https://t.me/${tag.replace('@','')}` }));

  const allSocial = [...socialList, ...customTasks.filter(t => t.type === 'social')];

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>SYNCING DATA...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981', fontWeight:'bold'}}>● VERIFIED USER</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold', fontSize: '10px' }}>{t}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && (
              <>
                <div style={styles.adsBox}>
                  <div><b>WATCH ADS</b><br/><small style={{color: '#facc15'}}>+0.0001 TON</small></div>
                  <button onClick={handleWatchAds} style={{...styles.btn, width: '80px', padding: '8px', background: '#facc15', color: '#000'}}>WATCH</button>
                </div>
                {/* လုပ်ပြီးသား ID ကို filter နဲ့ ဖြုတ်ပေးထားပါတယ် */}
                {botList.filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>START</button></div>
                ))}
              </>
            )}

            {activeTab === 'social' && (
              <>
                {!showAddPromo ? (
                  <>
                    <button style={{...styles.btn, background:'#facc15', color:'#000', border:'2px solid #000', marginBottom: 15}} onClick={() => setShowAddPromo(true)}>+ ADD TASK (PROMOTE)</button>
                    {allSocial.filter(t => !completed.includes(t.id)).map(t => (
                      <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>JOIN</button></div>
                    ))}
                  </>
                ) : (
                  <div>
                    <h3 style={{marginTop:0}}>PROMOTE YOUR CHANNEL</h3>
                    <input style={styles.input} placeholder="Channel Name" value={promoForm.name} onChange={e => setPromoForm({...promoForm, name: e.target.value})} />
                    <input style={styles.input} placeholder="Link" value={promoForm.link} onChange={e => setPromoForm({...promoForm, link: e.target.value})} />
                    <button style={{...styles.btn, background: '#10b981'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
                    <button style={{...styles.btn, background:'none', color:'#000', marginTop:10}} onClick={() => setShowAddPromo(false)}>BACK</button>
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Promo Code" value={rewardInput} onChange={(e) => setRewardInput(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                  if(rewardInput === 'EASY2' && !completed.includes('CODE_EASY2')) {
                     const newBal = Number((balance + 0.001).toFixed(5));
                     setBalance(newBal);
                     const newCompleted = [...completed, 'CODE_EASY2'];
                     setCompleted(newCompleted);
                     syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, completed: newCompleted });
                     alert("Success!"); setRewardInput('');
                  } else { alert("Invalid or Used!"); }
                }}>CLAIM</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>INVITE</h2>
          <div style={styles.promoBox}>
            <small>LINK:</small>
            <div style={styles.copyItem}>
                <span style={{fontSize:10, flex:1, wordBreak:'break-all'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</span>
                <button onClick={() => copyToClipboard(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`)} style={styles.smallCopyBtn}>COPY</button>
            </div>
          </div>
          <p>Total Invited: {referrals.length}</p>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAWAL</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.btn} onClick={() => alert("Insufficient balance.")}>WITHDRAW NOW</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>PROFILE</h2>
          <div style={styles.row}><span>UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
          <button style={{...styles.btn, background: '#facc15', color: '#000', marginTop: 20}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navItem(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
