import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronRight, Activity, Users, Cpu, Box, ClipboardCheck, Wind, BarChart2, Info, Percent, Network, HelpCircle, TableProperties } from "lucide-react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

interface SubX {
  name: string;
  reportType: string;
  rule: string;
  weight: string;
}

interface SubY {
  name: string;
  subXs: SubX[];
}

interface Category {
  id: string;
  type: string;
  title: string;
  weight: number;
  formulaLabel: string;
  icon: React.ReactNode;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  subYs: SubY[];
}

export const IqcHealthTree: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"tree" | "matrix">("tree");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    personnel: false,
    machine: false,
    material: false,
    method: false,
    environment: false,
  });

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const categories: Category[] = [
    {
      id: "personnel",
      type: "人",
      title: "人员要素 (y1)",
      weight: 0.2,
      formulaLabel: "y1 * 0.2",
      icon: <Users className="w-5 h-5" />,
      colorClass: "text-blue-400 border-blue-500/30",
      borderClass: "border-blue-500/30",
      bgClass: "bg-blue-500/5",
      subYs: [
        {
          name: "出勤率与资质",
          subXs: [
            { name: "IQC检验人力出勤", reportType: "By天", rule: "检验人员出勤率达到100%，健康度判定为100%", weight: "0.5" },
            { name: "岗位上岗证持证率", reportType: "By天", rule: "上岗证有效持证率 >= 95%，判定健康度为100%", weight: "0.5" },
          ],
        }
      ],
    },
    {
      id: "machine",
      type: "机",
      title: "设备要素 (y2)",
      weight: 0.2,
      formulaLabel: "y2 * 0.2",
      icon: <Cpu className="w-5 h-5" />,
      colorClass: "text-purple-400 border-purple-500/30",
      borderClass: "border-purple-500/30",
      bgClass: "bg-purple-500/5",
      subYs: [
        {
          name: "检验设备点检",
          subXs: [
            { name: "主要测量仪点检率", reportType: "By小时", rule: "二次元及其他精密仪器在点检周期内判定100%", weight: "0.5" },
            { name: "设备计量校验状态", reportType: "By天", rule: "所有设备计量证书在有效期内，健康度100%", weight: "0.5" },
          ],
        },
      ],
    },
    {
      id: "material",
      type: "料",
      title: "物料要素 (y3)",
      weight: 0.2,
      formulaLabel: "y3 * 0.2",
      icon: <Box className="w-5 h-5" />,
      colorClass: "text-emerald-400 border-emerald-500/30",
      borderClass: "border-emerald-500/30",
      bgClass: "bg-emerald-500/5",
      subYs: [
        {
          name: "来料抽检品质",
          subXs: [
            { name: "来料批次合格率", reportType: "By天", rule: "批次合格率达到设定基准指标（通常 >= 98%）健康度100%", weight: "1.0" },
          ],
        },
      ],
    },
    {
      id: "method",
      type: "法",
      title: "作业方法标准 (y4)",
      weight: 0.2,
      formulaLabel: "y4 * 0.2",
      icon: <ClipboardCheck className="w-5 h-5" />,
      colorClass: "text-amber-400 border-amber-500/30",
      borderClass: "border-amber-500/30",
      bgClass: "bg-amber-500/5",
      subYs: [
        {
          name: "作业指导与表单",
          subXs: [
            { name: "IQC SOP有效性", reportType: "By天", rule: "检验规范与SOP在有效期内并严格执行，健康度100%", weight: "0.5" },
            { name: "点检表单录入率", reportType: "By天", rule: "检验原始记录、表单100%按时完成并录入系统", weight: "0.5" },
          ],
        },
      ],
    },
    {
      id: "environment",
      type: "环",
      title: "环境要素 (y5)",
      weight: 0.2,
      formulaLabel: "y5 * 0.2",
      icon: <Wind className="w-5 h-5" />,
      colorClass: "text-pink-400 border-pink-500/30",
      borderClass: "border-pink-500/30",
      bgClass: "bg-pink-500/5",
      subYs: [
        {
          name: "检验环境监控",
          subXs: [
            { name: "检验室温度监控", reportType: "By周", rule: "根据检验室温湿度采集，在22±2°C内，健康度为100%", weight: "0.5" },
            { name: "检验室湿度监控", reportType: "By周", rule: "根据检验室温湿度采集，在45-55%RH内，健康度为100%", weight: "0.5" },
          ],
        },
      ],
    },
  ];

  // Map categories to high-tech ECharts tree structure representation
  const echartTreeData = useMemo(() => {
    return {
      name: "大Y (IQC得分)",
      rule: "Y = y1*0.2 + y2*0.2 + y3*0.2 + y4*0.2 + y5*0.2",
      symbol: "circle",
      symbolSize: 14,
      itemStyle: {
        color: "#22d3ee",
        borderColor: "rgba(34, 211, 238, 0.4)",
        borderWidth: 6,
        shadowColor: "#22d3ee",
        shadowBlur: 15,
      },
      label: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#22d3ee",
      },
      children: categories.map((cat) => ({
        name: cat.title,
        weight: `${cat.weight * 100}%`,
        rule: `计算公式: ${cat.formulaLabel}`,
        symbol: "circle",
        symbolSize: 10,
        itemStyle: {
          color: cat.id === "personnel" ? "#60a5fa" :
                 cat.id === "machine" ? "#c084fc" :
                 cat.id === "material" ? "#34d399" :
                 cat.id === "method" ? "#fbbf24" : "#f472b6",
          borderColor: "rgba(255,255,255,0.15)",
          borderWidth: 2,
        },
        label: {
          fontSize: 11,
          fontWeight: "600",
          color: "#fff",
        },
        children: cat.subYs.map((subY) => ({
          name: `[小Y] ${subY.name}`,
          symbol: "circle",
          symbolSize: 7,
          itemStyle: {
            color: "rgba(34, 211, 238, 0.6)",
          },
          label: {
            fontSize: 10,
            color: "#94a3b8",
          },
          children: subY.subXs.map((subX) => ({
            name: `${subX.name} (${subX.weight})`,
            weight: subX.weight,
            period: subX.reportType,
            rule: subX.rule,
            symbol: "circle",
            symbolSize: 6,
            itemStyle: {
              color: "#475569",
              borderColor: "rgba(34, 211, 238, 0.3)",
              borderWidth: 1,
            },
            label: {
              fontSize: 10,
              color: "#cbd5e1",
            },
          })),
        })),
      })),
    };
  }, []);

  const echartOption = useMemo(() => {
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        triggerOn: "mousemove",
        backgroundColor: "rgba(5, 17, 37, 0.95)",
        borderColor: "#22d3ee",
        borderWidth: 1,
        textStyle: {
          color: "#fff",
          fontSize: 15,
          fontFamily: '"Microsoft YaHei", "微软雅黑", sans-serif',
        },
        formatter: (params: any) => {
          const data = params.data;
          let html = `<div style="padding: 4px; min-width: 220px; white-space: normal; word-break: break-all; font-size: 15px;">`;
          html += `<div style="font-weight: bold; color: #22d3ee; margin-bottom: 6px; font-size: 15px; border-bottom: 1px solid rgba(34,211,238,0.2); padding-bottom: 4px;">${data.name}</div>`;
          
          if (data.weight) {
            html += `<div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span style="color: #94a3b8;">权重比值:</span> <span style="color: #e2e8f0; font-weight: bold;">${data.weight}</span></div>`;
          }
          if (data.period) {
            html += `<div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span style="color: #94a3b8;">判定周期:</span> <span style="color: #38bdf8; font-weight: bold;">${data.period}</span></div>`;
          }
          if (data.rule) {
            html += `<div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.1);"><span style="color: #a7f3d0; font-weight: bold; font-size: 15px;">判定规则 / 监控口径:</span><div style="color: #cbd5e1; font-size: 15px; margin-top: 3px; line-height: 1.4;">${data.rule}</div></div>`;
          }
          html += `</div>`;
          return html;
        },
      },
      series: [
        {
          type: "tree",
          data: [echartTreeData],
          top: "4%",
          bottom: "4%",
          left: "10%",
          right: "22%",
          symbolSize: 7,
          orient: "LR",
          label: {
            position: "left",
            verticalAlign: "middle",
            align: "right",
            fontSize: 9,
            color: "#fff",
          },
          leaves: {
            label: {
              position: "right",
              verticalAlign: "middle",
              align: "left",
            },
          },
          expandAndCollapse: true,
          initialTreeDepth: 10,
          animationDuration: 550,
          animationDurationUpdate: 750,
        },
      ],
    };
  }, [echartTreeData]);

  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-cyan-500/20 pb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
          <div>
            <h3 className="text-lg font-black text-white tracking-wider">IQC 系统得分计算规则与指标分解树</h3>
            <p className="text-xs text-slate-200 mt-1 font-mono">
              Y = 人(20%) + 机(20%) + 料(20%) + 法(20%) + 环(20%)
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-cyan-950/60 p-1 rounded-lg border border-cyan-500/20">
          <button
            onClick={() => setActiveTab("tree")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold tracking-wider transition-all duration-200 ${
              activeTab === "tree"
                ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)] font-black"
                : "text-cyan-400/60 hover:text-cyan-300"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            指标关联树
          </button>
          <button
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold tracking-wider transition-all duration-200 ${
              activeTab === "matrix"
                ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)] font-black"
                : "text-cyan-400/60 hover:text-cyan-300"
            }`}
          >
            <TableProperties className="w-3.5 h-3.5" />
            权重矩阵表
          </button>
        </div>
      </div>

      {activeTab === "tree" ? (
        <div className="w-full bg-[#0a1526]/50 border border-cyan-500/10 rounded-lg overflow-hidden h-[480px]">
          <ReactECharts option={echartOption} style={{ height: "100%", width: "100%" }} />
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-y-auto pr-1 cyber-scrollbar">
          {/* Left Side: Y and weights formula diagram */}
          <div className="lg:col-span-4 bg-cyan-950/20 p-5 rounded-lg border border-cyan-500/10 h-full flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
                [ 核心计算公式 ]
              </span>
              <div className="mt-4 p-4 bg-[#0a1526]/80 rounded border border-cyan-500/30 font-mono text-center">
                <div className="text-xs text-slate-200 mb-1">IQC系统得分计算 (大Y)</div>
                <div className="text-base font-bold text-white leading-relaxed">
                  Y = <span className="text-blue-400">y₁·0.2</span> +{" "}
                  <span className="text-purple-400">y₂·0.2</span> +{" "}
                  <span className="text-emerald-400">y₃·0.2</span> +{" "}
                  <span className="text-amber-400">y₄·0.2</span> +{" "}
                  <span className="text-pink-400">y₅·0.2</span>
                </div>
              </div>

              <div className="mt-4 space-y-3.5">
                <div className="flex items-start gap-2.5 text-xs text-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <p>
                    <span className="font-bold text-white">子项得分(小y):</span> 各类别小x分数与小x占比乘积之和。
                  </p>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <p>
                    <span className="font-bold text-white">权重设定:</span> 各要素采用均等化配比，共同监督来料制程健康度。
                  </p>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <p>
                    <span className="font-bold text-white">判定周期:</span> 划分为By天、By小时、By周三阶监控机制。
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-cyan-500/10 text-[11px] text-slate-200 leading-normal font-sans">
              说明：系统采用五大维度动态加权评估，直观、清晰展现IQC全要素状态的健康水平。
            </div>
          </div>

          {/* Right Side: Tabular List Accordion */}
          <div className="lg:col-span-8 space-y-3">
            {categories.map((cat) => {
              const isExpanded = expandedCategories[cat.id];
              return (
                <div
                  key={cat.id}
                  className={`border rounded-lg transition-all duration-300 ${
                    isExpanded
                      ? "bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                      : "bg-cyan-950/10 border-cyan-500/10 hover:border-cyan-500/30"
                  }`}
                >
                  {/* Category Header Node */}
                  <div
                    onClick={() => toggleCategory(cat.id)}
                    className="flex items-center justify-between p-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border font-black text-sm ${cat.colorClass}`}>
                        {cat.type}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{cat.title}</span>
                        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full font-mono">
                          权重 {cat.weight * 100}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-200 hidden sm:inline-block">
                        计算式: {cat.formulaLabel}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-100" />
                      )}
                    </div>
                  </div>

                  {/* Sub Tree Nodes */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-cyan-500/10"
                      >
                        <div className="p-4 bg-[#0a1526]/30 space-y-4">
                          {cat.subYs.map((subY, yIdx) => (
                            <div key={yIdx} className="relative pl-6 border-l-2 border-cyan-500/20 space-y-2">
                              {/* Branch connector visual decoration */}
                              <div className="absolute top-3 left-0 w-4 h-0.5 bg-cyan-500/20" />
                              <div className="absolute top-2 left-0 w-2 h-2 rounded-full bg-cyan-400" />

                              {/* SubY Title */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-cyan-300 font-mono">
                                  [ 小Y ] {subY.name}
                                </span>
                              </div>

                              {/* SubX Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 pt-1">
                                {subY.subXs.map((subX, xIdx) => (
                                  <div
                                    key={xIdx}
                                    className="bg-[#102445]/80 border border-cyan-500/15 rounded p-3 hover:border-cyan-500/30 hover:bg-cyan-950/20 transition-all duration-200"
                                  >
                                    <div className="flex items-center justify-between mb-1.5 border-b border-cyan-500/5 pb-1">
                                      <span className="text-xs font-bold text-white font-sans">{subX.name}</span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] bg-slate-800 text-slate-100 px-1.5 py-0.5 rounded font-mono">
                                          {subX.reportType}
                                        </span>
                                        <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-bold">
                                          占比: {subX.weight}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-[10px] text-slate-200 font-mono leading-relaxed flex items-start gap-1">
                                      <span className="text-cyan-400 shrink-0">评判：</span>
                                      <span>{subX.rule}</span>
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
