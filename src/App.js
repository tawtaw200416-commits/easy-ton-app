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

  // LocalStorage Sync (အဟောင်း Code များမပျက်စေရန်)
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
        setCustomTasks(Object.keys(tasksData).map(key => ({ ...tasksData[key], fbKey: key })));
      }
    } catch (e) { console.error("Sync Error:", e); }
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
  }, [fetchData]);

  // ဘယ် Button နှိပ်နှိပ် ကြော်ငြာအရင်တက်စေရန်
  const runWithAd = (onSuccess) => {
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(() => onSuccess())
        .catch(() => alert("Watch the full ad to receive your reward!"));
    } else { onSuccess(); }
  };

  // Link ထဲရောက်ပြီး ၃ စက္ကန့်နေမှ TON ပေါင်းပေးရန်
  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return;
    runWithAd(() => {
      window.open(link, '_blank'); // Link ကို အရင်ပို့ပေးသည်
      setTimeout(() => {
        const newBal = Number((balance + reward).toFixed(5));
        const newComp = [...completed, id];
        setBalance(newBal);
        setCompleted(newComp);
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ balance: newBal, completed: newComp })
        });
        alert(`Success! +${reward} TON added after joining.`);
      }, 3000); // ၃ စက္ကန့် Delay
    });
  };

  const submitChannel = () => {
    if (!channelInput.trim()) return alert("Please enter a link.");
    runWithAd(() => {
      const encodedData = btoa(unescape(encodeURIComponent(channelInput.trim()))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const botUrl = `${APP_CONFIG.HELP_BOT}?start=addchannel_${encodedData}`;
      if (tg) tg.openTelegramLink(botUrl); else window.open(botUrl, '_blank');
      setChannelInput('');
      setIsAddingChannel(false);
    });
  };

  const handleAddAdminTask = async () => {
    if (!adminTask.name || !adminTask.link) return alert("Fill Name and Link.");
    try {
      await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`, {
        method: 'POST',
        body: JSON.stringify({ ...adminTask, id: 'custom_' + Date.now() })
      });
      alert("Task Added!");
      setAdminTask({ name: '', link: '', type: 'bot' });
      fetchData();
    } catch (e) { alert("Error!"); }
  };

  // စာရင်းအသစ်များ
  const botTasks = [
    { id: 'bot_new_1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'bot_new_2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'bot_new_3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'bot_new_4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'bot_new_5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'bot_new_6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" },
    ...customTasks.filter(t => t.type === 'bot')
  ];

  const socialTasks = [
    { id: 'soc_new_1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 'soc_new_2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 'soc_new_3', name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
    { id: 'soc_new_4', name: "@M9460", link: "https://t.me/M9460" },
    { id: 'soc_new_5', name: "@USDTcloudminer_channel", link: "https://t.me/USDTcloudminer_channel" },
    { id: 'soc_new_6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
    { id: 'soc_new_7', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
    { id: 'soc_new_8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
    { id: 'soc_new_9', name: "@kombo_crypta", link: "https://t.me/kombo_crypta" },
    { id: 'soc_new_10', name: "@easytonfree", link: "https://t.me/easytonfree" },
    { id: 'soc_new_11', name: "@WORLDBESTCRYTO1", link: "https://t.me/WORLDBESTCRYTO1" },
    { id: 'soc_new_12', name: "@MONEYHUB9_69", link: "https://t.me/MONEYHUB9_69" },
    { id: 'soc_new_13', name: "@zrbtua", link: "https://t.me/zrbtua" },
    { id: 'soc_new_14', name: "@perviu1million", link: "https://t.me/perviu1million" },
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
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, APP_CONFIG.TASK_REWARD, t.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>START</button></div>
            ))}
            
            {activeTab === 'social' && (
              <>
                <button onClick={() => setIsAddingChannel(!isAddingChannel)} style={{...styles.btn, background: '#24A1DE', marginBottom: '15px'}}>+ ADD YOUR CHANNEL</button>
                {isAddingChannel && (
                  <div style={{paddingBottom:'15px'}}>
                    <input style={styles.input} placeholder="Link or Name" value={channelInput} onChange={(e) => setChannelInput(e.target.value)} />
                    <button style={{...styles.btn, background:'#10b981'}} onClick={submitChannel}>SUBMIT TO SUPPORT</button>
                  </div>
                )}
                {socialTasks.filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, APP_CONFIG.TASK_REWARD, t.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>JOIN</button></div>
                ))}
              </>
            )}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <h3 style={{textAlign:'center', marginBottom:15}}>ADMIN PANEL</h3>
                <input style={styles.input} placeholder="Task Name" value={adminTask.name} onChange={e => setAdminTask({...adminTask, name: e.target.value})} />
                <input style={styles.input} placeholder="https://t.me/..." value={adminTask.link} onChange={e => setAdminTask({...adminTask, link: e.target.value})} />
                <select style={styles.input} value={adminTask.type} onChange={e => setAdminTask({...adminTask, type: e.target.value})}>
                  <option value="bot">BOT TASK</option>
                  <option value="social">SOCIAL TASK</option>
                </select>
                <button style={{...styles.btn, background:'#10b981'}} onClick={handleAddAdminTask}>CONFIRM ADD TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Navigation tabs with Ad-First logic */}
      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => runWithAd(() => setActiveNav(n))} style={{flex:1, textAlign:'center', color: activeNav === n ? '#facc15' : '#fff', fontSize:'12px', fontWeight:'bold', cursor:'pointer'}}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
