​import React, { useState, useEffect } from 'react';

function App() {
  const [balance, setBalance] = useState(0.0100);
  const [invitedFriends, setInvitedFriends] = useState(0);

  // Adsgram Controller ကို Initialize လုပ်ခြင်း
  const showAd = () => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: "27393" }); // Bro ရဲ့ Block ID
      AdController.show()
        .then(() => {
          setBalance(prev => prev + 0.005); // ကြော်ငြာကြည့်ရင် 0.005 TON တိုးပေးမည်
          alert("Reward Claimed! +0.005 TON");
        })
        .catch((error) => {
          console.error("Ad error:", error);
          alert("Ad failed to load. Please try again later.");
        });
    } else {
      alert("Adsgram SDK is still loading...");
    }
  };

  const handleJoinChannel = (url) => {
    window.open(url, '_blank');
    setBalance(prev => prev + 0.002); // Channel join ရင် 0.002 TON တိုးပေးမည်
  };

  return (
    <div style={{ 
      backgroundColor: '#020617', 
      minHeight: '100vh', 
      color: 'white', 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      {/* Balance Section */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <p style={{ fontSize: '14px', color: '#94a3b8' }}>TOTAL BALANCE</p>
        <h1 style={{ fontSize: '48px', color: '#00D1FF', margin: '10px 0' }}>
          {balance.toFixed(4)} TON
        </h1>
        <button 
          onClick={showAd}
          style={{ 
            background: 'linear-gradient(to right, #0088CC, #00D1FF)', 
            border: 'none', padding: '15px 40px', borderRadius: '30px', 
            color: 'white', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' 
          }}
        >
          CLAIM DAILY GIFT (WATCH AD)
        </button>
      </div>

      <hr style={{ border: '0.1px solid #1e293b', margin: '30px 0' }} />

      {/* Tasks Section */}
      <h3>EARN MORE</h3>
      <div style={{ display: 'grid', gap: '15px' }}>
        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Join Telegram Channel</span>
          <button onClick={() => handleJoinChannel('https://t.me/your_channel')} style={{ backgroundColor: '#0088CC', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '8px' }}>Join</button>
        </div>
        
        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Invite 1 Friend</span>
          <span style={{ color: '#00D1FF' }}>+0.01 TON</span>
        </div>
      </div>

      {/* Profile/Invite Section */}
      <div style={{ marginTop: '40px', background: '#0f172a', padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
        <p>Friends Invited: {invitedFriends}</p>
        <button style={{ background: 'none', border: '1px solid #0088CC', color: '#0088CC', padding: '10px 20px', borderRadius: '10px' }}>
          Copy Invite Link
        </button>
      </div>
    </div>
  );
}

export default App;
