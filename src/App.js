import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_CHAT_ID: "5020977059",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODE: "EASY2", 
  REWARD_AMT: 0.001
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });

  // --- Task များအား Firebase မှ ဆွဲယူခြင်း (Sync) ---
  const fetchGlobalTasks = useCallback(async () => {
    try {
      const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`);
      const data = await res.json();
      if (data) {
        // Object ကို Array အဖြစ်ပြောင်းလဲခြင်း
        const taskList = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setCustomTasks(taskList);
      }
    } catch (e) {
      console.error("Task sync error:", e);
    }
  }, []);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
    fetchGlobalTasks();
  }, [fetchGlobalTasks]);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
  }, [balance, completed, withdrawHistory]);

  // --- Adsgram Logic (Ad တက်စေရန်) ---
  const runWithAd = (callback, isNav = false) => {
    if (isAdLoading) return;

    if (!window.Adsgram) {
      if (isNav) return callback();
      return alert("Ads system is loading... please try again in a few seconds.");
    }

    const AdController = window.Adsgram.init({ 
      blockId: APP_CONFIG.ADSGRAM_BLOCK_ID,
      debug: false // တကယ်လွှင့်ရင် false ထားပါ
    });

    setIsAdLoading(true);
    AdController.show()
      .then(() => {
        setIsAdLoading(false);
        callback();
      })
      .catch((err) => {
        setIsAdLoading(false);
        if (isNav) {
          callback(); // Nav သွားတာဆိုရင် ad မတက်လည်း ပေးသွားမယ်
        } else {
          // Ad မတက်ရတဲ့ အကြောင်းရင်းပြမယ်
          let msg = "Reward failed: Ad closed early.";
          if (err.error === 'no_ads') msg = "No ads available right now. Please turn off VPN and try again.";
          alert(msg);
        }
      });
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    
    runWithAd(() => {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);

      // Firebase သို့ data ပေးပို့ခြင်း
      fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, completed: newComp })
      });

      if (link) window.open(link, '_blank');
      alert(`Claimed! +${reward} TON`);
    });
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 100 },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px' }
  };

  const defaultBots = [
    { id: 'b_gt', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b_gm', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" }
  ];

  return (
    <div style={styles.main}>
      {/* Header */}
      <div style={{ textAlign: 'center', background: '#000', color: '#fff', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' }}>
        <small style={{ color: '#facc15' }}>BALANCE</small>
        <h1 style={{ fontSize: '40px', margin: '5px 0' }}>{balance.toFixed(5)} TON</h1>
        <div style={{ fontSize: '10px', color: isAdLoading ? '#facc15' : '#10b981' }}>
          ● {isAdLoading ? "LOADING AD..." : "SYSTEM READY"}
        </div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.card}>
            <button onClick={() => runWithAd(() => {
                const b = Number((balance + 0.0001).toFixed(5));
                setBalance(b);
                alert("Watched! +0.0001 TON");
            })} style={{...styles.btn, backgroundColor:'#ef4444'}}>📺 WATCH VIDEO (FAST TON)</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold' }}>{t}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [...defaultBots, ...customTasks.filter(ct => ct.type === 'bot')].filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}>
                <b>{t.name}</b>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>START</button>
              </div>
            ))}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
                <div>
                  <h4>ADD NEW TASK</h4>
                  <input style={styles.input} placeholder="Task Name" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
                  <input style={styles.input} placeholder="Telegram Link" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
                  <select style={styles.input} value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})}>
                    <option value="bot">BOT</option>
                    <option value="social">SOCIAL</option>
                  </select>
                  <button style={{...styles.btn, backgroundColor: '#22c55e'}} onClick={() => {
                    const id = "task_" + Date.now();
                    fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${id}.json`, {
                      method: 'PUT',
                      body: JSON.stringify({...newTask, id})
                    }).then(() => {
                      alert("Task Published!");
                      setNewTask({ name: '', link: '', type: 'bot' });
                      fetchGlobalTasks(); // ချက်ချင်း Update လုပ်မယ်
                    });
                  }}>PUBLISH TASK</button>
                </div>
            )}
          </div>
        </>
      )}

      {/* Footer Navigation */}
      <div style={styles.nav}>
        {['earn', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => runWithAd(() => setActiveNav(n), true)} style={styles.navItem(activeNav === n)}>
            {n.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
