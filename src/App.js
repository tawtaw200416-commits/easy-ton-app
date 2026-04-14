  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // ၁။ Firebase ကနေ အရင်စစ်မယ်
    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          // Firebase မှာ data ရှိရင် အဲ့ဒါကို ယူသုံးမယ်
          setBalance(data.balance || 0);
          setCompleted(data.completed || []);
          setWithdrawHistory(data.withdrawHistory || []);
          setReferralCount(data.referralCount || 0);
        } else {
          // ၂။ Firebase မှာ data မရှိသေးရင် Local (အဟောင်း) ကနေ ရှာပြီး Firebase ထဲ သိမ်းမယ်
          const localBal = Number(localStorage.getItem('ton_bal')) || 0;
          const localComp = JSON.parse(localStorage.getItem('comp_tasks')) || [];
          const localRef = Number(localStorage.getItem('ref_count')) || 0;

          setBalance(localBal);
          setCompleted(localComp);
          setReferralCount(localRef);

          // Firebase ထဲသို့ အဟောင်းများကို လှမ်းသိမ်းခြင်း
          updateFirebase({
            balance: localBal,
            completed: localComp,
            referralCount: localRef
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);
