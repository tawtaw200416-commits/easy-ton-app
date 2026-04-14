import React, { useState, useEffect, useRef } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_CHAT_ID: "5020977059",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot"
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem('refs')) || []);
  const [loading, setLoading] = useState(true);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [promoForm, setPromoForm] = useState({ name: '', link: '', package: '' });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');

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
        const userRes = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
        const userData = await userRes.json();
        if (userData) {
          setBalance(Number(userData.balance));
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferrals(userData.referrals || []);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    initApp();
  }, []);

  const handleTaskReward = (id, reward) => {
    if (!completed.includes(id)) {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, completed: newComp });
      alert(`Success! +${reward} TON Added!`);
    }
  };

  const watchAd = () => {
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(() => {
          const newBal = Number((balance + 0.0001).toFixed(5));
          setBalance(newBal);
          syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal });
        }).catch(() => alert("Ad failed to load."));
    } else {
      alert("Adsgram not connected!");
    }
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
    badge: { background: '#facc15', border: '1px solid #000', borderRadius: '5px', padding: '2px 5px', fontSize: '10px' }
  };

  const botTasks = [
    { id: 'b_gt', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b_gm', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b_wt', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b_eb', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b_td', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b_pb', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const socialTasks = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460", 
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO", 
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69", 
    "@zrbtua", "@perviu1million"
  ];

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981', fontWeight:'bold'}}>● ACTIVE STATUS</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.card}>
            <button onClick={watchAd} style={{...styles.btn, backgroundColor:'#ef4444'}}>📺 WATCH VIDEO (+0.0001 TON)</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'REWARD'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t.toLowerCase()); setShowAddPromo(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold', fontSize: '10px' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && botTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}>
                <b>{t.name}</b>
                <button onClick={() => { window.open(t.link); handleTaskReward(t.id, 0.0005); }} style={{...styles.btn, width: '80px', padding: '8px'}}>START</button>
              </div>
            ))}

            {activeTab === 'social' && (
              <>
                <button style={{...styles.btn, backgroundColor:'#facc15', color:'#000', border:'2px solid #000', marginBottom:'15px'}} onClick={() => setShowAddPromo(!showAddPromo)}>+ ADD TASK (PROMOTE)</button>
                {showAddPromo ? (
                  <div>
                    <input style={styles.input} placeholder="Channel Name" onChange={e => setPromoForm({...promoForm, name: e.target.value})} />
                    <input style={styles.input} placeholder="Channel Link (https://...)" onChange={e => setPromoForm({...promoForm, link: e.target.value})} />
                    <select style={styles.input} onChange={e => setPromoForm({...promoForm, package: e.target.value})}>
                      <option value="">Select Package</option>
                      <option value="100 Views - 0.2 TON">100 Views - 0.2 TON</option>
                      <option value="200 Views - 0.4 TON">200 Views - 0.4 TON</option>
                      <option value="300 Views - 0.5 TON">300 Views - 0.5 TON</option>
                    </select>
                    <div style={styles.promoBox}>
                      <small><b>TON ADDRESS:</b></small>
                      <div style={styles.row}><span>{APP_CONFIG.ADMIN_WALLET.slice(0,15)}...</span><button style={styles.badge} onClick={() => {navigator.clipboard.writeText(APP_CONFIG.ADMIN_WALLET); alert("Copied!");}}>COPY</button></div>
                      <small><b>MEMO (UID):</b></small>
                      <div style={styles.row}><span>{APP_CONFIG.MY_UID}</span><button style={styles.badge} onClick={() => {navigator.clipboard.writeText(APP_CONFIG.MY_UID); alert("Copied!");}}>COPY</button></div>
                    </div>
                    <button style={styles.btn} onClick={() => {
                      sendAdminNotify(`📢 NEW PROMO REQUEST\nUser: ${APP_CONFIG.MY_UID}\nName: ${promoForm.name}\nPkg: ${promoForm.package}`);
                      window.open(APP_CONFIG.HELP_BOT);
                    }}>SEND PAYMENT PROOF</button>
                  </div>
                ) : (
                  socialTasks.filter(t => !completed.includes(t)).map(t => (
                    <div key={t} style={styles.row}>
                      <b>{t}</b>
                      <button onClick={() => { window.open(`https://t.me/${t.replace('@','')}`); handleTaskReward(t, 0.0005); }} style={{...styles.btn, width: '80px', padding: '8px'}}>JOIN</button>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>REFERRAL</h2>
          <p style={{textAlign:'center', fontSize:12}}><b>1 Refer = 0.0005 TON</b><br/>+ 10% LIFETIME COMMISSION</p>
          <div style={styles.promoBox}>
            <small>YOUR INVITE LINK:</small>
            <p style={{fontSize:10, wordBreak:'break-all'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!");}} style={styles.btn}>COPY LINK</button>
          </div>
          <h4>Invite History</h4>
          {referrals.map((r, i) => (
            <div key={i} style={styles.row}><span>User ID: {r.id}</span><b style={{color:'#10b981'}}>Complete</b></div>
          ))}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="Enter TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={styles.btn} onClick={() => {
            const amt = parseFloat(withdrawAmount);
            if(amt >= 0.1 && balance >= amt && withdrawAddress.length > 10) {
              const nb = Number((balance - amt).toFixed(5));
              const nh = [{id: Date.now(), amount: amt, status: 'Pending', time: Date.now()}, ...withdrawHistory];
              setBalance(nb); setWithdrawHistory(nh);
              syncToFirebase(`users/${APP_CONFIG.MY_UID}`, {balance: nb, withdrawHistory: nh});
              sendAdminNotify(`💰 WITHDRAWAL\nUID: ${APP_CONFIG.MY_UID}\nAmount: ${amt}\nWallet: ${withdrawAddress}`);
              alert("Submitted! Processing within 24h.");
            } else { alert("Error: Check balance/address/amount!"); }
          }}>WITHDRAW NOW</button>
          <h4 style={{marginTop:20}}>History</h4>
          {withdrawHistory.map((h, i) => {
            const isSuccess = Date.now() - h.time > 86400000;
            return (
              <div key={i} style={styles.row}><span>{h.amount} TON</span><b style={{color: isSuccess ? '#10b981' : 'orange'}}>{isSuccess ? 'Success' : 'Pending'}</b></div>
            )
          })}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>PROFILE</h2>
          <div style={styles.row}><span>Status:</span><b style={{color:'#10b981'}}>ACTIVE</b></div>
          <div style={styles.row}><span>UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
          <button style={{...styles.btn, marginTop:20, backgroundColor:'#3b82f6'}} onClick={() => window.open(APP_CONFIG.HELP_BOT)}>SUPPORT</button>
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
