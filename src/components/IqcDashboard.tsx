import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Clock, Filter, RefreshCw, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { AiAssistant } from "./AiAssistant";
import { useAppData } from "../App";

export interface IqcRow {
  no: number;
  month: string;
  lenovoModel: string;
  auoModel: string;
  panelFrom: string;
  material: string;
  sizeItem: string;
  min: number;
  center: number;
  max: number;
  p1: number;
  p2: number;
  p3: number;
  p4: number;
  p5: number;
  verdict: string;
}

export const IQC_DATA: IqcRow[] = [
  // NO 1
  { no: 1, month: "Jun", lenovoModel: "SD11M38901", auoModel: "B140UAN04.7", panelFrom: "S01", material: "LGP (62.14BAB.010)", sizeItem: "外长", min: 303.89, center: 304.09, max: 304.29, p1: 304.06, p2: 304.108, p3: 304.09, p4: 304.078, p5: 304.114, verdict: "OK" },
  { no: 1, month: "Jun", lenovoModel: "SD11M38901", auoModel: "B140UAN04.7", panelFrom: "S01", material: "L/B (58.14BAB.008)", sizeItem: "外长", min: 303.29, center: 303.59, max: 303.89, p1: 303.563, p2: 303.626, p3: 303.572, p4: 303.608, p5: 303.599, verdict: "OK" },
  { no: 1, month: "Jun", lenovoModel: "SD11M38901", auoModel: "B140UAN04.7", panelFrom: "S01", material: "DBEF (66.33M10.660)", sizeItem: "外长", min: 303.99, center: 304.19, max: 304.39, p1: 304.202, p2: 304.166, p3: 304.196, p4: 304.178, p5: 304.208, verdict: "OK" },
  { no: 1, month: "Jun", lenovoModel: "SD11M38901", auoModel: "B140UAN04.7", panelFrom: "S01", material: "上棱镜片 (66.33M10.759)", sizeItem: "外长", min: 304.27, center: 304.32, max: 304.37, p1: 304.318, p2: 304.321, p3: 304.322, p4: 304.319, p5: 304.321, verdict: "OK" },
  { no: 1, month: "Jun", lenovoModel: "SD11M38901", auoModel: "B140UAN04.7", panelFrom: "S01", material: "下棱镜片 (66.34M10.504)", sizeItem: "外长", min: 304.26, center: 304.315, max: 304.37, p1: 304.318, p2: 304.313, p3: 304.316, p4: 304.319, p5: 304.312, verdict: "OK" },
  { no: 1, month: "Jun", lenovoModel: "SD11M38901", auoModel: "B140UAN04.7", panelFrom: "S01", material: "下扩散片 (66.32M10.455)", sizeItem: "外长", min: 304.23, center: 304.265, max: 304.3, p1: 304.2644, p2: 304.2659, p3: 304.2638, p4: 304.2653, p5: 304.2656, verdict: "OK" },
  { no: 1, month: "Jun", lenovoModel: "SD11M38901", auoModel: "B140UAN04.7", panelFrom: "S01", material: "胶框 (76.14BB4.001)", sizeItem: "外长", min: 306.51, center: 306.515, max: 306.52, p1: 306.516, p2: 306.513, p3: 306.517, p4: 306.514, p5: 306.516, verdict: "OK" },

  // NO 2
  { no: 2, month: "Jun", lenovoModel: "SD11R09618", auoModel: "B140UAN08.0", panelFrom: "S01", material: "LGP (62.14BB4.001)", sizeItem: "外长", min: 303.69, center: 303.89, max: 304.09, p1: 303.86, p2: 303.908, p3: 303.89, p4: 303.878, p5: 303.914, verdict: "OK" },
  { no: 2, month: "Jun", lenovoModel: "SD11R09618", auoModel: "B140UAN08.0", panelFrom: "S01", material: "L/B (58.14BB4.001)", sizeItem: "外长", min: 303.84, center: 304.09, max: 304.34, p1: 304.063, p2: 304.126, p3: 304.072, p4: 304.108, p5: 304.099, verdict: "OK" },
  { no: 2, month: "Jun", lenovoModel: "SD11R09618", auoModel: "B140UAN08.0", panelFrom: "S01", material: "上扩散片 (66.31M10.212)", sizeItem: "外长", min: 304.41, center: 304.43, max: 304.45, p1: 304.431, p2: 304.428, p3: 304.431, p4: 304.429, p5: 304.432, verdict: "OK" },
  { no: 2, month: "Jun", lenovoModel: "SD11R09618", auoModel: "B140UAN08.0", panelFrom: "S01", material: "上棱镜片 (66.33M10.563)", sizeItem: "外长", min: 304.47, center: 304.52, max: 304.57, p1: 304.518, p2: 304.521, p3: 304.522, p4: 304.519, p5: 304.521, verdict: "OK" },
  { no: 2, month: "Jun", lenovoModel: "SD11R09618", auoModel: "B140UAN08.0", panelFrom: "S01", material: "下棱镜片 (66.34M10.380)", sizeItem: "外长", min: 304.47, center: 304.5, max: 304.53, p1: 304.503, p2: 304.498, p3: 304.501, p4: 304.504, p5: 304.497, verdict: "OK" },
  { no: 2, month: "Jun", lenovoModel: "SD11R09618", auoModel: "B140UAN08.0", panelFrom: "S01", material: "下扩散片 (66.32M10.423)", sizeItem: "外长", min: 304.42, center: 304.44, max: 304.46, p1: 304.4394, p2: 304.4409, p3: 304.4388, p4: 304.4403, p5: 304.4406, verdict: "OK" },
  { no: 2, month: "Jun", lenovoModel: "SD11R09618", auoModel: "B140UAN08.0", panelFrom: "S01", material: "胶框 (76.14BAB.001)", sizeItem: "外长", min: 306.4, center: 306.46, max: 306.52, p1: 306.461, p2: 306.458, p3: 306.462, p4: 306.459, p5: 306.461, verdict: "OK" },

  // NO 3
  { no: 3, month: "Jul", lenovoModel: "SD11M63777", auoModel: "B156HAN15.K", panelFrom: "S01", material: "LGP (62.15BAA.004)", sizeItem: "外长", min: 348.54, center: 348.69, max: 348.84, p1: 348.66, p2: 348.708, p3: 348.69, p4: 348.678, p5: 348.714, verdict: "OK" },
  { no: 3, month: "Jul", lenovoModel: "SD11M63777", auoModel: "B156HAN15.K", panelFrom: "S01", material: "L/B (58.15BAA.007)", sizeItem: "外长", min: 348.39, center: 348.69, max: 348.99, p1: 348.663, p2: 348.726, p3: 348.672, p4: 348.708, p5: 348.699, verdict: "OK" },
  { no: 3, month: "Jul", lenovoModel: "SD11M63777", auoModel: "B156HAN15.K", panelFrom: "S01", material: "上扩散片 (66.31N10.232)", sizeItem: "外长", min: 349.19, center: 349.215, max: 349.24, p1: 349.216, p2: 349.213, p3: 349.216, p4: 349.214, p5: 349.217, verdict: "OK" },
  { no: 3, month: "Jul", lenovoModel: "SD11M63777", auoModel: "B156HAN15.K", panelFrom: "S01", material: "上棱镜片 (66.33N10.320)", sizeItem: "外长", min: 349.19, center: 349.215, max: 349.24, p1: 349.213, p2: 349.216, p3: 349.217, p4: 349.214, p5: 349.216, verdict: "OK" },
  { no: 3, month: "Jul", lenovoModel: "SD11M63777", auoModel: "B156HAN15.K", panelFrom: "S01", material: "下棱镜片 (66.34N10.217)", sizeItem: "外长", min: 349.17, center: 349.21, max: 349.25, p1: 349.213, p2: 349.208, p3: 349.211, p4: 349.214, p5: 349.207, verdict: "OK" },
  { no: 3, month: "Jul", lenovoModel: "SD11M63777", auoModel: "B156HAN15.K", panelFrom: "S01", material: "下扩散片 (66.32N10.216)", sizeItem: "外长", min: 349.17, center: 349.19, max: 349.21, p1: 349.1894, p2: 349.1909, p3: 349.1888, p4: 349.1903, p5: 349.1906, verdict: "OK" },

  // NO 4
  { no: 4, month: "Jul", lenovoModel: "SD11M38960", auoModel: "B160UAN04.9", panelFrom: "S01", material: "LGP (62.16B13.005)", sizeItem: "外长", min: 346.98, center: 347.18, max: 347.38, p1: 347.186, p2: 347.162, p3: 347.198, p4: 347.174, p5: 347.192, verdict: "OK" },
  { no: 4, month: "Jul", lenovoModel: "SD11M38960", auoModel: "B160UAN04.9", panelFrom: "S01", material: "L/B (58.16B13.011)", sizeItem: "外长", min: 346.88, center: 347.18, max: 347.48, p1: 347.135, p2: 347.207, p3: 347.18, p4: 347.162, p5: 347.216, verdict: "OK" },
  { no: 4, month: "Jul", lenovoModel: "SD11M38960", auoModel: "B160UAN04.9", panelFrom: "S01", material: "上棱镜片 (66.33N10.595)", sizeItem: "外长", min: 347.47, center: 347.51, max: 347.55, p1: 347.508, p2: 347.512, p3: 347.509, p4: 347.511, p5: 347.511, verdict: "OK" },
  { no: 4, month: "Jul", lenovoModel: "SD11M38960", auoModel: "B160UAN04.9", panelFrom: "S01", material: "下棱镜片 (66.34N10.383)", sizeItem: "外长", min: 347.45, center: 347.49, max: 347.53, p1: 347.492, p2: 347.486, p3: 347.491, p4: 347.488, p5: 347.493, verdict: "OK" },
  { no: 4, month: "Jul", lenovoModel: "SD11M38960", auoModel: "B160UAN04.9", panelFrom: "S01", material: "下扩散片 (66.32N10.336)", sizeItem: "外长", min: 347.42, center: 347.455, max: 347.49, p1: 347.4538, p2: 347.4556, p3: 347.4559, p4: 347.4547, p5: 347.4553, verdict: "OK" },
  { no: 4, month: "Jul", lenovoModel: "SD11M38960", auoModel: "B160UAN04.9", panelFrom: "S01", material: "胶框 (76.16B06.002)", sizeItem: "外长", min: 347.42, center: 347.455, max: 347.49, p1: 347.457, p2: 347.454, p3: 347.456, p4: 347.457, p5: 347.453, verdict: "OK" },

  // NO 5
  { no: 5, month: "Aug", lenovoModel: "SD11S95555", auoModel: "B153UAN03.1", panelFrom: "S01", material: "LGP (62.15BAF.001)", sizeItem: "外长", min: 331.71, center: 331.91, max: 332.11, p1: 331.898, p2: 331.928, p3: 331.886, p4: 331.916, p5: 331.922, verdict: "OK" },
  { no: 5, month: "Aug", lenovoModel: "SD11S95555", auoModel: "B153UAN03.1", panelFrom: "S01", material: "L/B (58.15BAF.003)", sizeItem: "外长", min: 331.61, center: 331.91, max: 332.21, p1: 331.919, p2: 331.883, p3: 331.937, p4: 331.901, p5: 331.928, verdict: "OK" },
  { no: 5, month: "Aug", lenovoModel: "SD11S95555", auoModel: "B153UAN03.1", panelFrom: "S01", material: "上扩散片 (66.31N10.311)", sizeItem: "外长", min: 332.08, center: 332.105, max: 332.13, p1: 332.102, p2: 332.107, p3: 332.105, p4: 332.104, p5: 332.107, verdict: "OK" },
  { no: 5, month: "Aug", lenovoModel: "SD11S95555", auoModel: "B153UAN03.1", panelFrom: "S01", material: "上棱镜片 (66.33N10.364)", sizeItem: "外长", min: 332.08, center: 332.125, max: 332.17, p1: 332.123, p2: 332.127, p3: 332.124, p4: 332.126, p5: 332.126, verdict: "OK" },
  { no: 5, month: "Aug", lenovoModel: "SD11S95555", auoModel: "B153UAN03.1", panelFrom: "S01", material: "下棱镜片 (66.34N10.285)", sizeItem: "外长", min: 332.08, center: 332.13, max: 332.18, p1: 332.132, p2: 332.126, p3: 332.131, p4: 332.128, p5: 332.133, verdict: "OK" },
  { no: 5, month: "Aug", lenovoModel: "SD11S95555", auoModel: "B153UAN03.1", panelFrom: "S01", material: "下扩散片 (66.32N10.254)", sizeItem: "外长", min: 332.11, center: 332.14, max: 332.17, p1: 332.1388, p2: 332.1406, p3: 332.1409, p4: 332.1397, p5: 332.1403, verdict: "OK" },
  { no: 5, month: "Aug", lenovoModel: "SD11S95555", auoModel: "B153UAN03.1", panelFrom: "S01", material: "胶框 (76.15BAF.001)", sizeItem: "外长", min: 334.34, center: 334.345, max: 334.35, p1: 334.347, p2: 334.344, p3: 334.346, p4: 334.347, p5: 334.343, verdict: "OK" },

  // NO 6
  { no: 6, month: "Aug", lenovoModel: "SD11S95311", auoModel: "B140UAN08.5", panelFrom: "S01", material: "LGP (62.14BB4.002)", sizeItem: "外长", min: 303.79, center: 303.94, max: 304.09, p1: 303.928, p2: 303.958, p3: 303.916, p4: 303.946, p5: 303.952, verdict: "OK" },
  { no: 6, month: "Aug", lenovoModel: "SD11S95311", auoModel: "B140UAN08.5", panelFrom: "S01", material: "L/B (58.14BB4.002)", sizeItem: "外长", min: 303.84, center: 304.09, max: 304.34, p1: 304.099, p2: 304.063, p3: 304.117, p4: 304.081, p5: 304.108, verdict: "OK" },
  { no: 6, month: "Aug", lenovoModel: "SD11S95311", auoModel: "B140UAN08.5", panelFrom: "S01", material: "上棱镜片 (66.33M10.676)", sizeItem: "外长", min: 304.49, center: 304.525, max: 304.56, p1: 304.522, p2: 304.527, p3: 304.525, p4: 304.524, p5: 304.527, verdict: "OK" },
  { no: 6, month: "Aug", lenovoModel: "SD11S95311", auoModel: "B140UAN08.5", panelFrom: "S01", material: "下棱镜片 (66.34M10.447)", sizeItem: "外长", min: 304.52, center: 304.54, max: 304.56, p1: 304.537, p2: 304.544, p3: 304.538, p4: 304.542, p5: 304.541, verdict: "OK" },
  { no: 6, month: "Aug", lenovoModel: "SD11S95311", auoModel: "B140UAN08.5", panelFrom: "S01", material: "下扩散片 (66.32M10.423)", sizeItem: "外长", min: 304.42, center: 304.44, max: 304.46, p1: 304.4406, p2: 304.4388, p3: 304.4403, p4: 304.4394, p5: 304.4409, verdict: "OK" },
  { no: 6, month: "Aug", lenovoModel: "SD11S95311", auoModel: "B140UAN08.5", panelFrom: "S01", material: "胶框 (76.14BB4.001)", sizeItem: "外长", min: 306.51, center: 306.515, max: 306.52, p1: 306.513, p2: 306.516, p3: 306.517, p4: 306.514, p5: 306.516, verdict: "OK" },

  // NO 7
  { no: 7, month: "Aug", lenovoModel: "SD11M38972", auoModel: "B140UAK01.3", panelFrom: "S01", material: "LGP (62.14BA8.001)", sizeItem: "外长", min: 303.94, center: 304.09, max: 304.24, p1: 304.108, p2: 304.078, p3: 304.096, p4: 304.114, p5: 304.072, verdict: "OK" },
  { no: 7, month: "Aug", lenovoModel: "SD11M38972", auoModel: "B140UAK01.3", panelFrom: "S01", material: "L/B (58.14BA8.003)", sizeItem: "外长", min: 303.29, center: 303.59, max: 303.89, p1: 303.572, p2: 303.617, p3: 303.554, p4: 303.599, p5: 303.608, verdict: "OK" },
  { no: 7, month: "Aug", lenovoModel: "SD11M38972", auoModel: "B140UAK01.3", panelFrom: "S01", material: "上棱镜片 (66.33M10.516)", sizeItem: "外长", min: 304.26, center: 304.3, max: 304.34, p1: 304.301, p2: 304.298, p3: 304.302, p4: 304.299, p5: 304.301, verdict: "OK" },
  { no: 7, month: "Aug", lenovoModel: "SD11M38972", auoModel: "B140UAK01.3", panelFrom: "S01", material: "下棱镜片 (66.34M10.370)", sizeItem: "外长", min: 304.3, center: 304.335, max: 304.37, p1: 304.33, p2: 304.338, p3: 304.335, p4: 304.333, p5: 304.339, verdict: "OK" },
  { no: 7, month: "Aug", lenovoModel: "SD11M38972", auoModel: "B140UAK01.3", panelFrom: "S01", material: "下扩散片 (66.32M10.392)", sizeItem: "外长", min: 304.22, center: 304.245, max: 304.27, p1: 304.2441, p2: 304.2462, p3: 304.2444, p4: 304.2456, p5: 304.2453, verdict: "OK" },
  { no: 7, month: "Aug", lenovoModel: "SD11M38972", auoModel: "B140UAK01.3", panelFrom: "S01", material: "胶框 (76.14BA8.002)", sizeItem: "外长", min: 306.48, center: 306.49, max: 306.5, p1: 306.491, p2: 306.488, p3: 306.491, p4: 306.489, p5: 306.492, verdict: "OK" }
];

interface SpcChartProps {
  key?: string;
  title: string;
  row?: IqcRow;
}

export function SpcLineChart({ title, row }: SpcChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; value: number; x: number; y: number } | null>(null);

  if (!row) {
    return (
      <div id={`spc-chart-empty-${title}`} className="bg-[#0b172a]/50 border border-cyan-500/10 rounded-lg p-4 h-[216px] flex flex-col items-center justify-center text-cyan-500/30 text-xs flex-1 min-w-[150px] shrink-0">
        <TrendingUp className="w-6 h-6 text-cyan-500/20 mb-2" />
        <span className="font-bold tracking-wider text-[14px]">{title}</span>
        <span className="mt-1 italic text-[10px] text-cyan-500/40">[无符合筛选数据]</span>
      </div>
    );
  }

  const { min, center, max, p1, p2, p3, p4, p5, material } = row;
  const points = [p1, p2, p3, p4, p5];
  const allValues = [min, center, max, ...points];
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const valRange = maxVal - minVal;
  // Fallback for flat lines, using tighter padding to make chart line taller and closer to top edge
  const padding = valRange === 0 ? 0.05 : valRange * 0.12;

  const yMin = minVal - padding;
  const yMax = maxVal + padding;

  const width = 280;
  const height = 140;
  const margin = { top: 10, right: 14, bottom: 24, left: 82 };

  const getX = (index: number) => {
    return margin.left + (index / 4) * (width - margin.left - margin.right);
  };

  const getY = (val: number) => {
    const ratio = (val - yMin) / (yMax - yMin);
    return height - margin.bottom - ratio * (height - margin.top - margin.bottom);
  };

  // Check if any point is out of spec limits
  const outOfSpec = points.some(p => p < min || p > max);

  return (
    <div 
      id={`spc-chart-card-${title}`}
      className={`flex-1 min-w-[150px] h-[216px] shrink-0 bg-gradient-to-b from-[#112240]/95 to-[#0a1526]/95 border ${
        outOfSpec 
          ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]" 
          : "border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
      } rounded-lg p-3 flex flex-col relative group transition-all duration-300`}
    >
      {/* Chart Header Info */}
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex flex-col min-w-0">
          <span className="text-cyan-300 text-[14px] font-bold tracking-wider uppercase truncate">{title}</span>
          <span className="text-[14px] text-cyan-500/80 font-mono truncate max-w-[180px] block" title={material}>
            {material.substring(material.indexOf("(") + 1, material.indexOf(")")) || material}
          </span>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-[10px] text-emerald-400 font-mono font-semibold">T: {center.toFixed(3)}</span>
          <span className={`text-[9px] px-1 rounded font-bold uppercase ${
            outOfSpec ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
          }`}>
            {outOfSpec ? "OUT" : "OK"}
          </span>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative h-[140px] w-full mt-0.5">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Guidelines for Limits */}
          <line x1={margin.left} y1={getY(center)} x2={width - margin.right} y2={getY(center)} stroke="#10b981" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.6" />
          <line x1={margin.left} y1={getY(max)} x2={width - margin.right} y2={getY(max)} stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.6" />
          <line x1={margin.left} y1={getY(min)} x2={width - margin.right} y2={getY(min)} stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.6" />

          {/* Connected line segments between measured points */}
          {points.map((p, idx) => {
            if (idx === 0) return null;
            const prevP = points[idx - 1];
            const x1 = getX(idx - 1);
            const y1 = getY(prevP);
            const x2 = getX(idx);
            let y2 = getY(p);
            
            // If y1 and y2 are exactly identical, browser SVG engines assign a 0-height bounding box.
            // When a glow filter is applied, this causes the line to disappear in Chrome/Safari/Firefox.
            // Adding an imperceptible 0.01px offset prevents this issue completely.
            if (Math.abs(y1 - y2) < 0.001) {
              y2 += 0.01;
            }
            
            const isSegmentOut = prevP < min || prevP > max || p < min || p > max;

            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isSegmentOut ? "#ef4444" : "#22d3ee"}
                strokeWidth="2"
                filter={isSegmentOut ? "url(#glow-red)" : "url(#glow-cyan)"}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Interactive Circle Hotspots */}
          {points.map((p, idx) => {
            const cx = getX(idx);
            const cy = getY(p);
            const isOut = p < min || p > max;

            return (
              <g key={idx} className="group/node">
                {/* Visual Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="3.5"
                  fill={isOut ? "#ef4444" : "#22d3ee"}
                  stroke="#081426"
                  strokeWidth="1.5"
                  className="transition-all duration-200 group-hover/node:r-5"
                />
                {/* Glowing Background Ring on Hover */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="7"
                  fill="none"
                  stroke={isOut ? "#ef4444" : "#22d3ee"}
                  strokeWidth="1.5"
                  opacity="0"
                  className="transition-all duration-200 group-hover/node:opacity-40"
                />
                {/* Large Invisible Hitbox - Captures SVG coordinates to position tooltip right next to it */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="10"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint({ index: idx, value: p, x: cx, y: cy })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Absolute HTML Labels (Guarantees crisp 10px rendering for Y-axis limits, positioned absolutely) */}
        {/* USL Label */}
        <div 
          className="absolute text-[10px] font-mono font-bold text-white text-right select-none pointer-events-none whitespace-nowrap"
          style={{
            left: "2px",
            width: `${(margin.left / width) * 100 - 4}%`,
            top: `${(getY(max) / height) * 100}%`,
            transform: "translateY(-50%)"
          }}
        >
          USL: {max.toFixed(3)}
        </div>

        {/* CL Label */}
        <div 
          className="absolute text-[10px] font-mono font-bold text-emerald-400 text-right select-none pointer-events-none whitespace-nowrap"
          style={{
            left: "2px",
            width: `${(margin.left / width) * 100 - 4}%`,
            top: `${(getY(center) / height) * 100}%`,
            transform: "translateY(-50%)"
          }}
        >
          CL: {center.toFixed(3)}
        </div>

        {/* LSL Label */}
        <div 
          className="absolute text-[10px] font-mono font-bold text-white text-right select-none pointer-events-none whitespace-nowrap"
          style={{
            left: "2px",
            width: `${(margin.left / width) * 100 - 4}%`,
            top: `${(getY(min) / height) * 100}%`,
            transform: "translateY(-50%)"
          }}
        >
          LSL: {min.toFixed(3)}
        </div>

        {/* Bottom Ticks (#1 to #5) with 12px text size */}
        {["#1", "#2", "#3", "#4", "#5"].map((tick, idx) => (
          <div
            key={idx}
            className="absolute text-[12px] font-mono font-bold text-slate-400 select-none pointer-events-none"
            style={{
              left: `${(getX(idx) / width) * 100}%`,
              bottom: "0px",
              transform: "translateX(-50%)"
            }}
          >
            {tick}
          </div>
        ))}

        {/* Floating Rich Tooltip positioned relative to node coordinates on the card itself for absolute stability */}
        {hoveredPoint && (
          <div 
            id={`spc-chart-tooltip-${title}`}
            className="absolute z-50 bg-slate-950/95 border border-cyan-500/80 rounded px-2.5 py-1 text-[12px] text-white font-mono pointer-events-none shadow-[0_0_15px_rgba(6,182,212,0.6)] -translate-x-1/2 -translate-y-[108%]"
            style={{ 
              left: `${(hoveredPoint.x / width) * 100}%`, 
              top: `${(hoveredPoint.y / height) * 100}%` 
            }}
          >
            <div className="font-bold text-cyan-400 text-[12px]">测试点 #{hoveredPoint.index + 1}</div>
            <div className="mt-0.5 whitespace-nowrap">测量值: <strong className="text-emerald-400">{hoveredPoint.value.toFixed(3)} mm</strong></div>
            <div className="text-[12px] whitespace-nowrap">偏差: <span className={hoveredPoint.value - center >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {(hoveredPoint.value - center) >= 0 ? "+" : ""}{(hoveredPoint.value - center).toFixed(3)} mm
            </span></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IqcDashboard({ onBack }: { onBack: () => void; onOpenClosedLoop?: () => void }) {
  const appData = useAppData();
  const [time, setTime] = useState(new Date());

  // Filter States
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterLenovoModel, setFilterLenovoModel] = useState<string>("");
  const [filterAuoModel, setFilterAuoModel] = useState<string>("");
  const [filterMaterial, setFilterMaterial] = useState<string>("");
  const [filterVerdict, setFilterVerdict] = useState<string>("");

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

  // Options
  const monthOptions = useMemo(() => Array.from(new Set(IQC_DATA.map(d => d.month))).sort(), []);
  const lenovoModelOptions = useMemo(() => Array.from(new Set(IQC_DATA.map(d => d.lenovoModel))).sort(), []);
  const auoModelOptions = useMemo(() => Array.from(new Set(IQC_DATA.map(d => d.auoModel))).sort(), []);
  const materialOptions = useMemo(() => {
    // Extract base material category names
    const mats = IQC_DATA.map(d => d.material.split(" ")[0]);
    return Array.from(new Set(mats)).sort();
  }, []);
  const verdictOptions = useMemo(() => Array.from(new Set(IQC_DATA.map(d => d.verdict))).sort(), []);

  const handleResetFilters = () => {
    setFilterMonth("");
    setFilterLenovoModel("");
    setFilterAuoModel("");
    setFilterMaterial("");
    setFilterVerdict("");
  };

  const filteredData = useMemo(() => {
    return IQC_DATA.filter(row => {
      if (filterMonth && row.month !== filterMonth) return false;
      if (filterLenovoModel && row.lenovoModel !== filterLenovoModel) return false;
      if (filterAuoModel && row.auoModel !== filterAuoModel) return false;
      if (filterMaterial && !row.material.startsWith(filterMaterial)) return false;
      if (filterVerdict && row.verdict !== filterVerdict) return false;
      return true;
    });
  }, [filterMonth, filterLenovoModel, filterAuoModel, filterMaterial, filterVerdict]);

  // Batch states & calculation for linking with filters
  const availableBatches = useMemo(() => {
    const batchesMap = new Map<number, { no: number; lenovoModel: string; auoModel: string; month: string }>();
    filteredData.forEach(row => {
      if (!batchesMap.has(row.no)) {
        batchesMap.set(row.no, {
          no: row.no,
          lenovoModel: row.lenovoModel,
          auoModel: row.auoModel,
          month: row.month
        });
      }
    });
    return Array.from(batchesMap.values()).sort((a, b) => a.no - b.no);
  }, [filteredData]);

  const [selectedBatchNo, setSelectedBatchNo] = useState<number | null>(null);

  useEffect(() => {
    if (availableBatches.length > 0) {
      if (selectedBatchNo === null || !availableBatches.some(b => b.no === selectedBatchNo)) {
        setSelectedBatchNo(availableBatches[0].no);
      }
    } else {
      setSelectedBatchNo(null);
    }
  }, [availableBatches, selectedBatchNo]);

  const itemsToRender = [
    { key: "LGP", label: "LGP" },
    { key: "L/B", label: "L/B" },
    { key: "DBEF", label: "DBEF" },
    { key: "上扩散片", label: "上扩散片" },
    { key: "上棱镜片", label: "上棱镜片" },
    { key: "下棱镜片", label: "下棱镜片" },
    { key: "下扩散片", label: "下扩散片" },
    { key: "胶框", label: "胶框" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0d1c33] flex flex-col font-sans text-white overflow-hidden iqc-dashboard"
    >
      <style>{`
        .iqc-dashboard, .iqc-dashboard * {
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
              IQC 来料品质看板
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
      <div className="flex-1 p-6 flex gap-6 relative overflow-hidden bg-[#0a1526] min-h-0 z-10">
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <motion.div 
            animate={{ y: ["0%", "100%", "0%"] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent blur-xl"
          />
        </div>

        {/* LEFT COLUMN: Massive Table (styled like Shipping Table) */}
        <div className="flex-1 flex flex-col gap-4 bg-gradient-to-b from-[#112240]/80 to-[#0a1526]/90 border border-cyan-500/30 rounded-xl p-5 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative z-10 min-h-0">
          {/* Filters & Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-cyan-950/20 border border-cyan-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold mr-2 text-base">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span>品质数据智能筛选:</span>
            </div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2.5">
              {/* Month Filter */}
              <div className="flex flex-col gap-1">
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="bg-[#020813] border border-cyan-500/30 rounded-sm text-cyan-200 py-1.5 px-2 focus:outline-none focus:border-cyan-400 font-mono h-10 cursor-pointer text-base"
                >
                  <option value="">[月份] 全部</option>
                  {monthOptions.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Lenovo PN / Model Filter */}
              <div className="flex flex-col gap-1">
                <select
                  value={filterLenovoModel}
                  onChange={(e) => setFilterLenovoModel(e.target.value)}
                  className="bg-[#020813] border border-cyan-500/30 rounded-sm text-cyan-200 py-1.5 px-2 focus:outline-none focus:border-cyan-400 font-mono h-10 cursor-pointer text-base"
                >
                  <option value="">[联想料号] 全部</option>
                  {lenovoModelOptions.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* AUO Model Filter */}
              <div className="flex flex-col gap-1">
                <select
                  value={filterAuoModel}
                  onChange={(e) => setFilterAuoModel(e.target.value)}
                  className="bg-[#020813] border border-cyan-500/30 rounded-sm text-cyan-200 py-1.5 px-2 focus:outline-none focus:border-cyan-400 font-mono h-10 cursor-pointer text-base"
                >
                  <option value="">[AUO型号] 全部</option>
                  {auoModelOptions.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Material Component Filter */}
              <div className="flex flex-col gap-1">
                <select
                  value={filterMaterial}
                  onChange={(e) => setFilterMaterial(e.target.value)}
                  className="bg-[#020813] border border-cyan-500/30 rounded-sm text-cyan-200 py-1.5 px-2 focus:outline-none focus:border-cyan-400 font-mono h-10 cursor-pointer text-base"
                >
                  <option value="">[检验部材] 全部</option>
                  {materialOptions.map(mat => (
                    <option key={mat} value={mat}>{mat}</option>
                  ))}
                </select>
              </div>

              {/* Verdict Filter */}
              <div className="flex flex-col gap-1">
                <select
                  value={filterVerdict}
                  onChange={(e) => setFilterVerdict(e.target.value)}
                  className="bg-[#020813] border border-cyan-500/30 rounded-sm text-cyan-200 py-1.5 px-2 focus:outline-none focus:border-cyan-400 font-mono h-10 cursor-pointer text-base"
                >
                  <option value="">[判定结果] 全部</option>
                  {verdictOptions.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-500/40 hover:border-cyan-400 rounded shadow-[0_0_10px_rgba(6,182,212,0.15)] transition-all duration-200 h-10 font-mono font-bold text-cyan-200 cursor-pointer text-base"
            >
              <RefreshCw className="w-4 h-4" />
              <span>重置筛选</span>
            </button>
          </div>

          {/* SPC Quality Charts Panel */}
          <div className="flex flex-col gap-3 bg-cyan-950/25 border border-cyan-500/15 rounded-lg p-3">
            {/* Header with Linked Batch Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 bg-cyan-500 shadow-[0_0_8px_cyan] block" />
                <span className="text-cyan-300 font-bold tracking-wider text-[13px] uppercase">IQC来料抽检SPC</span>
                <span className="text-[11px] text-cyan-500/70 font-mono">| 联动批次选择 (SELECT BATCH):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableBatches.map((batch) => {
                  const isActive = selectedBatchNo === batch.no;
                  return (
                    <button
                      key={batch.no}
                      id={`batch-btn-${batch.no}`}
                      onClick={() => setSelectedBatchNo(batch.no)}
                      className={`px-2.5 py-1 text-[11px] font-mono font-bold transition-all border ${
                        isActive
                          ? "bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                          : "bg-[#020813] text-cyan-500/70 border-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/30"
                      } rounded cursor-pointer`}
                    >
                      #{batch.no} {batch.lenovoModel}
                    </button>
                  );
                })}
                {availableBatches.length === 0 && (
                  <span className="text-xs text-rose-400 italic">[无可显示批次]</span>
                )}
              </div>
            </div>

            {/* 8 Line Charts - Always in a single scrollable row */}
            <div className="flex flex-row flex-nowrap overflow-x-auto gap-3 pb-2.5 cyber-scrollbar">
              {itemsToRender.map((item) => {
                const row = filteredData.find(
                  (r) => r.no === selectedBatchNo && r.material.startsWith(item.key)
                );
                return (
                  <SpcLineChart
                    key={item.key}
                    title={item.label}
                    row={row}
                  />
                );
              })}
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto cyber-scrollbar border border-cyan-900/40 rounded bg-cyan-950/5 min-h-0">
            <table className="w-full text-center border-collapse text-white">
              <thead className="sticky top-0 z-20 bg-[#102445]">
                <tr className="bg-cyan-500/20 text-white font-bold uppercase tracking-wider font-mono text-[13px]">
                  <th className="border border-cyan-900/40 py-3 px-2 text-center">NO.</th>
                  <th className="border border-cyan-900/40 py-3 px-2">月份</th>
                  <th className="border border-cyan-900/40 py-3 px-2 text-left">联想料号</th>
                  <th className="border border-cyan-900/40 py-3 px-2 text-left">AUO型号</th>
                  <th className="border border-cyan-900/40 py-3 px-2">来源</th>
                  <th className="border border-cyan-900/40 py-3 px-2 text-left">检验部材</th>
                  <th className="border border-cyan-900/40 py-3 px-2">尺寸项目</th>
                  <th className="border border-cyan-900/40 py-3 px-2 text-right">Min (下限)</th>
                  <th className="border border-cyan-900/40 py-3 px-2 text-right">中心值</th>
                  <th className="border border-cyan-900/40 py-3 px-2 text-right">Max (上限)</th>
                  <th className="border border-cyan-900/40 py-3 px-2 text-right">#1</th>
                  <th className="border border-cyan-900/40 py-3 px-2 text-right">#2</th>
                  <th className="border border-cyan-900/40 py-3 px-2 text-right">#3</th>
                  <th className="border border-cyan-900/40 py-3 px-2 text-right">#4</th>
                  <th className="border border-cyan-900/40 py-3 px-2 text-right">#5</th>
                  <th className="border border-cyan-900/40 py-3 px-2">判定</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-950/40 text-[13px] font-mono">
                {filteredData.length > 0 ? (
                  filteredData.map((row, idx) => (
                    <tr 
                      key={idx} 
                      className="hover:bg-cyan-500/5 odd:bg-cyan-950/10 transition-colors text-cyan-100"
                    >
                      <td className="border border-cyan-900/40 py-2 px-1 font-bold text-white text-center">{row.no}</td>
                      <td className="border border-cyan-900/40 py-2 px-1 text-cyan-300 text-center">{row.month}</td>
                      <td className="border border-cyan-900/40 py-2 px-2 text-left text-cyan-400 font-semibold">{row.lenovoModel}</td>
                      <td className="border border-cyan-900/40 py-2 px-2 text-left text-cyan-200 font-semibold">{row.auoModel}</td>
                      <td className="border border-cyan-900/40 py-2 px-1 text-center text-cyan-400">{row.panelFrom}</td>
                      <td className="border border-cyan-900/40 py-2 px-2 text-left font-sans text-white max-w-[150px] truncate" title={row.material}>{row.material}</td>
                      <td className="border border-cyan-900/40 py-2 px-1 text-center text-cyan-300 font-sans">{row.sizeItem}</td>
                      <td className="border border-cyan-900/40 py-2 px-2 text-right text-white font-medium">{row.min.toFixed(3)}</td>
                      <td className="border border-cyan-900/40 py-2 px-2 text-right text-emerald-400 font-bold">{row.center.toFixed(3)}</td>
                      <td className="border border-cyan-900/40 py-2 px-2 text-right text-white font-medium">{row.max.toFixed(3)}</td>
                      <td className="border border-cyan-900/40 py-2 px-2 text-right text-emerald-400 font-medium">{row.p1.toFixed(3)}</td>
                      <td className="border border-cyan-900/40 py-2 px-2 text-right text-emerald-400 font-medium">{row.p2.toFixed(3)}</td>
                      <td className="border border-cyan-900/40 py-2 px-2 text-right text-emerald-400 font-medium">{row.p3.toFixed(3)}</td>
                      <td className="border border-cyan-900/40 py-2 px-2 text-right text-emerald-400 font-medium">{row.p4.toFixed(3)}</td>
                      <td className="border border-cyan-900/40 py-2 px-2 text-right text-emerald-400 font-medium">{row.p5.toFixed(3)}</td>
                      <td className="border border-cyan-900/40 py-2 px-1 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 font-bold text-emerald-400 text-[11px]">
                          {row.verdict}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={16} className="py-12 text-center text-cyan-500/60 italic font-mono">
                      无符合当前过滤条件的物理检测数据记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Summary Footer */}
          <div className="mt-2.5 flex justify-between items-center text-xs text-cyan-500/70 font-mono uppercase tracking-wider">
            <div className="flex gap-6">
              <span>受控点数: <strong className="text-cyan-300">{filteredData.length}</strong> / {IQC_DATA.length} 个项目</span>
              <span>平均标准中心值: <strong className="text-emerald-400 font-bold">
                {(filteredData.length > 0 ? filteredData.reduce((acc, c) => acc + c.center, 0) / filteredData.length : 0).toFixed(3)}
              </strong> mm</span>
            </div>
            <span>ID: IQC_PHYSICAL_REPORT_2026</span>
          </div>
        </div>

      </div>

      {/* Render AiAssistant at top-3 right-[350px] as configured internally inside AiAssistant */}
      <AiAssistant workshop="IQC" />
    </motion.div>
  );
}
