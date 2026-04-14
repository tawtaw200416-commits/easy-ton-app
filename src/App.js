import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com" 
};

function App() {
  // Initial state တွေကို null သတ်မှတ်ထားခြင်းဖြင့် load လုပ်နေစဉ်မှာ data အဟောင်းနဲ့မရောအောင် တားထားပါမယ်
  const [balance, setBalance] = useState(null); 
  const [completed, setCompleted] = useState(null);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [customTasks, setCustomTasks] = useState([]); 
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const syncToFirebase = (path, data) => {
    // Loading မပြီးသေးရင် Database ထဲကို overwrite မလုပ်အောင် တားထားခြင်း
    if (loading) return; 
    fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }

    const loadUserData = async () => {
      try {
        const [userRes, tasksRes] = await Promise.all([
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
          fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
        ]);
        
        const userData = await userRes.json();
        const tasksData = await tasksRes.json();

        if (userData) {
          // Firebase မှာရှိနေတဲ့ data အစစ်ကိုပဲယူမယ်
          setBalance(userData.balance ?? 0);
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferralCount(userData.referralCount || 0);
        } else {
          // User အသစ်ဖြစ်နေရင် Register လုပ်မယ်
          const initialUser = { balance: 0, completed: [], withdrawHistory: [], referralCount: 0 };
          await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PUT',
            body: JSON.stringify(initialUser)
          });
          setBalance(0);
          setCompleted([]);
        }

        if (tasksData) setCustomTasks(Object.values(tasksData));
        setLoading(false);
      } catch (e) {
        console.error("Load error:", e);
      }
    };

    loadUserData();
  }, []);

  const handleTaskAction = (id, link) => {
    if (loading || (completed && completed.includes(id))) return;
    window.open(link, '_blank');

    const giveReward = () => {
      const newBalance = Number((balance + 0.0005).toFixed(5));
      const newCompleted = [...completed, id];
      setBalance(newBalance);
      setCompleted(newCompleted);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, completed: newCompleted });
      alert("Success! Reward Added.");
    };

    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(giveReward).catch(() => setTimeout(giveReward, 3000));
    } else {
      setTimeout(giveReward, 5000);
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '20px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    header: { textAlign: 'center', background: '#000', color: '#fff', padding: '20px', borderRadius: '20px', border: '2px solid #fff', marginBottom: '15px' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px 0' },
    btn: { backgroundColor: '#000', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 'bold' }
  };

  // Loading Screen: Data မရခင်အထိ ဒီမှာပဲ စောင့်နေပါမယ်
  if (loading || balance === null) {
    return (
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15', flexDirection:'column'}}>
        <div style={{border: '4px solid #000', borderTop: '4px solid #fff', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite'}}></div>
        <b style={{marginTop:'15px'}}>SYNCING WITH FIREBASE...</b>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{color:'#facc15'}}>AVAILABLE BALANCE</small>
        <h1 style={{margin:0}}>{balance.toFixed(5)} TON</h1>
      </div>

      <div style={styles.card}>
        <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
          {['bot', 'social'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{flex:1, padding:'10px', background: activeTab===t ? '#000':'#eee', color: activeTab===t ? '#fff':'#000', borderRadius:'10px', border:'1px solid #000'}}>{t.toUpperCase()}</button>
          ))}
        </div>

        {activeTab === 'bot' && [
          { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" },
          { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot" }
        ].concat(customTasks.filter(t => t.type === 'bot')).map(t => (
          <div key={t.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #eee'}}>
            <b>{t.name}</b>
            <button onClick={() => handleTaskAction(t.id, t.link)} disabled={completed.includes(t.id)} style={{...styles.btn, backgroundColor: completed.includes(t.id) ? '#ccc' : '#000'}}>
              {completed.includes(t.id) ? 'DONE' : 'START'}
            </button>
          </div>
        ))}
      </div>

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{flex:1, textAlign:'center', color: activeNav===n ? '#facc15':'#fff', fontSize:'11px', fontWeight:'bold'}}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
