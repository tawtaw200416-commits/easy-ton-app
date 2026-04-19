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
  // Initial States from LocalStorage (Safety First)
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
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

  // Sync to LocalStorage whenever state changes
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
        // Only update if data exists in Firebase to prevent overwriting with null
        if (userData.balance !== undefined) setBalance(Number(userData.balance));
        if (userData.completed) setCompleted(userData.completed);
        if (userData.withdrawHistory) setWithdrawHistory(userData.withdrawHistory);
        if (userData.referrals) setReferrals(userData.referrals);
      }
      
      if (tasksData) {
        const loadedTasks = Object.keys(tasksData).map(key => ({ ...tasksData[key], fbKey: key }));
        setCustomTasks(loadedTasks);
      }
    } catch (e) { 
      console.error("Sync Error:", e);
      // Fail-safe: If network fails, we still have LocalStorage data
    }
  }, []);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      // Apply theme colors
      tg.setHeaderColor('#000000');
    }
    fetchData();
  }, [fetchData]);

  const runWithAd = (onSuccess) => {
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(() => onSuccess())
        .catch((err) => {
          console.error("Ad Error:", err);
          alert("Reward ရရှိရန် ကြော်ငြာကို အဆုံးထိကြည့်ပေးပါ။");
        });
    } else {
      // If Adsgram script is missing, still allow functionality (Safety)
      onSuccess();
    }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return;

    runWithAd(() => {
      // 1. Direct user to the link
      let finalLink = link;
      if (link.startsWith('@')) {
        finalLink = `https://t.me/${link.replace('@', '')}`;
      }

      if (finalLink.startsWith('https://t.me/')) {
        tg.openTelegramLink(finalLink);
      } else {
        window.open(finalLink, '_blank');
      }

      // 2. Delay reward to ensure they visited the link
      setTimeout(() => {
        setBalance(prev => {
          const newBal = Number((prev + reward).toFixed(5));
          const newComp = [...completed, id];
          
          setCompleted(newComp);
          
          // Sync to Firebase
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, completed: newComp })
          });

          return newBal;
        });
        alert(`Success! +${reward} TON Added.`);
      }, 5000);
    });
  };

  const handleWithdraw = () => {
    const amt = Number(withdrawAmount);
    if (amt < APP_CONFIG.MIN_WITHDRAW) return alert(`Minimum ${APP_CONFIG.MIN_WITHDRAW} TON လိုအပ်ပါတယ်။`);
    if (amt > balance) return alert("လက်ကျန်ငွေ မလုံလောက်ပါ။");
    if (!withdrawAddress) return alert("Wallet Address ထည့်ပါ။");

    runWithAd(() => {
      const newBal = Number((balance - amt).toFixed(5));
      const newEntry = { amount: amt, address: withdrawAddress, date: new Date().toLocaleString(), status: "Pending" };
      const newHistory = [newEntry, ...withdrawHistory];
      
      setBalance(newBal);
      setWithdrawHistory(newHistory);
      
      fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, withdrawHistory: newHistory })
      });
      
      setWithdrawAmount(''); 
      setWithdrawAddress('');
      alert("ထုတ်ယူမှု တောင်းဆိုပြီးပါပြီ။ ခေတ္တစောင့်ဆိုင်းပေးပါ။");
    });
  };

  // Static Tasks (Fixed Links)
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
    { id: 'soc_1', name: "Grow Tea News", link: "https://t.me/GrowTeaNews" },
    { id: 'soc_2', name: "Golden Miner News", link: "https://t.me/GoldenMinerNews" },
    { id: 'soc_3', name: "Official Crypto Gold", link: "https://t.me/cryptogold_online_official" },
    { id: 'soc_4', name: "M9460 News", link: "https://t.me/M9460" },
    { id: 'soc_5', name: "USDT Cloud Miner", link: "https://t.me/USDTcloudminer_channel" },
    { id: 'soc_6', name: "ADS TON Channel", link: "https://t.me/ADS_TON1" },
    { id: 'soc_7', name: "Goblin Crypto", link: "https://t.me/goblincrypto" },
    { id: 'soc_8', name: "World Best Crypto", link: "https://t.me/WORLDBESTCRYTO" },
    { id: 'soc_9', name: "Kombo Crypta", link: "https://t.me/kombo_crypta" },
    { id: 'soc_10', name: "Easy TON Free", link: "https://t.me/easytonfree" },
    { id: 'soc_11', name: "World Best Crypto 1", link: "https://t.me/WORLDBESTCRYTO1" },
    { id: 'soc_12', name: "Money Hub 9", link: "https://t.me/MONEYHUB9_69" },
    { id: 'soc_13', name: "ZRBTUA Official", link: "https://t.me/zrbtua" },
    { id: 'soc_14', name: "Perviu 1 Million", link: "https://t.me/perviu1million" },
    ...customTasks.filter(t => t.type === 'social')
  ];

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', active: { opacity: 0.8 } },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 100 },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15', letterSpacing: '1px', fontWeight: 'bold' }}>YOUR BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981', fontWeight:'bold'}}>● REAL-TIME SYNC ACTIVE</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} 
                  onClick={() => setActiveTab(t.toLowerCase())} 
                  style={{ flex: 1, padding: '12px 5px', borderRadius: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight:'bold', border:'2px solid #000', fontSize: '12px'}}>
                  {t}
                </button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && botTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}>
                <div style={{flex: 1}}><b>{t.name}</b><br/><small style={{color: '#666'}}>+0.001 TON</small></div>
                <button onClick={() => handleTaskReward(t.id, APP_CONFIG.TASK_REWARD, t.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>START</button>
              </div>
            ))}
            
            {activeTab === 'social' && (
              <>
                <button onClick={() => setIsAddingChannel(!isAddingChannel)} style={{...styles.btn, background: '#24A1DE', marginBottom: '15px', boxShadow: '2px 2px 0 #000'}}>+ ADD YOUR CHANNEL</button>
                {isAddingChannel && (
                  <div style={{paddingBottom:'15px', borderBottom: '2px dashed #ccc', marginBottom: '15px'}}>
                    <input style={styles.input} placeholder="@Username (e.g. @easyton)" value={channelInput} onChange={(e) => setChannelInput(e.target.value)} />
                    <button style={{...styles.btn, background:'#10b981'}} onClick={() => {
                      if (!channelInput.trim()) return alert("Channel link ထည့်ပါ။");
                      const encoded = btoa(unescape(encodeURIComponent(channelInput.trim()))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
                      tg.openTelegramLink(`${APP_CONFIG.HELP_BOT}?start=addchannel_${encoded}`);
                      setIsAddingChannel(false); setChannelInput('');
                    }}>SUBMIT CHANNEL</button>
                  </div>
                )}
                {socialTasks.filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}>
                    <div style={{flex: 1}}><b>{t.name}</b><br/><small style={{color: '#666'}}>+0.001 TON</small></div>
                    <button onClick={() => handleTaskReward(t.id, APP_CONFIG.TASK_REWARD, t.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>JOIN</button>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'reward' && (
              <div style={{textAlign: 'center'}}>
                <p style={{fontSize: '13px', color: '#555'}}>Daily Promo Code ထည့်ပြီး ဆုကြေးယူပါ။</p>
                <input style={styles.input} placeholder="Enter Code Here..." value={rewardCode} onChange={e => setRewardCode(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                  if(rewardCode.toUpperCase() === APP_CONFIG.REWARD_CODE) {
                    handleTaskReward('code_'+APP_CONFIG.REWARD_CODE, 0.001, APP_CONFIG.HELP_BOT);
                    setRewardCode('');
                  } else { alert('Code မှားယွင်းနေပါသည်။'); }
                }}>CLAIM REWARD</button>
              </div>
            )}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <h4 style={{margin: '0 0 10px 0'}}>Admin Task Panel</h4>
                <input style={styles.input} placeholder="Task Name" value={adminTask.name} onChange={e => setAdminTask({...adminTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link (https://...)" value={adminTask.link} onChange={e => setAdminTask({...adminTask, link: e.target.value})} />
                <select style={styles.input} value={adminTask.type} onChange={e => setAdminTask({...adminTask, type: e.target.value})}>
                  <option value="bot">BOT TASK</option>
                  <option value="social">SOCIAL TASK</option>
                </select>
                <button style={{...styles.btn, background:'#10b981'}} onClick={async () => {
                  if (!adminTask.name || !adminTask.link) return alert("အချက်အလက် အကုန်ဖြည့်ပါ။");
                  await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`, { 
                    method: 'POST', 
                    body: JSON.stringify({...adminTask, id: 'custom_'+Date.now()}) 
                  });
                  alert("Task Added Successfully!"); 
                  setAdminTask({name:'', link:'', type:'bot'}); 
                  fetchData();
                }}>CONFIRM ADD</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <div style={{textAlign: 'center', marginBottom: '20px'}}>
            <h2 style={{margin: '0'}}>Invite & Earn</h2>
            <p style={{color: '#666'}}>သူငယ်ချင်းတစ်ယောက် ဖိတ်ခေါ်တိုင်း <b>{APP_CONFIG.REF_REWARD} TON</b> ရပါမယ်။</p>
          </div>
          <div style={{background:'#f8f8f8', padding:'15px', borderRadius:'10px', border: '1px dashed #000', wordBreak:'break-all', fontSize:'12px', textAlign: 'center', fontWeight: 'bold'}}>
            https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}
          </div>
          <button style={{...styles.btn, marginTop:'15px'}} onClick={() => {
            navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); 
            alert("Link Copied! သူငယ်ချင်းများကို ပို့လိုက်ပါ။");
          }}>COPY INVITE LINK</button>
          
          <h4 style={{marginTop:'25px', borderBottom: '2px solid #eee', paddingBottom: '5px'}}>Referral History</h4>
          {referrals.length > 0 ? referrals.map((r, i) => (
            <div key={i} style={styles.row}><span>User ID: {r.id}</span><span style={{color:'#10b981', fontWeight: 'bold'}}>+{APP_CONFIG.REF_REWARD}</span></div>
          )) : <p style={{textAlign: 'center', color: '#999', fontSize: '13px'}}>ဖိတ်ခေါ်ထားသူ မရှိသေးပါ။</p>}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw TON</h3>
          <p style={{fontSize: '12px', color: '#666'}}>အနည်းဆုံးထုတ်ယူနိုင်သောပမာဏ: <b>{APP_CONFIG.MIN_WITHDRAW} TON</b></p>
          <input style={styles.input} type="number" placeholder="Amount (e.g. 0.1)" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="Your TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={{...styles.btn, background:'#3b82f6'}} onClick={handleWithdraw}>WITHDRAW NOW</button>
          
          <h4 style={{marginTop:'25px', borderBottom: '2px solid #eee', paddingBottom: '5px'}}>Withdrawal History</h4>
          {withdrawHistory.length > 0 ? withdrawHistory.map((h, i) => (
            <div key={i} style={styles.row}>
              <div><b>{h.amount} TON</b><br/><small style={{fontSize: '10px'}}>{h.date}</small></div>
              <div style={{color: h.status === 'Pending' ? '#f59e0b' : '#10b981', fontWeight: 'bold'}}>{h.status}</div>
            </div>
          )) : <p style={{textAlign: 'center', color: '#999', fontSize: '13px'}}>မှတ်တမ်းမရှိသေးပါ။</p>}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <div style={{textAlign: 'center', marginBottom: '20px'}}>
             <div style={{width: '60px', height: '60px', borderRadius: '50%', background: '#facc15', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: '2px solid #000'}}>👤</div>
             <h3 style={{margin: '0'}}>My Account</h3>
          </div>
          <div style={styles.row}><span>User ID:</span> <b>{APP_CONFIG.MY_UID}</b></div>
          <div style={styles.row}><span>Total Balance:</span> <b>{balance.toFixed(5)} TON</b></div>
          <div style={styles.row}><span>Tasks Completed:</span> <b>{completed.length}</b></div>
          <button style={{...styles.btn, marginTop:25, background:'#24A1DE'}} onClick={() => tg.openTelegramLink(APP_CONFIG.HELP_BOT)}>HELP & SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{flex:1, textAlign:'center', color: activeNav === n ? '#facc15' : '#fff', fontSize:'11px', fontWeight:'bold', cursor:'pointer'}}>
            <div style={{fontSize: '18px', marginBottom: '2px'}}>
              {n === 'earn' && '💰'}
              {n === 'invite' && '👥'}
              {n === 'withdraw' && '🏦'}
              {n === 'profile' && '⚙️'}
            </div>
            {n.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
