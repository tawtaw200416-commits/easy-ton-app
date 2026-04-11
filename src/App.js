// Order Placement (Add Task) အပိုင်းအတွက် သီးသန့် ပြင်ဆင်ထားသော Logic
{showPayForm && (
  <div style={styles.card}>
    <h3 style={{ textAlign: 'center', fontWeight: '900', marginBottom: '20px' }}>Order Placement</h3>
    
    {/* Channel Info Inputs */}
    <input style={styles.input} placeholder="Channel Username (e.g. @yourchannel)" />
    <input style={styles.input} placeholder="Link (e.g. https://t.me/...)" />

    {/* Package Selection */}
    <div style={{ marginBottom: '20px' }}>
      <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>SELECT PACKAGE:</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <button style={{ ...styles.btn('#0f172a'), border: '1px solid #fbbf24', color: '#fff', fontSize: '11px' }}>100 Subs<br/><span style={{color: '#fbbf24'}}>0.2 TON</span></button>
        <button style={{ ...styles.btn('#0f172a'), border: '1px solid #fbbf24', color: '#fff', fontSize: '11px' }}>200 Subs<br/><span style={{color: '#fbbf24'}}>0.4 TON</span></button>
        <button style={{ ...styles.btn('#0f172a'), border: '1px solid #fbbf24', color: '#fff', fontSize: '11px' }}>300 Subs<br/><span style={{color: '#fbbf24'}}>0.5 TON</span></button>
      </div>
    </div>

    {/* Payment Instructions */}
    <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '15px', border: '1px solid #334155', marginBottom: '15px' }}>
      <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px 0', textAlign: 'center' }}>TRANSFER EXACT AMOUNT TO ADDRESS BELOW:</p>
      
      {/* Wallet Address Copy Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
        <label style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 'bold' }}>TON ADDRESS:</label>
        <div style={{ display: 'flex', gap: '5px' }}>
          <input 
            style={{ ...styles.input, marginBottom: 0, fontSize: '10px', padding: '10px', flex: 1 }} 
            value="UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9" 
            readOnly 
          />
          <button 
            style={{ ...styles.btn(), padding: '0 15px' }}
            onClick={() => {
              navigator.clipboard.writeText("UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9");
              alert("Address Copied!");
            }}
          >Copy</button>
        </div>
      </div>

      {/* UID / MEMO Copy Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 'bold' }}>REQUIRED MEMO (YOUR UID):</label>
        <div style={{ display: 'flex', gap: '5px' }}>
          <input 
            style={{ ...styles.input, marginBottom: 0, fontSize: '12px', padding: '10px', flex: 1, color: '#fbbf24' }} 
            value={userUID} 
            readOnly 
          />
          <button 
            style={{ ...styles.btn(), padding: '0 15px' }}
            onClick={() => {
              navigator.clipboard.writeText(userUID);
              alert("MEMO Copied!");
            }}
          >Copy</button>
        </div>
      </div>
    </div>

    {/* Confirm & Back Buttons */}
    <button style={{ ...styles.btn(), width: '100%', marginBottom: '10px' }} onClick={() => alert("Order submitted! Waiting for payment verification.")}>CONFIRM PAYMENT</button>
    <button style={{ ...styles.btn('transparent'), width: '100%', border: '1px solid #475569' }} onClick={() => setShowPayForm(false)}>Back</button>
  </div>
)}
