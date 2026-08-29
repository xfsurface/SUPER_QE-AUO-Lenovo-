import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, User, Eye, EyeOff, ShieldAlert, LogIn, KeyRound, Activity, ShieldCheck, Award, TrendingUp, RefreshCw, Cpu } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("请输入完整的账号和密码");
      return;
    }

    setIsSubmitting(true);

    // Simulate futuristic secure network check
    setTimeout(() => {
      if (username === "SUPER_QE" && password === "Superqe2024!") {
        sessionStorage.setItem("isLoggedIn", "true");
        onLoginSuccess();
      } else {
        setError("账号或密码不正确，请重新输入");
        setIsSubmitting(false);
      }
    }, 1000);
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#0a1526] text-white relative overflow-hidden select-none">
      {/* Ambient glowing dust & nebulas */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none z-0" />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.12] pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.15) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.15) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Concentric Sci-Fi Rings in center background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-cyan-500/5 rounded-full pointer-events-none z-0 animate-[spin_120s_linear_infinite]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dashed border-cyan-500/10 rounded-full pointer-events-none z-0 animate-[spin_80s_linear_infinite_reverse]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-cyan-500/10 rounded-full pointer-events-none z-0 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30" />
      
      {/* Moving scanlines */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-1/3 w-full animate-scanline pointer-events-none z-0" style={{ animationDuration: '8s' }} />

      {/* Dynamic Sci-Fi Quality Graphic Left: SPC Real-Time Control Chart */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 0.25, x: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute left-8 xl:left-16 top-16 w-80 bg-slate-900/60 border border-cyan-500/20 rounded-xl p-4 font-mono hidden lg:block z-0 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
          <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1.5 uppercase">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> SPC Quality Control (实时统计控制)
          </span>
          <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">ONLINE</span>
        </div>
        <div className="space-y-1 text-[9px] text-cyan-300/70 mb-3">
          <div>MEASURE: COP-BONDING ALIGNMENT OFFSET</div>
          <div>UCL: +2.0μm | LCL: -2.0μm</div>
          <div className="flex justify-between text-cyan-400">
            <span>SIGMA-3 LIMITS</span>
            <span className="text-emerald-400 font-bold">STATE: PASS</span>
          </div>
        </div>
        
        {/* SPC Line Graphic */}
        <div className="h-28 relative border-l border-b border-cyan-500/30 flex items-center">
          {/* UCL Line */}
          <div className="absolute top-4 left-0 right-0 border-t border-dashed border-red-500/40" />
          <span className="absolute top-2.5 right-1 text-[8px] text-red-400/60">UCL</span>
          
          {/* LCL Line */}
          <div className="absolute bottom-4 left-0 right-0 border-t border-dashed border-red-500/40" />
          <span className="absolute bottom-2.5 right-1 text-[8px] text-red-400/60">LCL</span>

          {/* CL Line */}
          <div className="absolute top-1/2 left-0 right-0 border-t border-cyan-500/20" />
          
          {/* Line Plot SVG */}
          <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.5"
              points="0,50 15,35 30,55 45,28 60,42 75,62 90,48 100,32"
              className="animate-pulse"
            />
            {/* Dots */}
            <circle cx="15" cy="35" r="2" fill="#22d3ee" />
            <circle cx="30" cy="55" r="2" fill="#22d3ee" />
            <circle cx="45" cy="28" r="2" fill="#22d3ee" />
            <circle cx="60" cy="42" r="2" fill="#22d3ee" />
            <circle cx="75" cy="62" r="2" fill="#f59e0b" />
            <circle cx="90" cy="48" r="2" fill="#22d3ee" />
            <circle cx="100" cy="32" r="2" fill="#22d3ee" />
          </svg>
        </div>
        <div className="flex justify-between items-center text-[8px] text-cyan-500/50 mt-2 font-mono">
          <span>SAMPLING RATE: 1.2S</span>
          <span>SAMPLES: N=450</span>
        </div>
      </motion.div>

      {/* Dynamic Sci-Fi Quality Graphic Right: HUD Circular QA Radar */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 0.25, x: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute right-8 xl:right-16 top-16 w-80 bg-slate-900/60 border border-cyan-500/20 rounded-xl p-4 font-mono hidden lg:block z-0 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
          <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1.5 uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> QE PASS-RATE TELEMETRY (品质保障)
          </span>
          <span className="text-[8px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">REALTIME</span>
        </div>
        
        <div className="flex items-center gap-4 py-1">
          {/* Rotating Ring Hud */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-dashed border-cyan-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
            <div className="absolute inset-2 border border-emerald-500/30 rounded-full animate-[spin_10s_linear_infinite_reverse]" />
            <div className="absolute inset-4 border border-cyan-500/40 border-t-transparent border-r-transparent rounded-full animate-spin" />
            <div className="text-center">
              <span className="text-xs font-bold block text-cyan-300">99.85</span>
              <span className="text-[7px] text-emerald-400 font-bold block tracking-tighter">% PASS</span>
            </div>
          </div>
          
          <div className="flex-1 space-y-2 text-[10px]">
            <div className="border-l-2 border-cyan-500 pl-2">
              <span className="text-cyan-500/70 block text-[8px] uppercase">Production Defect Rate</span>
              <span className="text-white font-bold">PPM &lt; 150 (直通良好)</span>
            </div>
            <div className="border-l-2 border-emerald-500 pl-2">
              <span className="text-emerald-500/70 block text-[8px] uppercase">Calibration Accuracy</span>
              <span className="text-white font-bold">σ &gt; 1.67 (Cpk优秀)</span>
            </div>
            <div className="border-l-2 border-blue-500 pl-2">
              <span className="text-blue-500/70 block text-[8px] uppercase">Defect Isolation</span>
              <span className="text-white font-bold">100% AOI COVERED</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dynamic Sci-Fi Quality Graphic Bottom Left: Process State Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 0.25, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="absolute left-8 xl:left-16 bottom-16 w-80 bg-slate-900/60 border border-cyan-500/20 rounded-xl p-4 font-mono hidden lg:block z-0 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2">
          <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1.5 uppercase">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> AUO & Lenovo 制程节点监视
          </span>
          <span className="text-[8px] text-cyan-500/50">NODE_STAT_V2</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-[9px] pt-1">
          <div className="bg-[#0b1b36]/40 p-1.5 border border-cyan-500/10 rounded flex justify-between items-center">
            <span className="text-cyan-500/60">1# CUTTING 偏位</span>
            <span className="text-emerald-400 font-bold">0.43μm</span>
          </div>
          <div className="bg-[#0b1b36]/40 p-1.5 border border-cyan-500/10 rounded flex justify-between items-center">
            <span className="text-cyan-500/60">2# PFA合格率</span>
            <span className="text-cyan-400 font-bold">99.88%</span>
          </div>
          <div className="bg-[#0b1b36]/40 p-1.5 border border-cyan-500/10 rounded flex justify-between items-center">
            <span className="text-cyan-500/60">3# COG热压温</span>
            <span className="text-emerald-400 font-bold">183.5℃</span>
          </div>
          <div className="bg-[#0b1b36]/40 p-1.5 border border-cyan-500/10 rounded flex justify-between items-center">
            <span className="text-cyan-500/60">4# ASSY直通</span>
            <span className="text-emerald-400 font-bold">99.25%</span>
          </div>
        </div>
      </motion.div>

      {/* Decorative corner borders of the screen */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-cyan-500/40 pointer-events-none" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-cyan-500/40 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-cyan-500/40 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-cyan-500/40 pointer-events-none" />

      {/* Main Login Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", damping: 20 }}
        className="w-full max-w-md p-8 bg-[#102445]/85 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] relative z-10 mx-4 overflow-hidden"
      >
        {/* Cyberpunk corner bracket styling for login card */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

        {/* Animated accent gradient line at the top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(34,211,238,0.8)]" />

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-xl mb-4 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <KeyRound className="w-8 h-8 text-cyan-400" />
          </motion.div>
          <h2 className="text-2xl font-black tracking-[0.1em] text-white uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
            AUO & Lenovo 管理平台
          </h2>
          <p className="text-xs text-cyan-500/70 font-mono tracking-widest uppercase mt-1">
            智能品质看板 · 控制终端
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div className="space-y-2 relative">
            <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <User className="w-3 h-3" /> SECURITY ACCOUNT
            </label>
            <div className="relative group">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-[#0a1628]/80 border border-cyan-500/30 rounded-lg py-3 pl-4 pr-10 text-sm font-mono text-cyan-100 placeholder-cyan-500/40 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all shadow-inner"
                placeholder="请输入超级质量工程师账号"
                autoComplete="off"
                required
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cyan-500/40 group-focus-within:text-cyan-400 transition-colors">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2 relative">
            <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> DECRYPTION ACCESS KEY
            </label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-[#0a1628]/80 border border-cyan-500/30 rounded-lg py-3 pl-4 pr-10 text-sm font-mono text-cyan-100 placeholder-cyan-500/40 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all shadow-inner"
                placeholder="请输入系统解密秘钥"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cyan-500/40 hover:text-cyan-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300 font-mono"
              >
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            whileHover={!isSubmitting ? { scale: 1.02, boxShadow: "0 0 20px rgba(6,182,212,0.4)" } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-950 disabled:text-cyan-800 disabled:border-cyan-950/40 border border-cyan-400 text-slate-950 font-black tracking-[0.3em] uppercase py-3.5 rounded-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 text-xs"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>安全认证中...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-slate-950" />
                <span>立即建立安全准入</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Footer info inside Card */}
        <div className="mt-8 pt-4 border-t border-cyan-500/10 flex justify-between items-center text-[9px] text-cyan-500/50 font-mono">
          <span>SECURE PORT: 80</span>
          <span>PROTOCOL v2.8.5</span>
        </div>
      </motion.div>

      {/* Outer subtle security statement */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-cyan-500/40 font-mono text-[9px] uppercase tracking-[0.15em] z-10 text-center pointer-events-none">
        AUTHORIZED PERSONS ONLY · ILLEGAL ACCESS WILL BE TRACED
      </div>
    </div>
  );
}
