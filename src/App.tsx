/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as ecStat from 'echarts-stat';
import React, { useState, useEffect, ReactNode, useRef, useMemo, createContext, useContext, CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Activity, Cpu, Settings, Database, Monitor, ChevronLeft, Clock, Users, ClipboardCheck, X, ShieldCheck, FileText, Printer, Download, ShieldAlert, Wrench, Sparkles, BookOpen, Wind, Eye, RefreshCcw, ExternalLink } from "lucide-react";
import ReactECharts from "echarts-for-react";
import { createPortal } from "react-dom";
import * as echarts from "echarts";
import IqcDashboard from "./components/IqcDashboard";
import CutDashboard from "./components/CutDashboard";
import PfaDashboard from "./components/PfaDashboard";
import BondingDashboard from "./components/BondingDashboard";
import AssyDashboard from "./components/AssyDashboard";
import { ShippingDashboard } from "./components/ShippingDashboard";
import { ObaDashboard } from "./components/ObaDashboard";
import { OrtDashboard } from "./components/OrtDashboard";
import { RmaDashboard } from "./components/RmaDashboard";
import LoginScreen from "./components/LoginScreen";
import { AiAssistant } from "./components/AiAssistant";
import { CutHealthTree } from "./components/CutHealthTree";
import { IqcHealthTree } from "./components/IqcHealthTree";
import { ClosedLoopManager } from "./components/ClosedLoopManager";
import { FilePasswordModal } from "./components/FilePasswordModal";
import { S01HealthPopover } from "./components/S01HealthPopover";
import { IQCIcon, CUTIcon, PFAIcon, BONDINGIcon, ASSYIcon, OBAIcon, ORTIcon, SHIPPINGIcon, RMAIcon } from "./components/ProcessIcons";
import appDataJson from "./data/appData.json";

// Create a context to hold the dynamic app data
export const AppDataContext = createContext<any>(null);

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used within an AppDataProvider");
  return context;
};

if ((ecStat as any).transform) {
  echarts.registerTransform((ecStat as any).transform.regression);
}

// Seeded pseudo-random generator based on today's calendar date to ensure dynamic daily changes within requested ranges
export function getClientSeededValue(seedOffset: number, min: number, max: number, decimals: number = 2): number {
  const dateObj = new Date();
  const seed = dateObj.getFullYear() * 365 + (dateObj.getMonth() + 1) * 31 + dateObj.getDate() + seedOffset;
  const x = Math.sin(seed) * 10000;
  const rand = x - Math.floor(x);
  const val = min + rand * (max - min);
  return parseFloat(val.toFixed(decimals));
}

export function getStationSeed(stationKey: string): number {
  const k = (stationKey || "").toUpperCase();
  if (k.includes("IQC")) return 200;
  if (k.includes("PFA") || k.includes("偏贴")) return 300;
  if (k.includes("BONDING") || k.includes("绑定") || k.includes("BND")) return 400;
  if (k.includes("ASSY") || k.includes("组装") || k.includes("ASY")) return 500;
  if (k.includes("SHIPPING") || k.includes("出货")) return 600;
  return 100; // CUT
}

export function getAttendanceValueForDay(stationKey: string, dayIndex: number = 0) {
  const k = (stationKey || "").toUpperCase();
  let minTotal = 25, maxTotal = 35;
  if (k.includes("IQC")) { minTotal = 8; maxTotal = 12; }
  else if (k.includes("PFA") || k.includes("偏贴")) { minTotal = 35; maxTotal = 45; }
  else if (k.includes("BONDING") || k.includes("绑定") || k.includes("BND")) { minTotal = 35; maxTotal = 45; }
  else if (k.includes("ASSY") || k.includes("组装") || k.includes("ASY")) { minTotal = 35; maxTotal = 45; }
  else if (k.includes("SHIPPING") || k.includes("出货")) { minTotal = 18; maxTotal = 28; }
  else if (k.includes("CUT") || k.includes("切割")) { minTotal = 25; maxTotal = 35; }

  const sSeed = getStationSeed(stationKey);
  const wave = (Math.sin(dayIndex * 1.7 + sSeed * 0.1) * Math.cos(dayIndex * 0.9 + sSeed * 0.07) + 1) / 2;
  const total = Math.round(minTotal + wave * (maxTotal - minTotal));
  const actual = total;
  const value = 100.0;
  return { value, actual, total };
}

export function getDetectionValueForDay(stationKey: string, dayIndex: number = 0) {
  const k = (stationKey || "").toUpperCase();
  let minTotal = 8, maxTotal = 15;
  if (k.includes("IQC")) { minTotal = 110; maxTotal = 130; }
  else if (k.includes("PFA") || k.includes("偏贴")) { minTotal = 8; maxTotal = 15; }
  else if (k.includes("BONDING") || k.includes("绑定") || k.includes("BND")) { minTotal = 8; maxTotal = 15; }
  else if (k.includes("ASSY") || k.includes("组装") || k.includes("ASY")) { minTotal = 8; maxTotal = 15; }
  else if (k.includes("SHIPPING") || k.includes("出货")) { minTotal = 12000; maxTotal = 15000; }
  else if (k.includes("CUT") || k.includes("切割")) { minTotal = 8; maxTotal = 15; }

  const sSeed = getStationSeed(stationKey);
  const wave = (Math.sin(dayIndex * 2.3 + (sSeed + 45) * 0.1) * Math.cos(dayIndex * 1.1 + (sSeed + 45) * 0.05) + 1) / 2;
  const total = Math.round(minTotal + wave * (maxTotal - minTotal));
  const actual = total;
  const value = 100.0;
  return { value, actual, total };
}

// Shared source of truth for stats
export const CURRENT_STATS = {
  get attendance() {
    return getAttendanceValueForDay("CUT", 0);
  },
  get detection() {
    return getDetectionValueForDay("CUT", 0);
  }
};

export function getPastDates(days: number): { dateStr: string; key: string }[] {
  const dates = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate());
    const dateStr = `${month}/${day}`;

    const yearStr = date.getFullYear();
    const monthStr = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(date.getDate()).padStart(2, '0');
    const key = `${yearStr}-${monthStr}-${dayStr}`;

    dates.push({ dateStr, key });
  }
  return dates;
}

export function getTodayKey(): string {
  const date = new Date();
  const yearStr = date.getFullYear();
  const monthStr = String(date.getMonth() + 1).padStart(2, '0');
  const dayStr = String(date.getDate()).padStart(2, '0');
  return `${yearStr}-${monthStr}-${dayStr}`;
}

export function getSiteDefaultYield(site: string): number {
  const s = (site || "").toLowerCase();
  if (s === "cut") return 99.85;
  if (s === "iqc") return 99.20;
  if (s === "pfa") return 98.80;
  if (s === "bonding" || s === "bnd") return 99.60;
  if (s === "assy" || s === "asy") return 98.20;
  if (s === "shipping") return 99.70;
  return 99.10;
}

export function getSiteDefaultProd(site: string): number {
  const s = (site || "").toLowerCase();
  if (s === "cut") return 12500;
  if (s === "iqc") return 220;
  if (s === "pfa") return 6500;
  if (s === "bonding" || s === "bnd") return 6000;
  if (s === "assy" || s === "asy") return 6500;
  if (s === "shipping") return 18000;
  return 10000;
}

export function useTrendData(site: string, days: number) {
  const [data, setData] = useState<{ dates: string[]; yields: number[]; productivity: number[] }>({
    dates: [],
    yields: [],
    productivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pastDates = getPastDates(days);
    const datesParam = pastDates.map(pd => pd.key).join(",");
    
    setLoading(true);
    fetch(`/api/production-data?site=${site}&dates=${datesParam}`)
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then((serverData: { date: string; yield: number; productivity: number }[]) => {
        const dates: string[] = [];
        const yields: number[] = [];
        const productivity: number[] = [];

        pastDates.forEach(pd => {
          const matched = Array.isArray(serverData) ? serverData.find(sd => sd.date === pd.key) : undefined;
          dates.push(pd.dateStr);
          const defaultYield = getSiteDefaultYield(site);
          const defaultProd = getSiteDefaultProd(site);
          yields.push(matched ? matched.yield : defaultYield);
          productivity.push(matched ? matched.productivity : defaultProd);
        });

        setData({ dates, yields, productivity });
        setLoading(false);
      })
      .catch(err => {
        console.warn("Using fallback trend data:", err);
        const dates: string[] = [];
        const yields: number[] = [];
        const productivity: number[] = [];
        const defaultYield = getSiteDefaultYield(site);
        const defaultProd = getSiteDefaultProd(site);
        pastDates.forEach(pd => {
          dates.push(pd.dateStr);
          yields.push(defaultYield);
          productivity.push(defaultProd);
        });
        setData({ dates, yields, productivity });
        setLoading(false);
      });
  }, [site, days]);

  return { data, loading };
}

function getFallbackStatusData(site: string) {
  const results: any[] = [];
  if (site === "cut") {
    const lines = ["CUT-09#", "CUT-10#", "CUT-11#", "CUT-12#"];
    lines.forEach(l => {
      results.push({ line: l, param: "切割压力", val: "5.0", up: "7", low: "3", status: "OK" });
      results.push({ line: l, param: "切割速度", val: "220", up: "300", low: "100", status: "OK" });
      results.push({ line: l, param: "下刀量", val: "0.3", up: "0.4", low: "0.2", status: "OK" });
    });
  } else if (site === "iqc") {
    const lines = ["L01", "L02", "L03", "L04", "L05"];
    lines.forEach(l => {
      results.push({ line: `${l}-IQC`, param: "投影偏差", val: "0.03 μm", up: "0.05", low: "0.00", status: "OK" });
      results.push({ line: `${l}-IQC`, param: "光源照度", val: "1300 Lux", up: "1400", low: "1100", status: "OK" });
      results.push({ line: `${l}-IQC`, param: "检测速度", val: "48.0 s/pcs", up: "55.0", low: "35.0", status: "OK" });
    });
  } else if (site === "pfa") {
    const lines = ["03", "05", "06", "09", "10", "11"];
    lines.forEach(l => {
      const lineName = `PFA-${l}#`;
      const gtVal = l === "03" ? "4.8" : (l === "11" ? "5.0" : "5.4");
      const gsVal = l === "09" ? "120" : (l === "10" ? "130" : "150");
      const gpVal = (l === "10" || l === "11") ? "25" : "30";
      const apVal = l === "03" ? "0.35" : "0.30";
      const asVal = (l === "03" || l === "10") ? "400" : (l === "11" ? "600" : "300");

      results.push({ line: lineName, param: "研磨时间", val: gtVal, up: "6.5", low: "2.4", status: "OK" });
      results.push({ line: lineName, param: "研磨速度", val: gsVal, up: "288", low: "100", status: "OK" });
      results.push({ line: lineName, param: "研磨压力", val: gpVal, up: "30", low: "1", status: "OK" });
      results.push({ line: lineName, param: "贴附压力", val: apVal, up: "0.4", low: "0.2", status: "OK" });
      results.push({ line: lineName, param: "贴附速度", val: asVal, up: "800", low: "100", status: "OK" });
    });
  } else if (site === "bonding" || site === "bnd") {
    const lines = ["03", "05", "06", "09", "10", "11"];
    lines.forEach(l => {
      const lineName = `BD-${l}#`;
      // 本压时间设定为5s, 本压温度180度上下20度(整数), 本压压力0.5Mpa上下0.05(保留两位小数)
      results.push({ line: lineName, param: "本压时间", val: "5", up: "6", low: "4", status: "OK" });
      results.push({ line: lineName, param: "本压温度", val: "180", up: "200", low: "160", status: "OK" });
      results.push({ line: lineName, param: "本压压力", val: "0.50", up: "0.55", low: "0.45", status: "OK" });
    });
  } else if (site === "assy" || site === "asy") {
    const lines = ["01", "02"];
    lines.forEach(l => {
      const lineName = `ASSY-${l}#`;
      const speedVal = l === "01" ? "20" : "40";
      const dwellVal = "0.5s";
      results.push({ line: lineName, param: "组装速度", val: speedVal, up: "45", low: "15", status: "OK" });
      results.push({ line: lineName, param: "保压时间", val: dwellVal, up: "0.7", low: "0.3", status: "OK" });
    });
  } else {
    const lines = ["01", "02"];
    lines.forEach(l => {
      const lineName = `ASSY-${l}#`;
      const speedVal = l === "01" ? "20" : "40";
      const dwellVal = "0.5s";
      results.push({ line: lineName, param: "组装速度", val: speedVal, up: "45", low: "15", status: "OK" });
      results.push({ line: lineName, param: "保压时间", val: dwellVal, up: "0.7", low: "0.3", status: "OK" });
    });
  }
  return results;
}

export function useStatusTableData(site: string) {
  const [allData, setAllData] = useState<any[]>(() => getFallbackStatusData(site));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = getTodayKey();
    setLoading(true);
    fetch(`/api/status-table?site=${site}&date=${today}`)
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then((serverData) => {
        if (Array.isArray(serverData) && serverData.length > 0) {
          setAllData(serverData);
        } else {
          setAllData(getFallbackStatusData(site));
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn("Using fallback status table data:", err);
        setAllData(getFallbackStatusData(site));
        setLoading(false);
      });
  }, [site]);

  return { allData, loading };
}

export function useParticleSizeData() {
  const [data, setData] = useState<number[][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = getTodayKey();
    setLoading(true);
    fetch(`/api/particle-size?date=${today}`)
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then((serverData) => {
        setData(serverData);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Using fallback particle size data:", err);
        setData([
          [0, 0, 12], [0, 1, 8], [0, 2, 15],
          [1, 0, 18], [1, 1, 22], [1, 2, 14],
          [2, 0, 9], [2, 1, 11], [2, 2, 7]
        ]);
        setLoading(false);
      });
  }, []);

  return { data, loading };
}

export function useBondingCouplingData() {
  const [data, setData] = useState<{ times: string[]; temps: number[]; pressures: number[] }>({
    times: [],
    temps: [],
    pressures: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = getTodayKey();
    setLoading(true);
    fetch(`/api/bonding-coupling?date=${today}`)
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then((serverData) => {
        setData(serverData);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Using fallback bonding coupling data:", err);
        setData({
          times: ["08:00", "09:00", "10:00", "11:00", "12:00"],
          temps: [185.2, 186.1, 187.0, 186.5, 187.8],
          pressures: [2.1, 2.2, 2.1, 2.3, 2.2]
        });
        setLoading(false);
      });
  }, []);

  return { data, loading };
}

// Transitioning PROCESS_STEPS to be dynamic inside the App component

export const Card = ({ title, children, className = "", overflowVisible = false, style }: { title: string, children: ReactNode, className?: string, overflowVisible?: boolean, style?: CSSProperties }) => (
  <div style={style} className={`relative bg-[#102445]/80 backdrop-blur-xl border border-cyan-500/30 rounded-sm p-4 group hover:border-cyan-400 transition-all duration-500 ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'} ${className}`}>
    {/* Background Tech Pattern */}
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(30deg,#06b6d4_12%,transparent_12.5%,transparent_87%,#06b6d4_87.5%,#06b6d4),linear-gradient(150deg,#06b6d4_12%,transparent_12.5%,transparent_87%,#06b6d4_87.5%,#06b6d4),linear-gradient(30deg,#06b6d4_12%,transparent_12.5%,transparent_87%,#06b6d4_87.5%,#06b6d4),linear-gradient(150deg,#06b6d4_12%,transparent_12.5%,transparent_87%,#06b6d4_87.5%,#06b6d4),linear-gradient(60deg,#06b6d4_25%,transparent_25.5%,transparent_75%,#06b6d4_75%,#06b6d4),linear-gradient(60deg,#06b6d4_25%,transparent_25.5%,transparent_75%,#06b6d4_75%,#06b6d4)] bg-[length:20px_35px]" />
    
    {/* Glitchy Border Accents */}
    <div className="absolute top-0 left-0 w-4 h-1 bg-cyan-500 group-hover:w-full transition-all duration-700" />
    <div className="absolute bottom-0 right-0 w-4 h-1 bg-cyan-500 group-hover:w-full transition-all duration-700" />
    
    {/* Corner Brackets */}
    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
    
    <div className="relative flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white font-black border-l-2 border-white pl-3 uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ fontSize: '18px' }}>
          {title}
        </div>
        <div className="flex gap-1">
           <div className="w-1 h-1 bg-cyan-500 animate-pulse" />
           <div className="w-1 h-1 bg-cyan-500/50" />
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center bg-cyan-950/20 border border-cyan-500/10 rounded group-hover:bg-cyan-500/5 transition-colors p-2">
        <div className="w-full text-cyan-50 text-sm md:text-base font-bold tracking-widest text-center">
          {children}
        </div>
      </div>
    </div>
  </div>
);

export const Gauge = ({ 
  value, 
  label, 
  color = "cyan", 
  actual, 
  total, 
  unit = "人",
  onClick,
  gaugeClassName = "w-32 h-24",
  valueSize = "text-sm",
  labelSize = "text-sm",
  dataSize = "text-[10px]",
  labelStyle
}: { 
  value: number, 
  label: string, 
  color?: string, 
  actual?: number, 
  total?: number,
  unit?: string,
  onClick?: () => void,
  gaugeClassName?: string,
  valueSize?: string,
  labelSize?: string,
  dataSize?: string,
  labelStyle?: React.CSSProperties
}) => {
  return (
    <div 
      className={`flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 group/gauge`}
      onClick={onClick}
    >
      <div className={`relative ${gaugeClassName}`}>
        <svg
          height="100%"
          width="100%"
          viewBox="0 0 100 70"
          className="transform"
        >
          {/* Background Arch */}
          <path
            d="M 10 60 A 40 40 0 0 1 90 60"
            fill="none"
            stroke="#0f172a"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Ticks */}
          {[0, 45, 90, 135, 180].map((deg) => {
            const rad = (deg - 180) * (Math.PI / 180);
            const x1 = 50 + 32 * Math.cos(rad);
            const y1 = 60 + 32 * Math.sin(rad);
            const x2 = 50 + 38 * Math.cos(rad);
            const y2 = 60 + 38 * Math.sin(rad);
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(6,182,212,0.4)" strokeWidth="1" />;
          })}
          
          {/* Progress Arch */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: value / 100 }}
            transition={{ duration: 2, ease: "easeOut" }}
            d="M 10 60 A 40 40 0 0 1 90 60"
            fill="none"
            stroke={color === "cyan" ? "#22d3ee" : "#38bdf8"}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="100 100"
            className="drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
          />
          
          {/* Needle group */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: (value / 100) * 180 - 90 }}
            transition={{ duration: 2, ease: "easeOut" }}
            style={{ originX: "50%", originY: "85.7%" }}
          >
             <line x1="50" y1="60" x2="50" y2="25" stroke="#ecfeff" strokeWidth="2.5" strokeLinecap="round" className="drop-shadow-[0_0_3px_white]" />
             {/* Needle Center Cap - Brighter colors */}
             <circle cx="50" cy="60" r="5" fill="#ecfeff" />
             <circle cx="50" cy="60" r="2.5" fill="#22d3ee" />
          </motion.g>
        </svg>
        <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
           <span className={`${valueSize} font-black text-white italic tracking-tighter drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]`}>{value}%</span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 mt-4">
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color === "cyan" ? "bg-cyan-400 shadow-[0_0_8px_cyan]" : "bg-blue-400 shadow-[0_0_8px_#60a5fa]"} animate-pulse`} />
            <span className={`${labelSize} text-white font-bold tracking-[0.25em] group-hover/gauge:text-white transition-colors`} style={{ fontSize: '15px', ...labelStyle }}>{label}</span>
         </div>
         {actual !== undefined && total !== undefined && (
           <div className={`${dataSize} text-white font-mono tracking-widest`}>
              {actual} / {total} {unit}
           </div>
         )}
      </div>
    </div>
  );
};

export const HealthRing = ({ label, value = 100, onClick }: { label: string, value?: number, onClick?: () => void }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div 
      className={`flex flex-col items-center gap-1.5 group/ring ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''}`}
      onClick={onClick}
    >
      <div className="relative w-12 h-12">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="rgba(34, 211, 238, 0.1)"
            strokeWidth="3"
            fill="none"
          />
          <motion.circle
            cx="24"
            cy="24"
            r={radius}
            stroke="#22d3ee"
            strokeWidth="3"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            className="drop-shadow-[0_0_5px_rgba(34,211,238,0.8)] shadow-cyan-400"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5">
           <span className="text-[10px] font-black text-white italic leading-none">{value}%</span>
        </div>
      </div>
      <span className="text-sm text-white font-bold group-hover/ring:text-white transition-colors">{label}</span>
    </div>
  );
};

// CUT dashboard specific components moved to CutDashboard.tsx

export const MachineTrendModal = ({ 
  row, 
  onClose 
}: { 
  row: any; 
  onClose: () => void; 
}) => {
  const modalEchartOption = useMemo(() => {
    if (!row) return {};

    const rawValStr = row.val;
    const upStr = row.up;
    const lowStr = row.low;

    // Extract unit if exists
    const unitMatch = rawValStr.match(/[^\d.e-]+/);
    const unit = unitMatch ? unitMatch[0].trim() : "";

    const parseNum = (str: string) => {
      if (!str) return 0;
      const m = str.match(/^[\d.e-]+/);
      return m ? parseFloat(m[0]) : 0;
    };

    const baseVal = parseNum(rawValStr);
    const upVal = parseNum(upStr);
    const lowVal = parseNum(lowStr);

    const range = (upVal - lowVal) > 0 ? (upVal - lowVal) * 0.25 : (baseVal !== 0 ? Math.abs(baseVal) * 0.08 : 5);

    // Deterministic values for 12 hours history (keep it flat at the current parameter value)
    const getSeededVal = () => {
      return baseVal;
    };

    // 12 hours timestamps
    const now = new Date();
    const times = [];
    const values = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStr = String(d.getHours()).padStart(2, '0') + ":00";
      times.push(hourStr);
      values.push(getSeededVal());
    }

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(5, 17, 37, 0.95)",
        borderColor: "#22d3ee",
        borderWidth: 1,
        textStyle: { color: "#fff", fontSize: 15, fontFamily: '"Microsoft YaHei", "微软雅黑", sans-serif' },
        formatter: (params: any) => {
          const item = params[0];
          return `时间: ${item.name}<br/>数值: <span style="color:#22d3ee;font-weight:bold">${item.value} ${unit}</span>`;
        }
      },
      grid: {
        top: "15%",
        left: "5%",
        right: "18%",
        bottom: "5%",
        containLabel: true
      },
      xAxis: {
        type: "category",
        data: times,
        axisLine: { lineStyle: { color: "rgba(34, 211, 238, 0.3)" } },
        axisLabel: { color: "#ffffff", fontSize: 15 },
        boundaryGap: false
      },
      yAxis: {
        type: "value",
        min: row.param === "液晶电导" ? 0 : parseFloat((Math.min(lowVal, ...values) - range * 0.4).toFixed(2)),
        max: row.param === "液晶电导" ? 3.5e-12 : parseFloat((Math.max(upVal, ...values) + range * 0.4).toFixed(2)),
        axisLine: { lineStyle: { color: "rgba(34, 211, 238, 0.3)" } },
        axisLabel: { 
          color: "#ffffff", 
          fontSize: 15,
          formatter: `{value} ${unit}`
        },
        splitLine: { lineStyle: { color: "rgba(255, 255, 255, 0.05)" } }
      },
      series: [
        {
          name: row.param,
          type: "line",
          data: values,
          smooth: true,
          showSymbol: true,
          symbolSize: 6,
          itemStyle: { color: "#22d3ee" },
          lineStyle: { width: 2, color: "#22d3ee" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(34, 211, 238, 0.2)" },
              { offset: 1, color: "rgba(34, 211, 238, 0)" }
            ])
          },
          markLine: {
            symbol: ["none", "none"],
            silent: true,
            data: [
              {
                yAxis: upVal,
                name: "上限",
                lineStyle: { color: "#ef4444", type: "dashed", width: 1.5 },
                label: { 
                  formatter: `上限: {c} ${unit}`, 
                  position: "end", 
                  color: "#ef4444",
                  fontSize: 15,
                  distance: 5
                }
              },
              {
                yAxis: lowVal,
                name: "下限",
                lineStyle: { color: "#fb7185", type: "dashed", width: 1.5 },
                label: { 
                  formatter: `下限: {c} ${unit}`, 
                  position: "end", 
                  color: "#fb7185",
                  fontSize: 15,
                  distance: 5
                }
              }
            ]
          }
        }
      ]
    };
  }, [row]);

  if (!row) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0a1526]/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className="relative w-full max-w-[480px] bg-[#102445] border border-cyan-500/40 rounded-xl shadow-[0_0_40px_rgba(6,182,212,0.25)] p-5 overflow-hidden flex flex-col gap-4 text-left"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        <div className="absolute top-0 right-0 p-3">
          <button
            onClick={onClose}
            className="text-white hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 pb-3 border-b border-cyan-500/20 mt-1">
          <div className="p-2 rounded-lg border flex items-center justify-center bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">[ 运行指标趋势监控 ]</span>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span>{row.line}</span>
              <span className="text-cyan-500">•</span>
              <span>{row.param}</span>
            </h3>
          </div>
        </div>

        {/* Param Display */}
        <div className="grid grid-cols-3 gap-2 bg-cyan-950/20 border border-cyan-500/10 p-2.5 rounded text-center text-[10px]">
          <div>
            <div className="text-slate-400 mb-0.5 font-semibold">当前设定值</div>
            <div className="font-bold text-cyan-400 text-xs font-mono">{row.val}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-0.5 font-semibold">控制上限</div>
            <div className="font-semibold text-red-400 text-xs font-mono">{row.up}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-0.5 font-semibold">控制下限</div>
            <div className="font-semibold text-rose-400 text-xs font-mono">{row.low}</div>
          </div>
        </div>

        {/* Chart container */}
        <div className="h-[260px] w-full bg-[#0a1526]/40 rounded border border-cyan-500/15 p-2 relative">
          <ReactECharts
            option={modalEchartOption}
            style={{ height: "100%", width: "100%" }}
            opts={{ renderer: "canvas" }}
          />
        </div>

        <div className="flex justify-end pt-1 border-t border-cyan-500/10">
          <button
            onClick={onClose}
            className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 font-bold px-4 py-1.5 rounded border border-cyan-500/30 transition-all duration-150 cursor-pointer text-[10px]"
          >
            关闭
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};



// YieldProductionChart moved to CutDashboard.tsx

const IsoStandardModal = ({ onClose, site = "cut" }: { onClose: () => void; site?: string }) => {
  const s = (site || "cut").toLowerCase();
  const isClass6 = s === "pfa" || s === "bonding" || s === "bnd";
  const highlightedClass = isClass6 ? "ISO Class 6" : "ISO Class 7";
  const siteLabel = s === "pfa" ? "PFA车间" : (s === "bonding" || s === "bnd" ? "BONDING车间" : (s === "assy" || s === "asy" ? "ASSY车间" : "车间"));

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0a1526]/75 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 10 }}
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-6 flex flex-col gap-4 text-left z-10"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            空气洁净度等级划分 (ISO 14644-1 国际标准)
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono">
              {isClass6 ? `${siteLabel}标准 (ISO Class 6)` : "车间标准 (ISO Class 7)"}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">最大浓度限制值（每立方米空气中大于或等于所标粒径的粒子个数）</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-md border border-slate-800 bg-[#0a1526]/50">
          <table className="w-full text-xs text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="p-3 text-slate-300 font-medium border-r border-slate-800" rowSpan={2}>
                  空气洁净度等级
                </th>
                <th className="p-3 text-slate-300 font-medium text-center border-b border-slate-800" colSpan={6}>
                  最大浓度限制 (粒数/m³)
                </th>
              </tr>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="p-2 text-slate-400 font-medium border-r border-slate-800 text-center">0.1μm</th>
                <th className="p-2 text-slate-400 font-medium border-r border-slate-800 text-center">0.2μm</th>
                <th className="p-2 text-slate-400 font-medium border-r border-slate-800 text-center">0.3μm</th>
                <th className="p-2 text-slate-400 font-medium border-r border-slate-800 text-center">0.5μm</th>
                <th className="p-2 text-slate-400 font-medium border-r border-slate-800 text-center">1.0μm</th>
                <th className="p-2 text-slate-400 font-medium text-center">5.0μm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {[
                { name: 'ISO Class 1', values: ['10', '2', '-', '-', '-', '-'] },
                { name: 'ISO Class 2', values: ['100', '24', '10', '4', '-', '-'] },
                { name: 'ISO Class 3', values: ['1,000', '237', '102', '35', '8', '-'] },
                { name: 'ISO Class 4', values: ['10,000', '2,370', '1,020', '352', '83', '-'] },
                { name: 'ISO Class 5', values: ['100,000', '23,700', '10,200', '3,520', '832', '29'] },
                { name: 'ISO Class 6', values: ['1,000,000', '237,000', '102,000', '35,200', '8,320', '293'] },
                { name: 'ISO Class 7', values: ['-', '-', '-', '352,000', '83,200', '2,930'] },
                { name: 'ISO Class 8', values: ['-', '-', '-', '3,520,000', '832,000', '29,300'] },
                { name: 'ISO Class 9', values: ['-', '-', '-', '35,200,000', '8,320,000', '293,000'] }
              ].map((row) => {
                const isHighlighted = row.name === highlightedClass;
                return (
                  <tr 
                    key={row.name} 
                    className={`transition-colors ${
                      isHighlighted 
                        ? 'bg-amber-500/15 hover:bg-amber-500/20 text-amber-200 border-y-2 border-amber-500/50' 
                        : 'hover:bg-slate-900/40 text-slate-400'
                    }`}
                  >
                    <td className={`p-2.5 border-r border-slate-800 font-medium ${isHighlighted ? 'text-amber-400 font-bold' : 'text-slate-300'}`}>
                      <div className="flex items-center gap-2">
                        <span>{row.name}</span>
                        {isHighlighted && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30 font-sans font-medium">
                            当前标准 ({isClass6 ? 'Class 6' : 'Class 7'})
                          </span>
                        )}
                      </div>
                    </td>
                    {row.values.map((val, idx) => (
                      <td 
                        key={idx} 
                        className={`p-2.5 text-center border-r border-slate-800/40 last:border-r-0 ${
                          isHighlighted ? 'text-amber-300 font-bold bg-amber-500/10' : val === '-' ? 'text-slate-600' : 'text-slate-400'
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="text-[11px] text-slate-400 bg-[#0a1526]/30 border border-slate-800 p-3 rounded leading-relaxed">
          <span className="text-amber-400 font-medium mr-1.5">说明:</span>
          {isClass6 ? (
            <span>
              本站点（{siteLabel}工段）严格执行 <strong className="text-amber-400 font-bold">ISO Class 6</strong> 级别空气净化标准。
              根据标准，0.5μm粒径的最大粒子浓度限值为 <strong className="text-slate-200">35,200</strong> 个/m³，
              1.0μm为 <strong className="text-slate-200">8,320</strong> 个/m³，
              5.0μm为 <strong className="text-slate-200">293</strong> 个/m³。
            </span>
          ) : (
            <span>
              本站点执行 <strong className="text-amber-400 font-bold">ISO Class 7</strong> 级别空气净化标准。
              根据标准，0.5μm粒径的最大粒子浓度限值为 <strong className="text-slate-200">352,000</strong> 个/m³，
              1.0μm为 <strong className="text-slate-200">83,200</strong> 个/m³，
              5.0μm为 <strong className="text-slate-200">2,930</strong> 个/m³。
            </span>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export const ParticleSizeChart = ({ site = "cut" }: { site?: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const s = (site || "cut").toLowerCase();
  const isPfa = s === "pfa";
  const isBonding = s === "bonding" || s === "bnd";
  const isAssy = s === "assy" || s === "asy";
  const sSeed = getStationSeed(site);

  const days = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      arr.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }
    return arr;
  }, []);

  const data05 = useMemo(() => {
    if (isPfa) {
      return [
        Math.round(getClientSeededValue(sSeed + 50, 6800, 9600, 0)),
        Math.round(getClientSeededValue(sSeed + 51, 6800, 9600, 0)),
        Math.round(getClientSeededValue(sSeed + 52, 6800, 9600, 0)),
        Math.round(getClientSeededValue(sSeed + 53, 6800, 9600, 0)),
        Math.round(getClientSeededValue(sSeed + 54, 6800, 9600, 0)),
        Math.round(getClientSeededValue(sSeed + 55, 6800, 9600, 0)),
        Math.round(getClientSeededValue(sSeed + 56, 6800, 9600, 0))
      ];
    }
    if (isBonding) {
      // Bonding 0.5um <= 10000
      return [
        Math.round(getClientSeededValue(sSeed + 50, 6800, 9500, 0)),
        Math.round(getClientSeededValue(sSeed + 51, 6800, 9500, 0)),
        Math.round(getClientSeededValue(sSeed + 52, 6800, 9500, 0)),
        Math.round(getClientSeededValue(sSeed + 53, 6800, 9500, 0)),
        Math.round(getClientSeededValue(sSeed + 54, 6800, 9500, 0)),
        Math.round(getClientSeededValue(sSeed + 55, 6800, 9500, 0)),
        Math.round(getClientSeededValue(sSeed + 56, 6800, 9500, 0))
      ];
    }
    if (isAssy) {
      // ASSY 0.5um <= 100000
      return [
        Math.round(getClientSeededValue(sSeed + 50, 78000, 96000, 0)),
        Math.round(getClientSeededValue(sSeed + 51, 78000, 96000, 0)),
        Math.round(getClientSeededValue(sSeed + 52, 78000, 96000, 0)),
        Math.round(getClientSeededValue(sSeed + 53, 78000, 96000, 0)),
        Math.round(getClientSeededValue(sSeed + 54, 78000, 96000, 0)),
        Math.round(getClientSeededValue(sSeed + 55, 78000, 96000, 0)),
        Math.round(getClientSeededValue(sSeed + 56, 78000, 96000, 0))
      ];
    }
    return [
      Math.round(getClientSeededValue(sSeed + 50, 80000, 95000, 0)),
      Math.round(getClientSeededValue(sSeed + 51, 80000, 95000, 0)),
      Math.round(getClientSeededValue(sSeed + 52, 80000, 95000, 0)),
      Math.round(getClientSeededValue(sSeed + 53, 80000, 95000, 0)),
      Math.round(getClientSeededValue(sSeed + 54, 80000, 95000, 0)),
      Math.round(getClientSeededValue(sSeed + 55, 80000, 95000, 0)),
      Math.round(getClientSeededValue(sSeed + 56, 80000, 95000, 0))
    ];
  }, [sSeed, isPfa, isBonding, isAssy]);

  const data10 = useMemo(() => {
    if (isPfa) {
      return [
        Math.round(getClientSeededValue(sSeed + 60, 1400, 2350, 0)),
        Math.round(getClientSeededValue(sSeed + 61, 1400, 2350, 0)),
        Math.round(getClientSeededValue(sSeed + 62, 1400, 2350, 0)),
        Math.round(getClientSeededValue(sSeed + 63, 1400, 2350, 0)),
        Math.round(getClientSeededValue(sSeed + 64, 1400, 2350, 0)),
        Math.round(getClientSeededValue(sSeed + 65, 1400, 2350, 0)),
        Math.round(getClientSeededValue(sSeed + 66, 1400, 2350, 0))
      ];
    }
    if (isBonding) {
      // Bonding 1.0um <= 2400
      return [
        Math.round(getClientSeededValue(sSeed + 60, 1400, 2350, 0)),
        Math.round(getClientSeededValue(sSeed + 61, 1400, 2350, 0)),
        Math.round(getClientSeededValue(sSeed + 62, 1400, 2350, 0)),
        Math.round(getClientSeededValue(sSeed + 63, 1400, 2350, 0)),
        Math.round(getClientSeededValue(sSeed + 64, 1400, 2350, 0)),
        Math.round(getClientSeededValue(sSeed + 65, 1400, 2350, 0)),
        Math.round(getClientSeededValue(sSeed + 66, 1400, 2350, 0))
      ];
    }
    if (isAssy) {
      // ASSY 1.0um <= 24000
      return [
        Math.round(getClientSeededValue(sSeed + 60, 16000, 23500, 0)),
        Math.round(getClientSeededValue(sSeed + 61, 16000, 23500, 0)),
        Math.round(getClientSeededValue(sSeed + 62, 16000, 23500, 0)),
        Math.round(getClientSeededValue(sSeed + 63, 16000, 23500, 0)),
        Math.round(getClientSeededValue(sSeed + 64, 16000, 23500, 0)),
        Math.round(getClientSeededValue(sSeed + 65, 16000, 23500, 0)),
        Math.round(getClientSeededValue(sSeed + 66, 16000, 23500, 0))
      ];
    }
    return [
      Math.round(getClientSeededValue(sSeed + 60, 16000, 22000, 0)),
      Math.round(getClientSeededValue(sSeed + 61, 16000, 22000, 0)),
      Math.round(getClientSeededValue(sSeed + 62, 16000, 22000, 0)),
      Math.round(getClientSeededValue(sSeed + 63, 16000, 22000, 0)),
      Math.round(getClientSeededValue(sSeed + 64, 16000, 22000, 0)),
      Math.round(getClientSeededValue(sSeed + 65, 16000, 22000, 0)),
      Math.round(getClientSeededValue(sSeed + 66, 16000, 22000, 0))
    ];
  }, [sSeed, isPfa, isBonding, isAssy]);

  const data50 = useMemo(() => {
    if (isPfa) {
      return [
        Math.round(getClientSeededValue(sSeed + 70, 20, 78, 0)),
        Math.round(getClientSeededValue(sSeed + 71, 20, 78, 0)),
        Math.round(getClientSeededValue(sSeed + 72, 20, 78, 0)),
        Math.round(getClientSeededValue(sSeed + 73, 20, 78, 0)),
        Math.round(getClientSeededValue(sSeed + 74, 20, 78, 0)),
        Math.round(getClientSeededValue(sSeed + 75, 20, 78, 0)),
        Math.round(getClientSeededValue(sSeed + 76, 20, 78, 0))
      ];
    }
    if (isBonding) {
      // Bonding 5.0um <= 80
      return [
        Math.round(getClientSeededValue(sSeed + 70, 20, 78, 0)),
        Math.round(getClientSeededValue(sSeed + 71, 20, 78, 0)),
        Math.round(getClientSeededValue(sSeed + 72, 20, 78, 0)),
        Math.round(getClientSeededValue(sSeed + 73, 20, 78, 0)),
        Math.round(getClientSeededValue(sSeed + 74, 20, 78, 0)),
        Math.round(getClientSeededValue(sSeed + 75, 20, 78, 0)),
        Math.round(getClientSeededValue(sSeed + 76, 20, 78, 0))
      ];
    }
    if (isAssy) {
      // ASSY 5.0um <= 800
      return [
        Math.round(getClientSeededValue(sSeed + 70, 450, 780, 0)),
        Math.round(getClientSeededValue(sSeed + 71, 450, 780, 0)),
        Math.round(getClientSeededValue(sSeed + 72, 450, 780, 0)),
        Math.round(getClientSeededValue(sSeed + 73, 450, 780, 0)),
        Math.round(getClientSeededValue(sSeed + 74, 450, 780, 0)),
        Math.round(getClientSeededValue(sSeed + 75, 450, 780, 0)),
        Math.round(getClientSeededValue(sSeed + 76, 450, 780, 0))
      ];
    }
    return [
      Math.round(getClientSeededValue(sSeed + 70, 400, 750, 0)),
      Math.round(getClientSeededValue(sSeed + 71, 400, 750, 0)),
      Math.round(getClientSeededValue(sSeed + 72, 400, 750, 0)),
      Math.round(getClientSeededValue(sSeed + 73, 400, 750, 0)),
      Math.round(getClientSeededValue(sSeed + 74, 400, 750, 0)),
      Math.round(getClientSeededValue(sSeed + 75, 400, 750, 0)),
      Math.round(getClientSeededValue(sSeed + 76, 400, 750, 0))
    ];
  }, [sSeed, isPfa, isBonding, isAssy]);

  const maxY = (isPfa || isBonding) ? 12000 : 120000;
  const intervalY = (isPfa || isBonding) ? 2000 : 20000;

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(5, 17, 37, 0.95)',
      borderColor: '#22d3ee',
      textStyle: { color: '#fff', fontSize: 13 }
    },
    legend: {
      show: true,
      data: ['0.5μm颗粒数', '1.0μm颗粒数', '5.0μm颗粒数'],
      right: 20,
      top: 'middle',
      orient: 'vertical',
      textStyle: { color: '#ffffff', fontSize: 11 }
    },
    grid: { top: 30, left: 65, right: 175, bottom: 25 },
    xAxis: {
      type: 'category',
      data: days,
      axisLabel: { color: '#ffffff', fontSize: 14 },
      axisLine: { lineStyle: { color: 'rgba(34, 211, 238, 0.2)' } }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: maxY,
      interval: intervalY,
      splitLine: { lineStyle: { type: 'dashed', color: 'rgba(34, 211, 238, 0.1)' } },
      axisLabel: { color: '#ffffff', fontSize: 14 },
    },
    series: [
      {
        name: '0.5μm颗粒数',
        type: 'bar',
        barWidth: '15%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#22d3ee' },
            { offset: 1, color: 'rgba(34, 211, 238, 0.25)' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: false
        },
        markLine: {
          symbol: ['none', 'none'],
          silent: false,
          triggerEvent: true,
          label: {
            show: true,
            position: 'end',
            formatter: 'ISO14644-1国际标准 🔍',
            fontSize: 11,
            color: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            borderColor: 'rgba(239, 68, 68, 0.4)',
            borderWidth: 1,
            borderRadius: 3,
            padding: [4, 6],
            cursor: 'pointer'
          },
          lineStyle: {
            color: '#ef4444',
            type: 'dashed',
            width: 1.5
          },
          data: [
            { yAxis: (isPfa || isBonding) ? 10000 : 100000 }
          ]
        },
        data: data05
      },
      {
        name: '1.0μm颗粒数',
        type: 'bar',
        barWidth: '15%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#10b981' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.25)' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: false
        },
        data: data10
      },
      {
        name: '5.0μm颗粒数',
        type: 'bar',
        barWidth: '15%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#f59e0b' },
            { offset: 1, color: 'rgba(245, 158, 11, 0.25)' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: false
        },
        data: data50
      }
    ]
  };

  const onEvents = {
    'click': (params: any) => {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="relative w-full h-full">
      <ReactECharts option={option} onEvents={onEvents} style={{ height: '100%', width: '100%' }} />
      
      <AnimatePresence>
        {isModalOpen && (
          <IsoStandardModal onClose={() => setIsModalOpen(false)} site={site} />
        )}
      </AnimatePresence>
    </div>
  );
};

export const TemperatureChart = ({ site = "cut" }: { site?: string }) => {
  const sSeed = getStationSeed(site);
  const days = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      arr.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }
    return arr;
  }, []);
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(5, 17, 37, 0.9)',
      borderColor: '#22d3ee',
      textStyle: { color: '#fff', fontSize: 15 },
      axisPointer: { type: 'line' }
    },
    grid: { top: 20, left: 55, right: 60, bottom: 25 },
    xAxis: [{
      type: 'category',
      data: days,
      axisLabel: { color: '#ffffff', fontSize: 14 },
      axisLine: { lineStyle: { color: 'rgba(34, 211, 238, 0.2)' } }
    }],
    yAxis: [
      {
        type: 'value',
        min: 16,
        max: 28,
        interval: 2,
        axisLabel: { color: '#ffffff', fontSize: 14, formatter: '{value}°C' },
        splitLine: { lineStyle: { color: 'rgba(34, 211, 238, 0.05)' } },
        nameTextStyle: { color: '#22d3ee', fontSize: 14 }
      }
    ],
    series: [
      {
        name: 'Temperature',
        type: 'line',
        smooth: true,
        lineStyle: { width: 2, color: '#f59e0b' },
        itemStyle: { color: '#f59e0b' },
        label: {
          show: true,
          position: 'top',
          color: '#ffffff',
          fontSize: 12,
          formatter: '{c}°C'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 158, 11, 0.2)' },
            { offset: 1, color: 'rgba(245, 158, 11, 0)' }
          ])
        },
        markLine: {
          symbol: ['none', 'none'],
          label: {
            show: true,
            position: 'end',
            formatter: '{b}: {c}',
            fontSize: 12,
            color: '#f59e0b'
          },
          lineStyle: {
            color: '#f59e0b',
            type: 'dashed',
            width: 1
          },
          data: [
            { yAxis: 24, name: 'Min' },
            { yAxis: 26, name: 'Max' }
          ]
        },
        data: [
          getClientSeededValue(sSeed + 40, 24.6, 25.4, 1),
          getClientSeededValue(sSeed + 41, 24.6, 25.4, 1),
          getClientSeededValue(sSeed + 42, 24.6, 25.4, 1),
          getClientSeededValue(sSeed + 43, 24.6, 25.4, 1),
          getClientSeededValue(sSeed + 44, 24.6, 25.4, 1),
          getClientSeededValue(sSeed + 45, 24.6, 25.4, 1),
          getClientSeededValue(sSeed + 46, 24.6, 25.4, 1)
        ]
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
};

export const HumidityChart = ({ site = "cut" }: { site?: string }) => {
  const sSeed = getStationSeed(site);
  const days = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      arr.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }
    return arr;
  }, []);
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(5, 17, 37, 0.95)',
      borderColor: '#22d3ee',
      textStyle: { color: '#fff', fontSize: 15 },
      axisPointer: { type: 'line' }
    },
    grid: { top: 30, left: 55, right: 60, bottom: 25 },
    xAxis: [{
      type: 'category',
      data: days,
      axisLabel: { color: '#ffffff', fontSize: 14 },
      axisLine: { lineStyle: { color: 'rgba(34, 211, 238, 0.2)' } }
    }],
    yAxis: [{
      type: 'value',
      min: 30,
      max: 70,
      interval: 10,
      axisLabel: { color: '#ffffff', fontSize: 14, formatter: '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(34, 211, 238, 0.05)' } }
    }],
    series: [
      {
        name: 'Humidity',
        type: 'line',
        smooth: true,
        lineStyle: { width: 2, color: '#0ea5e9' },
        itemStyle: { color: '#0ea5e9' },
        label: {
          show: true,
          position: 'top',
          color: '#ffffff',
          fontSize: 12,
          formatter: '{c}%'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(14, 165, 233, 0.25)' },
            { offset: 1, color: 'rgba(14, 165, 233, 0)' }
          ])
        },
        data: [
          getClientSeededValue(sSeed + 60, 48.5, 52.5, 1),
          getClientSeededValue(sSeed + 61, 48.5, 52.5, 1),
          getClientSeededValue(sSeed + 62, 48.5, 52.5, 1),
          getClientSeededValue(sSeed + 63, 48.5, 52.5, 1),
          getClientSeededValue(sSeed + 64, 48.5, 52.5, 1),
          getClientSeededValue(sSeed + 65, 48.5, 52.5, 1),
          getClientSeededValue(sSeed + 66, 48.5, 52.5, 1)
        ],
        markLine: {
          symbol: ['none', 'none'],
          label: {
            show: true,
            position: 'end',
            formatter: '{b}: {c}%',
            fontSize: 12,
            color: '#f59e0b'
          },
          lineStyle: {
            color: '#f59e0b',
            type: 'dashed',
            width: 1
          },
          data: [
            { yAxis: 45, name: 'Min' },
            { yAxis: 55, name: 'Max' }
          ]
        }
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
};

export const InlineTrendChart = ({ 
  title, 
  site = "cut",
  containerClassName = "w-full h-24 md:h-32",
  fontSize = 14,
  axisColor = '#94a3b8',
  textColor = '#ffffff'
}: { 
  title: string, 
  site?: string,
  containerClassName?: string,
  fontSize?: number,
  axisColor?: string,
  textColor?: string
}) => {
  const appData = useAppData();
  const isQuality = title === appData.labels.dashboards.cut.stats.materialYield;
  const finalContainerClassName = containerClassName === "w-full h-24 md:h-32" && isQuality ? "w-full h-36 md:h-48" : containerClassName;
  
  const isMaterial = title.includes("来料") || title.includes("材料") || title.includes("物料") || title === "料";
  const s = (site || "").toLowerCase();
  const isBonding = s === "bonding" || s === "bnd" || title.includes("Bonding") || title.includes("绑定");
  const isAssy = s === "assy" || s === "asy" || title.includes("ASSY") || title.includes("组装") || title.includes("Cell&POL");
  const sSeed = getStationSeed(site || title);

  const trendData = useMemo(() => {
    const data = [];
    const now = new Date();
    const days = 7;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      // Generate isolated trends per site and metric title
      let val = 100.0;
      if (isAssy && (isMaterial || isQuality)) {
        // 数据区间 99.00 - 100%
        const wave = (Math.sin(i * 1.4 + sSeed * 0.1) * Math.cos(i * 0.8 + 1.1) + 1) / 2;
        val = parseFloat((99.00 + wave * 1.00).toFixed(2));
      } else if (isBonding && (isMaterial || isQuality)) {
        // 数据分布在 99.90% - 99.92%
        const wave = (Math.sin(i * 1.5 + sSeed * 0.1) * Math.cos(i * 0.9 + 1.2) + 1) / 2;
        val = parseFloat((99.90 + wave * 0.02).toFixed(2));
      } else if (title === "来料合格率") {
        val = parseFloat((99.4 + ((Math.cos(i * 1.3 + sSeed * 0.1) + 1) / 2) * 0.4).toFixed(2));
      } else if (title === "来料良率" || isMaterial) {
        val = parseFloat((98.9 + ((Math.sin(i * 1.2 + sSeed * 0.15) + 1) / 2) * 0.7).toFixed(2));
      } else {
        val = 100.0;
      }
      data.push([dateStr, val]);
    }
    return data;
  }, [title, isMaterial, isQuality, sSeed, isBonding, isAssy]);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(5, 17, 37, 0.9)',
      borderColor: '#06b6d4',
      textStyle: { color: textColor, fontSize: 15 },
      formatter: (params: any) => {
        const p = params[0];
        return `
          <div style="font-family: monospace;">
             <div>${p.name}</div>
             <div style="color: #22d3ee; font-weight: bold;">${p.value[1]}%</div>
          </div>
        `;
      }
    },
    grid: { top: 15, left: fontSize >= 12 ? 55 : 38, right: 35, bottom: 20 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(34, 211, 238, 0.2)' } },
      axisLabel: { color: textColor, fontSize: fontSize },
      data: trendData.map(d => d[0])
    },
    yAxis: {
      type: 'value',
      min: isMaterial ? 95 : 90,
      max: 100,
      interval: isMaterial ? 1 : 2,
      splitLine: { lineStyle: { color: 'rgba(34, 211, 238, 0.05)' } },
      axisLine: { show: false },
      axisLabel: { color: textColor, fontSize: fontSize, formatter: '{value}%' }
    },
    series: [
      {
        name: title,
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: trendData,
        lineStyle: { width: 2, color: '#22d3ee' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(34, 211, 238, 0.2)' },
            { offset: 1, color: 'rgba(34, 211, 238, 0)' }
          ])
        },
        markLine: {
          symbol: ['none', 'none'],
          label: {
            show: true,
            position: 'end',
            formatter: isMaterial ? '98%' : '95%',
            fontSize: 12,
            color: '#38bdf8'
          },
          lineStyle: {
            color: '#38bdf8',
            type: 'dashed',
            width: 1
          },
          data: [
            { yAxis: isMaterial ? 98 : 95 }
          ]
        },
        animationDuration: 1000
      }
    ]
  };

  return (
    <div className={finalContainerClassName}>
       <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

const ATTENDANCE_MAP: Record<string, { value: number, actual: number, total: number }> = {
  get "IQC"() { return getAttendanceValueForDay("IQC", 0); },
  get "PFA"() { return getAttendanceValueForDay("PFA", 0); },
  get "偏贴"() { return this.PFA; },
  get "BONDING"() { return getAttendanceValueForDay("BONDING", 0); },
  get "绑定"() { return this.BONDING; },
  get "BND"() { return this.BONDING; },
  get "ASSY"() { return getAttendanceValueForDay("ASSY", 0); },
  get "组装"() { return this.ASSY; },
  get "CUT"() { return getAttendanceValueForDay("CUT", 0); },
  get "切割"() { return this.CUT; },
};

const DETECT_MAP: Record<string, { value: number, actual: number, total: number }> = {
  get "IQC"() { return getDetectionValueForDay("IQC", 0); },
  get "PFA"() { return getDetectionValueForDay("PFA", 0); },
  get "偏贴"() { return this.PFA; },
  get "BONDING"() { return getDetectionValueForDay("BONDING", 0); },
  get "绑定"() { return this.BONDING; },
  get "BND"() { return this.BONDING; },
  get "ASSY"() { return getDetectionValueForDay("ASSY", 0); },
  get "组装"() { return this.ASSY; },
  get "CUT"() { return getDetectionValueForDay("CUT", 0); },
  get "切割"() { return this.CUT; },
};

const getTrendTheme = (title: string) => {
  if (title === "人员要素" || title === "出勤率" || title.includes("人员") || title.includes("出勤")) {
    return {
      iconBg: "bg-cyan-500/10 border-cyan-500/30",
      iconColor: "text-white",
      subtitle: "车间操作人员考勤状态、等级认证与岗位资质实时监控"
    };
  }
  if (title === "设备要素" || title.includes("设备")) {
    return {
      iconBg: "bg-purple-500/10 border-purple-500/30",
      iconColor: "text-purple-400",
      subtitle: "高频气浮主轴跳动、真空吸盘负压及各传动轴运行健康度评估"
    };
  }
  if (title === "物料要素" || title === "来料良率" || title.includes("物料") || title.includes("来料")) {
    return {
      iconBg: "bg-emerald-500/10 border-emerald-500/30",
      iconColor: "text-emerald-400",
      subtitle: "来料良率波动、边缘崩缺度、表面平整度及批次一致性监控"
    };
  }
  if (title === "工艺法规" || title.includes("工艺") || title.includes("方法") || title.includes("法") || title.includes("法规")) {
    return {
      iconBg: "bg-amber-500/10 border-amber-500/30",
      iconColor: "text-amber-400",
      subtitle: "核心控制参数、温湿度参数、作业流程规范 SPC 偏离监控"
    };
  }
  if (title === "环境要素" || title.includes("环境") || title.includes("环")) {
    return {
      iconBg: "bg-teal-500/10 border-teal-500/30",
      iconColor: "text-teal-400",
      subtitle: "超净车间温度、湿度、压差、尘埃微粒粒子数分析"
    };
  }
  if (title === "总健康度得分" || title.includes("总健康度") || title.includes("系统得分") || title.includes("系统分") || title.includes("效能分")) {
    return {
      iconBg: "bg-emerald-500/10 border-emerald-500/30",
      iconColor: "text-emerald-400",
      subtitle: "人、机、料、法、环五要素多维度品质感知融合健康评分"
    };
  }
  if (title.includes("检出") || title.includes("合格") || title.includes("直通") || title.includes("检验")) {
    return {
      iconBg: "bg-indigo-500/10 border-indigo-500/30",
      iconColor: "text-indigo-400",
      subtitle: "产品检验拦截率、制程合格率等核心品质指标历史趋势分析"
    };
  }
  return {
    iconBg: "bg-cyan-500/10 border-cyan-500/30",
    iconColor: "text-white",
    subtitle: "生产关键指标综合运行走势及自适应波动监控"
  };
};

const getTrendIcon = (title: string, className = "w-6 h-6") => {
  if (title === "人员要素" || title === "出勤率" || title.includes("人员") || title.includes("出勤")) {
    return <Users className={className} />;
  }
  if (title === "设备要素" || title.includes("设备")) {
    return <Cpu className={className} />;
  }
  if (title === "物料要素" || title === "来料良率" || title.includes("物料") || title.includes("来料")) {
    return <Database className={className} />;
  }
  if (title === "工艺法规" || title.includes("工艺") || title.includes("方法") || title.includes("法") || title.includes("法规")) {
    return <ClipboardCheck className={className} />;
  }
  if (title === "环境要素" || title.includes("环境") || title.includes("环")) {
    return <Wind className={className} />;
  }
  if (title === "总健康度得分" || title.includes("总健康度") || title.includes("系统得分") || title.includes("系统分") || title.includes("效能分")) {
    return <Activity className={className} />;
  }
  if (title.includes("检出") || title.includes("合格") || title.includes("直通") || title.includes("检验")) {
    return <Eye className={className} />;
  }
  return <Activity className={className} />;
};

export const TrendModal = ({ isOpen, onClose, title, site = "cut" }: { isOpen: boolean, onClose: () => void, title: string, site?: string }) => {
  const chartRef = useRef<any>(null);

  const cleanTitle = title.startsWith("偏贴段") ? title.replace("偏贴段", "") : title;

  const isAttendance = title.includes("出勤") || title.includes("人员");
  const isDetection = title.includes("检出") || title.includes("合格") || title.includes("直通") || title.includes("检验");
  const isMaterialElement = title.includes("物料要素") || title === "料" || title === "物料";
  const isMaterial = (title.includes("来料") || title.includes("材料") || title.includes("物料") || title === "料") && !isMaterialElement;

  const s = (site || "").toLowerCase();
  const isAssy = s === "assy" || s === "asy" || title.includes("ASSY") || title.includes("组装") || title.includes("Cell&POL");
  const sSeed = getStationSeed(site || title);

  // Generate data - stabilized with useMemo
  const trendData = useMemo(() => {
    const data = [];
    const now = new Date();
    const days = title === "来料良率" ? 7 : 30;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      
      let val = 100.0;
      let actual: number = 0;
      let total: number = 0;

      if (isMaterial) {
        if (isAssy) {
          const wave = (Math.sin(i * 1.4 + sSeed * 0.1) * Math.cos(i * 0.8 + 1.1) + 1) / 2;
          val = parseFloat((99.00 + wave * 1.00).toFixed(2));
        } else {
          const factor = days === 7 ? 1.0 : 0.8;
          val = parseFloat((99.0 + ((Math.sin(i * factor) + 1) / 2) * 0.5).toFixed(2));
        }
      } else if (isMaterialElement) {
        val = 100.0;
      } else if (isAttendance) {
        const queryKey = title.includes("绑定") || title.toUpperCase().includes("BOND") ? "BONDING" : (site || title);
        const res = getAttendanceValueForDay(queryKey, i);
        val = res.value;
        actual = res.actual;
        total = res.total;
      } else if (isDetection) {
        const queryKey = title.includes("绑定") || title.toUpperCase().includes("BOND") ? "BONDING" : (site || title);
        const res = getDetectionValueForDay(queryKey, i);
        val = res.value;
        actual = res.actual;
        total = res.total;
      } else {
        val = 100.0;
      }

      data.push({
        value: [dateStr, val],
        actual,
        total
      });
    }
    return data;
  }, [isOpen, title]); // Re-generate when opened or title changes

  const option = {
    backgroundColor: 'transparent',
    title: {
      text: cleanTitle === "来料良率" ? `${cleanTitle} 近7天趋势` : `${cleanTitle} 近30天趋势`,
      left: 'center',
      textStyle: {
        color: '#22d3ee',
        fontSize: 14,
        fontWeight: 'bold',
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(5, 17, 37, 0.9)',
      borderColor: '#22d3ee',
      textStyle: { color: '#fff', fontSize: 15 },
      formatter: (params: any) => {
        const p = params[0];
        const dataItem = p.data;
        
        const isHealth = cleanTitle.includes("健康度") || cleanTitle.includes("要素") || cleanTitle.includes("总健康度") || cleanTitle === "总健康度得分" || cleanTitle.includes("系统得分") || cleanTitle.includes("效能") || cleanTitle.includes("系统分");
        if (cleanTitle === "来料良率" || isHealth) {
          return `
            <div style="font-family: monospace;">
              <div style="color: #94a3b8; margin-bottom: 4px;">${p.name}</div>
              <div style="display: flex; justify-content: space-between; gap: 20px;">
                <span>${cleanTitle}:</span>
                <span style="color: #22d3ee; font-weight: bold;">${p.value[1]}%</span>
              </div>
            </div>
          `;
        }

        const isAttendance = cleanTitle.includes("出勤") || cleanTitle.includes("人员");
        const unit = isAttendance ? "人" : (cleanTitle.includes("批") ? "批" : "pcs");
        const labelStr = isAttendance ? "实到/应到" : "合格/实验数量";
        
        return `
          <div style="font-family: monospace;">
            <div style="color: #94a3b8; margin-bottom: 4px;">${p.name}</div>
            <div style="display: flex; justify-content: space-between; gap: 20px;">
              <span>${cleanTitle}:</span>
              <span style="color: #22d3ee; font-weight: bold;">${p.value[1]}%</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 20px; font-size: 10px; margin-top: 2px; color: #67e8f9;">
              <span>${labelStr}:</span>
              <span>${dataItem.actual} / ${dataItem.total} ${unit}</span>
            </div>
          </div>
        `;
      }
    },
    grid: {
      top: 60,
      left: 45,
      right: 40,
      bottom: 40,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(34, 211, 238, 0.3)' } },
      axisLabel: { color: '#ffffff', fontSize: 16 },
      data: trendData.map(d => (d.value as any)[0])
    },
    yAxis: {
      type: 'value',
      min: (isMaterial || isDetection || isAttendance || title.includes("健康度") || title.includes("要素") || title === "总健康度得分" || title.includes("得分") || title.includes("分")) ? 95.0 : 90.0,
      max: 100,
      splitLine: { lineStyle: { color: 'rgba(34, 211, 238, 0.1)' } },
      axisLine: { show: false },
      axisLabel: { color: '#ffffff', fontSize: 16, formatter: '{value}%' }
    },
    series: [
      {
        name: cleanTitle,
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: trendData,
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#06b6d4' },
            { offset: 1, color: '#22d3ee' }
          ])
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(6, 182, 212, 0.3)' },
            { offset: 1, color: 'rgba(6, 182, 212, 0)' }
          ])
        },
        markLine: isMaterial ? {
          symbol: ['none', 'none'],
          label: {
            show: true,
            position: 'end',
            formatter: '98%',
            fontSize: 12,
            color: '#f87171'
          },
          lineStyle: {
            color: '#f87171',
            type: 'dashed',
            width: 1,
            opacity: 0.7
          },
          data: [
            { yAxis: 98 }
          ]
        } : undefined,
        emphasis: {
          focus: 'series',
        },
        animationDuration: 2000
      }
    ]
  };

  const themeClasses = getTrendTheme(cleanTitle);

  // Dynamic values for personnel details table
  const getAttendanceDetails = () => {
    const keys = Object.keys(ATTENDANCE_MAP);
    const matchedKey = keys.find(k => title.toUpperCase().includes(k) || (site && site.toUpperCase().includes(k))) || "CUT";
    return ATTENDANCE_MAP[matchedKey];
  };

  const getStationLabel = () => {
    if (title.toUpperCase().includes("IQC") || (site && site.toUpperCase().includes("IQC"))) return "IQC";
    if (title.includes("偏贴") || title.toUpperCase().includes("PFA") || (site && site.toUpperCase() === "PFA")) return "PFA";
    if (title.includes("绑定") || title.toUpperCase().includes("BOND") || (site && (site.toUpperCase().includes("BOND") || site.toUpperCase().includes("BND")))) return "BONDING";
    if (title.includes("组装") || title.toUpperCase().includes("ASSY") || (site && site.toUpperCase() === "ASSY")) return "ASSY";
    return "CUT";
  };

  const attendanceDetails = getAttendanceDetails();
  const keys = Object.keys(ATTENDANCE_MAP);
  const matchedKey = keys.find(k => title.toUpperCase().includes(k) || (site && site.toUpperCase().includes(k))) || "CUT";
  const count = attendanceDetails.total;
  const station = getStationLabel();

  const firstNames = ["刘", "王", "张", "李", "陈", "赵", "黄", "周", "吴", "徐", "孙", "胡", "朱", "高", "林", "何", "郭", "马", "罗", "梁", "宋", "郑", "谢", "韩", "唐", "冯", "董", "萧"];
  const names = Array.from({ length: count }, (_, idx) => {
    const firstName = firstNames[idx % firstNames.length];
    return `${firstName}某某`;
  });
  const grades = Array.from({ length: count }, (_, idx) => {
    if (idx % 8 === 0) return "Z6";
    return "Z5";
  });
  const certifications = Array.from({ length: count }, (_, idx) => {
    if (idx >= attendanceDetails.actual) return "请假";
    return "OK";
  });

  const stationsList = Array.from({ length: count }, () => station);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0a1526]/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="relative w-full max-w-5xl bg-[#102445] border border-cyan-500/40 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.3)] p-8 overflow-y-auto max-h-[90vh] cyber-scrollbar"
          >
            {/* Tech Decoration */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <div className="absolute top-0 right-0 p-4">
              <button 
                onClick={onClose}
                className="text-white hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Elegant Header with Icon & Theme-specific Background */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-cyan-500/20 mt-2">
              <div className={`p-3 rounded-xl border flex items-center justify-center ${themeClasses.iconBg}`}>
                {getTrendIcon(cleanTitle, "w-6 h-6")}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-wide">{cleanTitle}</h2>
                <p className="text-sm text-white/80 font-mono mt-0.5">{themeClasses.subtitle}</p>
              </div>
            </div>

            {/* Uniform height of h-[480px] across all modals including health rating popups */}
            <div className="h-[480px] w-full">
               <ReactECharts 
                 style={{ height: '100%', width: '100%' }} 
                 option={option} 
                 ref={chartRef}
               />
            </div>
            
            {isAttendance && !cleanTitle.includes("人员要素") && (
              <div className="mt-6 border border-cyan-500/30 rounded-lg p-4 bg-[#0a1931]/60">
                <div className="flex items-center gap-2 mb-3 border-b border-cyan-500/20 pb-2">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-base font-bold text-white font-mono tracking-wider">
                    人员等级认证与岗位资质明细 ({attendanceDetails.actual} / {attendanceDetails.total} 在岗)
                  </span>
                </div>
                
                {/* Scrollable Container */}
                <div className="overflow-x-auto cyber-scrollbar pb-2">
                  <table className="w-full text-center border-collapse text-base font-mono whitespace-nowrap">
                    <tbody>
                      {/* Row 1: 姓名 */}
                      <tr className="border-b border-cyan-500/10">
                        <td className="px-3 py-2.5 font-bold text-white bg-cyan-950/40 text-left sticky left-0 z-10 border-r border-cyan-500/20">
                          姓名
                        </td>
                        {names.map((name, idx) => (
                          <td key={idx} className="px-4 py-2.5 text-cyan-100 border-r border-cyan-500/10 hover:bg-cyan-500/10 transition-colors">
                            {name}
                          </td>
                        ))}
                      </tr>
                      {/* Row 2: 上岗站点 */}
                      <tr className="border-b border-cyan-500/10">
                        <td className="px-3 py-2.5 font-bold text-white bg-cyan-950/40 text-left sticky left-0 z-10 border-r border-cyan-500/20">
                          上岗站点
                        </td>
                        {stationsList.map((st, idx) => (
                          <td key={idx} className="px-4 py-2.5 text-white/80 border-r border-cyan-500/10">
                            {st}
                          </td>
                        ))}
                      </tr>
                      {/* Row 3: 等级信息 */}
                      <tr className="border-b border-cyan-500/10">
                        <td className="px-3 py-2.5 font-bold text-white bg-cyan-950/40 text-left sticky left-0 z-10 border-r border-cyan-500/20">
                          等级信息
                        </td>
                        {grades.map((grade, idx) => (
                          <td key={idx} className={`px-4 py-2.5 border-r border-cyan-500/10 font-black ${grade === 'Z6' ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)] bg-amber-500/5' : 'text-white'}`}>
                            {grade}
                          </td>
                        ))}
                      </tr>
                      {/* Row 4: 上岗证 */}
                      <tr>
                        <td className="px-3 py-2.5 font-bold text-white bg-cyan-950/40 text-left sticky left-0 z-10 border-r border-cyan-500/20">
                          上岗证
                        </td>
                        {certifications.map((cert, idx) => (
                          <td key={idx} className="px-4 py-2.5 border-r border-cyan-500/10">
                            <span className={`px-1.5 py-0.5 rounded text-base font-bold ${cert === 'OK' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border border-amber-500/30'}`}>
                              {cert}
                            </span>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {title === "总健康度得分" && (
              <CutHealthTree site={site} />
            )}

            {title === "IQC系统得分" && (
              <IqcHealthTree />
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/*
 * ==========================================
 * 💡 工业制程标准作业指导书 (SOP) 注册中心与放置配置指南
 * ==========================================
 * 
 * 【1. 标准文件如何放置？】
 * - 方式 A (JSON 静态配置 / 推荐高精度富媒体渲染)：
 *   直接在本文件下方的 `SOP_DOCUMENTS` 常量对象中，以文件名作为 key（如 "包装码垛规范.docx"）注册
 *   一个高结构化的 JSON 数据块。可以定制标题、编码、起草部门、审核人及任意页数的段落、列表、表格内容。
 * 
 * - 方式 B (物理文件放置 / 推荐 PDF 或 Word 直链下载)：
 *   在本工程的 `/public/docs/` 文件夹中创建专用目录，并将真实物理文件放置进去。
 *   例如：放置 `/public/docs/包装码垛规范.docx` 或 `/public/docs/包装码垛规范.pdf`。
 * 
 * 【2. 对应代码如何修改？】
 * - 若采用方式 A (JSON注册)：
 *   只需编辑或新增下方的 `SOP_DOCUMENTS` 成员。
 * 
 * - 若采用方式 B (物理文件直链下载)：
 *   修改下方的 `DocModal` 组件中 “导出 Word (DOCX)” 按钮的点击事件，使其直接打开或下载实际资源：
 *   `onClick={() => window.open(`/docs/${docName}`, '_blank')}`
 * 
 * - 若想在弹窗内直接显示真实的 PDF 或 Word iframe：
 *   修改下方的 `DocModal` 渲染逻辑，将 `doc.pages.map(...)` 部分替换为标准 iframe 标签：
 *   `<iframe src={`/docs/${docName}`} className="w-full h-[800px] border-none" />`
 */
const SOP_DOCUMENTS: Record<string, {
  title: string;
  code: string;
  dept: string;
  author: string;
  reviewer: string;
  date: string;
  level: string;
  pages: Array<{
    pageNum: number;
    pageTitle: string;
    sections: Array<{
      h: string;
      p: string;
      items?: string[];
      table?: { headers: string[]; rows: string[][] };
    }>;
  }>;
}> = {
  "切割规范.docx": {
    title: "液晶玻璃基板高精度分割标准作业指导书 (SOP)",
    code: "CUT-SOP-001",
    dept: "前段切割制造部",
    author: "林工艺主管",
    reviewer: "高高级经理",
    date: "2026/01/10",
    level: "受控机密 [LEVEL_3]",
    pages: [
      {
        pageNum: 1,
        pageTitle: "第一部分：目的、适用范围与人员资质管控",
        sections: [
          {
            h: "1.1 目的与规范背景",
            p: "本规程规范 TFT-LCD/OLED 液晶玻璃基板切割裂片工序的操作规范，保障良率，控制微型崩边（Chipping）及内应力微裂痕，防范贴合与热膨胀段微裂缝发生扩散。"
          },
          {
            h: "1.2 适用范围说明",
            p: "本作业指导书适用于 TFT 前端基板精密切割生产线，包含玻璃进料、红外偏光定位、超高精密机械切划线、气动机械分裂等核心作业段。操作人员必须取得 Z5 以上上岗等级证书。"
          }
        ]
      },
      {
        pageNum: 2,
        pageTitle: "第二部分：关键工艺参数与控制指标",
        sections: [
          {
            h: "2.1 关键控制参数标准",
            p: "切割采用 JD-CUTTER-V4 高精度自动切割机，配备伺服恒温刀头。主控参数标准如下：",
            table: {
              headers: ["控制项目", "标准设计值", "极限波动", "点检周期"],
              rows: [
                ["主轴切割速度 (Speed)", "240 mm/s", "±10 mm/s", "每班次点检"],
                ["下刀接触压力 (Pressure)", "4.2 N", "±0.2 N", "每4小时点检"],
                ["切入深度控制 (Depth)", "0.80 mm", "±0.05 mm", "连续在线监测"],
                ["金刚刀轮夹角", "110°", "±1.0°", "换刀时标定"]
              ]
            }
          },
          {
            h: "2.2 定位补偿与运行精度",
            p: "必须使用双路 CCD 偏光对齐相机，读取产品对角 Alignment Mark。系统补偿极限值：X/Y轴偏差必须控制在 ≤ ±1.0 微米内，高精度切割台平行度跳动偏差 ≤ 0.8 微米。"
          }
        ]
      },
      {
        pageNum: 3,
        pageTitle: "第三部分：标准步骤流程与操作细节",
        sections: [
          {
            h: "3.1 标准步骤流程",
            p: "生产线启动时，作业人员必须严格遵守以下标准化操作流程进行生产作业：",
            items: [
              "上料前点检：点检传送轨道气浮孔，采用气枪清理多孔卡盘表面，确保无任何微小玻璃纤维或颗粒浮尘。",
              "CCD 偏光定位：基板送入定位销，扫描基板对角 Mark 点，由系统自适应计算偏差补偿，对角线切入校准。",
              "真空吸附割线：刀架主轴以标准 240mm/s 移过执行割线，风刀配合负压同步吹走边缘浮屑，避免微观刮伤。",
              "气压软裂片：橡胶条下压，施加精准 1.8 Bar 面压力，使中位裂缝垂直下贯，实现基板精细、无崩边分离。"
            ]
          },
          {
            h: "3.2 异常拦截与闭环处置规范",
            p: "在任何生产时段，若自动检测单元发现微观崩边（Chipping）深度大于 10 μm，必须立即触发限速警报。当单次切割崩边大于 15 μm，视为 C 级废品缺陷，系统执行自动封锁（Lockdown），需停机检查刀具跳动。"
          }
        ]
      }
    ]
  },
  "安全手册.doc": {
    title: "高能激光修整与精密机械切削安全防护手册",
    code: "CUT-SAF-003",
    dept: "环安监督管理处 (EHS)",
    author: "张安全主任",
    reviewer: "陈环安总监",
    date: "2025/11/15",
    level: "高度机密 [LEVEL_4]",
    pages: [
      {
        pageNum: 1,
        pageTitle: "第一部分：设备危险源识别与危害特性评价",
        sections: [
          {
            h: "1.1 目的与危险源识别",
            p: "针对前段切割机组配装的 Class 4（4级）高能红外/纳秒级激光发生器，确立特种岗位防辐射与热灼伤控制红线。其直射或反射漫光均会对视网膜造成不可逆灼伤致盲。"
          },
          {
            h: "1.2 激光器安全指标与技术规格",
            p: "激光器最大输出功率 150W，波长 1064nm。设备在非操作状态下，出射孔快门必须处于硬物理关闭状态，防护挡罩的微型联锁触点需正常处于闭合阻断通路状态。"
          }
        ]
      },
      {
        pageNum: 2,
        pageTitle: "第二部分：强制性个人防护标准 (PPE) 规定",
        sections: [
          {
            h: "2.1 强制性个人防护标准 (PPE)",
            p: "所有作业及点检维护操作人员进入车间时，必须按以下标准穿戴全套特种个人防护用具：",
            items: [
              "特种防激光辐射护目镜：针对 1064nm 激光波段，光密度值（OD值）必须 ≥ 6.0 且拥有防辐射双层镜片认证。",
              "高密闭阻燃连体无尘服：拉链必须 100% 封闭，严禁裸露颈部与四肢，袖口必须与防护乳胶手套紧密贴合。",
              "防静电接地手环：进入机台一米警戒区内，必须佩戴静电腕带并接入地铜排，接地电阻需稳定在 1.0 MΩ (±10%)。"
            ]
          },
          {
            h: "2.2 车间准入限制与行为准则",
            p: "严禁任何未带防激光护目镜的人员跨越黄色安全线。进入激光器反射盲区进行维护时，必须由双人协同操作，在控制台插上物理安全挂锁（LOTO），防止误触射出强激光。"
          }
        ]
      },
      {
        pageNum: 3,
        pageTitle: "第三部分：硬件联锁、安全停机与应急程序",
        sections: [
          {
            h: "3.1 安全联锁开关控制说明",
            p: "切割腔体所有防护门配有双回路安全闭锁。若防护隔门在工作状态强行开启，激光器激励高压及伺服主轴需在 0.05 秒内硬件断路熔断。紧急情况发生必须在 0.1 秒内触发机台红色急停按钮（EMO）。"
          },
          {
            h: "3.2 紧急医疗急救响应规程",
            p: "若发生激光灼伤或机械挤压伤害，周围人员必须立刻击打 EMO 急停按钮使设备全面断电，并在 1 分钟内通知区域 EHS 安全主任，使用无菌敷料包扎伤口，迅速送往定点特种灼伤医院治疗。"
          }
        ]
      }
    ]
  },
  "保养标准.docx": {
    title: "切割精密气浮主轴轴承与真空吸附卡盘保养规范",
    code: "CUT-MNT-012",
    dept: "设备工程技术部",
    author: "王高级设备工程师",
    reviewer: "李设备总监",
    date: "2026/03/01",
    level: "受控文档 [LEVEL_2]",
    pages: [
      {
        pageNum: 1,
        pageTitle: "第一部分：保养周期计划与保养矩阵 (PM Matrix)",
        sections: [
          {
            h: "1.1 目的与基本要求",
            p: "保持高频气浮主轴在 24,000 RPM 运转下的径向及轴向偏振跳动控制在 ≤ 2μm 范围内，防止微孔吸盘因微屑阻滞刮划玻璃。维护周期必须遵循严格的矩阵点检计划。"
          },
          {
            h: "1.2 保养维护周期矩阵表",
            p: "主轴轴承、卡盘负压及相关丝杠轨道的日常与周维护计划明细如下：",
            table: {
              headers: ["点检及保养项目", "标准方法及润滑脂", "合格判断标准", "执行周期"],
              rows: [
                ["负压管路系统", "清理负压集料罐及管路真空密封", "≥ -15 kPa", "每日班前点检"],
                ["轴承露点点检", "测量高纯压缩空气干燥露点", "≤ -40 °C", "每日班前点检"],
                ["主轴副导轨注脂", "丝杠拭净，加注专用超净氟脂", "壳牌 2 号超净脂", "每周六保养"],
                ["刀轮累积计数", "监控金刚石刀刃及总切割行程", "≤ 20,000 刀次", "每周六保养"]
              ]
            }
          }
        ]
      },
      {
        pageNum: 2,
        pageTitle: "第二部分：精密多孔陶瓷吸附卡盘清洁规程",
        sections: [
          {
            h: "2.1 陶瓷卡盘清洁工具与材料",
            p: "由于吸附卡盘表面有大量微米级真空多孔陶瓷，普通揩拭布产生的纤维碎屑容易堵塞真空孔隙，必须100%采用无尘室专用纯聚酯纤维无尘布（Polyester Wiper），配合高纯度无水酒精或 IPA 溶剂擦拭。"
          },
          {
            h: "2.2 标准揩拭操作手法",
            p: "陶瓷卡盘专业清洁必须严格遵循以下标准清洁工艺：",
            items: [
              "无尘布折叠对折，吸取微量高纯 IPA 溶剂，抖动除去过量残留酒精。",
              "单向揩拭：必须采用单一方向平行缓慢揩拭，严禁反复划圈打磨或前后用力按压拉拽。",
              "压力控制：手部向下擦拭按压力严格控制在 1.5N ~ 2.0N 之间，防止卡座陶瓷受力偏心。",
              "气体吹扫：擦拭完毕后，开启卡盘反向正压排气吹扫 10 秒，吹出可能塞入微孔的浮游粒子。"
            ]
          }
        ]
      },
      {
        pageNum: 3,
        pageTitle: "第三部分：维护后测试片验证与交付复机标准",
        sections: [
          {
            h: "3.1 真空负压复位测试标准",
            p: "卡盘与主轴润滑保养完毕后，必须运行测试片。测试玻璃基板在完全吸附状态下，系统负压指示器在 1.5 秒内必须跌落至 -18 kPa 以下。若吸附负压不足 -15 kPa，严禁主轴启动划线。"
          },
          {
            h: "3.2 二级交付审批签字流程",
            p: "保养执行工程师完成纸质及 MES 系统电子点检打卡后，由区域设备副理或工艺二线工程师进行现场精度复测（主轴跳动 ≤ 1.5μm），共同在控制板解锁授权后，机台才可恢复正常量产状态。"
          }
        ]
      }
    ]
  },
  "流程图.docx": {
    title: "前段全自动切片、磨边及清洗线工序流程与品质卡规",
    code: "CUT-FLO-005",
    dept: "工艺制程技术部",
    author: "许高级制程工程师",
    reviewer: "张制造总监",
    date: "2026/02/18",
    level: "受控文档 [LEVEL_2]",
    pages: [
      {
        pageNum: 1,
        pageTitle: "第一部分：整线自动化工艺拓扑与节拍控制",
        sections: [
          {
            h: "1.1 目的与流程衔接说明",
            p: "规定上游玻璃大板进入磨腔切割后的工艺路径，确保粗切割、精磨边、超声波纯水清洗、以及最后光检（AOI）之间的无缝流转，杜绝堆料与机械卡阻。"
          },
          {
            h: "1.2 自动节拍（Takt Time）协同",
            p: "进料传送带控制节拍（TT）设为 45s，精密切割站划线耗时 38s，磨边处理 42s，多段式超声波去离子水清洗及红外烘干 40s。通过前后缓存站调节多工位负载，确保全线不因局部堵塞刮伤表面。"
          }
        ]
      },
      {
        pageNum: 2,
        pageTitle: "第二部分：制程品质控制点与工艺卡规",
        sections: [
          {
            h: "2.1 判定阶段、品质卡规与检测标准",
            p: "切割与磨边工序的在线品质检测卡规、检测项目及控制规格（Spec）明细如下：",
            table: {
              headers: ["判定阶段", "检查项目", "管制规格 (Spec)", "检测频次"],
              rows: [
                ["磨腔切割段", "微崩边/微碎屑程度", "≤ 4.5 μm", "每一批次抽样"],
                ["高速磨边段", "倒角倾斜角度与宽度", "0.12 ± 0.02 mm", "换砂轮时校准"],
                ["超声清洗后", "表面尘埃颗粒残留", "≤ 0.3 μm 粒子 0 个", "每班次测试片验证"],
                ["断面极谱仪", "裂片断面微裂应力分布", "≤ 5.0 MPa", "每日定时点检"]
              ]
            }
          },
          {
            h: "2.2 缺陷自动分流与 MES 联锁",
            p: "所有检测卡规均与 MES 工艺数据库相连。当 AOI 连续 3 片检测出崩边大于 6.0 μm，自动触发黄灯警告。当检出大于 12 μm 的致命缺角时，分流机械臂动作，将其送入返修区，不进入清洗网线。"
          }
        ]
      },
      {
        pageNum: 3,
        pageTitle: "第三部分：紧急异常 Lockdown 闭环操作规范",
        sections: [
          {
            h: "3.1 产线紧急闭环流程 (Lockdown)",
            p: "若发现微崩边（Chipping）超标，或机台有硬件漏气泄压异常，必须立即执行闭环：",
            items: [
              "立即暂停前端进料阀，将切割主轴速度调零，保护玻璃基板不受二次损伤。",
              "记录当前切割压力、真空吸附负压等关键参数至看板系统，封锁当前工单批次。",
              "手动卸载当前加工玻璃板，放入废料区并标记 Chipping 异常等级，待品质复核。",
              "报告工艺工程师及设备工程部进行换刀及卡盘表面无尘清洁作业，验证无偏析后解锁。"
            ]
          },
          {
            h: "3.2 流程变更与生效发布",
            p: "本流程卡规的所有微调及参数上限修正，必须通过工艺制程技术部、质量部、制造部的联合会签，形成规范文件修订版并执行在岗人员考评通关后，方可由系统管理员更新至MES数据库。"
          }
        ]
      }
    ]
  },
  "判定标准.doc": {
    title: "玻璃切面崩碎与微缺陷质量分级判定规范",
    code: "CUT-STD-024",
    dept: "质量管理稽查处 (QA)",
    author: "赵质量主任",
    reviewer: "张质量总监",
    date: "2026/04/12",
    level: "受控文档 [LEVEL_2]",
    pages: [
      {
        pageNum: 1,
        pageTitle: "第一部分：微观崩边(Chipping)与内划痕定义",
        sections: [
          {
            h: "1.1 缺陷检测基本术语",
            p: "规定玻璃基板大板切割断面产生的缺口、碎裂及浅表刮痕的物理尺寸表征方法。崩边宽度指沿基板表面向内凹陷的最大水平投影跨度；崩深指沿基板断面厚度垂直走向的最大缺陷深度。"
          },
          {
            h: "1.2 判定仪器及焦距配置",
            p: "侧边崩碎（Chipping）判定必须使用多轴极谱检测显微镜，对焦放大倍数必须恒定设定为 200 倍。使用冷光源侧向入射照明，以最清晰捕捉微晶断面解理纹路。"
          }
        ]
      },
      {
        pageNum: 2,
        pageTitle: "第二部分：缺陷品质分级判定矩阵",
        sections: [
          {
            h: "2.1 缺陷分类与品质分级判定矩阵",
            p: "不同切割断面和表面的微崩边、微缺陷的品质分级标准与处置界限如下表所示：",
            table: {
              headers: ["检测项目", "A级 (合格免检)", "B级 (偏振打磨后PASS)", "C级 (废品拦截报废)"],
              rows: [
                ["微观崩边跨度", "≤ 4.5 μm", "4.6 μm ~ 12.0 μm", "＞ 12.0 μm (强制废品)"],
                ["残余断裂应力", "≤ 4.0 MPa", "4.1 MPa ~ 5.0 MPa", "＞ 5.0 MPa (极易裂片)"],
                ["正面硬划伤深度", "0 μm (无划痕)", "≤ 0.05 μm 浅表擦伤", "＞ 0.05 μm (硬划深痕)"],
                ["卡盘尘粒残留", "≤ 0.3 μm 粒子 0 个", "0.3 μm ~ 1.0 μm 粒子", "＞ 1.0 μm (易磨划伤)"]
              ]
            }
          },
          {
            h: "2.2 自动在线极谱仪判定规程",
            p: "在线极谱仪利用干涉彩色条纹图像分析基板受压边缘的切变变形，通过双折射算法实时计算残余应力。应力值超过 5.0 MPa 时，边缘极易发生沿裂缝方向的脆性爆裂，系统强制卡扣拦截。"
          }
        ]
      },
      {
        pageNum: 3,
        pageTitle: "第三部分：不合格品控制、标记与溯源规程",
        sections: [
          {
            h: "3.1 不合格品处置步骤",
            p: "属于 B 等级的产品，由转接机械臂送至磨边抛光头。增加 0.08mm 深度磨削量，再次输入极谱测试仪；若二次检测仍未达到 A 级合格，则将其判定结果变更为 C 级废品并切断后续工位。"
          },
          {
            h: "3.2 品质闭环溯源与刀轮校准",
            p: "当一班次内 C 级报废率累积达到 0.35% 时，触发品质升级。工艺人员必须暂停整组切割线，对金刚石切片机主轴进行 X/Y/Z 三轴精密同轴校正，保证机械装配跳动 ≤ 1μm，方可继续开机作业。"
          }
        ]
      }
    ]
  },
  "5S准则.docx": {
    title: "ISO Class 5 超净切割工位日常 5S 管理规范标准",
    code: "CUT-S5S-008",
    dept: "精益生产推行委员会",
    author: "黄 5S 主任专员",
    reviewer: "张制造总监",
    date: "2026/05/20",
    level: "受控文档 [LEVEL_2]",
    pages: [
      {
        pageNum: 1,
        pageTitle: "第一部分：整理（Seiri）与整顿（Seiton）在百级车间的具体要求",
        sections: [
          {
            h: "1.1 整理 (Seiri) 净化车间执行红线",
            p: "超净室属于高精制造核心区域。严禁将一切非无尘文具、无尘本、纤维纸、纸板包装或普通橡皮等易产尘物品带入 ISO Class 5（百级）超净环境，无关工夹辅具在单班交接后必须一小时内清出警戒线。"
          },
          {
            h: "1.2 整顿 (Seiton) 工夹辅具定置管理标准",
            p: "切割刀架备用金刚石刀刃、精密百分表、高倍对准显微镜、陶瓷清洁刮刀等核心设备。必须严格安放在定制的双层硅胶定置抗震座内。任何工具平放、丢弃在卡盘上方或流道边缘，均扣减现场评级分。"
          }
        ]
      },
      {
        pageNum: 2,
        pageTitle: "第二部分：清扫（Seiso）与清洁（Seiketsu）操作规程与验收条件",
        sections: [
          {
            h: "2.1 保养清扫周期点检标准",
            p: "每个工作班次必须在交接前半小时停机进行定点 5S 清扫和清洁保养。执行细则标准如下表：",
            table: {
              headers: ["5S清扫工区", "清洁执行方法与要求", "清洁判定合格指标", "执行与点检周期"],
              rows: [
                ["陶瓷真空卡盘", "采用百级无尘布蘸 IPA 进行平行单向擦拭", "陶瓷卡盘无肉眼可见微粒尘埃", "每班次交接点检"],
                ["切刀导轨滑槽", "用防静电微型吸尘器抽吸缝隙玻璃粉末", "轨道表面无指纹油脂，传动顺畅", "每日开机前点检"],
                ["CCD 镜头表面", "使用除尘气球吹扫，专用镜头布单向轻抹", "相焦对焦清晰，Mark对齐偏差小", "每班次班前点检"],
                ["切削腔安全护罩", "无尘干抹布由上至下、自内向外拂拭", "无水渍指纹，防静电接地接地极稳定", "每周六 PM 保养"]
              ]
            }
          },
          {
            h: "2.2 洁净度肉眼自检标准 (High-beam Check)",
            p: "使用 200W 高亮点光源手电筒，呈 45 度角斜射盘面与传动轴。若发现反射干涉圈内有尘粒子或棉絮细丝，一律判定清洁不合格，班组必须当场全盘重擦，直至通过在线尘埃检测仪评估。"
          }
        ]
      },
      {
        pageNum: 3,
        pageTitle: "第三部分：素养（Shitsuke）与班组 5S 行为红线",
        sections: [
          {
            h: "3.1 行为自律与超净作业红线",
            p: "超净车间所有作业员必须严格管理行为规范。严禁在室内高声叫喊、大幅奔跑跳跃（避免大幅扰动层流气流）；佩戴手套后严禁触碰头部、防护服拉链及外露口罩，交接班交底单必须放在专用无尘不锈钢架上。"
          },
          {
            h: "3.2 现场 5S 考核矩阵与浮动绩效核算",
            p: "精益办日常考评实行 100 分制扣分制。任何工位单次得分低于 95 分，当期班组长在看板系统挂黄牌警示并立即进行现场重整；连续 3 次低于 95 分者，扣减个人及工区责任安全绩效系数 0.15 并在精益大会上公开反省。"
          }
        ]
      }
    ]
  }
};

export function getOrGenerateSopDocument(docName: string) {
  // Try to find if there is an exact key matched in SOP_DOCUMENTS
  const matchedKey = Object.keys(SOP_DOCUMENTS).find(key => docName.includes(key.split(".")[0]));
  if (matchedKey) {
    return SOP_DOCUMENTS[matchedKey];
  }

  // Otherwise, let's dynamically generate a highly professional multi-page document matching standard technical procedures!
  const cleanName = docName.replace(/\.docx|\.pdf/g, "");
  const code = `SOP-${cleanName.toUpperCase().includes("IQC") ? "IQC" : (cleanName.toUpperCase().includes("PFA") || cleanName.includes("偏贴") ? "PFA" : (cleanName.toUpperCase().includes("BONDING") || cleanName.includes("绑定") ? "BOND" : (cleanName.toUpperCase().includes("ASSY") || cleanName.includes("组装") ? "ASSY" : "GEN"))).substring(0, 4)}-${Math.floor(10000 + Math.random() * 90000)}`;
  const dept = cleanName.toUpperCase().includes("IQC") ? "IQC来料品质控制部" : (cleanName.toUpperCase().includes("PFA") || cleanName.includes("偏贴") ? "偏贴生产制造部" : (cleanName.toUpperCase().includes("BONDING") || cleanName.includes("绑定") ? "绑定生产制造部" : (cleanName.toUpperCase().includes("ASSY") || cleanName.includes("组装") ? "组装生产部" : "切割生产制造部")));
  const author = "工程部标准组";
  const reviewer = "品质控制委员会";
  const level = "机密 (Confidential)";
  const date = "2026-03-01";

  // Build 3 pages of highly professional content
  return {
    title: `${cleanName} 标准作业指导规程 (SOP)`,
    code,
    dept,
    author,
    reviewer,
    date,
    level,
    pages: [
      {
        pageNum: 1,
        pageTitle: "第一部分：受控技术流程与工艺参数标准 (Core Technical Process)",
        sections: [
          {
            h: "1.1 作业方法红线与基本规范原则",
            p: `本规程旨在明确和规范 ${cleanName} 工位作业的操作流程、核心技术参数与自律行为准则。在进入本工位前，操作员必须接受严格的等级资质评估与授权考核。严禁跨资质跨岗位进行关键设备调试或越权参数修改，严禁未经报备擅自调整任何核心受控工艺设定。`
          },
          {
            h: "1.2 核心制程控制参数 SPC 动态预警边界说明",
            p: "根据精益生产与六西格玛品质控制要求，本作业单元必须实时监控各工艺参数。具体控制限、警示限及反馈路径如下表所示。若监控指标偏离 LCL（控制下限）或 UCL（控制上限），系统将自动挂黄牌警示并通知值班工程师。",
            table: {
              headers: ["参数分类", "受控参数名称", "控制中心值 (CL)", "控制上限/下限 (UCL/LCL)", "异常纠正措施路径"],
              rows: [
                ["温度控制", "腔体恒温/点胶基板温度", "22.5 ℃", "25.0 ℃ / 20.0 ℃", "超出LCL需立即暂停送片并进行恒温系统自校准"],
                ["压力控制", "真空负压/层压恒温轴压", "0.65 MPa", "0.75 MPa / 0.55 MPa", "压力不足需检查气动回路与密封件，严禁带病作业"],
                ["定位控制", "CCD多点偏差/对位极限", "±3.0 um", "±5.0 um / -5.0 um", "连续三次对位偏差异常报警，必须人工重新标定基准面"],
                ["品质控制", "颗粒数 (0.1um微粒)/单点合格率", "0 pcs", "< 10 pcs", "超标必须立即执行5S定置清洗，复核层流风机转速"]
              ]
            }
          }
        ]
      },
      {
        pageNum: 2,
        pageTitle: "第二部分：过程点检、自主点检与质量拦截机制 (Inspection & Controls)",
        sections: [
          {
            h: "2.1 首件及末件强制确认控制卡规",
            p: "每班次开机前、更换大板批次及重大故障复查后，必须由操作人员、班组长及OQA巡检技术员共同执行首件确认。检验合格并在系统签字放行后，方能开启批量生产。班次结束前，必须保留末件作为对标保留样件，若末件不合格，当班批次所有制品一律退回暂存区进行逐片追溯。"
          },
          {
            h: "2.2 不良缺陷在线拦截分级与纠错预案",
            p: "品质控制拦截率为本工位终极质量关。操作员在执行过程中，必须对检出不良品进行高精度拦截：",
            items: [
              "A类严重缺陷（如裂片、气泡严重溢出）：立即按下工位侧边 EMO 红色紧急停机按钮，通报生产课长与品质部长，锁定前后2小时内生产的全部批次。",
              "B类一般缺陷（如轻微局部崩边、表面微尘等）：放入黄色异常物料盒，并在线记录缺陷坐标与AOI抓取图样，累积达 3 pcs 后必须挂黄牌整顿。",
              "C类轻微偏差（如不影响功能与装配的外观偏差）：置于指定工段复核架，由后段工艺工程师每天定时交班确认。"
            ]
          }
        ]
      },
      {
        pageNum: 3,
        pageTitle: "第三部分：班组 5S 清扫标准、定置管理与红线行为 (SOP 5S Rules)",
        sections: [
          {
            h: "3.1 行为自律与超净作业红线规程",
            p: "超净车间所有作业人员必须严格遵守超净房管理行为规范。在进入本操作岗位前，必须确认防静电服无尘清洗合格，佩戴防静电手套后严禁触碰头部、身体外露皮肤或拉链；工序交底单及看板记录夹必须一律放置于专用无尘不锈钢架上，保持极简极净。"
          },
          {
            h: "3.2 现场 5S 考核矩阵与浮动绩效核算准则",
            p: "精益品质办公室每日对工位执行 5S 定置巡检，实行百分制扣分管理。任何工位单次清扫得分低于 95 分，班组长需当场挂黄牌警示并立即进行全工序停机现场重整。连续 3 次不达标者，扣减个人及班组责任安全绩效系数 0.2 并全员公开通报反省。"
          }
        ]
      }
    ]
  };
}

export const DocModal = ({ isOpen, onClose, docName }: { isOpen: boolean, onClose: () => void, docName: string }) => {
  const [notifyMsg, setNotifyMsg] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [isDownloadPassModalOpen, setIsDownloadPassModalOpen] = useState(false);

  if (!isOpen) return null;

  const triggerNotify = (msg: string) => {
    setNotifyMsg(msg);
    setTimeout(() => setNotifyMsg(null), 2500);
  };

  const doc = getOrGenerateSopDocument(docName);
  const matchedKey = docName;

  // Map each document to its respective theme for beautiful visual decoration
  const getDocTheme = (key: string) => {
    if (key.includes("切割规范") || key.includes("切割")) {
      return {
        icon: <FileText className="w-5 h-5 text-blue-400" />,
        iconBg: "bg-blue-500/10 border-blue-500/30",
        iconColor: "text-blue-400",
        subtitle: "受控工艺 | 玻璃分裂操作参数与控制指标规程"
      };
    }
    if (key.includes("安全手册") || key.includes("安全")) {
      return {
        icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
        iconBg: "bg-red-500/10 border-red-500/30",
        iconColor: "text-red-400",
        subtitle: "受控安全 | 全防护穿戴、消防、化学品与紧急停机（EMO）规程"
      };
    }
    if (key.includes("保养标准") || key.includes("维护") || key.includes("保养")) {
      return {
        icon: <Wrench className="w-5 h-5 text-purple-400" />,
        iconBg: "bg-purple-500/10 border-purple-500/30",
        iconColor: "text-purple-400",
        subtitle: "受控设备 | 设备点检保养、零部件油脂加注与润滑复核标准"
      };
    }
    if (key.includes("流程图") || key.includes("流程")) {
      return {
        icon: <Clock className="w-5 h-5 text-amber-400" />,
        iconBg: "bg-amber-500/10 border-amber-500/30",
        iconColor: "text-amber-400",
        subtitle: "受控流向 | 品质控制工艺流向图、作业节点与流片卡控标准"
      };
    }
    if (key.includes("判定标准") || key.includes("判定") || key.includes("限度")) {
      return {
        icon: <ClipboardCheck className="w-5 h-5 text-emerald-400" />,
        iconBg: "bg-emerald-500/10 border-emerald-500/30",
        iconColor: "text-emerald-400",
        subtitle: "受控判定 | 来料检验、不良分级、崩边极限与废品判定准则"
      };
    }
    if (key.includes("5S准则") || key.includes("5S") || key.includes("清扫")) {
      return {
        icon: <Sparkles className="w-5 h-5 text-teal-400" />,
        iconBg: "bg-teal-500/10 border-teal-500/30",
        iconColor: "text-teal-400",
        subtitle: "受控整洁 | 超净车间整理、整顿、清洁与全员日常维护规范"
      };
    }
    return {
      icon: <FileText className="w-5 h-5 text-white" />,
      iconBg: "bg-cyan-500/10 border-cyan-500/30",
      iconColor: "text-white",
      subtitle: "工业智能制程管理 SOP 技术规程阅读器"
    };
  };

  const docTheme = getDocTheme(matchedKey);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0a1526]/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          className="relative w-full max-w-4xl bg-[#0e1b30] border border-cyan-500/30 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Top Word Processor Toolbar */}
          <div className="bg-[#0b1528] border-b border-cyan-500/20 px-6 py-4 flex items-center justify-between text-sm text-cyan-100 relative z-20">
            <div className="flex items-center gap-3">
              <div className={`p-2 border rounded-xl flex items-center justify-center ${docTheme.iconBg}`}>
                {docTheme.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white tracking-wide text-sm md:text-base">SOP Word 电子文档阅读器</span>
                <span className="text-xs text-cyan-100/70 font-mono font-medium tracking-wide">{docTheme.subtitle}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {notifyMsg && (
                  <motion.span 
                    initial={{ opacity: 0, x: 10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0 }}
                    className="text-[10px] text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded shadow-[0_0_8px_rgba(16,185,129,0.2)] font-mono"
                  >
                    {notifyMsg}
                  </motion.span>
                )}
              </AnimatePresence>
              
              <button 
                onClick={() => triggerNotify("✔ 正在与车间 01_SOP 打印终端进行连接并打印...")}
                className="flex items-center gap-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-white px-3 py-1.5 rounded border border-cyan-500/30 transition-all active:scale-95 text-[10px] md:text-xs font-bold"
              >
                <Printer className="w-3.5 h-3.5" /> 打印文档
              </button>
              
              <button 
                onClick={() => setIsDownloadPassModalOpen(true)}
                className="flex items-center gap-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-white px-3 py-1.5 rounded border border-cyan-500/30 transition-all active:scale-95 text-[10px] md:text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" /> 导出 Word (DOCX)
              </button>
              
              <button 
                onClick={onClose}
                className="text-white hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 💡 Collapsible Developer Integration Guide Panel inside View */}
          <div className="bg-[#0b1e35] border-b border-cyan-500/25 px-6 py-2.5 text-xs text-cyan-300 z-10">
            <div 
              className="flex items-center justify-between cursor-pointer select-none" 
              onClick={() => setShowGuide(!showGuide)}
            >
              <span className="flex items-center gap-2 font-bold font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                💡 开发者指南：标准文件如何放置与代码修改说明 (SOP File Integration Guide)
              </span>
              <span className="text-[10px] text-cyan-400 font-mono underline hover:text-cyan-200 transition-colors">
                {showGuide ? "收起指南 [COLLAPSE]" : "展开指南 [EXPAND]"}
              </span>
            </div>
            
            {showGuide && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 bg-[#0a1526]/90 border border-cyan-500/30 rounded-lg p-4 text-[11px] text-slate-300 space-y-3.5 leading-relaxed font-mono"
              >
                <div>
                  <strong className="text-cyan-400 text-xs block mb-1">Q1: 作业方法标准文件如何放置？</strong>
                  <p className="text-slate-400 pl-2">
                    有以下两种方式：
                    <br />
                    1. <strong className="text-white">【静态资源目录放置 - 推荐真实文件放这里】</strong>：你可以将实际的电子版 SOP 文件（如 <code>.docx</code>, <code>.pdf</code>, <code>.txt</code> 或网页等）直接存放在本工程的 <code>/public/docs/</code> 文件夹中。例如放置文件 <code>/public/docs/来料检验规范.docx</code>。
                    <br />
                    2. <strong className="text-white">【JSON数据中心注册 - 当前系统所用】</strong>：由于前端系统采用超高保真太空科幻暗色渲染和仿 Word 打印预览效果，当前系统中所有的 SOP 文档都以高结构化 JSON 对象的形式配置在 <code>src/App.tsx</code> 的 <code>SOP_DOCUMENTS</code> 全局变量中。未配置的文件由系统自动进行工业标准范本的动态生成。
                  </p>
                </div>
                
                <div>
                  <strong className="text-cyan-400 text-xs block mb-1">Q2: 后续需要修改该工位下的作业指导书内容，代码如何修改？</strong>
                  <p className="text-slate-400 pl-2">
                    你可以通过以下方式灵活修改代码与数据绑定：
                    <br />
                    1. <strong className="text-white">【修改JSON注册内容】</strong>：在 <code>src/App.tsx</code> 中，找到 <code>SOP_DOCUMENTS</code> 定义。直接在该常量下以文件名作为 key（如 <code>"来料检验规范.docx"</code>）新增或编辑其下的段落 <code>pages</code>、表格 <code>table</code> 与审核人等元数据。
                    <br />
                    2. <strong className="text-white">【修改"导出"及"下载"事件，提供真实文件下载】</strong>：当前 <code>DocModal</code> 中的 <strong>【导出 Word (DOCX)】</strong> 按钮触发的是事件模拟提示。若你已将物理文件放在 <code>/public/docs/</code> 中，可将导出按钮的点击事件修改为：
                    <br />
                    <code className="text-emerald-400 block bg-black/60 p-1.5 rounded my-1 text-[10px]">
                      {"onClick={() => window.open(`/docs/${docName}`, '_blank')}"}
                    </code>
                    3. <strong className="text-white">【使用原生 iframe/PDF 预览真实文档】</strong>：如果不采用当前的虚拟 Word 渲染器，想直接让浏览器展示真实的 PDF 或在线 Office 预览，可将下方的 <code>{"doc.pages.map(...)"}</code> 替换为 HTML5 <code>{"<iframe>"}</code> 标签：
                    <br />
                    <code className="text-emerald-400 block bg-black/60 p-1.5 rounded my-1 text-[10px]">
                      {"<iframe src={`/docs/${docName}`} className=\"w-full h-[800px] border-none\" />"}
                    </code>
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Scrollable Word Workspace containing beautifully spaced consecutive document pages */}
          <div className="flex-1 overflow-y-auto bg-[#070f1e] p-6 md:p-8 flex flex-col items-center gap-8 cyber-scrollbar select-text">
            {doc.pages.map((page, pIdx) => (
              <div key={pIdx} className="w-full max-w-3xl bg-white text-slate-800 p-8 md:p-12 shadow-[0_15px_40px_rgba(0,0,0,0.5)] rounded-sm border border-slate-300 font-sans leading-relaxed relative flex flex-col min-h-[950px] z-10 transition-all duration-200">
                
                {/* Page Header */}
                <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-6 text-[10px] text-slate-400 font-mono">
                  <span className="font-semibold">{doc.title} ({doc.code})</span>
                  <span>第 {page.pageNum} 页 / 共 {doc.pages.length} 页</span>
                </div>
                
                {/* Draft Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.02] z-0">
                  <span className="text-7xl font-black tracking-[0.2em] uppercase transform -rotate-45 border-4 border-slate-800 p-6">受控技术规程</span>
                </div>

                {/* Header info (Only on page 1) */}
                {pIdx === 0 && (
                  /* SOP Header Table */
                  <div className="border-2 border-slate-800 w-full mb-8 text-[11px] leading-tight font-sans z-10">
                    <div className="grid grid-cols-12 border-b-2 border-slate-800">
                      <div className="col-span-3 border-r-2 border-slate-800 p-3 flex flex-col justify-center items-center font-bold text-center bg-slate-50 text-slate-950">
                        <div className="text-[13px] tracking-wider font-black text-slate-950">液晶前段制造</div>
                        <div className="text-[9px] scale-90 font-bold mt-1 text-slate-500">TFT-LCD CO., LTD.</div>
                      </div>
                      <div className="col-span-6 border-r-2 border-slate-800 p-3 flex flex-col justify-center items-center text-center">
                        <h1 className="text-sm md:text-base font-black tracking-wider text-slate-900 leading-snug">{doc.title}</h1>
                        <span className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest font-semibold font-mono">Standard Operating Procedure</span>
                      </div>
                      <div className="col-span-3 p-3 flex flex-col justify-between font-mono text-[10px]">
                        <div><strong className="text-slate-500 font-sans">文件编号:</strong> {doc.code}</div>
                        <div className="border-t border-slate-300 mt-1.5 pt-1.5"><strong className="text-slate-500 font-sans">密级级别:</strong> <span className="font-bold text-red-600">{doc.level}</span></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-12">
                      <div className="col-span-3 border-r-2 border-slate-800 p-3">
                        <strong className="text-slate-500">起草部门:</strong> <span className="font-bold text-slate-800">{doc.dept}</span>
                      </div>
                      <div className="col-span-3 border-r-2 border-slate-800 p-3">
                        <strong className="text-slate-500">编制/起草:</strong> <span className="text-slate-700">{doc.author}</span>
                      </div>
                      <div className="col-span-3 border-r-2 border-slate-800 p-3">
                        <strong className="text-slate-500">审核批准:</strong> <span className="text-slate-700">{doc.reviewer}</span>
                      </div>
                      <div className="col-span-3 p-3">
                        <strong className="text-slate-500">生效日期:</strong> <span className="text-slate-900 font-bold font-mono">{doc.date}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Page Title */}
                <div className="mb-6">
                  <h2 className="text-base font-black text-slate-900 tracking-wider font-sans border-l-4 border-slate-800 pl-3">
                    {page.pageTitle}
                  </h2>
                </div>

                {/* Page Sections */}
                <div className="flex-1 text-[13px] text-slate-700 space-y-6 z-10">
                  {page.sections.map((section, sIdx) => (
                    <div key={sIdx}>
                      <h3 className="text-sm font-bold text-slate-900 border-b border-slate-300 pb-1.5 mb-2.5">{section.h}</h3>
                      <p className="indent-6 mb-3 text-justify text-[12px] text-slate-600 leading-relaxed">{section.p}</p>
                      
                      {section.table && (
                        <div className="my-4 overflow-x-auto">
                          <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                            <thead>
                              <tr className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                                {section.table.headers.map((hdr, hidx) => (
                                  <th key={hidx} className="border border-slate-300 p-2 text-slate-900 font-bold">{hdr}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {section.table.rows.map((row, ridx) => (
                                <tr key={ridx} className={ridx % 2 === 1 ? "bg-slate-50/50" : ""}>
                                  {row.map((cell, cidx) => (
                                    <td key={cidx} className="border border-slate-300 p-2 font-mono text-slate-700">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {section.items && (
                        <ul className="list-decimal pl-5 space-y-1.5 my-3 text-[12px] text-slate-600">
                          {section.items.map((item, iidx) => (
                            <li key={iidx} className="text-slate-700">{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                {/* Page Footer */}
                <div className="border-t border-slate-200 pt-3 mt-8 flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>受控安全文件 | 严禁外传拷贝</span>
                  <span>页面版本 V2.6 | 生效日期: {doc.date}</span>
                </div>
              </div>
            ))}
          </div>

          <FilePasswordModal
            isOpen={isDownloadPassModalOpen}
            fileName={`${doc.code}.docx`}
            onSuccess={(fileName) => triggerNotify(`✔ 已验证权限，已生成加密受控文档 ${fileName} 并启动下载...`)}
            onClose={() => setIsDownloadPassModalOpen(false)}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// CutDashboard moved to its own file

export default function App() {
  const [appData, setAppData] = useState<any>(appDataJson);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem("isLoggedIn") === "true");
  const [view, setView] = useState<string>('overview');
  const [showFlow, setShowFlow] = useState(false);
  const [isHoveredS01, setIsHoveredS01] = useState(false);
  const [isClosedLoopOpen, setIsClosedLoopOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [initialDpr, setInitialDpr] = useState(1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setInitialDpr(window.devicePixelRatio || 1);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const targetWidth = 1920;
      const targetHeight = 1080;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scaleX = viewportWidth / targetWidth;
      const scaleY = viewportHeight / targetHeight;
      const baseScale = Math.min(scaleX, scaleY);
      
      const currentDpr = window.devicePixelRatio || 1;
      const zoomFactor = currentDpr / (initialDpr || 1);
      
      setScale(baseScale * zoomFactor);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [initialDpr]);

  useEffect(() => {
    fetch("/appData.json")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && typeof data === "object") {
          setAppData(data);
        }
      })
      .catch(err => {
        console.warn("[AppData] 获取后端 appData.json 失败，平滑使用本地预设:", err);
        setAppData(appDataJson);
      });
  }, []);

  // Animation variants for the container to stagger children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0, scale: 0.9 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", damping: 15, stiffness: 100 }
    },
    exit: { y: 20, opacity: 0, scale: 0.95 }
  };

  // Compute PROCESS_STEPS based on data
  const PROCESS_STEPS = useMemo(() => {
    if (!appData) return [];
    return [
      { id: "iqc", label: appData.labels.process.steps.iqc, icon: IQCIcon, disabled: false },
      { id: "cut", label: appData.labels.process.steps.cut, icon: CUTIcon },
      { id: "pfa", label: appData.labels.process.steps.pfa, icon: PFAIcon },
      { id: "bonding", label: appData.labels.process.steps.bonding, icon: BONDINGIcon },
      { id: "assy", label: appData.labels.process.steps.assy, icon: ASSYIcon, disabled: false },
      { id: "oba", label: appData?.labels?.process?.steps?.oba || "OBA", icon: OBAIcon, disabled: false },
      { id: "ort", label: appData?.labels?.process?.steps?.ort || "ORT", icon: ORTIcon, disabled: false },
      { id: "shipping", label: appData.labels.process.steps.shipping || "Shipping", icon: SHIPPINGIcon },
      { id: "rma", label: appData?.labels?.process?.steps?.rma || "RMA", icon: RMAIcon, disabled: false },
    ];
  }, [appData]);

  if (loading || !appData) {
    return (
      <div className="w-screen h-screen bg-[#0a1526] flex flex-col items-center justify-center gap-6">
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
           className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full"
         />
         <div className="text-white font-mono tracking-[0.3em] animate-pulse">SYNCHRONIZING CORE DATA...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="w-screen h-screen flex bg-gray-900 overflow-auto cyber-scrollbar">
      <div
        style={{
          width: `${1920 * scale}px`,
          height: `${1080 * scale}px`,
          margin: 'auto',
          position: 'relative',
          flexShrink: 0
        }}
      >
        <div
          ref={wrapperRef}
          style={{
            width: '1920px',
            height: '1080px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            left: 0,
            top: 0,
          }}
        >
        <AnimatePresence>
        {isClosedLoopOpen && (
          <ClosedLoopManager 
            key={view}
            isOpen={isClosedLoopOpen} 
            onClose={() => setIsClosedLoopOpen(false)} 
            site={view}
          />
        )}
      </AnimatePresence>

      <AppDataContext.Provider value={appData}>
      <div className="w-[1920px] h-[1080px] overflow-hidden bg-[#0a1526] font-sans">
      <AnimatePresence mode="wait">
        {view === 'overview' ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-[1080px] w-[1920px] overflow-hidden text-white cursor-default"
            onClick={() => setShowFlow(false)}
          >
            {/* Background Image Layers: Fusion of AUO and Lenovo */}
            <div className="absolute inset-0 z-0 overflow-hidden">
               {/* Base AUO Factory Layer */}
               <div 
                 className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                 style={{ 
                   backgroundImage: `url('${appData.visuals.backgrounds.factory.url}')`,
                 }}
               />
               
               {/* 3x3 Grid Overlay Layer */}
               <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-20">
                  {/* Cell 3: Top Right - Lenovo Cloud Node */}
                  <div className="col-start-3 row-start-1 relative flex items-center justify-center p-12">
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1, x: 200 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="relative w-full h-full max-w-[600px] max-h-[400px] group"
                     >
                        {/* Sci-fi Glow Aura */}
                        <div 
                          className="absolute inset-0 opacity-40 blur-2xl bg-cyan-500/50 animate-pulse"
                          style={{
                            clipPath: "path('M 50,120 a 40,40 0 0,0 0,80 h 150 a 40,40 0 0,0 0,-80 a 35,35 0 0,0 -45,-40 a 55,55 0 0,0 -80,0 a 30,30 0 0,0 -25,40 z')",
                            transform: "scale(2.1)",
                            transformOrigin: "center"
                          }}
                        />
                        
                        <div 
                          className="relative w-full h-full"
                          style={{
                            clipPath: "path('M 50,120 a 40,40 0 0,0 0,80 h 150 a 40,40 0 0,0 0,-80 a 35,35 0 0,0 -45,-40 a 55,55 0 0,0 -80,0 a 30,30 0 0,0 -25,40 z')",
                            transform: "scale(2)",
                            transformOrigin: "center",
                            filter: "drop-shadow(0 0 20px rgba(6, 182, 212, 0.4))"
                          }}
                        >
                           <div 
                             className="absolute inset-0 bg-cover bg-no-repeat opacity-95 shadow-inner"
                             style={{ 
                               backgroundImage: `url('${appData.visuals.backgrounds.cloudNode.url}')`,
                               backgroundPosition: appData.visuals.backgrounds.cloudNode.offset, transform: 'translateX(-5%)'
                             }}
                           />
                           {/* Scanline Effect */}
                           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent h-1/2 w-full animate-scanline pointer-events-none" />
                           {/* Inner technical glow */}
                           <div className="absolute inset-0 bg-blue-500/10 mix-blend-screen" />
                        </div>

                        {/* Center Button - Lenovo Styled like S01 */}
                        <div className="absolute inset-0 pointer-events-auto" style={{ transform: "scale(2)", transformOrigin: "center" }}>
                           <div className="absolute" style={{ left: '132px', top: '150px', transform: 'translate(-50%, -50%) scale(0.5)' }}>
                              <motion.div 
                                whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open("https://www.lenovo.com.cn/", "_blank");
                                }}
                                whileTap={{ scale: 0.95 }}
                                className="relative group cursor-pointer"
                              >
                                 {/* Background Glow */}
                                 <motion.div 
                                   animate={{ opacity: [0.3, 0.6, 0.3] }}
                                   transition={{ duration: 4, repeat: Infinity }}
                                   className="absolute -inset-10 bg-cyan-500/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100"
                                 />
                                 
                                 {/* Main Rect */}
                                 <div className="relative w-48 h-20 bg-[#0a1a2f]/90 backdrop-blur-xl border border-cyan-400/60 rounded-xl flex flex-col items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.4)] overflow-hidden group-hover:border-cyan-300 transition-all duration-500">
                                    {/* Tech Deco */}
                                    <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-cyan-400" />
                                    <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-cyan-400" />
                                    <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-cyan-400" />
                                    <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-cyan-400" />
                                    
                                    {/* Scanning Beam */}
                                    <motion.div 
                                      animate={{ x: [-100, 100, -100] }}
                                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                      className="absolute inset-y-0 w-[1px] bg-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.8)] z-0"
                                    />
   
                                    <span className="relative z-10 text-xl font-bold text-cyan-50 group-hover:text-white tracking-[0.1em] transition-colors font-mono">
                                      {appData.labels.systemNodes.lenovoNode.title}
                                    </span>
                                    <span className="relative z-10 text-[9px] font-mono text-white/80 tracking-widest mt-1">
                                      {appData.labels.systemNodes.lenovoNode.subtitle}
                                    </span>
                                 </div>
                              </motion.div>
                           </div>
                        </div>

                        {/* HUD Elements (Sci-fi accents around the cloud) */}
                        <div className="absolute inset-0 pointer-events-none opacity-50">
                           <div className="absolute top-1/4 right-[10%] w-32 h-[1px] bg-cyan-400/50 shadow-[0_0_10px_cyan]" />
                           <div className="absolute bottom-1/4 left-[10%] w-32 h-[1px] bg-cyan-400/50 shadow-[0_0_10px_cyan]" />
                           <div className="absolute top-1/2 left-0 w-[1px] h-20 bg-cyan-400/50 shadow-[0_0_10px_cyan]" />
                           <div className="absolute top-1/2 right-0 w-[1px] h-20 bg-cyan-400/50 shadow-[0_0_10px_cyan]" />
                        </div>
                     </motion.div>
                  </div>
               </div>
               
               {/* Visual Fusion Overlays */}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/20 z-0" />

            </div>
            
            {/* Top Title Overlay */}
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-center pt-8 pointer-events-none">
              <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="pointer-events-auto flex items-center gap-4 px-10 py-4 relative"
              >
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#003366] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                  {appData.projectInfo.title}
                </h1>
                
                {/* Version List Button */}
                <div className="relative mt-2 md:mt-3 group">
                  <span className="cursor-pointer bg-cyan-950/90 border border-cyan-400 text-white font-mono text-[10px] md:text-xs font-bold px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)] hover:bg-cyan-400 hover:text-slate-950 transition-all duration-300">
                    v5.0
                  </span>
                  
                  {/* Floating Version History Popup */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-80 md:w-96 p-5 bg-[#102445]/95 backdrop-blur-xl border border-cyan-500/50 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.4)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none group-hover:pointer-events-auto">
                    {/* Corner decorative borders */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
                    
                    <div className="flex items-center gap-2 border-b border-cyan-500/30 pb-3 mb-4">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest font-mono">
                        System Optimization Log (系统版本更新日志)
                      </span>
                    </div>
                    
                    <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 cyber-scrollbar text-left">
                      {/* v5.0 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-cyan-400 font-mono">v5.0 (当前版本)</span>
                          <span className="text-[8px] bg-cyan-500/20 text-white px-1.5 py-0.5 rounded-full font-mono">ACTIVE</span>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-slate-100 space-y-1.5 pl-1">
                          <li><span className="text-cyan-300 font-bold">新增 S01 各站点健康度总览看板</span>：全景汇聚 S01 各道核心制程站点运行状态、健康指数评分与综合指标监控，打造一站式产线健康态势感知中枢。</li>
                          <li><span className="text-cyan-300 font-bold">上线 ORT 与 RMA 智联品质看板</span>：深度构建可靠性实验室（ORT）与售后质量返修（RMA）全周期监控大屏，打通测试数据、不良现象帕累托及返修趋势全景分析。</li>
                          <li><span className="text-cyan-300 font-bold">集成 OBA 检验与端到端质量闭环</span>：新增 OBA 出货检验看板，升级 8D / CAR 闭环追溯管理系统，实现从原料到售后的全流程品质把控。</li>
                          <li><span className="text-cyan-300 font-bold">全视口自适应与工业视觉重塑</span>：全看板升级全屏自适应布局，优化大屏双轴复合图表与动态折线渲染，呈现更加流畅沉浸的工业大屏体验。</li>
                        </ul>
                      </div>

                      {/* v4.3 */}
                      <div className="space-y-1 pt-2 border-t border-cyan-500/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white/80 font-mono">v4.3</span>
                          <span className="text-[8px] bg-cyan-500/10 text-white/50 px-1.5 py-0.5 rounded-full font-mono">HISTORIC</span>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-1 pl-1">
                          <li><span className="text-cyan-300/80 font-bold">上线 BONDING 与 ASSY 智能管理看板</span>：构建绑定（BND）与组装（ASY）车间数智化监控中枢，打通微米级对位精度与端到端良率趋势。</li>
                          <li><span className="text-cyan-300/80 font-bold">联动 AI Motion 2.0 智慧引擎</span>：无缝集成工业级智能助手与 AI Motion 2.0 平台快捷通道，实现跨系统智能协同。</li>
                          <li><span className="text-cyan-300/80 font-bold">交互体验与视觉美化升级</span>：重塑数字排版与赛博朋克光影质感，优化悬浮交互反馈与文字微排版。</li>
                        </ul>
                      </div>

                      {/* v4.2 */}
                      <div className="space-y-1 pt-2 border-t border-cyan-500/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white/80 font-mono">v4.2</span>
                          <span className="text-[8px] bg-cyan-500/10 text-white/50 px-1.5 py-0.5 rounded-full font-mono">HISTORIC</span>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-1 pl-1">
                          <li><span className="text-cyan-300/80 font-bold">新增 S02 厂区生产监控节点</span>：部署上线 S02 厂区监控网络，实现全厂全流程、全站点数据实时互联与品质动态追踪。</li>
                          <li><span className="text-cyan-300/80 font-bold">集成联想官网一键直达入口</span>：构建快捷云端协同通道，实现客户门户一键跳转，深化客户业务联动与合作粘性。</li>
                        </ul>
                      </div>

                      {/* v4.1 */}
                      <div className="space-y-1 pt-2 border-t border-cyan-500/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white/80 font-mono">v4.1</span>
                          <span className="text-[8px] bg-cyan-500/10 text-white/50 px-1.5 py-0.5 rounded-full font-mono">HISTORIC</span>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-1 pl-1">
                          <li><span className="text-cyan-300/80 font-bold">完善CUT界面功能与显示</span>：重塑智能切割工艺看板，优化切割压力、下刀量等多维参数与核心健康度树形追踪，带来更直观的精细化工艺监控体验。</li>
                          <li><span className="text-cyan-300/80 font-bold">开发PFA智能管理界面</span>：全新平展颗粒度、温湿度、极差与均值双轴控制图，打通机台动态核心指标，扩充相关智能诊断功能。</li>
                          <li><span className="text-cyan-300/80 font-bold">完成IQC与SHIPPING界面显示开发</span>：全链路打通物料来料品质与出货物流追踪的可视化大屏，完整闭环工厂端到端质量数据监控。</li>
                        </ul>
                      </div>

                      {/* v4.0 */}
                      <div className="space-y-1 pt-2 border-t border-cyan-500/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white/80 font-mono">v4.0</span>
                          <span className="text-[8px] bg-cyan-500/10 text-white/50 px-1.5 py-0.5 rounded-full font-mono">HISTORIC</span>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-1 pl-1">
                          <li>SUPER_QE 终端安全双因子准入认证机制</li>
                          <li>全新升级太空科幻暗色主题与极致微交互效果</li>
                        </ul>
                      </div>

                      {/* v3.9 */}
                      <div className="space-y-1 pt-2 border-t border-cyan-500/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white/80 font-mono">v3.9</span>
                          <span className="text-[8px] bg-cyan-500/10 text-white/50 px-1.5 py-0.5 rounded-full font-mono">HISTORIC</span>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-1 pl-1">
                          <li>集成 ECharts 动态折线和双轴良率产能趋势混合图表</li>
                          <li>对位精度偏差散点图向更实用的良率与产能复合看板平滑迁移</li>
                        </ul>
                      </div>

                      {/* v3.5 */}
                      <div className="space-y-1 pt-2 border-t border-cyan-500/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white/80 font-mono">v3.5</span>
                          <span className="text-[8px] bg-cyan-500/10 text-white/50 px-1.5 py-0.5 rounded-full font-mono">HISTORIC</span>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-1 pl-1">
                          <li>偏贴（COG/FOG）、压合（Bonding）及组装（Assy）多视口看板</li>
                          <li>全新开发多机台数据并行动态硬件数据模拟器</li>
                        </ul>
                      </div>

                      {/* v3.1 */}
                      <div className="space-y-1 pt-2 border-t border-cyan-500/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white/80 font-mono">v3.1</span>
                          <span className="text-[8px] bg-cyan-500/10 text-white/50 px-1.5 py-0.5 rounded-full font-mono">HISTORIC</span>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-1 pl-1">
                          <li>品质监控逻辑重构，优化 Cpk 品质监控核心算法</li>
                          <li>引入 3-Sigma 离散异常数据过滤，避免偶发噪声干扰</li>
                        </ul>
                      </div>
                      
                      {/* v3.0 */}
                      <div className="space-y-1 pt-2 border-t border-cyan-500/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white/80 font-mono">v3.0</span>
                          <span className="text-[8px] bg-cyan-500/10 text-white/50 px-1.5 py-0.5 rounded-full font-mono">HISTORIC</span>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-1 pl-1">
                          <li>组装段帕累托缺陷分析图表及高精度偏差算法重塑</li>
                          <li>AUO & Lenovo 联合孪生底座网络性能调优</li>
                        </ul>
                      </div>

                      {/* v2.0 */}
                      <div className="space-y-1 pt-2 border-t border-cyan-500/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white/80 font-mono">v2.0</span>
                          <span className="text-[8px] bg-cyan-500/10 text-white/50 px-1.5 py-0.5 rounded-full font-mono">HISTORIC</span>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-1 pl-1">
                          <li>数字流光视觉重建与全新界面微动特效交互</li>
                          <li>引入 ECharts 智能产能与生产一次合格率趋势图</li>
                        </ul>
                      </div>

                      {/* v1.7 */}
                      <div className="space-y-1 pt-2 border-t border-cyan-500/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white/80 font-mono">v1.7</span>
                          <span className="text-[8px] bg-cyan-500/10 text-white/50 px-1.5 py-0.5 rounded-full font-mono">HISTORIC</span>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-1 pl-1">
                          <li>增加双向流光炫酷线条渲染，实现链路连接动态化</li>
                          <li>各数据底座节点链路状态灯与真实系统同频闪烁</li>
                        </ul>
                      </div>

                      {/* v1.5 */}
                      <div className="space-y-1 pt-2 border-t border-cyan-500/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white/80 font-mono">v1.5</span>
                          <span className="text-[8px] bg-cyan-500/10 text-white/50 px-1.5 py-0.5 rounded-full font-mono">HISTORIC</span>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-1 pl-1">
                          <li>统一全局数据上下文，免除单独渲染耦合，提高订阅分发速度</li>
                        </ul>
                      </div>

                      {/* v1.1 */}
                      <div className="space-y-1 pt-2 border-t border-cyan-500/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white/80 font-mono">v1.1</span>
                          <span className="text-[8px] bg-cyan-500/10 text-white/50 px-1.5 py-0.5 rounded-full font-mono">HISTORIC</span>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-1 pl-1">
                          <li>支持客户端 SessionStorage 安全状态校验与登录自动重定向</li>
                        </ul>
                      </div>

                      {/* v1.0 */}
                      <div className="space-y-1 pt-2 border-t border-cyan-500/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white/80 font-mono">v1.0</span>
                          <span className="text-[8px] bg-cyan-500/10 text-white/50 px-1.5 py-0.5 rounded-full font-mono">INIT</span>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-1 pl-1">
                          <li>构建偏贴、压合、组装、检测等工业底座基础看板</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* S01 Status Indicator Overlay */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 100 }}
              className="absolute top-[44%] left-[24%] z-30 -translate-y-1/2 -translate-x-1/2 md:scale-125"
            >
              <div 
                className="relative group cursor-pointer"
                onMouseEnter={() => setIsHoveredS01(true)}
                onMouseLeave={() => setIsHoveredS01(false)}
                onClick={(e) => {
                  e.stopPropagation(); 
                  setShowFlow(true); 
                }}
              >
                {/* Subtle Scanning Grid / Background Glow */}
                <motion.div 
                  animate={{ 
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -inset-8 bg-cyan-500/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100"
                />
                
                {/* Main Rounded Rect Core */}
                <motion.div 
                  whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative w-28 h-20 bg-[#0a1a2f]/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.2)] overflow-hidden border transition-all duration-500 ${showFlow ? 'border-cyan-300 ring-2 ring-cyan-400/20' : 'border-cyan-400/50 hover:border-cyan-300'}`}
                >
                  {/* Tech Decoration: Corner brackets */}
                  <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-cyan-400" />
                  <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-cyan-400" />
                  <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-cyan-400" />
                  <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-cyan-400" />

                  {/* Inner Scanning Beam */}
                  <motion.div 
                    animate={{ x: [-60, 60, -60] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-y-0 w-[1px] bg-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.8)] z-0"
                  />

                  <span className="relative z-10 text-3xl font-bold text-cyan-100 group-hover:text-white drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] tracking-widest transition-colors font-mono">
                    {appData.labels.systemNodes.s01.id}
                  </span>
                </motion.div>
                
                {/* Hover Popover: Table of Stations Health (CUT, PFA, Bonding, ASSY - 4M1E + Total) */}
                <AnimatePresence>
                  {isHoveredS01 && <S01HealthPopover />}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* S02 Status Indicator Overlay (External Link) */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8, type: "spring", stiffness: 100 }}
              className="absolute top-[44%] left-[76%] z-10 -translate-y-1/2 -translate-x-1/2 md:scale-125"
            >
              <div 
                className="relative group cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation(); 
                  window.open("https://auolenovo.auo.com.cn/S02/lenovo.html", "_blank");
                }}
              >
                {/* Subtle Scanning Grid / Background Glow */}
                <motion.div 
                  animate={{ 
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -inset-8 bg-cyan-500/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100"
                />
                
                {/* Main Rounded Rect Core */}
                <motion.div 
                  whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-28 h-20 bg-[#0a1a2f]/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.2)] overflow-hidden border border-cyan-400/50 hover:border-cyan-300 transition-all duration-500"
                >
                  {/* Tech Decoration: Corner brackets */}
                  <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-cyan-400" />
                  <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-cyan-400" />
                  <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-cyan-400" />
                  <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-cyan-400" />

                  {/* Inner Scanning Beam */}
                  <motion.div 
                    animate={{ x: [-60, 60, -60] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-y-0 w-[1px] bg-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.8)] z-0"
                  />

                  {/* External Link Icon positioned above text without pushing S02 down */}
                  <ExternalLink className="absolute top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 text-cyan-300/80 group-hover:text-cyan-100 transition-colors z-10" />

                  <span className="relative z-10 text-3xl font-bold text-cyan-100 group-hover:text-white drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] tracking-widest transition-colors font-mono">
                    {appData.labels.systemNodes.s02?.id || "S02"}
                  </span>
                </motion.div>
                
                {/* Label Tooltip */}
                <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-[#0a1628]/90 border border-cyan-500/30 backdrop-blur-md text-xs py-1 px-3 rounded-md uppercase tracking-[0.2em] text-cyan-100 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl whitespace-nowrap">
                   {appData.labels.systemNodes.s02?.idleStatus || "点击打开S02生产流程监控"}
                </div>
              </div>
            </motion.div>

            {/* Bottom Process Flow Pipeline */}
            <AnimatePresence>
              {showFlow && (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute bottom-0 left-0 right-0 z-20 pb-12 px-6 md:px-12 bg-gradient-to-t from-black/60 to-transparent pt-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
                    {PROCESS_STEPS.map((step, index) => (
                      <div key={step.id + index} className="flex-1 flex items-stretch gap-2">
                        <motion.div 
                          variants={itemVariants}
                          className={`relative w-36 group ${step.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                          onClick={(e) => {
                            if (step.disabled) return;
                            e.stopPropagation();
                            console.log(`${step.id} clicked`);
                            setView(step.id);
                          }}
                        >
                          <div className={`h-[140px] relative bg-[#1a3a5f]/80 backdrop-blur-md hover:bg-[#254f7d]/80 border border-white/20 transition-all duration-300 py-6 px-4 rounded-xl flex flex-col items-center justify-center gap-2 shadow-2xl hover:shadow-white/40 hover:-translate-y-2 text-center group overflow-hidden ring-1 ring-cyan-500/30 overflow-visible ${step.disabled ? '' : 'hover:ring-2 hover:ring-white hover:ring-offset-2 hover:ring-offset-black/50 hover:cursor-pointer'}`}>
                            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-black text-xs font-black px-2 py-0.5 rounded-full ${step.disabled ? 'bg-gray-500 text-white' : 'bg-white animate-pulse'}`}>
                              {step.disabled ? "TBD" : appData.labels.interaction.canEnter}
                            </div>
                            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                              <step.icon className={`w-6 h-6 text-white group-hover:text-white transition-colors mx-auto ${step.disabled ? 'opacity-50' : ''}`} />
                            </div>
                            <span className="text-sm md:text-base font-bold tracking-widest text-white uppercase group-hover:text-white transition-colors">{step.label}</span>
                            
                            {!step.disabled && (
                              <div className="text-xs text-white/80 opacity-0 group-hover:opacity-100 transition-opacity mt-1 font-mono">
                                {appData.labels.interaction.clickToEnter}
                              </div>
                            )}
                          </div>
                        </motion.div>
                        
                        {/* Arrow Connector */}
                        {index < PROCESS_STEPS.length - 1 && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 + index * 0.15 }}
                            className="flex items-center"
                          >
                            <ArrowRight className="w-6 h-6 text-white/60" />
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            {view === 'cut' && <CutDashboard onBack={() => setView('overview')} onOpenClosedLoop={() => setIsClosedLoopOpen(true)} />}
            {view === 'iqc' && <IqcDashboard onBack={() => setView('overview')} onOpenClosedLoop={() => setIsClosedLoopOpen(true)} />}
            {view === 'pfa' && <PfaDashboard stepId="pfa1" title="PFA 偏贴制程智能看板" onBack={() => setView('overview')} onOpenClosedLoop={() => setIsClosedLoopOpen(true)} />}
            {view === 'bonding' && <BondingDashboard onBack={() => setView('overview')} onOpenClosedLoop={() => setIsClosedLoopOpen(true)} />}
            {view === 'assy' && <AssyDashboard onBack={() => setView('overview')} onOpenClosedLoop={() => setIsClosedLoopOpen(true)} />}
            {view === 'oba' && <ObaDashboard onBack={() => setView('overview')} onOpenClosedLoop={() => setIsClosedLoopOpen(true)} />}
            {view === 'ort' && <OrtDashboard onBack={() => setView('overview')} />}
            {view === 'rma' && <RmaDashboard onBack={() => setView('overview')} />}
            {view === 'shipping' && <ShippingDashboard onBack={() => setView('overview')} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
        </AppDataContext.Provider>
      </div>
    </div>
  </div>
  );
}
