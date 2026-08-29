import express from "express";
import path from "path";
import { ZipArchive } from "archiver";
import fs from "fs";
import { getTrendData, getStatusData, getParticleSizeData, getBondingCouplingData } from "./server-db";

async function startServer() {
  // Safe production environment fallback
  if (!process.env.NODE_ENV && fs.existsSync(path.join(process.cwd(), "dist", "index.html"))) {
    process.env.NODE_ENV = "production";
  }

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Standard files configuration for all workshops (isolated data per site)
  const cutFiles = [
    { name: "1_切割规范基本操作规程.docx" },
    { name: "2_设备安全操作手册.doc" },
    { name: "3_核心备件保养巡检标准.xlsx" },
    { name: "4_生产流程与控制节点图.pdf" },
    { name: "5_切割崩边缺陷判定与限度标准.doc" },
    { name: "6_切割工段5S现场定置整顿准则.docx" }
  ];

  const iqcFiles = [
    { name: "1_IQC来料物理尺寸检验规程.docx" },
    { name: "2_AQL计数抽样程序与抽样方案.pdf" },
    { name: "3_背光偏光片外观缺陷限度标准.xlsx" }
  ];

  const pfaFiles = [
    { name: "1_PFA偏光片贴合首件点检规程.docx" },
    { name: "2_偏贴偏光片静电控制管理细则.pdf" },
    { name: "3_脱泡机高压容器安全运行条例.docx" }
  ];

  const bondingFiles = [
    { name: "1_ACF贴附与预压合工艺指导书.docx" },
    { name: "2_FPC主绑定热压温度与压力标准.pdf" },
    { name: "3_本绑定偏差补正与防呆操作细则.pdf" },
    { name: "4_COG本压温度巡检与防呆作业指导.pdf" },
    { name: "5_FOG热压刀平整度点检规范.docx" },
    { name: "6_导电粒子破损率判定标准.xlsx" }
  ];

  const assyFiles = [
    { name: "1_组装外壳紧固件锁付工艺规范.docx" },
    { name: "2_成品气密性自动测试操作规程.pdf" },
    { name: "3_组装防静电及尘埃粒子管控办法.docx" },
    { name: "4_点胶固化时间与紫外强度标准.pdf" },
    { name: "5_整机外观卡扣缝隙公差判定限度.xlsx" },
    { name: "6_组装工段5S定置与超净作业准则.docx" }
  ];

  const shippingFiles = [
    { name: "1_SHIPPING成品出货检核与装车作业指导书.docx" },
    { name: "2_客户料号与P/N防呆扫码作业标准.pdf" },
    { name: "3_集装箱温湿度及防震动监控规范.docx" },
    { name: "4_发货单据与出口报关文件管理守则.pdf" }
  ];

  // Helper mapping for site standard files
  const getSiteFiles = (site: string) => {
    const ws = (site || "").toLowerCase();
    if (ws === "cut") return { files: cutFiles, dept: "生产制造部切割工段" };
    if (ws === "iqc") return { files: iqcFiles, dept: "品质管理部进料检验组(IQC)" };
    if (ws === "pfa") return { files: pfaFiles, dept: "生产制造部偏贴车间(PFA)" };
    if (ws === "bonding" || ws === "bnd") return { files: bondingFiles, dept: "生产制造部绑定车间(BONDING)" };
    if (ws === "assy" || ws === "asy") return { files: assyFiles, dept: "生产制造部组装车间(ASSY)" };
    if (ws === "shipping" || ws === "shp") return { files: shippingFiles, dept: "生产制造部出货物流车间(SHIPPING)" };
    return { files: [], dept: `生产制造部(${ws.toUpperCase()})` };
  };

  // Workshop-specific explicit files endpoints
  app.get("/api/cut/files", (req, res) => res.json(cutFiles));
  app.get("/api/iqc/files", (req, res) => res.json(iqcFiles));
  app.get("/api/pfa/files", (req, res) => res.json(pfaFiles));
  app.get("/api/bonding/files", (req, res) => res.json(bondingFiles));
  app.get("/api/bnd/files", (req, res) => res.json(bondingFiles));
  app.get("/api/assy/files", (req, res) => res.json(assyFiles));
  app.get("/api/asy/files", (req, res) => res.json(assyFiles));
  app.get("/api/shipping/files", (req, res) => res.json(shippingFiles));
  app.get("/api/shp/files", (req, res) => res.json(shippingFiles));

  // Unified workshop download handler
  const handleWorkshopDownload = (siteName: string, req: express.Request, res: express.Response) => {
    const name = (req.query.name || req.query.file) as string;
    if (!name) {
      return res.status(400).json({ error: "Missing file name" });
    }

    const { files, dept } = getSiteFiles(siteName);
    if (!files.length) {
      return res.status(404).json({ error: `Workshop ${siteName} not found` });
    }

    const fileExists = files.some(f => f.name === name);
    if (!fileExists) {
      return res.status(404).json({ error: `File '${name}' not found in ${siteName} workshop` });
    }

    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(name)}"`);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    const virtualContent = `===========================================================
               【工业智能制程管理 SOP 技术规程】
===========================================================
受控部门: ${dept}
受控文件名: ${name}
生成时间: ${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}
系统安全等级: 核心受控 (Confidential - Controlled SOP Document)

[SOP-${siteName.toUpperCase()}-VIRTUAL-PREVIEW]
本文件为后台服务器自动生成的虚拟受控标准技术文件，支持完整业务测试与各工段数据隔离。
后续将由工艺工程组更新为完整格式的正式电子文本。

【工艺纪律核心红线】
1. 操作人员上岗必须持有该制程岗位的有效认证资质。
2. 严禁私自绕过或关闭设备上的防呆连锁机构及警报系统。
3. 温湿度及粒子洁净指标未达标前严禁开机。

------------------ [受控文本结束] ------------------
`;
    res.send(virtualContent);
  };

  // Workshop-specific explicit download endpoints
  app.get("/api/cut/files/download", (req, res) => handleWorkshopDownload("cut", req, res));
  app.get("/api/cut/download", (req, res) => handleWorkshopDownload("cut", req, res));
  app.get("/api/iqc/files/download", (req, res) => handleWorkshopDownload("iqc", req, res));
  app.get("/api/iqc/download", (req, res) => handleWorkshopDownload("iqc", req, res));
  app.get("/api/pfa/files/download", (req, res) => handleWorkshopDownload("pfa", req, res));
  app.get("/api/pfa/download", (req, res) => handleWorkshopDownload("pfa", req, res));
  app.get("/api/bonding/files/download", (req, res) => handleWorkshopDownload("bonding", req, res));
  app.get("/api/bonding/download", (req, res) => handleWorkshopDownload("bonding", req, res));
  app.get("/api/bnd/files/download", (req, res) => handleWorkshopDownload("bonding", req, res));
  app.get("/api/bnd/download", (req, res) => handleWorkshopDownload("bonding", req, res));
  app.get("/api/assy/files/download", (req, res) => handleWorkshopDownload("assy", req, res));
  app.get("/api/assy/download", (req, res) => handleWorkshopDownload("assy", req, res));
  app.get("/api/asy/files/download", (req, res) => handleWorkshopDownload("assy", req, res));
  app.get("/api/asy/download", (req, res) => handleWorkshopDownload("assy", req, res));
  app.get("/api/shipping/files/download", (req, res) => handleWorkshopDownload("shipping", req, res));
  app.get("/api/shipping/download", (req, res) => handleWorkshopDownload("shipping", req, res));
  app.get("/api/shp/files/download", (req, res) => handleWorkshopDownload("shipping", req, res));
  app.get("/api/shp/download", (req, res) => handleWorkshopDownload("shipping", req, res));

  // Generic parameterized workshop routes
  app.get("/api/:workshop/files", (req, res) => {
    const { files } = getSiteFiles(req.params.workshop);
    if (!files.length) {
      return res.status(404).json({ error: `Workshop ${req.params.workshop} not found` });
    }
    res.json(files);
  });

  app.get("/api/:workshop/download", (req, res) => {
    handleWorkshopDownload(req.params.workshop, req, res);
  });
  app.get("/api/:workshop/files/download", (req, res) => {
    handleWorkshopDownload(req.params.workshop, req, res);
  });

  // SOP Detail endpoint (for DocModal and rich preview)
  app.get("/api/sop/detail", (req, res) => {
    const docName = (req.query.doc_name || req.query.name || "") as string;
    if (!docName) {
      return res.status(400).json({ status: "error", message: "参数 doc_name 缺失" });
    }
    const cleanName = docName.replace(/\.docx|\.pdf|\.xlsx|\.doc/g, "");
    res.json({
      status: "success",
      data: {
        title: `关于【${cleanName}】的标准作业规程指导书`,
        code: `SOP-NODE-${Math.abs(cleanName.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) % 10000).toString().padStart(4, "0")}`,
        version: "Rev A/1 (System Generated)",
        dept: "工艺标准委员会 / 生产控制部",
        auditor: "生产工段首席签发官",
        pages: [
          [
            { type: "p", content: `1. 目的与适用范围：本标准指导书针对“${cleanName}”现场作业而专门制定，适用于全体技术员、品管工程师。` },
            { type: "h2", content: "工业标准作业监控及复核项" },
            { type: "table" },
            { type: "p", content: `2. 操作规范红线：严禁不具备工艺授权认证资格的操作员单独点检或点动调试“${cleanName}”相关设备。` },
            { type: "p", content: "3. 5S现场控制：每次换班交接时，必须保证工位工具定置摆放，超净防尘指标符合标准。" }
          ]
        ],
        table: {
          headers: ["控制维度", "控制指标/目标值", "执行频次", "记录表单"],
          rows: [
            ["人员防护", "符合车间防静电与安全规范", "上线作业前", "工段出勤日志表"],
            ["物料质量", "表面无灰尘、划伤及气泡", "每批次抽样点检", "品管来料巡检单"],
            ["关键参数", "严格按设备额定规格限值运行", "日常连续监测", "工艺控制卡(SPC)"],
            ["台面整理", "工作台及设备面无杂物积水", "每班交班前", "5S看板记录本"]
          ]
        }
      }
    });
  });

  // SOP Download endpoint (generic endpoint)
  const handleSopDownload = (req: express.Request, res: express.Response) => {
    const fileName = (req.params.fileName || req.query.name || req.query.file || "SOP_Document.docx") as string;
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(`===========================================================
               【工业智能制程管理 SOP 技术规程】
===========================================================
系统受控文件: ${fileName}
生成时间: ${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}
安全等级: 核心机密 (Confidential - Controlled Document)

本文件由云端工业控制系统自动下发。
------------------ [受控文本结束] ------------------
`);
  };

  app.get("/api/sop/download", handleSopDownload);
  app.get("/api/sop/download/:fileName", handleSopDownload);

  // API Route: Trend Data
  app.get("/api/production-data", (req, res) => {
    const site = req.query.site as string;
    const datesStr = req.query.dates as string;
    if (!site || !datesStr) {
      return res.status(400).json({ error: "Missing site or dates" });
    }
    const dates = datesStr.split(",");
    const result = getTrendData(site, dates);
    res.json(result);
  });

  // API Route: Status Table Data
  app.get("/api/status-table", (req, res) => {
    const site = req.query.site as string;
    const date = req.query.date as string;
    if (!site || !date) {
      return res.status(400).json({ error: "Missing site or date" });
    }
    const result = getStatusData(site, date);
    res.json(result);
  });

  // API Route: Particle Size Data
  app.get("/api/particle-size", (req, res) => {
    const date = req.query.date as string;
    if (!date) {
      return res.status(400).json({ error: "Missing date" });
    }
    const result = getParticleSizeData(date);
    res.json(result);
  });

  // API Route: Bonding Coupling Data
  app.get("/api/bonding-coupling", (req, res) => {
    const date = req.query.date as string;
    if (!date) {
      return res.status(400).json({ error: "Missing date" });
    }
    const result = getBondingCouplingData(date);
    res.json(result);
  });

  // Serve static appData.json directly
  app.get("/appData.json", (req, res) => {
    res.sendFile(path.join(process.cwd(), "src", "data", "appData.json"));
  });

  // API Route: Export entire project source files as a ZIP archive
  app.get("/api/export-project", async (req, res) => {
    try {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="project-export.zip"');

      const archive = new ZipArchive({
        zlib: { level: 9 }
      });

      archive.on("error", (err) => {
        console.error("Archive error:", err);
        if (!res.headersSent) {
          res.status(500).send({ error: err.message });
        }
      });

      archive.pipe(res);

      // Add directories
      if (fs.existsSync("src")) {
        archive.directory("src/", "src");
      }
      if (fs.existsSync("public")) {
        archive.directory("public/", "public");
      }

      // Add individual root files safely if they exist
      const rootFiles = [
        "package.json",
        "package-lock.json",
        "tsconfig.json",
        "vite.config.ts",
        "server.ts",
        "server-db.ts",
        "db.json",
        ".gitignore",
        ".env.example",
        "index.html",
        "metadata.json",
        "copy-dist.js",
        "bun.lock"
      ];

      for (const file of rootFiles) {
        if (fs.existsSync(file)) {
          archive.file(file, { name: file });
        }
      }

      await archive.finalize();
    } catch (err: any) {
      console.error("Export error:", err);
      if (!res.headersSent) {
        res.status(500).send({ error: err.message });
      }
    }
  });

  // Determine if we should serve static assets (production) or run Vite dev middleware
  const distPath = path.join(process.cwd(), "dist");
  const hasDistIndex = fs.existsSync(path.join(distPath, "index.html"));
  const isProduction = process.env.NODE_ENV === "production" && hasDistIndex;

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const indexFile = path.join(distPath, "index.html");
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send("Application dist/index.html not found. Please run build.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
