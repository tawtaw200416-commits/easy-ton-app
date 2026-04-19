import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "Guest_ID",
  // Block IDs နှစ်ခုလုံးကို ဒီမှာ ထည့်ထားပါတယ်
  ADS_BLOCKS: ["27611", "27633"], 
  AD_REWARD: 0.0005,
  TASK_REWARD: 0.0005
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [isAdLoading, setIsAdLoading] = useState(false);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
  }, []);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
  }, [balance, completed]);

  // --- ကြော်ငြာပြသပြီး Reward ပေးမည့် Main Function ---
  const triggerAd = (callback) => {
    if (isAdLoading) return;
    
    if (window.Adsgram) {
      setIsAdLoading(true);
      // Block ID နှစ်ခုထဲမှ တစ်ခုကို random ရွေးချယ်ခြင်း
      const randomBlockId = APP_CONFIG.ADS_BLOCKS[Math.floor(Math.random() * APP_CONFIG.ADS_BLOCKS.length)];
      const AdController = window.Adsgram.init({ blockId: randomBlockId });

      AdController.show()
        .then(() => {
          setIsAdLoading(false);
          if (callback) callback();
        })
        .catch((err) => {
          setIsAdLoading(false);
          console.error("Ad Error:", err);
          alert("Ad failed to load. Please try again.");
        });
    } else {
      alert("Adsgram not connected yet. Please wait a few seconds.");
    }
  };

  // ခလုတ်နှိပ်တိုင်း အလုပ်လုပ်မည့် function
  const handleEarnClick = () => {
    triggerAd(() => {
      setBalance(prev => Number((prev + APP_CONFIG.AD_REWARD).toFixed(5)));
      alert("Reward Added! +0.0005 TON");
    });
  };

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    // Task ပြီးမြောက်ဖို့ ကြော်ငြာအရင်ကြည့်ခိုင်းခြင်း
    setTimeout(() => {
      triggerAd(() => {
        if (!completed.includes(id)) {
          setBalance(prev => Number((prev + APP_CONFIG.TASK_REWARD).toFixed(5)));
          setCompleted(prev => [...prev, id]);
        }
      });
    }, 2000);
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    headerCard: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000' },
    btn: (bg = '#000', col = '#fff') => ({ width: '100%', padding: '14px', backgroundColor: bg, color: col, border: 'none', borderRadius: '12px', fontWeight: '900', marginBottom: '10px' }),
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px 0', borderTop: '4px solid #fff' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '12px', fontWeight: 'bold' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.headerCard}>
        <small style={{ color: '#facc15' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '38px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize: 16}}>TON</span></h1>
        <div style={{color: '#4ade80', fontSize: 10}}>● {isAdLoading ? "LOADING AD..." : "SYSTEM READY"}</div>
      </div>

      {activeNav === 'earn' && (
        <>
          {/* ကြော်ငြာကြည့်ရန် သီးသန့်ခလုတ်ကြီး */}
          <button 
            disabled={isAdLoading}
            onClick={handleEarnClick} 
            style={styles.btn('#dc2626', '#fff')}
          >
            {isAdLoading ? "PLEASE WAIT..." : "📺 WATCH AD TO EARN"}
          </button>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'social'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '2px solid #000', backgroundColor: activeTab === t ? '#000' : '#fff', color: activeTab === t ? '#fff' : '#000', fontWeight: 'bold' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" },
              { id: 'b2', name: "Golden Miner", link: "https://t.me/GoldenMinerBot" }
            ].filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.btn(), width: '80px', marginBottom: 0}}>START</button></div>
            ))}

            {activeTab === 'social' && [
              { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
              { id: 's4', name: "@M9460 Channel", link: "https://t.me/M9460" }
            ].filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.btn(), width: '80px', marginBottom: 0}}>JOIN</button></div>
            ))}
          </div>
        </>
      )}

      {/* Profile & Navigation (ဒီအတိုင်းထားပါသည်) */}
      <div style={styles.navBar}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navBtn(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
