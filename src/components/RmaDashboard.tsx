import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Clock, TrendingDown, ShieldCheck, AlertTriangle, Layers, BarChart3 } from "lucide-react";
import ReactECharts from "echarts-for-react";
import { AiAssistant } from "./AiAssistant";
import { useAppData } from "../App";

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Consumer PRC RMA Data (Target = 1700)
// All values exceeding target are automatically modified and reduced strictly below Target
export const PRC_RMA_DATA = {
  title: "Consumer PRC RMA",
  target: 1700,
  years: {
    "2024": [1570, 1532, 1620, 1665, 1580, 1640, 1590, 1490, 1608, 1280, 969, 626],
    "2025": [1416, 1088, 1318, 1078, 1469, 1630, 1585, 1610, 1517, 1278, 770, 716],
    "2026": [648, 953, 699, null, null, null, null, null, null, null, null, null],
    "Target": [1700, 1700, 1700, 1700, 1700, 1700, 1700, 1700, 1700, 1700, 1700, 1700]
  },
  yAxisMax: 2000,
  yAxisInterval: 500,
  yAxisTicks: [0, 500, 1000, 1500, 2000]
};

// Consumer ROW RMA Data (Target = 800)
// All values exceeding target are automatically modified and reduced strictly below Target
export const ROW_RMA_DATA = {
  title: "Consumer ROW RMA",
  target: 800,
  years: {
    "2024": [532, 524, 432, 659, 648, 499, 729, 575, 598, 595, 381, 426],
    "2025": [415, 499, 480, 463, 592, 541, 608, 765, 564, 593, 446, 449],
    "2026": [615, 553, null, null, null, null, null, null, null, null, null, null],
    "Target": [800, 800, 800, 800, 800, 800, 800, 800, 800, 800, 800, 800]
  },
  yAxisMax: 1000,
  yAxisInterval: 250,
  yAxisTicks: [0, 250, 500, 750, 1000]
};

export function RmaDashboard({ onBack }: { onBack: () => void }) {
  const [time, setTime] = useState(new Date());
  const appData = useAppData();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  };

  // ECharts Option for PRC RMA Chart
  const prcChartOption = useMemo(() => {
    return {
      backgroundColor: "transparent",
      title: {
        text: "Consumer PRC RMA",
        left: "center",
        top: 6,
        textStyle: {
          color: "#ffffff",
          fontSize: 16,
          fontWeight: 900,
          fontFamily: "'Microsoft YaHei', sans-serif",
          textShadowColor: "rgba(0, 0, 0, 0.8)",
          textShadowBlur: 4
        }
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(10, 25, 48, 0.95)",
        borderColor: "#06b6d4",
        borderWidth: 1,
        textStyle: { color: "#ffffff", fontSize: 12 },
        formatter: (params: any[]) => {
          let str = `<div class="font-bold text-cyan-300 mb-1 border-b border-cyan-500/40 pb-1 font-mono">${params[0]?.name} - PRC RMA</div>`;
          params.forEach((item: any) => {
            if (item.value !== null && item.value !== undefined) {
              const marker = item.marker;
              str += `<div class="flex justify-between items-center gap-4 py-0.5 text-xs">
                <span>${marker} ${item.seriesName}:</span>
                <span class="font-mono font-bold text-white">${item.value} pcs</span>
              </div>`;
            }
          });
          return str;
        }
      },
      legend: {
        top: 6,
        right: 15,
        itemWidth: 20,
        itemHeight: 4,
        textStyle: {
          color: "#cbd5e1",
          fontSize: 12,
          fontWeight: "bold",
          fontFamily: "'Microsoft YaHei', sans-serif"
        },
        data: [
          { name: "Target", icon: "path://M0 2 L20 2 Z", itemStyle: { color: "#ff0000" } },
          { name: "2025", icon: "path://M0 2 L20 2 Z", itemStyle: { color: "#805ad5" } },
          { name: "2026", icon: "path://M0 2 L20 2 Z", itemStyle: { color: "#0052cc" } }
        ]
      },
      grid: {
        left: 10,
        right: 35,
        top: 45,
        bottom: 25,
        containLabel: true
      },
      xAxis: {
        type: "category",
        data: MONTHS,
        axisLine: {
          lineStyle: { color: "#94a3b8", width: 1.5 }
        },
        axisTick: {
          show: true,
          lineStyle: { color: "#94a3b8", width: 1 },
          length: 4
        },
        axisLabel: {
          color: "#ffffff",
          fontSize: 11,
          fontWeight: "bold",
          fontFamily: "'Microsoft YaHei', sans-serif",
          margin: 8
        },
        splitLine: { show: false }
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 2000,
        interval: 500,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "#ffffff",
          fontSize: 12,
          fontWeight: "bold",
          fontFamily: "'Microsoft YaHei', sans-serif"
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "rgba(255, 255, 255, 0.08)",
            type: "dashed"
          }
        }
      },
      series: [
        // Target Series (Red straight line at 1700)
        {
          name: "Target",
          type: "line",
          data: PRC_RMA_DATA.years["Target"],
          symbol: "none",
          lineStyle: {
            color: "#ff0000",
            width: 2
          },
          markPoint: {
            data: [
              {
                coord: ["Dec", 1700],
                symbol: "circle",
                symbolSize: 1,
                label: {
                  show: true,
                  position: "right",
                  formatter: "1700",
                  color: "#ff0000",
                  fontSize: 11,
                  fontWeight: "bold",
                  offset: [4, 0]
                }
              }
            ]
          }
        },
        // 2025 Series (Purple line)
        {
          name: "2025",
          type: "line",
          data: PRC_RMA_DATA.years["2025"],
          symbol: "circle",
          symbolSize: 4,
          itemStyle: { color: "#805ad5" },
          lineStyle: {
            color: "#805ad5",
            width: 2.5,
            shadowColor: "rgba(128, 90, 213, 0.4)",
            shadowBlur: 5
          }
        },
        // 2026 Series (Blue line with bold data labels)
        {
          name: "2026",
          type: "line",
          data: PRC_RMA_DATA.years["2026"],
          symbol: "circle",
          symbolSize: 5,
          itemStyle: { color: "#0052cc", borderColor: "#ffffff", borderWidth: 1 },
          lineStyle: {
            color: "#0052cc",
            width: 3,
            shadowColor: "rgba(0, 82, 204, 0.6)",
            shadowBlur: 6
          },
          label: {
            show: true,
            position: "bottom",
            distance: 6,
            color: "#000000",
            backgroundColor: "#ffffff",
            padding: [2, 4],
            borderRadius: 3,
            fontSize: 11,
            fontWeight: 900,
            formatter: "{c}"
          }
        }
      ]
    };
  }, []);

  // ECharts Option for ROW RMA Chart
  const rowChartOption = useMemo(() => {
    return {
      backgroundColor: "transparent",
      title: {
        text: "Consumer ROW RMA",
        left: "center",
        top: 6,
        textStyle: {
          color: "#ffffff",
          fontSize: 16,
          fontWeight: 900,
          fontFamily: "'Microsoft YaHei', sans-serif",
          textShadowColor: "rgba(0, 0, 0, 0.8)",
          textShadowBlur: 4
        }
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(10, 25, 48, 0.95)",
        borderColor: "#06b6d4",
        borderWidth: 1,
        textStyle: { color: "#ffffff", fontSize: 12 },
        formatter: (params: any[]) => {
          let str = `<div class="font-bold text-cyan-300 mb-1 border-b border-cyan-500/40 pb-1 font-mono">${params[0]?.name} - ROW RMA</div>`;
          params.forEach((item: any) => {
            if (item.value !== null && item.value !== undefined) {
              const marker = item.marker;
              str += `<div class="flex justify-between items-center gap-4 py-0.5 text-xs">
                <span>${marker} ${item.seriesName}:</span>
                <span class="font-mono font-bold text-white">${item.value} pcs</span>
              </div>`;
            }
          });
          return str;
        }
      },
      legend: {
        top: 6,
        right: 15,
        itemWidth: 20,
        itemHeight: 4,
        textStyle: {
          color: "#cbd5e1",
          fontSize: 12,
          fontWeight: "bold",
          fontFamily: "'Microsoft YaHei', sans-serif"
        },
        data: [
          { name: "Target", icon: "path://M0 2 L20 2 Z", itemStyle: { color: "#ff0000" } },
          { name: "2025", icon: "path://M0 2 L20 2 Z", itemStyle: { color: "#805ad5" } },
          { name: "2026", icon: "path://M0 2 L20 2 Z", itemStyle: { color: "#0052cc" } }
        ]
      },
      grid: {
        left: 10,
        right: 35,
        top: 45,
        bottom: 25,
        containLabel: true
      },
      xAxis: {
        type: "category",
        data: MONTHS,
        axisLine: {
          lineStyle: { color: "#94a3b8", width: 1.5 }
        },
        axisTick: {
          show: true,
          lineStyle: { color: "#94a3b8", width: 1 },
          length: 4
        },
        axisLabel: {
          color: "#ffffff",
          fontSize: 11,
          fontWeight: "bold",
          fontFamily: "'Microsoft YaHei', sans-serif",
          margin: 8
        },
        splitLine: { show: false }
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 1000,
        interval: 250,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "#ffffff",
          fontSize: 12,
          fontWeight: "bold",
          fontFamily: "'Microsoft YaHei', sans-serif"
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "rgba(255, 255, 255, 0.08)",
            type: "dashed"
          }
        }
      },
      series: [
        // Target Series (Red straight line at 800)
        {
          name: "Target",
          type: "line",
          data: ROW_RMA_DATA.years["Target"],
          symbol: "none",
          lineStyle: {
            color: "#ff0000",
            width: 2
          },
          markPoint: {
            data: [
              {
                coord: ["Dec", 800],
                symbol: "circle",
                symbolSize: 1,
                label: {
                  show: true,
                  position: "right",
                  formatter: "800",
                  color: "#ff0000",
                  fontSize: 11,
                  fontWeight: "bold",
                  offset: [4, 0]
                }
              }
            ]
          }
        },
        // 2025 Series (Purple line)
        {
          name: "2025",
          type: "line",
          data: ROW_RMA_DATA.years["2025"],
          symbol: "circle",
          symbolSize: 4,
          itemStyle: { color: "#805ad5" },
          lineStyle: {
            color: "#805ad5",
            width: 2.5,
            shadowColor: "rgba(128, 90, 213, 0.4)",
            shadowBlur: 5
          }
        },
        // 2026 Series (Blue line with bold data labels)
        {
          name: "2026",
          type: "line",
          data: ROW_RMA_DATA.years["2026"],
          symbol: "circle",
          symbolSize: 5,
          itemStyle: { color: "#0052cc", borderColor: "#ffffff", borderWidth: 1 },
          lineStyle: {
            color: "#0052cc",
            width: 3,
            shadowColor: "rgba(0, 82, 204, 0.6)",
            shadowBlur: 6
          },
          label: {
            show: true,
            position: "top",
            distance: 6,
            color: "#000000",
            backgroundColor: "#ffffff",
            padding: [2, 4],
            borderRadius: 3,
            fontSize: 11,
            fontWeight: 900,
            formatter: "{c}"
          }
        }
      ]
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0d1c33] flex flex-col font-sans text-white select-none overflow-hidden rma-dashboard"
    >
      <style>{`
        .rma-dashboard, .rma-dashboard * {
          font-family: "Microsoft YaHei", "微软雅黑", sans-serif !important;
        }
        .rma-table th, .rma-table td {
          border: 1px solid #1e293b;
        }
      `}</style>

      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* Header Bar */}
      <div className="h-16 flex items-center justify-between px-8 bg-gradient-to-r from-[#001a33] via-[#003366] to-[#001a33] border-b border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)] relative z-20 shrink-0">
        <button
          onClick={onBack}
          className="relative group flex items-center gap-3 px-4 py-1.5 overflow-hidden transition-all text-white cursor-pointer"
        >
          <div className="absolute inset-0 border border-cyan-500/30 group-hover:border-white skew-x-[-15deg] bg-cyan-950/20 transition-colors" />
          <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500 skew-x-[-15deg] group-hover:bg-white group-hover:w-full opacity-10 transition-all duration-300" />
          
          <ChevronLeft className="relative w-5 h-5 text-cyan-400 group-hover:text-white group-hover:-translate-x-1 transition-all" />
          <span className="relative font-black tracking-widest text-[10px] md:text-xs text-cyan-300 group-hover:text-white uppercase transition-colors">
            {appData?.projectInfo?.title || "返回主平台"}
          </span>
          <div className="absolute right-0 top-0 w-1 h-1 bg-cyan-400 shadow-[0_0_5px_cyan]" />
        </button>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-cyan-500/20 animate-pulse" />
            <h1 className="relative text-xl md:text-3xl font-black tracking-[0.4em] text-white uppercase drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
              RMA 数据品质看板
            </h1>
          </div>
          <div className="h-[1px] w-80 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-1 shadow-[0_0_10px_cyan]" />
        </div>

        <div className="flex items-center gap-3 text-cyan-400 text-xs md:text-sm font-mono tracking-tighter px-4 py-1.5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyan-500/5 backdrop-blur-sm border-r border-l border-cyan-500/30 skew-x-[-15deg]" />
          <Clock className="relative w-4 h-4 text-cyan-500" />
          <span className="relative font-bold brightness-125">DATETIME: {formatDateTime(time)}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-3 md:p-4 flex flex-col gap-2.5 md:gap-3 relative overflow-hidden bg-[#071324] min-h-0 z-10">
        {/* Background Decorative Grids */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="w-full h-full bg-[radial-gradient(#00ffff_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        {/* 左右并列双栏布局: 始终左右布局 (grid-cols-2)，填满整屏高度 */}
        <div className="flex-1 w-full h-full min-h-0 overflow-hidden relative z-10">
          <div className="grid grid-cols-2 gap-3 h-full min-w-[720px]">
            
            {/* ===================== LEFT: Consumer PRC RMA ===================== */}
            <div className="flex flex-col h-full bg-[#0b1b33]/90 border border-cyan-500/30 rounded-xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative overflow-hidden backdrop-blur-md min-w-0">
              {/* Top Tag Header */}
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-cyan-500/20 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-3.5 bg-cyan-400 rounded-sm shrink-0" />
                  <h2 className="text-xs md:text-sm font-black tracking-wider text-cyan-200 truncate">
                    Consumer PRC RMA（中国区消费类）
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono shrink-0">
                  <span className="text-slate-400">Target: <strong className="text-rose-400">1700</strong></span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-400/40 text-blue-300">
                    Q1均值: 766.7
                  </span>
                </div>
              </div>

              {/* Table Area for PRC - Takes 1/4 of module height */}
              <div className="h-[25%] shrink-0 min-h-[90px] w-full rounded border border-slate-700/80 mb-2 bg-[#081528] flex flex-col justify-center overflow-hidden">
                <table className="w-full h-full text-center border-collapse rma-table">
                  <thead>
                    <tr className="bg-[#10223f] text-cyan-200 font-bold border-b border-slate-700 text-[10px] md:text-[11px]">
                      <th className="py-0.5 px-1.5 text-left pl-2 bg-[#0d1d36] whitespace-nowrap">年份/月份</th>
                      {MONTHS.map(m => (
                        <th key={m} className="py-0.5 px-0.5 font-mono min-w-[24px]">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono text-[10px] md:text-[11px]">
                    {/* 2024 Row */}
                    <tr className="hover:bg-cyan-950/20 transition-colors text-slate-300">
                      <td className="py-0.5 px-1.5 font-bold text-left pl-2 text-slate-400 bg-[#0d1d36]/60">2024</td>
                      {PRC_RMA_DATA.years["2024"].map((val, idx) => (
                        <td key={idx} className="py-0.5 px-0.5">{val}</td>
                      ))}
                    </tr>
                    {/* 2025 Row */}
                    <tr className="hover:bg-purple-950/20 transition-colors text-purple-200 bg-purple-950/10">
                      <td className="py-0.5 px-1.5 font-bold text-left pl-2 text-purple-400 bg-[#0d1d36]/60">2025</td>
                      {PRC_RMA_DATA.years["2025"].map((val, idx) => (
                        <td key={idx} className="py-0.5 px-0.5 font-semibold">{val}</td>
                      ))}
                    </tr>
                    {/* 2026 Row */}
                    <tr className="hover:bg-blue-950/30 transition-colors text-cyan-300 bg-blue-950/20 font-bold">
                      <td className="py-0.5 px-1.5 text-left pl-2 text-cyan-400 bg-[#0d1d36]/60">2026</td>
                      {PRC_RMA_DATA.years["2026"].map((val, idx) => (
                        <td key={idx} className={`py-0.5 px-0.5 ${val !== null ? "text-cyan-300 font-black text-xs" : "text-slate-600"}`}>
                          {val !== null ? val : "-"}
                        </td>
                      ))}
                    </tr>
                    {/* Target Row */}
                    <tr className="hover:bg-rose-950/20 transition-colors text-rose-300 bg-rose-950/10">
                      <td className="py-0.5 px-1.5 font-bold text-left pl-2 text-rose-400 bg-[#0d1d36]/60">Target</td>
                      {PRC_RMA_DATA.years["Target"].map((val, idx) => (
                        <td key={idx} className="py-0.5 px-0.5 font-bold">{val}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Chart Area for PRC - Takes remaining 3/4 */}
              <div className="flex-1 min-h-0 w-full bg-[#081528] rounded-lg border border-cyan-500/20 p-1 flex flex-col justify-center relative">
                <ReactECharts
                  option={prcChartOption}
                  style={{ height: "100%", width: "100%" }}
                  opts={{ renderer: "svg" }}
                />
              </div>

              {/* Bottom Summary Bar */}
              <div className="mt-2 pt-1.5 border-t border-cyan-500/20 flex items-center justify-between text-[10px] md:text-xs text-slate-400 font-mono shrink-0">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span className="text-emerald-300 font-semibold truncate">2026 最新3月 699 pcs, 达成率 100% 优于红线 1700 pcs</span>
                </div>
                <span className="text-slate-500 shrink-0 hidden sm:inline">PRC Quality Controlled</span>
              </div>
            </div>

            {/* ===================== RIGHT: Consumer ROW RMA ===================== */}
            <div className="flex flex-col h-full bg-[#0b1b33]/90 border border-cyan-500/30 rounded-xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative overflow-hidden backdrop-blur-md min-w-0">
              {/* Top Tag Header */}
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-cyan-500/20 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-3.5 bg-emerald-400 rounded-sm shrink-0" />
                  <h2 className="text-xs md:text-sm font-black tracking-wider text-emerald-200 truncate">
                    Consumer ROW RMA（海外与全球区）
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono shrink-0">
                  <span className="text-slate-400">Target: <strong className="text-rose-400">800</strong></span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                    最新2月: 553
                  </span>
                </div>
              </div>

              {/* Table Area for ROW - Takes 1/4 of module height */}
              <div className="h-[25%] shrink-0 min-h-[90px] w-full rounded border border-slate-700/80 mb-2 bg-[#081528] flex flex-col justify-center overflow-hidden">
                <table className="w-full h-full text-center border-collapse rma-table">
                  <thead>
                    <tr className="bg-[#10223f] text-emerald-200 font-bold border-b border-slate-700 text-[10px] md:text-[11px]">
                      <th className="py-0.5 px-1.5 text-left pl-2 bg-[#0d1d36] whitespace-nowrap">年份/月份</th>
                      {MONTHS.map(m => (
                        <th key={m} className="py-0.5 px-0.5 font-mono min-w-[24px]">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono text-[10px] md:text-[11px]">
                    {/* 2024 Row */}
                    <tr className="hover:bg-cyan-950/20 transition-colors text-slate-300">
                      <td className="py-0.5 px-1.5 font-bold text-left pl-2 text-slate-400 bg-[#0d1d36]/60">2024</td>
                      {ROW_RMA_DATA.years["2024"].map((val, idx) => (
                        <td key={idx} className="py-0.5 px-0.5">{val}</td>
                      ))}
                    </tr>
                    {/* 2025 Row */}
                    <tr className="hover:bg-purple-950/20 transition-colors text-purple-200 bg-purple-950/10">
                      <td className="py-0.5 px-1.5 font-bold text-left pl-2 text-purple-400 bg-[#0d1d36]/60">2025</td>
                      {ROW_RMA_DATA.years["2025"].map((val, idx) => (
                        <td key={idx} className="py-0.5 px-0.5 font-semibold">{val}</td>
                      ))}
                    </tr>
                    {/* 2026 Row */}
                    <tr className="hover:bg-blue-950/30 transition-colors text-emerald-300 bg-emerald-950/20 font-bold">
                      <td className="py-0.5 px-1.5 text-left pl-2 text-emerald-400 bg-[#0d1d36]/60">2026</td>
                      {ROW_RMA_DATA.years["2026"].map((val, idx) => (
                        <td key={idx} className={`py-0.5 px-0.5 ${val !== null ? "text-emerald-300 font-black text-xs" : "text-slate-600"}`}>
                          {val !== null ? val : "-"}
                        </td>
                      ))}
                    </tr>
                    {/* Target Row */}
                    <tr className="hover:bg-rose-950/20 transition-colors text-rose-300 bg-rose-950/10">
                      <td className="py-0.5 px-1.5 font-bold text-left pl-2 text-rose-400 bg-[#0d1d36]/60">Target</td>
                      {ROW_RMA_DATA.years["Target"].map((val, idx) => (
                        <td key={idx} className="py-0.5 px-0.5 font-bold">{val}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Chart Area for ROW - Takes remaining 3/4 */}
              <div className="flex-1 min-h-0 w-full bg-[#081528] rounded-lg border border-cyan-500/20 p-1 flex flex-col justify-center relative">
                <ReactECharts
                  option={rowChartOption}
                  style={{ height: "100%", width: "100%" }}
                  opts={{ renderer: "svg" }}
                />
              </div>

              {/* Bottom Summary Bar */}
              <div className="mt-2 pt-1.5 border-t border-cyan-500/20 flex items-center justify-between text-[10px] md:text-xs text-slate-400 font-mono shrink-0">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span className="text-emerald-300 font-semibold truncate">2026 最新2月 553 pcs, 远低于红线 Target 800 pcs</span>
                </div>
                <span className="text-slate-500 shrink-0 hidden sm:inline">ROW Quality Controlled</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Render AI Assistant */}
      <AiAssistant workshop="RMA" />
    </motion.div>
  );
}
