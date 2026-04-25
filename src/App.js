import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  ADMIN_ID: "1793453606", 
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0009,
  VIP_WATCH_REWARD: 0.003,
  CODE_REWARD: 0.0008, 
  REFER_REWARD: 0.001,
  SPECIAL_VIP_ID: "5020977059" // အစ်ကိုပြောတဲ့ Special VIP ID
};

function App() {
  const [balance, setBalance] = useState(0);
  const [isVip, setIsVip] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [isLoading, setIsLoading] = useState(true);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  const [adminPromoCode, setAdminPromoCode] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // ၁။ User Data ကို အရင်စစ်မယ်
      const uRes = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
      const userData = await uRes.json();

      const isSpecialUser = APP_CONFIG.MY_UID === APP_CONFIG.SPECIAL_VIP_ID;

      if (userData) {
        // ရှိပြီးသား User ဆိုရင် Data အဟောင်းကိုပဲ ဆက်သုံးမယ် (0 မဖြစ်စေရ)
        setBalance(Number(userData.balance || 0));
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        // Special ID ဖြစ်ရင် database မှာ VIP မဖြစ်သေးရင်တောင် App မှာ VIP ပေးမယ်
        setIsVip(isSpecialUser || !!userData.isVip);

        // Database မှာ VIP အခြေအနေကို Update လုပ်ထားပေးမယ်
        if (isSpecialUser && !userData.isVip) {
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ isVip: true })
          });
        }
      } else {
        // User အသစ်စက်စက်မှသာ စာရင်းစဖွင့်မယ်
        const initialData = { 
          balance: 0, 
          isVip: isSpecialUser, 
          completed: [], 
          withdrawHistory: [] 
        };
        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PUT',
          body: JSON.stringify(initialData)
        });
        setBalance(0);
        setIsVip(isSpecialUser);
      }

      // ၂။ Leaderboard Data ဆွဲမယ်
      const lRes = await fetch(`${APP_CONFIG.FIREBASE_URL}/users.json`);
      const allUsers = await lRes.json();
      if (allUsers) {
        const sorted = Object.entries(allUsers)
          .map(([id, data]) => ({ 
            id, 
            balance: typeof data === 'object' ? (data.balance || 0) : 0 
          }))
          .sort((a, b) => b.balance - a.balance)
          .slice(0, 10);
        setLeaderboard(sorted);
      }
    } catch (e) {
      console.error("Data Load Error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const processReward = (id, rewardAmount) => {
    let finalReward = rewardAmount;
    if (id === 'watch_ad') {
      finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
    }

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then((result) => {
        if (result.done) {
          const newBal = Number((balance + finalReward).toFixed(5));
          const newCompleted = id !== 'watch_ad' ? [...completed, id] : completed;
          
          setBalance(newBal);
          if (id !== 'watch_ad') setCompleted(newCompleted);

          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, completed: newCompleted })
          });
          alert(`Reward Success: +${finalReward} TON`);
        }
      });
    }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    if (link) tg?.openTelegramLink ? tg.openTelegramLink(link) : window.open(link, '_blank');
    setTimeout(() => { processReward(id, reward); }, 1500);
  };

  // Loading ဖြစ်နေရင် UI မပြသေးဘဲ စောင့်ခိုင်းမယ် (Balance Reset ဖြစ်တာကို ကာကွယ်ဖို့)
  if (isLoading) {
    return <div style={{...styles.main, display:'flex', justifyContent:'center', alignItems:'center'}}><h2>SYNCING DATA...</h2></div>;
  }

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:5}}>
            <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
            {isVip && <span style={{fontSize:10, background:'#facc15', color:'#000', padding:'2px 5px', borderRadius:5, fontWeight:'bold'}}>VIP ⭐</span>}
        </div>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch Video - Get {isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD} TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => processReward('watch_ad', 0)}>WATCH ADS</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === APP_CONFIG.ADMIN_ID) && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" },
              { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot" },
              { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot" },
              { id: 'b4', name: "TonSpeed Bot", link: "https://t.me/tonspeeddrop_bot" },
              { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot" },
              { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot" }
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}

            {activeTab === 'social' && [
              { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
              { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
              { id: 's3', name: "@easytonfree", link: "https://t.me/easytonfree" }
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'JOIN'}</button>
              </div>
            ))}

            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => handleTaskReward('c_'+rewardCodeInput, APP_CONFIG.CODE_REWARD)}>CLAIM</button>
              </div>
            )}

            {activeTab === 'admin' && (
              <div>
                <h4>Create Promo Code</h4>
                <input style={styles.input} placeholder="Code Name" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                <button style={{...styles.btn, background: 'purple'}} onClick={async () => {
                   if(!adminPromoCode) return alert("Enter code!");
                   await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${adminPromoCode}.json`, { 
                     method: 'PUT', body: JSON.stringify({ code: adminPromoCode, reward: APP_CONFIG.CODE_REWARD }) 
                   });
                   alert("Code Created!"); setAdminPromoCode('');
                }}>SAVE CODE</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'leaderboard' && (
        <div style={styles.card}>
          <h3 style={{textAlign:'center', marginBottom:15}}>🏆 Top 10 Earners</h3>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'2px solid #000'}}>
                <th style={{padding:8, textAlign:'left'}}>Rank</th>
                <th style={{padding:8, textAlign:'left'}}>User ID</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((u, i) => (
                <tr key={i} style={{borderBottom:'1px solid #eee', background: u.id === APP_CONFIG.MY_UID ? '#fff9c4' : 'transparent'}}>
                  <td style={{padding:10}}>{i+1}</td>
                  <td style={{padding:10, fontSize:12}}>
                    {APP_CONFIG.MY_UID === APP_CONFIG.ADMIN_ID ? u.id : (u.id.slice(0,8) + "...")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw TON</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="Your TON Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={{...styles.btn, background: '#3b82f6'}} onClick={() => {
              const amt = Number(withdrawAmount);
              if(amt < APP_CONFIG.MIN_WITHDRAW || amt > balance) return alert("Insufficient balance or min limit!");
              const newBal = Number((balance - amt).toFixed(5));
              setBalance(newBal);
              fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
                method: 'PATCH', body: JSON.stringify({ balance: newBal })
              });
              alert("Withdrawal Requested.");
          }}>WITHDRAW</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>User Profile</h3>
          <div style={{padding: '12px 0', borderBottom: '1px solid #eee'}}>Status: <b>{isVip ? "VIP ⭐" : "ACTIVE ✅"}</b></div>
          <div style={{padding: '12px 0', borderBottom: '1px solid #eee'}}>User ID: <b>{APP_CONFIG.MY_UID}</b></div>
          <div style={{padding: '12px 0', borderBottom: '1px solid #eee'}}>Balance: <b>{balance.toFixed(5)} TON</b></div>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'leaderboard', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>
            {n === 'leaderboard' ? 'RANK' : n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
  header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
  card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
  btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
  input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
  nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff' }
};

export default App;
