import { useState } from 'react';
import { User, AuditLog } from '../types';

export const useAuditTrail = (currentUser: User | null) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const updateLastAction = (targetName: string, details?: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      action: targetName,
      details: details || `Performed action on ${targetName}`
    };
    setAuditLogs(prev => [newLog, ...prev].slice(0, 500));
  };

  return {
    auditLogs,
    setAuditLogs,
    updateLastAction
  };
};
