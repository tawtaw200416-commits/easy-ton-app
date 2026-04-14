import React, { useState, useEffect } from 'react';

// Telegram WebApp Object
const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "Guest_ID",
  ADSGRAM_BLOCK_ID: "27633", 
  // Bro ရဲ့ Firebase URL ကို ဒီနေရာမှာ ထည့်ပေးရပါမယ်
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
  const [showAddTask, setShowAddTask] = useState(false);
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  // --- Firebase Data Fetching ---
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // Firebase ကနေ User Data ကို ဆွဲယူခြင်း
    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setBalance(data.balance || 0);
          setCompleted(data.completed || []);
          setWithdrawHistory(data.withdrawHistory || []);
          setReferralCount(data.referralCount || 0);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Firebase Load Error:", err);
        setLoading(false);
      });
  }, []);

  // --- Firebase Data Saving ---
  const updateFirebase = (newData) => {
    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify(newData)
    });
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount >= 0.1 && amount <= balance) {
      const newBalance = Number((balance - amount).toFixed(5));
      const newHistory = [{ id: Date.now(), amount, status: 'Pending' }, ...withdrawHistory];
      
      setBalance(newBalance);
      setWithdrawHistory(newHistory);
      updateFirebase({ balance: newBalance, withdrawHistory: newHistory });
      alert("Withdraw success! Pending for approval.");
    } else { alert("Insufficient Balance (Min 0.1)"); }
  };

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    
    const completeTask = () => {
      if (!completed.includes(id)) {
        const newBalance = Number((balance + 0.0005).toFixed(5));
        const newCompleted = [...completed, id];
        
        setBalance(newBalance);
        setCompleted(newCompleted);
        updateFirebase({ balance: newBalance, completed: newCompleted });
        alert("Reward Received! +0.0005 TON");
      }
    };

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then(completeTask).catch(() => setTimeout(completeTask, 5000));
    } else {
      setTimeout(completeTask, 5000);
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    headerCard: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 1000 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: '900' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    copyBox: { background: '#f1f5f9', padding: '12px', borderRadius: '12px', border: '1px dashed #000', marginBottom: '10px' },
    warning: { background: '#fff1f2', color: '#e11d48', padding: '15px', borderRadius: '15px', border: '1px solid #f43f5e', fontSize: '11px', marginTop: '10px' }
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>Loading Data...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.headerCard}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
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
            {activeTab === 'bot' && [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=" + APP_CONFIG.MY_UID },
              { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
              { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_" + APP_CONFIG.MY_UID },
              { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=" + APP_CONFIG.MY_UID },
              { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=" + APP_CONFIG.MY_UID },
              { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=" + APP_CONFIG.MY_UID }
            ].filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>START</button></div>
            ))}

            {activeTab === 'social' && [
              { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
              { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
              { id: 's3', name: "@cryptogold_online", link: "https://t.me/cryptogold_online_official" },
              { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
              { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
            ].filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>JOIN</button></div>
            ))}

            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Code" value={rewardInput} onChange={(e) => setRewardInput(e.target.value)} />
                <button style={styles.yellowBtn} onClick={() => { 
                  if(rewardInput==='EASY1'){ 
                    const newBalance = Number((balance + 0.0005).toFixed(5));
                    setBalance(newBalance); updateFirebase({ balance: newBalance });
                    alert("Reward Claimed!"); setRewardInput(''); 
                  } else { alert("Invalid Code!"); } 
                }}>CLAIM</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>INVITE & EARN</h2>
          <div style={styles.copyBox}>
            <small>REFERRAL LINK:</small>
            <p style={{fontSize:12, fontWeight:'bold'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => {
              navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`);
              alert("Copied!");
            }} style={styles.yellowBtn}>COPY LINK</button>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:20}}><span>Total Invites:</span><strong>{referralCount} Users</strong></div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.yellowBtn} onClick={handleWithdraw}>WITHDRAW NOW</button>
          <h4 style={{marginTop:20}}>HISTORY</h4>
          {withdrawHistory.map((h, i) => (
            <div key={i} style={styles.row}><span>{h.amount} TON</span><span style={{color:'orange'}}>{h.status}</span></div>
          ))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0, marginBottom:20}}>PROFILE</h2>
          <div style={styles.row}><span>UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
          <div style={styles.warning}>⚠️ Fraud check active. Fake referrals will be banned.</div>
        </div>
      )}

      <div style={styles.navBar}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navBtn(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
