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

export const CutHealthTree: React.FC<{ site?: string }> = ({ site = "cut" }) => {
  const isPfa = site.toLowerCase() === "pfa";
  const isBonding = site.toLowerCase() === "bonding" || site.toLowerCase() === "bnd";
  const isAssy = site.toLowerCase() === "assy" || site.toLowerCase() === "asy";
  const [activeTab, setActiveTab] = useState<"tree" | "matrix">("tree");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    personnel: false,
    machine: false,
    material: false,
    method: false,
    environment: false,
    measurement: false,
  });

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const categories: Category[] = useMemo(() => {
    if (isAssy) {
      return [
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
              name: "出勤率",
              subXs: [
                { name: "ASSY人力", reportType: "By天", rule: "针对联想model，所有人力健康度一定为100%", weight: "0.4" },
                { name: "锁螺丝岗位人力", reportType: "By天", rule: "针对联想model，所有人力健康度一定为100%", weight: "0.3" },
                { name: "电测抽检人力", reportType: "By天", rule: "针对联想model，所有人力健康度一定为100%", weight: "0.3" },
              ],
            },
            {
              name: "异常录入",
              subXs: [
                { name: "外观抽检人力", reportType: "By天", rule: "针对联想model，所有人力健康度一定为100%", weight: "1.0" },
              ],
            },
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
              name: "制程参数",
              subXs: [
                { name: "组装速度", reportType: "By小时", rule: "spec范围内判定健康度100%", weight: "1/2" },
                { name: "保压时间", reportType: "By小时", rule: "spec范围内判定健康度100%", weight: "1/2" },
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
              name: "结构件与背光来料品质",
              subXs: [
                { name: "CELL来料合格率", reportType: "By天", rule: "系统检验良率 >= 98%，健康度为100%", weight: "0.5" },
                { name: "POL合格率", reportType: "By天", rule: "系统检验良率 >= 98%，健康度为100%", weight: "0.5" },
              ],
            },
          ],
        },
        {
          id: "method",
          type: "法",
          title: "工艺法规 (y4)",
          weight: 0.1,
          formulaLabel: "y4 * 0.1",
          icon: <ClipboardCheck className="w-5 h-5" />,
          colorClass: "text-amber-400 border-amber-500/30",
          borderClass: "border-amber-500/30",
          bgClass: "bg-amber-500/5",
          subYs: [
            {
              name: "作业标准SOP",
              subXs: [
                { name: "ASSY SOP", reportType: "By天", rule: "作业标准SOP在有效期内健康度为100%", weight: "0.5" },
                { name: "ASSY打螺丝工艺标准", reportType: "By天", rule: "作业标准SOP在有效期内健康度为100%", weight: "0.5" },
              ],
            },
          ],
        },
        {
          id: "environment",
          type: "环",
          title: "环境要素 (y5)",
          weight: 0.1,
          formulaLabel: "y5 * 0.1",
          icon: <Wind className="w-5 h-5" />,
          colorClass: "text-pink-400 border-pink-500/30",
          borderClass: "border-pink-500/30",
          bgClass: "bg-pink-500/5",
          subYs: [
            {
              name: "温度监控",
              subXs: [
                { name: "ASSY温度监控", reportType: "By周", rule: "根据无尘室温度采集数据，在20-26°，健康度就为100%", weight: "0.5" },
                { name: "电测区温度监控", reportType: "By周", rule: "根据无尘室温度采集数据，在20-26°，健康度就为100%", weight: "0.5" },
              ],
            },
            {
              name: "湿度监控",
              subXs: [
                { name: "ASSY湿度", reportType: "By周", rule: "根据无尘室湿度采集数据，在45-60RH%，健康度就为100%", weight: "0.5" },
                { name: "外观检测区湿度", reportType: "By周", rule: "根据无尘室湿度采集数据，在45-60RH%，健康度就为100%", weight: "0.5" },
              ],
            },
            {
              name: "Particle监控",
              subXs: [
                { name: "ASSY洁净工作台Particle", reportType: "By周", rule: "0.5um与5.0um颗粒数在ISO-8范围内判定健康度100%", weight: "1.0" },
              ],
            },
          ],
        },
        {
          id: "measurement",
          type: "测",
          title: "测量要素 (y6)",
          weight: 0.2,
          formulaLabel: "y6 * 0.2",
          icon: <BarChart2 className="w-5 h-5" />,
          colorClass: "text-cyan-400 border-cyan-500/30",
          borderClass: "border-cyan-500/30",
          bgClass: "bg-cyan-500/5",
          subYs: [
            {
              name: "ASSY直通良率监控",
              subXs: [
                { name: "异物&气泡直通良率", reportType: "By天", rule: "良率>=95%,健康度为100%", weight: "1.0" },
              ],
            },
          ],
        },
      ];
    }
    if (isBonding) {
      return [
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
              name: "出勤率",
              subXs: [
                { name: "BD人力", reportType: "By天", rule: "针对联想model，所有人力健康度一定为100%", weight: "0.3" },
                { name: "外观抽检人力", reportType: "By天", rule: "针对联想model，所有人力健康度一定为100%", weight: "0.7" },
              ],
            },
            {
              name: "异常录入",
              subXs: [
                { name: "本压抽检人力", reportType: "By天", rule: "针对联想model，所有人力健康度一定为100%", weight: "1/3" },
              ],
            },
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
              name: "制程参数",
              subXs: [
                { name: "本压时间", reportType: "By小时", rule: "spec范围内判定健康度100%", weight: "1/3" },
                { name: "本压温度", reportType: "By小时", rule: "spec范围内判定健康度100%", weight: "1/3" },
                { name: "本压压力", reportType: "By小时", rule: "spec范围内判定健康度100%", weight: "1/3" },
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
              name: "BD材料不良",
              subXs: [
                { name: "FP1200", reportType: "By天", rule: "系统检验良率 >= 97%，健康度为100%", weight: "0.5" },
                { name: "FP1600", reportType: "By天", rule: "系统检验良率 >= 97%，健康度为100%", weight: "0.5" },
              ],
            },
          ],
        },
        {
          id: "method",
          type: "法",
          title: "工艺法规 (y4)",
          weight: 0.1,
          formulaLabel: "y4 * 0.1",
          icon: <ClipboardCheck className="w-5 h-5" />,
          colorClass: "text-amber-400 border-amber-500/30",
          borderClass: "border-amber-500/30",
          bgClass: "bg-amber-500/5",
          subYs: [
            {
              name: "作业标准SOP",
              subXs: [
                { name: "BD SOP", reportType: "By天", rule: "作业标准SOP在有效期内健康度为100%", weight: "0.5" },
                { name: "BD表单", reportType: "By天", rule: "作业标准SOP在有效期内健康度为100%", weight: "0.5" },
              ],
            },
          ],
        },
        {
          id: "environment",
          type: "环",
          title: "环境要素 (y5)",
          weight: 0.1,
          formulaLabel: "y5 * 0.1",
          icon: <Wind className="w-5 h-5" />,
          colorClass: "text-pink-400 border-pink-500/30",
          borderClass: "border-pink-500/30",
          bgClass: "bg-pink-500/5",
          subYs: [
            {
              name: "温度监控",
              subXs: [
                { name: "BD温度监控", reportType: "By周", rule: "根据无尘室温度采集数据，在20-25°，健康度就为100%", weight: "1/3" },
                { name: "BD站温度监控", reportType: "By周", rule: "根据无尘室温度采集数据，在20-25°，健康度就为100%", weight: "1/3" },
              ],
            },
            {
              name: "湿度监控",
              subXs: [
                { name: "BD湿度监控", reportType: "By周", rule: "根据无尘室湿度采集数据，在50-56RH%，健康度就为100%", weight: "1/3" },
                { name: "BD站湿度监控", reportType: "By周", rule: "根据无尘室湿度采集数据，在50-56RH%，健康度就为100%", weight: "1/3" },
              ],
            },
            {
              name: "Particle监控",
              subXs: [
                { name: "BD站Particle监控", reportType: "By周", rule: "\"0.5um(0-10000颗) 1.0um(0-2400颗) 5.0um(0-80颗)，各粒径颗粒数在spec范围内，健康度就为100%\"", weight: "1/3" },
              ],
            },
          ],
        },
        {
          id: "measurement",
          type: "测",
          title: "测量要素 (y6)",
          weight: 0.2,
          formulaLabel: "y6 * 0.2",
          icon: <BarChart2 className="w-5 h-5" />,
          colorClass: "text-cyan-400 border-cyan-500/30",
          borderClass: "border-cyan-500/30",
          bgClass: "bg-cyan-500/5",
          subYs: [
            {
              name: "BD良率Chart",
              subXs: [
                { name: "参考人员检验判定的数据表做", reportType: "By天", rule: "良率>=98%,健康度为100%", weight: "1.0" },
              ],
            },
          ],
        },
      ];
    }

    if (isPfa) {
      return [
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
              name: "出勤率",
              subXs: [
                { name: "PFA人力", reportType: "By天", rule: "针对联想model，所有人力健康度一定为100%", weight: "0.3" },
                { name: "画检抽检人力", reportType: "By天", rule: "针对联想model，所有人力健康度一定为100%", weight: "0.7" },
              ],
            },
            {
              name: "异常录入",
              subXs: [
                { name: "外观抽检人力", reportType: "By天", rule: "针对联想model，所有人力健康度一定为100%", weight: "1/3" },
              ],
            },
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
              name: "制程参数",
              subXs: [
                { name: "研磨时间", reportType: "By小时", rule: "spec范围内判定健康度100%", weight: "1/6" },
                { name: "研磨速度", reportType: "By小时", rule: "spec范围内判定健康度100%", weight: "1/6" },
                { name: "研磨压力", reportType: "By小时", rule: "spec范围内判定健康度100%", weight: "1/6" },
                { name: "贴附压力", reportType: "By小时", rule: "spec范围内判定健康度100%", weight: "1/6" },
                { name: "贴附速度", reportType: "By小时", rule: "spec范围内判定健康度100%", weight: "1/6" },
                { name: "贴附时间", reportType: "By小时", rule: "spec范围内判定健康度100%", weight: "1/6" },
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
              name: "偏光板来料不良",
              subXs: [
                { name: "DP1100", reportType: "By天", rule: "系统检验良率 >= 97%，健康度为100%", weight: "0.5" },
                { name: "DP1510", reportType: "By天", rule: "系统检验良率 >= 97%，健康度为100%", weight: "0.5" },
              ],
            },
          ],
        },
        {
          id: "method",
          type: "法",
          title: "工艺法规 (y4)",
          weight: 0.1,
          formulaLabel: "y4 * 0.1",
          icon: <ClipboardCheck className="w-5 h-5" />,
          colorClass: "text-amber-400 border-amber-500/30",
          borderClass: "border-amber-500/30",
          bgClass: "bg-amber-500/5",
          subYs: [
            {
              name: "作业标准SOP",
              subXs: [
                { name: "PFA SOP", reportType: "By天", rule: "作业标准SOP在有效期内健康度为100%", weight: "0.5" },
                { name: "PFA表单", reportType: "By天", rule: "作业标准SOP在有效期内健康度为100%", weight: "0.5" },
              ],
            },
          ],
        },
        {
          id: "environment",
          type: "环",
          title: "环境要素 (y5)",
          weight: 0.1,
          formulaLabel: "y5 * 0.1",
          icon: <Wind className="w-5 h-5" />,
          colorClass: "text-pink-400 border-pink-500/30",
          borderClass: "border-pink-500/30",
          bgClass: "bg-pink-500/5",
          subYs: [
            {
              name: "温度监控",
              subXs: [
                { name: "PFA温度监控", reportType: "By周", rule: "根据无尘室温度采集数据，在20-25°，健康度就为100%", weight: "1/3" },
                { name: "PFA站温度监控", reportType: "By周", rule: "根据无尘室温度采集数据，在20-25°，健康度就为100%", weight: "1/3" },
              ],
            },
            {
              name: "湿度监控",
              subXs: [
                { name: "PFA湿度监控", reportType: "By周", rule: "根据无尘室湿度采集数据，在50-56RH%，健康度就为100%", weight: "1/3" },
                { name: "PFA站湿度监控", reportType: "By周", rule: "根据无尘室湿度采集数据，在50-56RH%，健康度就为100%", weight: "1/3" },
              ],
            },
            {
              name: "Particle监控",
              subXs: [
                { name: "PFA站Particle监控", reportType: "By周", rule: "\"0.5um(0-100000颗) 5um (0-800颗)，两种颗粒数在spec范围内，健康度就为100%\"", weight: "1/3" },
              ],
            },
          ],
        },
        {
          id: "measurement",
          type: "测",
          title: "测量要素 (y6)",
          weight: 0.2,
          formulaLabel: "y6 * 0.2",
          icon: <BarChart2 className="w-5 h-5" />,
          colorClass: "text-cyan-400 border-cyan-500/30",
          borderClass: "border-cyan-500/30",
          bgClass: "bg-cyan-500/5",
          subYs: [
            {
              name: "PFA良率Chart",
              subXs: [
                { name: "参考人员检验判定的数据表做", reportType: "By天", rule: "良率>=98%,健康度为100%", weight: "1.0" },
              ],
            },
          ],
        },
      ];
    }

    return [
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
            name: "出勤率",
            subXs: [
              { name: "切割人力", reportType: "By天", rule: "针对联想model，所有人力健康度一定为100%", weight: "0.3" },
              { name: "画检人力", reportType: "By天", rule: "针对联想model，所有人力健康度一定为100%", weight: "0.7" },
            ],
          },
          {
            name: "异常录入",
            subXs: [
              { name: "外观人力", reportType: "By天", rule: "针对联想model，所有人力健康度一定为100%", weight: "1/3" },
            ],
          },
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
            name: "制程参数",
            subXs: [
              { name: "切割压力", reportType: "By小时", rule: "spec范围内判定健康度100%", weight: "1/3" },
              { name: "下压深度", reportType: "By小时", rule: "spec范围内判定健康度100%", weight: "1/3" },
              { name: "切割速度", reportType: "By小时", rule: "spec范围内判定健康度100%", weight: "1/3" },
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
            name: "前段cell良率监控",
            subXs: [
              { name: "DA1100", reportType: "By天", rule: "系统检验良率 >= 97%，健康度为100%", weight: "0.5" },
              { name: "DC1510", reportType: "By天", rule: "系统检验良率 >= 97%，健康度为100%", weight: "0.5" },
            ],
          },
        ],
      },
      {
        id: "method",
        type: "法",
        title: "工艺法规 (y4)",
        weight: 0.1,
        formulaLabel: "y4 * 0.1",
        icon: <ClipboardCheck className="w-5 h-5" />,
        colorClass: "text-amber-400 border-amber-500/30",
        borderClass: "border-amber-500/30",
        bgClass: "bg-amber-500/5",
        subYs: [
          {
            name: "作业标准SOP",
            subXs: [
              { name: "Cutting SOP", reportType: "By天", rule: "作业标准SOP在有效期内健康度为100%", weight: "0.5" },
              { name: "Cutting 表单", reportType: "By天", rule: "作业标准SOP在有效期内健康度为100%", weight: "0.5" },
            ],
          },
        ],
      },
      {
        id: "environment",
        type: "环",
        title: "环境要素 (y5)",
        weight: 0.1,
        formulaLabel: "y5 * 0.1",
        icon: <Wind className="w-5 h-5" />,
        colorClass: "text-pink-400 border-pink-500/30",
        borderClass: "border-pink-500/30",
        bgClass: "bg-pink-500/5",
        subYs: [
          {
            name: "温度监控",
            subXs: [
              { name: "Kitting温度监控", reportType: "By周", rule: "根据无尘室温度采集数据，在20-25°，健康度就为100%", weight: "1/3" },
              { name: "切割站温度监控", reportType: "By周", rule: "根据无尘室温度采集数据，在20-25°，健康度就为100%", weight: "1/3" },
            ],
          },
          {
            name: "湿度监控",
            subXs: [
              { name: "Kitting湿度监控", reportType: "By周", rule: "根据无尘室湿度采集数据，在50-56RH%，健康度就为100%", weight: "1/3" },
              { name: "切割站湿度监控", reportType: "By周", rule: "根据无尘室湿度采集数据，在50-56RH%，健康度就为100%", weight: "1/3" },
            ],
          },
          {
            name: "Particle监控",
            subXs: [
              { name: "切割站Particle监控", reportType: "By周", rule: "\"0.5um(0-100000颗) 5um (0-800颗)，两种颗粒数在spec范围内，健康度就为100%\"", weight: "1/3" },
            ],
          },
        ],
      },
      {
        id: "measurement",
        type: "测",
        title: "测量要素 (y6)",
        weight: 0.2,
        formulaLabel: "y6 * 0.2",
        icon: <BarChart2 className="w-5 h-5" />,
        colorClass: "text-cyan-400 border-cyan-500/30",
        borderClass: "border-cyan-500/30",
        bgClass: "bg-cyan-500/5",
        subYs: [
          {
            name: "CT1良率Chart",
            subXs: [
              { name: "参考人员检验判定的数据表做", reportType: "By天", rule: "良率>=98%,健康度为100%", weight: "1.0" },
            ],
          },
        ],
      },
    ];
  }, [isBonding, isPfa, isAssy]);

  // Map categories to high-tech ECharts tree structure representation
  const echartTreeData = useMemo(() => {
    return {
      name: "大Y (总健康度)",
      rule: "Y = y1*0.2 + y2*0.2 + y3*0.2 + y4*0.1 + y5*0.1 + y6*0.2",
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
                 cat.id === "method" ? "#fbbf24" :
                 cat.id === "environment" ? "#f472b6" : "#22d3ee",
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
  }, [categories]);

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
          left: "8%",
          bottom: "4%",
          right: "22%",
          symbolSize: 7,
          edgeShape: "curve",
          edgeForkPosition: "50%",
          initialTreeDepth: 10, // Default to expand all levels of the indicator tree
          lineStyle: {
            width: 1.5,
            color: "rgba(6, 182, 212, 0.3)",
            curveness: 0.5,
          },
          label: {
            position: "left",
            verticalAlign: "middle",
            align: "right",
            fontSize: 10,
            color: "#94a3b8",
            distance: 8,
          },
          leaves: {
            label: {
              position: "right",
              verticalAlign: "middle",
              align: "left",
              color: "#cbd5e1",
              distance: 8,
            },
          },
          expandAndCollapse: true,
          animationDuration: 550,
          animationDurationUpdate: 750,
        },
      ],
    };
  }, [echartTreeData]);

  return (
    <div className="mt-8 border border-cyan-500/30 rounded-lg p-6 bg-[#0a1931]/60 relative overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-cyan-500/20 pb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
          <div>
            <h3 className="text-lg font-black text-white tracking-wider">
              {isAssy ? "ASSY 总健康度计算规则与指标分解树" : isBonding ? "BD 总健康度计算规则与指标分解树" : isPfa ? "PFA 总健康度计算规则与指标分解树" : "CUT 总健康度计算规则与指标分解树"}
            </h3>
            <p className="text-xs text-slate-200 mt-1 font-mono">
              Y = 人(20%) + 机(20%) + 料(20%) + 法(10%) + 环(10%) + 测(20%)
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-cyan-950/60 p-1 rounded-lg border border-cyan-500/20">
          <button
            onClick={() => setActiveTab("tree")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold tracking-wider transition-all duration-200 ${
              activeTab === "tree"
                ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                : "text-slate-200 hover:text-white"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>三级指标树状图</span>
          </button>
          <button
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold tracking-wider transition-all duration-200 ${
              activeTab === "matrix"
                ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                : "text-slate-200 hover:text-white"
            }`}
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span>计算参数分解矩阵</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "tree" ? (
          <motion.div
            key="tree-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Visual description strip */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-cyan-950/20 px-4 py-2.5 rounded border border-cyan-500/10 text-xs">
              <span className="text-slate-100 font-mono flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>支持层级点击展开/折叠，悬停可查看对应指标周期与计算逻辑口径。</span>
              </span>
              <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded font-mono text-[10px]">
                全要素六大维度动态汇聚架构
              </span>
            </div>

            {/* Tree Chart container */}
            <div className="h-[480px] w-full bg-[#0a1526]/40 rounded-lg border border-cyan-500/15 relative">
              <ReactECharts
                option={echartOption}
                style={{ height: "100%", width: "100%" }}
                opts={{ renderer: "canvas" }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="matrix-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* Left Side: Y and weights formula diagram */}
            <div className="lg:col-span-4 bg-cyan-950/20 p-5 rounded-lg border border-cyan-500/10 h-full flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
                  [ 核心计算公式 ]
                </span>
                <div className="mt-4 p-4 bg-[#0a1526]/80 rounded border border-cyan-500/30 font-mono text-center">
                  <div className="text-xs text-slate-200 mb-1">总健康度计算 (大Y)</div>
                  <div className="text-base font-bold text-white leading-relaxed">
                    Y = <span className="text-blue-400">y₁·0.2</span> +{" "}
                    <span className="text-purple-400">y₂·0.2</span> +{" "}
                    <span className="text-emerald-400">y₃·0.2</span> +{" "}
                    <span className="text-amber-400">y₄·0.1</span> +{" "}
                    <span className="text-pink-400">y₅·0.1</span> +{" "}
                    <span className="text-cyan-400">y₆·0.2</span>
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
                      <span className="font-bold text-white">权重设定:</span> 资源消耗及质量风险度双重加权设计。
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
                说明：系统采用全要素（五大维度＋测量要素）动态加权评估，直观、清晰展现{isAssy ? "锁付、卡扣、气密" : isBonding ? "本压、外观" : isPfa ? "研磨、贴附" : "切、磨"}、外观及制程全生命周期的健康水平。
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
