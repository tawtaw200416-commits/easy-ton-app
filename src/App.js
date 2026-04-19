import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODE: "EASY3",
  MIN_WITHDRAW: 0.1,
  REF_REWARD: 0.001,
  TASK_REWARD: 0.001
};

function App() {
  // LocalStorage ကနေ အရင်ယူမယ်၊ မရှိမှ default value သုံးမယ်
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem('refs')) || []);
  const [customTasks, setCustomTasks] = useState([]);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardCode, setRewardCode] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [adminTask, setAdminTask] = useState({ name: '', link: '', type: 'bot' });
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [channelInput, setChannelInput] = useState('');

  // Data ပျက်မသွားအောင် Local Storage မှာ အမြဲ save မယ်
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('refs', JSON.stringify(referrals));
  }, [balance, completed, withdrawHistory, referrals]);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, tasksRes] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
      ]);
      const userData = await userRes.json();
      const tasksData = await tasksRes.json();
      
      if (userData) {
        // Firebase က data ရှိမှ state ကို update လုပ်မယ် (ပျက်မသွားအောင်)
        setBalance(prev => userData.balance !== undefined ? Number(userData.balance) : prev);
        setCompleted(prev => userData.completed || prev);
        setWithdrawHistory(prev => userData.withdrawHistory || prev);
        setReferrals(prev => userData.referrals || prev);
      }
      
      if (tasksData) {
        setCustomTasks(Object.keys(tasksData).map(key => ({ ...tasksData[key], fbKey: key })));
      }
    } catch (e) { console.error("Sync Error:", e); }
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
  }, [fetchData]);

  const runWithAd = (onSuccess) => {
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(() => onSuccess())
        .catch(() => alert("Ad အဆုံးထိကြည့်မှ reward ရပါမယ်!"));
    } else { onSuccess(); }
  };

  const handleTaskReward = (id, reward, rawLink) => {
    if (completed.includes(id)) return;
    
    runWithAd(() => {
      // Link Format ပြုပြင်ခြင်း
      let finalLink = rawLink;
      if (rawLink.startsWith('@')) {
        finalLink = `https://t.me/${rawLink.substring(1)}`;
      }

      // Link အရင်ဖွင့်ပေးမယ်
      if (tg) {
        tg.openTelegramLink(finalLink);
      } else {
        window.open(finalLink, '_blank');
      }

      // ၅ စက္ကန့်ကြာမှ Reward ပေါင်းပေးမယ်
      setTimeout(() => {
        const newBal = Number((balance + reward).toFixed(5));
        const newComp = [...completed, id];
        setBalance(newBal);
        setCompleted(newComp);
        
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ balance: newBal, completed: newComp })
        });
        alert(`Joined! Success: +${reward} TON`);
      }, 5000);
    });
  };

  const botTasks = [
    { id: 'bot_1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'bot_2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'bot_3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'bot_4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'bot_5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'bot_6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" },
    ...customTasks.filter(t => t.type === 'bot')
  ];

  const socialTasks = [
    { id: 'soc_1', name: "Grow Tea News", link: "@GrowTeaNews" },
    { id: 'soc_2', name: "Golden Miner News", link: "@GoldenMinerNews" },
    { id: 'soc_3', name: "Official Crypto Gold", link: "@cryptogold_online_official" },
    { id: 'soc_4', name: "M9460 News", link: "@M9460" },
    { id: 'soc_5', name: "USDT Cloud Miner", link: "@USDTcloudminer_channel" },
    { id: 'soc_6', name: "ADS TON Channel", link: "@ADS_TON1" },
    { id: 'soc_7', name: "Goblin Crypto", link: "@goblincrypto" },
    { id: 'soc_8', name: "World Best Crypto", link: "@WORLDBESTCRYTO" },
    { id: 'soc_9', name: "Kombo Crypta", link: "@kombo_crypta" },
    { id: 'soc_10', name: "Easy TON Free", link: "@easytonfree" },
    { id: 'soc_11', name: "World Best Crypto 1", link: "@WORLDBESTCRYTO1" },
    { id: 'soc_12', name: "Money Hub 9", link: "@MONEYHUB9_69" },
    { id: 'soc_13', name: "ZRBTUA Official", link: "@zrbtua" },
    { id: 'soc_14', name: "Perviu 1 Million", link: "@perviu1million" },
    ...customTasks.filter(t => t.type === 'social')
  ];

  // --- Styles ---
  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 100 },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15', letterSpacing: '1px' }}>YOUR BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981', fontWeight:'bold'}}>● SYSTEM ACTIVE</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} 
                  onClick={() => runWithAd(() => setActiveTab(t.toLowerCase()))} 
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight:'bold', border:'2px solid #000'}}>
                  {t}
                </button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && botTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, APP_CONFIG.TASK_REWARD, t.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>START</button></div>
            ))}
            
            {activeTab === 'social' && socialTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, APP_CONFIG.TASK_REWARD, t.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>JOIN</button></div>
            ))}

            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Promo Code" value={rewardCode} onChange={e => setRewardCode(e.target.value)} />
                <button style={styles.btn} onClick={() => runWithAd(() => {
                  if(rewardCode.toUpperCase() === APP_CONFIG.REWARD_CODE) {
                    handleTaskReward('code_'+APP_CONFIG.REWARD_CODE, 0.001, APP_CONFIG.HELP_BOT);
                  } else { alert('Invalid Code!'); }
                })}>CLAIM</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* --- Other Navigation logic continues here --- */}
      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Invite Friends</h3>
          <p>Get <b>{APP_CONFIG.REF_REWARD} TON</b> per friend.</p>
          <button style={styles.btn} onClick={() => runWithAd(() => {
            navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`);
            alert("Copied!");
          })}>COPY INVITE LINK</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => runWithAd(() => setActiveNav(n))} style={{flex:1, textAlign:'center', color: activeNav === n ? '#facc15' : '#fff', fontSize:'12px', fontWeight:'bold', cursor:'pointer'}}>
            {n.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
