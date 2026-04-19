import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const CONFIG = {
  ADMIN_UID: "1793453606", 
  ADS_BLOCK_ID: "27611", 
  REWARD_AD: 0.0005,
  REWARD_TASK: 0.001
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('sys_tasks')) || []);
  const [done, setDone] = useState(() => JSON.parse(localStorage.getItem('done_list')) || []);
  
  const isOwner = tg?.initDataUnsafe?.user?.id?.toString() === CONFIG.ADMIN_UID;

  useEffect(() => {
    localStorage.setItem('ton_bal', balance);
    localStorage.setItem('sys_tasks', JSON.stringify(tasks));
    localStorage.setItem('done_list', JSON.stringify(done));
  }, [balance, tasks, done]);

  // Adsgram Ad Handler with Fix
  const showAd = () => {
    if (window.Adsgram) {
      const adController = window.Adsgram.init({ blockId: CONFIG.ADS_BLOCK_ID });
      adController.show()
        .then(() => {
          setBalance(prev => Number((prev + CONFIG.REWARD_AD).toFixed(5)));
          tg.showAlert("Reward added successfully!");
        })
        .catch(() => {
          tg.showAlert("Ad not available. Try again later.");
        });
    } else {
      tg.showAlert("Connection Error: Adsgram SDK not loaded.");
    }
  };

  const addStaticTask = () => {
    const name = prompt("Enter Task Name:");
    const link = prompt("Enter Task Link:");
    if (name && link) {
      setTasks([...tasks, { id: Date.now(), name, link }]);
    }
  };

  return (
    <div style={{ padding: '15px', backgroundColor: '#facc15', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Balance Card */}
      <div style={{ background: '#000', color: '#fff', padding: '25px', borderRadius: '20px', textAlign: 'center' }}>
        <p style={{ margin: 0, opacity: 0.7 }}>BALANCE</p>
        <h1 style={{ fontSize: '32px', margin: '10px 0' }}>{balance.toFixed(5)} TON</h1>
        <div style={{ fontSize: '10px', color: '#4ade80' }}>● SYSTEM ACTIVE</div>
      </div>

      {/* Ad Button */}
      <button 
        onClick={showAd}
        style={{ width: '100%', padding: '15px', marginTop: '20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
      >
        WATCH VIDEO (+0.0005 TON)
      </button>

      {/* Tasks Section */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ fontSize: '16px', color: '#333' }}>AVAILABLE TASKS</h3>
        {tasks.length === 0 ? <p style={{ color: '#666' }}>No tasks available yet.</p> : (
          tasks.map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <span style={{ fontWeight: '500' }}>{t.name}</span>
              <button 
                disabled={done.includes(t.id)}
                onClick={() => {
                  window.open(t.link, '_blank');
                  if (!done.includes(t.id)) {
                    setBalance(prev => Number((prev + CONFIG.REWARD_TASK).toFixed(5)));
                    setDone([...done, t.id]);
                  }
                }}
                style={{ background: done.includes(t.id) ? '#999' : '#000', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px' }}
              >
                {done.includes(t.id) ? "DONE" : "START"}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Admin Control */}
      {isOwner && (
        <div style={{ marginTop: '40px', borderTop: '1px solid #000', paddingTop: '15px' }}>
          <button 
            onClick={addStaticTask}
            style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', borderRadius: '10px', fontSize: '13px' }}
          >
            + ADD SYSTEM TASK (ADMIN)
          </button>
        </div>
      )}

    </div>
  );
}

export default App;
