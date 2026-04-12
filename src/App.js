import React, { useState, useEffect } from 'react';

const APP_CONFIG = {
  ADS_BLOCK_ID: "27393",
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: "1793453606"
};

function App() {
  // ✅ DATA PERSISTENCE (အဟောင်းတွေ ပြန်ပေါ်ဖို့ Key တွေကို အဟောင်းအတိုင်း သုံးထားပါတယ်)
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [isClaimed, setIsClaimed] = useState(() => localStorage.getItem('gift_claimed') === 'true');
  
  // ✅ History တွေကို အရင် code အတိုင်း ပြန်ပေါ်အောင် လုပ်ထားပါတယ်
  const [withdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || [
    { date: "2026-04-10", amount: "0.1500", status: "Pending" },
    { date: "2026-04-08", amount: "0.2000", status: "Success" }
  ]);
  const [inviteHistory] = useState(() => JSON.parse(localStorage.getItem('inv_hist')) || [
    { uid: "18945532", status: "Success", reward: "0.0005" },
    { uid: "19228410", status: "Success", reward: "0.0005" }
  ]);

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("0.2");

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
  }, [balance, completed, isClaimed]);

  // ✅ BOT TASKS (၇ ခု အကုန်ပြန်ထည့်ထားပါတယ်)
  const botTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" },
    { id: 'b7', name: "Check In Bot", link: "https://t.me/check_in_bot" }
  ];

  // ✅ SOCIAL TASKS (၁၄ ခု အကုန်ပြန်ထည့်ထားပါတယ်)
  const socialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 's3', name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
    { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
    { id: 's5', name: "@USDTcloudminer_channel", link: "https://t.me/USDTcloudminer_channel" },
    { id: 's6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
    { id: 's7', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
    { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
    { id: 's9', name: "@kombo_crypta", link: "https://t.me/kombo_crypta" },
    { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" },
    { id: 's11', name: "@WORLDBESTCRYTO1", link: "https://t.me/WORLDBESTCRYTO1" },
    { id: 's12', name: "@MONEYHUB9_69", link: "https://t.me/MONEYHUB9_69" },
    { id: 's13', name: "@zrbtua", link: "https://t.me/zrbtua" },
    { id: 's14', name: "@perviu1million", link: "https://t.me/perviu1million" }
  ];

  const handleAction = (id, link) => {
    window.open(link, '_blank');
    const btn = document.getElementById(`btn-${id}`);
    if (btn) {
      btn.innerText = "VERIFYING...";
      if (window.Adsgram) {
        window.Adsgram.init({ blockId: APP_CONFIG.ADS_BLOCK_ID }).show().then(() => {
          setBalance(prev => Number((prev + 0.0005).toFixed(5)));
          setCompleted(prev => [...prev, id]);
        }).catch(() => {
          alert("Watch full ad!");
          btn.innerText = "RETRY";
        });
      } else {
        setTimeout(() => {
          setBalance(prev => Number((prev + 0.0005).toFixed(5)));
          setCompleted(prev => [...prev, id]);
        }, 3000);
      }
    }
  };

  const copyToClipboard = (text, message) => {
    navigator.clipboard.writeText(text);
    alert(message);
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '110px' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', borderTop: '2px solid #334155', padding: '10px 0' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', fontSize: '12px', cursor: 'pointer' }),
    copyBox: { display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', padding: '10px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #334155' }
  };

  return (
    <div style={styles.main}>
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowAddTask(false);}} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'bot' && botTasks.map(b => (
            <div key={b.id} style={styles.card}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span>{b.name}</span>
                <button id={`btn-${b.id}`} disabled={completed.includes(b.id)} onClick={() => handleAction(b.id, b.link)} style={{...styles.yellowBtn, width:'100px', backgroundColor: completed.includes(b.id) ? '#10b981' : '#fbbf24'}}>{completed.includes(b.id) ? "DONE" : "START"}</button>
              </div>
            </div>
          ))}

          {activeTab === 'social' && !showAddTask && (
            <div style={styles.card}>
              <button onClick={() => setShowAddTask(true)} style={{...styles.yellowBtn, marginBottom: '15px'}}>+ ADD TASK (PROMOTE)</button>
              {socialTasks.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #334155' }}>
                  <span style={{fontSize:'13px'}}>{s.name}</span>
                  <button id={`btn-${s.id}`} disabled={completed.includes(s.id)} onClick={() => handleAction(s.id, s.link)} style={{...styles.yellowBtn, width:'80px', padding:'5px', backgroundColor: completed.includes(s.id) ? '#10b981' : '#fbbf24'}}>{completed.includes(s.id) ? "DONE" : "JOIN"}</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'social' && showAddTask && (
            <div style={styles.card}>
              <h3 style={{marginTop:0}}>Add Task</h3>
              <input style={styles.input} placeholder="Channel Name (@Channel)" />
              <input style={styles.input} placeholder="Link" />
              <select style={styles.input} value={selectedPackage} onChange={(e) => setSelectedPackage(e.target.value)}>
                <option value="0.2">100 Views - 0.2 TON</option>
                <option value="0.4">200 Views - 0.4 TON</option>
                <option value="0.5">300 Views - 0.5 TON</option>
              </select>

              <div style={{background:'#1e293b', padding:'15px', borderRadius:'12px', border:'1px dotted #fbbf24', marginBottom:'15px'}}>
                <small style={{color:'#94a3b8'}}>Send Payment to Admin Address:</small>
                {/* --- Address Copy Box --- */}
                <div style={styles.copyBox}>
                  <div style={{fontSize:'10px', color:'#fbbf24', wordBreak:'break-all', flex:1}}>{APP_CONFIG.ADMIN_WALLET}</div>
                  <button onClick={() => copyToClipboard(APP_CONFIG.ADMIN_WALLET, "Address Copied!")} style={{backgroundColor:'#fbbf24', border:'none', padding:'5px 10px', borderRadius:'5px', fontSize:'10px', fontWeight:'bold', marginLeft:'10px'}}>COPY</button>
                </div>

                <small style={{color:'#94a3b8'}}>Required MEMO (UID):</small>
                {/* --- MEMO Copy Box --- */}
                <div style={styles.copyBox}>
                  <div style={{fontSize:'14px', color:'#fff', fontWeight:'bold', flex:1}}>{APP_CONFIG.MY_UID}</div>
                  <button onClick={() => copyToClipboard(APP_CONFIG.MY_UID, "MEMO ID Copied!")} style={{backgroundColor:'#fbbf24', border:'none', padding:'5px 10px', borderRadius:'5px', fontSize:'10px', fontWeight:'bold', marginLeft:'10px'}}>COPY</button>
                </div>
                <p style={{margin:0, fontSize:'10px', color:'#ef4444'}}>* Failure to include MEMO will result in payment loss!</p>
              </div>

              <button style={styles.yellowBtn} onClick={() => alert("Payment info sent to Admin!")}>CONFIRM PAYMENT</button>
              <button onClick={() => setShowAddTask(false)} style={{width:'100%', background:'none', border:'none', color:'#94a3b8', marginTop:'10px', cursor:'pointer'}}>Back</button>
            </div>
          )}

          {activeTab === 'reward' && (
            <div style={styles.card}>
              <h4>DAILY GIFT CODE</h4>
              <input id="gift" type="password" style={styles.input} placeholder="Enter Code" />
              <button style={styles.yellowBtn} onClick={() => alert("Invalid Code")}>CLAIM</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div>
          <div style={styles.card}>
            <p>🎁 Get <b>0.0005 TON</b> for each invite!</p>
            <p style={{fontSize:'12px'}}>Plus 10% commission from your friends' task earnings!</p>
            <button style={styles.yellowBtn}>COPY REFERRAL LINK</button>
          </div>
          <h4>INVITE HISTORY</h4>
          <div style={styles.card}>
            <table style={{width:'100%', fontSize:'13px'}}>
              <thead><tr style={{color:'#64748b'}}><th>UID</th><th>Status</th><th>Reward</th></tr></thead>
              <tbody>{inviteHistory.map((h,i)=><tr key={i}><td style={{padding:'8px 0'}}>{h.uid}</td><td style={{color:'#10b981'}}>{h.status}</td><td>{h.reward} TON</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAWAL</h3>
          <input style={styles.input} placeholder="Amount" />
          <button style={styles.yellowBtn}>WITHDRAW</button>
          <h4 style={{marginTop:'20px'}}>HISTORY</h4>
          <table style={{width:'100%', fontSize:'13px'}}>
            <tbody>{withdrawHistory.map((w,i)=><tr key={i}><td style={{padding:'8px 0'}}>{w.date}</td><td>{w.amount}</td><td style={{color:'#fbbf24'}}>{w.status}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <p>👤 UID: {APP_CONFIG.MY_UID}</p>
          <div style={{backgroundColor:'rgba(239, 68, 68, 0.1)', padding:'15px', borderRadius:'10px', color:'#f87171', fontSize:'13px', border:'1px solid #ef4444'}}>
            <strong>Warning:</strong> Fake accounts will be banned and balance will be forfeited.
          </div>
        </div>
      )}

      <div style={styles.navBar}>
        <div onClick={() => setActiveNav('earn')} style={styles.navBtn(activeNav === 'earn')}>💰<br/>EARN</div>
        <div onClick={() => setActiveNav('invite')} style={styles.navBtn(activeNav === 'invite')}>👥<br/>INVITE</div>
        <div onClick={() => setActiveNav('withdraw')} style={styles.navBtn(activeNav === 'withdraw')}>💸<br/>WITHDRAW</div>
        <div onClick={() => setActiveNav('profile')} style={styles.navBtn(activeNav === 'profile')}>👤<br/>PROFILE</div>
      </div>
    </div>
  );
}

export default App;
