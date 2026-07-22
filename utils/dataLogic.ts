import { Project } from '../types';

export const generateId = () => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (e) {}
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const sortProjects = (list: Project[]) => {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const dateA = a.appointmentDate || a.reportDate || '9999-12-31';
    const dateB = b.appointmentDate || b.reportDate || '9999-12-31';
    return String(dateA).localeCompare(String(dateB));
  });
};

export const mergeLists = <T extends { id: string | number }>(base: T[], incoming: T[]): T[] => {
  const map = new Map<string | number, T>();
  base.forEach(item => map.set(item.id, item));
  incoming.forEach(item => map.set(item.id, item));
  return Array.from(map.values());
};

export const mergeAppState = (base: any, incoming: any) => {
  return {
    ...base,
    ...incoming, 
    projects: sortProjects(mergeLists(base.projects || [], incoming.projects || [])),
    users: mergeLists(base.users || [], incoming.users || []),
    auditLogs: mergeLists(base.auditLogs || [], incoming.auditLogs || []),
  };
};

export const computeDiffs = (file: any, cache: any) => {
  const categories = ['projects', 'users', 'auditLogs'];
  const results: Record<string, any[]> = {};

  categories.forEach((key) => {
    const fileList = file[key] || [];
    const cacheList = cache[key] || [];
    const allIds = Array.from(new Set([...fileList.map((i: any) => i.id), ...cacheList.map((i: any) => i.id)]));

    results[key] = allIds.map(id => {
      const f = fileList.find((i: any) => i.id === id);
      const c = cacheList.find((i: any) => i.id === id);
      if (!f) return { id, name: c.name || id, status: 'ONLY_CACHE', data: c, side: 'cache', cacheTime: c.lastModifiedAt };
      if (!c) return { id, name: f.name || id, status: 'ONLY_FILE', data: f, side: 'file', fileTime: f.lastModifiedAt };
      if (f.lastModifiedAt === c.lastModifiedAt && JSON.stringify(f) === JSON.stringify(c)) return null; 
      return { id, name: f.name || id, status: 'CONFLICT', fileData: f, cacheData: c, newer: (f.lastModifiedAt || 0) > (c.lastModifiedAt || 0) ? 'file' : 'cache', fileTime: f.lastModifiedAt, cacheTime: c.lastModifiedAt };
    }).filter(Boolean);
  });
  return results;
};
