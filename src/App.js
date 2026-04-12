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
  const ADS_BLOCK_ID = "27393";

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
  }, [balance, completed, isClaimed]);

  // --- Logic ---
  const copyToClipboard = (txt) => {
    navigator.clipboard.writeText(txt);
    alert("Link Copied!");
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
            alert("Reward 0.0005 TON Added!");
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
      {/* --- HEADER --- */}
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px', background: 'rgba(251, 191, 36, 0.03)' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', margin: '5px 0', fontSize: '32px' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'reward', 'social'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowForm(false)}} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {/* BOT TASKS */}
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

          {/* REWARD CODE */}
          {activeTab === 'reward' && (
            <div style={styles.card}>
              <h4 style={{marginTop: 0, color: '#fbbf24'}}>DAILY GIFT CODE</h4>
              {isClaimed ? <div style={{textAlign:'center', color:'#10b981', fontWeight:'bold', padding:'10px'}}>✅ GIFT CLAIMED</div> : (
                <>
                  <input id="giftInput" type="password" style={styles.input} placeholder="Enter hidden code..." />
                  <button onClick={() => {
                    const code = document.getElementById('giftInput').value.toUpperCase();
                    if(code === "GIFT77"){ setBalance(b => b + 0.01); setIsClaimed(true); alert("0.01 TON Claimed!"); }
                    else { alert("Invalid Code!"); }
                  }} style={styles.yellowBtn}>CLAIM REWARD</button>
                </>
              )}
            </div>
          )}

          {/* SOCIAL TASKS */}
          {activeTab === 'social' && (
            <div>
              <button style={{...styles.yellowBtn, marginBottom:'15px'}} onClick={() => setShowForm(!showForm)}>+ ADD MISSION</button>
              {[
                { id: 's1', name: "JOIN OUR CHANNEL", link: "https://t.me/WORLDBESTCRYTO" },
                { id: 's2', name: "JOIN ADS TON", link: "https://t.me/ADS_TON1" }
              ].map(s => (
                <div key={s.id} style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{fontWeight:'bold'}}>{s.name}</span>
                    <button id={`btn-${s.id}`} onClick={() => handleTaskAction(s.id, s.link)} style={{...styles.yellowBtn, width: '100px', padding: '8px', marginTop: 0, backgroundColor: completed.includes(s.id) ? '#334155' : '#fbbf24', color: completed.includes(s.id) ? '#fbbf24' : '#000'}}>
                      {completed.includes(s.id) ? '✅' : 'JOIN'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* --- INVITE PANEL --- */}
      {activeNav === 'invite' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...styles.card, border: '1px solid #fbbf24' }}>
            <h2 style={{ color: '#fbbf24', margin: '0 0 15px 0' }}>INVITE FRIENDS</h2>
            <div style={{ background: '#0f172a', padding: '15px', borderRadius: '15px', marginBottom: '15px' }}>
              <p style={{margin: '5px 0'}}>Invite ၁ ယောက်လျှင် <b style={{color: '#fbbf24'}}>0.0005 TON</b> ရမည်</p>
              <div style={{height: '1px', background: '#334155', margin: '10px 0'}}></div>
              <p style={{fontSize: '18px', fontWeight: 'bold', color: '#10b981', margin: 0}}>+ 10% COMMISSION</p>
              <small style={{color: '#94a3b8'}}>From friend's task earnings</small>
            </div>
            <div style={{...styles.input, color: '#fbbf24', fontSize: '11px', overflow: 'hidden'}}>{`https://t.me/YourBot?start=${userUID}`}</div>
            <button onClick={() => copyToClipboard(`https://t.me/YourBot?start=${userUID}`)} style={styles.yellowBtn}>COPY LINK</button>
          </div>
          <div style={styles.card}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <span>Total Invited:</span>
              <b style={{color: '#fbbf24'}}>{invites} Users</b>
            </div>
          </div>
        </div>
      )}

      {/* --- WITHDRAW & PROFILE --- */}
      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{color:'#fbbf24', marginTop: 0}}>WITHDRAW</h3>
          <input style={styles.input} placeholder="Min: 0.1 TON" type="number" />
          <input style={styles.input} placeholder="TON Address" />
          <button style={styles.yellowBtn} onClick={() => alert("Balance Low")}>WITHDRAW NOW</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={{textAlign: 'center'}}>
          <div style={styles.card}>
            <div style={{fontSize: '50px', marginBottom: '10px'}}>👤</div>
            <p>ID: <span style={{color: '#fbbf24'}}>{userUID}</span></p>
            <p>Balance: <span style={{color: '#fbbf24'}}>{balance.toFixed(4)} TON</span></p>
          </div>
          <div style={{...styles.card, border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)'}}>
            <p style={{color:'#ef4444', fontSize:'12px', fontWeight:'bold', margin:0}}>⚠️ WARNING: တစ်ဦးထက်ပိုသော အကောင့်များသုံးခြင်း သို့မဟုတ် လိမ်လည်ခြင်းများ ပြုလုပ်ပါက အကောင့်ပိတ်ခံရမည်။</p>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <div style={styles.footer}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ textAlign: 'center', color: activeNav === n ? '#fbbf24' : '#64748b', flex: 1, cursor: 'pointer' }}>
            <span style={{fontSize: '20px'}}>{n === 'earn' ? '💰' : n === 'invite' ? '👥' : n === 'withdraw' ? '💸' : '👤'}</span><br/>
            <small style={{fontSize: '10px'}}>{n.toUpperCase()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
