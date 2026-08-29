import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "db.json");

interface TrendRecord {
  yield: number;
  productivity: number;
}

interface DBStructure {
  trendData: Record<string, Record<string, TrendRecord>>;
  statusData: Record<string, Record<string, any[]>>;
  chartsData: {
    particleSize: Record<string, number[][]>;
    bondingCoupling: Record<string, { times: string[]; temps: number[]; pressures: number[] }>;
  };
}

function getSeededRandom(dateStr: string, seedOffset: string | number): number {
  const str = `${dateStr}_${seedOffset}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

function readDB(): DBStructure {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initial: DBStructure = {
        trendData: { cut: {}, iqc: {}, pfa: {}, bonding: {}, assy: {} },
        statusData: { cut: {}, iqc: {}, pfa: {}, bonding: {}, assy: {} },
        chartsData: { particleSize: {}, bondingCoupling: {} }
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const content = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading database file, resetting:", error);
    const initial: DBStructure = {
      trendData: { cut: {}, iqc: {}, pfa: {}, bonding: {}, assy: {} },
      statusData: { cut: {}, iqc: {}, pfa: {}, bonding: {}, assy: {} },
      chartsData: { particleSize: {}, bondingCoupling: {} }
    };
    return initial;
  }
}

function writeDB(data: DBStructure) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

export function getTrendData(site: string, dates: string[]) {
  const db = readDB();
  const siteKey = site.toLowerCase();
  const siteTrends = db.trendData[siteKey] || {};
  let modified = false;

  const result = dates.map(date => {
    if (!siteTrends[date]) {
      // Generate site-isolated seeded random data for this date
      let yieldVal = 0;
      let prodVal = 0;

      if (siteKey === "cut") {
        yieldVal = parseFloat((99.8 + getSeededRandom(date, "cut_yield") * 0.18).toFixed(2));
        prodVal = Math.floor(10000 + getSeededRandom(date, "cut_prod") * 5000);
      } else if (siteKey === "iqc") {
        yieldVal = parseFloat((98.9 + getSeededRandom(date, "iqc_yield") * 0.9).toFixed(2));
        prodVal = Math.floor(180 + getSeededRandom(date, "iqc_prod") * 70);
      } else if (siteKey === "pfa") {
        yieldVal = parseFloat((98.5 + getSeededRandom(date, "pfa_yield") * 0.5).toFixed(2));
        prodVal = Math.floor(6000 + getSeededRandom(date, "pfa_prod") * 1000);
      } else if (siteKey === "bonding" || siteKey === "bnd") {
        yieldVal = parseFloat((99.40 + getSeededRandom(date, "bonding_yield") * 0.40).toFixed(2));
        prodVal = Math.floor(5500 + getSeededRandom(date, "bonding_prod") * 1000);
      } else if (siteKey === "assy" || siteKey === "asy") {
        yieldVal = parseFloat((97.00 + getSeededRandom(date, "assy_yield") * 2.00).toFixed(2));
        prodVal = Math.floor(6000 + getSeededRandom(date, "assy_prod") * 1000);
      } else if (siteKey === "shipping") {
        yieldVal = parseFloat((99.4 + getSeededRandom(date, "shipping_yield") * 0.55).toFixed(2));
        prodVal = Math.floor(15000 + getSeededRandom(date, "shipping_prod") * 6000);
      } else {
        yieldVal = parseFloat((99.0 + getSeededRandom(date, `${siteKey}_yield`) * 0.8).toFixed(2));
        prodVal = Math.floor(5000 + getSeededRandom(date, `${siteKey}_prod`) * 2000);
      }

      siteTrends[date] = { yield: yieldVal, productivity: prodVal };
      modified = true;
    }
    return {
      date,
      yield: siteTrends[date].yield,
      productivity: siteTrends[date].productivity
    };
  });

  if (modified) {
    db.trendData[siteKey] = siteTrends;
    writeDB(db);
  }

  return result;
}

export function getStatusData(site: string, date: string) {
  const db = readDB();
  const wsKey = site.toLowerCase();
  const siteStatus = db.statusData[wsKey] || {};
  
  const results: any[] = [];
  if (wsKey === "cut") {
    const lines = ["CUT-09#", "CUT-10#", "CUT-11#", "CUT-12#"];
    lines.forEach(l => {
      if (l === "CUT-10#") {
        results.push({ line: l, param: "切割压力", val: "5.0", up: "7", low: "3", status: "OK" });
        results.push({ line: l, param: "切割速度", val: Math.round(150 + getSeededRandom(date, `${l}_speed`) * 110).toString(), up: "300", low: "100", status: "OK" });
        results.push({ line: l, param: "下刀量", val: "0.3", up: "0.4", low: "0.2", status: "OK" });
      } else {
        results.push({ line: l, param: "切割压力", val: (7.0 + getSeededRandom(date, `${l}_press`) * 1.5).toFixed(1), up: "10", low: "4", status: "OK" });
        results.push({ line: l, param: "切割速度", val: Math.round(150 + getSeededRandom(date, `${l}_speed`) * 110).toString(), up: "300", low: "100", status: "OK" });
        results.push({ line: l, param: "下刀量", val: "0.3", up: "0.7", low: "0.3", status: "OK" });
      }
    });
  } else if (wsKey === "iqc") {
    const lines = ["L01", "L02", "L03", "L04", "L05"];
    lines.forEach(l => {
      results.push({ line: `${l}-IQC`, param: "投影偏差", val: (0.02 + getSeededRandom(date, `${l}_dev`) * 0.02).toFixed(2) + " μm", up: "0.05", low: "0.00", status: "OK" });
      results.push({ line: `${l}-IQC`, param: "光源照度", val: (1250 + getSeededRandom(date, `${l}_lux`) * 100).toFixed(0) + " Lux", up: "1400", low: "1100", status: "OK" });
      results.push({ line: `${l}-IQC`, param: "检测速度", val: (45.0 + getSeededRandom(date, `${l}_spd`) * 5.0).toFixed(1) + " s/pcs", up: "55.0", low: "35.0", status: "OK" });
    });
  } else if (wsKey === "pfa") {
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
  } else if (wsKey === "bonding" || wsKey === "bnd") {
    const lines = ["03", "05", "06", "09", "10", "11"];
    lines.forEach(l => {
      const lineName = `BD-${l}#`;
      // 本压时间设定为5s (整数)
      const tVal = "5";
      // 本压温度设定为180度上下20度 (整数)
      const tempVal = Math.round(180 + (getSeededRandom(date, `${l}_bnd_temp`) - 0.5) * 10).toString();
      // 本压压力设定为0.5Mpa上下0.05 (保留两位小数)
      const pVal = (0.50 + (getSeededRandom(date, `${l}_bnd_press`) - 0.5) * 0.04).toFixed(2);

      results.push({ line: lineName, param: "本压时间", val: tVal, up: "6", low: "4", status: "OK" });
      results.push({ line: lineName, param: "本压温度", val: tempVal, up: "200", low: "160", status: "OK" });
      results.push({ line: lineName, param: "本压压力", val: pVal, up: "0.55", low: "0.45", status: "OK" });
    });
  } else if (wsKey === "assy" || wsKey === "asy") {
    const lines = ["01", "02"];
    lines.forEach(l => {
      const lineName = `ASSY-${l}#`;
      const speedVal = l === "01" ? "20" : "40";
      const dwellVal = "0.5s";
      results.push({ line: lineName, param: "组装速度", val: speedVal, up: "45", low: "15", status: "OK" });
      results.push({ line: lineName, param: "保压时间", val: dwellVal, up: "0.7", low: "0.3", status: "OK" });
    });
  } else if (wsKey === "shipping" || wsKey === "shp") {
    const docks = ["DOCK-01", "DOCK-02", "DOCK-03"];
    docks.forEach(d => {
      results.push({ line: d, param: "装运称重校准", val: (99.8 + getSeededRandom(date, `${d}_cal`) * 0.18).toFixed(2) + " %", up: "100.00", low: "99.00", status: "OK" });
      results.push({ line: d, param: "扫码识别率", val: (99.9 + getSeededRandom(date, `${d}_scan`) * 0.09).toFixed(2) + " %", up: "100.00", low: "99.50", status: "OK" });
      results.push({ line: d, param: "集装箱温控", val: (22.5 + getSeededRandom(date, `${d}_temp`) * 2.0).toFixed(1) + " ℃", up: "28.0", low: "18.0", status: "OK" });
    });
  }
  siteStatus[date] = results;
  db.statusData[wsKey] = siteStatus;
  writeDB(db);

  return results;
}

export function getParticleSizeData(date: string) {
  const db = readDB();
  const particleSize = db.chartsData.particleSize || {};

  if (!particleSize[date]) {
    const data = [];
    for (let i = 0; i < 18; i++) {
      data.push([
        700 + getSeededRandom(date, `part_x_${i}`) * 200, 
        700 + getSeededRandom(date, `part_y_${i}`) * 200
      ]);
    }
    particleSize[date] = data;
    db.chartsData.particleSize = particleSize;
    writeDB(db);
  }

  return particleSize[date];
}

export function getBondingCouplingData(date: string) {
  const db = readDB();
  const bondingCoupling = db.chartsData.bondingCoupling || {};

  if (!bondingCoupling[date]) {
    const points = 12;
    const times = [];
    const temps = [];
    const pressures = [];
    for (let i = 0; i < points; i++) {
      times.push(`T-${(points - 1 - i) * 10}s`);
      temps.push(parseFloat((183.5 + getSeededRandom(date, `bnd_t_${i}`) * 3.5).toFixed(1)));
      pressures.push(parseFloat((2.05 + getSeededRandom(date, `bnd_p_${i}`) * 0.25).toFixed(2)));
    }
    bondingCoupling[date] = { times, temps, pressures };
    db.chartsData.bondingCoupling = bondingCoupling;
    writeDB(db);
  }

  return bondingCoupling[date];
}
