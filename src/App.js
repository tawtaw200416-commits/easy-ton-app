import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.001,
  REFER_REWARD: 0.001 
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem('refs')) || []);
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');

  // Status Check Function
  const checkStatus = (timestamp) => {
    if (!timestamp) return "Pending";
    return (Date.now() - timestamp >= 300000) ? "Success" : "Pending";
  };

  // LocalStorage Save
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('refs', JSON.stringify(referrals));
  }, [balance, completed, withdrawHistory, referrals]);

  // Data Fetch from Firebase
  const fetchData = useCallback(async () => {
    try {
      const [u, t] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setCompleted(userData.completed || []);
        // Withdraw History က null ဖြစ်နေရင် [] empty array ပေးမယ်
        setWithdrawHistory(userData.withdrawHistory || []);
        // Referrals က null ဖြစ်နေရင် [] empty array ပေးမယ်
        setReferrals(userData.referrals || []);
      }
      if (tasksData) setCustomTasks(Object.values(tasksData));
    } catch (e) { console.error("Fetch Error:", e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleWithdraw = () => {
    const amt = Number(withdrawAmount);
    if (amt < APP_CONFIG.MIN_WITHDRAW) return alert(`Min withdraw is ${APP_CONFIG.MIN_WITHDRAW} TON`);
    if (amt > balance) return alert(`Insufficient balance! Max: ${balance.toFixed(5)}`);

    const entry = { 
      amount: amt, 
      address: withdrawAddress, 
      timestamp: Date.now(), 
      date: new Date().toLocaleString() 
    };

    const newHistory = [entry, ...withdrawHistory]; // အဟောင်းထဲကို အသစ်ထည့်
    const newBal = Number((balance - amt).toFixed(5));

    setWithdrawHistory(newHistory);
    setBalance(newBal);
    setWithdrawAmount('');
    setWithdrawAddress('');

    // Firebase Update
    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, withdrawHistory: newHistory })
    });

    alert("Withdrawal Pending! Success after 5 mins.");
  };

  // Styles (Shortened for brevity)
  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' }
  };

  return (
    <div style={styles.main}>
      {/* Header Balance */}
      <div style={{ textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff' }}>
        <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
      </div>

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3>Withdraw</h3>
            <input style={styles.input} placeholder="TON Amount" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background: '#3b82f6'}} onClick={handleWithdraw}>WITHDRAW</button>
          </div>

          <div style={styles.card}>
            <h4>Withdraw History</h4>
            {withdrawHistory.length === 0 ? <p style={{fontSize: '12px'}}>No records found.</p> : 
              withdrawHistory.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <div style={{fontSize:11}}><b>{h.amount} TON</b><br/>{h.date}</div>
                  <div style={{ color: checkStatus(h.timestamp) === 'Success' ? 'green' : 'orange', fontWeight: 'bold' }}>{checkStatus(h.timestamp)}</div>
                </div>
              ))
            }
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Refer & Earn</h3>
          <button style={styles.btn} onClick={() => { 
            navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); 
            alert("Referral Link Copied!"); 
          }}>COPY REFERRAL LINK</button>
          
          <h4 style={{marginTop: '25px'}}>Invite History ({referrals.length})</h4>
          {referrals.length === 0 ? <p style={{fontSize: '12px'}}>No referrals yet.</p> : 
            referrals.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontSize: '13px'}}>User ID: {r.id || r}</span>
                <b style={{color: 'green'}}>+{APP_CONFIG.REFER_REWARD} TON</b>
              </div>
            ))
          }
        </div>
      )}

      {/* Nav Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px' }}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold' }}>{n.toUpperCase()}</button>
        ))}
      </div>
    </div>
  );
}

export default App;
