import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [balance, setBalance] = useState(0.0100);
  const [activeTab, setActiveTab] = useState('EARN');

  // Adsgram Ad Controller
  const showAd = () => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: "27393" }); // Bro ရဲ့ Block ID
      AdController.show()
        .then((result) => {
          setBalance(prev => prev + 0.001);
          alert("Reward Claimed Successfully!");
        })
        .catch((result) => {
          alert("Ad skipped or error occurred");
        });
    } else {
      alert("Adsgram SDK not loaded yet");
    }
  };

  return (
    <div className="App">
      {/* Header Section */}
      <div className="header">
        <p className="total-balance-text">TOTAL BALANCE</p>
        <h1 className="balance-amount">{balance.toFixed(4)} TON</h1>
      </div>

      {/* Category Buttons */}
      <div className="category-tabs">
        <button className="tab-btn">BOT</button>
        <button className="tab-btn">SOCIAL</button>
        <button className="tab-btn active">REWARD</button>
      </div>

      {/* Main Content */}
      <div className="content-card">
        {activeTab === 'EARN' && (
          <div className="reward-section">
            <p>DAILY GIFT CODE</p>
            <button className="claim-btn" onClick={showAd}>
              CLAIMED ✅
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button onClick={() => setActiveTab('EARN')} className={activeTab === 'EARN' ? 'active' : ''}>
          <div className="icon">💰</div>
          <span>EARN</span>
        </button>
        <button onClick={() => setActiveTab('INVITE')} className={activeTab === 'INVITE' ? 'active' : ''}>
          <div className="icon">👥</div>
          <span>INVITE</span>
        </button>
        <button onClick={() => setActiveTab('WITHDRAW')} className={activeTab === 'WITHDRAW' ? 'active' : ''}>
          <div className="icon">💸</div>
          <span>WITHDRAW</span>
        </button>
        <button onClick={() => setActiveTab('PROFILE')} className={activeTab === 'PROFILE' ? 'active' : ''}>
          <div className="icon">👤</div>
          <span>PROFILE</span>
        </button>
      </div>
    </div>
  );
}

export default App;
