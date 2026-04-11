import React, { useState } from 'react';

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [activeTab, setActiveTab] = useState('bot'); // Default to Start Bot tab
  const [activeNav, setActiveNav] = useState('earn');
  const [claimCode, setClaimCode] = useState('');
  
  // Fake User UID for Demo
  const userUID = "UID87654321";

  const [botTasks, setBotTasks] = useState([
    { id: 1, name: 'GrowTea Bot', link: 'https://t.me/GrowTeaBot/app?startapp=1793453606' },
    { id: 2, name: 'Golden Miner', link: 'https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD' }
  ]);

  const socialTasks = ["@GrowTeaNews", "@GoldenMinerNews", "@ADS_TON1"];

  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', paddingBottom: '90px' },
    header: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px', borderRadius: '20px', border: '1px solid #334155', gap: '15px', marginBottom: '20px' },
    tonLogo: { width: '50px', height: '50px', borderRadius: '50%', backgroundImage: 'url("https://raw.githubusercontent.com/ton-blockchain/telegram-mini-app/v2/packages/icons/src/icons/ton.png")', backgroundSize: 'cover', backgroundPosition: 'center', border: '2px solid #fbbf24' },
    balance: { color: '#fbbf24', fontSize: '22px', fontWeight: 'bold' },
    tabBar: { display: 'flex', backgroundColor: '#1e293b', borderRadius: '12px', padding: '5px', marginBottom: '20px' },
    tabBtn: (active) => ({ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#0f172a' : '#94a3b8', fontWeight: 'bold', fontSize: '12px' }),
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #334155' },
    taskItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #334155' },
    btn: (color='#fbbf24') => ({ backgroundColor: color, color: '#0f172a', padding: '8px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px
