import React, { useState, useEffect } from 'react';

// ✅ Adsgram Block ID ကို Bro ရဲ့ ID (27393) နဲ့ သေချာအောင် ပြန်စစ်ပေးပါ
const ADS_BLOCK_ID = "27393";

function App() {
  // 💰 Balance (အရင် data မပျက်အောင် 'ton_bal' ကို သုံးထားပါတယ်)
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  
  // ✅ လုပ်ပြီးသား Task စာရင်း (အရင် data မပျက်အောင် 'comp_tasks' ကို သုံးထားပါတယ်)
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  
  // 💸 Withdraw History (အရင် data မပျက်အောင် 'wd_hist' ကို သုံးထားပါတယ်)
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social'); // Social ကို default ထားပေးထားပါတယ်

  // Data တွေပြောင်းတိုင်း localStorage မှာ အလိုအလျောက် သိမ်းပေးတဲ့အပိုင်း
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
  }, [balance, completed, withdrawHistory]);

  // ✅ Bro ရဲ့ Social Tasks ၁၄ ခု (အကုန်ထည့်ထားပါတယ်)
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

  // ✅ Task Reward Logic (Ads ကြည့်ပြီးမှ ပေါင်းပေးမည့်အပိုင်း)
  const handleAction = (id, link) => {
    window.open(link, '_blank');
    const btn = document.getElementById(`btn-${id}`);
    if (btn) btn.innerText = "VERIFYING...";

    if (window.Adsgram) {
      window.Adsgram.init({ blockId: ADS_BLOCK_ID }).show()
        .then(() => {
          // Ads ကြည့်ပြီးမှ 0.0005 ပေါင်းပေးခြင်း
          setBalance(prev => Number((prev + 0.0005).toFixed(5)));
          setCompleted(prev => [...prev, id]);
        })
        .catch(() => {
          alert("Please watch the full ad to claim reward.");
          if (btn) btn.innerText = "JOIN";
        });
    } else {
      // Adsgram မရှိလျှင် (Test Mode)
      setTimeout(() => {
        setBalance(prev => Number((prev + 0.0005).toFixed(5)));
        setCompleted(prev => [...prev, id]);
      }, 2000);
    }
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px' },
    headerBox: { textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', padding: '10px 0', borderTop: '2px solid #334155' }
  };

  return (
    <div style={styles.main}>
      {/* 💰 Total Balance (အရင်ရှိပြီးသား data ပြန်ပေါ်လာပါမယ်) */}
      <div style={styles.headerBox}>
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

          {activeTab === 'social' && (
            <div style={styles.card}>
              {socialTasks.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' }}>
                  <span style={{ fontSize: '13px' }}>{s.name}</span>
                  <button 
                    id={`btn-${s.id}`}
                    disabled={completed.includes(s.id)}
                    onClick={() => handleAction(s.id, s.link)}
                    style={{ 
                      backgroundColor: completed.includes(s.id) ? '#10b981' : '#fbbf24',
                      color: completed.includes(s.id) ? '#fff' : '#000',
                      border: 'none', padding: '6px 15px', borderRadius: '8px', fontWeight: 'bold', width: '90px'
                    }}>
                    {completed.includes(s.id) ? "DONE" : "JOIN"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeNav === 'withdraw' && (
        <div>
          <div style={styles.card}>
            <h3>WITHDRAWAL</h3>
            <input style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '10px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155' }} placeholder="Amount (Min 0.1)" type="number" />
            <input style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '10px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155' }} placeholder="TON Wallet Address" />
            <button style={styles.yellowBtn}>WITHDRAW NOW</button>
          </div>

          {/* 💸 History Section (အရင် data မပျက်အောင် ပြန်ချိတ်ထားပါတယ်) */}
          <h4>WITHDRAWAL HISTORY</h4>
          <div style={styles.card}>
            {withdrawHistory.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No records found</div>
            ) : (
              <table style={{ width: '100%', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr>
                    <th style={{ color: '#64748b' }}>Date</th>
                    <th style={{ color: '#64748b' }}>Amount</th>
                    <th style={{ color: '#64748b' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawHistory.map((w, i) => (
                    <tr key={i}>
                      <td style={{ padding: '10px 0' }}>{w.date}</td>
                      <td>{w.amount} TON</td>
                      <td style={{ color: w.status === 'Success' ? '#10b981' : '#fbbf24' }}>{w.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div style={styles.navBar}>
        <div onClick={() => setActiveNav('earn')} style={{ flex: 1, textAlign: 'center', color: activeNav === 'earn' ? '#fbbf24' : '#94a3b8' }}>💰<br/><small>EARN</small></div>
        <div onClick={() => setActiveNav('invite')} style={{ flex: 1, textAlign: 'center', color: activeNav === 'invite' ? '#fbbf24' : '#94a3b8' }}>👥<br/><small>INVITE</small></div>
        <div onClick={() => setActiveNav('withdraw')} style={{ flex: 1, textAlign: 'center', color: activeNav === 'withdraw' ? '#fbbf24' : '#94a3b8' }}>💸<br/><small>WITHDRAW</small></div>
        <div onClick={() => setActiveNav('profile')} style={{ flex: 1, textAlign: 'center', color: activeNav === 'profile' ? '#fbbf24' : '#94a3b8' }}>👤<br/><small>PROFILE</small></div>
      </div>
    </div>
  );
}

export default App;
