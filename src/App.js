import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODES: ["EASYTON1", "EASYTON2", "EASYTON3"],
  MIN_WITHDRAW: 0.1,
  REF_REWARD: 0.001,
  TASK_REWARD: 0.001,
  WATCH_REWARD: 0.0005 
};

function App() {
  const [balance, setBalance] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [depositHistory, setDepositHistory] = useState([]); // Deposit history ထည့်ထားသည်
  const [referrals, setReferrals] = useState([]);
  const [customTasks, setCustomTasks] = useState([]);
  const [dynamicCodes, setDynamicCodes] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardCode, setRewardCode] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');

  // 1. Firebase မှ Data များ ဖတ်ယူခြင်း
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
      const data = await res.json();
      if (data) {
        setBalance(Number(data.balance || 0));
        setCompleted(data.completed || []);
        setWithdrawHistory(data.withdrawHistory || []);
        setDepositHistory(data.depositHistory || []);
        setReferrals(data.referrals || []);
      }
      // Tasks & Codes
      const [tRes, cRes] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes.json`)
      ]);
      const tData = await tRes.json();
      const cData = await cRes.json();
      if (tData) setCustomTasks(Object.keys(tData).map(k => ({ ...tData[k], fbKey: k })));
      if (cData) setDynamicCodes(Object.values(cData));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. 5 မိနစ် Timer Logic (History များတွင် Status ပြောင်းရန်)
  const getStatus = (timestamp) => {
    const fiveMins = 5 * 60 * 1000;
    return (Date.now() - timestamp > fiveMins) ? "Success" : "Pending";
  };

  // 3. Task လုပ်ဆောင်ချက် (5 မိနစ်ကြာမှ Balance တိုးပေးမည့် Logic)
  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already done!");
    if (link) tg ? tg.openTelegramLink(link) : window.open(link, '_blank');

    alert("Task started! Please wait 5 minutes for verification.");
    
    // ၅ မိနစ်ပြည့်မှ Reward ပေးရန်
    setTimeout(async () => {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);
      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, completed: newComp })
      });
      alert(`Task Success! +${reward} TON added.`);
    }, 300000); // 300,000 ms = 5 mins
  };

  // 4. Withdraw (ငွေထုတ်လျှင် Balance ချက်ချင်းနှုတ်ရန်)
  const handleWithdrawRequest = async () => {
    const amt = Number(withdrawAmount);
    if (amt < APP_CONFIG.MIN_WITHDRAW) return alert("Minimum 0.1 TON");
    if (amt > balance) return alert("Insufficient balance!");

    const newBal = Number((balance - amt).toFixed(5)); // Auto နှုတ်ခြင်း
    const newReq = { amount: amt, address: withdrawAddress, timestamp: Date.now(), date: new Date().toLocaleString() };
    const newHist = [newReq, ...withdrawHistory];

    setBalance(newBal);
    setWithdrawHistory(newHist);
    
    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, withdrawHistory: newHist })
    });
    alert("Withdrawal request sent!");
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '3px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px 0', borderTop: '3px solid #fff' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px' },
    row: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }
  };

  return (
    <div style={styles.main}>
      <div style={{ textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', color: '#fff', marginBottom: '20px' }}>
        <p style={{ margin: 0 }}>BALANCE</p>
        <h1 style={{ fontSize: '40px', margin: '5px 0', color: '#facc15' }}>{balance.toFixed(5)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'REWARD'].map(t => (
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold' }}>{t}</button>
            ))}
          </div>
          <div style={styles.card}>
            {activeTab === 'bot' && [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" },
              { id: 'b2', name: "Golden Miner", link: "https://t.me/GoldenMiner" }
            ].map(t => (
              <div key={t.id} style={styles.row}><span>{t.name}</span><button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ width: '80px', background: '#000', color: '#fff', borderRadius: '8px' }}>START</button></div>
            ))}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw TON</h3>
          <input style={styles.input} type="number" placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={styles.btn} onClick={handleWithdrawRequest}>WITHDRAW NOW</button>
          
          <h4 style={{ marginTop: '20px' }}>History</h4>
          {withdrawHistory.map((h, i) => (
            <div key={i} style={styles.row}>
              <div><b>{h.amount} TON</b><br/><small>{h.date}</small></div>
              <div style={{ color: getStatus(h.timestamp) === 'Success' ? 'green' : 'orange' }}>{getStatus(h.timestamp)}</div>
            </div>
          ))}
        </div>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Invite Friends</h3>
          <p>Earn {APP_CONFIG.REF_REWARD} TON per friend</p>
          <button style={styles.btn} onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!"); }}>COPY LINK</button>
          <h4 style={{ marginTop: '20px' }}>Invite History</h4>
          {referrals.map((r, i) => (
            <div key={i} style={styles.row}><span>User ID: {r.id}</span><span style={{ color: 'green' }}>+0.001 TON</span></div>
          ))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>My Profile</h3>
          <div style={styles.row}><span>User ID:</span> <b>{APP_CONFIG.MY_UID}</b></div>
          <div style={styles.row}><span>Total Balance:</span> <b>{balance.toFixed(5)} TON</b></div>
          <div style={styles.row}><span>Status:</span> <b style={{ color: 'green' }}>Active</b></div>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, textAlign: 'center', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '12px' }}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
