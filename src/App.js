// ✅ Add Task Section (အပေါ်က Code ထဲက Add Task ပြတဲ့နေရာမှာ အစားထိုးရန်)
{showAddTask && (
  <div style={styles.card}>
    <h3 style={{ marginTop: 0, color: '#fbbf24' }}>Add New Task</h3>
    <input style={styles.input} placeholder="Channel Name (@YourChannel)" />
    <input style={styles.input} placeholder="Invite Link (https://t.me/...)" />

    <label style={{ fontSize: '12px', color: '#94a3b8' }}>Select View Package:</label>
    <select 
      value={selectedPackage} 
      onChange={(e) => setSelectedPackage(e.target.value)} 
      style={{ ...styles.input, marginTop: '5px' }}
    >
      <option value="0.2">100 Views - 0.2 TON</option>
      <option value="0.4">200 Views - 0.4 TON</option>
      <option value="0.5">300 Views - 0.5 TON</option>
    </select>

    <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #334155' }}>
      <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#94a3b8' }}>Send Payment to Admin:</p>
      
      {/* --- Address Copy Box --- */}
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '8px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #475569' }}>
        <div style={{ fontSize: '11px', color: '#fbbf24', wordBreak: 'break-all', flex: 1 }}>
          {APP_CONFIG.ADMIN_WALLET}
        </div>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(APP_CONFIG.ADMIN_WALLET);
            alert("Address Copied!");
          }}
          style={{ marginLeft: '10px', backgroundColor: '#fbbf24', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 'bold' }}
        >
          COPY
        </button>
      </div>

      {/* --- MEMO (UID) Copy Box --- */}
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '8px', borderRadius: '8px', border: '1px solid #475569' }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>MEMO: </span>
          <span style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>{APP_CONFIG.MY_UID}</span>
        </div>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(APP_CONFIG.MY_UID);
            alert("MEMO ID Copied!");
          }}
          style={{ backgroundColor: '#fbbf24', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 'bold' }}
        >
          COPY
        </button>
      </div>
      
      <p style={{ margin: '10px 0 0 0', fontSize: '10px', color: '#ef4444', textAlign: 'center' }}>
        * MEMO is required to verify your payment!
      </p>
    </div>

    <button style={styles.yellowBtn} onClick={() => alert("Payment Request Sent to Admin!")}>
      CONFIRM PAYMENT
    </button>
    <button onClick={() => setShowAddTask(false)} style={{ width: '100%', background: 'none', border: 'none', color: '#94a3b8', marginTop: '10px', cursor: 'pointer' }}>
      Back
    </button>
  </div>
)}
