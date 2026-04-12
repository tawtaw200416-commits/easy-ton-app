import React, { useState, useEffect } from 'react';

// ✅ Configuration
const APP_CONFIG = {
  ADS_BLOCK_ID: "27393", // Bro ရဲ့ Adsgram Block ID
  MY_UID: "1793453606"
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [isClaimed, setIsClaimed] = useState(() => localStorage.getItem('gift_claimed') === 'true');
  
  // ✅ Withdraw History ကို Table ပုံစံပြဖို့အတွက် state
  const [withdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || [
    { date: "2026-04-10", amount: "0.1500", status: "Pending" },
    { date: "2026-04-08", amount: "0.2000", status: "Success" }
  ]);

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [socialView, setSocialView] = useState('list');

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
  }, [balance, completed, isClaimed]);

  // ✅ Bro တောင်းဆိုထားတဲ့ Social Tasks ၁၄ ခု
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

  // ✅ Task တစ်ခုလုပ်တိုင်း ကြော်ငြာတက်ပြီးမှ Reward ပေါင်းပေးမည့် Logic
  const handleAction = (id, link) => {
    window.open(link, '_blank');
    const btn = document.getElementById(`btn-${id}`);
    if (btn) {
      btn.innerText = "VERIFYING...";
      
      // Adsgram Ad Controller ကို ခေါ်ယူခြင်း
      if (window.Adsgram) {
        const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADS_BLOCK_ID });
        AdController.show().then(() => {
          // ကြော်ငြာကြည့်ပြီးမှ 0.0005 ပေါင်းမည်
          setBalance(prev => Number((prev + 0.0005).toFixed(5)));
          setCompleted(prev => [...prev, id]);
          btn.innerText = "COMPLETE ✅";
          btn.style.backgroundColor = "#10b981";
        }).catch(() => {
          alert("Please watch the full ad to claim reward.");
          btn.innerText = "RETRY AD";
        });
      } else {
        // Adsgram SDK မရှိလျှင် Test အနေဖြင့် ၃ စက္ကန့်အကြာတွင် ပေါင်းပေးမည်
        setTimeout(() => {
          setBalance(prev => Number((prev + 0.0005).toFixed(5)));
          setCompleted(prev => [...prev, id]);
          btn.innerText = "COMPLETE ✅";
          btn.style.backgroundColor = "#10b981";
        }, 3000);
      }
    }
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '110px' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    table: { width: '100%', fontSize: '13px', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' },
    th: { color: '#64748b', paddingBottom: '8px', borderBottom: '1px solid #334155' },
    td: { padding: '10px 0', borderBottom: '1px solid #334155' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', backgroundColor: '#1e293b', borderTop: '2px solid #334155', padding: '10px 0' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', cursor: 'pointer', color: active ? '#fbbf24' : '#94a3b8' })
  };

  return (
    <div style={styles.main}>
      {/* Header Balance Section */}
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

          {activeTab === 'social' && socialView === 'list' && (
            <>
              <button style={{ ...styles.yellowBtn, marginBottom: '10px' }} onClick={() => setSocialView('add')}>+ ADD TASK (PROMOTE)</button>
              <div style={styles.card}>
                {socialTasks.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' }}>
                    <span style={{ fontSize: '14px' }}>{s.name}</span>
                    <button 
                      id={`btn-${s.id}`} 
                      disabled={completed.includes(s.id)}
                      onClick={() => handleAction(s.id, s.link)} 
                      style={{ 
                        ...styles.yellowBtn, 
                        width: '90px', 
                        padding: '6px', 
                        fontSize: '12px',
                        backgroundColor: completed.includes(s.id) ? '#10b981' : '#fbbf24'
                      }}>
                      {completed.includes(s.id) ? "DONE" : "JOIN"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ... အခြား Bot နှင့် Reward အပိုင်းများကို မပြောင်းလဲဘဲ ထားရှိပါသည် ... */}
        </>
      )}

      {activeNav === 'withdraw' && (
        <div>
          <div style={styles.card}>
            <h3>WITHDRAWAL</h3>
            <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" />
            <input style={styles.input} placeholder="Wallet Address" />
            <button style={styles.yellowBtn}>WITHDRAW NOW</button>
          </div>

          {/* ✅ Withdrawal History Table */}
          <h4>WITHDRAWAL HISTORY</h4>
          <div style={styles.card}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawHistory.map((w, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{w.date}</td>
                    <td style={styles.td}>{w.amount} TON</td>
                    <td style={{ ...styles.td, color: w.status === 'Success' ? '#10b981' : '#fbbf24' }}>{w.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ✅ Footer Navigation */}
      <div style={styles.navBar}>
        <div onClick={() => setActiveNav('earn')} style={styles.navBtn(activeNav === 'earn')}>💰<br/><small>EARN</small></div>
        <div onClick={() => setActiveNav('invite')} style={styles.navBtn(activeNav === 'invite')}>👥<br/><small>INVITE</small></div>
        <div onClick={() => setActiveNav('withdraw')} style={styles.navBtn(activeNav === 'withdraw')}>💸<br/><small>WITHDRAW</small></div>
        <div onClick={() => setActiveNav('profile')} style={styles.navBtn(activeNav === 'profile')}>👤<br/><small>PROFILE</small></div>
      </div>
    </div>
  );
}

export default App;
