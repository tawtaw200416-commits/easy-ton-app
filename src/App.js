import React, { useState } from 'react';

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [activeTab, setActiveTab] = useState('bot');
  const [activeNav, setActiveNav] = useState('earn');
  const [claimCode, setClaimCode] = useState('');
  const [showAddOptions, setShowAddOptions] = useState(false);
  
  const userUID = "UID87654321";

  const botTasks = [
    { id: 1, name: 'GrowTea Bot', link: 'https://t.me/GrowTeaBot/app?startapp=1793453606' },
    { id: 2, name: 'Golden Miner', link: 'https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD' }
  ];

  const socialTasks = ["@GrowTeaNews", "@GoldenMinerNews", "@ADS_TON1"];

  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', paddingBottom: '90px' },
    header: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px', borderRadius: '20px', border: '1px solid #334155', gap: '15px', marginBottom: '20px' },
    tonHeaderLogo: { width: '50px', height: '50px', borderRadius: '50%', backgroundSize: 'cover', backgroundPosition: 'center', border: '2px solid #fbbf24', backgroundImage: 'url("
