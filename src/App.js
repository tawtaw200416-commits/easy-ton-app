import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

// သင့်ရဲ့ Admin UID နဲ့ Adsgram Block ID တွေကို ဒီမှာ စစ်ဆေးပါ
const CONFIG = {
  ADMIN_UID: "1793453606", 
  ADS_BLOCK_ID: "27611", 
  REWARD_PER_AD: 0.0005,
  TASK_REWARD: 0.001
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('user_balance')) || 0);
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('active_tasks')) || []);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('done_tasks')) || []);
  
  // Admin UID စစ်ဆေးခြင်း
  const isOwner = tg?.initDataUnsafe?.user?.id?.toString() === CONFIG.ADMIN_UID;

  useEffect(() => {
    localStorage.setItem('user_balance', balance);
    localStorage.setItem('active_tasks', JSON.stringify(tasks));
    localStorage.setItem('done_tasks', JSON.stringify(completedTasks));
  }, [balance, tasks, completedTasks]);

  // --- ကြော်ငြာပြသရန် Function ---
  const handleShowAd = () => {
    if (window.Adsgram) {
      const adController = window.Adsgram.init({ blockId: CONFIG.ADS_BLOCK_ID });
      adController.show()
        .then(() => {
          setBalance(prev => Number((prev + CONFIG.REWARD_PER_AD).toFixed(5)));
          tg.showAlert("ကြော်ငြာကြည့်ရှုမှု အောင်မြင်ပါသည်။");
        })
        .catch(() => {
          tg.showAlert("ကြော်ငြာပြသရန် အဆင်မပြေပါ။ ခဏနေမှ ထပ်ကြိုးစားပါ။");
        });
    } else {
      tg.showAlert("Adsgram နဲ့ ချိတ်ဆက်၍မရသေးပါ။");
    }
  };

  // --- Task အသစ်ထည့်ရန် (Admin Only) ---
  const addNewTask = () => {
    const name = prompt("Task အမည်ထည့်ပါ (ဥပမာ- Join Channel):");
    const link = prompt("Link ထည့်ပါ:");
    if (name && link) {
      setTasks([...tasks, { id: Date.now(), name, link }]);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#facc15', minHeight: '100vh' }}>
      
      {/* Balance Card */}
      <div style={{ background: '#111', color: '#fff', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '14px' }}>လက်ကျန်ငွေ</p>
        <h2 style={{ fontSize: '30px', margin: '10px 0' }}>{balance.toFixed(5)} TON</h2>
        <p style={{ color: '#22c55e', fontSize: '12px' }}>● အလုပ်လုပ်နေသည်</p>
      </div>

      {/* Main Ad Button */}
      <button 
        onClick={handleShowAd}
        style={{ width: '100%', padding: '15px', marginTop: '20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px' }}
      >
        📺 ဗီဒီယိုကြည့်ပြီး ငွေရှာမည် (+0.0005 TON)
      </button>

      {/* Task List Section */}
      <div style={{ marginTop: '25px' }}>
        <h3 style={{ fontSize: '18px' }}>လုပ်ဆောင်ရန် Task များ</h3>
        {tasks.length === 0 ? <p style={{ color: '#555' }}>Task များ မရှိသေးပါ။</p> : (
          tasks.map(task => (
            <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '10px' }}>
              <span>{task.name}</span>
              <button 
                disabled={completedTasks.includes(task.id)}
                onClick={() => {
                  window.open(task.link, '_blank');
                  if (!completedTasks.includes(task.id)) {
                    setBalance(prev => Number((prev + CONFIG.TASK_REWARD).toFixed(5)));
                    setCompletedTasks([...completedTasks, task.id]);
                  }
                }}
                style={{ background: completedTasks.includes(task.id) ? '#ccc' : '#000', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px' }}
              >
                {completedTasks.includes(task.id) ? "ပြီးစီး" : "လုပ်ဆောင်မည်"}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Admin Panel (Owner သာ မြင်ရမည်) */}
      {isOwner && (
        <div style={{ marginTop: '30px', borderTop: '2px solid #000', paddingTop: '10px' }}>
          <button 
            onClick={addNewTask}
            style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', borderRadius: '10px' }}
          >
            + Task အသစ်ထည့်မည် (Admin Only)
          </button>
        </div>
      )}

    </div>
  );
}

export default App;
