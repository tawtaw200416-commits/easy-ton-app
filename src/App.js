import React, { useState, useEffect } from 'react';

function App() {
  // --- States ---
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showForm, setShowForm] = useState(false);

  const walletAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";
  const adsgramBlockId = "27393";

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
  }, [balance, completed]);

  // --- Logic ---
  const copyToClipboard = (txt, msg = "Copied!") => {
    navigator.clipboard.writeText(txt);
    alert(msg);
  };

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    const btn = document.getElementById(`btn-${id}`);
    if (btn) {
      btn.innerText = "VERIFY AD";
      btn.style.backgroundColor = "#10b981";
      btn.onclick = () => {
        if (window.Adsgram) {
          window.Adsgram.init({ blockId: adsgramBlockId }).show().then(() => {
            if (!completed.includes(id)) {
              setBalance(p => p + 0.0005);
              setCompleted(p => [...p, id]);
              alert("0.0005 TON Reward Added!");
            }
          });
        }
      };
    }
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box', outline: 'none' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }
  };

  return (
    <div style={styles.main}>
      {/* --- BALANCE --- */}
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', margin: '5px 0', fontSize: '32px' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'reward', 'social'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowForm(false)}} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'bot' && [
            { id: 'b1', name: "GROW TEA BOT", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
            { id: 'b2', name: "GOLDEN MINER BOT", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" }
          ].map(b => (
            <div key={b.id} style={styles.card}>
              <div style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>{b.name}</span></div>
              <button id={`btn-${b.id}`} onClick={() => handleTaskAction(b.id, b.link)} style={styles.yellowBtn}>
                {completed.includes(b.id) ? 'COMPLETED' : 'START BOT'}
              </button>
            </div>
          ))}

          {activeTab === 'social' && (
            <div>
              <button style={{ ...styles.yellowBtn, marginBottom: '15px' }} onClick={() => setShowForm(!showForm)}>+ ADD TASK</button>
              {showForm && (
                <div style={styles.card}>
                  <input style={styles.input} placeholder="Channel Name" />
                  <input style={styles.input} placeholder="Telegram Link" />
                  <select style={styles.input}>
                    <option>100 Views - 0.2 TON</option>
                    <option>200 Views - 0.4 TON</option>
                    <option>300 Views - 0.5 TON</option>
                  </select>
                  <div style={{ fontSize: '11px', background: '#0f172a', padding: '10px', borderRadius: '10px', marginBottom: '10px' }}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                      <span>Address: {walletAddress.slice(0,10)}...</span>
                      <button onClick={()=>copyToClipboard(walletAddress)} style={{background:'#334155', color:'#fbbf24', border:'none', fontSize:'10px'}}>COPY</button>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <span>MEMO: {userUID}</span>
                      <button onClick={()=>copyToClipboard(userUID)} style={{background:'#334155', color:'#fbbf24', border:'none', fontSize:'10px'}}>COPY</button>
                    </div>
                  </div>
                  <button style={styles.yellowBtn} onClick={()=>setShowForm(false)}>SUBMIT TASK</button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeNav === 'withdraw' && (
        <div>
          <div style={styles.card}>
            <h3 style={{color:'#fbbf24', marginTop: 0}}>WITHDRAW TON</h3>
            <label style={{fontSize:'12px', color:'#94a3b8'}}>Amount</label>
            <input style={styles.input} placeholder="Min: 0.1" type="number" />
            <label style={{fontSize:'12px', color:'#94a3b8'}}>TON Wallet Address</label>
            <input style={styles.input} placeholder="Enter Address" />
            <button style={styles.yellowBtn} onClick={()=>alert("Insufficient Balance")}>WITHDRAW NOW</button>
          </div>
          <h3 style={{marginTop:'20px'}}>WITHDRAW HISTORY</h3>
          <table style={{width:'100%', fontSize:'12px', textAlign:'left', borderCollapse:'collapse'}}>
            <thead><tr style={{color:'#94a3b8'}}><th style={{padding:'10px'}}>Date</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody><tr><td colSpan="3" style={{textAlign:'center', padding:'20px', color:'#64748b'}}>No history found.</td></tr></tbody>
          </table>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={{textAlign:'center'}}>
          <div style={styles.card}>
            <div style={{fontSize:'50px', marginBottom:'10px'}}>👤</div>
            <p>ID: <span style={{color:'#fbbf24'}}>{userUID}</span></p>
            <p>Balance: <span style={{color:'#fbbf24'}}>{balance.toFixed(4)} TON</span></p>
          </div>
          <div style={{...styles.card, border:'1px solid #ef4444', backgroundColor:'rgba(239,68,68,0.1)'}}>
            <p style={{color:'#ef4444', fontSize:'12px', fontWeight:'bold', margin:0}}>
              ⚠️ WARNING: Multiple accounts or fake referrals are strictly prohibited. Violators will be permanently banned.
            </p>
          </div>
        </div>
      )}

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
