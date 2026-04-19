import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

// ပရောဂျက်ရဲ့ အခြေခံ သတ်မှတ်ချက်များ
const APP_CONFIG = {
  ADMIN_UID: "1793453606", // သင့်ရဲ့ UID
  ADS_BLOCKS: ["27611", "27633"], // Adsgram Block IDs
  TASK_REWARD: 0.001,
  VIDEO_REWARD: 0.0005, //
  REFER_REWARD: 0.001,  //
  CODE_REWARD_AMOUNT: 0.0005, //
  REWARD_CODE: "YTTPO", // သတ်မှတ်ထားတဲ့ Code
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot"
};

const USER_UID = tg?.initDataUnsafe?.user?.id?.toString() || "Guest_User";

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [adminTasks, setAdminTasks] = useState(() => JSON.parse(localStorage.getItem('adm_tasks')) || []);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // Admin Form States
  const [newTitle, setNewTitle] = useState('');
  const [newLink, setNewLink] = useState('');

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('adm_tasks', JSON.stringify(adminTasks));
  }, [balance, completed, adminTasks]);

  // ကြော်ငြာပြသရန် Function
  const showAd = (callback) => {
    const blockId = APP_CONFIG.ADS_BLOCKS[Math.floor(Math.random() * APP_CONFIG.ADS_BLOCKS.length)];
    if (window.Adsgram) {
      window.Adsgram.init({ blockId }).show()
        .then(() => { if (callback) callback(); })
        .catch((err) => { 
          console.error("Ad error:", err);
          if (callback) callback(); // Error တက်ရင်လည်း ပေးလုပ်မယ်
        });
    } else {
      alert("Adsgram Not Connected!");
      if (callback) callback();
    }
  };

  const handleTask = (id, link, reward) => {
    showAd(() => {
      window.open(link, '_blank');
      if (!completed.includes(id)) {
        setBalance(prev => Number((prev + reward).toFixed(5)));
        setCompleted(prev => [...prev, id]);
      }
    });
  };

  return (
    <div style={{ backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', fontFamily: 'sans-serif' }}>
      
      {/* Balance Card */}
      <div style={{ background: '#111', color: '#fff', padding: '25px', borderRadius: '20px', textAlign: 'center', marginBottom: '20px' }}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ fontSize: '40px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize: '15px'}}>TON</span></h1>
        <div style={{ color: '#22c55e', fontSize: '12px' }}>● ACTIVE STATUS</div>
      </div>

      {activeNav === 'earn' && (
        <>
          {/* Admin အိုင်ဒီတူမှသာ ပေါ်မည့် Panel */}
          {USER_UID === APP_CONFIG.ADMIN_UID && (
            <div style={{ background: '#fff', padding: '15px', borderRadius: '15px', border: '3px solid red', marginBottom: '15px' }}>
              <h4 style={{ color: 'red', marginTop: 0 }}>ADMIN ONLY PANEL</h4>
              <button 
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', borderRadius: '10px' }}
              >
                {showAdminPanel ? "CLOSE" : "ADD NEW SYSTEM TASK"}
              </button>
              
              {showAdminPanel && (
                <div style={{ marginTop: '10px' }}>
                  <input style={{ width: '90%', padding: '10px', marginBottom: '5px' }} placeholder="Channel/Bot Name" value={newTitle} onChange={e=>setNewTitle(e.target.value)} />
                  <input style={{ width: '90%', padding: '10px', marginBottom: '10px' }} placeholder="Link" value={newLink} onChange={e=>setNewLink(e.target.value)} />
                  <button 
                    onClick={() => {
                      if(newTitle && newLink) {
                        setAdminTasks([...adminTasks, { id: Date.now(), name: newTitle, link: newLink }]);
                        setNewTitle(''); setNewLink('');
                      }
                    }}
                    style={{ width: '100%', padding: '10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '10px' }}
                  >PUBLISH TASK</button>
                </div>
              )}
            </div>
          )}

          <button 
            style={{ width: '100%', padding: '15px', background: '#ef4444', color: '#fff', borderRadius: '15px', fontWeight: 'bold', border: 'none', marginBottom: '15px' }}
            onClick={() => showAd(() => setBalance(prev => prev + APP_CONFIG.VIDEO_REWARD))}
          >
            📺 WATCH VIDEO (+{APP_CONFIG.VIDEO_REWARD} TON)
          </button>

          <div style={{ background: '#fff', padding: '15px', borderRadius: '20px', border: '2px solid #000' }}>
            {/* Admin ထည့်ထားတဲ့ Task များကို ပြသခြင်း */}
            {adminTasks.map(task => (
              <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span>{task.name}</span>
                <button 
                  disabled={completed.includes(task.id)}
                  onClick={() => handleTask(task.id, task.link, APP_CONFIG.TASK_REWARD)}
                  style={{ background: completed.includes(task.id) ? '#ccc' : '#000', color: '#fff', padding: '5px 15px', borderRadius: '8px' }}
                >
                  {completed.includes(task.id) ? "DONE" : "JOIN"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Navigation Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', background: '#000', padding: '15px' }}>
        {['EARN', 'INVITE', 'WITHDRAW', 'PROFILE'].map(tab => (
          <div 
            key={tab} 
            onClick={() => setActiveNav(tab.toLowerCase())}
            style={{ flex: 1, textAlign: 'center', color: activeNav === tab.toLowerCase() ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '12px' }}
          >
            {tab}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
