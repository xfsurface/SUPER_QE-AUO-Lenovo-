import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Clock, RefreshCw, Filter } from "lucide-react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { AiAssistant } from "./AiAssistant";
import { useAppData } from "../App";

export interface ShippingRow {
  odm: string;
  month: string;
  modelName: string;
  lenovoPn: string;
  input: number;
  auoPanelFrom: string;
}

export const SHIPPING_DATA: ShippingRow[] = [
  { odm: "WISTRON", month: "1月", modelName: "B140UAN08.0", lenovoPn: "SD11R09618", input: 10861, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "1月", modelName: "B156HTN06.2", lenovoPn: "SD11F30431", input: 11101, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "1月", modelName: "B140UAN08.0", lenovoPn: "SD11R09618", input: 12840, auoPanelFrom: "Z31" },
  { odm: "LCFC", month: "1月", modelName: "B156HAN02.1", lenovoPn: "SD10Z34968", input: 10269, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "1月", modelName: "B140UAN04.7", lenovoPn: "SD11M38901", input: 12125, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "1月", modelName: "B156HTN06.2", lenovoPn: "SD11F30431", input: 18658, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "1月", modelName: "B140UAN08.0", lenovoPn: "SD11R09618", input: 29739, auoPanelFrom: "Z31" },
  { odm: "LCFC", month: "1月", modelName: "B140UAN08.0", lenovoPn: "SD11R09618", input: 20354, auoPanelFrom: "Z31" },
  { odm: "LCFC", month: "1月", modelName: "B140UAN04.7", lenovoPn: "SD11M38901", input: 23880, auoPanelFrom: "S01" },
  { odm: "Compal", month: "1月", modelName: "B156HAN15.K", lenovoPn: "SD11M63777", input: 10069, auoPanelFrom: "Z31" },
  { odm: "LCFC", month: "1月", modelName: "B156HAN02.1", lenovoPn: "SD10Z34968", input: 11066, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "1月", modelName: "B140UAN04.7", lenovoPn: "SD11M38901", input: 19696, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "1月", modelName: "B140UAK01.3", lenovoPn: "SD11M38972", input: 14854, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "1月", modelName: "B153UAN03.0", lenovoPn: "SD11P86197", input: 11942, auoPanelFrom: "S06" },
  { odm: "LCFC", month: "2月", modelName: "B140UAN04.7", lenovoPn: "SD11M38901", input: 19176, auoPanelFrom: "S01" },
  { odm: "WISTRON", month: "2月", modelName: "B140UAN08.0", lenovoPn: "SD11R09618", input: 12112, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "2月", modelName: "B140UAN08.0", lenovoPn: "SD11R09618", input: 11523, auoPanelFrom: "Z31" },
  { odm: "LCFC", month: "2月", modelName: "B156HAN02.1", lenovoPn: "SD10Z34968", input: 12547, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "2月", modelName: "B140UAN04.7", lenovoPn: "SD11M38901", input: 17224, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "2月", modelName: "B156HTN06.2", lenovoPn: "SD11F30431", input: 10820, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "2月", modelName: "B140UAN08.0", lenovoPn: "SD11R09618", input: 11238, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "2月", modelName: "B140UAN04.7", lenovoPn: "SD11M38901", input: 12842, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "2月", modelName: "B153UAN03.0", lenovoPn: "SD11P86197", input: 11197, auoPanelFrom: "S06" },
  { odm: "LCFC", month: "3月", modelName: "B156HTN06.2", lenovoPn: "SD11F30431", input: 29870, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "3月", modelName: "B140UAN08.0", lenovoPn: "SD11R09618", input: 15705, auoPanelFrom: "Z31" },
  { odm: "LCFC", month: "3月", modelName: "B156HAN02.1", lenovoPn: "SD10Z34968", input: 17526, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "3月", modelName: "B140UAN04.7", lenovoPn: "SD11M38901", input: 33533, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "3月", modelName: "B153UAN03.0", lenovoPn: "SD11P86197", input: 12070, auoPanelFrom: "S06" },
  { odm: "LCFC", month: "3月", modelName: "B156HTN06.2", lenovoPn: "SD11F30431", input: 57491, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "3月", modelName: "B140UAN08.0", lenovoPn: "SD11R09618", input: 24024, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "3月", modelName: "B156HAN02.1", lenovoPn: "SD10Z34968", input: 10005, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "3月", modelName: "B140UAN04.7", lenovoPn: "SD11M38901", input: 50081, auoPanelFrom: "S01" },
  { odm: "WISTRON", month: "3月", modelName: "B160UAN04.9", lenovoPn: "SD11M38960", input: 10185, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "3月", modelName: "B156HTN06.2", lenovoPn: "SD11F30431", input: 37318, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "3月", modelName: "B140UAN08.0", lenovoPn: "SD11R09618", input: 26677, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "3月", modelName: "B160UAN04.2", lenovoPn: "SD11K06190", input: 21514, auoPanelFrom: "Z31" },
  { odm: "LCFC", month: "3月", modelName: "B140UAN04.7", lenovoPn: "SD11M38901", input: 13308, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "3月", modelName: "B140UAK01.3", lenovoPn: "SD11M38972", input: 15414, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "3月", modelName: "B153UAN03.0", lenovoPn: "SD11P86197", input: 15965, auoPanelFrom: "S06" },
  { odm: "LCFC", month: "3月", modelName: "B140UAN02.7", lenovoPn: "SD11M38929", input: 11014, auoPanelFrom: "K06" },
  { odm: "LCFC", month: "3月", modelName: "B156HTN06.2", lenovoPn: "SD11F30431", input: 18355, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "3月", modelName: "B140UAN08.0", lenovoPn: "SD11R09618", input: 19767, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "3月", modelName: "B140UAN08.0", lenovoPn: "SD11R09618", input: 10781, auoPanelFrom: "Z31" },
  { odm: "LCFC", month: "3月", modelName: "B160UAN04.2", lenovoPn: "SD11K06190", input: 12520, auoPanelFrom: "Z31" },
  { odm: "LCFC", month: "3月", modelName: "B140UAN04.7", lenovoPn: "SD11M38901", input: 26104, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "3月", modelName: "B156HAN15.K", lenovoPn: "SD11M63777", input: 10896, auoPanelFrom: "Z31" },
  { odm: "LCFC", month: "3月", modelName: "B140UAK01.3", lenovoPn: "SD11M38972", input: 13465, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "3月", modelName: "B153UAN03.0", lenovoPn: "SD11P86197", input: 13595, auoPanelFrom: "S06" },
  { odm: "LCFC", month: "3月", modelName: "B153UAN03.0", lenovoPn: "SD11P86192", input: 10436, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "3月", modelName: "B160UAN04.9", lenovoPn: "SD11M38960", input: 15143, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "4月", modelName: "B140UAN08.0", lenovoPn: "SD11R09618", input: 11388, auoPanelFrom: "Z31" },
  { odm: "LCFC", month: "4月", modelName: "B140UAN04.7", lenovoPn: "SD11M38901", input: 12882, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "4月", modelName: "B140UAN04.7", lenovoPn: "SD11M38901", input: 11011, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "4月", modelName: "B156HTN06.2", lenovoPn: "SD11F30431", input: 22509, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "4月", modelName: "B156HAN02.1", lenovoPn: "SD10Z34968", input: 10919, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "4月", modelName: "B153UAN03.0", lenovoPn: "SD11P86197", input: 17842, auoPanelFrom: "S06" },
  { odm: "LCFC", month: "4月", modelName: "B156HTN06.2", lenovoPn: "SD11F30431", input: 13220, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "4月", modelName: "B156HAN02.1", lenovoPn: "SD10Z34968", input: 12523, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "4月", modelName: "B140UAN04.7", lenovoPn: "SD11M38901", input: 30371, auoPanelFrom: "S01" },
  { odm: "WISTRON", month: "4月", modelName: "B160UAN04.9", lenovoPn: "SD11M38960", input: 12198, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "5月", modelName: "B156HTN06.2", lenovoPn: "SD11F30431", input: 14040, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "5月", modelName: "B156HAN02.1", lenovoPn: "SD10Z34968", input: 11901, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "5月", modelName: "B156HTN06.2", lenovoPn: "SD11F30431", input: 27342, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "5月", modelName: "B156HAN02.1", lenovoPn: "SD10Z34968", input: 30266, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "5月", modelName: "B156HTN06.2", lenovoPn: "SD11F30431", input: 18746, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "5月", modelName: "B140UAN08.0", lenovoPn: "SD11R09618", input: 10580, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "5月", modelName: "B156HAN02.1", lenovoPn: "SD10Z34968", input: 27056, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "5月", modelName: "B140UAN04.7", lenovoPn: "SD11M38901", input: 24488, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "5月", modelName: "B156HAN02.1", lenovoPn: "SD10Z34968", input: 15629, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "5月", modelName: "B140UAN04.7", lenovoPn: "SD11M38901", input: 11752, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "5月", modelName: "B140UAN08.5", lenovoPn: "SD11S95311", input: 21121, auoPanelFrom: "S01" },
  { odm: "LCFC", month: "6月", modelName: "B156HTN06.2", lenovoPn: "SD11F30431", input: 23576, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "6月", modelName: "B156HAN02.1", lenovoPn: "SD10Z34968", input: 17208, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "6月", modelName: "B156HTN06.2", lenovoPn: "SD11F30431", input: 16380, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "6月", modelName: "B156HAN02.1", lenovoPn: "SD10Z34968", input: 22899, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "6月", modelName: "B153UAN03.1", lenovoPn: "SD11S95555", input: 20749, auoPanelFrom: "S06" },
  { odm: "LCFC", month: "6月", modelName: "B156HAN02.1", lenovoPn: "SD10Z34968", input: 13831, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "7月", modelName: "B156HTN06.2", lenovoPn: "SD11F30431", input: 10636, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "7月", modelName: "B156HTN06.2", lenovoPn: "SD11F30431", input: 12558, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "7月", modelName: "B153UAN03.1", lenovoPn: "SD11S95555", input: 11376, auoPanelFrom: "S06" },
  { odm: "LCFC", month: "7月", modelName: "B156HTN06.2", lenovoPn: "SD11F30431", input: 26621, auoPanelFrom: "Z40" },
  { odm: "LCFC", month: "7月", modelName: "B153UAN03.1", lenovoPn: "SD11S95555", input: 11193, auoPanelFrom: "S06" }
];

export function ShippingDashboard({ onBack }: { onBack: () => void }) {
  const appData = useAppData();
  const [time, setTime] = useState(new Date());

  // Filter States
  const [filterOdm, setFilterOdm] = useState<string>("");
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterModel, setFilterModel] = useState<string>("");
  const [filterPn, setFilterPn] = useState<string>("");
  const [filterPanelFrom, setFilterPanelFrom] = useState<string>("");

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

  // Extract unique options for filters
  const odmOptions = useMemo(() => Array.from(new Set(SHIPPING_DATA.map(d => d.odm))).sort(), []);
  const monthOptions = useMemo(() => Array.from(new Set(SHIPPING_DATA.map(d => d.month))).sort((a, b) => parseInt(a) - parseInt(b)), []);
  const modelOptions = useMemo(() => Array.from(new Set(SHIPPING_DATA.map(d => d.modelName))).sort(), []);
  const pnOptions = useMemo(() => Array.from(new Set(SHIPPING_DATA.map(d => d.lenovoPn))).sort(), []);
  const panelFromOptions = useMemo(() => Array.from(new Set(SHIPPING_DATA.map(d => d.auoPanelFrom))).sort(), []);

  // Reset Filters
  const handleResetFilters = () => {
    setFilterOdm("");
    setFilterMonth("");
    setFilterModel("");
    setFilterPn("");
    setFilterPanelFrom("");
  };

  // Filtered Rows
  const filteredData = useMemo(() => {
    return SHIPPING_DATA.filter(row => {
      if (filterOdm && row.odm !== filterOdm) return false;
      if (filterMonth && row.month !== filterMonth) return false;
      if (filterModel && row.modelName !== filterModel) return false;
      if (filterPn && row.lenovoPn !== filterPn) return false;
      if (filterPanelFrom && row.auoPanelFrom !== filterPanelFrom) return false;
      return true;
    });
  }, [filterOdm, filterMonth, filterModel, filterPn, filterPanelFrom]);

  // Aggregate Data for Chart: Sum of Input grouped by AUO_MODELNAME
  const chartData = useMemo(() => {
    const aggregation: Record<string, number> = {};
    filteredData.forEach(row => {
      aggregation[row.modelName] = (aggregation[row.modelName] || 0) + row.input;
    });
    // Convert to sorted array of objects
    return Object.entries(aggregation)
      .map(([model, sum]) => ({ model, sum }))
      .sort((a, b) => b.sum - a.sum); // Sort descending by sum
  }, [filteredData]);

  // ECharts Option for Bar Chart
  const barChartOption = useMemo(() => {
    const models = chartData.map(d => d.model);
    const sums = chartData.map(d => d.sum);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(5, 17, 37, 0.95)',
        borderColor: '#06b6d4',
        borderWidth: 1,
        textStyle: { fontSize: 16, color: '#fff', fontFamily: 'Microsoft YaHei' },
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = params[0];
          return `<div style="padding: 4px; font-size: 16px; font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
            <div style="color: #94a3b8; margin-bottom: 4px; font-size: 16px;">MODEL NAME: ${item.name}</div>
            <div style="display: flex; justify-content: space-between; gap: 20px; align-items: center; font-size: 16px;">
              <span style="display: flex; align-items: center; gap: 6px; font-size: 16px;">
                <span style="width: 8px; height: 8px; background: #22d3ee; border-radius: 1px;"></span>
                Input Sum:
              </span>
              <span style="color: #67e8f9; font-weight: bold; font-size: 16px;">${item.value.toLocaleString()} pcs</span>
            </div>
          </div>`;
        }
      },
      grid: {
        left: '1%',
        right: '1%',
        top: '6%',
        bottom: '2%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: models,
        axisLine: { lineStyle: { color: 'rgba(6, 182, 212, 0.3)' } },
        axisLabel: {
          color: '#ffffff',
          fontSize: 18,
          fontWeight: 'bold',
          rotate: 30,
          fontFamily: 'Microsoft YaHei',
          interval: 0
        },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(6, 182, 212, 0.3)' } },
        axisLabel: {
          color: '#ffffff',
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'Microsoft YaHei'
        },
        splitLine: {
          lineStyle: { color: 'rgba(6, 182, 212, 0.1)', type: 'dashed' }
        }
      },
      series: [
        {
          name: 'Input 汇总',
          type: 'bar',
          barWidth: '35%',
          data: sums,
          label: {
            show: true,
            position: 'top',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 'bold',
            fontFamily: 'Microsoft YaHei',
            formatter: (params: any) => params.value.toLocaleString()
          },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#06b6d4' },
              { offset: 0.8, color: 'rgba(6, 182, 212, 0.3)' },
              { offset: 1, color: 'rgba(6, 182, 212, 0.05)' }
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#22d3ee' },
                { offset: 0.5, color: '#06b6d4' },
                { offset: 1, color: 'rgba(6, 182, 212, 0.2)' }
              ])
            }
          }
        }
      ]
    };
  }, [chartData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0d1c33] flex flex-col font-sans text-white overflow-hidden shipping-dashboard"
    >
      <style>{`
        .shipping-dashboard, .shipping-dashboard * {
          font-family: "Microsoft YaHei", "微软雅黑", sans-serif !important;
        }
      `}</style>

      {/* Scanline Effect */}
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
            {appData?.projectInfo?.title || "返回主平台"}
          </span>
          <div className="absolute right-0 top-0 w-1 h-1 bg-cyan-400 shadow-[0_0_5px_cyan]" />
        </button>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-cyan-500/20 animate-pulse" />
            <h1 className="relative text-xl md:text-3xl font-black tracking-[0.4em] text-white uppercase drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
              SHIPPING 智能出货看板
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

      {/* Main Grid Content */}
      <div className="flex-1 p-6 flex flex-col gap-4 relative overflow-hidden bg-[#0a1526] min-h-0">
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <motion.div 
            animate={{ y: ["0%", "100%", "0%"] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent blur-xl"
          />
        </div>

        {/* TOP SECTION: Bar Chart (AUO_MODELNAME vs Input Aggregate Sum) */}
        <div className="flex-[4] min-h-0 bg-gradient-to-b from-[#112240]/80 to-[#0a1526]/90 border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.1)] relative z-10 flex flex-col">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-3.5 bg-cyan-400 rounded-sm shadow-[0_0_8px_cyan]" />
              <span className="text-base font-bold uppercase tracking-widest text-cyan-100 font-mono" style={{ fontSize: '18px' }}>AUO Shipping分析</span>
            </div>
            <div className="text-cyan-400/60 font-mono uppercase" style={{ fontSize: '18px' }}>
              呈现 {chartData.length} 个型号的 Input 总量
            </div>
          </div>
          <div className="flex-1 min-h-0">
            {chartData.length > 0 ? (
              <ReactECharts option={barChartOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cyan-400/60 font-mono text-xs">
                暂无数据，请尝试重置筛选器
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: Filterable Data Table */}
        <div className="flex-[6] min-h-0 bg-gradient-to-b from-[#112240]/80 to-[#0a1526]/90 border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.1)] relative z-10 flex flex-col">
          
          {/* Filters & Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-cyan-950/20 border border-cyan-500/20 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold mr-2" style={{ fontSize: '16px' }}>
              <Filter className="w-4 h-4 text-cyan-400" />
              <span>智能数据筛选:</span>
            </div>

            <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {/* ODM Filter */}
              <div className="flex flex-col gap-1">
                <select
                  value={filterOdm}
                  onChange={(e) => setFilterOdm(e.target.value)}
                  className="bg-[#020813] border border-cyan-500/30 rounded-sm text-cyan-200 py-1 px-2 focus:outline-none focus:border-cyan-400 font-mono h-10 cursor-pointer"
                  style={{ fontSize: '16px' }}
                >
                  <option value="" style={{ fontSize: '16px' }}>[ODM] 全部</option>
                  {odmOptions.map(o => (
                    <option key={o} value={o} style={{ fontSize: '16px' }}>{o}</option>
                  ))}
                </select>
              </div>

              {/* Month Filter */}
              <div className="flex flex-col gap-1">
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="bg-[#020813] border border-cyan-500/30 rounded-sm text-cyan-200 py-1 px-2 focus:outline-none focus:border-cyan-400 font-mono h-10 cursor-pointer"
                  style={{ fontSize: '16px' }}
                >
                  <option value="" style={{ fontSize: '16px' }}>[月份] 全部</option>
                  {monthOptions.map(m => (
                    <option key={m} value={m} style={{ fontSize: '16px' }}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Modelname Filter */}
              <div className="flex flex-col gap-1">
                <select
                  value={filterModel}
                  onChange={(e) => setFilterModel(e.target.value)}
                  className="bg-[#020813] border border-cyan-500/30 rounded-sm text-cyan-200 py-1 px-2 focus:outline-none focus:border-cyan-400 font-mono h-10 cursor-pointer"
                  style={{ fontSize: '16px' }}
                >
                  <option value="" style={{ fontSize: '16px' }}>[AUO型号] 全部</option>
                  {modelOptions.map(m => (
                    <option key={m} value={m} style={{ fontSize: '16px' }}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Lenovo PN Filter */}
              <div className="flex flex-col gap-1">
                <select
                  value={filterPn}
                  onChange={(e) => setFilterPn(e.target.value)}
                  className="bg-[#020813] border border-cyan-500/30 rounded-sm text-cyan-200 py-1 px-2 focus:outline-none focus:border-cyan-400 font-mono h-10 cursor-pointer"
                  style={{ fontSize: '16px' }}
                >
                  <option value="" style={{ fontSize: '16px' }}>[联想料号] 全部</option>
                  {pnOptions.map(p => (
                    <option key={p} value={p} style={{ fontSize: '16px' }}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Panel From Filter */}
              <div className="flex flex-col gap-1">
                <select
                  value={filterPanelFrom}
                  onChange={(e) => setFilterPanelFrom(e.target.value)}
                  className="bg-[#020813] border border-cyan-500/30 rounded-sm text-cyan-200 py-1 px-2 focus:outline-none focus:border-cyan-400 font-mono h-10 cursor-pointer"
                  style={{ fontSize: '16px' }}
                >
                  <option value="" style={{ fontSize: '16px' }}>[来源站点] 全部</option>
                  {panelFromOptions.map(pf => (
                    <option key={pf} value={pf} style={{ fontSize: '16px' }}>{pf}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reset Filter Button */}
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-1 bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-500/40 hover:border-cyan-400 rounded shadow-[0_0_10px_rgba(6,182,212,0.15)] transition-all duration-200 h-10 font-mono font-bold text-cyan-200 cursor-pointer"
              style={{ fontSize: '16px' }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>重置筛选</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto cyber-scrollbar border border-cyan-900/40 rounded bg-cyan-950/5">
            <table className="w-full text-center border-collapse border border-cyan-900/40 text-white" style={{ fontSize: '16px' }}>
              <thead className="sticky top-0 z-20 bg-[#102445]">
                <tr className="bg-cyan-500/20 text-white font-bold uppercase tracking-wider font-mono" style={{ fontSize: '18px' }}>
                  <th className="border border-cyan-900/40 py-3 px-3 text-left">ODM</th>
                  <th className="border border-cyan-900/40 py-3 px-3">Month</th>
                  <th className="border border-cyan-900/40 py-3 px-3 text-left">AUO_MODELNAME</th>
                  <th className="border border-cyan-900/40 py-3 px-3 text-left">Lenovo PN</th>
                  <th className="border border-cyan-900/40 py-3 px-3 text-right">Input</th>
                  <th className="border border-cyan-900/40 py-3 px-3">Auo panel from</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-950/40">
                {filteredData.length > 0 ? (
                  filteredData.map((row, idx) => (
                    <tr 
                      key={idx} 
                      className="hover:bg-cyan-500/5 odd:bg-cyan-950/10 transition-colors font-mono text-cyan-100"
                      style={{ fontSize: '16px' }}
                    >
                      <td className="border border-cyan-900/40 py-2.5 px-3 text-left font-semibold text-white">{row.odm}</td>
                      <td className="border border-cyan-900/40 py-2.5 px-3 text-cyan-300">{row.month}</td>
                      <td className="border border-cyan-900/40 py-2.5 px-3 text-left text-cyan-200">{row.modelName}</td>
                      <td className="border border-cyan-900/40 py-2.5 px-3 text-left text-cyan-400">{row.lenovoPn}</td>
                      <td className="border border-cyan-900/40 py-2.5 px-3 text-right font-bold text-white pr-4">{row.input.toLocaleString()}</td>
                      <td className="border border-cyan-900/40 py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 font-bold" style={{ fontSize: '16px' }}>
                          {row.auoPanelFrom}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-cyan-500/60 italic font-mono">
                      无符合当前筛选条件的出货记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Summary Footer */}
          <div className="mt-2.5 flex justify-between items-center text-[11px] text-cyan-500/70 font-mono uppercase tracking-wider">
            <div className="flex gap-4">
              <span>记录条数: <strong className="text-cyan-300">{filteredData.length}</strong> / {SHIPPING_DATA.length}</span>
              <span>Input 汇总: <strong className="text-cyan-300">{filteredData.reduce((acc, curr) => acc + curr.input, 0).toLocaleString()}</strong> pcs</span>
            </div>
            <span>ID: SHIPPING_REPORT_4102</span>
          </div>
        </div>
      </div>

      {/* Render AiAssistant at top-3 right-[350px] as configured internally inside AiAssistant */}
      <AiAssistant workshop="SHIPPING" />
    </motion.div>
  );
}
