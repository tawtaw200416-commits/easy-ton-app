import React, { useState } from 'react';

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [activeTab, setActiveTab] = useState('tasks');
  const [activeCategory, setActiveCategory] = useState('main');
  const [claimCode, setClaimCode] = useState('');

  const handleClaim = () => {
    if (claimCode === 'YTTPO') {
      setBalance(prev => prev + 0.0005);
      alert('Success! 0.0005 TON added to your balance.');
      setClaimCode('');
    } else {
      alert('Invalid Code! Please try again.');
    }
  };

  const styles = {
    container: {
      backgroundColor: '#0f172a',
      color: 'white',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#1e293b',
      padding: '15px',
      borderRadius: '25px',
      border: '1px solid #334155',
      gap: '15px'
    },
    profilePic: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      border: '2px solid #fbbf24'
    },
    balanceText: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#fbbf24'
    },
    tabContainer: {
      display: 'flex',
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '5px'
    },
    tabButton: (active) => ({
      flex: 1,
      padding: '12px',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: '600',
      backgroundColor: active ? '#fbbf24' : 'transparent',
      color: active ? '#0f172a' : '#94a3b8',
      transition: 'all 0.3s ease',
      boxShadow: active ? '0 4px 10px rgba(251, 191, 36, 0.3)' : 'none'
    }),
    categoryContainer: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center'
    },
    categoryButton: (active) => ({
      padding: '8px 25px',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '14px',
      backgroundColor: active ? '#fbbf24' : '#1e293b',
      color: active ? '#0f172a' : 'white',
      boxShadow: active ? '0 0 15px rgba(251, 191, 36, 0.5)' : 'none'
    }),
    card: {
      backgroundColor: '#1e293b',
      borderRadius: '20px',
      padding: '30px',
      border: '1px solid #334155',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px'
    },
    input: {
      width: '80%',
      padding: '12px',
      borderRadius: '10px',
      border: '1px solid #334155',
      backgroundColor: '#0f172a',
      color: 'white',
      fontSize: '16px',
      textAlign: 'center'
    },
    claimBtn: {
      backgroundColor: '#fbbf24',
      color: '#0f172a',
      padding: '12px 40px',
      borderRadius: '12px',
      border: 'none',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 4px 0 #b45309'
    },
    footer: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#1e293b',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '15px',
      borderTop: '1px solid #334155'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.profilePic}></div>
        <div>
          <div style={{fontSize: '16px', fontWeight: 'bold'}}>Shadow Bee's Empire</div>
          <div style={styles.balanceText}>{balance.toFixed(4)} TON</div>
        </div>
      </div>

      {/* Main Tabs */}
      <div style={styles.tabContainer}>
        <button 
          style={styles.tabButton(activeTab === 'tasks')}
