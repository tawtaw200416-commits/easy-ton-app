import React, { useState } from 'react';

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [activeTab, setActiveTab] = useState('tasks');
  const [claimCode, setClaimCode] = useState('');

  const handleClaim = () => {
    if (claimCode === 'YTTPO') {
      setBalance(prev => prev + 0.0005);
      alert('Success! 0.0005 TON added.');
      setClaimCode('');
    } else { alert('Invalid Code!'); }
  };

  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' },
    header: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px', borderRadius: '25px', border: '1px solid #334155', gap: '15px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#0f172a' : '#94a3b8', fontWeight: 'bold' }),
    card: { backgroundColor: '#1e293b', borderRadius: '20px', padding: '30px', border: '1px solid #334155', textAlign: 'center', marginTop: '20px' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', textAlign: 'center', marginBottom: '15px' },
    btn: { backgroundColor: '#fbbf24', color: '#0f172a', padding: '12px 40px', borderRadius: '12px', border: 'none', fontWeight: 'bold', width: '100%' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#fbbf24'}}></div>
        <div>
          <div style={{fontWeight: 'bold'}}>Shadow Bee's Empire</div>
          <div style={{color: '#fbbf24'}}>{balance.toFixed(4)} TON</div>
        </div>
      </div>

      <div style={{display: 'flex', backgroundColor: '#1e293b', borderRadius: '12px', padding: '5px', marginTop: '20px'}}>
        <button style={styles.tabBtn(activeTab === 'tasks')} onClick={() => setActiveTab('tasks')}>Tasks</button>
        <button style={styles.tabBtn(activeTab === 'rewards')} onClick={() => setActiveTab('rewards')}>Rewards</button>
      </div>

      <div style={styles.card}>
        {activeTab === 'tasks' ? (
          <div><div style={{fontSize: '40px'}}>★</div><p>No main tasks available now</p></div>
        ) : (
          <div>
            <h3 style={{color: '#fbbf24'}}>Enter Reward Code</h3>
            <input style={styles.input} placeholder="YTTPO" value={claimCode} onChange={(e) => setClaimCode(e.target.value.toUpperCase())} />
            <button style={styles.btn} onClick={handleClaim}>CLAIM NOW</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
