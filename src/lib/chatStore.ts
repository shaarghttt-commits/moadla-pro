export type ChatMessage = {
  id: string;
  userId?: string | null;
  name?: string | null;
  text?: string | null;
  // attachment info (optional)
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: 'image' | 'pdf' | 'doc' | string | null;
  mediaId?: string | null;
  mimeType?: string | null;
  fileSize?: string | null;
  createdAt: string; // ISO
};

const messages: ChatMessage[] = [];

export function addMessage(msg: Omit<ChatMessage, 'id' | 'createdAt'>) {
  const newMsg: ChatMessage = {
    id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    ...msg,
  };
  messages.push(newMsg);
  // keep last 200 messages
  if (messages.length > 200) messages.splice(0, messages.length - 200);
  return newMsg;
}

export function getMessages(since?: string) {
  if (!since) return messages.slice();
  const idx = messages.findIndex((m) => m.createdAt > since);
  if (idx === -1) return [];
  return messages.slice(idx);
}

export function getAllMessages() {
  return messages.slice();
}

export function getMessageById(id: string) {
  return messages.find((m) => m.id === id) || null;
}

export function updateMessage(id: string, data: Partial<Pick<import('./chatStore').ChatMessage, 'text'>>) {
  const idx = messages.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  const existing = messages[idx];
  const updated = { ...existing, ...data } as any;
  messages[idx] = updated;
  return updated;
}

export function deleteMessage(id: string) {
  const idx = messages.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  messages.splice(idx, 1);
  return true;
}
