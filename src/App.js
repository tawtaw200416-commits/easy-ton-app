import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "Guest_ID",
  ADSGRAM_BLOCK_ID: "27633", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com" 
};

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const updateFirebase = (newData) => {
    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify(newData)
    });
  };

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }

    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setBalance(data.balance || 0);
          setCompleted(data.completed || []);
          setWithdrawHistory(data.withdrawHistory || []);
          setReferralCount(data.referralCount || 0);
        } else {
          const localBal = Number(localStorage.getItem('ton_bal')) || 0;
          setBalance(localBal);
          updateFirebase({ balance: localBal });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // --- Task Handling Logic ---
  const handleTaskAction = (id, link, reward = 0.0005) => {
    window.open(link, '_blank');
    
    // Social task တွေအတွက် verification delay ထည့်ပေးထားပါတယ်
    const verifyAndReward = () => {
      if (!completed.includes(id)) {
        const newBalance = Number((balance + reward).toFixed(5));
        const newCompleted = [...completed, id];
        setBalance(newBalance);
        setCompleted(newCompleted);
        updateFirebase({ balance: newBalance, completed: newCompleted });
        alert(`Task Completed! +${reward} TON Received.`);
      }
    };

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then(verifyAndReward).catch(() => setTimeout(verifyAndReward, 5000));
    } else {
      // Adsgram မရှိရင် ၅ စက္ကန့် စောင့်ခိုင်းမယ်
      setTimeout(verifyAndReward, 5000);
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    headerCard: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.headerCard}>
        <small style={{ color: '#facc15' }}>TOTAL EARNED</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:'18px', color: '#facc15'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t ? '#000' : '#fff', color: activeTab === t ? '#fff' : '#000', fontWeight: '900' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'social' && [
              { id: 's1', name: "Join @GrowTeaNews", link: "https://t.me/GrowTeaNews" },
              { id: 's2', name: "Join @GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
              { id: 's3', name: "Join @cryptogold_online", link: "https://t.me/cryptogold_online_official" },
              { id: 's10', name: "Join @easytonfree", link: "https://t.me/easytonfree" }
            ].filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}>
                <span><b>{t.name}</b><br/><small>Reward: 0.0005 TON</small></span>
                <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>JOIN</button>
              </div>
            ))}

            {activeTab === 'bot' && [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=" + APP_CONFIG.MY_UID },
              { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=" + APP_CONFIG.MY_UID }
            ].filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}>
                <b>{t.name}</b>
                <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>START</button>
              </div>
            ))}
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{textAlign:'center'}}>USER PROFILE</h3>
          <div style={styles.row}><span>User UID:</span> <strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Referral Count:</span> <strong>{referralCount} Users</strong></div>
          <div style={{marginTop: 20}}>
             <button onClick={() => {
                navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`);
                alert("Invite Link Copied!");
             }} style={styles.yellowBtn}>COPY REFERRAL LINK</button>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <div style={styles.navBar}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{flex:1, textAlign:'center', color: activeNav===n ? '#facc15' : '#fff', fontWeight:'900', fontSize:'12px'}}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
