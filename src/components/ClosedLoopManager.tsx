import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Search, Edit2, Trash2, Save, Filter, ChevronDown, CheckCircle2, AlertCircle, User, Calendar, Lock, ShieldAlert } from 'lucide-react';

interface ClosedLoopItem {
  id: string;
  date: string;
  yieldRate: string;
  reason: string;
  action: string;
  verification: string;
  longTerm: string;
  owner: string;
}

const DEFAULT_DATA_BY_SITE: Record<string, ClosedLoopItem[]> = {
  cut: [
    {
      id: 'cut_1',
      date: '2026-03-21',
      yieldRate: '97.9%',
      reason: '机台刀头异常',
      action: '更换刀头',
      verification: '更换刀头后监控100pcs良率无异常',
      longTerm: '建立刀头定期维修保养机制',
      owner: '陈全生'
    },
    {
      id: 'cut_2',
      date: '2026-01-12',
      yieldRate: '97.7%',
      reason: '切割速度异常',
      action: '微调参数220->235',
      verification: '参数微调后监控300pcs良率无异常',
      longTerm: '建立参数定期作业点检机制',
      owner: '许友龙'
    }
  ],
  pfa: [
    {
      id: 'pfa_1',
      date: '2026-04-15',
      yieldRate: '97.5%',
      reason: '上偏异物爆量,排查原因为传送Roller磨损',
      action: '使用酒精布擦拭Roller',
      verification: '擦拭后试跑300pcs无异常,当班Risklot排查前后200pcs无风险',
      longTerm: '更换传送Roller,建立定期Check和保养机制',
      owner: '李斌'
    }
  ]
};

export const ClosedLoopManager: React.FC<{ isOpen: boolean; onClose: () => void; site?: string }> = ({ isOpen, onClose, site = 'cut' }) => {
  const siteKey = site.toLowerCase();
  const defaultItems = DEFAULT_DATA_BY_SITE[siteKey] || [];

  const [items, setItems] = useState<ClosedLoopItem[]>(() => {
    let loadedItems: ClosedLoopItem[] = [];
    let hasSaved = false;
    const saved = localStorage.getItem(`closed_loop_data_${siteKey}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedItems = parsed;
          hasSaved = true;
        }
      } catch (e) {
        console.error("Failed to parse closed loop data", e);
      }
    }
    
    if (!hasSaved && siteKey === 'cut') {
      const oldSaved = localStorage.getItem('closed_loop_data');
      if (oldSaved) {
        try {
          const parsedOld = JSON.parse(oldSaved);
          if (Array.isArray(parsedOld) && parsedOld.length > 0) {
            loadedItems = parsedOld;
            hasSaved = true;
          }
        } catch (e) {
          console.error("Failed to parse old closed loop data", e);
        }
      }
    }

    // Clean up mixed data across sites if previously saved incorrectly
    if (hasSaved) {
      if (siteKey === 'pfa') {
        loadedItems = loadedItems.filter(item => 
          item.id !== '1' && item.id !== '2' && item.id !== '3' && item.id !== 'cut_1' && item.id !== 'cut_2' && item.id !== 'cut_3' &&
          !item.reason.includes('刀头') && !item.reason.includes('切割速度')
        );
      } else if (siteKey === 'cut') {
        loadedItems = loadedItems.filter(item => 
          item.id !== '4' &&
          !(item.date === '2026-05-23' && (item.owner === '王某某' || item.owner === '王峰'))
        );
      }

      // Remove 2026-05-19 and 2026-05-23 records as requested
      loadedItems = loadedItems.filter(item => item.date !== '2026-05-19' && item.date !== '2026-05-23' && item.id !== 'cut_3');

      // Map owner names to updated real names
      loadedItems = loadedItems.map(item => {
        let owner = item.owner;
        if (owner === '张某某' || owner === '王某某') owner = '王峰';
        if (owner === '刘某某') owner = '陈全生';
        if (owner === '祁某某') owner = '许友龙';
        return { ...item, owner };
      });
    }

    if (!hasSaved || loadedItems.length === 0) {
      loadedItems = [...defaultItems];
    } else {
      defaultItems.forEach(defItem => {
        if (!loadedItems.some(item => item.id === defItem.id || (item.date === defItem.date && item.reason === defItem.reason))) {
          loadedItems.push(defItem);
        }
      });
    }

    return loadedItems;
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // 密码验证相关状态
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ fn: () => void; title: string } | null>(null);

  // 筛选状态
  const [filterDate, setFilterDate] = useState('');
  const [filterReason, setFilterReason] = useState('');
  const [filterOwner, setFilterOwner] = useState('');

  // 表单状态
  const [formData, setFormData] = useState<Omit<ClosedLoopItem, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    yieldRate: '',
    reason: '',
    action: '',
    verification: '',
    longTerm: '',
    owner: ''
  });

  // 持久化保存
  useEffect(() => {
    localStorage.setItem(`closed_loop_data_${siteKey}`, JSON.stringify(items));
  }, [items, siteKey]);

  const handleSave = () => {
    if (editingId) {
      setItems(items.map(item => item.id === editingId ? { ...formData, id: editingId } : item));
      setEditingId(null);
    } else {
      setItems([...items, { ...formData, id: Date.now().toString() }]);
    }
    setIsAdding(false);
    resetForm();
  };

  const checkAuth = (action: () => void, title: string) => {
    setPendingAction({ fn: action, title });
    setIsPasswordModalOpen(true);
    setPasswordInput('');
    setPasswordError(false);
  };

  const handlePasswordSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (passwordInput === 'OK365') {
      pendingAction?.fn();
      setIsPasswordModalOpen(false);
      setPendingAction(null);
    } else {
      setPasswordError(true);
      // 震动效果可以使用CSS动画
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      yieldRate: '',
      reason: '',
      action: '',
      verification: '',
      longTerm: '',
      owner: ''
    });
  };

  const startEdit = (item: ClosedLoopItem) => {
    setFormData(item);
    setEditingId(item.id);
    setIsAdding(true);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        const matchDate = item.date.includes(filterDate);
        const matchReason = item.reason.includes(filterReason);
        const matchOwner = item.owner.includes(filterOwner);
        return matchDate && matchReason && matchOwner;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [items, filterDate, filterReason, filterOwner]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-[95%] h-[90vh] bg-[#0a1628] border border-cyan-500/30 rounded-2xl shadow-[0_0_120px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden text-base"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-cyan-500/20 bg-cyan-950/20 text-base">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-widest uppercase">[{siteKey.toUpperCase()}] 良率产能闭环管理系统</h2>
              <p className="text-base text-cyan-400/60 font-mono tracking-tighter">CLOSED-LOOP QUALITY & PRODUCTIVITY MANAGEMENT SYSTEM | INDUSTRIAL GRADE V2.0</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-8 h-8 text-white/75" />
          </button>
        </div>

        {/* Filters & Actions */}
        <div className="p-8 space-y-6 flex-1 overflow-hidden flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/40 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="搜索异常原因..."
                  value={filterReason}
                  onChange={(e) => setFilterReason(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-black/40 border border-cyan-500/20 rounded-xl text-base text-cyan-100 placeholder:text-cyan-400/20 focus:outline-none focus:border-cyan-500/50 w-80 transition-all"
                />
              </div>
              <div className="relative group">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/40 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="搜索日期 (YYYY-MM-DD)"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-black/40 border border-cyan-500/20 rounded-xl text-base text-cyan-100 placeholder:text-cyan-400/20 focus:outline-none focus:border-cyan-500/50 w-64 transition-all"
                />
              </div>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/40 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="搜索负责人..."
                  value={filterOwner}
                  onChange={(e) => setFilterOwner(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-black/40 border border-cyan-500/20 rounded-xl text-base text-cyan-100 placeholder:text-cyan-400/20 focus:outline-none focus:border-cyan-500/50 w-48 transition-all"
                />
              </div>
            </div>
            
            <button 
              onClick={() => { 
                checkAuth(() => {
                  resetForm(); 
                  setIsAdding(true); 
                  setEditingId(null); 
                }, "新增闭环记录");
              }}
              className="flex items-center gap-3 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-base rounded-xl transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>新增闭环记录</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="relative border border-cyan-500/20 rounded-2xl overflow-hidden bg-black/20 flex-1 min-h-0">
            <div className="h-full overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead className="sticky top-0 z-10 text-base">
                  <tr className="bg-cyan-950 text-base uppercase tracking-[0.25em] text-cyan-400 font-black shadow-lg">
                    <th className="px-6 py-5 border-b border-cyan-500/20">日期</th>
                    <th className="px-6 py-5 border-b border-cyan-500/20">良率</th>
                    <th className="px-6 py-5 border-b border-cyan-500/20">异常原因</th>
                    <th className="px-6 py-5 border-b border-cyan-500/20">止血措施</th>
                    <th className="px-6 py-5 border-b border-cyan-500/20">效果确认</th>
                    <th className="px-6 py-5 border-b border-cyan-500/20">长期措施</th>
                    <th className="px-6 py-5 border-b border-cyan-500/20">负责人</th>
                    <th className="px-6 py-5 border-b border-cyan-500/20 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10 text-base">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-cyan-400/5 transition-colors group">
                      <td className="px-6 py-5 text-base text-white/90 font-mono whitespace-nowrap">{item.date}</td>
                      <td className="px-6 py-5 text-base">
                        <span className="text-cyan-400 font-black bg-cyan-400/10 px-3 py-1 rounded-lg border border-cyan-500/20">{item.yieldRate}</span>
                      </td>
                      <td className="px-6 py-5 text-base text-white/80 max-w-[200px] truncate" title={item.reason}>{item.reason}</td>
                      <td className="px-6 py-5 text-base text-white/85 max-w-[200px] truncate" title={item.action}>{item.action}</td>
                      <td className="px-6 py-5 text-base text-emerald-400/80 max-w-[200px] truncate" title={item.verification}>{item.verification}</td>
                      <td className="px-6 py-5 text-base text-white/80 max-w-[200px] truncate" title={item.longTerm}>{item.longTerm}</td>
                      <td className="px-6 py-5 text-base text-cyan-100 font-bold">{item.owner}</td>
                      <td className="px-6 py-5 text-base">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => checkAuth(() => startEdit(item), "编辑闭环记录")} 
                            className="p-2 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-colors border border-transparent hover:border-cyan-500/30"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => checkAuth(() => deleteItem(item.id), "删除闭环记录")} 
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-cyan-400/40 text-base italic">
                        未发现匹配的闭环管理记录...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Entry / Edit Modal Overlap */}
        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute inset-y-0 right-0 w-full md:w-[600px] bg-[#0d1b2e] border-l border-cyan-500/30 shadow-2xl p-10 z-20 flex flex-col text-base"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {editingId ? <Edit2 className="w-4 h-4 text-cyan-400" /> : <Plus className="w-4 h-4 text-cyan-400" />}
                  {editingId ? '编辑记录' : '新增记录'}
                </h3>
                <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-white/10 rounded">
                  <X className="w-5 h-5 text-white/75" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                <div className="space-y-1.5">
                  <label className="text-base uppercase tracking-widest text-cyan-400/60 font-bold">日期</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-black/40 border border-cyan-500/20 rounded-lg p-2.5 text-base text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-base uppercase tracking-widest text-cyan-400/60 font-bold">良率 (例如: 98.5%)</label>
                  <input 
                    type="text" 
                    placeholder="请输入良率数值"
                    value={formData.yieldRate}
                    onChange={(e) => setFormData({...formData, yieldRate: e.target.value})}
                    className="w-full bg-black/40 border border-cyan-500/20 rounded-lg p-2.5 text-base text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-base uppercase tracking-widest text-cyan-400/60 font-bold">负责人</label>
                  <input 
                    type="text" 
                    placeholder="请输入姓名"
                    value={formData.owner}
                    onChange={(e) => setFormData({...formData, owner: e.target.value})}
                    className="w-full bg-black/40 border border-cyan-500/20 rounded-lg p-2.5 text-base text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-base uppercase tracking-widest text-cyan-400/60 font-bold">异常原因</label>
                  <textarea 
                    rows={3}
                    placeholder="详细描述异常发生根因..."
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="w-full bg-black/40 border border-cyan-500/20 rounded-lg p-2.5 text-base text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-base uppercase tracking-widest text-cyan-400/60 font-bold">止血措施</label>
                  <textarea 
                    rows={3}
                    placeholder="立即采取的临时处置措施..."
                    value={formData.action}
                    onChange={(e) => setFormData({...formData, action: e.target.value})}
                    className="w-full bg-black/40 border border-cyan-500/20 rounded-lg p-2.5 text-base text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-base uppercase tracking-widest text-cyan-400/60 font-bold">效果确认</label>
                  <textarea 
                    rows={3}
                    placeholder="措施实施后的效果监控情况..."
                    value={formData.verification}
                    onChange={(e) => setFormData({...formData, verification: e.target.value})}
                    className="w-full bg-black/40 border border-cyan-500/20 rounded-lg p-2.5 text-base text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-base uppercase tracking-widest text-cyan-400/60 font-bold">长期措施</label>
                  <textarea 
                    rows={3}
                    placeholder="固化防止再发的标准化措施..."
                    value={formData.longTerm}
                    onChange={(e) => setFormData({...formData, longTerm: e.target.value})}
                    className="w-full bg-black/40 border border-cyan-500/20 rounded-lg p-2.5 text-base text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3 text-base">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-base rounded-lg transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!formData.reason || !formData.owner}
                  className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-base rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                  {editingId ? '保存更改' : '提交记录'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-cyan-500/20 bg-cyan-950/20 flex justify-between items-center text-base">
          <div className="flex items-center gap-4 text-base">
             <div className="flex items-center gap-1.5 text-base">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-base text-white/75 uppercase tracking-widest font-mono">Status: Connected to LocalVault</span>
             </div>
             <span className="text-base text-white/30 uppercase tracking-widest font-mono">Records: {items.length}</span>
          </div>
          <p className="text-base text-white/20 font-mono tracking-widest">© 2026 INTELLIGENT FACTORY SYSTEMS / CLOSED-LOOP-V2.0</p>
        </div>
      </motion.div>

      {/* Password Verification Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 text-base"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#0d1b2e] border border-cyan-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] text-base"
            >
              <div className="flex flex-col items-center text-center mb-6 text-base">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-widest">安全验证</h3>
                <p className="text-base text-cyan-400/60 mt-1 uppercase font-mono tracking-tighter">AUTHENTICATION REQUIRED</p>
                <div className="mt-4 px-4 py-2 bg-cyan-900/20 rounded-lg border border-cyan-500/20 text-base">
                  <span className="text-base text-cyan-300 font-bold tracking-widest uppercase">操作: {pendingAction?.title}</span>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 text-base">
                <div className="space-y-1.5 text-base">
                  <label className="text-base text-white/40 uppercase tracking-widest font-bold ml-1">请输入管理员密码</label>
                  <input 
                    autoFocus
                    type="password" 
                    placeholder="••••••"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError(false);
                    }}
                    className={`w-full bg-black/60 border ${passwordError ? 'border-red-500 animate-shake' : 'border-cyan-500/30'} rounded-xl p-4 text-center text-base tracking-[0.5em] text-white focus:outline-none focus:border-cyan-500 transition-all`}
                  />
                  {passwordError && (
                    <p className="text-base text-red-400 font-bold text-center mt-2 flex items-center justify-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      密码错误，请重新输入
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-base">
                  <button 
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-base rounded-xl border border-white/10 transition-all"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    className="py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-base rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                  >
                    确认验证
                  </button>
                </div>
              </form>
              
              <p className="text-base text-white/20 text-center mt-6 uppercase tracking-widest font-mono">密码提示: 良率达标每一天</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
