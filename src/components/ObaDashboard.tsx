import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Clock, ShieldCheck, TrendingUp, PackageCheck } from "lucide-react";
import ReactECharts from "echarts-for-react";
import { AiAssistant } from "./AiAssistant";
import { useAppData } from "../App";

export interface ObaRecord {
  no: number;
  month: string;
  shipping: number;
  oba: number;
  ratio: number;
}

export const OBA_DATA: ObaRecord[] = [
  { no: 1, month: "202601", shipping: 580181, oba: 86965, ratio: 15.0 },
  { no: 2, month: "202602", shipping: 303359, oba: 88444, ratio: 29.2 },
  { no: 3, month: "202603", shipping: 781824, oba: 77923, ratio: 10.0 },
  { no: 4, month: "202604", shipping: 367952, oba: 45690, ratio: 12.4 },
  { no: 5, month: "202605", shipping: 392248, oba: 62658, ratio: 16.0 },
  { no: 6, month: "202606", shipping: 430191, oba: 76969, ratio: 17.9 },
  { no: 7, month: "202607", shipping: 434487, oba: 74753, ratio: 17.2 },
  { no: 8, month: "202608", shipping: 192564, oba: 35878, ratio: 18.6 },
];

export function ObaDashboard({ onBack }: { onBack: () => void; onOpenClosedLoop?: () => void }) {
  const appData = useAppData();
  const [time, setTime] = useState(new Date());
  const [selectedMonthHighlight, setSelectedMonthHighlight] = useState<string | null>(null);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    return `${y}/${m}/${d} ${h}:${min}:${s}`;
  };

  // Aggregate Metrics
  const totalShipping = useMemo(() => OBA_DATA.reduce((acc, r) => acc + r.shipping, 0), []);
  const totalOba = useMemo(() => OBA_DATA.reduce((acc, r) => acc + r.oba, 0), []);
  const overallRatio = useMemo(() => (totalShipping > 0 ? (totalOba / totalShipping) * 100 : 0), [totalShipping, totalOba]);

  // Dual Y-Axis ECharts configuration matching Attachment 2 (Lenovo OBA ratio)
  const chartOption = useMemo(() => {
    const months = OBA_DATA.map(d => d.month);
    const shippingValues = OBA_DATA.map(d => d.shipping);
    const obaValues = OBA_DATA.map(d => d.oba);
    const ratioValues = OBA_DATA.map(d => d.ratio);

    return {
      backgroundColor: "transparent",
      title: {
        text: "Lenovo OBA Ratio",
        left: "center",
        top: 8,
        textStyle: {
          color: "#e2e8f0",
          fontSize: 18,
          fontWeight: "bold",
          fontFamily: '"Microsoft YaHei", sans-serif'
        }
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          crossStyle: {
            color: "#94a3b8"
          }
        },
        backgroundColor: "rgba(7, 19, 36, 0.95)",
        borderColor: "rgba(6, 182, 212, 0.6)",
        borderWidth: 1,
        textStyle: {
          color: "#ffffff",
          fontSize: 12
        },
        formatter: (params: any[]) => {
          let str = `<div style="font-weight:bold;margin-bottom:4px;color:#38bdf8;">月份: ${params[0]?.name}</div>`;
          params.forEach(item => {
            const val = item.seriesName === "Ratio" ? `${item.value.toFixed(1)}%` : Number(item.value).toLocaleString() + " pcs";
            str += `<div style="display:flex;justify-content:space-between;gap:16px;margin:2px 0;">
              <span style="color:${item.color}">${item.marker} ${item.seriesName}:</span>
              <span style="font-weight:bold;font-family:monospace;">${val}</span>
            </div>`;
          });
          return str;
        }
      },
      legend: {
        data: ["Shipping", "OBA", "Ratio"],
        bottom: 5,
        left: "center",
        itemGap: 24,
        textStyle: {
          color: "#94a3b8",
          fontSize: 12
        }
      },
      grid: {
        top: 60,
        left: 80,
        right: 80,
        bottom: 55,
        containLabel: false
      },
      xAxis: [
        {
          type: "category",
          data: months,
          axisPointer: {
            type: "shadow"
          },
          axisLine: {
            lineStyle: {
              color: "#334155"
            }
          },
          axisLabel: {
            color: "#94a3b8",
            fontSize: 12,
            fontFamily: "monospace"
          }
        }
      ],
      yAxis: [
        {
          type: "value",
          name: "",
          min: 0,
          max: 900000,
          interval: 100000,
          axisLine: {
            show: true,
            lineStyle: {
              color: "#334155"
            }
          },
          splitLine: {
            lineStyle: {
              color: "rgba(51, 65, 85, 0.4)",
              type: "solid"
            }
          },
          axisLabel: {
            color: "#94a3b8",
            fontSize: 11,
            fontFamily: "monospace",
            formatter: (val: number) => val.toString()
          }
        },
        {
          type: "value",
          name: "",
          min: 0,
          max: 35.0,
          interval: 5.0,
          axisLine: {
            show: true,
            lineStyle: {
              color: "#334155"
            }
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            color: "#94a3b8",
            fontSize: 11,
            fontFamily: "monospace",
            formatter: "{value}.0%"
          }
        }
      ],
      series: [
        {
          name: "Shipping",
          type: "bar",
          data: shippingValues,
          barMaxWidth: 30,
          itemStyle: {
            color: "#3b82f6",
            borderRadius: [2, 2, 0, 0]
          }
        },
        {
          name: "OBA",
          type: "bar",
          data: obaValues,
          barMaxWidth: 30,
          itemStyle: {
            color: "#ea580c",
            borderRadius: [2, 2, 0, 0]
          }
        },
        {
          name: "Ratio",
          type: "line",
          yAxisIndex: 1,
          data: ratioValues,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: {
            color: "#94a3b8",
            width: 3
          },
          itemStyle: {
            color: "#94a3b8"
          },
          label: {
            show: true,
            position: "top",
            formatter: (params: any) => `${Number(params.value).toFixed(1)}%`,
            color: "#f8fafc",
            fontSize: 11,
            fontWeight: "bold",
            fontFamily: "monospace"
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
      className="fixed inset-0 z-50 bg-[#0d1c33] flex flex-col font-sans text-white overflow-hidden oba-dashboard"
    >
      <style>{`
        .oba-dashboard, .oba-dashboard * {
          font-family: "Microsoft YaHei", "微软雅黑", sans-serif !important;
        }
      `}</style>

      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* Header */}
      <div className="h-16 flex items-center justify-between px-8 bg-gradient-to-r from-[#001a33] via-[#003366] to-[#001a33] border-b border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)] relative z-20">
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
              OBA检验品质看板
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
      <div className="flex-1 p-6 flex flex-col gap-4 relative overflow-hidden bg-[#0a1526] min-h-0 z-10">
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <motion.div 
            animate={{ y: ["0%", "100%", "0%"] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent blur-xl"
          />
        </div>

        {/* Top Summary Metrics Strip (3 Cards) */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 relative z-10 shrink-0">
          {/* Total Shipping */}
          <div className="bg-gradient-to-br from-[#112240]/90 to-[#0b172a]/95 border border-cyan-500/30 rounded-xl p-3 md:p-4 flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <div>
              <div className="text-[11px] md:text-xs text-cyan-300/80 font-medium">累计出货总量</div>
              <div className="text-lg md:text-2xl font-black font-mono text-cyan-200 mt-0.5 md:mt-1 tracking-wider">
                {totalShipping.toLocaleString()} <span className="text-[10px] md:text-xs font-normal text-slate-400 font-sans">pcs</span>
              </div>
            </div>
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <PackageCheck className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>

          {/* Total OBA */}
          <div className="bg-gradient-to-br from-[#112240]/90 to-[#0b172a]/95 border border-orange-500/30 rounded-xl p-3 md:p-4 flex items-center justify-between shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            <div>
              <div className="text-[11px] md:text-xs text-orange-300/80 font-medium">累计OBA数量</div>
              <div className="text-lg md:text-2xl font-black font-mono text-orange-400 mt-0.5 md:mt-1 tracking-wider">
                {totalOba.toLocaleString()} <span className="text-[10px] md:text-xs font-normal text-slate-400 font-sans">pcs</span>
              </div>
            </div>
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg bg-orange-500/15 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>

          {/* Overall Ratio */}
          <div className="bg-gradient-to-br from-[#112240]/90 to-[#0b172a]/95 border border-emerald-500/30 rounded-xl p-3 md:p-4 flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <div>
              <div className="text-[11px] md:text-xs text-emerald-300/80 font-medium">平均OBA比例</div>
              <div className="text-lg md:text-2xl font-black font-mono text-emerald-400 mt-0.5 md:mt-1 tracking-wider">
                {overallRatio.toFixed(2)}%
              </div>
            </div>
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </div>

        {/* Dashboard Main Body: Direct 3-column Grid strictly aligned with Top 3 Metric Cards */}
        <div className="flex-1 grid grid-cols-3 gap-3 md:gap-4 relative z-10 min-h-0 overflow-hidden">
          
          {/* Left Section: Lenovo OBA Ratio Chart Container (Spans 2 cols = Exactly matches Total Shipping + Total OBA Cards) */}
          <div className="col-span-2 bg-gradient-to-b from-[#112240]/80 to-[#0a1526]/90 border border-cyan-500/30 rounded-xl p-3 md:p-4 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-1 shrink-0">
              <div className="flex items-center gap-1.5 md:gap-2">
                <span className="w-1 h-3.5 bg-cyan-500 shadow-[0_0_8px_cyan] block" />
                <span className="text-cyan-300 font-bold tracking-wider text-[12px] md:text-[13px] uppercase">OBA双轴趋势 (Lenovo OBA Ratio)</span>
                <span className="hidden sm:inline text-[11px] text-cyan-500/70 font-mono">| OBA监控</span>
              </div>
              <div className="flex items-center gap-2 md:gap-4 text-[11px] md:text-xs font-mono">
                <span className="flex items-center gap-1 text-blue-400">
                  <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-500 rounded-sm"></span> Shipping
                </span>
                <span className="flex items-center gap-1 text-orange-400">
                  <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-orange-500 rounded-sm"></span> OBA
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2.5 h-0.5 bg-slate-400"></span> Ratio
                </span>
              </div>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ReactECharts option={chartOption} style={{ height: "100%", width: "100%" }} />
            </div>

            {/* Left Summary Status Footer */}
            <div className="flex justify-between items-center text-[11px] md:text-xs text-cyan-500/70 font-mono uppercase tracking-wider shrink-0 pt-1.5 border-t border-cyan-500/10">
              <div className="flex flex-wrap gap-2.5 md:gap-5">
                <span>月份周期: <strong className="text-cyan-300">{OBA_DATA.length}</strong> 批次</span>
                <span>出货总计: <strong className="text-blue-400 font-bold">{totalShipping.toLocaleString()}</strong></span>
                <span>OBA总计: <strong className="text-orange-400 font-bold">{totalOba.toLocaleString()}</strong></span>
                <span>平均比例: <strong className="text-emerald-400 font-bold">{overallRatio.toFixed(2)}%</strong></span>
              </div>
              <span className="hidden lg:inline text-[10px] text-cyan-500/50">LENOVO_OBA_REPORT_2026</span>
            </div>
          </div>

          {/* Right Section: Table Container (Spans 1 col = Exactly matches Average OBA Ratio Card) */}
          <div className="col-span-1 bg-gradient-to-b from-[#112240]/80 to-[#0a1526]/90 border border-cyan-500/30 rounded-xl p-3 md:p-4 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-3.5 bg-cyan-500 shadow-[0_0_8px_cyan] block" />
                <span className="text-cyan-300 font-bold tracking-wider text-[12px] md:text-[13px] uppercase">OBA 检验数据清单</span>
              </div>
              <span className="text-[10px] md:text-[11px] text-cyan-400/70 font-mono">{OBA_DATA.length} 批次记录</span>
            </div>

            {/* Table wrapper filling 100% remaining height */}
            <div className="flex-1 flex flex-col border border-cyan-900/40 rounded-lg bg-cyan-950/20 min-h-0 overflow-hidden">
              <table className="w-full h-full text-center border-collapse text-white table-fixed">
                <thead className="shrink-0 bg-[#102445]">
                  <tr className="bg-cyan-500/20 text-white font-bold uppercase tracking-wider font-mono text-[11px] md:text-[12px]">
                    <th className="border border-cyan-900/40 py-2 px-1 text-center w-9 md:w-10">NO.</th>
                    <th className="border border-cyan-900/40 py-2 px-1 text-center font-bold text-cyan-300">Month</th>
                    <th className="border border-cyan-900/40 py-2 px-1 text-center font-bold text-blue-300">Shipping</th>
                    <th className="border border-cyan-900/40 py-2 px-1 text-center font-bold text-orange-300">OBA</th>
                    <th className="border border-cyan-900/40 py-2 px-1 text-center font-bold text-emerald-300">Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-950/40 text-[11px] md:text-[12px] font-mono">
                  {OBA_DATA.map((row) => (
                    <tr 
                      key={row.month} 
                      className={`hover:bg-cyan-500/15 odd:bg-cyan-950/15 transition-colors text-cyan-100 cursor-pointer ${
                        selectedMonthHighlight === row.month ? "bg-cyan-500/25 border-l-2 border-cyan-400 font-bold" : ""
                      }`}
                      onClick={() => setSelectedMonthHighlight(row.month)}
                    >
                      <td className="border border-cyan-900/40 px-1 font-bold text-white text-center">{row.no}</td>
                      <td className="border border-cyan-900/40 px-1 font-bold text-cyan-300 text-center tracking-wider">{row.month}</td>
                      <td className="border border-cyan-900/40 px-1 text-center font-bold text-blue-400">
                        {row.shipping.toLocaleString()}
                      </td>
                      <td className="border border-cyan-900/40 px-1 text-center font-bold text-orange-400">
                        {row.oba.toLocaleString()}
                      </td>
                      <td className="border border-cyan-900/40 px-1 text-center font-black text-emerald-400">
                        {row.ratio.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Render AiAssistant */}
      <AiAssistant workshop="OBA" />
    </motion.div>
  );
}

export default ObaDashboard;

