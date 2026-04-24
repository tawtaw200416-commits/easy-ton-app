import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODES: [
    "EASYTON1", "EASYTON2", "EASYTON3", "EASYTON4", "EASYTON5",
    "EASYTON6", "EASYTON7", "EASYTON8", "EASYTON9", "EASYTON10"
  ],
  MIN_WITHDRAW: 0.1,
  REF_REWARD: 0.001,
  TASK_REWARD: 0.001,
  WATCH_REWARD: 0.0005 
};

function App() {
  const [balance, setBalance] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [depositHistory, setDepositHistory] = useState([]); // Deposit History အသစ်ထည့်သွင်းမှု
  const [referrals, setReferrals] = useState([]);
  const [customTasks, setCustomTasks] = useState([]);
  const [dynamicCodes, setDynamicCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardCode, setRewardCode] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');

  // 1. Firebase မှ Data များ တိုက်ရိုက်ဖတ်ယူခြင်း
  const fetchData = useCallback(async () => {
    try {
      const [userRes, tasksRes, codesRes] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes.json`)
      ]);
      const userData = await userRes.json();
      const tasksData = await tasksRes.json();
      const codesData = await codesRes.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setDepositHistory(userData.depositHistory || []); // Deposit ဖတ်ခြင်း
        setReferrals(userData.referrals || []);
      }
      if (tasksData) setCustomTasks(Object.values(tasksData));
      if (codesData) setDynamicCodes(Object.values(codesData));
    } catch (e) { console.error("Sync Error:", e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
  }, [fetchData]);

  // 2. ၅ မိနစ်ပြည့်မပြည့် စစ်ဆေးသည့် Logic (History များအတွက်)
  const checkStatus = (timestamp) => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return (now - timestamp >= fiveMinutes) ? "Complete" : "Pending";
  };

  // 3. Task လုပ်ဆောင်ချက် (၅ မိနစ်စောင့်ပြီးမှ Balance တိုးပေးမည့် Logic)
  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    if (link) tg ? tg.openTelegramLink(link) : window.open(link, '_blank');

    alert("Verification in progress... Please wait 5 minutes.");

    // Timer စတင် (ဥပမာအနေနဲ့ ချက်ချင်း Register လုပ်ထားပြီး ၅ မိနစ်နေမှ Check လုပ်ခိုင်းတာမျိုး)
    setTimeout(async () => {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);
      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, completed: newComp })
      });
      alert(`Success! +${reward} TON added to balance.`);
    }, 300000); // 300,000 ms = 5 mins
  };

  // 4. Withdrawal (ငွေထုတ်လျှင် Auto နှုတ်ခြင်း)
  const handleWithdrawRequest = async () => {
    const amount = Number(withdrawAmount);
    if (amount < APP_CONFIG.MIN_WITHDRAW) return alert(`Minimum is ${APP_CONFIG.MIN_WITHDRAW}`);
    if (amount > balance) return alert("Insufficient balance!");

    const newBal = Number((balance - amount).toFixed(5)); // Balance အရင်နှုတ်
    const transaction = { 
      amount, 
      address: withdrawAddress, 
      timestamp: Date.now(), 
      date: new Date().toLocaleString() 
    };
    const newHistory = [transaction, ...withdrawHistory];

    setBalance(newBal);
    setWithdrawHistory(newHistory);
    
    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, withdrawHistory: newHistory })
    });
    alert("Withdrawal request sent! Checking process takes 5 mins.");
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '20px', color: '#fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '3px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px 0' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>CURRENT BALANCE</small>
        <h1 style={{ fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === tab.toLowerCase() ? '#000' : '#fff', color: activeTab === tab.toLowerCase() ? '#fff' : '#000', border: '2px solid #000', borderRadius: '10px' }}>{tab}</button>
            ))}
          </div>
          <div style={styles.card}>
            {activeTab === 'bot' && [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" },
              { id: 'b2', name: "Golden Miner", link: "https://t.me/GoldenMiner" }
            ].map(task => (
              <div key={task.id} style={styles.row}>
                <b>{task.name}</b>
                <button onClick={() => handleTaskReward(task.id, 0.001, task.link)} style={{ width: '80px', padding: '8px', background: '#000', color: '#fff', borderRadius: '8px' }}>START</button>
              </div>
            ))}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Referral Program</h3>
          <p>Earn 0.001 TON per invite</p>
          <div style={{ background: '#eee', padding: '10px', borderRadius: '10px', fontSize: '11px', wordBreak: 'break-all' }}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</div>
          <button style={{ ...styles.btn, marginTop: '10px' }} onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!"); }}>COPY LINK</button>
          
          <h4 style={{ marginTop: '20px' }}>Invite History</h4>
          {referrals.length === 0 ? <p>No invites yet.</p> : referrals.map((ref, index) => (
            <div key={index} style={styles.row}><span>User ID: {ref.id}</span> <span style={{ color: 'green' }}>+0.001 TON</span></div>
          ))}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw TON</h3>
          <input style={styles.input} type="number" placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={{ ...styles.btn, background: '#3b82f6' }} onClick={handleWithdrawRequest}>WITHDRAW NOW</button>
          
          <h4 style={{ marginTop: '20px' }}>Transaction History</h4>
          {withdrawHistory.map((h, i) => (
            <div key={i} style={styles.row}>
              <div><b>{h.amount} TON</b><br/><small>{h.date}</small></div>
              <div style={{ color: checkStatus(h.timestamp) === 'Complete' ? 'green' : 'orange' }}>● {checkStatus(h.timestamp)}</div>
            </div>
          ))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#000', margin: '0 auto 10px' }}></div>
            <h3 style={{ margin: 0 }}>User Profile</h3>
          </div>
          <div style={styles.row}><span>Status:</span> <b style={{ color: 'green' }}>Verified</b></div>
          <div style={styles.row}><span>User ID:</span> <b>{APP_CONFIG.MY_UID}</b></div>
          <div style={styles.row}><span>Current Balance:</span> <b>{balance.toFixed(5)} TON</b></div>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, textAlign: 'center', color: activeNav === n ? '#facc15' : '#fff', fontSize: '12px', fontWeight: 'bold' }}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
