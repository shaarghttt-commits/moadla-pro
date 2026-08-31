"use client";
import React, { useEffect, useState } from 'react';

type PUser = { id: string | null; name?: string | null; lastSeen: string };

export default function ConnectedUsers() {
  const [users, setUsers] = useState<PUser[]>([]);

  useEffect(() => {
    let mounted = true;
    async function fetchList() {
      try {
        const r = await fetch('/api/chat/presence');
        if (!r.ok) return;
        const j = await r.json();
        if (mounted) setUsers(j.users || []);
      } catch (e) {
        console.error('presence fetch', e);
      }
    }
    fetchList();
    const t = setInterval(fetchList, 5000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="bg-white p-3 rounded shadow">
      <h4 className="font-semibold mb-2">المتصلون الآن</h4>
      <ul className="space-y-2">
        {users.length === 0 && <li className="text-sm text-gray-500">لا أحد متصل</li>}
        {users.map((u) => (
          <li key={`${u.id}-${u.lastSeen}`} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-white text-sm">{(u.name || 'م').slice(0,1)}</div>
            <div>
              <div className="text-sm">{u.name ?? 'مستخدم'}</div>
              <div className="text-xs text-gray-400">متصل منذ {new Date(u.lastSeen).toLocaleTimeString()}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
