import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  MAIN_BOT: "https://t.me/EasyTonFree_Bot",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODE: "EASY3",
  MIN_WITHDRAW: 0.1,
  REF_REWARD: 0.001,
  TASK_REWARD: 0.001
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
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  
  const [adminTask, setAdminTask] = useState({ name: '', link: '', type: 'bot' });
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [channelInput, setChannelInput] = useState('');

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
        setBalance(Number(userData.balance || 0));
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(userData.referrals || []);
      }
      if (tasksData) {
        const tList = Object.keys(tasksData).map(key => ({ ...tasksData[key], fbKey: key }));
        setCustomTasks(tList);
      }
    } catch (e) { console.error("Sync Error:", e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
  }, [fetchData]);

  // Ads logic
  const runWithAd = (onSuccess) => {
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(() => onSuccess())
        .catch(() => alert("Watch the full ad to receive your reward!"));
    } else { onSuccess(); }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return;
    runWithAd(() => {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);
      fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, completed: newComp })
      });
      if (link) window.open(link, '_blank');
      alert(`Success! +${reward} TON`);
    });
  };

  const handleAddAdminTask = async () => {
    if (!adminTask.name || !adminTask.link) return alert("Please fill Name and Link.");
    try {
      const response = await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`, {
        method: 'POST',
        body: JSON.stringify({ ...adminTask, id: 'custom_' + Date.now() })
      });
      if (response.ok) {
        alert("New task added successfully!");
        setAdminTask({ name: '', link: '', type: 'bot' });
        fetchData();
      }
    } catch (e) { alert("Error adding task!"); }
  };

  // --- Withdraw Logic (Balance Auto Deduct) ---
  const handleWithdraw = () => {
    const amt = Number(withdrawAmount);
    if (amt < APP_CONFIG.MIN_WITHDRAW) return alert(`Minimum withdraw is ${APP_CONFIG.MIN_WITHDRAW} TON`);
    if (amt > balance) return alert("Insufficient balance.");
    if (!withdrawAddress) return alert("Please enter wallet address.");

    runWithAd(() => {
      const newBal = Number((balance - amt).toFixed(5)); // Balance ထဲက ချက်ချင်းနှုတ်လိုက်တာ
      const newEntry = {
        amount: amt, address: withdrawAddress,
        date: new Date().toLocaleString(), status: "Pending"
      };
      const newHistory = [newEntry, ...withdrawHistory];
      setBalance(newBal); // State မှာ ချက်ချင်း Update လုပ်တာ
      setWithdrawHistory(newHistory);
      setWithdrawAmount(''); setWithdrawAddress('');
      
      fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, withdrawHistory: newHistory })
      });

      // Admin ဆီစာပို့ရန် Main Bot Link ဆောက်ခြင်း
      const adminMsg = `WITHDRAW_REQ\nUID: ${APP_CONFIG.MY_UID}\nAmt: ${amt} TON\nAdd: ${withdrawAddress}`;
      const encodedMsg = btoa(unescape(encodeURIComponent(adminMsg))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      alert("Withdrawal request sent! Auto-deducted from balance.");
      tg.openTelegramLink(`${APP_CONFIG.MAIN_BOT}?start=${encodedMsg}`);
    });
  };

  // --- Submit Channel Logic (Admin & HelpBot ဆီပို့ရန်) ---
  const submitChannel = () => {
    if (!channelInput.trim()) return alert("Please enter a link.");
    
    runWithAd(() => { // ကြော်ငြာတက်ပြီးမှ ပို့မှာဖြစ်ပါတယ်
      const rawMsg = `NEW_PROMO_UID_${APP_CONFIG.MY_UID}_NAME_${channelInput.trim()}`;
      const encodedData = btoa(unescape(encodeURIComponent(rawMsg))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      // Admin နဲ့ HelpBot ဆီရောက်အောင် Main Bot သို့မဟုတ် Help Bot ဆီ လှမ်းပို့တာပါ
      const botUrl = `${APP_CONFIG.HELP_BOT}?start=${encodedData}`;
      
      if (tg) {
        tg.openTelegramLink(botUrl);
      } else {
        window.open(botUrl, '_blank');
      }

      setChannelInput('');
      setIsAddingChannel(false);
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
    { id: 'soc_1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 'soc_2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 'soc_3', name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
    { id: 'soc_4', name: "@M9460", link: "https://t.me/M9460" },
    { id: 'soc_5', name: "@USDTcloudminer_channel", link: "https://t.me/USDTcloudminer_channel" },
    { id: 'soc_6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
    { id: 'soc_7', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
    { id: 'soc_8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
    { id: 'soc_9', name: "@kombo_crypta", link: "https://t.me/kombo_crypta" },
    { id: 'soc_10', name: "@easytonfree", link: "https://t.me/easytonfree" },
    { id: 'soc_11', name: "@WORLDBESTCRYTO1", link: "https://t.me/WORLDBESTCRYTO1" },
    { id: 'soc_12', name: "@MONEYHUB9_69", link: "https://t.me/MONEYHUB9_69" },
    { id: 'soc_13', name: "@zrbtua", link: "https://t.me/zrbtua" },
    { id: 'soc_14', name: "@perviu1million", link: "https://t.me/perviu1million" },
    ...customTasks.filter(t => t.type === 'social')
  ];

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0' },
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
                <button key={t} onClick={() => runWithAd(() => setActiveTab(t.toLowerCase()))} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight:'bold', border:'2px solid #000'}}>{t}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && botTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}>
                <b>{t.name}</b>
                <button onClick={() => handleTaskReward(t.id, APP_CONFIG.TASK_REWARD, t.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>START</button>
              </div>
            ))}
            
            {activeTab === 'social' && (
              <>
                <button onClick={() => setIsAddingChannel(!isAddingChannel)} style={{...styles.btn, background: '#24A1DE', marginBottom: '15px'}}>+ ADD YOUR CHANNEL</button>
                {isAddingChannel && (
                  <div style={{paddingBottom:'15px'}}>
                    <input style={styles.input} placeholder="Channel Link or Name" value={channelInput} onChange={(e) => setChannelInput(e.target.value)} />
                    <button style={{...styles.btn, background:'#10b981'}} onClick={submitChannel}>SUBMIT TO SUPPORT</button>
                  </div>
                )}
                {socialTasks.filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}>
                    <b>{t.name}</b>
                    <button onClick={() => handleTaskReward(t.id, APP_CONFIG.TASK_REWARD, t.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>JOIN</button>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCode} onChange={e => setRewardCode(e.target.value)} />
                <button style={styles.btn} onClick={() => runWithAd(() => {
                  rewardCode.toUpperCase() === APP_CONFIG.REWARD_CODE ? handleTaskReward('code_'+APP_CONFIG.REWARD_CODE, 0.001) : alert('Invalid Code!');
                })}>CLAIM REWARD</button>
              </div>
            )}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <h3 style={{textAlign:'center', marginBottom:15}}>ADMIN PANEL</h3>
                <label>Task Name:</label>
                <input style={styles.input} placeholder="e.g. Join My Channel" value={adminTask.name} onChange={e => setAdminTask({...adminTask, name: e.target.value})} />
                <label>Link:</label>
                <input style={styles.input} placeholder="https://t.me/..." value={adminTask.link} onChange={e => setAdminTask({...adminTask, link: e.target.value})} />
                <label>Type:</label>
                <select style={{...styles.input, appearance:'none'}} value={adminTask.type} onChange={e => setAdminTask({...adminTask, type: e.target.value})}>
                  <option value="bot">BOT TASK</option>
                  <option value="social">SOCIAL TASK</option>
                </select>
                <button style={{...styles.btn, background:'#10b981'}} onClick={handleAddAdminTask}>CONFIRM ADD TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Invite Friends</h3>
          <p style={{fontSize:'14px', color:'#666'}}>Get <b>{APP_CONFIG.REF_REWARD} TON</b> for every friend you invite!</p>
          <div style={{background:'#eee', padding:'10px', borderRadius:'10px', wordBreak:'break-all', fontSize:'12px', border:'1px dashed #000'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</div>
          <button style={{...styles.btn, marginTop:'10px'}} onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Link Copied!"); }}>COPY LINK</button>
          <h4 style={{marginTop:'20px'}}>Invite History (Wait 24h)</h4>
          {referrals.length === 0 ? <p style={{fontSize:'12px', color:'#999'}}>No referrals yet.</p> : 
            referrals.map((r, i) => (
                <div key={i} style={styles.row}>
                    <span>User ID: {r.id}</span>
                    <span style={{color:'#f59e0b', fontSize:'10px'}}>Processing (24h)</span>
                </div>
            ))
          }
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw TON</h3>
          <input style={styles.input} type="number" placeholder="Amount (Min 0.1)" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={{...styles.btn, background:'#3b82f6'}} onClick={handleWithdraw}>WITHDRAW NOW</button>
          <h4 style={{marginTop:'25px'}}>Withdraw History</h4>
          {withdrawHistory.map((h, i) => (<div key={i} style={{...styles.row, fontSize:'12px'}}><div><b>{h.amount} TON</b><br/><small>{h.date}</small></div><div style={{color: h.status === 'Pending' ? '#f59e0b' : '#10b981'}}>● {h.status}</div></div>))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>My Profile</h3>
          <div style={styles.row}><span>Status:</span> <b style={{color:'#10b981'}}>Active</b></div>
          <div style={styles.row}><span>Your Balance:</span> <b>{balance.toFixed(5)} TON</b></div>
          <div style={styles.row}><span>User ID:</span> <b>{APP_CONFIG.MY_UID}</b></div>
          <div style={styles.row}><span>Support:</span> <b style={{color:'#3b82f6', cursor:'pointer'}} onClick={() => { if(tg) tg.openTelegramLink(APP_CONFIG.HELP_BOT); else window.open(APP_CONFIG.HELP_BOT); }}>@EasyTonHelp_Bot</b></div>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => runWithAd(() => setActiveNav(n))} style={{flex:1, textAlign:'center', color: activeNav === n ? '#facc15' : '#fff', fontSize:'12px', fontWeight:'bold', cursor:'pointer'}}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
