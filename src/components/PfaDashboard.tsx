import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Clock, ShieldCheck, FileText, Database, X } from "lucide-react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { AiAssistant } from "./AiAssistant";
import { FilePasswordModal } from "./FilePasswordModal";
import { 
  useAppData, 
  Card, 
  Gauge, 
  HealthRing, 
  InlineTrendChart, 
  TrendModal, 
  DocModal,
  MachineTrendModal,
  ParticleSizeChart, 
  TemperatureChart, 
  HumidityChart,
  useTrendData,
  useStatusTableData,
  getClientSeededValue,
  getAttendanceValueForDay,
  getDetectionValueForDay
} from "../App";

// Local constants for PFA stats
const PFA_STATS = {
  get attendance() {
    return getAttendanceValueForDay("PFA", 0);
  },
  get detection() {
    return getDetectionValueForDay("PFA", 0);
  }
};

const generatePfaData = (days: number) => {
  const dates = [];
  const yields = [];
  const productivity = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    dates.push(dateStr);
    
    const yieldVal = parseFloat((98.5 + Math.random() * 1.4).toFixed(2));
    yields.push(yieldVal);
    
    productivity.push(Math.floor(40 + Math.random() * 30));
  }
  return { dates, yields, productivity };
};

const formatParamTwoWords = (param: string) => {
  if (!param) return "";
  const chunks = [];
  for (let i = 0; i < param.length; i += 2) {
    chunks.push(param.slice(i, i + 2));
  }
  return (
    <span className="inline-flex flex-col items-center leading-tight py-0.5">
      {chunks.map((chunk, idx) => (
        <span key={idx} className="whitespace-nowrap">{chunk}</span>
      ))}
    </span>
  );
};

const formatLineName = (rawLine: string) => {
  if (!rawLine) return "";
  if (rawLine.startsWith("PFA-")) return rawLine;
  if (rawLine.startsWith("L")) {
    const num = rawLine.replace(/[^0-9]/g, '');
    return `PFA-${num.padStart(2, '0')}#`;
  }
  return rawLine;
};

const formatValue = (rawVal: any) => {
  if (rawVal === undefined || rawVal === null) return "";
  return String(rawVal);
};

const PfaStatusTable = ({ onRowClick }: { onRowClick: (row: any) => void }) => {
  const appData = useAppData();
  const [filterLine, setFilterLine] = useState("PFA-03#");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { allData, loading } = useStatusTableData("pfa");

  const formattedData = useMemo(() => {
    return allData.map(d => ({
      ...d,
      displayLine: formatLineName(d.line),
      displayVal: formatValue(d.val)
    }));
  }, [allData]);

  const uniqueLines = useMemo(() => Array.from(new Set(formattedData.map(d => d.displayLine))).sort(), [formattedData]);

  useEffect(() => {
    if (uniqueLines.length > 0 && !uniqueLines.includes(filterLine)) {
      setFilterLine(uniqueLines.includes("PFA-03#") ? "PFA-03#" : uniqueLines[0]);
    }
  }, [uniqueLines, filterLine]);

  if (loading) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center text-white font-mono text-sm">
        LOADING MACHINE STATUS...
      </div>
    );
  }

  const filteredData = formattedData.filter(d => d.displayLine === filterLine || d.line.startsWith(filterLine));

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="w-full flex-1 overflow-y-auto cyber-scrollbar pr-0.5">
        <table className="w-full text-center border-collapse border border-cyan-900/40 text-white" style={{ fontSize: '13px' }}>
          <thead className="sticky top-0 z-20 bg-[#102445]">
            <tr className="bg-cyan-500/20 text-white font-black">
              <th className="border border-cyan-900/40 py-1.5 px-1 text-center relative whitespace-nowrap">
                <div 
                  className="flex items-center justify-center gap-1 cursor-pointer hover:text-cyan-300 transition-colors"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  {appData.labels.dashboards.cut.table.line} <ChevronLeft className={`w-3 h-3 transition-transform ${isFilterOpen ? "rotate-90" : "-rotate-90"}`} />
                </div>
                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 z-[100] mt-0.5 bg-[#102445] border border-cyan-500/40 shadow-2xl rounded-sm w-28 py-1 flex flex-col overflow-y-auto max-h-48 no-scrollbar text-xs"
                    >
                      {uniqueLines.map(line => (
                        <button
                          key={line}
                          onClick={() => {
                            setFilterLine(line);
                            setIsFilterOpen(false);
                          }}
                          className={`px-3 py-1.5 text-left hover:bg-cyan-500/20 transition-colors ${filterLine === line ? "text-cyan-300 font-bold bg-cyan-500/10" : "text-white/85"}`}
                        >
                          {line}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </th>
              <th className="border border-cyan-900/40 py-1.5 px-1 text-center whitespace-nowrap">{appData.labels.dashboards.cut.table.param}</th>
              <th className="border border-cyan-900/40 py-1.5 px-1 whitespace-nowrap">{appData.labels.dashboards.cut.table.value}</th>
              <th className="border border-cyan-900/40 py-1.5 px-1 whitespace-nowrap">{appData.labels.dashboards.cut.table.upperLimit}</th>
              <th className="border border-cyan-900/40 py-1.5 px-1 whitespace-nowrap">{appData.labels.dashboards.cut.table.lowerLimit}</th>
              <th className="border border-cyan-900/40 py-1.5 px-1 whitespace-nowrap">{appData.labels.dashboards.cut.table.status}</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, i) => (
              <tr key={i} className="hover:bg-cyan-500/10 odd:bg-cyan-950/20 transition-colors">
                <td className="border border-cyan-900/40 px-1 py-1 text-center font-mono text-cyan-200 text-xs font-bold whitespace-nowrap">{row.displayLine}</td>
                <td className="border border-cyan-900/40 px-1 py-1 text-center text-white text-xs leading-tight">{formatParamTwoWords(row.param)}</td>
                <td className="border border-cyan-900/40 px-1 py-1 text-center font-bold text-cyan-300 font-mono text-sm tracking-tight">{row.displayVal}</td>
                <td className="border border-cyan-900/40 px-1 py-1 text-center text-white/80 font-mono text-xs">{row.up}</td>
                <td className="border border-cyan-900/40 px-1 py-1 text-center text-white/80 font-mono text-xs">{row.low}</td>
                <td className="border border-cyan-900/40 px-1 py-1 text-center whitespace-nowrap">
                  <button 
                    onClick={() => onRowClick(row)}
                    className="bg-green-500/20 hover:bg-green-500/45 text-green-300 px-2 py-0.5 rounded-sm border border-green-500/40 shadow-[0_0_5px_rgba(74,222,128,0.2)] font-black text-xs transition-all duration-150 cursor-pointer"
                  >
                    ● {row.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-1 text-[10px] text-white/75 flex justify-between uppercase tracking-widest font-mono shrink-0 pt-0.5 border-t border-cyan-500/10">
        <span>ACTIVE: {filterLine}</span>
        <span>COUNT: {filteredData.length}</span>
      </div>
    </div>
  );
};

const PfaYieldProductionChart = ({ onOpenClosedLoop }: { onOpenClosedLoop?: () => void }) => {
  const appData = useAppData();
  const [range, setRange] = useState<'2Y' | '3M' | '4W' | '7D'>('7D');
  
  const days = useMemo(() => {
    switch (range) {
      case '2Y': return 730;
      case '3M': return 90;
      case '4W': return 28;
      case '7D': return 7;
      default: return 90;
    }
  }, [range]);

  const { data: chartData, loading } = useTrendData("pfa", days);

  if (loading || !chartData.dates.length) {
    return (
      <div className="w-full h-[180px] flex items-center justify-center text-white font-mono text-sm">
        LOADING PFA TREND DATA...
      </div>
    );
  }

  const option = {
    animation: true,
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(5, 17, 37, 0.95)',
      borderColor: '#06b6d4',
      borderWidth: 1,
      textStyle: { fontSize: 15, color: '#fff' },
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        let res = `<div style="font-family: monospace; padding: 4px;">`;
        res += `<div style="color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 6px; padding-bottom: 4px;">DATE: ${params[0].name}</div>`;
        params.forEach((p: any) => {
          const unit = p.seriesName === appData.labels.charts.yieldTitle ? '%' : ' pcs';
          const color = p.seriesName === appData.labels.charts.yieldTitle ? '#22d3ee' : '#67e8f9';
          res += `<div style="display: flex; justify-content: space-between; gap: 20px; align-items: center; margin-bottom: 2px;">
                    <span style="display: flex; align-items: center; gap: 6px;">
                       <span style="width: 6px; height: 6px; background: ${p.color}; border-radius: 1px;"></span>
                       ${p.seriesName}:
                    </span>
                    <span style="color: ${color}; font-weight: bold;">${p.value}${unit}</span>
                  </div>`;
        });
        res += `</div>`;
        return res;
      }
    },
    legend: {
      orient: 'vertical',
      right: 15,
      top: 'center',
      data: [appData.labels.charts.yieldTitle, appData.labels.charts.productivityTitle],
      textStyle: { color: '#22d3ee', fontSize: 10, fontWeight: 'bold' },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 15
    },
    grid: [
      { left: 60, right: 100, top: 60, height: '30%' },
      { left: 60, right: 100, top: '55%', height: '30%' }
    ],
    xAxis: [
      {
        type: 'category',
        data: chartData.dates,
        gridIndex: 0,
        boundaryGap: false,
        axisLine: { lineStyle: { color: 'rgba(34, 211, 238, 0.2)' } },
        axisLabel: { show: false }
      },
      {
        type: 'category',
        data: chartData.dates,
        gridIndex: 1,
        axisLine: { lineStyle: { color: 'rgba(34, 211, 238, 0.2)' } },
        axisLabel: { 
          color: '#ffffff', 
          fontSize: range === '2Y' ? 10 : 14,
          interval: range === '2Y' ? 60 : range === '3M' ? 10 : range === '4W' ? 3 : 0,
          rotate: range === '3M' ? 30 : 0
        },
        boundaryGap: true
      }
    ],
    yAxis: [
      {
        gridIndex: 0,
        type: 'value',
        min: 95.0,
        max: 100.0,
        interval: 1.0,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#ffffff', fontSize: 14, formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(34, 211, 238, 0.1)', type: 'dashed' } }
      },
      {
        gridIndex: 1,
        type: 'value',
        min: 3000,
        max: 7000,
        interval: 1000,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
        axisLabel: { color: '#ffffff', fontSize: 14 }
      }
    ],
    series: [
      {
        name: appData.labels.charts.yieldTitle,
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: chartData.yields,
        smooth: true,
        symbol: 'circle',
        symbolSize: range === '7D' || range === '4W' ? 4 : 2,
        itemStyle: { color: '#22d3ee' },
        lineStyle: { width: 2, color: '#22d3ee' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(34, 211, 238, 0.3)' },
            { offset: 1, color: 'rgba(34, 211, 238, 0)' }
          ])
        },
        label: {
          show: range === '7D' || range === '4W',
          position: 'top',
          color: '#fff',
          fontSize: 12,
          formatter: '{c}%'
        },
        markLine: {
          symbol: ['none', 'none'],
          label: {
            show: range === '7D' || range === '4W',
            position: 'end',
            formatter: '98%',
            fontSize: 12,
            color: '#f87171'
          },
          lineStyle: {
            color: '#f87171',
            type: 'dashed',
            width: 1,
            opacity: 0.5
          },
          data: [
            { yAxis: 98 }
          ]
        }
      },
      {
        name: appData.labels.charts.productivityTitle,
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        barWidth: range === '7D' ? '40%' : range === '4W' ? '50%' : '60%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#06b6d4' },
            { offset: 1, color: 'rgba(6, 182, 212, 0.2)' }
          ]),
          borderRadius: [2, 2, 0, 0]
        },
        label: {
          show: range === '7D' || range === '4W',
          position: 'top',
          color: '#ffffff',
          fontSize: 12,
          formatter: '{c}'
        },
        emphasis: {
          itemStyle: { color: '#22d3ee' }
        },
        data: chartData.productivity
      }
    ]
  };

  return (
    <div className="w-full h-full relative group/chart">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <div className="flex bg-black/40 border border-cyan-500/20 rounded-md p-0.5 backdrop-blur-md">
          {[
            { id: '2Y', label: '两年' },
            { id: '3M', label: '三个月' },
            { id: '4W', label: '四周' },
            { id: '7D', label: '七天' }
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id as any)}
              className={`px-2 py-1 text-[9px] font-bold rounded transition-all ${
                range === r.id 
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]' 
                  : 'text-cyan-400/60 hover:text-cyan-300 hover:bg-white/5'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <button 
          onClick={() => onOpenClosedLoop?.()}
          className="flex items-center gap-2 px-3 py-1.5 bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-500/40 hover:border-cyan-400 rounded shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 group/btn overflow-hidden relative cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 group-hover/btn:scale-110 transition-transform duration-300" />
          <span className="text-[10px] font-black text-cyan-100 uppercase tracking-widest whitespace-nowrap">闭环管理</span>
        </button>
      </div>

      <div className="w-full h-full p-4">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
};

// Helper component for controlled files (shared logic)
const ControlledFiles = ({ workshop, onDocClick }: { workshop: string, onDocClick: (name: string) => void }) => {
  const [files, setFiles] = useState<{name: string, type: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/${workshop}/files`)
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setFiles(data);
        } else {
          throw new Error("Data is not an array");
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback for demo
        const fallback = [
          { name: "品质控制标准.pdf", type: "pdf" },
          { name: "作业指导书.docx", type: "docx" },
          { name: "环境监控表.xlsx", type: "xlsx" }
        ];
        setFiles(fallback);
        setLoading(false);
      });
  }, [workshop]);

  if (loading) return <div className="text-[8px] text-cyan-500 animate-pulse">LOADING FILES...</div>;

  return (
    <div className="grid grid-cols-3 gap-1.5 overflow-hidden h-full">
      {files.map((doc, i) => (
        <motion.div
          key={i}
          whileHover={{ y: -2, scale: 1.02 }}
          onClick={() => onDocClick(doc.name)}
          className="flex flex-col items-center justify-center cursor-pointer group p-1 rounded bg-cyan-500/5 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 transition-all h-full"
        >
          <div className="relative">
             <FileText className="w-5 h-6 text-cyan-400 group-hover:text-white transition-colors" />
             <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-[6px] px-0.5 rounded-sm font-black">{(doc.type || doc.name.split('.').pop() || 'docx').toUpperCase()}</div>
          </div>
          <span className="text-[11px] text-cyan-300/90 mt-1 text-center line-clamp-1 leading-tight font-medium">{doc.name}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default function PfaDashboard({ stepId, title, onBack, onOpenClosedLoop }: { stepId?: "pfa1" | "pfa2", title?: string, onBack: () => void, onOpenClosedLoop?: () => void, key?: string }) {
  const appData = useAppData();
  const [time, setTime] = useState(new Date());
  const [modalTitle, setModalTitle] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [pfaFiles, setPfaFiles] = useState<{ name: string }[]>([]);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [pendingDownloadFile, setPendingDownloadFile] = useState<string | null>(null);
  const [selectedParamRow, setSelectedParamRow] = useState<any>(null);
  const refreshTime = useMemo(() => new Date(), []);

  const avgPersonnelHealth = parseFloat(((PFA_STATS.attendance.value + PFA_STATS.detection.value) / 2).toFixed(1));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("/api/pfa/files")
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setPfaFiles(data);
        }
      })
      .catch(err => {
        console.warn("Using fallback PFA files:", err);
        setPfaFiles([
          { name: "1_PFA偏光片贴合首件点检规程.docx" },
          { name: "2_偏贴偏光片静电控制管理细则.pdf" },
          { name: "3_脱泡机高压容器安全运行条例.docx" }
        ]);
      });
  }, []);

  const handleDownload = (filename: string) => {
    setDownloadingFile(filename);
    setTimeout(() => {
      setDownloadingFile(null);
    }, 2500);

    const url = `/api/pfa/files/download?name=${encodeURIComponent(filename)}`;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fileShelves = useMemo(() => {
    const shelves: { name: string }[][] = [];
    for (let i = 0; i < pfaFiles.length; i += 3) {
      shelves.push(pfaFiles.slice(i, i + 3));
    }
    return shelves;
  }, [pfaFiles]);

  const formatDateTime = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    return `${y}/${m}/${d} ${h}:${min}:${s}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0d1c33] flex flex-col font-sans text-white overflow-hidden"
    >
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* Header */}
      <div className="h-16 flex items-center justify-between px-8 bg-gradient-to-r from-[#001a33] via-[#003366] to-[#001a33] border-b border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)] relative z-20">
        <button 
          onClick={onBack}
          className="relative group flex items-center gap-3 px-4 py-1.5 overflow-hidden transition-all"
        >
          <div className="absolute inset-0 border border-cyan-500/30 group-hover:border-white skew-x-[-15deg] bg-cyan-950/20 transition-colors" />
          <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500 skew-x-[-15deg] group-hover:bg-white group-hover:w-full opacity-10 transition-all duration-300" />
          
          <ChevronLeft className="relative w-5 h-5 text-cyan-400 group-hover:text-white group-hover:-translate-x-1 transition-all" />
          <span className="relative font-black tracking-widest text-[10px] md:text-xs text-cyan-300 group-hover:text-white uppercase transition-colors">
            {appData.projectInfo.title}
          </span>
          <div className="absolute right-0 top-0 w-1 h-1 bg-cyan-400 shadow-[0_0_5px_cyan]" />
        </button>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="relative">
                <div className="absolute inset-0 blur-2xl bg-cyan-500/20 animate-pulse" />
                <h1 className="relative text-xl md:text-3xl font-black tracking-[0.4em] text-white uppercase drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
                  {appData.labels.dashboards.pfa.title}
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

      {/* Grid Content */}
      <div className="flex-1 p-6 flex flex-col gap-6 relative overflow-hidden bg-[#0a1526]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
           <motion.div 
             animate={{ y: ["0%", "100%", "0%"] }}
             transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
             className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent blur-xl"
           />
        </div>

        <div className="flex-1 flex gap-2 min-h-0">
          {/* LEFT COLUMN */}
          <div className="w-1/4 flex flex-col gap-6 z-10">
            <Card title={appData.labels.dashboards.cut.cards.attendance} className="flex-1">
              <div className="w-full flex justify-center items-center pt-2 gap-6">
                <Gauge 
                  value={PFA_STATS.attendance.value} 
                  label={appData.labels.dashboards.cut.stats.attendanceRate} 
                  actual={PFA_STATS.attendance.actual}
                  total={PFA_STATS.attendance.total}
                  onClick={() => setModalTitle("偏贴段出勤率")} 
                  gaugeClassName="w-48 h-36"
                  valueSize="text-base"
                  labelSize="text-base"
                  dataSize="text-xs"
                />
                <Gauge 
                  value={PFA_STATS.detection.value} 
                  label={appData.labels.dashboards.cut.stats.detectionRate} 
                  color="blue" 
                  actual={PFA_STATS.detection.actual}
                  total={PFA_STATS.detection.total}
                  unit="pcs"
                  onClick={() => setModalTitle("偏贴段检出率")} 
                  gaugeClassName="w-48 h-36"
                  valueSize="text-base"
                  labelSize="text-base"
                  dataSize="text-xs"
                />
              </div>
            </Card>
            <Card title={appData.labels.dashboards.pfa?.cards?.quality || "材料品质监控[偏光板来料不良]"} className="flex-1">
               <InlineTrendChart title={appData.labels.dashboards.cut.stats.materialYield} site="pfa" />
            </Card>
          </div>

          {/* CENTER COLUMN */}
          <div className="flex-1 flex flex-col gap-6 z-10">
            <div className="grid grid-cols-2 gap-4">
                <div 
                  className="relative bg-gradient-to-b from-cyan-900/40 to-black/80 border border-cyan-500/30 backdrop-blur-md p-4 text-center h-36 flex flex-col items-center justify-center group overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => setModalTitle("总健康度得分")}
                >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/50 shadow-[0_0_5px_cyan]" />
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck className="w-24 h-24 text-cyan-400" />
                    </div>
                    <div className="flex items-center gap-3 mb-1">
                        <ShieldCheck className="w-5 h-5 text-white" />
                        <span className="text-white tracking-[0.3em] font-black uppercase" style={{ fontSize: '18px' }}>{appData.labels.dashboards.cut.stats.totalHealth}</span>
                    </div>
                    <span className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">100%</span>
                    <div className="absolute left-2 bottom-2 text-[8px] text-cyan-500/30 font-mono">SYSTEM_STABLE</div>
                </div>
                <div className="relative bg-gradient-to-b from-cyan-900/40 to-black/80 border border-cyan-500/30 backdrop-blur-md p-4 text-center h-36 flex flex-col items-center justify-center group overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/50 shadow-[0_0_5px_cyan]" />
                    <span className="text-white tracking-[0.3em] font-black mb-3 uppercase" style={{ fontSize: '18px' }}>{appData.labels.dashboards.cut.stats.coreAnalysis}</span>
                    <div className="flex gap-2.5 items-center justify-center w-full">
                       <HealthRing label="人" value={100} onClick={() => setModalTitle("偏贴段人员要素")} />
                       <HealthRing label="机" value={100} onClick={() => setModalTitle("设备要素")} />
                       <HealthRing label="料" value={100} onClick={() => setModalTitle("物料要素")} />
                       <HealthRing label="法" value={100} onClick={() => setModalTitle("工艺法规")} />
                       <HealthRing label="环" value={100} onClick={() => setModalTitle("环境要素")} />
                    </div>
                </div>
            </div>
            
            <div className="flex-1 bg-[#102445]/60 border border-cyan-500/30 rounded-sm backdrop-blur-xl flex flex-col items-center justify-center relative group overflow-hidden shadow-[inset_0_0_60px_rgba(6,182,212,0.15)]">
                <div className="absolute inset-0 pointer-events-none">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-cyan-500/10 rounded-full" />
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-cyan-500/5 rounded-full" />
                </div>

                <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
                   <div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_cyan] animate-pulse" />
                   <span className="text-[16px] font-mono text-white tracking-[0.2em] font-black">Process 良率[异物&气泡]</span>
                </div>

                <div className="w-full h-full relative z-10 flex flex-col">
                   <PfaYieldProductionChart onOpenClosedLoop={onOpenClosedLoop} />
                </div>

                <div className="absolute bottom-4 right-4 text-right z-20 pointer-events-none">
                    <div className="text-[9px] text-white/75 font-mono italic mt-1">
                        数据同步时间: {formatDateTime(refreshTime)}
                    </div>
                </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-1/4 flex flex-col gap-3 z-40 relative">
            <AiAssistant workshop="PFA" />
            <Card title={appData.labels.dashboards.cut.cards.machine} className="min-h-0 overflow-hidden" style={{ flex: '6.2 6.2 0%' }}>
              <PfaStatusTable onRowClick={setSelectedParamRow} />
            </Card>
            <Card title={appData.labels.dashboards.cut.cards.standard} className="min-h-0 overflow-hidden relative" style={{ flex: '3.8 3.8 0%' }}>
              <div className="h-full flex flex-col justify-around py-1">
                {fileShelves.length === 0 ? (
                  <div className="flex items-center justify-center text-xs text-white/75 h-full font-mono">
                    获取受控文件中...
                  </div>
                ) : (
                  fileShelves.map((shelf, shelfIdx) => (
                    <div 
                      key={shelfIdx} 
                      className={`flex justify-around items-end px-2 pb-1 border-b border-cyan-500/20 relative ${shelfIdx > 0 ? "mt-6" : ""}`}
                    >
                      {shelf.map((doc, i) => {
                        const globalIndex = shelfIdx * 3 + i;
                        const colorClass = globalIndex % 2 === 0 ? "text-blue-400" : "text-white";
                        return (
                          <motion.div
                            key={i}
                            whileHover={{ y: -8, scale: 1.1 }}
                            onClick={() => setPendingDownloadFile(doc.name)}
                            className="flex flex-col items-center cursor-pointer group"
                          >
                            <FileText className={`w-8 h-10 ${colorClass} group-hover:text-cyan-300 transition-colors`} />
                            <span className="text-[14px] text-white/80 mt-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] text-center" title={doc.name}>
                              {doc.name}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
              <AnimatePresence>
                {downloadingFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute inset-x-0 bottom-0 bg-cyan-950/95 border-t border-cyan-500/30 py-2 px-3 flex items-center justify-between text-[9px] text-cyan-200 z-50"
                  >
                    <span className="truncate flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      已拉取受控文件: {downloadingFile}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold shrink-0">启动下载窗口...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="h-84 z-10 relative group mt-2">
            <div className="absolute -top-5 left-6 z-20 px-4 bg-cyan-600/20 backdrop-blur-xl border border-cyan-500/50 text-white font-black tracking-[0.4em] uppercase py-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]" style={{ fontSize: '18px' }}>
              {appData.labels.dashboards.cut.envHeader}
            </div>
            <div className="h-full bg-gradient-to-r from-[#102445]/90 via-[#0a1a2f]/80 to-[#102445]/90 border border-cyan-500/40 flex items-center justify-around text-cyan-100 shadow-[0_0_30px_rgba(6,182,212,0.1)] relative overflow-hidden px-4 gap-4">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                
                <div className="flex-1 h-full flex flex-col pt-6 pb-2">
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                    <span className="text-white font-bold uppercase tracking-widest" style={{ fontSize: '18px' }}>{appData.labels.dashboards.cut.envMetrics.particle}</span>
                  </div>
                  <div className="flex-1 bg-cyan-950/20 rounded-lg border border-cyan-500/10 overflow-hidden">
                    <ParticleSizeChart site="pfa" />
                  </div>
                </div>

                <div className="flex-1 h-full flex flex-col pt-6 pb-2">
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                    <span className="text-white font-bold uppercase tracking-widest" style={{ fontSize: '18px' }}>{appData.labels.dashboards.cut.envMetrics.temp}</span>
                  </div>
                  <div className="flex-1 bg-cyan-950/20 rounded-lg border border-cyan-500/10 overflow-hidden">
                    <TemperatureChart site="pfa" />
                  </div>
                </div>

                <div className="flex-1 h-full flex flex-col pt-6 pb-2">
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                    <span className="text-white font-bold uppercase tracking-widest" style={{ fontSize: '18px' }}>{appData.labels.dashboards.cut.envMetrics.humidity}</span>
                  </div>
                  <div className="flex-1 bg-cyan-950/20 rounded-lg border border-cyan-500/10 overflow-hidden">
                    <HumidityChart site="pfa" />
                  </div>
                </div>
                <div className="absolute left-2 bottom-1 text-[8px] text-white/40 font-mono">ID: ENV_SCAN_779</div>
            </div>
        </div>
      </div>
      <TrendModal 
        isOpen={!!modalTitle} 
        onClose={() => setModalTitle(null)} 
        title={modalTitle || ""} 
        site="pfa"
      />
      <DocModal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        docName={selectedDoc || ""}
      />
      <FilePasswordModal
        isOpen={pendingDownloadFile !== null}
        fileName={pendingDownloadFile || ""}
        onSuccess={(file) => handleDownload(file)}
        onClose={() => setPendingDownloadFile(null)}
      />
      <AnimatePresence>
        {selectedParamRow && (
          <MachineTrendModal 
            row={selectedParamRow} 
            onClose={() => setSelectedParamRow(null)} 
          />
        )}
      </AnimatePresence>

      {/* Render AiAssistant */}
      <AiAssistant workshop="PFA" />
    </motion.div>
  );
}
