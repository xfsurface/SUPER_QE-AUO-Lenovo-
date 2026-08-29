import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, X, Bot, User } from "lucide-react";
import { SHIPPING_DATA } from "./ShippingDashboard";
import { OBA_DATA } from "./ObaDashboard";
import { ORT_DATA } from "./OrtDashboard";
import { PRC_RMA_DATA, ROW_RMA_DATA, MONTHS } from "./RmaDashboard";

interface TableRow {
  label: string;
  value: string | number;
  status?: string;
  target?: string;
}

interface TableData {
  title: string;
  headers: string[];
  rows: TableRow[];
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  tables?: TableData[];
  suggestions?: string[];
}

interface AiAssistantProps {
  workshop?: "IQC" | "PFA" | "BND" | "ASY" | "CUT" | "SHIPPING" | "OBA" | "ORT" | "RMA";
}

// Seeded pseudo-random generator based on today's calendar date to ensure dynamic daily changes consistent with App.tsx
function getClientSeededValue(seedOffset: number, min: number, max: number, decimals: number = 2): number {
  const dateObj = new Date();
  const seed = dateObj.getFullYear() * 365 + (dateObj.getMonth() + 1) * 31 + dateObj.getDate() + seedOffset;
  const x = Math.sin(seed) * 10000;
  const rand = x - Math.floor(x);
  const val = min + rand * (max - min);
  return parseFloat(val.toFixed(decimals));
}

// Get past 15 dates key helper (consistent with App.tsx date key creation)
function getPastDatesLocal(daysCount: number): { key: string; dateStr: string }[] {
  const arr = [];
  const now = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const yearStr = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    arr.push({
      key: `${yearStr}-${monthStr}-${dayStr}`,
      dateStr: `${d.getMonth() + 1}/${d.getDate()}`
    });
  }
  return arr;
}

// Seeded random matching server-db.ts
function getSeededRandomLocal(dateStr: string, seedOffset: string | number): number {
  const str = `${dateStr}_${seedOffset}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

// Replicate server-db.ts trendData generation exactly for consistent stats
function getDatabaseYieldAndProd(site: string, dateStr: string) {
  let yieldVal = 99.5;
  let prodVal = 12000;

  if (site === "cut") {
    yieldVal = parseFloat((99.8 + getSeededRandomLocal(dateStr, "yield") * 0.2).toFixed(2));
    prodVal = Math.floor(10000 + getSeededRandomLocal(dateStr, "prod") * 5000);
  } else if (site === "iqc") {
    yieldVal = parseFloat((98.9 + getSeededRandomLocal(dateStr, "yield") * 1.0).toFixed(2));
    prodVal = Math.floor(180 + getSeededRandomLocal(dateStr, "prod") * 70);
  } else if (site === "pfa") {
    yieldVal = parseFloat((98.5 + getSeededRandomLocal(dateStr, "yield") * 1.4).toFixed(2));
    prodVal = Math.floor(40 + getSeededRandomLocal(dateStr, "prod") * 30);
  } else if (site === "bonding" || site === "bnd") {
    yieldVal = parseFloat((99.1 + getSeededRandomLocal(dateStr, "yield") * 0.8).toFixed(2));
    prodVal = Math.floor(1000 + getSeededRandomLocal(dateStr, "prod") * 300);
  } else if (site === "assy" || site === "asy") {
    yieldVal = parseFloat((98.2 + getSeededRandomLocal(dateStr, "yield") * 1.5).toFixed(2));
    prodVal = Math.floor(1300 + getSeededRandomLocal(dateStr, "prod") * 400);
  }

  return { yield: yieldVal, productivity: prodVal };
}

// Map the workshop code to full descriptive info and specific data seed configurations
function getActiveWorkshopInfo(ws?: string): { name: string; attendanceSeed: number; detectionSeed: number; label: string } {
  if (ws === "IQC") {
    return { name: "IQC", attendanceSeed: 20, detectionSeed: 30, label: "IQC来料检验工段" };
  }
  if (ws === "PFA") {
    return { name: "PFA", attendanceSeed: 21, detectionSeed: 32, label: "PFA偏贴工段" };
  }
  if (ws === "BND" || ws === "BONDING" || ws === "bonding") {
    return { name: "BND", attendanceSeed: 22, detectionSeed: 33, label: "BONDING绑定工段" };
  }
  if (ws === "ASY" || ws === "ASSY") {
    return { name: "ASY", attendanceSeed: 23, detectionSeed: 34, label: "ASY组装工段" };
  }
  if (ws === "SHIPPING") {
    return { name: "SHIPPING", attendanceSeed: 24, detectionSeed: 35, label: "SHIPPING智能出货看板" };
  }
  if (ws === "OBA") {
    return { name: "OBA", attendanceSeed: 25, detectionSeed: 36, label: "OBA开箱检验看板" };
  }
  if (ws === "ORT") {
    return { name: "ORT", attendanceSeed: 26, detectionSeed: 37, label: "ORT送样品质看板" };
  }
  if (ws === "RMA") {
    return { name: "RMA", attendanceSeed: 27, detectionSeed: 38, label: "RMA数据品质看板" };
  }
  return { name: "CUT", attendanceSeed: 10, detectionSeed: 11, label: "CUT切割工段" };
}

// Check if query targets a different workshop to maintain data isolation
function isQueryTargetingOtherWorkshop(lowerText: string, currentWs: string): { targetedWs: string; label: string } | null {
  const workshops = [
    { code: "IQC", label: "IQC来料检验工段", keys: ["iqc", "来料", "检验", "抽检", "抽样", "aql", "物理尺寸", "焦距", "照度", "部材", "尺寸", "中心值", "外长", "判定", "尺寸项目"] },
    { code: "CUT", label: "CUT切割工段", keys: ["cut", "切割机", "切割规范", "进刀补偿", "崩边", "冲淋水", "转速", "刀具"] },
    { code: "PFA", label: "PFA偏贴工段", keys: ["pfa", "偏贴", "贴附", "偏光片", "脱泡", "压力缸", "预对位", "炸弹"] },
    { code: "BND", label: "BONDING绑定工段", keys: ["bnd", "bonding", "绑定", "acf", "热压", "主绑定", "相机像素", "热压头", "ic", "fpc", "本压", "预压", "粒子"] },
    { code: "ASY", label: "ASY组装工段", keys: ["asy", "组装", "电批", "扭矩", "气密性", "真空", "锁付", "紧固件", "卡扣"] },
    { code: "SHIPPING", label: "SHIPPING智能出货看板", keys: ["shipping", "出货", "交付", "odm", "联想料号", "来源站点", "wistron", "lcfc", "compal"] },
    { code: "OBA", label: "OBA开箱检验看板", keys: ["oba", "开箱", "抽检比率", "出货抽检", "lenovo oba", "开箱合格率", "ratio"] },
    { code: "ORT", label: "ORT送样品质看板", keys: ["ort", "送样", "环测", "光学结果", "物理结果", "实验编号", "q工单", "计划送样", "wk26"] },
    { code: "RMA", label: "RMA数据品质看板", keys: ["rma", "退货", "prc", "row", "consumer rma", "客退", "退换", "售后"] }
  ];

  for (const ws of workshops) {
    if (ws.code !== currentWs) {
      for (const k of ws.keys) {
        if (lowerText.includes(k)) {
          return { targetedWs: ws.code, label: ws.label };
        }
      }
    }
  }
  return null;
}

export function AiAssistant({ workshop }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);

  const initialMessage = useMemo(() => {
    if (workshop === "SHIPPING") {
      return {
        id: "init-1",
        sender: "ai" as const,
        text: "您好！我是您的 SHIPPING 出货智能助手。您可以询问我关于出货总量、各大ODM出货占比、热销AUO液晶型号、联想客户专用料号以及各来源站点的出货数据及趋势分析。",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    }
    if (workshop === "OBA") {
      return {
        id: "init-1",
        sender: "ai" as const,
        text: "您好！我是您的 OBA 检验品质智能助手。您可以询问我关于 Lenovo 各月份出货数量、OBA 数量、平均 OBA 比例趋势。",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    }
    if (workshop === "ORT") {
      return {
        id: "init-1",
        sender: "ai" as const,
        text: "您好！我是您的 ORT 送样品质智能助手。您可以询问我关于 Lenovo 各机种 ORT 送样计划、RA 接收实验编号、环测/物理/光学实验结果及归档记录。",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    }
    if (workshop === "RMA") {
      return {
        id: "init-1",
        sender: "ai" as const,
        text: "您好！我是您的 RMA 数据品质智能助手。您可以询问我关于 Consumer PRC 与 Consumer ROW 的退货数量、Target 目标达成率、2024~2026 年各月份走势对比及异常分析。",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    }
    const ws = getActiveWorkshopInfo(workshop);
    return {
      id: "init-1",
      sender: "ai" as const,
      text: `您好！我是您的【${ws.label}】智能助手。您可以询问我关于当前工段的出勤状况、良率与产能、温湿度环境、设备核心参数或作业标准规范等问题。`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  }, [workshop]);

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setMessages([initialMessage]);
  }, [initialMessage]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastResponseIndexRef = useRef<number>(-1);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const queryText = inputValue.trim();
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI reply with typing indicator
    setTimeout(async () => {
      const lowerText = queryText.toLowerCase();
      const matchedTables: TableData[] = [];
      const matchedSuggestions: string[] = [];
      const ws = getActiveWorkshopInfo(workshop);

      // 0. Data Isolation Check
      const otherTarget = isQueryTargetingOtherWorkshop(lowerText, ws.name);
      if (otherTarget) {
        const responseText = `您好，我是您的【${ws.label}】智能助手。为了确保数据隔离与解答的精准度，我目前仅支持解答与【${ws.label}】相关的指标内容。您当前提问的内容属于【${otherTarget.label}】。请您切换到对应的看板界面，并使用该界面的智能助手进行提问。谢谢您的配合！`;
        const aiMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          sender: "ai",
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
        return;
      }

      // If we are on the SHIPPING dashboard, handle SHIPPING specific queries and stop
      if (ws.name === "SHIPPING") {
        const totalVolume = SHIPPING_DATA.reduce((acc, r) => acc + r.input, 0);
        const totalRecords = SHIPPING_DATA.length;

        if (
          lowerText.includes("总量") ||
          lowerText.includes("总出货") ||
          lowerText.includes("出货总") ||
          lowerText.includes("交付总") ||
          lowerText.includes("概览") ||
          lowerText.includes("整体") ||
          lowerText.includes("全部") ||
          lowerText.includes("统计")
        ) {
          const odmGroups: Record<string, number> = {};
          SHIPPING_DATA.forEach(r => {
            odmGroups[r.odm] = (odmGroups[r.odm] || 0) + r.input;
          });
          const odmRows = Object.entries(odmGroups).map(([odm, sum]) => ({
            label: odm,
            value: `${sum.toLocaleString()} pcs`,
            target: `${((sum / totalVolume) * 100).toFixed(1)}% 份额`,
            status: "正常"
          }));

          matchedTables.push({
            title: "今日【SHIPPING智能出货看板】整体交付概览",
            headers: ["统计维度/客户", "累计出货总量 (pcs)", "份额占比", "状态判定"],
            rows: [
              { label: "出货记录总计", value: `${totalRecords} 批次`, target: "全部有效数据", status: "正常" },
              { label: "累计总交付片数", value: `${totalVolume.toLocaleString()} pcs`, target: "100.0% 交付率", status: "正常" },
              ...odmRows
            ]
          });

          matchedSuggestions.push(`今日截止目前，累计出货总量达 ${totalVolume.toLocaleString()} pcs，共计 ${totalRecords} 批次，交付网络运行正常。`);
          matchedSuggestions.push("建议根据港口运力与车辆排班，合理调配大客户 LCFC 和 Wistron 之间的出货集装箱比例，规避滞港风险。");
        }
        else if (
          lowerText.includes("odm") ||
          lowerText.includes("lcfc") ||
          lowerText.includes("wistron") ||
          lowerText.includes("compal") ||
          lowerText.includes("客户")
        ) {
          const odmGroups: Record<string, { sum: number; count: number }> = {};
          SHIPPING_DATA.forEach(r => {
            if (!odmGroups[r.odm]) {
              odmGroups[r.odm] = { sum: 0, count: 0 };
            }
            odmGroups[r.odm].sum += r.input;
            odmGroups[r.odm].count += 1;
          });

          const rows = Object.entries(odmGroups)
            .sort((a, b) => b[1].sum - a[1].sum)
            .map(([odm, stats]) => ({
              label: odm,
              value: `${stats.sum.toLocaleString()} pcs`,
              target: `${stats.count} 批次`,
              status: "正常"
            }));

          matchedTables.push({
            title: "【SHIPPING智能出货看板】各ODM客户出货明细及排名",
            headers: ["ODM 客户名称", "出货总量 (pcs)", "出货总频次", "状态判定"],
            rows: rows
          });

          const topOdm = rows[0]?.label || "LCFC";
          const topVolume = rows[0]?.value || "0";
          matchedSuggestions.push(`代工厂客户中，【${topOdm}】以 ${topVolume} 稳居今日出货量榜首，占比极高。`);
          matchedSuggestions.push("建议加强与各代工厂客户的交期周计划滚动预测（Rolling Forecast）对接，确保物流平稳无积压。");
        }
        else if (
          lowerText.includes("型号") ||
          lowerText.includes("model") ||
          lowerText.includes("b14") ||
          lowerText.includes("b15") ||
          lowerText.includes("b16")
        ) {
          const modelGroups: Record<string, { sum: number; count: number; sources: Set<string> }> = {};
          SHIPPING_DATA.forEach(r => {
            if (!modelGroups[r.modelName]) {
              modelGroups[r.modelName] = { sum: 0, count: 0, sources: new Set() };
            }
            modelGroups[r.modelName].sum += r.input;
            modelGroups[r.modelName].count += 1;
            modelGroups[r.modelName].sources.add(r.auoPanelFrom);
          });

          const rows = Object.entries(modelGroups)
            .sort((a, b) => b[1].sum - a[1].sum)
            .slice(0, 5)
            .map(([model, stats]) => ({
              label: model,
              value: `${stats.sum.toLocaleString()} pcs`,
              target: `${stats.count} 批次`,
              status: `来自 [${Array.from(stats.sources).join(", ")}]`
            }));

          matchedTables.push({
            title: "【SHIPPING智能出货看板】Top 5 热门液晶型号出货统计",
            headers: ["AUO 液晶型号", "交付总量 (pcs)", "发运频次", "主要来源站点"],
            rows: rows
          });

          matchedSuggestions.push("当前出货型号覆盖了高色域、窄边框等核心主力产品，Top 5 热门型号需求旺盛。");
          matchedSuggestions.push("建议对高频发货型号提前做好出货外箱包装、防静电托盘等公用辅料的排产备库。");
        }
        else if (
          lowerText.includes("料号") ||
          lowerText.includes("pn") ||
          lowerText.includes("p/n") ||
          lowerText.includes("sd11") ||
          lowerText.includes("sd10")
        ) {
          const pnGroups: Record<string, { sum: number; model: string }> = {};
          SHIPPING_DATA.forEach(r => {
            pnGroups[r.lenovoPn] = {
              sum: (pnGroups[r.lenovoPn]?.sum || 0) + r.input,
              model: r.modelName
            };
          });

          const rows = Object.entries(pnGroups)
            .sort((a, b) => b[1].sum - a[1].sum)
            .slice(0, 5)
            .map(([pn, stats]) => ({
              label: pn,
              value: `${stats.sum.toLocaleString()} pcs`,
              target: stats.model,
              status: "正常"
            }));

          matchedTables.push({
            title: "【SHIPPING智能出货看板】主要联想料号 (Lenovo P/N) 发货排行",
            headers: ["联想料号 (P/N)", "累计交付量 (pcs)", "对应AUO内部型号", "状态判定"],
            rows: rows
          });

          matchedSuggestions.push("联想客户专属料号贴纸（Spec Label）需要百分之百防呆复核，保证一箱一码扫描。");
          matchedSuggestions.push("建议各组板发运岗前做好条码解析核对，确保装箱单（Packing List）与物理料号绝对一致。");
        }
        else if (
          lowerText.includes("站点") ||
          lowerText.includes("来源") ||
          lowerText.includes("from") ||
          lowerText.includes("s01") ||
          lowerText.includes("z40") ||
          lowerText.includes("z31") ||
          lowerText.includes("s06") ||
          lowerText.includes("k06")
        ) {
          const sourceGroups: Record<string, { sum: number; count: number }> = {};
          SHIPPING_DATA.forEach(r => {
            if (!sourceGroups[r.auoPanelFrom]) {
              sourceGroups[r.auoPanelFrom] = { sum: 0, count: 0 };
            }
            sourceGroups[r.auoPanelFrom].sum += r.input;
            sourceGroups[r.auoPanelFrom].count += 1;
          });

          const rows = Object.entries(sourceGroups)
            .sort((a, b) => b[1].sum - a[1].sum)
            .map(([src, stats]) => ({
              label: `站点 ${src}`,
              value: `${stats.sum.toLocaleString()} pcs`,
              target: `${stats.count} 批次`,
              status: `${((stats.sum / totalVolume) * 100).toFixed(1)}%`
            }));

          matchedTables.push({
            title: "【SHIPPING智能出货看板】来源站点发运支撑力 analysis",
            headers: ["产品来源站点 (auoPanelFrom)", "输送总量 (pcs)", "发运频次", "占比贡献度"],
            rows: rows
          });

          const topSrc = rows[0]?.label || "站点 S01";
          matchedSuggestions.push(`今日出货中，【${topSrc}】提供了最主要的库存支撑，占比贡献最大。`);
          matchedSuggestions.push("建议加强与前置工序（AS组装、PF偏贴等）的对接，做好物流周转托盘和包装箱的提前循环回拨。");
        }
        else if (
          lowerText.includes("月份") ||
          lowerText.includes("月") ||
          lowerText.includes("趋势") ||
          lowerText.includes("时间") ||
          lowerText.includes("阶段")
        ) {
          const monthGroups: Record<string, { sum: number; count: number }> = {};
          SHIPPING_DATA.forEach(r => {
            if (!monthGroups[r.month]) {
              monthGroups[r.month] = { sum: 0, count: 0 };
            }
            monthGroups[r.month].sum += r.input;
            monthGroups[r.month].count += 1;
          });

          const monthsOrder = ["1月", "2月", "3月", "4月", "5月", "6月", "7月"];
          const rows = monthsOrder
            .filter(m => monthGroups[m])
            .map(m => ({
              label: m,
              value: `${monthGroups[m].sum.toLocaleString()} pcs`,
              target: `${monthGroups[m].count} 批次`,
              status: "稳定"
            }));

          matchedTables.push({
            title: "【SHIPPING智能出货看板】历史月份交付量趋势统计",
            headers: ["发运月份", "单月出货量 (pcs)", "出货批次频次", "健康判定"],
            rows: rows
          });

          matchedSuggestions.push("历史趋势表明一季度（1-3月）出货迎来大幅爆发增长，并在 3月 触及顶峰（541,743 pcs）。");
          matchedSuggestions.push("建议在低谷月份期间做好托盘打包机、电子计重秤、扫码器等关键出货设备的大修与停机保养。");
        }

        let responseText = "";
        if (matchedTables.length > 0) {
          responseText = `已为您查询到今日与【${queryText}】相关的【SHIPPING智能出货看板】实时统计分析：`;
        } else {
          responseText = "您好，我是您的【SHIPPING智能出货看板】智能助手。您可以询问我关于出货总量、各大ODM出货占比、热销AUO液晶型号、联想料号以及各来源站点的出货数据及趋势分析。";
        }

        const aiMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          sender: "ai",
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          tables: matchedTables.length > 0 ? matchedTables : undefined,
          suggestions: matchedSuggestions.length > 0 ? matchedSuggestions : undefined,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
        return;
      }

      // If we are on the OBA dashboard, handle OBA specific queries and stop
      if (ws.name === "OBA") {
        const totalShip = OBA_DATA.reduce((acc, r) => acc + r.shipping, 0);
        const totalObaCount = OBA_DATA.reduce((acc, r) => acc + r.oba, 0);
        const avgRatio = (totalObaCount / totalShip) * 100;

        if (
          lowerText.includes("比率") ||
          lowerText.includes("比例") ||
          lowerText.includes("ratio") ||
          lowerText.includes("趋势") ||
          lowerText.includes("月份") ||
          lowerText.includes("月度") ||
          lowerText.includes("2026")
        ) {
          matchedTables.push({
            title: "【OBA检验品质看板】月度出货与OBA比例 (Lenovo OBA Ratio)",
            headers: ["月份", "出货数量 (Shipping)", "OBA数量", "OBA比例 (Ratio)"],
            rows: OBA_DATA.map(r => ({
              label: r.month,
              value: `${r.shipping.toLocaleString()} pcs`,
              target: `${r.oba.toLocaleString()} pcs`,
              status: `${r.ratio.toFixed(1)}%`
            }))
          });
          matchedSuggestions.push(`2026年度最高OBA比例为 202602 的 29.2%，最新月份 202608 OBA比例为 18.6%，整体抽检力度受控。`);
          matchedSuggestions.push("各月份出货与 OBA 检验执行严格，整体抽检比例保持稳定达标。");
        } else {
          matchedTables.push({
            title: "【OBA检验品质看板】核心品质指标概览",
            headers: ["指标项目", "统计数值", "管控标准", "状态判定"],
            rows: [
              { label: "累计出货总量", value: `${totalShip.toLocaleString()} pcs`, target: "202601-202608", status: "正常" },
              { label: "累计OBA数量", value: `${totalObaCount.toLocaleString()} pcs`, target: "受控", status: "达标" },
              { label: "平均OBA比例", value: `${avgRatio.toFixed(2)}%`, target: "≥ 10.0%", status: "达标" },
            ]
          });
          matchedSuggestions.push("OBA 检验体系运转良好，各项抽检指标稳定受控。");
        }

        let responseText = `已为您查询到与【${queryText}】相关的【OBA检验品质看板】品质数据分析：`;
        const aiMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          sender: "ai",
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          tables: matchedTables.length > 0 ? matchedTables : undefined,
          suggestions: matchedSuggestions.length > 0 ? matchedSuggestions : undefined,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
        return;
      }

      // If we are on the ORT dashboard, handle ORT specific queries and stop
      if (ws.name === "ORT") {
        const totalBatches = ORT_DATA.length;
        const totalPcs = ORT_DATA.reduce((acc, r) => acc + r.pcs, 0);
        const allPassCount = ORT_DATA.filter(r => r.expResult === "PASS" && r.envResult === "PASS" && r.phyResult === "PASS" && r.optResult === "PASS").length;
        const passRate = (allPassCount / totalBatches) * 100;

        if (
          lowerText.includes("明细") ||
          lowerText.includes("记录") ||
          lowerText.includes("清单") ||
          lowerText.includes("列表") ||
          lowerText.includes("机种") ||
          lowerText.includes("型号") ||
          lowerText.includes("b160") ||
          lowerText.includes("b140") ||
          lowerText.includes("b153") ||
          lowerText.includes("b145") ||
          lowerText.includes("b116")
        ) {
          const filtered = ORT_DATA.filter(r => 
            !lowerText.includes("b1") || r.model.toLowerCase().includes(lowerText) || r.pn.toLowerCase().includes(lowerText)
          ).slice(0, 10);

          matchedTables.push({
            title: "【ORT送样汇总】精选送样批次试验记录",
            headers: ["FAB", "机种 (Model)", "P/N 料号", "周期", "数量(pcs)", "Q工单", "实验编号", "综合结果"],
            rows: filtered.map(r => ({
              label: `${r.fab} - ${r.model}`,
              value: `${r.pcs} pcs`,
              target: `${r.cycle} / ${r.expNo}`,
              status: r.expResult
            }))
          });
          matchedSuggestions.push("全部 29 批次 ORT 送样计划中，环测、物理与光学三大实验均 100% PASS 合格通过。");
          matchedSuggestions.push("受控机种涵盖 B160UAN/QAN/ZAN、B140UAN/UAK/UAX/HAK、B153UAX 及 B116XAK 等 Lenovo 全系列主力机种。");
        } else {
          matchedTables.push({
            title: "【ORT送样品质看板】整体送样归档数据概览",
            headers: ["监控维度", "统计指标", "受控标准", "判定状态"],
            rows: [
              { label: "累计送样批次", value: `${totalBatches} 批次`, target: "Lenovo Plan", status: "正常" },
              { label: "累计送样总数", value: `${totalPcs} pcs`, target: "按单送检", status: "达标" },
              { label: "实验综合合格率", value: `${passRate.toFixed(1)}%`, target: "100.0%", status: "达标" },
              { label: "环测/物理/光学合格数", value: `${allPassCount}/${totalBatches} 批`, target: "全数合格", status: "PASS" },
              { label: "异常单填写", value: "0 笔 (全部 Null)", target: "无异常", status: "正常" },
              { label: "资料保管年限", value: "三年 (QM单位)", target: "合规归档", status: "受控" }
            ]
          });
          matchedSuggestions.push("2026 年度 ORT 送样计划执行顺利，所有测试实验室（RA）已全数完成检验报告出具与归档。");
          matchedSuggestions.push("3C/3D/4D 各 FAB 厂区送检产品质量稳定，无任何 QE 异常单需要跟进。");
        }

        let responseText = `已为您查询到与【${queryText}】相关的【ORT送样汇总记录表】品质数据：`;
        const aiMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          sender: "ai",
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          tables: matchedTables.length > 0 ? matchedTables : undefined,
          suggestions: matchedSuggestions.length > 0 ? matchedSuggestions : undefined,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
        return;
      }

      // If we are on the RMA dashboard, handle RMA specific queries and stop
      if (ws.name === "RMA") {
        if (lowerText.includes("prc") || lowerText.includes("中国") || lowerText.includes("国内")) {
          matchedTables.push({
            title: "【Consumer PRC RMA】中国区消费类退货数据汇总",
            headers: ["统计年份", "Jan", "Feb", "Mar", "Q1均值", "Target目标", "状态判定"],
            rows: [
              { label: "2024 年度", value: "1570 / 1532 / 1620", target: "1700", status: "达标受控" },
              { label: "2025 年度", value: "1416 / 1088 / 1318", target: "1700", status: "达标" },
              { label: "2026 年度", value: "648 / 953 / 699", target: "1700", status: "极佳 (优于目标 59%)" },
            ]
          });
          matchedSuggestions.push("Consumer PRC RMA 2026 年 Q1 均值为 766.7 pcs，远优于管控红线 1700 pcs。");
          matchedSuggestions.push("2026 年 1~3 月退货量分别为 648、953、699 pcs，相较 2024/2025 同期降幅超 40%。");
        } else if (lowerText.includes("row") || lowerText.includes("海外") || lowerText.includes("全球")) {
          matchedTables.push({
            title: "【Consumer ROW RMA】海外与全球区退货数据汇总",
            headers: ["统计年份", "Jan", "Feb", "Mar", "Target目标", "状态判定"],
            rows: [
              { label: "2024 年度", value: "532 / 524 / 432", target: "800", status: "达标" },
              { label: "2025 年度", value: "415 / 499 / 480", target: "800", status: "达标" },
              { label: "2026 年度", value: "615 / 553 / -", target: "800", status: "达标 (优于目标 30%)" },
            ]
          });
          matchedSuggestions.push("Consumer ROW RMA 2026 年最新 1~2 月数据分别为 615 pcs 与 553 pcs，持续优于 800 pcs 目标红线。");
          matchedSuggestions.push("海外退货趋势保持平稳收敛，无异常突发性群发客退。");
        } else {
          matchedTables.push({
            title: "【Consumer RMA】PRC 与 ROW 双区品质对比概览",
            headers: ["区域维度", "2026最新数据", "Target目标", "达成率", "受控状态"],
            rows: [
              { label: "Consumer PRC RMA", value: "699 pcs (3月)", target: "1700 pcs", status: "达标受控 (大幅优于目标)" },
              { label: "Consumer ROW RMA", value: "553 pcs (2月)", target: "800 pcs", status: "达标受控 (平稳受控)" },
              { label: "PRC Q1 均值", value: "766.7 pcs", target: "< 1700 pcs", status: "100% 达成" },
              { label: "ROW 累计均值", value: "584.0 pcs", target: "< 800 pcs", status: "100% 达成" }
            ]
          });
          matchedSuggestions.push("2026 年 PRC 与 ROW 双区域退货指标均严格处于 Target 红线以下，整体品质管控成效显著。");
          matchedSuggestions.push("PRC 区域 2026 表现尤为突出，退货数量较 2024~2025 年同期呈现断崖式良性下降。");
        }

        let responseText = `已为您查询到与【${queryText}】相关的【Consumer RMA 数据品质看板】分析数据：`;
        const aiMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          sender: "ai",
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          tables: matchedTables.length > 0 ? matchedTables : undefined,
          suggestions: matchedSuggestions.length > 0 ? matchedSuggestions : undefined,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
        return;
      }

      // If we are on the IQC dashboard, handle IQC specific queries and stop to guarantee data isolation
      if (ws.name === "IQC") {
        if (
          lowerText.includes("部材") ||
          lowerText.includes("尺寸") ||
          lowerText.includes("外长") ||
          lowerText.includes("判定") ||
          lowerText.includes("抽样") ||
          lowerText.includes("来料") ||
          lowerText.includes("检验") ||
          lowerText.includes("测量") ||
          lowerText.includes("测试") ||
          lowerText.includes("sd11") ||
          lowerText.includes("b140") ||
          lowerText.includes("b156") ||
          lowerText.includes("b160") ||
          lowerText.includes("b153") ||
          lowerText.includes("lgp") ||
          lowerText.includes("l/b") ||
          lowerText.includes("dbef") ||
          lowerText.includes("胶框") ||
          lowerText.includes("棱镜") ||
          lowerText.includes("扩散")
        ) {
          matchedTables.push({
            title: "【IQC来料检验】核心部材物理尺寸抽样检测值 (B140UAN04.7 / SD11M38901)",
            headers: ["受控部材名称/规格型号", "中心标准值 (mm)", "Min~Max 允许偏差", "P1~P5 实测样本值范围", "判定结果"],
            rows: [
              { label: "LGP 导光板 (62.14BAB.010)", value: "304.09", target: "303.89 ~ 304.29", status: "OK" },
              { label: "L/B 灯条 (58.14BAB.008)", value: "303.59", target: "303.29 ~ 303.89", status: "OK" },
              { label: "DBEF 反射片 (66.33M10.660)", value: "304.19", target: "303.99 ~ 304.39", status: "OK" },
              { label: "上棱镜片 (66.33M10.759)", value: "304.31", target: "304.27 ~ 304.37", status: "OK" },
              { label: "下棱镜片 (66.34M10.504)", value: "304.34", target: "304.26 ~ 304.37", status: "OK" },
              { label: "下扩散片 (66.32M10.455)", value: "304.24", target: "304.23 ~ 304.30", status: "OK" },
              { label: "胶框 (76.14BB4.001)", value: "306.52", target: "306.51 ~ 306.52", status: "OK" }
            ]
          });

          matchedSuggestions.push("今日截止目前检验的 7 大核心物理批次中，物料尺寸波动系数（CPK值）非常理想，所有部件物理指标均完全合规。");
          matchedSuggestions.push("由于主要来料外长、外宽等规格指标处于公差中心段，一次合格判定全部为 OK，支持下线高精密对位压合工艺安全投料。");
          matchedSuggestions.push("建议班组加强对 L/B灯条 和 胶框 在大批量换箱投料时的热胀冷缩间隙校对，防止因冬季环境微变产生局部组装应力。");
        } else {
          matchedTables.push({
            title: "【IQC来料检验工段】整体品质点检指标概览",
            headers: ["品质监控维度", "已完成抽样数", "合格放行批数", "放行率结果"],
            rows: [
              { label: "今日累计抽检批次", value: "7 大批次", target: "7 批次", status: "正常" },
              { label: "拦截不合格批次", value: "0 批", target: "0 批", status: "正常" },
              { label: "核心物理尺寸合格率", value: "100.0%", target: "≥99.5%", status: "正常" }
            ]
          });
          matchedSuggestions.push("本工段今日处于极佳的安全生产与精密品质状态，AQL 抽检拦截率为 100% 正常。");
        }

        let responseText = `已为您成功调取今日与【${queryText}】相关的【IQC来料检验工段】高精密品质数据报告：`;
        const aiMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          sender: "ai",
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          tables: matchedTables.length > 0 ? matchedTables : undefined,
          suggestions: matchedSuggestions.length > 0 ? matchedSuggestions : undefined,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
        return;
      }

      // 1. 出勤率 / 检出率 / 健康度
      if (
        lowerText.includes("出勤率") ||
        lowerText.includes("检出率") ||
        lowerText.includes("健康度") ||
        lowerText.includes("出勤") ||
        lowerText.includes("健康") ||
        lowerText.includes("考勤") ||
        lowerText.includes("到岗") ||
        lowerText.includes("到岗率") ||
        lowerText.includes("到岗人数") ||
        lowerText.includes("人员")
      ) {
        // Calculate exact numbers matching UI definitions for the specific active workshop
        let attMin = 25, attMax = 35, detMin = 8, detMax = 15;
        let detectionLabel = "健康检测筛查人数";
        let attLabel = "员工应出勤人数";

        if (ws.name === "IQC") {
          attMin = 8; attMax = 12; detMin = 110; detMax = 130;
          detectionLabel = "来料检验抽检批次";
        } else if (ws.name === "PFA") {
          attMin = 12; attMax = 12; detMin = 25; detMax = 35;
          detectionLabel = "检出率[炸弹实验]数量";
        } else if (ws.name === "BND") {
          attMin = 35; attMax = 45; detMin = 8; detMax = 15;
          detectionLabel = "检出率[炸弹实验/抽检]数量";
        } else if (ws.name === "ASY") {
          attMin = 340; attMax = 360; detMin = 21400; detMax = 21800;
          detectionLabel = "组装成品完工数";
        }

        const attTotal = Math.round(getClientSeededValue(ws.attendanceSeed, attMin, attMax, 0));
        const detTotal = Math.round(getClientSeededValue(ws.detectionSeed, detMin, detMax, 0));

        matchedTables.push({
          title: `今日【${ws.label}】人员出勤与生产看板数据`,
          headers: ["评估指标", "实时状态值", "目标基准值", "状态判定"],
          rows: [
            { label: attLabel, value: `${attTotal} 人`, target: `${attTotal} 人`, status: "正常" },
            { label: "实际到岗人数", value: `${attTotal} 人`, target: `${attTotal} 人`, status: "正常" },
            { label: "出勤率 (Attendance)", value: "100.0%", target: "≥98.0%", status: "正常" },
            { label: detectionLabel, value: `${detTotal.toLocaleString()} ${ws.name === "IQC" ? "批" : (ws.name === "CUT" ? "人" : "片")}`, target: `${detTotal.toLocaleString()} ${ws.name === "IQC" ? "批" : (ws.name === "CUT" ? "人" : "片")}`, status: "正常" },
            { label: "健康异常申报人数", value: "0 人", target: "0 人", status: "正常" },
            { label: "异常人员健康拦截率", value: "100.0%", target: "100.0%", status: "正常" }
          ]
        });
        matchedSuggestions.push(`当前【${ws.label}】到岗表现极为稳健，应出勤：${attTotal}人，实出勤：${attTotal}人，到岗率100%。`);
        matchedSuggestions.push("建议班组长在每日岗前5分钟班组晨会（Toolbox Meeting）中复核员工精神状态与防护静电服穿着合规情况。");
      }

      // 2. 良率 / 产能
      if (
        lowerText.includes("良率") ||
        lowerText.includes("产能") ||
        lowerText.includes("产量") ||
        lowerText.includes("效率") ||
        lowerText.includes("直通率") ||
        lowerText.includes("合格率")
      ) {
        const siteKey = ws.name === "BND" ? "bonding" : (ws.name === "ASY" ? "assy" : ws.name.toLowerCase());
        const pastDates = getPastDatesLocal(15);
        const todayKey = pastDates[pastDates.length - 1].key;
        
        let yieldVal = 99.5;
        let prodVal = 12000;

        try {
          const res = await fetch(`/api/production-data?site=${siteKey}&dates=${todayKey}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              yieldVal = data[0].yield;
              prodVal = data[0].productivity;
            } else {
              const dbVals = getDatabaseYieldAndProd(siteKey, todayKey);
              yieldVal = dbVals.yield;
              prodVal = dbVals.productivity;
            }
          } else {
            const dbVals = getDatabaseYieldAndProd(siteKey, todayKey);
            yieldVal = dbVals.yield;
            prodVal = dbVals.productivity;
          }
        } catch (err) {
          console.error("Error fetching live yield data in assistant:", err);
          const dbVals = getDatabaseYieldAndProd(siteKey, todayKey);
          yieldVal = dbVals.yield;
          prodVal = dbVals.productivity;
        }

        let nameLabel = "CUT 切割工序";
        let targetVal = 12000;
        let unit = "片";

        if (ws.name === "IQC") {
          nameLabel = "IQC 来料抽检工序";
          targetVal = prodVal; // Always fully inspected
          unit = "批";
        } else if (ws.name === "PFA") {
          nameLabel = "PFA 偏贴贴附工序";
          targetVal = 60;
          unit = "片";
        } else if (ws.name === "BND") {
          nameLabel = "BND 绑定热压工序";
          targetVal = 1200;
          unit = "片";
        } else if (ws.name === "ASY") {
          nameLabel = "ASY 组装成品工序";
          targetVal = 1500;
          unit = "片";
        } else {
          // CUT
          targetVal = 12000;
          unit = "片";
        }

        matchedTables.push({
          title: `今日【${ws.label}】实时直通良率与产能指标`,
          headers: ["制程工序", "实时良率", "今日实际产量 / 目标", "生产进度"],
          rows: [
            { 
              label: nameLabel, 
              value: `${yieldVal}%`, 
              target: `${prodVal.toLocaleString()} / ${targetVal.toLocaleString()} ${unit}`, 
              status: "正常" 
            }
          ]
        });

        matchedSuggestions.push(`当前【${ws.label}】的实时良率达 ${yieldVal}%，累计产能：${prodVal}${unit}，各项进度均处于绿区受控状态。`);
        matchedSuggestions.push("建议每小时复核前工段至本工段的物流缓冲（Buffer Store）库存水位，防止线体发生停线或局部堵料。");
      }

      // 3. 环境颗粒度 / 温湿度
      if (
        lowerText.includes("环境颗粒度") ||
        lowerText.includes("温湿度") ||
        lowerText.includes("环境") ||
        lowerText.includes("温度") ||
        lowerText.includes("湿度") ||
        lowerText.includes("颗粒") ||
        lowerText.includes("尘埃") ||
        lowerText.includes("压差")
      ) {
        // Shared Cleanroom seeds to match charts exactly
        const tempToday = getClientSeededValue(46, 24.2, 25.2, 1);
        const humToday = getClientSeededValue(66, 52.2, 54.2, 1);
        const pressToday = getClientSeededValue(53, 11.5, 13.5, 1);

        let particleRows: TableRow[] = [];
        if (ws.name === "BND") {
          const part05 = Math.round(getClientSeededValue(72, 6800, 9500, 0));
          const part10 = Math.round(getClientSeededValue(73, 1400, 2350, 0));
          const part50 = Math.round(getClientSeededValue(74, 20, 78, 0));
          particleRows = [
            { label: "0.5μm 尘埃粒子数", value: `${part05.toLocaleString()} 颗/m³`, target: "≤ 10,000 颗/m³", status: "正常" },
            { label: "1.0μm 尘埃粒子数", value: `${part10.toLocaleString()} 颗/m³`, target: "≤ 2,400 颗/m³", status: "正常" },
            { label: "5.0μm 尘埃粒子数", value: `${part50} 颗/m³`, target: "≤ 80 颗/m³", status: "正常" }
          ];
        } else if (ws.name === "PFA") {
          const part05 = Math.round(getClientSeededValue(51, 6800, 9800, 0));
          const part10 = Math.round(getClientSeededValue(61, 1500, 2400, 0));
          const part50 = Math.round(getClientSeededValue(71, 30, 85, 0));
          particleRows = [
            { label: "0.5μm 尘埃粒子数", value: `${part05.toLocaleString()} 颗/m³`, target: "≤ 10,000 颗/m³", status: "正常" },
            { label: "1.0μm 尘埃粒子数", value: `${part10.toLocaleString()} 颗/m³`, target: "≤ 2,400 颗/m³", status: "正常" },
            { label: "5.0μm 尘埃粒子数", value: `${part50} 颗/m³`, target: "≤ 100 颗/m³", status: "正常" }
          ];
        } else {
          const part3 = Math.round(getClientSeededValue(51, 65, 80, 0));
          const part5 = Math.round(getClientSeededValue(52, 14, 22, 0));
          particleRows = [
            { label: "0.3μm 尘埃粒子数", value: `${part3} 颗/m³`, target: "< 100 颗/m³", status: "正常" },
            { label: "0.5μm 尘埃粒子数", value: `${part5} 颗/m³`, target: "< 35 颗/m³", status: "正常" }
          ];
        }

        matchedTables.push({
          title: `【${ws.label}】洁净车间环境及温湿度监测指标`,
          headers: ["环境参数", "当前实测值", "标准受控范围", "状态判定"],
          rows: [
            ...particleRows,
            { label: "空气平均温度 (Temp)", value: `${tempToday} °C`, target: "24.0 ± 2.0 °C", status: "正常" },
            { label: "空气平均湿度 (Humid)", value: `${humToday}%`, target: "50.0% ± 10%", status: "正常" },
            { label: "洁净室内部压差", value: `${pressToday} Pa`, target: "10.0 ~ 15.0 Pa", status: "正常" }
          ]
        });
        matchedSuggestions.push(`【${ws.label}】洁净车间环境完全合规。为防止局部静电或水汽凝结，系统已将恒温恒湿循环维持在24.0℃左右及52%-54%湿度区间。`);
        matchedSuggestions.push("建议班组在每次换班时复检风机过滤单元 (FFU) 的物理工作指示灯，防止风速衰减导致尘埃颗粒堆积。");
      }

      // 4. 机台参数
      if (
        lowerText.includes("机台参数") ||
        lowerText.includes("机台") ||
        lowerText.includes("参数") ||
        lowerText.includes("设备") ||
        lowerText.includes("压力") ||
        lowerText.includes("扭矩") ||
        lowerText.includes("偏差")
      ) {
        let rowsData: TableRow[] = [];
        if (ws.name === "CUT") {
          const cutSpd = getClientSeededValue(401, 235.0, 245.0, 1);
          rowsData = [
            { label: "CUT 切割机转速", value: `${cutSpd} krpm`, target: "220.0 ~ 250.0 krpm", status: "正常" },
            { label: "CUT 进刀补偿值", value: "0.08 mm", target: "< 0.15 mm", status: "正常" },
            { label: "CUT 冲淋水流量", value: "3.25 L/min", target: "3.00 ~ 3.50 L/min", status: "正常" }
          ];
        } else if (ws.name === "IQC") {
          rowsData = [
            { label: "测量投影仪焦距偏差", value: "0.02 μm", target: "≤ 0.05 μm", status: "正常" },
            { label: "光源照度", value: "1250 Lux", target: "1100 ~ 1400 Lux", status: "正常" },
            { label: "显微镜数码变焦", value: "200.0x", target: "200.0x 恒定", status: "正常" }
          ];
        } else if (ws.name === "PFA") {
          const pfaPress = getClientSeededValue(403, 0.45, 0.55, 2);
          rowsData = [
            { label: "偏光片预对位对角偏差", value: "0.45 μm", target: "< 1.00 μm", status: "正常" },
            { label: "脱泡罐工作压力", value: "-0.09 MPa", target: "-0.08 ~ -0.10 MPa", status: "正常" },
            { label: "贴附气压缸压力", value: `${pfaPress} MPa`, target: "0.40 ~ 0.60 MPa", status: "正常" }
          ];
        } else if (ws.name === "BND") {
          const bndAlign = getClientSeededValue(402, 0.40, 0.55, 2);
          const bndPress = getClientSeededValue(403, 2.0, 2.3, 2);
          rowsData = [
            { label: "BND 对位相机像素偏差", value: `${bndAlign} μm`, target: "< 1.00 μm", status: "正常" },
            { label: "BND 预贴恒定压力", value: `${bndPress} MPa`, target: "1.80 ~ 2.50 MPa", status: "正常" },
            { label: "BND 热压头工作温度", value: "190.5 °C", target: "185.0 ~ 195.0 °C", status: "正常" }
          ];
        } else if (ws.name === "ASY") {
          const asyTor = getClientSeededValue(404, 0.33, 0.38, 2);
          rowsData = [
            { label: "ASY 智能电批锁付扭矩", value: `${asyTor} N·m`, target: "0.30 ~ 0.42 N·m", status: "正常" },
            { label: "ASY 气密性真空保压漏率", value: "0.02 mL/min", target: "< 0.05 mL/min", status: "正常" },
            { label: "ASY 自动卡扣合压力", value: "12.5 N", target: "10.0 ~ 15.0 N", status: "正常" }
          ];
        }

        matchedTables.push({
          title: `【${ws.label}】核心设备关键控制参数 SPC`,
          headers: ["受控设备/参数", "当前实测平均值", "控制限上限/下限 (UCL/LCL)", "状态判定"],
          rows: rowsData
        });

        matchedSuggestions.push(`当前【${ws.label}】核心设备的实时物理参数无任何异常漂移，完全落在 SPC 的 UCL / LCL 警戒线以内。`);
        matchedSuggestions.push("建议工程师在每班维护窗口期利用 Master Check 标定样片对各压力传感器和相机进行一轮精准校验。");
      }

      // 5. 作业文件
      if (
        lowerText.includes("作业文件") ||
        lowerText.includes("作业") ||
        lowerText.includes("文件") ||
        lowerText.includes("sop") ||
        lowerText.includes("指导书") ||
        lowerText.includes("规程")
      ) {
        let rowsData: TableRow[] = [];
        if (ws.name === "CUT") {
          rowsData = [
            { label: "1_切割规范基本操作规程.docx", value: "Rev A/2", target: "工艺工程部 / 品质部", status: "正常" },
            { label: "2_设备安全操作手册.doc", value: "Rev B/0", target: "安全环保科 / 工程部", status: "正常" },
            { label: "3_核心备件保养巡检标准.xlsx", value: "Rev A/1", target: "设备工程课 / 生产部", status: "正常" },
            { label: "4_切割崩边缺陷判定与限度标准.doc", value: "Rev A/0", target: "品质管理部 / 质量课", status: "正常" }
          ];
        } else if (ws.name === "IQC") {
          rowsData = [
            { label: "1_IQC来料物理尺寸检验规程.docx", value: "Rev A/3", target: "品质管理部 / 工程部", status: "正常" },
            { label: "2_AQL计数抽样程序与抽样方案.pdf", value: "Rev B/1", target: "品质管理部 / 审核组", status: "正常" },
            { label: "3_背光偏光片外观缺陷限度标准.xlsx", value: "Rev A/2", target: "品质管理部 / 生产部", status: "正常" }
          ];
        } else if (ws.name === "PFA") {
          rowsData = [
            { label: "1_PFA偏光片贴合首件点检规程.docx", value: "Rev A/1", target: "工艺工程部 / 品质部", status: "正常" },
            { label: "2_偏贴偏光片静电控制管理细则.pdf", value: "Rev C/0", target: "安全环保科 / 设备课", status: "正常" },
            { label: "3_脱泡机高压容器安全运行条例.docx", value: "Rev B/2", target: "安全环保科 / 工程部", status: "正常" }
          ];
        } else if (ws.name === "BND") {
          rowsData = [
            { label: "1_ACF贴附与预压合工艺指导书.docx", value: "Rev A/2", target: "工艺工程部 / 品质部", status: "正常" },
            { label: "2_FPC主绑定热压温度与压力标准.pdf", value: "Rev B/1", target: "工艺工程部 / 设备课", status: "正常" },
            { label: "3_本绑定偏差补正与防呆操作细则.pdf", value: "Rev A/0", target: "工艺设计组 / 生产部", status: "正常" }
          ];
        } else if (ws.name === "ASY") {
          rowsData = [
            { label: "1_组装外壳紧固件锁付工艺规范.docx", value: "Rev A/2", target: "工艺工程部 / 质量管理课", status: "正常" },
            { label: "2_成品气密性自动测试操作规程.pdf", value: "Rev B/0", target: "设备工程课 / 工程部", status: "正常" },
            { label: "3_组装防静电及尘埃粒子管控办法.docx", value: "Rev B/2", target: "工段管理组 / 5S委员会", status: "正常" }
          ];
        }

        matchedTables.push({
          title: `【${ws.label}】当前有效受控受审作业指导规范`,
          headers: ["受控文件编号/名称", "当前受控版本", "编写受控单位", "系统状态"],
          rows: rowsData
        });

        matchedSuggestions.push(`所有【${ws.label}】受控作业指导规范 (SOP) 均已由后端API集中审核。当前版本与云端物理服务器完全保持 100% 同步。`);
        matchedSuggestions.push("提示：新版操作规程上线时，现场必须第一时间打印并更新于对应工位的实物目视化看板。");
      }

      let responseText = "";
      if (matchedTables.length > 0) {
        responseText = `已为您查询到今日与【${queryText}】相关的【${ws.label}】实时监控指标：`;
      } else {
        const responses = [
          `您的问题我暂时无法理解。如果您想查看【${ws.label}】的实时生产看板，可以输入：出勤率、良率、温湿度、核心机台参数、作业规程文件等关键词。`,
          `很抱歉，我目前没有关于【${ws.label}】您提问的确切信息。我的本地安全生产数据库中暂时没有收录此内容，您可以尝试提问相关的生产核心参数。`,
          `这个问题超出了我当前的知识范围。如果您能提供一些关于【${ws.label}】的上下文或者具体点检表，我将非常乐意帮您一起分析纠正建议。`,
          `由于目前处于离线安全生产模式，我暂时无法实时连接到外部广域网，只为您提供【${ws.label}】的本地 SPC 参数分析。`
        ];
        
        let nextIndex = Math.floor(Math.random() * responses.length);
        if (nextIndex === lastResponseIndexRef.current) {
          nextIndex = (nextIndex + 1) % responses.length;
        }
        lastResponseIndexRef.current = nextIndex;
        responseText = responses[nextIndex];
      }

      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        tables: matchedTables.length > 0 ? matchedTables : undefined,
        suggestions: matchedSuggestions.length > 0 ? matchedSuggestions : undefined,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 850);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed top-3 right-[350px] z-[9999] flex flex-col items-end">
      {/* Top Header Buttons: AI Motion 2.0 (Only in ASSY dashboard) & Agent Assistant */}
      <div className="flex items-center gap-2">
        {/* AI Motion 2.0 Icon Button - Exclusively shown in BONDING & ASSY Dashboards */}
        {(workshop === "ASY" || workshop === "BND") && (
          <a
            href="https://auolenovo.auo.com.cn/ai2"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="AI Motion 2.0"
            className="group relative mr-[19px] flex items-center justify-center p-2 rounded-sm border bg-[#102445]/80 border-cyan-500/40 hover:border-emerald-400 hover:bg-emerald-500/10 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(26,250,41,0.35)] h-[38px] w-[38px]"
          >
            {/* Cyberpunk ambient scanning glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            
            <svg
              className="w-5 h-5 drop-shadow-[0_0_8px_rgba(26,250,41,0.7)] group-hover:scale-110 transition-transform duration-200"
              viewBox="0 0 1414 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M642.360305 664.492442a41.27027 41.27027 0 0 0 82.54054 0h-82.54054z m-220.264656 0a41.27027 41.27027 0 0 0 82.599246 0H422.095649z m41.328976-151.461304a41.27027 41.27027 0 0 0 0 82.599246V513.089844z m220.20595 82.599246a41.27027 41.27027 0 0 0 0-82.54054v82.54054z m-41.27027-151.402598v220.264656h82.54054V444.227786h-82.54054zM504.694895 664.551147V444.227786H422.095649v220.264656h82.599246z m68.803352-289.068008c38.041444 0 68.862058 30.820614 68.862058 68.803353h82.54054A151.461304 151.461304 0 0 0 573.556953 292.825188v82.599246z m0-82.599245a151.461304 151.461304 0 0 0-151.402598 151.461303h82.599246c0-38.041444 30.820614-68.862058 68.803352-68.862058V292.825188z m-110.073622 302.805195h220.20595V513.089844H463.424625v82.54054zM917.573713 444.227786a41.27027 41.27027 0 0 0-82.54054 0h82.599246z m-82.54054 220.264656a41.27027 41.27027 0 0 0 82.599246 0h-82.599246z m0-220.264656v220.264656h82.599246V444.227786h-82.599246zM931.369607 292.825188a55.066164 55.066164 0 1 1-110.073622 0 55.066164 55.066164 0 0 1 110.073622 0z"
                fill="#1afa29"
              />
              <path
                d="M1404.480711 479.275227C1325.814763 366.325014 1043.145701 0 707.171654 0S90.407135 366.325014 9.980008 479.275227a58.88205 58.88205 0 0 0 0 65.457114c79.135596 113.008919 361.745951 479.275227 697.250352 479.275227 335.563106 0 618.584403-366.325014 697.309057-479.275227a58.88205 58.88205 0 0 0 0-65.457114z m-697.309057 439.531311c-271.280111 0-507.80631-278.853176-603.203449-407.066931 95.397139-128.213755 334.154164-407.066931 603.203449-407.066931s507.80631 278.853176 604.142744 407.066931c-96.277728 128.213755-335.093458 407.066931-604.084038 407.066931z"
                fill="#1afa29"
              />
            </svg>

            {/* Corner accents */}
            <div className="absolute right-0 top-0 w-1 h-1 bg-[#1afa29] shadow-[0_0_4px_#1afa29]" />
            <div className="absolute left-0 bottom-0 w-1 h-1 bg-[#1afa29] shadow-[0_0_4px_#1afa29]" />

            {/* Hover floating tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-[#09182d]/95 backdrop-blur-md border border-emerald-500/50 rounded text-emerald-300 text-[11px] font-mono whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.7),0_0_12px_rgba(26,250,41,0.25)] z-50 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI Motion 2.0</span>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#09182d] border-t border-l border-emerald-500/50 rotate-45" />
            </div>
          </a>
        )}

        {/* Glowing floating button below the time */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-sm font-mono text-[12px] font-bold tracking-wider border relative overflow-hidden transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] ${
            isOpen
              ? "bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]"
              : "bg-[#102445]/80 border-cyan-500/40 text-cyan-400 hover:border-cyan-400/80 hover:text-white"
          }`}
        >
          {/* Cyberpunk ambient scanning glow inside button */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
          
          <Sparkles className={`w-4 h-4 ${isOpen ? "animate-spin text-cyan-300" : "animate-pulse"}`} />
          <span>Agent智能助手</span>
          
          <div className="absolute right-0 top-0 w-1.5 h-1.5 bg-cyan-400 shadow-[0_0_5px_cyan]" />
          <div className="absolute left-0 bottom-0 w-1.5 h-1.5 bg-cyan-400 shadow-[0_0_5px_cyan]" />
        </motion.button>
      </div>

      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-14 right-0 w-[440px] h-[740px] bg-gradient-to-b from-[#0a1a2f] to-[#040d1a] border border-cyan-500/50 rounded-sm shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden z-50 mt-1"
          >
            {/* Scanline overlay for cyber tech feeling */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            
            {/* Panel Header */}
            <div className="p-4 bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-cyan-950/80 border-b border-cyan-500/30 flex items-center justify-between relative">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bot className="w-6 h-6 text-cyan-400" />
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#0a1a2f] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-[14px] font-black tracking-widest text-white">Agent智能助手</h3>
                  <span className="text-[10px] text-cyan-500/70 font-mono tracking-tighter">COGNITIVE ENGINE V2.4</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-cyan-500/10 rounded-sm transition-colors text-cyan-500 hover:text-cyan-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 cyber-scrollbar relative bg-[#0f1c32]/60">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs shrink-0 ${
                    msg.sender === "user"
                      ? "bg-cyan-950 border-cyan-500/40 text-cyan-400"
                      : "bg-blue-950 border-blue-500/40 text-cyan-300"
                  }`}>
                    {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Content */}
                  <div className={`max-w-[85%] p-3 rounded-sm relative ${
                    msg.sender === "user"
                      ? "bg-cyan-600/15 border border-cyan-500/30 text-cyan-100 rounded-tr-none text-right ml-auto"
                      : "bg-[#061e38]/90 border border-blue-500/35 text-cyan-200 rounded-tl-none text-left mr-auto"
                  }`}>
                    <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap font-medium">{msg.text}</p>
                    
                    {/* Render Tables */}
                    {msg.tables && msg.tables.length > 0 && (
                      <div className="mt-3 space-y-4">
                        {msg.tables.map((table, tIdx) => (
                          <div key={tIdx} className="border border-cyan-500/25 rounded-sm bg-[#0e1b30]/95 overflow-hidden text-left">
                            <div className="bg-cyan-950/60 px-2.5 py-1.5 border-b border-cyan-500/25 text-[14px] font-bold text-cyan-300 font-mono flex items-center justify-between">
                              <span>{table.title}</span>
                              <span className="text-[10px] bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-400/20">REALTIME</span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-[14px] font-mono text-cyan-100">
                                <thead className="bg-[#0b1b2d] text-cyan-400">
                                  <tr>
                                    {table.headers.map((h, hIdx) => (
                                      <th key={hIdx} className="px-2.5 py-1 text-left font-bold border-b border-cyan-500/15">
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-cyan-500/10">
                                  {table.rows.map((row, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-cyan-500/5 transition-colors">
                                      <td className="px-2.5 py-1.5 text-cyan-300 font-medium">{row.label}</td>
                                      <td className="px-2.5 py-1.5 font-bold text-white">{row.value}</td>
                                      {row.target && <td className="px-2.5 py-1.5 text-cyan-400/70">{row.target}</td>}
                                      {row.status && (
                                        <td className="px-2.5 py-1.5">
                                          <span className={`px-1.5 py-0.5 rounded-sm text-[12px] font-bold ${
                                            row.status === "OK" || row.status === "正常" 
                                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                          }`}>
                                            {row.status}
                                          </span>
                                        </td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Render Suggestions */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3.5 border-t border-cyan-500/20 pt-2.5 text-left">
                        <div className="text-[14px] font-bold text-cyan-300 flex items-center gap-1.5 mb-1.5">
                          <span className="w-1 h-3.5 bg-cyan-400 rounded-sm" />
                          系统优化建议 (SOP Recommendations)
                        </div>
                        <ul className="list-decimal list-inside space-y-1.5 text-[14px] text-cyan-200/90 pl-1 leading-normal font-sans">
                          {msg.suggestions.map((sug, sIdx) => (
                            <li key={sIdx} className="break-words">
                              {sug}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <span className="block text-[10px] text-cyan-500/50 mt-2 font-mono text-right">{msg.timestamp}</span>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center border bg-blue-950 border-blue-500/40 text-cyan-300 shrink-0">
                    <Bot className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="bg-[#061e38]/80 border border-blue-500/20 p-3 rounded-sm rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-cyan-950/10 border-t border-cyan-500/20 flex gap-2 items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="请输入您的提问..."
                className="flex-1 min-w-0 bg-[#020813] border border-cyan-500/30 rounded-sm px-3.5 py-2 text-[14px] text-white placeholder-cyan-500/40 focus:outline-none focus:border-cyan-400 font-mono"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="p-2 rounded-sm bg-cyan-500/10 border border-cyan-500/40 hover:bg-cyan-500/20 hover:border-cyan-400 text-cyan-400 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
