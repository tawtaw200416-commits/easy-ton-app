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
  REWARD_CODE: "EASY3",
  REWARD_AMT: 0.001
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
  const [isAdLoading, setIsAdLoading] = useState(false);

  // LocalStorage အမြဲ Update ဖြစ်နေအောင် သိမ်းတာ
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('refs', JSON.stringify(referrals));
  }, [balance, completed, withdrawHistory, referrals]);

  // Firebase ကနေ Data ပြန်ခေါ်တာ (History မပျောက်အောင်)
  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
      const data = await res.json();
      if (data) {
        setBalance(Number(data.balance || 0));
        setCompleted(data.completed || []);
        setWithdrawHistory(data.withdrawHistory || []);
        setReferrals(data.referrals || []);
      }
      const tasksRes = await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`);
      const tasksData = await tasksRes.json();
      if (tasksData) setCustomTasks(Object.values(tasksData));
    } catch (e) { console.error("Data Sync Error:", e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchUserData();
  }, [fetchUserData]);

  // ကြော်ငြာကြည့်ခိုင်းတဲ့ Logic (အင်္ဂလိပ်စာသားဖြင့်)
  const runWithAd = (onSuccess) => {
    if (isAdLoading) return;
    if (window.Adsgram) {
      setIsAdLoading(true);
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(() => { 
            setIsAdLoading(false); 
            onSuccess(); 
        })
        .catch(() => { 
            setIsAdLoading(false); 
            alert("You must watch the ad until the end to get TON."); // ပြောင်းခိုင်းထားတဲ့ English စာ
        });
    } else {
      alert("Adsgram Not Connected!");
    }
  };

  // ခလုတ်တိုင်းမှာ ကြော်ငြာအရင်ပြမယ့် Navigation Function
  const handleNavClick = (nav) => {
    runWithAd(() => {
      setActiveNav(nav);
    });
  };

  // Reward ပေးတဲ့အခါ Adsgram အောင်မြင်မှ ပေးတာ
  const handleClaim = (id, reward, link) => {
    if (completed.includes(id)) return alert("Task Already Done!");
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
    });
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', color: '#fff', marginBottom: '20px' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', background: '#000', padding: '15px 0' },
    navBtn: (active) => ({ flex: 1, color: active ? '#facc15' : '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: '12px' })
  };

  if (loading) return <div style={{textAlign:'center', padding: '50px'}}>Loading Your Data...</div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>CURRENT BALANCE</small>
        <h1 style={{fontSize: '35px'}}>{balance.toFixed(5)} TON</h1>
        <div style={{color: '#10b981'}}>● ACTIVE STATUS</div>
      </div>

      {activeNav === 'earn' && (
        <div style={styles.card}>
          <h3 style={{marginTop:0}}>EARN TON</h3>
          {/* Default Task List များ... */}
          <button onClick={() => handleClaim('video_1', 0.0002)} style={{width:'100%', padding:'10px', background:'#ef4444', color:'#fff', borderRadius:'10px', border:'none', fontWeight:'bold'}}>WATCH AD VIDEO (+0.0002)</button>
        </div>
      )}

      {/* History တွေကို ဒီ Withdraw Nav အောက်မှာ ပြန်ထည့်ထားပါတယ် */}
      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW HISTORY</h3>
          {withdrawHistory.length > 0 ? withdrawHistory.map((h, i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #eee', padding:'10px 0'}}>
              <span>{h.amount} TON</span>
              <span style={{color: h.status === 'Pending' ? '#f59e0b' : '#10b981'}}>{h.status}</span>
            </div>
          )) : <p>No history found.</p>}
        </div>
      )}

      {/* ခလုတ်တိုင်းကို handleNavClick သုံးပြီး ကြော်ငြာအရင်တက်အောင် လုပ်ထားပါတယ် */}
      <div style={styles.nav}>
        <div onClick={() => handleNavClick('earn')} style={styles.navBtn(activeNav === 'earn')}>EARN</div>
        <div onClick={() => handleNavClick('invite')} style={styles.navBtn(activeNav === 'invite')}>INVITE</div>
        <div onClick={() => handleNavClick('withdraw')} style={styles.navBtn(activeNav === 'withdraw')}>WITHDRAW</div>
        <div onClick={() => handleNavClick('profile')} style={styles.navBtn(activeNav === 'profile')}>PROFILE</div>
      </div>
    </div>
  );
}

export default App;
