import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_UID: "1793453606", 
  ADS_BLOCKS: ["27611", "27633"], 
  TASK_REWARD: 0.001,
  VIDEO_REWARD: 0.0005,
  REFER_REWARD: 0.001,
  CODE_REWARD_AMOUNT: 0.001,
  REWARD_CODE: "EASY3",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot"
};

const USER_UID = tg?.initDataUnsafe?.user?.id?.toString() || "Guest_ID";

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [adminTasks, setAdminTasks] = useState(() => JSON.parse(localStorage.getItem('adm_tasks_list')) || []);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelLink, setNewChannelLink] = useState('');

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
  }, []);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('adm_tasks_list', JSON.stringify(adminTasks));
  }, [balance, completed, adminTasks]);

  // --- ကြော်ငြာအတွက် Fix လုပ်ထားသော Function ---
  const showAdsgramAd = (callback) => {
    const blockId = APP_CONFIG.ADS_BLOCKS[Math.floor(Math.random() * APP_CONFIG.ADS_BLOCKS.length)];
    
    // Adsgram ရှိမရှိ အသေအချာစစ်ဆေးပါ
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: blockId });
      
      AdController.show()
        .then(() => {
          if (callback) callback();
        })
        .catch((result) => {
          console.error("Ad error:", result);
          // ကြော်ငြာမတက်ရင်လည်း task လုပ်လို့ရအောင် callback ပေးထားနိုင်ပါတယ် (သို့) alert ပြပါ
          alert("Ad failed to load. Please try again later.");
        });
    } else {
      alert("Adsgram Connection မရသေးပါ။ ခဏစောင့်ပါ။");
    }
  };

  const handleTaskClick = (task) => {
    showAdsgramAd(() => {
      window.open(task.link, '_blank');
      if (!completed.includes(task.id)) {
        setBalance(prev => Number((prev + APP_CONFIG.TASK_REWARD).toFixed(5)));
        setCompleted(prev => [...prev, task.id]);
      }
    });
  };

  return (
    <div style={{ backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '100px' }}>
      
      <div style={{ background: '#111', color: '#fff', padding: '25px', borderRadius: '20px', textAlign: 'center', marginBottom: '15px' }}>
        <small>BALANCE</small>
        <h1 style={{ fontSize: '35px', margin: '5px' }}>{balance.toFixed(5)} TON</h1>
        <div style={{ fontSize: '10px', color: '#22c55e' }}>● ACTIVE STATUS</div>
      </div>

      {activeNav === 'earn' && (
        <>
          {/* Admin UID နဲ့ ကိုက်ညီမှသာ ဤ Panel ကို မြင်ရမည် */}
          {USER_UID === APP_CONFIG.ADMIN_UID && (
            <div style={{ background: '#fff', padding: '15px', borderRadius: '15px', border: '3px solid red', marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: 'red' }}>ADMIN ONLY PANEL</h4>
              <button 
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', borderRadius: '10px' }}
              >
                {showAdminPanel ? "CLOSE" : "ADD SYSTEM TASK"}
              </button>
              
              {showAdminPanel && (
                <div style={{ marginTop: '10px' }}>
                  <input style={{ width: '90%', padding: '10px', marginBottom: '5px' }} placeholder="Task Title" value={newChannelName} onChange={e=>setNewChannelName(e.target.value)} />
                  <input style={{ width: '90%', padding: '10px', marginBottom: '10px' }} placeholder="Task Link" value={newChannelLink} onChange={e=>setNewChannelLink(e.target.value)} />
                  <button 
                    onClick={() => {
                      if(newChannelName && newChannelLink) {
                        setAdminTasks([...adminTasks, { id: 'sys_'+Date.now(), name: newChannelName, link: newChannelLink }]);
                        setNewChannelName(''); setNewChannelLink('');
                      }
                    }}
                    style={{ width: '100%', padding: '10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '10px' }}
                  >PUBLISH</button>
                </div>
              )}
            </div>
          )}

          <button 
            onClick={() => showAdsgramAd(() => setBalance(prev => prev + APP_CONFIG.VIDEO_REWARD))}
            style={{ width: '100%', padding: '15px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 'bold', marginBottom: '15px' }}
          >
            📺 WATCH VIDEO (+0.0005 TON)
          </button>

          <div style={{ background: '#fff', borderRadius: '20px', padding: '10px' }}>
            {adminTasks.map(task => (
              <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #eee' }}>
                <span>{task.name}</span>
                <button 
                  disabled={completed.includes(task.id)}
                  onClick={() => handleTaskClick(task)}
                  style={{ background: completed.includes(task.id) ? '#ccc' : '#000', color: '#fff', padding: '5px 15px', borderRadius: '8px' }}
                >
                  {completed.includes(task.id) ? "DONE" : "JOIN"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', background: '#000', padding: '15px' }}>
        {['EARN', 'INVITE', 'WITHDRAW', 'PROFILE'].map(tab => (
          <div 
            key={tab} 
            onClick={() => setActiveNav(tab.toLowerCase())}
            style={{ flex: 1, textAlign: 'center', color: activeNav === tab.toLowerCase() ? '#facc15' : '#fff', fontWeight: 'bold' }}
          >
            {tab}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
