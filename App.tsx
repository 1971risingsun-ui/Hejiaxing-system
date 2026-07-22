
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, SystemRules, Project, TaskSchedule, Employee } from './types';
import UserManagement from './components/UserManagement';
import TaskPlanning from './components/TaskPlanning';
import LoginScreen from './components/LoginScreen';
import { UserIcon, LogOutIcon, ShieldIcon, MenuIcon, XIcon, LoaderIcon, CheckCircleIcon, AlertIcon, UploadIcon, SaveIcon, ClipboardListIcon, CalendarIcon, PlusIcon, TrashIcon, ClockIcon } from './components/Icons';
import { getDirectoryHandle, saveDbToLocal, loadDbFromLocal, getHandleFromIdb, saveAppStateToIdb, loadAppStateFromIdb, saveHandleToIdb } from './utils/fileSystem';
import { downloadBlob } from './utils/fileHelpers';
import { mergeAppState, computeDiffs } from './utils/dataLogic';
import { DEFAULT_SYSTEM_RULES } from './constants/systemConfig';
import { useAuditTrail } from './hooks/useAuditTrail';
import { googleSheetsService, AppState } from './services/googleSheetsService';

const LOGO_URL = './logo.png';

const App: React.FC = () => {
  // --- 狀態管理 ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([{ id: 'u-1', name: 'Admin User', email: 'admin@hejiaxing.ai', role: UserRole.ADMIN, avatar: LOGO_URL }]);
  const [systemRules, setSystemRules] = useState<SystemRules>(DEFAULT_SYSTEM_RULES);
  const [projects, setProjects] = useState<Project[]>([]);
  const [taskSchedules, setTaskSchedules] = useState<Record<string, TaskSchedule>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);

  // --- 雲端同步狀態 ---
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(localStorage.getItem('google_spreadsheet_id'));
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [cloudLastSync, setCloudLastSync] = useState<string>('');

  // --- 持久化與同步 ---
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [dirPermission, setDirPermission] = useState<'granted' | 'prompt' | 'denied'>('prompt');
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [syncPending, setSyncPending] = useState<any | null>(null);
  const dbJsonInputRef = useRef<HTMLInputElement>(null);

  // --- 審計日誌 Hook ---
  const { auditLogs, setAuditLogs, updateLastAction } = useAuditTrail(currentUser);

  // --- UI 控制 ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState<'task_planning' | 'users'>('task_planning');

  // --- 初始化與資料恢復中心 ---
  useEffect(() => {
    const init = async () => {
      try {
        setIsWorkspaceLoading(true);
        
        // 1. 優先嘗試從 Google Sheets 載入
        let cloudState: AppState | null = null;
        if (spreadsheetId) {
          try {
            setIsCloudLoading(true);
            cloudState = await googleSheetsService.loadData(spreadsheetId);
            if (cloudState) setCloudLastSync(new Date().toLocaleTimeString());
          } catch (e) {
            console.error('雲端載入失敗，切換至本地模式', e);
          } finally {
            setIsCloudLoading(false);
          }
        }

        // 2. 獲取本地與快取資料
        const handle = await getHandleFromIdb();
        let fileState = null;
        if (handle) {
          setDirHandle(handle);
          const status = await (handle as any).queryPermission({ mode: 'readwrite' });
          setDirPermission(status);
          if (status === 'granted') fileState = await loadDbFromLocal(handle);
        }
        const cachedState = await loadAppStateFromIdb();

        // 3. 合併所有資料來源 (雲端優先)
        const baseState = cloudState || fileState || cachedState;
        if (!baseState) { setIsInitialized(true); setIsWorkspaceLoading(false); return; }

        const merged = mergeAppState(baseState, cloudState || {});
        restoreDataToState(merged);
        
        setIsInitialized(true);
      } catch (error) {
        console.error('初始化失敗', error);
      } finally {
        setIsWorkspaceLoading(false);
      }
    };
    init();
  }, []);

  const handleConnectCloud = async () => {
    try {
      setIsCloudLoading(true);
      const id = await googleSheetsService.findOrCreateDatabaseFile();
      setSpreadsheetId(id);
      localStorage.setItem('google_spreadsheet_id', id);
      
      const data = await googleSheetsService.loadData(id);
      if (data) {
        restoreDataToState(data);
        alert('雲端連線成功，已同步資料');
      } else {
        // First time, upload current state
        const state: AppState = { users: allUsers, auditLogs, systemRules, projects, taskSchedules, employees, lastSaved: new Date().toISOString() };
        await googleSheetsService.saveData(id, state);
        alert('雲端初始化完成，已將目前資料上傳');
      }
      setCloudLastSync(new Date().toLocaleTimeString());
    } catch (e: any) {
      alert(`連線失敗: ${e.message}`);
    } finally {
      setIsCloudLoading(false);
    }
  };

  const restoreDataToState = (data: any) => {
    if (!data) return;
    if (Array.isArray(data.users)) setAllUsers(data.users);
    if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
    if (data.systemRules) setSystemRules({ ...DEFAULT_SYSTEM_RULES, ...data.systemRules });
    if (Array.isArray(data.projects)) setProjects(data.projects);
    if (data.taskSchedules) setTaskSchedules(data.taskSchedules);
    if (Array.isArray(data.employees)) setEmployees(data.employees);
  };

  useEffect(() => {
    if (!isInitialized) return;
    const save = async () => {
      const state = { users: allUsers, auditLogs, systemRules, projects, taskSchedules, employees, lastSaved: new Date().toISOString() };
      await saveAppStateToIdb(state);
      if (dirHandle && dirPermission === 'granted') {
        await saveDbToLocal(dirHandle, state);
        setLastSyncTime(new Date().toLocaleTimeString('zh-TW', { hour12: false }));
      }
      if (spreadsheetId) {
        try {
          await googleSheetsService.saveData(spreadsheetId, state);
          setCloudLastSync(new Date().toLocaleTimeString());
        } catch (e) {
          console.error('雲端存檔失敗', e);
        }
      }
    };
    const timer = setTimeout(save, 500);
    return () => clearTimeout(timer);
  }, [allUsers, auditLogs, systemRules, projects, taskSchedules, employees, dirHandle, dirPermission, spreadsheetId, isInitialized]);

  // --- 同步與檔案功能 ---
  const handleDirectoryAction = async (force: boolean = false) => {
    setIsWorkspaceLoading(true);
    try {
      let handle = dirHandle;
      if (force || !handle) { handle = await getDirectoryHandle(); setDirHandle(handle); await saveHandleToIdb(handle); }
      const status = await (handle as any).requestPermission({ mode: 'readwrite' });
      setDirPermission(status);
      if (status === 'granted') {
        const fileState = await loadDbFromLocal(handle);
        const cachedState = await loadAppStateFromIdb();
        setSyncPending({ fileData: fileState, cacheData: cachedState, diffs: computeDiffs(fileState || {}, cachedState || {}) });
      }
    } catch (e: any) { if (e.message !== '已取消選擇') alert(e.message); } finally { setIsWorkspaceLoading(false); }
  };

  const handleManualSaveAs = async () => {
    try {
      const appState = { users: allUsers, auditLogs, systemRules, projects, lastSaved: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(appState, null, 2)], { type: 'application/json' });
      await downloadBlob(blob, `db_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    } catch (e) { alert('存檔失敗'); }
  };

  const handleImportDbJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (json.users && window.confirm(`匯入將會完全覆蓋目前的系統資料，確定要繼續嗎？`)) {
          restoreDataToState(json); updateLastAction('系統', '匯入系統資料'); alert('資料已成功還原');
        }
      } catch (error) { alert('解析失敗'); }
    };
    reader.readAsText(file);
    if (dbJsonInputRef.current) dbJsonInputRef.current.value = '';
  };

  if (!currentUser) return <LoginScreen onLogin={setCurrentUser} />;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <aside className={`fixed inset-0 z-[100] md:relative md:flex md:w-64 flex-col bg-slate-900 text-white transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col items-center justify-center w-full px-2 py-8 mb-2 text-center">
           <div className="w-20 h-20 mb-4 rounded-full bg-white p-0.5 shadow-lg border border-slate-700">
             <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain rounded-full" />
           </div>
           <h1 className="text-base font-black text-white tracking-[0.15em] border-b-2 border-yellow-500 pb-1">帳號管理系統</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 mt-6 px-4">主要功能</div>
          <button 
            onClick={() => { setView('task_planning'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-colors ${view === 'task_planning' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <ClipboardListIcon className="w-4 h-4" /> 
            <span className="font-medium">任務規劃系統</span>
          </button>

          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 mt-6 px-4">系統輔助</div>
          <button 
            onClick={() => { setView('users'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-colors ${view === 'users' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <ShieldIcon className="w-4 h-4" /> 
            <span className="font-medium">系統帳號設定</span>
          </button>

          <div className="pt-4 border-t border-slate-800 mt-4 space-y-2">
            <button 
              onClick={handleConnectCloud} 
              disabled={isCloudLoading}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all border ${spreadsheetId ? 'bg-green-600/10 border-green-500 text-green-400' : 'bg-blue-600/10 border-blue-500 text-blue-400'}`}
            >
              {isCloudLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : spreadsheetId ? <CheckCircleIcon className="w-5 h-5" /> : <UploadIcon className="w-5 h-5" />}
              <div className="flex items-start text-left flex-col">
                <span className="text-sm font-bold">{spreadsheetId ? 'Google 雲端已連線' : '連結 Google 試算表'}</span>
                <span className="text-[10px] opacity-70">{spreadsheetId && cloudLastSync ? `最後同步: ${cloudLastSync}` : '自動保存到雲端硬碟'}</span>
              </div>
            </button>

            <button onClick={() => handleDirectoryAction(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-slate-400 hover:bg-slate-800">
              {dirPermission === 'granted' ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <AlertIcon className="w-5 h-5 text-red-500" />}
              <span className="text-sm font-bold">{dirPermission === 'granted' ? '同步已開啟' : '未連結目錄'}</span>
            </button>
            <input type="file" accept=".json" ref={dbJsonInputRef} className="hidden" onChange={handleImportDbJson} />
            <button onClick={() => dbJsonInputRef.current?.click()} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-slate-400 hover:bg-slate-800">
              <UploadIcon className="w-5 h-5" />
              <span className="text-sm font-bold">匯入備份</span>
            </button>
            <button onClick={handleManualSaveAs} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-slate-400 hover:bg-slate-800">
              <SaveIcon className="w-5 h-5" />
              <span className="text-sm font-bold">手動存檔</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 w-full mt-auto">
          <button onClick={() => setCurrentUser(null)} className="flex w-full items-center justify-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm">
            <LogOutIcon className="w-4 h-4" /> 登出
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shadow-sm z-20">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-slate-500 p-2">
            {isSidebarOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
          <div className="text-sm font-bold text-slate-700">{view === 'task_planning' ? '任務規劃系統' : '系統帳號設定'}</div>
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
            <img src={currentUser?.avatar || LOGO_URL} alt="User" className="w-full h-full object-cover" />
          </div>
        </header>
        <main className="flex-1 min-h-0 bg-[#f8fafc] flex flex-col overflow-hidden">
          {view === 'task_planning' ? (
            <TaskPlanning 
              projects={projects} 
              taskSchedules={taskSchedules} 
              onUpdateTaskSchedules={setTaskSchedules} 
              employees={employees} 
              currentUser={currentUser} 
            />
          ) : (
            <UserManagement 
              users={allUsers} 
              onUpdateUsers={setAllUsers} 
              auditLogs={auditLogs} 
              onLogAction={(action, details) => updateLastAction('系統', details)} 
              projects={projects} 
              onRestoreData={restoreDataToState} 
              systemRules={systemRules} 
              onUpdateSystemRules={setSystemRules} 
              onConnectDirectory={() => handleDirectoryAction(true)} 
              dirPermission={dirPermission} 
              isWorkspaceLoading={isWorkspaceLoading} 
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
