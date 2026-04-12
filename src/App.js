import React, { useState, useEffect } from 'react';

function App() {
  // Persistence Data
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [referralCount, setReferralCount] = useState(() => JSON.parse(localStorage.getItem('ref_count')) || 0);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('withdraw_history')) || []);
  
  // UI States
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");

  const userUID = "1793453606";

  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
    localStorage.setItem('ref_count', JSON.stringify(referralCount));
    localStorage.setItem('withdraw_history', JSON.stringify(withdrawHistory));
  }, [balance, completedTasks, referralCount, withdrawHistory]);

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount > balance || amount < 0.5) {
      alert("လက်ကျန်ငွေမလုံလောက်ပါ သို့မဟုတ် အနည်းဆုံး 0.5 TON ထုတ်ရပါမည်။");
      return;
    }
    const newEntry = { amount, address: withdrawAddress, date: new Date().toLocaleString(), status: "Pending" };
    setWithdrawHistory([newEntry, ...withdrawHistory]);
    setBalance(prev => prev - amount);
    setWithdrawAmount("");
    setWithdrawAddress("");
    alert("ငွေထုတ်ယူရန် တောင်းဆိုမှု အောင်မြင်ပါသည်။");
  };

  const styles = {
    container: { backgroundColor: '#0b1120', color: 'white', minHeight: '100vh', padding: '15px', fontFamily: 'Arial, sans-serif', paddingBottom: '90px' },
    balanceCard: { backgroundColor: '#1e293b', borderRadius: '24px', padding: '30px 15px', textAlign: 'center', marginBottom: '20px', border: '1px solid #334155' },
    balanceText: { fontSize: '40px', fontWeight: '900', color: '#eab308', margin: '10px 0' },
    card: { backgroundColor: '#1e293b', borderRadius: '24px', padding: '20px', border: '1px solid #334155', marginBottom: '15px' },
    input: { width: '100%', padding: '15px', borderRadius: '12px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '12px', boxSizing: 'border-box', fontWeight: 'bold' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', padding: '15px', backgroundColor: '#0f172a', borderTop: '1px solid #1e293b', justifyContent: 'space-around' },
    btnPrimary: { width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#eab308', border: 'none', fontWeight: '900', color: '#000', cursor: 'pointer' },
    warningBox: { borderLeft: '4px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '8px', marginBottom: '15px' }
  };

  return (
    <div style={styles.container}>
      {/* Top Balance Display */}
      <div style={styles.balanceCard}>
        <div style={{ fontWeight: '900', color: '#94a3b8', fontSize: '13px' }}>TOTAL BALANCE</div>
        <div style={styles.balanceText}>{balance.toFixed(4)} TON</div>
      </div>

      {activeNav === 'earn' && (
        <div style={styles.card}>
          <h3 style={{ textAlign: 'center', color: '#eab308', fontWeight: '900' }}>Tasks & Missions</h3>
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>ပြီးမြောက်ထားသော Task များမှ ဆုလာဘ်များကို ဤနေရာတွင် ရယူနိုင်ပါသည်။</p>
        </div>
      )}

      {activeNav === 'invite' && (
        <>
          <div style={styles.card}>
            <h3 style={{ color: '#eab308', fontWeight: '900' }}>Invite Friends</h3>
            <p>ဖိတ်ခေါ်မှုတစ်ခုတိုင်းအတွက် 0.01 TON ရရှိပါမည်။</p>
            <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '8px', fontSize: '12px', wordBreak: 'break-all' }}>
              https://t.me/YourBotLink?start={userUID}
            </div>
          </div>
          <div style={styles.card}>
            <h4 style={{ fontWeight: '900' }}>Referral Statistics</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <span>Total Successful Invites:</span>
              <span style={{ color: '#eab308', fontWeight: '900' }}>{referralCount} Users</span>
            </div>
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3 style={{ color: '#eab308', fontWeight: '900', marginBottom: '15px' }}>Withdraw Funds</h3>
            <input 
              style={styles.input} 
              placeholder="Enter TON Amount" 
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <input 
              style={styles.input} 
              placeholder="Enter TON Wallet Address" 
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
            />
            <button onClick={handleWithdraw} style={styles.btnPrimary}>Withdraw Now</button>
          </div>
          
          <div style={styles.card}>
            <h4 style={{ fontWeight: '900' }}>Withdrawal History</h4>
            {withdrawHistory.length === 0 ? <p style={{ color: '#94a3b8', fontSize: '13px' }}>ထုတ်ယူမှု မှတ်တမ်းမရှိသေးပါ။</p> : 
              withdrawHistory.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}>
                  <div style={{ fontSize: '12px' }}>{h.date}</div>
                  <div style={{ fontWeight: '900', color: '#eab308' }}>{h.amount} TON</div>
                  <div style={{ fontSize: '12px', color: '#10b981' }}>{h.status}</div>
                </div>
              ))
            }
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{ color: '#eab308', fontWeight: '900', textAlign: 'center' }}>User Account Info</h3>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>User ID:</div>
            <div style={{ fontWeight: '900', fontSize: '20px' }}>{userUID}</div>
          </div>
          
          <h4 style={{ color: '#ef4444', fontWeight: '900' }}>⚠️ အရေးကြီးသော သတိပေးချက်များ</h4>
          <div style={styles.warningBox}>
            <p style={{ fontSize: '14px', margin: '5px 0' }}>• တစ်ဦးတည်း အကောင့်အများအပြား အသုံးပြုခြင်းကို တားမြစ်ပါသည်။</p>
            <p style={{ fontSize: '14px', margin: '5px 0' }}>• မှားယွင်းသော Wallet Address ထည့်သွင်းမိပါက တာဝန်ယူမည်မဟုတ်ပါ။</p>
            <p style={{ fontSize: '14px', margin: '5px 0' }}>• ငွေထုတ်ယူမှုများသည် ၂၄ နာရီအတွင်း အတည်ပြုပေးပါမည်။</p>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div style={styles.footer}>
        <div onClick={() => setActiveNav('earn')} style={{ textAlign: 'center', color: activeNav === 'earn' ? '#eab308' : '#94a3b8', cursor: 'pointer' }}>
          <div style={{ fontSize: '20px' }}>💰</div><div style={{ fontSize: '10px', fontWeight: '900' }}>EARN</div>
        </div>
        <div onClick={() => setActiveNav('invite')} style={{ textAlign: 'center', color: activeNav === 'invite' ? '#eab308' : '#94a3b8', cursor: 'pointer' }}>
          <div style={{ fontSize: '20px' }}>👥</div><div style={{ fontSize: '10px', fontWeight: '900' }}>INVITE</div>
        </div>
        <div onClick={() => setActiveNav('withdraw')} style={{ textAlign: 'center', color: activeNav === 'withdraw' ? '#eab308' : '#94a3b8', cursor: 'pointer' }}>
          <div style={{ fontSize: '20px' }}>💸</div><div style={{ fontSize: '10px', fontWeight: '900' }}>WITHDRAW</div>
        </div>
        <div onClick={() => setActiveNav('profile')} style={{ textAlign: 'center', color: activeNav === 'profile' ? '#eab308' : '#94a3b8', cursor: 'pointer' }}>
          <div style={{ fontSize: '20px' }}>👤</div><div style={{ fontSize: '10px', fontWeight: '900' }}>PROFILE</div>
        </div>
      </div>
    </div>
  );
}

export default App;
