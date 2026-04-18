import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "Guest_ID",
  ADSGRAM_BLOCK_ID: "27611",
  TASK_REWARD: 0.001,
  VIDEO_REWARD: 0.0001,
  REWARD_CODE: "EASY3",
  CODE_REWARD_AMOUNT: 0.001
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [activeTab, setActiveTab] = useState('social'); // Default tab
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [inputCode, setInputCode] = useState('');

  // Admin and History data (Saved in localStorage)
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('admin_tasks')) || [
    { id: 't1', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 't2', name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" }
  ]);
  const [withdrawals, setWithdrawals] = useState(() => JSON.parse(localStorage.getItem('withdraws')) || []);

  useEffect(() => { if (tg) { tg.ready(); tg.expand(); } }, []);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('admin_tasks', JSON.stringify(tasks));
    localStorage.setItem('withdraws', JSON.stringify(withdrawals));
  }, [balance, completed, tasks, withdrawals]);

  // --- Universal Ads Function ---
  const executeWithAds = (reward, taskId = null, link = null) => {
    if (isAdLoading) return;

    if (window.Adsgram) {
      setIsAdLoading(true);
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      
      AdController.show()
        .then(() => {
          setIsAdLoading(false);
          setBalance(prev => Number((prev + reward).toFixed(5)));
          if (taskId) setCompleted(prev => [...prev, taskId]);
          if (link) window.open(link, '_blank');
          alert(`Success! Reward: +${reward} TON`);
        })
        .catch(() => {
          setIsAdLoading(false);
          alert("Ad failed. Please try again later.");
        });
    } else {
      alert("Adsgram Script is not loaded properly.");
    }
  };

  const styles = {
    container: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', fontFamily: 'Arial, sans-serif' },
    balanceCard: { background: 'linear-gradient(to bottom, #1a1a1a, #000)', color: '#fff', borderRadius: '25px', padding: '30px', textAlign: 'center', marginBottom: '20px' },
    videoBtn: { background: '#ef4444', color: '#fff', width: '100%', padding: '18px', borderRadius: '15px', border: '3px solid #000', fontWeight: 'bold', fontSize: '16px', marginBottom: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' },
    tabRow: { display: 'flex', justifyContent: 'space-between', gap: '5px', marginBottom: '15px' },
    tabBtn: (active) => ({ flex: 1, padding: '10px 5px', background: active ? '#000' : '#fff', color: active ? '#fff' : '#000', border: '2px solid #000', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }),
    taskBox: { background: '#fff', borderRadius: '25px', padding: '20px', border: '3px solid #000' },
    promoteBtn: { background: '#facc15', color: '#000', width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #000', fontWeight: 'bold', marginBottom: '20px' },
    taskItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
    joinBtn: { background: '#000', color: '#fff', padding: '8px 20px', borderRadius: '10px', border: 'none', fontWeight: 'bold' },
    bottomNav: { position: 'fixed', bottom: 0, left: 0, width: '100%', background: '#000', display: 'flex', justifyContent: 'space-around', padding: '15px 0' },
    navLink: { color: '#fff', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      {/* Balance Section */}
      <div style={styles.balanceCard}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ fontSize: '45px', margin: '10px 0' }}>{balance.toFixed(4)} <span style={{fontSize: '20px'}}>TON</span></h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></div>
          <small style={{ color: '#22c55e' }}>ACTIVE STATUS</small>
        </div>
      </div>

      {/* Watch Video Button */}
      <button style={styles.videoBtn} onClick={() => executeWithAds(APP_CONFIG.VIDEO_REWARD)}>
        📺 WATCH VIDEO (+{APP_CONFIG.VIDEO_REWARD} TON)
      </button>

      {/* Sub Tabs */}
      <div style={styles.tabRow}>
        {['bot', 'social', 'reward', 'admin'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={styles.tabBtn(activeTab === tab)}>
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tasks Section */}
      <div style={styles.taskBox}>
        <button style={styles.promoteBtn} onClick={() => executeWithAds(0, null, "https://t.me/your_admin_contact")}>
          + ADD TASK (PROMOTE)
        </button>

        {activeTab === 'social' && (
          <div>
            {tasks.filter(t => !completed.includes(t.id)).map(task => (
              <div key={task.id} style={styles.taskItem}>
                <span style={{ fontWeight: 'bold' }}>{task.name}</span>
                <button style={styles.joinBtn} onClick={() => executeWithAds(APP_CONFIG.TASK_REWARD, task.id, task.link)}>JOIN</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reward' && (
          <div style={{ textAlign: 'center' }}>
            <h4>Redeem Code</h4>
            <input 
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px' }}
              placeholder="Enter Reward Code" 
              onChange={e => setInputCode(e.target.value)} 
            />
            <button style={styles.joinBtn} onClick={() => {
              if(inputCode === APP_CONFIG.REWARD_CODE) executeWithAds(APP_CONFIG.CODE_REWARD_AMOUNT, 'code_redeem');
              else alert("Invalid Code!");
            }}>CLAIM CODE</button>
          </div>
        )}

        {activeTab === 'admin' && (
           <div style={{ textAlign: 'center' }}>
             <p>UID: {APP_CONFIG.MY_UID}</p>
             <small>Only admin can see UID-based records.</small>
           </div>
        )}
      </div>

      {/* Main Bottom Navigation */}
      <div style={styles.bottomNav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(nav => (
          <div key={nav} style={styles.navLink} onClick={() => alert(`${nav} page coming soon!`)}>
            {nav.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
