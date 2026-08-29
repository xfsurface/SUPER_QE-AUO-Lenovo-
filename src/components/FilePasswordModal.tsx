import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ShieldAlert, FileDown } from 'lucide-react';

interface FilePasswordModalProps {
  isOpen: boolean;
  fileName: string;
  onSuccess: (fileName: string) => void;
  onClose: () => void;
}

export const FilePasswordModal: React.FC<FilePasswordModalProps> = ({
  isOpen,
  fileName,
  onSuccess,
  onClose,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPasswordInput('');
      setPasswordError(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim().toLowerCase() === 'auo') {
      setPasswordError(false);
      onSuccess(fileName);
      onClose();
    } else {
      setPasswordError(true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 text-base"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm bg-[#0d1b2e] border border-cyan-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] text-base relative"
          >
            <div className="flex flex-col items-center text-center mb-6 text-base">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <Lock className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-widest">安全验证</h3>
              <p className="text-xs text-cyan-400/60 mt-1 uppercase font-mono tracking-wider">AUTHENTICATION REQUIRED</p>
              
              <div className="mt-4 px-4 py-2.5 bg-cyan-900/20 rounded-lg border border-cyan-500/20 text-xs w-full overflow-hidden">
                <div className="flex items-center justify-center gap-1.5 text-cyan-300 font-bold tracking-wide">
                  <FileDown className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span className="truncate max-w-[240px] text-center" title={fileName}>
                    下载文件: {fileName}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-base">
              <div className="space-y-1.5 text-base">
                <label className="text-xs text-white/50 uppercase tracking-widest font-bold ml-1 block">
                  请输入访问密码
                </label>
                <input
                  autoFocus
                  type="password"
                  placeholder="••••••"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  className={`w-full bg-black/60 border ${
                    passwordError ? 'border-red-500 ring-1 ring-red-500/50' : 'border-cyan-500/30 focus:border-cyan-400'
                  } rounded-xl p-3.5 text-center text-base tracking-[0.5em] text-white focus:outline-none transition-all`}
                />
                {passwordError && (
                  <p className="text-xs text-red-400 font-bold text-center mt-2 flex items-center justify-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    密码错误，请重新输入
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-base">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-xl border border-white/10 transition-all active:scale-95"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-95"
                >
                  确认下载
                </button>
              </div>
            </form>

            <p className="text-xs text-cyan-300/50 text-center mt-6 uppercase tracking-wider font-mono">
              密码提示: 文件所有者
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
