import React, { useState } from 'react';

function App() {
  const [balance, setBalance] = useState(0.0100);

  const showAd = () => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: "27393" }); 
      AdController.show()
        .then(() => {
          setBalance(prev => prev + 0.001);
          alert("Reward Claimed!");
        })
        .catch((error) => {
          console.error("Ad error:", error);
          alert("Ad Error or Skipped");
        });
    } else {
      alert("Adsgram SDK loading...");
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px', color: 'white' }}>
      <h1>TOTAL BALANCE</h1>
      <h2 style={{ color: '#00D1FF' }}>{balance.toFixed(4)} TON</h2>
      <button 
        onClick={showAd}
        style={{ 
          padding: '15px 30px', 
          borderRadius: '10px', 
          background: '#0088CC', 
          color: 'white', 
          border: 'none',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer' 
        }}
      >
        CLAIM DAILY GIFT
      </button>
    </div>
  );
}

export default App;
