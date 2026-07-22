import { SystemRules, UserRole } from '../types';

export const PERMISSION_STRUCTURE = [
  { id: 'users', label: '系統權限設定', type: 'main' },
];

export const DEFAULT_SYSTEM_RULES: SystemRules = {
  productionKeywords: ['防溢座', '施工大門', '小門'],
  subcontractorKeywords: ['怪手', '告示牌'],
  modularProductionKeywords: [],
  modularSubcontractorKeywords: [],
  materialFormulas: [
    {
      id: 'f-1',
      keyword: '甲種圍籬',
      category: '圍籬',
      items: [
        { id: 'fi-1', name: '立柱', formula: 'Math.ceil(baseQty / 2.4 + 1)', unit: '支' },
        { id: 'fi-2', name: '二橫', formula: 'Math.ceil((baseQty / 2.4 + 1) * 2)', unit: '支' },
        { id: 'fi-3', name: '三橫', formula: 'Math.ceil((baseQty / 2.4 + 1) * 3)', unit: '支' },
        { id: 'fi-4', name: '斜撐', formula: 'Math.ceil(baseQty / 2.4 + 1)', unit: '支' },
        { id: 'fi-5', name: '圍籬板', formula: 'Math.ceil(baseQty / 0.75)', unit: '片' },
        { id: 'fi-6', name: '2.4m圍籬板', formula: 'Math.ceil(baseQty / 0.95)', unit: '片' },
      ]
    }
  ],
  rolePermissions: {
    [UserRole.ADMIN]: { 
      displayName: '管理員', 
      allowedViews: ['users'] 
    },
    [UserRole.MANAGER]: { 
      displayName: '專案經理', 
      allowedViews: [] 
    },
    [UserRole.ENGINEERING]: { 
      displayName: '工務人員', 
      allowedViews: [] 
    },
    [UserRole.FACTORY]: { 
      displayName: '廠務人員', 
      allowedViews: [] 
    },
    [UserRole.WORKER]: { 
      displayName: '現場人員', 
      allowedViews: [] 
    }
  }
};
