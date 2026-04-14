style={{color:'orange'}}>Pending</span></div>
          ))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0, marginBottom:20}}>USER PROFILE</h2>
          <div style={{textAlign:'center', marginBottom:20}}><span style={{background:'#10b981', color:'#fff', padding:'5px 15px', borderRadius:20, fontSize:12}}>● ACTIVE</span></div>
          <div style={styles.row}><span>UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Status:</span><span style={{color:'#10b981'}}>VERIFIED</span></div>
          <div style={styles.row}><span>Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
          <div style={styles.warning}>
            ⚠️ <b>WARNING:</b> Fake accounts or referral cheating will lead to a <b>PERMANENT BAN</b> and loss of all balance.
          </div>
        </div>
      )}

      <div style={styles.navBar}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navBtn(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;


{
  "name": "easy-ton-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
