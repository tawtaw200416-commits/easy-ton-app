import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "Guest_ID",
  ADS_BLOCKS: ["27611", "27633"], 
  TASK_REWARD: 0.001,
  VIDEO_REWARD: 0.0005,
  REFER_REWARD: 0.001,
  CODE_REWARD_AMOUNT: 0.001,
  REWARD_CODE: "EASY3",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot"
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [inviteHistory, setInviteHistory] = useState(() => JSON.parse(localStorage.getItem('inv_hist')) || []);
  const [adminTasks, setAdminTasks] = useState(() => JSON.parse(localStorage.getItem('adm_tasks_list')) || []);

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showAddTask, setShowAddTask] = useState(false);
  
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelLink, setNewChannelLink] = useState('');
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isAdLoading, setIsAdLoading] = useState(false);

  useEffect(() => { if (tg) { tg.ready(); tg.expand(); } }, []);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('inv_hist', JSON.stringify(inviteHistory));
    localStorage.setItem('adm_tasks_list', JSON.stringify(adminTasks));
  }, [balance, completed, withdrawHistory, inviteHistory, adminTasks]);

  // --- Ads Logic (နှိပ်လိုက်တိုင်း ကြော်ငြာအရင်လာမည်) ---
  const handleActionWithAds = (reward, taskId = null, link = null) => {
    if (isAdLoading) return;
    const randomBlockId = APP_CONFIG.ADS_BLOCKS[Math.floor(Math.random() * APP_CONFIG.ADS_BLOCKS.length)];

    if (window.Adsgram) {
      setIsAdLoading(true);
      const AdController = window.Adsgram.init({ blockId: randomBlockId });
      
      AdController.show()
        .then(() => {
          setIsAdLoading(false);
          if (reward > 0) {
            setBalance(prev => Number((prev + reward).toFixed(5)));
          }
          if (taskId) setCompleted(prev => [...prev, taskId]);
          if (link) window.open(link, '_blank');
        })
        .catch(() => {
          setIsAdLoading(false);
          alert("Skip လုပ်လို့မရပါဘူး။ ကြော်ငြာဆုံးအောင်ကြည့်ပေးပါ။");
        });
    } else {
      // Adsgram မရှိရင်တောင် Link ပွင့်အောင်လုပ်ထားပေးပါတယ် (Developer အတွက်)
      if (link) window.open(link, '_blank');
    }
  };

  // Tab ပြောင်းရင် ကြော်ငြာအရင်တက်ခိုင်းတဲ့ logic
  const switchTabWithAds = (tabName) => {
    // Tab ပြောင်းတဲ့အခါ Reward မပေးဘဲ ကြော်ငြာပဲ ပြမှာဖြစ်လို့ reward ကို 0 ထားပါတယ်
    handleActionWithAds(0); 
    setActiveTab(tabName);
  };

  const handleSaveTask = () => {
    if (newChannelName && newChannelLink) {
      const newTask = {
        id: 'custom_' + Date.now(),
        name: newChannelName,
        link: newChannelLink.startsWith('http') ? newChannelLink : `https://${newChannelLink}`
      };
      setAdminTasks(prev => [newTask, ...prev]);
      setNewChannelName('');
      setNewChannelLink('');
      setShowAddTask(false);
      alert("Admin Task Added!");
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    balanceCard: { background: 'linear-gradient(135deg, #000, #1e293b)', padding: '30px', borderRadius: '25px', textAlign: 'center', marginBottom: '20px', border: '4px solid #fff', color: '#fff' },
    videoBtn: { background: '#ef4444', color: '#fff', width: '100%', padding: '18px', borderRadius: '15px', border: '3px solid #000', fontWeight: 'bold', fontSize: '18px', marginBottom: '15px' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '25px', marginBottom: '12px', border: '3px solid #000' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: '900' }),
    blackBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.balanceCard}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ fontSize: '45px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:'18px'}}>TON</span></h1>
        <small>● ACTIVE ACCOUNT</small>
      </div>

      <button style={styles.videoBtn} onClick={() => handleActionWithAds(APP_CONFIG.VIDEO_REWARD)}>
        📺 WATCH VIDEO (+{APP_CONFIG.VIDEO_REWARD} TON)
      </button>

      {activeNav === 'earn' && (
        <>
          <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => switchTabWithAds(t)} style={{flex:1, padding:'10px', background:activeTab===t?'#000':'#fff', color:activeTab===t?'#fff':'#000', border:'2px solid #000', borderRadius:'12px', fontWeight:'bold'}}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={styles.card}>
            <button onClick={() => setShowAddTask(!showAddTask)} style={{...styles.blackBtn, background:'#facc15', color:'#000', marginBottom:'15px', border:'2px solid #000'}}>
               {showAddTask ? "CANCEL" : "+ ADD TASK (ADMIN)"}
            </button>
            
            {showAddTask ? (
              <div>
                <input style={styles.input} placeholder="Channel Name" value={newChannelName} onChange={(e)=>setNewChannelName(e.target.value)} />
                <input style={styles.input} placeholder="Link (https://...)" value={newChannelLink} onChange={(e)=>setNewChannelLink(e.target.value)} />
                <button style={{...styles.blackBtn, background: '#22c55e'}} onClick={handleSaveTask}>SAVE TASK</button>
              </div>
            ) : (
              <>
                {activeTab === 'bot' && [
                  { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
                  { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
                  { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
                  { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
                  { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
                  { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
                ].filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleActionWithAds(APP_CONFIG.TASK_REWARD, t.id, t.link)} style={{...styles.blackBtn, width:'80px'}}>START</button></div>
                ))}

                {activeTab === 'social' && [
                  ...adminTasks,
                  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
                  { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
                  { id: 's3', name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
                  { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
                  { id: 's5', name: "@USDTcloudminer_channel", link: "https://t.me/USDTcloudminer_channel" },
                  { id: 's6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
                  { id: 's7', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
                  { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
                  { id: 's9', name: "@kombo_crypta", link: "https://t.me/kombo_crypta" },
                  { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" },
                  { id: 's11', name: "@WORLDBESTCRYTO1", link: "https://t.me/WORLDBESTCRYTO1" },
                  { id: 's12', name: "@MONEYHUB9_69", link: "https://t.me/MONEYHUB9_69" },
                  { id: 's13', name: "@zrbtua", link: "https://t.me/zrbtua" },
                  { id: 's14', name: "@perviu1million", link: "https://t.me/perviu1million" }
                ].filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleActionWithAds(APP_CONFIG.TASK_REWARD, t.id, t.link)} style={{...styles.blackBtn, width:'80px'}}>JOIN</button></div>
                ))}

                {activeTab === 'reward' && (
                  <div>
                    <input style={styles.input} placeholder="Enter EASY3 Code" value={rewardInput} onChange={(e)=>setRewardInput(e.target.value)} />
                    <button style={styles.blackBtn} onClick={() => rewardInput===APP_CONFIG.REWARD_CODE ? handleActionWithAds(APP_CONFIG.CODE_REWARD_AMOUNT, 'code_claimed') : alert("Wrong Code")}>CLAIM</button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Footer Nav and other sections */}
      <div style={styles.navBar}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => { handleActionWithAds(0); setActiveNav(n); }} style={styles.navBtn(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
