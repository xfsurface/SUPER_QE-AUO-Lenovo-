import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Clock, Sparkles, FileText, CheckCircle2 } from "lucide-react";
import { AiAssistant } from "./AiAssistant";
import { useAppData } from "../App";

export interface OrtRecord {
  fab: string;
  customer: string;
  model: string;
  pn: string;
  cycle: string;
  pcs: number;
  qOrder: string;
  sampleDate: string;
  planRemark: string;
  raReceiveDate: string;
  raReceiveQty: number;
  expResult: string;
  expNo: string;
  envResult: string;
  phyResult: string;
  optResult: string;
  failReportNo: string;
  remark: string;
}

export const ORT_DATA: OrtRecord[] = [
  { fab: "3C", customer: "LENOVO", model: "B160UAN03-2A1", pn: "97.16B07.2A1", cycle: "WK2602", pcs: 23, qOrder: "S01ZQRC235", sampleDate: "1月15日", planRemark: "/", raReceiveDate: "1月15日", raReceiveQty: 23, expResult: "PASS", expNo: "O260116005", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3D", customer: "LENOVO", model: "B160QAN04-T00", pn: "97.16B14.T00", cycle: "WK2602", pcs: 23, qOrder: "K01ZQS1001", sampleDate: "1月6日", planRemark: "/", raReceiveDate: "1月6日", raReceiveQty: 23, expResult: "PASS", expNo: "O260108004", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3C", customer: "LENOVO", model: "B160UAN07-RA0", pn: "97.16B18.RA0", cycle: "WK2602", pcs: 23, qOrder: "S01ZQS1032", sampleDate: "1月12日", planRemark: "/", raReceiveDate: "1月12日", raReceiveQty: 23, expResult: "PASS", expNo: "O260113003", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3C", customer: "LENOVO", model: "B140UAN08-000", pn: "97.14BB4.000", cycle: "WK2603", pcs: 23, qOrder: "S01ZQS1030", sampleDate: "1月14日", planRemark: "/", raReceiveDate: "1月14日", raReceiveQty: 23, expResult: "PASS", expNo: "O260115009", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "4D", customer: "LENOVO", model: "B145QAN01-H01", pn: "97.14BAH.H01", cycle: "WK2604", pcs: 23, qOrder: "S01ZQS1185", sampleDate: "1月30日", planRemark: "/", raReceiveDate: "1月30日", raReceiveQty: 23, expResult: "PASS", expNo: "O260204012", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3C", customer: "LENOVO", model: "B153UAX01-H00", pn: "97.15BAH.H00", cycle: "WK2606", pcs: 23, qOrder: "K01ZQS2003", sampleDate: "2月3日", planRemark: "/", raReceiveDate: "2月3日", raReceiveQty: 23, expResult: "PASS", expNo: "O260204025", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3D", customer: "LENOVO", model: "B160QAN04-U00", pn: "97.16B14.U00", cycle: "WK2607", pcs: 23, qOrder: "K01ZQS2029", sampleDate: "2月13日", planRemark: "/", raReceiveDate: "2月13日", raReceiveQty: 23, expResult: "PASS", expNo: "O260213036", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3C", customer: "LENOVO", model: "B140UAX01-201", pn: "97.14BB3.201", cycle: "WK2609", pcs: 23, qOrder: "K01ZQS2036", sampleDate: "2月23日", planRemark: "/", raReceiveDate: "2月23日", raReceiveQty: 23, expResult: "PASS", expNo: "O260224017", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3D", customer: "LENOVO", model: "B116XAK02-000", pn: "97.11B39.000", cycle: "WK2609", pcs: 32, qOrder: "S01ZQS2148", sampleDate: "3月5日", planRemark: "/", raReceiveDate: "3月5日", raReceiveQty: 32, expResult: "PASS", expNo: "O260305024", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3D", customer: "LENOVO", model: "B140UAK03-300", pn: "97.14BAN.300", cycle: "WK2609", pcs: 32, qOrder: "S01ZQS2143", sampleDate: "3月2日", planRemark: "/", raReceiveDate: "3月2日", raReceiveQty: 32, expResult: "PASS", expNo: "O260303022", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3C", customer: "LENOVO", model: "B140UAX01-200", pn: "97.14BB3.200", cycle: "WK2610", pcs: 23, qOrder: "K01ZQS3007", sampleDate: "3月12日", planRemark: "/", raReceiveDate: "3月12日", raReceiveQty: 23, expResult: "PASS", expNo: "O260313005", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3C", customer: "LENOVO", model: "B140UAN08-001", pn: "97.14BB4.001", cycle: "WK2610", pcs: 23, qOrder: "S01ZQS3013", sampleDate: "3月4日", planRemark: "/", raReceiveDate: "3月4日", raReceiveQty: 23, expResult: "PASS", expNo: "O260305010", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3C", customer: "LENOVO", model: "B153UAX01-H01", pn: "97.15BAH.H01", cycle: "WK2612", pcs: 23, qOrder: "K01ZQS3024", sampleDate: "3月16日", planRemark: "/", raReceiveDate: "3月16日", raReceiveQty: 23, expResult: "PASS", expNo: "O260317038", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3D", customer: "LENOVO", model: "B160UAK01-961", pn: "97.16B06.961", cycle: "WK2612", pcs: 32, qOrder: "S01ZQS3138", sampleDate: "3月23日", planRemark: "/", raReceiveDate: "3月23日", raReceiveQty: 32, expResult: "PASS", expNo: "O260324028", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "4D", customer: "LENOVO", model: "B160ZAN01-T00", pn: "97.16B10.T00", cycle: "WK2615", pcs: 23, qOrder: "K01ZQS4004", sampleDate: "4月8日", planRemark: "/", raReceiveDate: "4月8日", raReceiveQty: 23, expResult: "PASS", expNo: "O260417024", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3D", customer: "LENOVO", model: "B160UAK01-260", pn: "97.16B06.260", cycle: "WK2617", pcs: 32, qOrder: "S01ZQS4138", sampleDate: "4月23日", planRemark: "/", raReceiveDate: "4月23日", raReceiveQty: 32, expResult: "PASS", expNo: "O260424033", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3C", customer: "LENOVO", model: "B160QAN03-L00", pn: "97.16B09.L00", cycle: "WK2615", pcs: 23, qOrder: "K01ZQS4034", sampleDate: "5月8日", planRemark: "/", raReceiveDate: "5月8日", raReceiveQty: 23, expResult: "PASS", expNo: "O260509024", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3C", customer: "LENOVO", model: "B140UAK01-302", pn: "97.14BA8.302", cycle: "WK2619", pcs: 32, qOrder: "S01ZQS5026", sampleDate: "5月8日", planRemark: "/", raReceiveDate: "5月8日", raReceiveQty: 32, expResult: "PASS", expNo: "O260509021", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3C", customer: "LENOVO", model: "B140UAN08-500", pn: "97.14BB4.500", cycle: "WK2620", pcs: 23, qOrder: "S01ZQS5022", sampleDate: "5月11日", planRemark: "/", raReceiveDate: "5月11日", raReceiveQty: 23, expResult: "PASS", expNo: "O260512048", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "4D", customer: "LENOVO", model: "B140UAN10-000", pn: "97.14BBC.000", cycle: "WK2620", pcs: 23, qOrder: "K01ZQS5039", sampleDate: "5月19日", planRemark: "/", raReceiveDate: "5月19日", raReceiveQty: 23, expResult: "PASS", expNo: "O260522022", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3D", customer: "LENOVO", model: "B140HAK02-701", pn: "97.14B82.701", cycle: "WK2621", pcs: 32, qOrder: "S01ZQS5066", sampleDate: "5月18日", planRemark: "/", raReceiveDate: "5月18日", raReceiveQty: 32, expResult: "PASS", expNo: "O260519040", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "4D", customer: "LENOVO", model: "B140UAX01-100", pn: "97.14BB3.100", cycle: "WK2621", pcs: 23, qOrder: "K01ZQS5036", sampleDate: "5月21日", planRemark: "/", raReceiveDate: "5月21日", raReceiveQty: 23, expResult: "PASS", expNo: "O260522012", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3D", customer: "LENOVO", model: "B140UAN04-H00", pn: "97.14BAB.H00", cycle: "WK2622", pcs: 23, qOrder: "S01ZQS5121", sampleDate: "5月28日", planRemark: "/", raReceiveDate: "5月28日", raReceiveQty: 23, expResult: "PASS", expNo: "O260529076", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3C", customer: "LENOVO", model: "B160UAN04-CA0", pn: "97.16B13.CA0", cycle: "WK2622", pcs: 23, qOrder: "S01ZQS5068", sampleDate: "5月18日", planRemark: "/", raReceiveDate: "5月18日", raReceiveQty: 23, expResult: "PASS", expNo: "O260519032", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3C", customer: "LENOVO", model: "B140UAN04-700", pn: "97.14BAB.700", cycle: "WK2619", pcs: 23, qOrder: "S01ZQS5029", sampleDate: "6月3日", planRemark: "/", raReceiveDate: "6月3日", raReceiveQty: 23, expResult: "PASS", expNo: "O260604009", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3C", customer: "LENOVO", model: "B160UAN04-9A0", pn: "97.16B13.9A0", cycle: "WK2623", pcs: 23, qOrder: "S01ZQS6029", sampleDate: "6月5日", planRemark: "/", raReceiveDate: "6月5日", raReceiveQty: 23, expResult: "PASS", expNo: "O260608011", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "4D", customer: "LENOVO", model: "B160UAN06-N70", pn: "97.16B15.N70", cycle: "WK2624", pcs: 23, qOrder: "K01ZQS6038", sampleDate: "6月12日", planRemark: "/", raReceiveDate: "6月12日", raReceiveQty: 23, expResult: "PASS", expNo: "O260612045", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "4D", customer: "LENOVO", model: "B160UAN06-N71", pn: "97.16B15.N71", cycle: "WK2624", pcs: 23, qOrder: "K01ZQS6037", sampleDate: "6月9日", planRemark: "/", raReceiveDate: "6月9日", raReceiveQty: 23, expResult: "PASS", expNo: "O260611012", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" },
  { fab: "3C", customer: "LENOVO", model: "B160QAN05-000", pn: "97.16B29.000", cycle: "WK2624", pcs: 23, qOrder: "K01ZQS6036", sampleDate: "6月11日", planRemark: "/", raReceiveDate: "6月11日", raReceiveQty: 23, expResult: "PASS", expNo: "O260612034", envResult: "PASS", phyResult: "PASS", optResult: "PASS", failReportNo: "Null", remark: "/" }
];

const AUO_LOGO_SVG = "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAxNjAgNjQiPg0KICA8ZyBpZD0iR3JvdXBfMTMwMiIgZGF0YS1uYW1lPSJHcm91cCAxMzAyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjAwIC01MikiPg0KICAgIDxnIGlkPSJpbmZvcm1hdGlvbiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAxLjMzNiA1Ni4zMDcpIj4NCiAgICAgIDxnIGlkPSJHcm91cF8xMzAwIiBkYXRhLW5hbWU9Ikdyb3VwIDEzMDAiPg0KICAgICAgICA8ZyBpZD0iR3JvdXBfMTI5OSIgZGF0YS1uYW1lPSJHcm91cCAxMjk5Ij4NCiAgICAgICAgICA8cGF0aCBpZD0iUGF0aF8xMCIgZGF0YS1uYW1lPSJQYXRoIDEwIiBkPSJNMTUzLjI0MSw2OS42MzNjLTcuNi4wMDYtOS4yMDgtOC43MTMtOS4yMDgtMTUuOTY3LDAtNy4yNzYsMS42MDgtMTUuOTY3LDkuMjE5LTE1Ljk3Miw3LjU4OS4wMDYsOS4yMDgsOC43MDcsOS4yMDgsMTUuOTYxLDAsNy4yNzYtMS42MDgsMTUuOTg5LTkuMjE5LDE1Ljk3OG0uMDExLTQzLjJjLTExLjk3My0uMDIyLTIyLjQ3Niw1LjQzLTI2LjIsMTcuMzI2bC0uNTg3LjAwNi0uMDA2LTE1LjI4LTE4LjE2NC4wMTEuMDA2LDI3Ljk2NWMtLjAwNiw2Ljg3OC0xLjg1NywxMC4wMjUtNy4yMjEsMTAuMDMtNS42NTctLjAwNi03LjIwNy0zLjM5LTcuMjA3LTEwLjAyNWwuMDA4LTI3Ljk3SDc1LjkxN2wtLjAxMSwyNi4wNDRjMCwxLjAzLjExOSwxLjg4Mi4xNzQsMi44NGwtLjQ2Mi4xMzNMNjMuODE3LDI4LjVsLTE3Ljk5My0uMDA2TDI0LjEsODEuOTI0aDIwLjFMNTQuNTcsNDkuNDE3aC4yMzhsLjA0Mi4wMDYuMjE2LS4wMDZMNjUuNDQ3LDgxLjkyNGwyMC4wOTEtLjAwNi0zLjc5NC05LjMzMy4zMTgtLjE1MmM0LjE1NywzLjU2OCwxMC40NjUsNC45OTMsMTkuMDkxLDQuOTkzLDE1LjAzNC4wMDYsMjIuNzQ1LTQuNDU5LDI0LjczMi0xNi4wOGwuNTEyLS4wMDZjMy4wNjEsMTMuNDYyLDE0LjE1OSwxOS41NDUsMjYuODQ0LDE5LjU0LDE0LjkxOC4wMTEsMjcuNzQ2LTguMjg5LDI3Ljc2My0yNy4yMjYtLjAwOC0xOC45NTktMTIuODMxLTI3LjIyNi0yNy43NTItMjcuMjI2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjQuMDk1IC0yNi40MjkpIiBmaWxsPSIjZmZmIi8+DQogICAgICAgIDwvZz4NCiAgICAgIDwvZz4NCiAgICA8L2c+DQogICAgPHJlY3QgaWQ9IlJlY3RhbmdsZV8yNzUiIGRhdGEtbmFtZT0iUmVjdGFuZ2xlIDI3NSIgd2lkdGg9IjE2MCIgaGVpZ2h0PSI2NCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAwIDUyKSIgZmlsbD0ibm9uZSIvPg0KICA8L2c+DQo8L3N2Zz4NCg==";

export function OrtDashboard({ onBack }: { onBack: () => void }) {
  const [time, setTime] = useState(new Date());
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const appData = useAppData();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd} ${hh}:${min}:${ss}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0d1c33] flex flex-col font-sans text-white overflow-hidden ort-dashboard"
    >
      <style>{`
        .ort-dashboard, .ort-dashboard * {
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
              ORT 送样品质看板
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

      {/* Main Flat Content Area */}
      <div className="flex-1 p-5 flex flex-col gap-3 relative overflow-hidden bg-[#0a1526] min-h-0 z-10">
        {/* Background Grids */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="w-full h-full bg-[radial-gradient(#00ffff_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        {/* Top Flat Document Banner matching Image */}
        <div className="bg-gradient-to-r from-[#112240] via-[#0f2748] to-[#112240] border border-cyan-500/40 rounded-xl px-6 py-3 flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.15)] relative z-10 shrink-0 min-h-[64px]">
          {/* AUO Brand Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={AUO_LOGO_SVG} 
              alt="AUO" 
              className="h-7 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
              referrerPolicy="no-referrer" 
            />
            <div className="h-6 w-[1px] bg-cyan-500/40 mx-1" />
            <div className="text-xs text-cyan-300/70 font-mono tracking-widest uppercase hidden sm:block">
              LENOVO QUALITY ASSURANCE SYSTEM
            </div>
          </div>

          {/* Center Document Title */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl md:text-2xl font-black tracking-[0.25em] text-white text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] pointer-events-none whitespace-nowrap">
            ORT送样汇总记录表
          </div>

          {/* Right Storage Specs Box */}
          <div className="border border-cyan-500/40 rounded bg-cyan-950/40 text-xs font-mono overflow-hidden shadow-[0_0_8px_rgba(6,182,212,0.2)]">
            <div className="flex border-b border-cyan-500/30">
              <div className="px-3 py-1 bg-cyan-900/40 text-cyan-300 font-bold border-r border-cyan-500/30 w-20 text-center">保管单位</div>
              <div className="px-3 py-1 text-white font-bold w-16 text-center">QM</div>
            </div>
            <div className="flex">
              <div className="px-3 py-1 bg-cyan-900/40 text-cyan-300 font-bold border-r border-cyan-500/30 w-20 text-center">保管年限</div>
              <div className="px-3 py-1 text-white font-bold w-16 text-center">三年</div>
            </div>
          </div>
        </div>

        {/* Table Container Filling Full Height */}
        <div className="flex-1 bg-gradient-to-b from-[#112240]/90 to-[#0a1526]/95 border border-cyan-500/30 rounded-xl p-3 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col min-h-0 relative z-10 overflow-hidden">
          <div className="flex-1 overflow-auto cyber-scrollbar border border-cyan-900/50 rounded-lg bg-[#071324] min-h-0">
            <table className="w-full text-center border-collapse text-white text-[12px] font-mono whitespace-nowrap">
              {/* Table Header: Dual Level Bands Matching Image */}
              <thead className="sticky top-0 z-30 shadow-md">
                {/* Level 1: Category Color Header Bands */}
                <tr className="text-slate-900 font-black text-[13px] tracking-wider uppercase">
                  <th 
                    colSpan={9} 
                    className="bg-[#f59e0b] border-r-2 border-b border-amber-600 text-slate-950 py-1.5 px-2 text-center font-bold tracking-widest shadow-inner"
                  >
                    Jan.ORT Plan
                  </th>
                  <th 
                    colSpan={7} 
                    className="bg-[#60a5fa] border-r-2 border-b border-blue-600 text-slate-950 py-1.5 px-2 text-center font-bold tracking-widest shadow-inner"
                  >
                    RA
                  </th>
                  <th 
                    colSpan={2} 
                    className="bg-[#fb923c] border-b border-orange-600 text-slate-950 py-1.5 px-2 text-center font-bold tracking-widest shadow-inner"
                  >
                    QE
                  </th>
                </tr>

                {/* Level 2: Specific Column Headers */}
                <tr className="bg-[#102445] text-cyan-200 font-bold text-[11px] uppercase tracking-tight">
                  {/* Jan.ORT Plan Columns */}
                  <th className="border border-cyan-800/60 py-2.5 px-2 bg-[#102445] text-amber-300">FAB</th>
                  <th className="border border-cyan-800/60 py-2.5 px-2 bg-[#102445] text-amber-300">客户</th>
                  <th className="border border-cyan-800/60 py-2.5 px-3 bg-[#102445] text-amber-300">Model</th>
                  <th className="border border-cyan-800/60 py-2.5 px-3 bg-[#102445] text-amber-300">P/N</th>
                  <th className="border border-cyan-800/60 py-2.5 px-2 bg-[#102445] text-amber-300">计划送样周期</th>
                  <th className="border border-cyan-800/60 py-2.5 px-2 bg-[#102445] text-amber-300">PCS</th>
                  <th className="border border-cyan-800/60 py-2.5 px-2.5 bg-[#102445] text-amber-300">Q工单</th>
                  <th className="border border-cyan-800/60 py-2.5 px-2.5 bg-[#102445] text-amber-300">送样日期</th>
                  <th className="border border-cyan-800/60 py-2.5 px-2 bg-[#102445] text-amber-300 border-r-2 border-r-amber-500/60">备注</th>

                  {/* RA Columns */}
                  <th className="border border-cyan-800/60 py-2.5 px-2.5 bg-[#102445] text-blue-300">RA 接收日期</th>
                  <th className="border border-cyan-800/60 py-2.5 px-2 bg-[#102445] text-blue-300">接收数量</th>
                  <th className="border border-cyan-800/60 py-2.5 px-2 bg-[#102445] text-blue-300">实验结果</th>
                  <th className="border border-cyan-800/60 py-2.5 px-3 bg-[#102445] text-blue-300">实验编号</th>
                  <th className="border border-cyan-800/60 py-2.5 px-2 bg-[#102445] text-blue-300">环测结果</th>
                  <th className="border border-cyan-800/60 py-2.5 px-2 bg-[#102445] text-blue-300">物理结果</th>
                  <th className="border border-cyan-800/60 py-2.5 px-2 bg-[#102445] text-blue-300 border-r-2 border-r-blue-500/60">光学结果</th>

                  {/* QE Columns */}
                  <th className="border border-cyan-800/60 py-2.5 px-3 bg-[#102445] text-orange-300">Fail 异常单编号填写<br/><span className="text-[10px] font-normal text-slate-400">(若 PASS, 此栏位为空)</span></th>
                  <th className="border border-cyan-800/60 py-2.5 px-2 bg-[#102445] text-orange-300">Remark</th>
                </tr>
              </thead>

              {/* Table Body: 29 Rows */}
              <tbody className="divide-y divide-cyan-950/60 text-[11.5px]">
                {ORT_DATA.map((row, idx) => {
                  const isSelected = selectedRowIndex === idx;
                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedRowIndex(idx)}
                      className={`transition-colors cursor-pointer ${
                        isSelected 
                          ? "bg-cyan-500/25 text-white font-bold" 
                          : "hover:bg-cyan-500/10 odd:bg-cyan-950/15 even:bg-[#071324] text-slate-200"
                      }`}
                    >
                      {/* Jan.ORT Plan Data */}
                      <td className="border border-cyan-900/40 py-2 px-2 text-cyan-200 font-bold">{row.fab}</td>
                      <td className="border border-cyan-900/40 py-2 px-2 text-amber-200 font-medium">{row.customer}</td>
                      <td className="border border-cyan-900/40 py-2 px-3 text-cyan-100 font-semibold text-left">{row.model}</td>
                      <td className="border border-cyan-900/40 py-2 px-3 text-cyan-300">{row.pn}</td>
                      <td className="border border-cyan-900/40 py-2 px-2 text-slate-300">{row.cycle}</td>
                      <td className="border border-cyan-900/40 py-2 px-2 text-amber-300 font-bold">{row.pcs}</td>
                      <td className="border border-cyan-900/40 py-2 px-2.5 text-cyan-200">{row.qOrder}</td>
                      <td className="border border-cyan-900/40 py-2 px-2.5 text-slate-300">{row.sampleDate}</td>
                      <td className="border border-cyan-900/40 py-2 px-2 text-slate-400 border-r-2 border-r-amber-500/30">{row.planRemark}</td>

                      {/* RA Data */}
                      <td className="border border-cyan-900/40 py-2 px-2.5 text-blue-200">{row.raReceiveDate}</td>
                      <td className="border border-cyan-900/40 py-2 px-2 text-blue-300 font-bold">{row.raReceiveQty}</td>
                      <td className="border border-cyan-900/40 py-2 px-2">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {row.expResult}
                        </span>
                      </td>
                      <td className="border border-cyan-900/40 py-2 px-3 text-cyan-300 font-mono tracking-wide">{row.expNo}</td>
                      <td className="border border-cyan-900/40 py-2 px-2">
                        <span className="text-emerald-400 font-bold">{row.envResult}</span>
                      </td>
                      <td className="border border-cyan-900/40 py-2 px-2">
                        <span className="text-emerald-400 font-bold">{row.phyResult}</span>
                      </td>
                      <td className="border border-cyan-900/40 py-2 px-2 border-r-2 border-r-blue-500/30">
                        <span className="text-emerald-400 font-bold">{row.optResult}</span>
                      </td>

                      {/* QE Data */}
                      <td className="border border-cyan-900/40 py-2 px-3 text-slate-400 italic">{row.failReportNo}</td>
                      <td className="border border-cyan-900/40 py-2 px-2 text-slate-400">{row.remark}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Bar Summary */}
          <div className="flex justify-between items-center text-xs text-cyan-400/80 font-mono uppercase tracking-wider shrink-0 pt-2 px-2">
            <div className="flex items-center gap-6">
              <span>送样记录总计: <strong className="text-cyan-200">{ORT_DATA.length}</strong> 批次</span>
              <span>客户群体: <strong className="text-amber-300">LENOVO 联想专属</strong></span>
              <span>实验通过率: <strong className="text-emerald-400 font-bold">100.0% ALL PASS</strong></span>
            </div>
            <div className="flex items-center gap-2 text-cyan-500/70">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ORT QUALITY ARCHIVE VERIFIED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Render AiAssistant */}
      <AiAssistant workshop="ORT" />
    </motion.div>
  );
}

export default OrtDashboard;
