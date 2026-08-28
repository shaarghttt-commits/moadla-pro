"use client";
import { useState, useEffect } from 'react';

export default function OwnerToggle({ onChange }: { onChange?: (v: boolean) => void }) {
  const [owner, setOwner] = useState(false);
  const [pwd, setPwd] = useState('');

  useEffect(() => setOwner(localStorage.getItem('isOwner') === '1'), []);

  function login() {
    // simple local password - change as needed
    if (pwd === 'owner123') {
      localStorage.setItem('isOwner', '1');
      setOwner(true);
      onChange?.(true);
    } else {
      alert('كلمة سر غير صحيحة');
    }
  }

  function logout() {
    localStorage.removeItem('isOwner');
    setOwner(false);
    onChange?.(false);
  }

  if (owner) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-300">مسجل كمالك</span>
        <button onClick={logout} className="text-xs text-red-600">خروج</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="كلمة السر" className="px-2 py-1 rounded-md border" />
      <button onClick={login} className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">دخول كمالك</button>
    </div>
  );
}
