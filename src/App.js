import React, { useState, useEffect } from 'react';

function App() {
  // --- States ---
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [isClaimed, setIsClaimed] = useState(() => localStorage.getItem('gift_claimed') === 'true');
  const [invites] = useState(0);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showForm, setShowForm] = useState(false);

  const walletAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";
  const ADS_BLOCK_ID = "27393"; // Block ID Fixed

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
  }, [balance, completed, isClaimed]);

  // --- Logic ---
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
            alert("Reward Added!");
          });
        }
      };
    }
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box', outline: 'none' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', zIndex: 100 }
  };

  return (
    <div style={styles.main}>
      {/* --- BALANCE HEADER --- */}
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '25px', borderRadius: '25px', marginBottom: '20px', background: 'rgba(251, 191, 36, 0.05)' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', margin: '10px 0', fontSize: '32px' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'reward', 'social'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowForm(false)}} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'bot' && [
            { id: 'b1', name: "GROW TEA BOT", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
            { id: 'b2', name: "GOLDEN MINER BOT", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" }
          ].map(b => (
            <div key={b.id} style={styles.card}>
              <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>{b.name}</div>
              <button id={`btn-${b.id}`} onClick={() => handleTaskAction(b.id, b.link)} style={{...styles.yellowBtn, backgroundColor: completed.includes(b.id) ? '#334155' : '#fbbf24', color: completed.includes(b.id) ? '#fbbf24' : '#000'}}>
                {completed.includes(b.id) ? '✅ COMPLETED' : 'START BOT'}
              </button>
            </div>
          ))}

          {activeTab === 'reward' && (
            <div style={styles.card}>
              <h4 style={{marginTop: 0, color: '#fbbf24'}}>DAILY GIFT CODE</h4>
              {isClaimed ? <p style={{color:'#10b981', textAlign:'center', fontWeight:'bold'}}>✅ ALREADY CLAIMED</p> : (
                <>
                  <input id="giftInput" type="password" style={styles.input} placeholder="Enter secret code..." />
                  <button onClick={() => {
                    const code = document.getElementById('giftInput').value.toUpperCase();
                    if(code === "GIFT77"){
                      setBalance(b => b + 0.01); setIsClaimed(true); alert("0.01 TON Claimed!");
                    } else { alert("Invalid Code!"); }
                  }} style={styles.yellowBtn}>CLAIM</button>
                </>
              )}
            </div>
          )}

          {activeTab === 'social' && (
            <div>
              <button style={styles.yellowBtn} onClick={() => setShowForm(!showForm)}>+ ADD TASK</button>
              {showForm && (
                <div style={{...styles.card, marginTop: '15px'}}>
                   <input style={styles.input} placeholder="Channel Name" />
                   <select style={styles.input}>
                     <option>100 Views - 0.2 TON</option>
                     <option>200 Views - 0.4 TON</option>
                     <option>300 Views - 0.5 TON</option>
                   </select>
                   <button style={styles.yellowBtn} onClick={()=>setShowForm(false)}>SUBMIT</button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...styles.card, border: '1px solid #fbbf24' }}>
            <h2 style={{ color: '#fbbf24', margin: '0 0 15px 0' }}>INVITE FRIENDS</h2>
            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '15px', marginBottom: '15px' }}>
              <p>လူတစ်ယောက်ဖိတ်လျှင် <b style={{ color: '#fbbf24' }}>0.0005 TON</b> ရမည်</p>
              <div style={{ height: '1px', background: '#334155', margin: '12px 0' }}></div>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>+ 10% COMMISSION</p>
            </div>
            <button onClick={() => copyToClipboard(`https://t.me/Bot?start=${userUID}`)} style={styles.yellowBtn}>COPY LINK</button>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div>
          <div style={styles.card}>
            <h3 style={{color:'#fbbf24', marginTop: 0}}>WITHDRAW</h3>
            <input style={styles.input} placeholder="Amount" type="number" />
            <input style={styles.input} placeholder="Wallet Address" />
            <button style={styles.yellowBtn} onClick={()=>alert("Insufficient Balance")}>WITHDRAW NOW</button>
          </div>
          <h4 style={{marginLeft: '5px'}}>HISTORY</h4>
          <div style={{...styles.card, textAlign: 'center', color: '#64748b'}}>No records found.</div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={{ textAlign: 'center' }}>
          <div style={styles.card}>
            <div style={{ fontSize: '60px', marginBottom: '10px' }}>👤</div>
            <h2 style={{ color: '#fbbf24', margin: '0' }}>PROFILE</h2>
            <p>User ID: {userUID}</p>
            <p>Balance: {balance.toFixed(4)} TON</p>
          </div>
          <div style={{ ...styles.card, border: '1px solid #ef4444', background: 'rgba(239,68,68,0.1)' }}>
            <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold', margin: 0 }}>
              ⚠️ WARNING: Multiple accounts သို့မဟုတ် လိမ်လည်မှုများပြုလုပ်ပါက အကောင့်ပိတ်သိမ်းခံရမည်။
            </p>
          </div>
        </div>
      )}

      <div style={styles.footer}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ textAlign: 'center', color: activeNav === n ? '#fbbf24' : '#64748b', flex: 1, cursor: 'pointer' }}>
            <span>{n === 'earn' ? '💰' : n === 'invite' ? '👥' : n === 'withdraw' ? '💸' : '👤'}</span><br/>
            <small style={{fontSize: '9px'}}>{n.toUpperCase()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
