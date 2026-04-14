import React, { useState, useEffect, useRef } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk", // Admin ဆီ စာပို့ရန်
  ADMIN_CHAT_ID: "5020977059",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot"
};

function App() {
  // --- LocalStorage Persistence ---
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem('refs')) || []);
  const [loading, setLoading] = useState(true);
  
  const [customTasks, setCustomTasks] = useState([]); 
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');

  const isSyncReady = useRef(false);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('refs', JSON.stringify(referrals));
  }, [balance, completed, withdrawHistory, referrals]);

  const syncToFirebase = (path, data) => {
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  const sendAdminNotify = (msg) => {
    fetch(`https://api.telegram.org/bot${APP_CONFIG.ADMIN_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: APP_CONFIG.ADMIN_CHAT_ID, text: msg })
    });
  };

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    const initApp = async () => {
      try {
        const [userRes, tasksRes] = await Promise.all([
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
          fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
        ]);
        const userData = await userRes.json();
        const tasksData = await tasksRes.json();

        if (userData) {
          setBalance(Number(userData.balance));
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferrals(userData.referrals || []);
        } else {
          // New user referral check
          const startParam = tg?.initDataUnsafe?.start_param;
          if (startParam && startParam !== APP_CONFIG.MY_UID) {
            handleReferral(startParam);
          }
          await syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: 0, completed: [], referrals: [] });
        }
        if (tasksData) setCustomTasks(Object.values(tasksData));
        isSyncReady.current = true;
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    initApp();
  }, []);

  const handleReferral = async (referrerId) => {
    const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${referrerId}.json`);
    const refData = await res.json();
    if (refData) {
      const newRefBal = Number((refData.balance + 0.0005).toFixed(5));
      const newRefList = [...(refData.referrals || []), { id: APP_CONFIG.MY_UID, date: Date.now() }];
      await syncToFirebase(`users/${referrerId}`, { balance: newRefBal, referrals: newRefList });
    }
  };

  const watchVideoAd = () => {
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(() => {
          const newBal = Number((balance + 0.0001).toFixed(5));
          setBalance(newBal);
          syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal });
          alert("Watched! +0.0001 TON Added");
        }).catch(() => alert("Ad not ready. Try again."));
    }
  };

  const handleWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (amt >= 0.1 && balance >= amt && withdrawAddress.length > 10) {
      const nb = Number((balance - amt).toFixed(5));
      const nh = [{ id: Date.now(), amount: amt, address: withdrawAddress, status: 'Pending', time: Date.now() }, ...withdrawHistory];
      setBalance(nb);
      setWithdrawHistory(nh);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: nb, withdrawHistory: nh });
      sendAdminNotify(`💰 New Withdraw!\nUID: ${APP_CONFIG.MY_UID}\nAmount: ${amt} TON\nWallet: ${withdrawAddress}`);
      alert("Withdrawal submitted! Success in 24h.");
      setWithdrawAmount(''); setWithdrawAddress('');
    } else { alert("Minimum 0.1 TON & Valid Address required!"); }
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 100 },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    promoBox: { backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '12px', border: '1px dashed #000', margin: '10px 0' },
    copyBtn: { backgroundColor: '#facc15', border: '1px solid #000', borderRadius: '8px', padding: '5px 10px', fontSize: '10px', fontWeight: 'bold' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981', fontWeight:'bold'}}>● ACCOUNT ACTIVE</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.card}>
            <p style={{margin:'0 0 10px 0', fontWeight:'bold', textAlign:'center'}}>🎥 EARN BY WATCHING</p>
            <button onClick={watchVideoAd} style={{...styles.btn, backgroundColor:'#ef4444'}}>WATCH VIDEO (+0.0001 TON)</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'REWARD'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t.toLowerCase()); setShowAddPromo(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold', fontSize: '10px' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=" + APP_CONFIG.MY_UID },
              { id: 'b2', name: "Golden Miner", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
              { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_" + APP_CONFIG.MY_UID }
            ].filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => window.open(t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>START</button></div>
            ))}

            {activeTab === 'social' && (
              <>
                <button style={{...styles.btn, backgroundColor:'#facc15', color:'#000', border:'2px solid #000', marginBottom:'15px'}} onClick={() => setShowAddPromo(!showAddPromo)}>+ ADD TASK (PROMOTE)</button>
                {showAddPromo ? (
                  <div>
                    <div style={styles.promoBox}>
                      <div style={styles.row}><span>TON ADDR: {APP_CONFIG.ADMIN_WALLET.slice(0,10)}...</span><button style={styles.copyBtn} onClick={() => {navigator.clipboard.writeText(APP_CONFIG.ADMIN_WALLET); alert("Copied!");}}>COPY ADDR</button></div>
                      <div style={styles.row}><span>MEMO: {APP_CONFIG.MY_UID}</span><button style={styles.copyBtn} onClick={() => {navigator.clipboard.writeText(APP_CONFIG.MY_UID); alert("Copied!");}}>COPY ID</button></div>
                    </div>
                    <button style={styles.btn} onClick={() => window.open(APP_CONFIG.HELP_BOT)}>SEND PAYMENT PROOF</button>
                  </div>
                ) : (
                  [{id:'s1', name:'@easytonfree', link:'https://t.me/easytonfree'}].map(t => (
                    <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => window.open(t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>JOIN</button></div>
                  ))
                )}
              </>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>REFERRAL PROGRAM</h2>
          <p style={{textAlign:'center', fontSize:12}}>Invite Friends: <b>1 Refer = 0.0005 TON</b><br/>Earn <b>10% LIFETIME COMMISSION</b> from their tasks!</p>
          <div style={styles.promoBox}>
            <p style={{fontSize:10, wordBreak:'break-all'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!");}} style={styles.btn}>COPY LINK</button>
          </div>
          <h4 style={{marginBottom:10}}>Invite History</h4>
          {referrals.map((r, i) => (
            <div key={i} style={styles.row}><span>User ID: {r.id}</span><b style={{color:'#10b981'}}>Complete</b></div>
          ))}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW TON</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="Enter TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={styles.btn} onClick={handleWithdraw}>WITHDRAW NOW</button>
          <h4 style={{marginTop:20}}>History</h4>
          {withdrawHistory.map((h, i) => {
            const isOld = Date.now() - h.time > 86400000;
            return (
              <div key={i} style={styles.row}>
                <span>{h.amount} TON</span>
                <span style={{color: isOld ? '#10b981' : 'orange', fontWeight:'bold'}}>{isOld ? 'Success' : h.status}</span>
              </div>
            );
          })}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>USER PROFILE</h2>
          <div style={styles.row}><span>Account Status:</span><b style={{color:'#10b981'}}>ACTIVE</b></div>
          <div style={styles.row}><span>User UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Total Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
          <button style={{...styles.btn, marginTop:20, backgroundColor:'#3b82f6'}} onClick={() => window.open(APP_CONFIG.HELP_BOT)}>HELP & SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navItem(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
