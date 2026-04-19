import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "Guest",
  ADSGRAM_BLOCK_ID: "27611", // Your verified Block ID
  AD_REWARD: 0.0005
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [isAdReady, setIsAdReady] = useState(false);
  const [activeNav, setActiveNav] = useState('earn');

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // Adsgram SDK အလုပ်လုပ်၊ မလုပ်ကို စက္ကန့်အနည်းငယ်ခြားပြီး စစ်ဆေးပေးခြင်း
    const checkAdsgram = setInterval(() => {
      if (window.Adsgram) {
        setIsAdReady(true);
        clearInterval(checkAdsgram);
      }
    }, 1000);

    return () => clearInterval(checkAdsgram);
  }, []);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
  }, [balance]);

  // အသေချာဆုံး ကြော်ငြာပြသရန် Logic
  const handleWatchAd = () => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      
      // Ad loading ဖြစ်နေစဉ် user ကို ခေတ္တစောင့်ခိုင်းရန် Alert ပြခြင်း
      AdController.show()
        .then((result) => {
          // ကြော်ငြာကြည့်ပြီးမှ balance တိုးပေးမည်
          setBalance(prev => Number((prev + APP_CONFIG.AD_REWARD).toFixed(5)));
          tg.showAlert("Success! +0.0005 TON received.");
        })
        .catch((error) => {
          console.error("Adsgram error:", error);
          tg.showAlert("Ad failed to show. Please try again in a few seconds.");
        });
    } else {
      tg.showAlert("Adsgram is still connecting. Please wait 3-5 seconds.");
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' },
    balanceCard: { background: '#000', color: '#fff', padding: '30px', borderRadius: '25px', textAlign: 'center', marginBottom: '20px', border: '4px solid #fff' },
    adBtn: (ready) => ({ 
      width: '100%', padding: '16px', 
      background: ready ? '#dc2626' : '#9ca3af', 
      color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 'bold', fontSize: '16px',
      boxShadow: '0 4px 0 #000',
      cursor: 'pointer'
    })
  };

  return (
    <div style={styles.main}>
      <div style={styles.balanceCard}>
        <small style={{ color: '#facc15' }}>TOTAL BALANCE</small>
        <h1 style={{ fontSize: '38px', margin: '10px 0' }}>{balance.toFixed(5)} TON</h1>
        <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: isAdReady ? '#4ade80' : '#f87171' }}>●</span> 
          {isAdReady ? "SYSTEM READY" : "CONNECTING ADS..."}
        </div>
      </div>

      {activeNav === 'earn' && (
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={handleWatchAd} 
            style={styles.adBtn(isAdReady)}
          >
            📺 WATCH VIDEO (+0.0005 TON)
          </button>
          
          <p style={{ textAlign: 'center', fontSize: '12px', marginTop: '10px', fontWeight: 'bold' }}>
            {isAdReady ? "Click to earn TON" : "Please wait while connecting to ad server..."}
          </p>
        </div>
      )}

      {/* Bottom Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#000', display: 'flex', padding: '15px 0', borderTop: '2px solid #fff' }}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, textAlign: 'center', color: activeNav === n ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold' }}>
            {n.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
