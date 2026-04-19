import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_UID: "1793453606", 
  ADS_BLOCKS: ["27611", "27633"], 
  TASK_REWARD: 0.001,
  VIDEO_REWARD: 0.0005,
  REFER_REWARD: 0.001,
  CODE_REWARD_AMOUNT: 0.001,
  REWARD_CODE: "EASY3",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot"
};

const USER_UID = tg?.initDataUnsafe?.user?.id?.toString() || "Guest_ID";

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [inviteHistory, setInviteHistory] = useState(() => JSON.parse(localStorage.getItem('inv_hist')) || []);
  const [adminTasks, setAdminTasks] = useState(() => JSON.parse(localStorage.getItem('adm_tasks_list')) || []);

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelLink, setNewChannelLink] = useState('');
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [testReferralId, setTestReferralId] = useState('');

  useEffect(() => { if (tg) { tg.ready(); tg.expand(); } }, []);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('inv_hist', JSON.stringify(inviteHistory));
    localStorage.setItem('adm_tasks_list', JSON.stringify(adminTasks));
  }, [balance, completed, withdrawHistory, inviteHistory, adminTasks]);

  const handleActionWithAds = (reward, taskId = null, link = null, callback = null) => {
    if (isAdLoading) return;
    const randomBlockId = APP_CONFIG.ADS_BLOCKS[Math.floor(Math.random() * APP_CONFIG.ADS_BLOCKS.length)];
    if (window.Adsgram) {
      setIsAdLoading(true);
      window.Adsgram.init({ blockId: randomBlockId }).show().then(() => {
          setIsAdLoading(false);
          if (reward > 0) setBalance(prev => Number((prev + reward).toFixed(5)));
          if (taskId) setCompleted(prev => [...prev, taskId]);
          if (link) window.open(link, '_blank');
          if (callback) callback();
      }).catch(() => {
          setIsAdLoading(false);
          alert("Ad failed. No reward.");
          if (callback) callback();
      });
    } else {
      if (link) window.open(link, '_blank');
      if (callback) callback();
    }
  };

  const handleAddReferral = () => {
    if (testReferralId.trim() !== "") {
      setBalance(prev => Number((prev + APP_CONFIG.REFER_REWARD).toFixed(5)));
      setInviteHistory(prev => [{ id: Date.now(), uid: testReferralId }, ...prev]);
      setTestReferralId('');
      alert("Referral Reward Added! +0.001 TON");
    }
  };

  const deleteAdminTask = (id) => {
    setAdminTasks(prev => prev.filter(t => t.id !== id));
    alert("Task Deleted!");
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    balanceCard: { background: 'linear-gradient(135deg, #000, #1e293b)', padding: '30px', borderRadius: '25px', textAlign: 'center', marginBottom: '20px', border: '4px solid #fff', color: '#fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '25px', marginBottom: '12px', border: '3px solid #000' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }),
    blackBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
    badge: (status) => ({ backgroundColor: status === 'Pending' ? '#f59e0b' : '#22c55e', color: '#fff', padding: '4px 8px', borderRadius: '8px', fontSize: '10px' })
  };

  return (
    <div style={styles.main}>
      <div style={styles.balanceCard}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ fontSize: '45px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:'18px'}}>TON</span></h1>
        <small>UID: {USER_UID}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          {USER_UID === APP_CONFIG.ADMIN_UID && (
            <div style={{...styles.card, borderColor: '#ef4444'}}>
              <h4 style={{margin: '0 0 10px 0', color: '#ef4444'}}>ADMIN CONTROL PANEL</h4>
              <button style={styles.blackBtn} onClick={() => setShowAdminPanel(!showAdminPanel)}>
                {showAdminPanel ? "CLOSE PANEL" : "MANAGE CUSTOM TASKS"}
              </button>
              {showAdminPanel && (
                <div style={{marginTop: '15px'}}>
                  <input style={styles.input} placeholder="Task Name" value={newChannelName} onChange={(e)=>setNewChannelName(e.target.value)} />
                  <input style={styles.input} placeholder="Task Link" value={newChannelLink} onChange={(e)=>setNewChannelLink(e.target.value)} />
                  <button style={{...styles.blackBtn, background: '#22c55e'}} onClick={() => {
                    if(newChannelName && newChannelLink) {
                      setAdminTasks(prev => [{ id: 'adm_'+Date.now(), name: newChannelName, link: newChannelLink }, ...prev]);
                      setNewChannelName(''); setNewChannelLink('');
                    }
                  }}>ADD NEW TASK</button>
                  <div style={{marginTop: '10px'}}>
                    {adminTasks.map(t => (
                      <div key={t.id} style={styles.row}>
                        <small>{t.name}</small>
                        <button onClick={() => deleteAdminTask(t.id)} style={{background:'red', color:'white', border:'none', padding:'5px', borderRadius:'5px'}}>Del</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <button style={{...styles.blackBtn, background: '#ef4444', height: '60px', marginBottom: '15px'}} onClick={() => handleActionWithAds(APP_CONFIG.VIDEO_REWARD)}>
            📺 WATCH VIDEO (+{APP_CONFIG.VIDEO_REWARD} TON)
          </button>

          <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{flex:1, padding:'10px', background:activeTab===t?'#000':'#fff', color:activeTab===t?'#fff':'#000', border:'2px solid #000', borderRadius:'12px', fontWeight:'bold'}}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={styles.card}>
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
              ...adminTasks,
              { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
              { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
              { id: 's3', name: "@cryptogold_online", link: "https://t.me/cryptogold_online_official" },
              { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
              { id: 's5', name: "@USDTcloudminer", link: "https://t.me/USDTcloudminer_channel" },
              { id: 's6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
              { id: 's7', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
              { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
              { id: 's9', name: "@kombo_crypta", link: "https://t.me/kombo_crypta" },
              { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" },
              { id: 's11', name: "@WORLDBESTCRYTO1", link: "https://t.me/WORLDBESTCRYTO1" },
              { id: 's12', name: "@MONEYHUB9_69", link: "https://t.me/MONEYHUB9_69" },
              { id: 's13', name: "@zrbtua", link: "https://t.me/zrbtua" },
              { id: 's14', name: "@perviu1million", link: "https://t.me/perviu1million" }
            ].filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleActionWithAds(APP_CONFIG.TASK_REWARD, t.id, t.link)} style={{...styles.blackBtn, width:'80px'}}>JOIN</button></div>
            ))}
            
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter EASY3 Code" value={rewardInput} onChange={(e)=>setRewardInput(e.target.value)} />
                <button style={styles.blackBtn} onClick={() => rewardInput===APP_CONFIG.REWARD_CODE ? handleActionWithAds(APP_CONFIG.CODE_REWARD_AMOUNT, 'code_claimed') : alert("Wrong Code")}>CLAIM</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center'}}>INVITE & EARN</h2>
          <p style={{textAlign:'center', fontWeight:'bold', color: '#2563eb'}}>1 Referral = 0.001 TON</p>
          <div style={{background:'#f1f5f9', padding:'15px', borderRadius:'15px', border:'1px dashed #000', marginBottom:'15px'}}>
             <small>LINK:</small>
             <p style={{fontSize:11, wordBreak:'break-all'}}>https://t.me/EasyTONFree_Bot?start={USER_UID}</p>
             <button style={styles.blackBtn} onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${USER_UID}`); alert("Copied!");}}>COPY LINK</button>
          </div>
          <div style={{marginTop: '20px'}}>
            <small>TEST REFERRAL:</small>
            <input style={styles.input} placeholder="Friend's UID" value={testReferralId} onChange={(e)=>setTestReferralId(e.target.value)} />
            <button style={{...styles.blackBtn, background:'#22c55e'}} onClick={handleAddReferral}>ADD REFERRAL</button>
          </div>
          <h4 style={{marginTop: '20px'}}>INVITE HISTORY</h4>
          {inviteHistory.map(inv => (
            <div key={inv.id} style={styles.row}><span>User: {inv.uid}</span><b style={{color:'green'}}>+0.001 TON</b></div>
          ))}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAWAL</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e)=>setWithdrawAmount(e.target.value)} />
          <button style={styles.blackBtn} onClick={() => handleActionWithAds(0, null, null, () => {
            const amt = parseFloat(withdrawAmount);
            if (amt >= 0.1 && amt <= balance) {
              setBalance(prev => Number((prev - amt).toFixed(5)));
              setWithdrawHistory(prev => [{ id: Date.now(), amount: amt, status: 'Pending', time: Date.now() }, ...prev]);
              setWithdrawAmount('');
              alert("Withdraw Success!");
            } else { alert("Insufficient Balance!"); }
          })}>WITHDRAW NOW</button>
          <h4 style={{marginTop: '20px'}}>HISTORY</h4>
          {withdrawHistory.map(h => (
            <div key={h.id} style={styles.row}><span>{h.amount} TON</span><span style={styles.badge(h.status)}>{h.status}</span></div>
          ))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center'}}>PROFILE</h2>
          <div style={styles.row}><span>UID:</span><b>{USER_UID}</b></div>
          <button style={{...styles.blackBtn, marginTop: '10px'}} onClick={()=>window.open(APP_CONFIG.SUPPORT_BOT)}>SUPPORT</button>
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
