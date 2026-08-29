# -*- coding: utf-8 -*-
"""
================================================================================
💡 智能工厂车间系统 - Django 路由映射配置文件 (urls.py)
================================================================================

本文件定义了前端 React 单页应用与 Django 后端业务接口的全部路由映射关系。
在将本系统部署至 Django 生产环境时，请遵循以下集成指南。

部署集成步骤：
--------------------------------------------------
1. 复制此文件：将本文件复制到您的 Django 主应用（App）目录下。
2. 关联主路由：在 Django 项目的根 `urls.py` 中，使用 `include` 将此路由导入。
   例如：
   ```python
   from django.contrib import admin
   from django.urls import path, include

   urlpatterns = [
       path('admin/', admin.site.urls),
       path('', include('your_app_name.urls')),  # 引入本应用路由
   ]
   ```
3. 静态与媒体文件支持：
   在开发阶段（`DEBUG = True`），需要在末尾追加静态资源与媒体文件的服务路由。
   在生产环境部署时，建议通过 Nginx 直接代理托管 `/static/` 与 `/media/` 目录，以获得极佳的 I/O 吞吐性能。
"""

from django.urls import path
from django.conf import settings
from . import views  # 导入同级 views.py

urlpatterns = [
    # ==========================================================================
    # 🖥️ 页面托管：渲染 React 构建后的单页应用主入口 (Index.html)
    # ==========================================================================
    path('', views.serve_frontend, name='home'),
    
    # ==========================================================================
    # ⚙️ 核心数据 API 接口 (与前端实时看板同频同步)
    # ==========================================================================
    # 1. 产线良率与总产量历史趋势 (用于渲染 ECharts 核心折线图)
    path('api/production-data', views.production_data_api, name='production_data'),
    path('api/production-data/', views.production_data_api, name='production_data_slash'),
    
    # 2. 核心工位工艺监控参数控制限表格 (如：主轴压力、锁付扭矩、热压温度等)
    path('api/status-table', views.status_table_api, name='status_table'),
    path('api/status-table/', views.status_table_api, name='status_table_slash'),
    
    # 3. 超净室百级/万级尘埃粒子大小与实时分布点云图
    path('api/particle-size', views.particle_size_api, name='particle_size'),
    path('api/particle-size/', views.particle_size_api, name='particle_size_slash'),
    
    # 4. 压合工序温度-压力双轴多曲线耦合关联分析图
    path('api/bonding-coupling', views.bonding_coupling_api, name='bonding_coupling'),
    path('api/bonding-coupling/', views.bonding_coupling_api, name='bonding_coupling_slash'),
    
    # 5. 前端静态配置元数据 JSON 网关 (如：看板标题、视觉配置等)
    path('appData.json', views.app_data_api, name='app_data'),
    path('api/appData.json', views.app_data_api, name='app_data_api_prefix'),
    
    # ==========================================================================
    # 📂 工艺标准作业规范 (SOP) 专用文件管理与高保真渲染接口
    # ==========================================================================
    # 6. 显式工段路由：CUT 工段受控文件列表与下载
    path('api/cut/files', views.cut_files_api, name='cut_files'),
    path('api/cut/files/download', views.cut_files_download_api, name='cut_files_download'),
    path('api/cut/download', views.cut_files_download_api, name='cut_download_short'),
    
    # 7. 显式工段路由：IQC 工段受控文件列表与下载
    path('api/iqc/files', views.iqc_files_api, name='iqc_files'),
    path('api/iqc/files/download', views.iqc_files_download_api, name='iqc_files_download'),
    path('api/iqc/download', views.iqc_files_download_api, name='iqc_download_short'),

    # 8. 显式工段路由：PFA 工段受控文件列表与下载
    path('api/pfa/files', views.pfa_files_api, name='pfa_files'),
    path('api/pfa/files/download', views.pfa_files_download_api, name='pfa_files_download'),
    path('api/pfa/download', views.pfa_files_download_api, name='pfa_download_short'),
    
    # 9. 显式工段路由：BONDING / BND 工段受控文件列表与下载
    path('api/bonding/files', views.bonding_files_api, name='bonding_files'),
    path('api/bonding/files/download', views.bonding_files_download_api, name='bonding_files_download'),
    path('api/bonding/download', views.bonding_files_download_api, name='bonding_download_short'),
    path('api/BND/files', views.bonding_files_api, name='bnd_files_upper'),
    path('api/BND/download', views.bonding_files_download_api, name='bnd_download_upper'),
    
    # 10. 显式工段路由：ASSY / ASY 工段受控文件列表与下载
    path('api/assy/files', views.assy_files_api, name='assy_files'),
    path('api/assy/files/download', views.assy_files_download_api, name='assy_files_download'),
    path('api/assy/download', views.assy_files_download_api, name='assy_download_short'),
    path('api/ASY/files', views.assy_files_api, name='asy_files_upper'),
    path('api/ASY/download', views.assy_files_download_api, name='asy_download_upper'),

    # 11. 显式工段路由：OBA 工段受控文件列表与下载
    path('api/oba/files', views.oba_files_api, name='oba_files'),
    path('api/oba/files/download', views.oba_files_download_api, name='oba_files_download'),
    path('api/oba/download', views.oba_files_download_api, name='oba_download_short'),
    path('api/OBA/files', views.oba_files_api, name='oba_files_upper'),
    path('api/OBA/download', views.oba_files_download_api, name='oba_download_upper'),

    # 12. 显式工段路由：ORT 工段受控文件列表与下载
    path('api/ort/files', views.ort_files_api, name='ort_files'),
    path('api/ort/files/download', views.ort_files_download_api, name='ort_files_download'),
    path('api/ort/download', views.ort_files_download_api, name='ort_download_short'),
    path('api/ORT/files', views.ort_files_api, name='ort_files_upper'),
    path('api/ORT/download', views.ort_files_download_api, name='ort_download_upper'),

    # 13. 显式工段路由：SHIPPING 出货看板受控文件列表与下载
    path('api/shipping/files', views.shipping_files_api, name='shipping_files'),
    path('api/shipping/files/download', views.shipping_files_download_api, name='shipping_files_download'),
    path('api/shipping/download', views.shipping_files_download_api, name='shipping_download_short'),
    path('api/SHIPPING/files', views.shipping_files_api, name='shipping_files_upper'),
    path('api/SHIPPING/download', views.shipping_files_download_api, name='shipping_download_upper'),
    
    # 14. 显式工段路由：RMA 售后返修受控文件列表与下载
    path('api/rma/files', views.rma_files_api, name='rma_files'),
    path('api/rma/files/download', views.rma_files_download_api, name='rma_files_download'),
    path('api/rma/download', views.rma_files_download_api, name='rma_download_short'),
    path('api/RMA/files', views.rma_files_api, name='rma_files_upper'),
    path('api/RMA/download', views.rma_files_download_api, name='rma_download_upper'),

    # 15. 🌟 核心参数化通用路由 (保障任意大小写及扩展工段路由一致性，如 /api/IQC/files)
    path('api/<str:workshop_name>/files', views.workshop_files_api, name='workshop_files'),
    path('api/<str:workshop_name>/files/', views.workshop_files_api, name='workshop_files_slash'),
    path('api/<str:workshop_name>/download', views.workshop_files_download_api, name='workshop_files_download'),
    path('api/<str:workshop_name>/files/download', views.workshop_files_download_api, name='workshop_files_download_alt'),
    
    # 16. 🌟 核心：获取指定 SOP 文档的高精度 JSON 结构数据 (对接 React DocModal)
    # 示例: /api/sop/detail/?doc_name=切割规范.docx 或 /api/sop/detail?doc_name=xxx
    path('api/sop/detail', views.get_sop_detail, name='get_sop_detail_no_slash'),
    path('api/sop/detail/', views.get_sop_detail, name='get_sop_detail'),
    
    # 17. 🌟 核心：下载或在线加载真实的 Word (.docx) 或 PDF 物理文件资源
    # 支持 /api/sop/download/xxx.docx/、/api/sop/download/xxx.docx 及 /api/sop/download?name=xxx
    path('api/sop/download', views.download_sop_file, name='download_sop_file_query'),
    path('api/sop/download/', views.download_sop_file, name='download_sop_file_query_slash'),
    path('api/sop/download/<str:file_name>', views.download_sop_file, name='download_sop_file_no_slash'),
    path('api/sop/download/<str:file_name>/', views.download_sop_file, name='download_sop_file'),

    # 18. 项目全量源码打包导出 API
    path('api/export-project', views.export_project_api, name='export_project'),
    path('api/export-project/', views.export_project_api, name='export_project_slash'),
]

# ==========================================================================
# 🛠️ 静态与媒体资源开发调试路由配置 (仅在 DEBUG 开发阶段生效)
# ==========================================================================
# 生产环境建议通过 Nginx 进行如下静态资源的反向代理：
# location /static/ { alias /your_project_path/static/; }
# location /media/ { alias /your_project_path/media/; }
if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

