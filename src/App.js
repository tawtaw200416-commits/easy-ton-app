import React, { useState, useEffect } from 'react';

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: "1793453606",
  ADMIN_TELEGRAM: "https://t.me/GrowTeaNews",
  ADSGRAM_BLOCK_ID: "27578", 
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_CHAT_ID: "5020977059"
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
  }, [balance, completed, withdrawHistory]);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => alert(`${label} Copied!`));
  };

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then(() => {
        setBalance(prev => Number((prev + 0.0005).toFixed(5)));
        setCompleted(prev => [...prev, id]);
      }).catch(() => alert("Please watch the full ad!"));
    } else {
      setTimeout(() => {
        setBalance(prev => Number((prev + 0.0005).toFixed(5)));
        setCompleted(prev => [...prev, id]);
      }, 5000);
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    topCard: { background: '#000', padding: '20px', borderRadius: '25px', textAlign: 'center', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '20px', border: '2px solid #000', marginBottom: '10px' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box', fontWeight: 'bold' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px 0' },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '12px' }),
    copyBox: { background: '#f1f5f9', padding: '10px', borderRadius: '10px', border: '1px dashed #000', marginBottom: '10px' },
    planBtn: (active) => ({ flex: 1, padding: '8px', border: '2px solid #000', borderRadius: '8px', backgroundColor: active ? '#000' : '#fff', color: active ? '#fff' : '#000', fontSize: '11px', fontWeight: 'bold' })
  };

  return (
    <div style={styles.main}>
      {/* Balance Section */}
      <div style={styles.topCard}>
        <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
        <h1 style={{color: '#fff', fontSize: '35px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowAddTask(false);}} style={{...styles.btn, flex:1, backgroundColor: activeTab === t ? '#000' : '#fff', color: activeTab === t ? '#fff' : '#000', border: '2px solid #000'}}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'social' && !showAddTask && (
              <button onClick={() => setShowAddTask(true)} style={{...styles.btn, marginBottom: '15px', backgroundColor: '#facc15', color: '#000', border: '2px solid #000'}}>+ ADD TASK (PROMOTE)</button>
            )}

            {showAddTask ? (
              <div>
                <h4 style={{marginTop:0}}>Promote Ad (Views)</h4>
                <input style={styles.input} placeholder="Channel Name (@Username)" />
                <input style={styles.input} placeholder="Channel Link" />
                
                <p style={{fontSize:'12px', fontWeight:'bold'}}>Choose Views:</p>
                <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
                  <button onClick={() => setSelectedPlan('100')} style={styles.planBtn(selectedPlan === '100')}>100 Views<br/>0.2 TON</button>
                  <button onClick={() => setSelectedPlan('200')} style={styles.planBtn(selectedPlan === '200')}>200 Views<br/>0.4 TON</button>
                  <button onClick={() => setSelectedPlan('300')} style={styles.planBtn(selectedPlan === '300')}>300 Views<br/>0.5 TON</button>
                </div>

                <div style={styles.copyBox}>
                  <small>ADMIN WALLET:</small>
                  <p style={{fontSize:'10px', wordBreak:'break-all', margin:'5px 0'}}>{APP_CONFIG.ADMIN_WALLET}</p>
                  <button onClick={() => handleCopy(APP_CONFIG.ADMIN_WALLET, "Address")} style={{fontSize:'10px', padding:'3px 8px'}}>COPY ADDRESS</button>
                </div>

                <div style={styles.copyBox}>
                  <small>USER UID (MEMO):</small>
                  <p style={{fontSize:'15px', fontWeight:'bold', margin:'5px 0'}}>{APP_CONFIG.MY_UID}</p>
                  <button onClick={() => handleCopy(APP_CONFIG.MY_UID, "UID")} style={{fontSize:'10px', padding:'3px 8px'}}>COPY UID</button>
                </div>

                <p style={{color:'red', fontSize:'10px', fontWeight:'bold'}}>⚠️ ငွေပို့ပြီးလျှင် Screenshot အား Admin ထံ ပို့ပေးပါ။</p>
                <button style={styles.btn} onClick={() => window.open(APP_CONFIG.ADMIN_TELEGRAM)}>CONTACT ADMIN</button>
              </div>
            ) : (
              // Task List ဟောင်းများ
              <div>
                {activeTab === 'bot' && [
                  { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
                  { id: 'b2', name: "Golden Miner", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" }
                ].filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee'}}>
                    <span style={{fontWeight:'bold'}}>{t.name}</span>
                    <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.btn, width:'80px', padding:'5px'}}>START</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h4>WITHDRAW</h4>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" />
          <button style={styles.btn}>WITHDRAW NOW</button>
          
          <h4 style={{marginTop:'20px'}}>HISTORY</h4>
          {withdrawHistory.length === 0 ? <p style={{fontSize:'12px', color:'#999'}}>No history yet.</p> : withdrawHistory.map(h => (
            <div key={h.id} style={{display:'flex', justifyContent:'space-between', fontSize:'13px', padding:'5px 0'}}>
              <span>{h.amount} TON</span>
              <span style={{color:'orange'}}>Pending</span>
            </div>
          ))}
        </div>
      )}

      {/* Nav Bar */}
      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navItem(activeNav === n)}>
            {n.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
