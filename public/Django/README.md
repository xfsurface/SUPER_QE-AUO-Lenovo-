# 🏭 智能工厂制程管理系统 - Django 后端迁移与集成部署指南

本文档指导如何将前端 React 生产构建包无缝迁移并挂载到 Django 后端框架。

---

## 📁 目录结构概览

在运行 `npm run build` 后，系统会自动生成并同步完整的 Django 所需静态与后端文件包（位于 `public/Django/` 和 `dist/Django/`）：

```text
Django/
├── README.md              # 部署集成说明文档 (当前文件)
├── urls.py                # Django 路由总表 (覆盖所有车间工段及SOP文件API)
├── views.py               # Django API视图逻辑 (各工段严格数据隔离)
├── models.py              # Django ORM数据模型 (支持持久化数据库存储)
├── admin.py               # Django 后台管理配置 (用于在管理后台查看/编辑参数)
├── settings_sample.py     # Django settings.py 配置参考模板
├── index.html             # 已注入 {% load static %} 与 {% static 'Django/...' %} 的模板
├── appData.json           # 车间静态元数据配置文件
├── index-*.js             # 前端 React 生产压缩编译脚本
└── index-*.css            # 前端 Tailwind 生产样式表
```

---

## 🚀 极简迁移步骤 (3步完成)

### 步骤 1：拷贝静态资源与模板
1. 将 `index-*.js`、`index-*.css`、`appData.json` 放置到 Django 项目的静态目录中：
   `your_django_project/static/Django/`
2. 将 `index.html` 放置到 Django 的模板目录中：
   `your_django_project/templates/index.html` (或者配置模板路径包含 `static/Django`)

### 步骤 2：引入后端视图与路由
1. 将 `views.py` 与 `urls.py` 放入您的 Django App 目录（如 `factory_dashboard/`）。
2. 在项目根 `urls.py` 中引入：
   ```python
   from django.contrib import admin
   from django.urls import path, include

   urlpatterns = [
       path('admin/', admin.site.urls),
       path('', include('factory_dashboard.urls')),
   ]
   ```

### 步骤 3：启动并验证
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```
在浏览器中打开 `http://localhost:8000/` 即可直接访问全功能车间看板。

---

## 🔒 各站点数据隔离机制说明

后端在 `views.py` 与 `models.py` 中通过 `site` 或 `workshop_name` 参数实现了严格的站点数据隔离：

| 工段代码 | 工段中文名称 | 核心监控产线/工位 | 每日产出区间 (pcs) | 目标良率区间 (%) |
| :--- | :--- | :--- | :--- | :--- |
| **`iqc`** | 进料检验 | L01-IQC ~ L05-IQC | 180 ~ 250 | 98.90% ~ 99.80% |
| **`cut`** | 切割工段 | CUT-09# ~ CUT-12# | 10,000 ~ 15,000 | 99.80% ~ 99.98% |
| **`pfa`** | 偏贴车间 | PFA-03# ~ PFA-11# | 6,000 ~ 7,000 | 98.50% ~ 99.00% |
| **`bonding`** / **`bnd`** | 绑定工段 | BD-03# ~ BD-11# | 5,500 ~ 6,500 | 99.40% ~ 99.80% |
| **`assy`** / **`asy`** | 组装车间 | ASSY-01#, ASSY-02# | 6,000 ~ 7,000 | 97.00% ~ 99.00% |
| **`oba`** | 开箱稽核 | OBA-01# ~ OBA-03# | 4,500 ~ 6,000 | 99.60% ~ 99.95% |
| **`ort`** | 可靠性测试 | ORT-CHAMBER, ORT-DROP, ORT-VIB | 300 ~ 400 | 99.85% ~ 100.00% |
| **`shipping`** / **`shp`** | 出货车间 | DOCK-01 ~ DOCK-03 | 15,000 ~ 21,000 | 99.40% ~ 99.95% |
| **`rma`** | 售后返修 | RMA-LINE-01, RMA-LINE-02 | 80 ~ 120 | 98.20% ~ 99.40% |

---

## 📡 API 路由清单一览

- `GET /api/production-data?site=<site>&dates=<date1,date2>` : 历史良率与产出
- `GET /api/status-table?site=<site>&date=<date>` : 各工段产线实时工艺参数
- `GET /api/particle-size?date=<date>` : 超净室百级尘埃粒子大小分布
- `GET /api/bonding-coupling?date=<date>` : 绑定温度-压力多曲线耦合分析
- `GET /api/<workshop>/files` : 对应工段标准受控SOP文件列表
- `GET /api/<workshop>/files/download?name=<fileName>` : 对应工段受控文件下载
- `GET /api/sop/detail?doc_name=<docName>` : 获取高精度 SOP 结构化预览数据
- `GET /api/sop/download/<fileName>` : SOP 文件下载
- `GET /api/export-project` : 项目全量源码与配置打包 ZIP 下载
- `GET /appData.json` : 前端配置元数据
