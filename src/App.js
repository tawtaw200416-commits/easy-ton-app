import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "Guest_ID",
  ADSGRAM_BLOCK_ID: "27633", 
  TASK_REWARD: 0.001,
  VIDEO_REWARD: 0.0005,
  REFER_REWARD: 0.001,
  CODE_REWARD_AMOUNT: 0.001,
  REWARD_CODE: "EASY3",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot"
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [inviteHistory, setInviteHistory] = useState(() => JSON.parse(localStorage.getItem('inv_hist')) || []);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showAddTask, setShowAddTask] = useState(false);
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isAdLoading, setIsAdLoading] = useState(false);

  useEffect(() => { if (tg) { tg.ready(); tg.expand(); } }, []);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('inv_hist', JSON.stringify(inviteHistory));
  }, [balance, completed, withdrawHistory, inviteHistory]);

  // --- Ads Logic ---
  const handleActionWithAds = (reward, taskId = null, link = null) => {
    if (isAdLoading) return;
    if (window.Adsgram) {
      setIsAdLoading(true);
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show()
        .then(() => {
          setIsAdLoading(false);
          setBalance(prev => Number((prev + reward).toFixed(5)));
          if (taskId) setCompleted(prev => [...prev, taskId]);
          if (link) window.open(link, '_blank');
          alert(`Success! +${reward} TON added to balance.`);
        })
        .catch(() => {
          setIsAdLoading(false);
          alert("Ad skipped or failed. No reward.");
        });
    } else { alert("Ads not loaded. Check internet."); }
  };

  const handleWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (amt >= 0.1 && amt <= balance) {
      setBalance(prev => Number((prev - amt).toFixed(5)));
      const newWd = { id: Date.now(), amount: amt, status: 'Pending', time: Date.now() };
      setWithdrawHistory(prev => [newWd, ...prev]);
      setWithdrawAmount('');
      alert("Withdraw Request Sent! Processing...");
      // Auto Success logic after 24h
      setTimeout(() => {
         setWithdrawHistory(current => 
            current.map(h => h.id === newWd.id ? {...h, status: 'Success'} : h)
         );
      }, 86400000); 
    } else { alert("Insufficient Balance or Min 0.1 TON"); }
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    balanceCard: { background: 'linear-gradient(135deg, #000, #1e293b)', padding: '30px', borderRadius: '25px', textAlign: 'center', marginBottom: '20px', border: '4px solid #fff', color: '#fff' },
    videoBtn: { background: '#ef4444', color: '#fff', width: '100%', padding: '18px', borderRadius: '15px', border: '3px solid #000', fontWeight: 'bold', fontSize: '16px', marginBottom: '15px' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '25px', marginBottom: '12px', border: '3px solid #000' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: '900' }),
    blackBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.balanceCard}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ fontSize: '45px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:'18px'}}>TON</span></h1>
        <small>● ACTIVE ACCOUNT</small>
      </div>

      <button style={styles.videoBtn} onClick={() => handleActionWithAds(APP_CONFIG.VIDEO_REWARD)}>
        📺 WATCH VIDEO (+{APP_CONFIG.VIDEO_REWARD} TON)
      </button>

      {activeNav === 'earn' && (
        <>
          <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{flex:1, padding:'10px', background:activeTab===t?'#000':'#fff', color:activeTab===t?'#fff':'#000', border:'2px solid #000', borderRadius:'12px', fontWeight:'bold'}}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={styles.card}>
            <button onClick={() => setShowAddTask(!showAddTask)} style={{...styles.blackBtn, background:'#facc15', color:'#000', marginBottom:'15px', border:'2px solid #000'}}>+ ADD TASK (PROMOTE)</button>
            
            {showAddTask ? (
              <div>
                <input style={styles.input} placeholder="Channel or Group Link" />
                <button style={styles.blackBtn} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>SEND PROOF</button>
              </div>
            ) : (
              <>
                {activeTab === 'bot' && [
                  { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
                  { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
                  { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
                  { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
                  { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
                  { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
                ].filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleActionWithAds(APP_CONFIG.TASK_REWARD, t.id, t.link)} style={{...styles.blackBtn, width:'80px'}}>START</button></div>
                ))}

                {activeTab === 'social' && [
                  "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460", "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO", "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69", "@zrbtua", "@perviu1million"
                ].map((name, index) => ({ id: `s${index}`, name, link: `https://t.me/${name.replace('@','')}` }))
                 .filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleActionWithAds(APP_CONFIG.TASK_REWARD, t.id, t.link)} style={{...styles.blackBtn, width:'80px'}}>JOIN</button></div>
                ))}

                {activeTab === 'reward' && (
                  <div>
                    <input style={styles.input} placeholder="Enter EASY3 Code" value={rewardInput} onChange={(e)=>setRewardInput(e.target.value)} />
                    <button style={styles.blackBtn} onClick={() => rewardInput===APP_CONFIG.REWARD_CODE ? handleActionWithAds(APP_CONFIG.CODE_REWARD_AMOUNT, 'code_claimed') : alert("Wrong Code")}>CLAIM</button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center'}}>INVITE & EARN</h2>
          <p style={{textAlign:'center', fontWeight:'bold'}}>1 Referral = 0.001 TON</p>
          <div style={{background:'#f1f5f9', padding:'15px', borderRadius:'15px', border:'1px dashed #000'}}>
             <small>REFERRAL LINK:</small>
             <p style={{fontSize:11, wordBreak:'break-all'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
             <button style={styles.blackBtn} onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!");}}>COPY LINK</button>
          </div>
          <h4 style={{marginTop:20}}>INVITE HISTORY</h4>
          {inviteHistory.length === 0 ? <p style={{fontSize:12}}>No invites yet.</p> : inviteHistory.map((inv, i) => <div key={i} style={styles.row}>ID: {inv.id} <span>+0.001 TON</span></div>)}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e)=>setWithdrawAmount(e.target.value)} />
          <button style={styles.blackBtn} onClick={handleWithdraw}>WITHDRAW NOW</button>
          <h4 style={{marginTop:20}}>WITHDRAW HISTORY</h4>
          {withdrawHistory.map(h => (
            <div key={h.id} style={styles.row}><span>{h.amount} TON</span><b style={{color: h.status==='Pending'?'orange':'green'}}>{h.status}</b></div>
          ))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center'}}>PROFILE</h2>
          <div style={styles.row}><span>UID:</span><b>{APP_CONFIG.MY_UID}</b></div>
          <div style={styles.row}><span>Status:</span><b style={{color:'green'}}>VERIFIED</b></div>
          <div style={styles.row}><span>Support:</span><button style={{...styles.blackBtn, width:'100px', padding:'5px'}} onClick={()=>window.open(APP_CONFIG.SUPPORT_BOT)}>HELP</button></div>
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
