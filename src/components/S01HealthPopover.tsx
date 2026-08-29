import React from "react";
import { motion } from "motion/react";
import { Cpu, Activity } from "lucide-react";

export interface StationHealthItem {
  station: string;
  name: string;
  color: string;
  man: string;
  machine: string;
  material: string;
  method: string;
  env: string;
  total: string;
}

export const S01_STATIONS_HEALTH: StationHealthItem[] = [
  {
    station: "CUT",
    name: "切割",
    color: "#00F0FF",
    man: "100%",
    machine: "100%",
    material: "100%",
    method: "100%",
    env: "100%",
    total: "100%",
  },
  {
    station: "PFA",
    name: "贴片",
    color: "#7000FF",
    man: "100%",
    machine: "100%",
    material: "100%",
    method: "100%",
    env: "100%",
    total: "100%",
  },
  {
    station: "Bonding",
    name: "压接",
    color: "#00FF66",
    man: "100%",
    machine: "100%",
    material: "100%",
    method: "100%",
    env: "100%",
    total: "100%",
  },
  {
    station: "ASSY",
    name: "组装",
    color: "#FFB800",
    man: "100%",
    machine: "100%",
    material: "100%",
    method: "100%",
    env: "100%",
    total: "100%",
  },
];

interface S01HealthPopoverProps {
  className?: string;
}

export const S01HealthPopover: React.FC<S01HealthPopoverProps> = ({ className = "" }) => {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scaleX: 0.1, 
        x: -25,
        clipPath: "polygon(0 0, 0% 0, 0% 100%, 0 100%)"
      }}
      animate={{ 
        opacity: 1, 
        scaleX: 1, 
        x: 0,
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
      }}
      exit={{ 
        opacity: 0, 
        scaleX: 0.1, 
        x: -20,
        clipPath: "polygon(0 0, 0% 0, 0% 100%, 0 100%)",
        transition: { duration: 0.2, ease: "easeIn" }
      }}
      transition={{ 
        duration: 0.42, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      style={{ transformOrigin: "left center" }}
      className={`absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 w-[490px] max-w-[85vw] pointer-events-auto select-none ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Left and Right Ejector/Paper Edge Glow Visuals */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-16 bg-gradient-to-r from-cyan-400 to-cyan-500/20 rounded-l-sm blur-[1px] opacity-80" />
      <div className="absolute -left-1 top-2 bottom-2 w-1 bg-cyan-300 shadow-[0_0_8px_#06b6d4] z-20 rounded-full" />
      <div className="absolute -right-1 top-2 bottom-2 w-1 bg-cyan-300 shadow-[0_0_8px_#06b6d4] z-20 rounded-full" />

      {/* Main Ejected Paper Body */}
      <div className="relative bg-[#071324]/95 backdrop-blur-2xl border-y border-cyan-400/60 border-x-2 border-x-cyan-300 rounded-sm p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(6,182,212,0.25)] text-left overflow-hidden">
        
        {/* Holographic Laser Printing Scan Beam */}
        <motion.div
          initial={{ x: "-100%", opacity: 1 }}
          animate={{ x: "200%", opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent skew-x-12 pointer-events-none z-30"
        />

        {/* Paper Header / Ticket Strip */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-dashed border-cyan-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wider font-mono">S01 站点健康度报告</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40">
                  4M1E 诊断
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                实时工序人机料法环在线健康度
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-slate-400">综合健康指数</div>
            <div className="flex items-center justify-end gap-1 text-xs font-black font-mono text-emerald-400">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>100% 优</span>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-hidden rounded-lg border border-cyan-500/25 bg-slate-950/80">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-cyan-950/70 text-cyan-200 font-semibold border-b border-cyan-500/25 text-[10px]">
                <th className="py-1.5 px-2.5 text-left font-bold text-cyan-300">工序</th>
                <th className="py-1.5 px-1.5 text-center text-slate-300 font-normal">人(Man)</th>
                <th className="py-1.5 px-1.5 text-center text-slate-300 font-normal">机(Mach)</th>
                <th className="py-1.5 px-1.5 text-center text-slate-300 font-normal">料(Mat)</th>
                <th className="py-1.5 px-1.5 text-center text-slate-300 font-normal">法(Meth)</th>
                <th className="py-1.5 px-1.5 text-center text-slate-300 font-normal">环(Env)</th>
                <th className="py-1.5 px-2.5 text-right font-bold text-cyan-300">总健康度</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10">
              {S01_STATIONS_HEALTH.map((row) => (
                <tr key={row.station} className="hover:bg-cyan-500/10 transition-colors">
                  <td className="py-1.5 px-2.5 whitespace-nowrap text-left">
                    <div className="flex items-center gap-1.5">
                      <span 
                        className="w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_6px_currentColor]" 
                        style={{ backgroundColor: row.color, color: row.color }}
                      />
                      <span className="font-bold text-white font-mono text-[11px]">{row.station}</span>
                      <span className="text-[9px] text-slate-400">({row.name})</span>
                    </div>
                  </td>
                  <td className="py-1.5 px-1.5 text-center font-mono text-emerald-300 font-semibold text-[11px]">{row.man}</td>
                  <td className="py-1.5 px-1.5 text-center font-mono text-emerald-300 font-semibold text-[11px]">{row.machine}</td>
                  <td className="py-1.5 px-1.5 text-center font-mono text-emerald-300 font-semibold text-[11px]">{row.material}</td>
                  <td className="py-1.5 px-1.5 text-center font-mono text-emerald-300 font-semibold text-[11px]">{row.method}</td>
                  <td className="py-1.5 px-1.5 text-center font-mono text-emerald-300 font-semibold text-[11px]">{row.env}</td>
                  <td className="py-1.5 px-2.5 text-right whitespace-nowrap">
                    <span 
                      className="font-bold font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300"
                    >
                      {row.total}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paper Perforation / Footer */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-dashed border-cyan-500/20 text-[9px] text-slate-400">
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            工序受控正常 (100% 达标)
          </span>
          <span className="font-mono text-slate-500">4M1E 动态诊断流</span>
        </div>
      </div>
    </motion.div>
  );
};
