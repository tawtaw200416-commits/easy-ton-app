import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [isClaimed, setIsClaimed] = useState(() => localStorage.getItem('gift_claimed') === 'true');
  
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [inviteHistory, setInviteHistory] = useState(() => JSON.parse(localStorage.getItem('inv_hist')) || [
    { uid: "189455...", status: "Completed", reward: "0.0005" }
  ]);

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [socialView, setSocialView] = useState('list');

  const adminWallet = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";
  const adsBlockId = "27393";
  
  const TELEGRAM_BOT_TOKEN = "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk"; 
  const ADMIN_CHAT_ID = "5020977059";

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('inv_hist', JSON.stringify(inviteHistory));
  }, [balance, completed, isClaimed, withdrawHistory, inviteHistory]);

  const botTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

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
      btn.innerText = "VERIFY TASK";
      btn.style.backgroundColor = "#10b981";
      btn.onclick = () => {
        if (window.Adsgram) {
          const AdController = window.Adsgram.init({ blockId: adsBlockId });
          AdController.show().then(() => {
            setBalance(prev => prev + 0.0005);
            setCompleted(prev => [...prev, id]);
            alert("Reward 0.0005 TON Added!");
          }).catch((err) => {
            alert("Ad failed or skipped. Please try again.");
          });
        } else {
          alert("Adsgram not loaded yet.");
        }
      };
    }
  };

  const handleConfirmPayment = () => {
    const channelName = document.getElementById('chan_name').value;
    const inviteLink = document.getElementById('inv_link').value;
    const plan = document.getElementById('plan_select').value;

    if (channelName && inviteLink) {
      const message = `🔔 *New Social Task Order*\n\n📺 Channel: ${channelName}\n🔗 Link: ${inviteLink}\n💰 Plan: ${plan}\n🆔 Memo ID: \`${userUID}\``;
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${ADMIN_CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=Markdown`)
        .then(() => {
          alert("Order sent to Admin!");
          setSocialView('list');
        });
    }
  };

  const handleWithdraw = () => {
    const amount = document.getElementById('wd_amount').value;
    const address = document.getElementById('wd_address').value;
    if (balance >= amount && amount >= 0.1) {
      const message = `💸 *Withdraw Request*\n\nUID: ${userUID}\nAmount: ${amount} TON\nAddress: ${address}`;
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${ADMIN_CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=Markdown`)
        .then(() => {
          setWithdrawHistory([{ date: new Date().toLocaleDateString(), amount, status: "Pending" }, ...withdrawHistory]);
          setBalance(prev => prev - Number(amount));
          alert("Withdrawal submitted!");
        });
    }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert("Copied!"); };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '8px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    copyBox: { background: 'rgba(251,191,36,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid #fbbf24', textAlign: 'center', cursor: 'pointer', marginBottom: '10px' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b' }
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
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'bot' && botTasks.filter(t => !completed.includes(t.id)).map(b => (
            <div key={b.id} style={styles.card}>
              <p>{b.name}</p>
              <button id={`btn-${b.id}`} onClick={() => handleAction(b.id, b.link)} style={styles.yellowBtn}>START BOT</button>
            </div>
          ))}

          {activeTab === 'social' && socialView === 'list' && (
            <>
              <button style={{ ...styles.yellowBtn, marginBottom: '15px' }} onClick={() => setSocialView('add')}>+ ADD TASK</button>
              <div style={styles.card}>
                {socialTasks.filter(t => !completed.includes(t.id)).map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #334155' }}>
                    <span>{s.name}</span>
                    <button id={`btn-${s.id}`} onClick={() => handleAction(s.id, s.link)} style={{ ...styles.yellowBtn, width: '80px' }}>JOIN</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'social' && socialView === 'add' && (
            <div style={styles.card}>
              <input id="chan_name" style={styles.input} placeholder="Channel Name" />
              <input id="inv_link" style={styles.input} placeholder="Invite Link" />
              <select id="plan_select" style={styles.input}><option>100 Views - 0.2 TON</option></select>
              <div style={styles.copyBox} onClick={() => copyToClipboard(adminWallet)}>Wallet: {adminWallet.slice(0,10)}...</div>
              <div style={styles.copyBox} onClick={() => copyToClipboard(userUID)}>Memo ID: {userUID}</div>
              <button style={styles.yellowBtn} onClick={handleConfirmPayment}>CONFIRM PAYMENT</button>
              <p style={{textAlign:'center', marginTop:'10px'}} onClick={()=>setSocialView('list')}>Back</p>
            </div>
          )}

          {activeTab === 'reward' && (
             <div style={styles.card}>
               <h4>GIFT CODE</h4>
               <input id="gift" style={styles.input} placeholder="Enter GIFT77" />
               <button onClick={() => {if(document.getElementById('gift').value==="GIFT77"){setBalance(b=>b+0.01);setIsClaimed(true);alert("Success!")}}} style={styles.yellowBtn}>CLAIM</button>
             </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>INVITE</h3>
          <p>Reward: 0.0005 TON</p>
          <div style={styles.input}>https://t.me/YourBot?start={userUID}</div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <input id="wd_amount" style={styles.input} placeholder="Amount" type="number" />
          <input id="wd_address" style={styles.input} placeholder="Address" />
          <button style={styles.yellowBtn} onClick={handleWithdraw}>WITHDRAW</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={{textAlign:'center'}}><p>UID: {userUID}</p></div>
      )}

      <div style={styles.footer}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ color: activeNav === n ? '#fbbf24' : '#64748b', cursor:'pointer' }}>
            {n.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
