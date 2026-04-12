import React, { useState } from 'react';
import './App.css';

function App() {
  const [balance, setBalance] = useState(0.0100);

  const showAd = () => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: "27393" }); // Bro ရဲ့ Block ID
      AdController.show()
        .then(() => {
          setBalance(prev => prev + 0.001);
          alert("Reward Claimed!");
        })
        .catch(() => {
          alert("Ad Error or Skipped");
        });
    } else {
      alert("Adsgram SDK loading...");
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>TOTAL BALANCE</h1>
      <h2 style={{ color: '#00D1FF' }}>{balance.toFixed(4)} TON</h2>
      <button 
        onClick={showAd}
        style={{ padding: '15px 30px', borderRadius: '10px', background: '#0088CC', color: 'white', border: 'none' }}
      >
        CLAIM DAILY GIFT
      </button>
    </div>
  );
}

export default App;

