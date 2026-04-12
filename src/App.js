import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [isClaimed, setIsClaimed] = useState(() => localStorage.getItem('gift_claimed') === 'true');
  const [invites] = useState(0);
  const [withdrawHistory] = useState([]); // Placeholder for history
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [socialSubView, setSocialSubView] = useState('list'); // list, addTask, myTask

  const adminWallet = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";
  const ADS_BLOCK_ID = "27393";

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
  }, [balance, completed, isClaimed]);

  const copyToClipboard = (txt) => {
    navigator.clipboard.writeText(txt);
    alert("Copied!");
  };

  const handleTaskAction = (id, link) => {
    if (completed.includes(id)) return;
    window.open(link, '_blank');
    const btn = document.getElementById(`btn-${id}`);
    if (btn) {
      btn.innerText = "VERIFY AD";
      btn.style.backgroundColor = "#10b981";
      btn.onclick = () => {
        if (window.Adsgram) {
          window.Adsgram.init({ blockId: ADS_BLOCK_ID }).show().then(() => {
            setBalance(p => p + 0.0005);
            setCompleted(p => [...p, id]);
            alert("0.0005 TON Added!");
          });
        }
      };
    }
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '12px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: active ? '#fbbf24' : '#1e293b', color: active ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', zIndex: 100 }
  };

  return (
    <div style={styles.main}>
      {/* --- BALANCE HEADER --- */}
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', margin: '5px 0', fontSize: '32px' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={styles.tabBtn(activeTab === t)}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'bot' && [
            { id: 'b1', name: "GROW TEA BOT", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
            { id: 'b2', name: "GOLDEN MINER BOT", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
            { id: 'b3', name: "WORKERS ON TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" }
          ].map(b => (
            <div key={b.id} style={styles.card}>
              <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>{b.name}</div>
              <button id={`btn-${b.id}`} onClick={() => handleTaskAction(b.id, b.link)} style={{...styles.yellowBtn, backgroundColor: completed.includes(b.id) ? '#334155' : '#fbbf24', color: completed.includes(b.id) ? '#fbbf24' : '#000'}}>
                {completed.includes(b.id) ? '✅ COMPLETED' : 'START BOT'}
              </button>
            </div>
          ))}

          {activeTab === 'social' && (
            <div>
              {socialSubView === 'list' && (
                <>
                  {[
                    { id: 's1', name: "JOIN CHANNEL 1", link: "https://t.me/WORLDBESTCRYTO" },
                    { id: 's2', name: "JOIN CHANNEL 2", link: "https://t.me/ADS_TON1" }
                  ].map(s => (
                    <div key={s.id} style={styles.card}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span>{s.name}</span>
                        <button id={`btn-${s.id}`} onClick={() => handleTaskAction(s.id, s.link)} style={{...styles.yellowBtn, width:'80px', padding:'8px', backgroundColor: completed.includes(s.id) ? '#334155' : '#fbbf24'}}>
                          {completed.includes(s.id) ? '✅' : 'JOIN'}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button style={{...styles.yellowBtn, marginTop:'10px'}} onClick={() => setSocialSubView('menu')}>+ ADD TASK</button>
                </>
              )}

              {socialSubView === 'menu' && (
                <div style={{display:'flex', gap:'10px'}}>
                  <button style={styles.yellowBtn} onClick={()=>setSocialSubView('addTask')}>ADD TASK</button>
                  <button style={styles.yellowBtn} onClick={()=>setSocialSubView('myTask')}>MY TASK</button>
                </div>
              )}

              {socialSubView === 'addTask' && (
                <div style={styles.card}>
                  <h4 style={{marginTop:0}}>Create New Task</h4>
                  <input style={styles.input} placeholder="Channel Name" />
                  <input style={styles.input} placeholder="Link (https://t.me/...)" />
                  <select style={styles.input}>
                    <option>100 Views - 0.2 TON</option>
                    <option>200 Views - 0.4 TON</option>
                    <option>300 Views - 0.5 TON</option>
                  </select>
                  <div style={{background:'#0f172a', padding:'10px', borderRadius:'10px', fontSize:'11px', marginBottom:'10px'}}>
                    <p>Send Payment to Address below:</p>
                    <p style={{color:'#fbbf24'}} onClick={()=>copyToClipboard(adminWallet)}>{adminWallet.slice(0,15)}...</p>
                    <p>MEMO (Required): <b style={{color:'#fbbf24'}}>{userUID}</b></p>
                  </div>
                  <button style={styles.yellowBtn} onClick={()=>{alert("Sent to Admin!"); setSocialSubView('list')}}>CONFIRM PAYMENT</button>
                  <button style={{...styles.yellowBtn, background:'none', color:'#fff', marginTop:'5px'}} onClick={()=>setSocialSubView('list')}>BACK</button>
                </div>
              )}

              {socialSubView === 'myTask' && (
                <div style={styles.card}>
                  <p style={{textAlign:'center', color:'#64748b'}}>No tasks created yet.</p>
                  <button style={styles.yellowBtn} onClick={()=>setSocialSubView('list')}>BACK</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reward' && (
            <div style={styles.card}>
              <h4 style={{marginTop: 0}}>DAILY REWARD CODE</h4>
              {isClaimed ? <p style={{color:'#10b981', textAlign:'center'}}>✅ ALREADY CLAIMED</p> : (
                <>
                  <input id="giftIn" type="password" style={styles.input} placeholder="Enter Code" />
                  <button onClick={()=>{if(document.getElementById('giftIn').value==="GIFT77"){setBalance(b=>b+0.01);setIsClaimed(true);alert("0.01 TON Added!")}}} style={styles.yellowBtn}>CLAIM</button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={{ textAlign: 'center' }}>
          <div style={styles.card}>
            <h2 style={{ color: '#fbbf24', margin: '0 0 10px 0' }}>INVITE FRIENDS</h2>
            <p>Earn <b style={{color:'#fbbf24'}}>0.0005 TON</b> per invite</p>
            <p style={{color:'#10b981', fontWeight:'bold'}}>+ 10% REFERRAL COMMISSION</p>
            <input style={{...styles.input, textAlign:'center', color:'#fbbf24'}} readOnly value={`https://t.me/YourBot?start=${userUID}`} />
            <button onClick={() => copyToClipboard(`https://t.me/YourBot?start=${userUID}`)} style={styles.yellowBtn}>COPY REFER LINK</button>
          </div>
          <div style={styles.card}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <span>Total Invited:</span>
              <span style={{color:'#fbbf24'}}>{invites} Users</span>
            </div>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div>
          <div style={styles.card}>
            <h3 style={{color:'#fbbf24', marginTop: 0}}>WITHDRAW TON</h3>
            <input style={styles.input} placeholder="Amount (Min: 0.1)" type="number" />
            <input style={styles.input} placeholder="TON Wallet Address" />
            <button style={styles.yellowBtn} onClick={()=>alert("Insufficient Balance")}>WITHDRAW NOW</button>
          </div>
          <h4>WITHDRAW HISTORY</h4>
          <div style={styles.card}>
            <table style={{width:'100%', fontSize:'12px', textAlign:'left'}}>
              <thead><tr style={{color:'#64748b'}}><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody><tr><td colSpan="3" style={{textAlign:'center', padding:'20px'}}>No history found.</td></tr></tbody>
            </table>
          </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={{textAlign:'center'}}>
          <div style={styles.card}>
            <div style={{fontSize:'50px'}}>👤</div>
            <p><b>VIP STATUS:</b> <span style={{color:'#fbbf24'}}>REGULAR USER</span></p>
            <p>User ID: {userUID}</p>
            <p>Balance: {balance.toFixed(4)} TON</p>
          </div>
          <div style={{...styles.card, border:'1px solid #ef4444', backgroundColor:'rgba(239,68,68,0.1)'}}>
            <p style={{color:'#ef4444', fontSize:'12px', fontWeight:'bold', margin:0}}>
              ⚠️ WARNING: Multiple accounts or fake referrals are strictly prohibited. Cheating accounts will be permanently banned and balance will be forfeited.
            </p>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <div style={styles.footer}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ textAlign: 'center', color: activeNav === n ? '#fbbf24' : '#64748b', flex: 1, cursor: 'pointer' }}>
            <span style={{fontSize:'20px'}}>{n==='earn'?'💰':n==='invite'?'👥':n==='withdraw'?'💸':'👤'}</span><br/>
            <small style={{fontSize:'10px'}}>{n.toUpperCase()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
