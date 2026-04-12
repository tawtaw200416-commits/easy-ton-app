import React, { useState, useEffect } from 'react';

// ✅ Configuration အပိုင်း - ဘာမှမပျက်အောင် အကုန်စုထားပါတယ်
const APP_CONFIG = {
  BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_ID: "5020977059",
  ADS_BLOCK_ID: "27393",
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: "1793453606"
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [isClaimed, setIsClaimed] = useState(() => localStorage.getItem('gift_claimed') === 'true');
  
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [inviteHistory] = useState(() => JSON.parse(localStorage.getItem('inv_hist')) || [
    { uid: "189455...", status: "Completed", reward: "0.0005" }
  ]);

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [socialView, setSocialView] = useState('list');

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
  }, [balance, completed, isClaimed, withdrawHistory]);

  const handleAction = (id, link) => {
    window.open(link, '_blank');
    const btn = document.getElementById(`btn-${id}`);
    if (btn) {
      btn.innerText = "VERIFY TASK";
      btn.style.backgroundColor = "#10b981";
      btn.onclick = () => {
        if (window.Adsgram) {
          window.Adsgram.init({ blockId: APP_CONFIG.ADS_BLOCK_ID }).show().then(() => {
            setBalance(prev => prev + 0.0005);
            setCompleted(prev => [...prev, id]);
            alert("Reward 0.0005 TON Added!");
          }).catch(() => alert("Please watch the full ad."));
        }
      };
    }
  };

  const handleWithdraw = () => {
    const amount = document.getElementById('wd_amount').value;
    const address = document.getElementById('wd_address').value;
    if (amount >= 0.1 && balance >= amount) {
      const message = `💸 *Withdraw*\nUID: ${APP_CONFIG.MY_UID}\nAmount: ${amount} TON\nAddress: ${address}`;
      fetch(`https://api.telegram.org/bot${APP_CONFIG.BOT_TOKEN}/sendMessage?chat_id=${APP_CONFIG.ADMIN_ID}&text=${encodeURIComponent(message)}&parse_mode=Markdown`)
        .then(() => {
          setWithdrawHistory([{ date: new Date().toLocaleDateString(), amount, status: "Pending" }, ...withdrawHistory]);
          setBalance(prev => prev - Number(amount));
          alert("Withdrawal submitted!");
        });
    } else { alert("Insufficient balance or min 0.1 TON."); }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert("Copied!"); };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '8px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155' },
    warning: { color: '#ef4444', fontSize: '12px', fontWeight: 'bold', border: '1px solid #ef4444', padding: '10px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', marginTop: '15px' }
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
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'bot' && (
            [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
              { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
              { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" }
            ].filter(t => !completed.includes(t.id)).map(b => (
              <div key={b.id} style={styles.card}>
                <p style={{ fontWeight: 'bold' }}>{b.name}</p>
                <button id={`btn-${b.id}`} onClick={() => handleAction(b.id, b.link)} style={styles.yellowBtn}>START BOT</button>
              </div>
            ))
          )}

          {activeTab === 'reward' && (
            <div style={styles.card}>
              <h4>DAILY GIFT CODE</h4>
              {isClaimed ? <p style={{ color: '#10b981', textAlign: 'center' }}>CLAIMED ✅</p> : (
                <>
                  {/* ✅ Code ကို Password အနေနဲ့ ဖျောက်ထားပေးပါတယ် */}
                  <input id="gift" type="password" style={styles.input} placeholder="Enter Code Here" />
                  <button onClick={() => {if(document.getElementById('gift').value==="GIFT77"){setBalance(b=>b+0.01);setIsClaimed(true);alert("Success!")}}} style={styles.yellowBtn}>CLAIM</button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={{ textAlign: 'center' }}>
          <div style={styles.card}>
            <h2>INVITE FRIENDS</h2>
            <button onClick={() => copyToClipboard(`https://t.me/YourBot?start=${APP_CONFIG.MY_UID}`)} style={styles.yellowBtn}>COPY INVITE LINK</button>
          </div>
          <h4 style={{ textAlign: 'left' }}>INVITATION HISTORY</h4>
          <div style={styles.card}>
            <table style={{ width: '100%', fontSize: '12px', textAlign: 'left' }}>
              <thead><tr style={{ color: '#64748b' }}><th>User UID</th><th>Status</th><th>Reward</th></tr></thead>
              <tbody>{inviteHistory.map((inv, i) => (<tr key={i}><td>{inv.uid}</td><td style={{color: '#10b981'}}>{inv.status}</td><td>{inv.reward} TON</td></tr>))}</tbody>
            </table>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div>
          <div style={styles.card}>
            <h3>WITHDRAWAL</h3>
            <input id="wd_amount" style={styles.input} placeholder="Amount (Min 0.1)" type="number" />
            <input id="wd_address" style={styles.input} placeholder="TON Wallet Address" />
            <button style={styles.yellowBtn} onClick={handleWithdraw}>WITHDRAW NOW</button>
          </div>
          <h4>WITHDRAWAL HISTORY</h4>
          <div style={styles.card}>
             <table style={{ width: '100%', fontSize: '12px', textAlign: 'left' }}>
              <thead><tr style={{ color: '#64748b' }}><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {withdrawHistory.map((wh, i) => (<tr key={i}><td>{wh.date}</td><td>{wh.amount}</td><td style={{color: '#fbbf24'}}>{wh.status}</td></tr>))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={{ textAlign: 'center' }}>
          <div style={styles.card}>👤 UID: {APP_CONFIG.MY_UID}</div>
          <div style={styles.warning}>⚠️ NOTICE: FAKE ACCOUNTS AND BOT USERS ARE STRICTLY PROHIBITED.</div>
        </div>
      )}

      <div style={styles.footer}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ textAlign: 'center', color: activeNav === n ? '#fbbf24' : '#64748b', flex: 1, cursor: 'pointer' }}>
            <span style={{ fontSize: '20px' }}>{n === 'earn' ? '💰' : n === 'invite' ? '👥' : n === 'withdraw' ? '💸' : '👤'}</span><br />
            <small style={{ fontSize: '10px' }}>{n.toUpperCase()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
