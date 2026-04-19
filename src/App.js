import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "Guest_ID",
  ADSGRAM_BLOCK_ID: "27633", 
  TASK_REWARD: 0.0005,
  REFER_REWARD: 0.0005
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referralCount, setReferralCount] = useState(() => Number(localStorage.getItem('ref_count')) || 0);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
  }, []);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('ref_count', referralCount.toString());
  }, [balance, completed, withdrawHistory, referralCount]);

  // Adsgram Ad Handler
  const showAdAndReward = (taskId, isStatic = false) => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show()
        .then(() => {
          setBalance(prev => Number((prev + APP_CONFIG.TASK_REWARD).toFixed(5)));
          if (taskId) setCompleted(prev => [...prev, taskId]);
          tg.showAlert("Reward Received! +0.0005 TON");
        })
        .catch((err) => {
          console.error(err);
          tg.showAlert("Ad failed to load. Please try again.");
        });
    } else {
      tg.showAlert("Adsgram SDK not connected. Please reload.");
    }
  };

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    // ကြော်ငြာပြပြီးမှ reward ပေးမည်
    setTimeout(() => showAdAndReward(id), 2000);
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px' },
    headerCard: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000' },
    blackBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px 0' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '12px' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.headerCard}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '36px', margin: '5px 0' }}>{balance.toFixed(5)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t ? '#000' : '#fff', color: activeTab === t ? '#fff' : '#000', fontWeight: 'bold' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" },
              { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot" }
            ].filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><span>{t.name}</span><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.blackBtn, width: '80px', padding: '8px'}}>START</button></div>
            ))}

            {activeTab === 'social' && [
              { id: 's1', name: "@EasyTonNews", link: "https://t.me/GrowTeaNews" },
              { id: 's10', name: "@EasyTonFree", link: "https://t.me/easytonfree" }
            ].filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><span>{t.name}</span><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.blackBtn, width: '80px', padding: '8px'}}>JOIN</button></div>
            ))}

            {activeTab === 'reward' && (
              <div>
                <input style={{width:'100%', padding:'12px', marginBottom:'10px', borderRadius:'10px', border:'1px solid #000'}} placeholder="Enter Promo Code" value={rewardInput} onChange={(e)=>setRewardInput(e.target.value)} />
                <button style={styles.blackBtn} onClick={()=>{ if(rewardInput==='EASY1'){ setBalance(p=>p+0.001); alert("Code Claimed!"); setRewardInput(''); } else { alert("Invalid Code"); } }}>CLAIM</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{textAlign:'center'}}>INVITE FRIENDS</h3>
          <p style={{textAlign:'center', fontSize:12}}>Get 0.0005 TON for every valid referral.</p>
          <div style={{background:'#f1f5f9', padding:'15px', borderRadius:'10px', border:'1px dashed #000', wordBreak:'break-all', fontSize:11}}>
            https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}
          </div>
          <button onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Link Copied!"); }} style={{...styles.blackBtn, marginTop:'10px'}}>COPY LINK</button>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW</h3>
          <input style={{width:'100%', padding:'12px', marginBottom:'10px', borderRadius:'10px', border:'1px solid #000'}} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e)=>setWithdrawAmount(e.target.value)} />
          <button style={styles.blackBtn} onClick={()=>{ if(Number(withdrawAmount)>=0.1 && balance >= withdrawAmount){ setBalance(p=>p-Number(withdrawAmount)); setWithdrawHistory([{amount: withdrawAmount, status:'Pending'}, ...withdrawHistory]); alert("Withdrawal Requested!"); } else { alert("Insufficient balance or min amount not met."); } }}>WITHDRAW NOW</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>PROFILE</h3>
          <div style={styles.row}><span>UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Status:</span><span style={{color:'green'}}>VERIFIED</span></div>
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
