import React, { useState, useEffect } from 'react';

// Telegram WebApp Object
const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_CHAT_ID: "5020977059",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODE: "EASY2",
  REWARD_AMT: 0.001
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem('refs')) || []);
  const [customTasks, setCustomTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardCode, setRewardCode] = useState('');
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [promoForm, setPromoForm] = useState({ name: '', link: '', package: '100 Views - 0.2 TON' });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });
  const [isAdLoading, setIsAdLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('refs', JSON.stringify(referrals));
  }, [balance, completed, withdrawHistory, referrals]);

  const syncToFirebase = (path, data) => {
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  const sendAdminNotify = (msg) => {
    fetch(`https://api.telegram.org/bot${APP_CONFIG.ADMIN_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: APP_CONFIG.ADMIN_CHAT_ID, text: msg })
    });
  };

  // Adsgram Controller Logic
  const runTaskWithAd = (callback) => {
    if (isAdLoading) return;

    // Adsgram က window.Adsgram ထဲမှာ ရှိမရှိ စစ်ဆေးခြင်း
    const Adsgram = window.Adsgram;

    if (Adsgram) {
      setIsAdLoading(true);
      const AdController = Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      
      AdController.show()
        .then((result) => { 
            setIsAdLoading(false); 
            if (result.done && callback) {
                callback(); 
            }
        })
        .catch((err) => { 
            setIsAdLoading(false); 
            console.error("Adsgram Error:", err);
            alert("ကြော်ငြာပြသရန် အဆင်မပြေပါ။ VPN ပိတ်ထားဖို့ လိုအပ်ပါတယ်။"); 
        });
    } else {
      alert("Adsgram SDK မတက်သေးပါ။ ခဏနေမှ ထပ်စမ်းကြည့်ပါ သို့မဟုတ် VPN ပိတ်ထားပါ။");
    }
  };

  const fetchGlobalTasks = async () => {
    try {
        const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`);
        const data = await res.json();
        if (data) setCustomTasks(Object.values(data));
    } catch(e) { console.error("Task Error:", e); }
  };

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    const initApp = async () => {
      try {
        const userRes = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
        const userData = await userRes.json();
        if (userData) {
          setBalance(Number(userData.balance || 0));
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferrals(userData.referrals || []);
        }
        await fetchGlobalTasks();
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    initApp();
  }, []);

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Task already completed!");
    runTaskWithAd(() => {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, completed: newComp });
      if (link) window.open(link, '_blank');
      alert(`အောင်မြင်ပါသည်! +${reward} TON ထည့်သွင်းပြီးပါပြီ။`);
    });
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: '-apple-system, sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 100 },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold', cursor:'pointer' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box', outline: 'none' }
  };

  const defaultBots = [
    { id: 'b_gt', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b_gm', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b_wt', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b_eb', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" }
  ];

  const defaultSocials = ["@GrowTeaNews", "@GoldenMinerNews", "@ADS_TON1", "@easytonfree", "@WORLDBESTCRYTO1"];
  const allBotTasks = [...defaultBots, ...customTasks.filter(t => t.type === 'bot')];
  const allSocialTasks = [...defaultSocials.map(name => ({id: name, name, link: `https://t.me/${name.replace('@','')}`})), ...customTasks.filter(t => t.type === 'social')];

  if (loading) return <div style={{display:'flex', height:'100vh', justifyContent:'center', alignItems:'center', background:'#facc15', fontWeight:'bold', letterSpacing:'2px'}}>LOADING...</div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15', fontWeight:'800' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981', fontWeight:'bold'}}>● SYSTEM ACTIVE</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.card}>
            <button onClick={() => runTaskWithAd(() => {
               const newBal = Number((balance + 0.0001).toFixed(5));
               setBalance(newBal);
               syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal });
               alert("Fast reward claimed! +0.0001 TON");
            })} style={{...styles.btn, backgroundColor:'#ef4444', boxShadow: '0 4px 0 #991b1b'}}>📺 WATCH VIDEO (FAST REWARD)</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold', fontSize: '10px' }}>{t}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && allBotTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, 0.0005, t.link)} style={{...styles.btn, width: '80px', padding: '8px', fontSize:'12px'}}>START</button></div>
            ))}
            {activeTab === 'social' && allSocialTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, 0.0005, t.link)} style={{...styles.btn, width: '80px', padding: '8px', fontSize:'12px'}}>JOIN</button></div>
            ))}
          </div>
        </>
      )}

      {/* Navigation Menu */}
      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navItem(activeNav === n)}>
            {n.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
