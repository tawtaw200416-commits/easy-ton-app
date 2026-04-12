import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [isClaimed, setIsClaimed] = useState(() => localStorage.getItem('gift_claimed') === 'true');
  const [invites] = useState(0);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('menu');

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
  }, [balance, completed, isClaimed]);

  const socialChannels = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460",
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO",
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69",
    "@zrbtua", "@perviu1million"
  ].map((ch, i) => ({ id: `s${i}`, name: ch, link: `https://t.me/${ch.replace('@','')}` }));

  const startTask = (id, link) => {
    window.open(link, '_blank');
    const btn = document.getElementById(`btn-${id}`);
    if (btn) {
      btn.innerText = "VERIFY AD";
      btn.style.backgroundColor = "#10b981";
      btn.onclick = () => {
        if (window.Adsgram) {
          window.Adsgram.init({ blockId: "27393" }).show().then(() => {
            if (!completed.includes(id)) {
              setBalance(prev => prev + 0.0005);
              setCompleted(prev => [...prev, id]);
              alert("Reward Added!");
            }
          });
        }
      };
    }
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }
  };

  return (
    <div style={styles.main}>
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'reward', 'social'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t); setShowForm(false)}} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'social' && (
            <div>
              {/* Top Add Task Button */}
              <button style={{ ...styles.yellowBtn, marginBottom: '15px' }} onClick={() => setShowForm(true)}>+ ADD TASK</button>
              
              {showForm && (
                <div style={{ ...styles.card, border: '1px solid #fbbf24' }}>
                  {formType === 'menu' ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button style={styles.yellowBtn} onClick={() => setFormType('add')}>ADD TASK</button>
                      <button style={{ ...styles.yellowBtn, background: '#334155', color: '#fff' }} onClick={() => setFormType('my')}>MY TASK</button>
                    </div>
                  ) : (
                    <div>
                      <input style={styles.input} placeholder="Channel Name" />
                      <input style={styles.input} placeholder="Link" />
                      <select style={styles.input}>
                        <option>100 Views - 0.2 TON</option>
                        <option>200 Views - 0.4 TON</option>
                        <option>300 Views - 0.5 TON</option>
                      </select>
                      <div style={{ fontSize: '11px', background: '#0f172a', padding: '10px', borderRadius: '10px', marginBottom: '10px' }}>
                        Address: <small style={{color:'#fbbf24'}}>UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9</small><br/>
                        MEMO: <b style={{color:'#fbbf24'}}>{userUID}</b>
                      </div>
                      <button style={styles.yellowBtn} onClick={() => {alert("Admin notified!"); setShowForm(false); setFormType('menu')}}>SUBMIT PAYMENT</button>
                    </div>
                  )}
                </div>
              )}

              {/* Social Channels List */}
              {socialChannels.map(s => (
                <div key={s.id} style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px' }}>{s.name}</span>
                    <button id={`btn-${s.id}`} onClick={() => startTask(s.id, s.link)} style={{ ...styles.yellowBtn, width: '90px', fontSize: '11px' }}>JOIN</button>
                  </div>
                </div>
              ))}

              {/* Bottom Add Task Button */}
              <button style={{ ...styles.yellowBtn, marginTop: '10px' }} onClick={() => setShowForm(true)}>+ ADD TASK</button>
            </div>
          )}

          {/* Reward & Bot Tabs remain here... */}
        </>
      )}

      {/* Footer Navigation */}
      <div style={styles.footer}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ textAlign: 'center', color: activeNav === n ? '#fbbf24' : '#64748b', flex: 1, cursor: 'pointer' }}>
            {n === 'earn' ? '💰' : n === 'invite' ? '👥' : n === 'withdraw' ? '💸' : '👤'}<br/><small>{n.toUpperCase()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
