"use client";
import { useState } from "react";

export default function SubscriptionBox() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'saved'>('idle');

  function save() {
    if (!email.includes('@')) return;
    try {
      const list = JSON.parse(localStorage.getItem('subscribers') || '[]');
      list.push({ email, at: Date.now() });
      localStorage.setItem('subscribers', JSON.stringify(list));
      setStatus('saved');
    } catch (e) {
      setStatus('saved');
    }
  }

  return (
    <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-md">
      <label className="block text-sm font-medium text-indigo-700 dark:text-indigo-200">اشترك لتلقي الخطة</label>
      <div className="mt-2 flex gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="بريدك الإلكتروني"
          className="flex-1 rounded-md border border-indigo-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        />
        <button onClick={save} className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm">احفظ</button>
      </div>
      {status === 'saved' && <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">تم حفظ البريد محليًا.</p>}
    </div>
  );
}
