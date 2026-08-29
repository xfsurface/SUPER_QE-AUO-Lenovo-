# -*- coding: utf-8 -*-
import json
import math
import os
import urllib.parse
import zipfile
import io
from datetime import datetime
from django.conf import settings
from django.http import JsonResponse, HttpResponse, FileResponse, Http404
from django.shortcuts import render

# ================================================================================
# 💡 智能工厂车间系统 - Django 后端业务集成与部署指南
# ================================================================================
"""
本模块不仅作为 Django 后端的 API 路由处理器，还是整个系统在向 Django 迁移部署时的
核心参考。以下是文件放置、配置与代码集成的保姆级说明：

1. 📂 SOP 物理文档文件（.docx/.pdf）如何放置？
--------------------------------------------------
- 方案 A (静态只读模式)：
  将您的真实 SOP Word (.docx) 或 PDF (.pdf) 文件放置在 Django 项目根目录下的静态资源目录中：
  `[Django项目根目录]/static/docs/`（如：/static/docs/1_切割规范基本操作规程.docx）

- 方案 B (媒体动态托管模式 - 推荐)：
  在实际生产环境中，SOP 经常需要动态上传或审批流更新，建议将其作为“媒体文件”托管。
  将真实文件放置在：`[Django项目根目录]/media/docs/`（如：/media/docs/1_IQC来料物理尺寸检验规程.docx）

2. ⚙️ Django Settings.py 对应配置
--------------------------------------------------
请确保在您的 `settings.py` 中配置了静态和媒体目录：

# 静态文件路径
STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]

# 媒体文件路径
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

3. 🔀 Django Urls.py 对应路由配置
--------------------------------------------------
请在您项目的 `urls.py` 中注册如下路由：

from django.urls import path
from . import views

urlpatterns = [
    # 前端静态单页与核心数据 API
    path('', views.serve_frontend, name='home'),
    path('api/production-data', views.production_data_api, name='production_data'),
    path('api/status-table', views.status_table_api, name='status_table'),
    path('api/particle-size', views.particle_size_api, name='particle_size'),
    path('api/bonding-coupling', views.bonding_coupling_api, name='bonding_coupling'),
    path('appData.json', views.app_data_api, name='app_data'),
    
    # 全工段文件列表与受控下载路由
    path('api/<str:workshop_name>/files', views.workshop_files_api, name='workshop_files'),
    path('api/<str:workshop_name>/files/download', views.workshop_files_download_api, name='workshop_files_download'),
    path('api/<str:workshop_name>/download', views.workshop_files_download_api, name='workshop_download'),
    
    # SOP 结构化预览与下载
    path('api/sop/detail', views.get_sop_detail, name='get_sop_detail'),
    path('api/sop/download', views.download_sop_file, name='download_sop_file'),
    path('api/sop/download/<str:file_name>', views.download_sop_file, name='download_sop_file_name'),
    
    # 项目全量源码打包导出 API
    path('api/export-project', views.export_project_api, name='export_project'),
]

if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
"""

# ================================================================================
# 🛠️ 辅助加密/种子随机算法工具 (Mirroring Frontend Logic)
# ================================================================================
def get_seeded_random(date_str, seed_offset):
    # Python 模拟前端种子随机数逻辑，确保前后端计算出的一致性
    combined_str = f"{date_str}_{seed_offset}"
    hash_val = 0
    for char in combined_str:
        hash_val = ord(char) + ((hash_val << 5) - hash_val)
        hash_val = hash_val & 0xFFFFFFFF  # 仿真 32 位整型溢出
    x = math.sin(hash_val) * 10000
    return x - math.floor(x)


# ================================================================================
# 🌐 视图层 1：React 前端页面与常规车间生产看板 API
# ================================================================================
def serve_frontend(request):
    """
    渲染 React 构建后的前端 index.html 页面。
    部署时请确保将 React 的 dist 目录复制到 Django 静态模板目录。
    """
    return render(request, "index.html")


def production_data_api(request):
    """
    接口：/api/production-data
    获取各工序的历史良率与产出数据 (支持 IQC, CUT, PFA, BONDING, ASSY, OBA, ORT, SHIPPING, RMA 及自定义扩展工段)
    """
    site = (request.GET.get('site') or 'cut').lower()
    dates_str = request.GET.get('dates') or datetime.now().strftime('%Y-%m-%d')
        
    dates = dates_str.split(",")
    result = []
    
    for date in dates:
        yield_val = 0
        prod_val = 0
        
        if site == "iqc":
            yield_val = round(98.9 + get_seeded_random(date, "iqc_yield") * 0.9, 2)
            prod_val = int(180 + get_seeded_random(date, "iqc_prod") * 70)
        elif site == "cut":
            yield_val = round(99.8 + get_seeded_random(date, "cut_yield") * 0.18, 2)
            prod_val = int(10000 + get_seeded_random(date, "cut_prod") * 5000)
        elif site == "pfa":
            yield_val = round(98.5 + get_seeded_random(date, "pfa_yield") * 0.5, 2)
            prod_val = int(6000 + get_seeded_random(date, "pfa_prod") * 1000)
        elif site in ["bonding", "bnd"]:
            yield_val = round(99.40 + get_seeded_random(date, "bonding_yield") * 0.40, 2)
            prod_val = int(5500 + get_seeded_random(date, "bonding_prod") * 1000)
        elif site in ["assy", "asy"]:
            yield_val = round(97.00 + get_seeded_random(date, "assy_yield") * 2.00, 2)
            prod_val = int(6000 + get_seeded_random(date, "assy_prod") * 1000)
        elif site == "oba":
            yield_val = round(99.60 + get_seeded_random(date, "oba_yield") * 0.35, 2)
            prod_val = int(4500 + get_seeded_random(date, "oba_prod") * 1500)
        elif site == "ort":
            yield_val = round(99.85 + get_seeded_random(date, "ort_yield") * 0.15, 2)
            prod_val = int(300 + get_seeded_random(date, "ort_prod") * 100)
        elif site in ["shipping", "shp"]:
            yield_val = round(99.4 + get_seeded_random(date, "shipping_yield") * 0.55, 2)
            prod_val = int(15000 + get_seeded_random(date, "shipping_prod") * 6000)
        elif site == "rma":
            yield_val = round(98.20 + get_seeded_random(date, "rma_yield") * 1.20, 2)
            prod_val = int(80 + get_seeded_random(date, "rma_prod") * 40)
        else:
            yield_val = round(99.0 + get_seeded_random(date, f"{site}_yield") * 0.8, 2)
            prod_val = int(5000 + get_seeded_random(date, f"{site}_prod") * 2000)
            
        result.append({
            "date": date,
            "yield": yield_val,
            "productivity": prod_val
        })
        
    return JsonResponse(result, safe=False)


def status_table_api(request):
    """
    接口：/api/status-table
    获取工段设备的当前工艺控制参数值 (支持 IQC, CUT, PFA, BONDING, ASSY, OBA, ORT, SHIPPING, RMA 及自定义扩展工段)
    """
    site = (request.GET.get('site') or 'cut').lower()
    date = request.GET.get('date') or datetime.now().strftime('%Y-%m-%d')
        
    results = []
    if site == "iqc":
        lines = ["L01", "L02", "L03", "L04", "L05"]
        for l in lines:
            results.append({ "line": f"{l}-IQC", "param": "投影偏差", "val": f"{(0.02 + get_seeded_random(date, f'{l}_dev') * 0.02):.2f} μm", "up": "0.05", "low": "0.00", "status": "OK" })
            results.append({ "line": f"{l}-IQC", "param": "光源照度", "val": f"{(1250 + get_seeded_random(date, f'{l}_lux') * 100):.0f} Lux", "up": "1400", "low": "1100", "status": "OK" })
            results.append({ "line": f"{l}-IQC", "param": "检测速度", "val": f"{(45.0 + get_seeded_random(date, f'{l}_spd') * 5.0):.1f} s/pcs", "up": "55.0", "low": "35.0", "status": "OK" })
    elif site == "cut":
        lines = ["CUT-09#", "CUT-10#", "CUT-11#", "CUT-12#"]
        for l in lines:
            if l == "CUT-10#":
                results.append({ "line": l, "param": "切割压力", "val": "5.0", "up": "7", "low": "3", "status": "OK" })
                results.append({ "line": l, "param": "切割速度", "val": str(int(round(150 + get_seeded_random(date, f"{l}_speed") * 110))), "up": "300", "low": "100", "status": "OK" })
                results.append({ "line": l, "param": "下刀量", "val": "0.3", "up": "0.4", "low": "0.2", "status": "OK" })
            else:
                results.append({ "line": l, "param": "切割压力", "val": f"{(7.0 + get_seeded_random(date, f'{l}_press') * 1.5):.1f}", "up": "10", "low": "4", "status": "OK" })
                results.append({ "line": l, "param": "切割速度", "val": str(int(round(150 + get_seeded_random(date, f"{l}_speed") * 110))), "up": "300", "low": "100", "status": "OK" })
                results.append({ "line": l, "param": "下刀量", "val": "0.3", "up": "0.7", "low": "0.3", "status": "OK" })
    elif site == "pfa":
        lines = ["03", "05", "06", "09", "10", "11"]
        for l in lines:
            line_name = f"PFA-{l}#"
            gt_val = "4.8" if l == "03" else ("5.0" if l == "11" else "5.4")
            gs_val = "120" if l == "09" else ("130" if l == "10" else "150")
            gp_val = "25" if l in ["10", "11"] else "30"
            ap_val = "0.35" if l == "03" else "0.30"
            as_val = "400" if l in ["03", "10"] else ("600" if l == "11" else "300")

            results.append({ "line": line_name, "param": "研磨时间", "val": gt_val, "up": "6.5", "low": "2.4", "status": "OK" })
            results.append({ "line": line_name, "param": "研磨速度", "val": gs_val, "up": "288", "low": "100", "status": "OK" })
            results.append({ "line": line_name, "param": "研磨压力", "val": gp_val, "up": "30", "low": "1", "status": "OK" })
            results.append({ "line": line_name, "param": "贴附压力", "val": ap_val, "up": "0.4", "low": "0.2", "status": "OK" })
            results.append({ "line": line_name, "param": "贴附速度", "val": as_val, "up": "800", "low": "100", "status": "OK" })
    elif site in ["bonding", "bnd"]:
        lines = ["03", "05", "06", "09", "10", "11"]
        for l in lines:
            line_name = f"BD-{l}#"
            t_val = "5"
            temp_val = str(int(round(180 + (get_seeded_random(date, f"{l}_bnd_temp") - 0.5) * 10)))
            p_val = f"{(0.50 + (get_seeded_random(date, f'{l}_bnd_press') - 0.5) * 0.04):.2f}"
            results.append({ "line": line_name, "param": "本压时间", "val": t_val, "up": "6", "low": "4", "status": "OK" })
            results.append({ "line": line_name, "param": "本压温度", "val": temp_val, "up": "200", "low": "160", "status": "OK" })
            results.append({ "line": line_name, "param": "本压压力", "val": p_val, "up": "0.55", "low": "0.45", "status": "OK" })
    elif site in ["assy", "asy"]:
        lines = ["01", "02"]
        for l in lines:
            line_name = f"ASSY-{l}#"
            speed_val = "20" if l == "01" else "40"
            results.append({ "line": line_name, "param": "组装速度", "val": speed_val, "up": "45", "low": "15", "status": "OK" })
            results.append({ "line": line_name, "param": "保压时间", "val": "0.5s", "up": "0.7", "low": "0.3", "status": "OK" })
    elif site == "oba":
        lines = ["OBA-01#", "OBA-02#", "OBA-03#"]
        for l in lines:
            results.append({ "line": l, "param": "开箱合格率", "val": f"{(99.7 + get_seeded_random(date, f'{l}_oba_rate') * 0.28):.2f} %", "up": "100.00", "low": "99.50", "status": "OK" })
            results.append({ "line": l, "param": "条码复核率", "val": "100.00 %", "up": "100.00", "low": "99.90", "status": "OK" })
            results.append({ "line": l, "param": "封箱平整度", "val": f"{(0.22 + get_seeded_random(date, f'{l}_gap') * 0.12):.2f} mm", "up": "0.50", "low": "0.00", "status": "OK" })
    elif site == "ort":
        lines = ["ORT-CHAMBER-01", "ORT-DROP-02", "ORT-VIB-03"]
        for l in lines:
            results.append({ "line": l, "param": "温箱恒温精度", "val": f"{(25.0 + (get_seeded_random(date, f'{l}_temp') - 0.5) * 0.6):.1f} ℃", "up": "25.5", "low": "24.5", "status": "OK" })
            results.append({ "line": l, "param": "振动加速度", "val": f"{(1.50 + (get_seeded_random(date, f'{l}_acc') - 0.5) * 0.10):.2f} G", "up": "1.60", "low": "1.40", "status": "OK" })
            results.append({ "line": l, "param": "循环完成率", "val": "100.00 %", "up": "100.00", "low": "99.90", "status": "OK" })
    elif site in ["shipping", "shp"]:
        docks = ["DOCK-01", "DOCK-02", "DOCK-03"]
        for d in docks:
            results.append({ "line": d, "param": "装运称重校准", "val": f"{(99.8 + get_seeded_random(date, f'{d}_cal') * 0.18):.2f} %", "up": "100.00", "low": "99.00", "status": "OK" })
            results.append({ "line": d, "param": "扫码识别率", "val": f"{(99.9 + get_seeded_random(date, f'{d}_scan') * 0.09):.2f} %", "up": "100.00", "low": "99.50", "status": "OK" })
            results.append({ "line": d, "param": "集装箱温控", "val": f"{(22.5 + get_seeded_random(date, f'{d}_temp') * 2.0):.1f} ℃", "up": "28.0", "low": "18.0", "status": "OK" })
    elif site == "rma":
        lines = ["RMA-LINE-01", "RMA-LINE-02"]
        for l in lines:
            results.append({ "line": l, "param": "初判准确率", "val": f"{(98.8 + get_seeded_random(date, f'{l}_acc') * 0.9):.2f} %", "up": "100.00", "low": "98.00", "status": "OK" })
            results.append({ "line": l, "param": "返工焊接温控", "val": f"{(350 + (get_seeded_random(date, f'{l}_temp') - 0.5) * 8):.0f} ℃", "up": "360", "low": "340", "status": "OK" })
            results.append({ "line": l, "param": "再测试良品率", "val": f"{(99.2 + get_seeded_random(date, f'{l}_retest') * 0.6):.2f} %", "up": "100.00", "low": "99.00", "status": "OK" })
    else:
        lines = ["L01", "L02", "L03"]
        for l in lines:
            results.append({ "line": f"{l}-{site.upper()}", "param": "运行主轴速度", "val": f"{(100 + get_seeded_random(date, f'{l}_spd') * 10):.1f}", "up": "120", "low": "80", "status": "OK" })
            results.append({ "line": f"{l}-{site.upper()}", "param": "系统工作压力", "val": f"{(4.0 + get_seeded_random(date, f'{l}_p') * 0.5):.1f}", "up": "5.0", "low": "3.0", "status": "OK" })

    return JsonResponse(results, safe=False)


def particle_size_api(request):
    """
    接口：/api/particle-size
    获取车间尘埃粒子大小分布
    """
    date = request.GET.get('date') or datetime.now().strftime('%Y-%m-%d')
        
    data = []
    for i in range(18):
        data.append([
            700 + get_seeded_random(date, f"part_x_{i}") * 200,
            700 + get_seeded_random(date, f"part_y_{i}") * 200
        ])
        
    return JsonResponse(data, safe=False)


def bonding_coupling_api(request):
    """
    接口：/api/bonding-coupling
    获取热压贴合温度与压力的多曲线关联点
    """
    date = request.GET.get('date') or datetime.now().strftime('%Y-%m-%d')
        
    points = 12
    times = []
    temps = []
    pressures = []
    
    for i in range(points):
        times.append(f"T-{(points - 1 - i) * 10}s")
        temps.append(round(183.5 + get_seeded_random(date, f"bnd_t_{i}") * 3.5, 1))
        pressures.append(round(2.05 + get_seeded_random(date, f"bnd_p_{i}") * 0.25, 2))
        
    return JsonResponse({
        "times": times,
        "temps": temps,
        "pressures": pressures
    })


def app_data_api(request):
    """
    接口：/appData.json
    用于加载静态车间配置元数据
    """
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        candidate_paths = [
            os.path.join(base_dir, 'appData.json'),
            os.path.join(settings.BASE_DIR, 'appData.json'),
            os.path.join(settings.BASE_DIR, 'static', 'appData.json'),
            os.path.join(settings.BASE_DIR, 'static', 'Django', 'appData.json')
        ]
        for file_path in candidate_paths:
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                return JsonResponse(data)
        # 若物理文件不在磁盘中，提供内置的高保真默认车间配置元数据
        default_data = {
            "projectInfo": {
                "title": "AUO & Lenovo 云端智能管理平台",
                "subtitle": "INTELLIGENT MANUFACTURING ECOSYSTEM",
                "version": "2.1.0"
            },
            "status": "online"
        }
        return JsonResponse(default_data)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ================================================================================
# 📂 视图层 2：SOP 标准作业文件与富媒体结构化数据 API (覆盖所有 9 大工段)
# ================================================================================

DJANGO_IQC_FILES = [
    { "name": "1_IQC来料物理尺寸检验规程.docx" },
    { "name": "2_AQL计数抽样程序与抽样方案.pdf" },
    { "name": "3_背光偏光片外观缺陷限度标准.xlsx" }
]

DJANGO_CUT_FILES = [
    { "name": "1_切割规范基本操作规程.docx" },
    { "name": "2_设备安全操作手册.doc" },
    { "name": "3_核心备件保养巡检标准.xlsx" },
    { "name": "4_生产流程与控制节点图.pdf" },
    { "name": "5_切割崩边缺陷判定与限度标准.doc" },
    { "name": "6_切割工段5S现场定置整顿准则.docx" }
]

DJANGO_PFA_FILES = [
    { "name": "1_PFA偏光片贴合首件点检规程.docx" },
    { "name": "2_偏贴偏光片静电控制管理细则.pdf" },
    { "name": "3_脱泡机高压容器安全运行条例.docx" }
]

DJANGO_BONDING_FILES = [
    { "name": "1_ACF贴附与预压合工艺指导书.docx" },
    { "name": "2_FPC主绑定热压温度与压力标准.pdf" },
    { "name": "3_本绑定偏差补正与防呆操作细则.pdf" },
    { "name": "4_COG本压温度巡检与防呆作业指导.pdf" },
    { "name": "5_FOG热压刀平整度点检规范.docx" },
    { "name": "6_导电粒子破损率判定标准.xlsx" }
]

DJANGO_ASSY_FILES = [
    { "name": "1_组装外壳紧固件锁付工艺规范.docx" },
    { "name": "2_成品气密性自动测试操作规程.pdf" },
    { "name": "3_组装防静电及尘埃粒子管控办法.docx" },
    { "name": "4_点胶固化时间与紫外强度标准.pdf" },
    { "name": "5_整机外观卡扣缝隙公差判定限度.xlsx" },
    { "name": "6_组装工段5S定置与超净作业准则.docx" }
]

DJANGO_OBA_FILES = [
    { "name": "1_OBA开箱检验抽样规程与AQL标准.docx" },
    { "name": "2_整机外观缺陷限度判定样册.pdf" },
    { "name": "3_包装封签与防拆标签检验规范.xlsx" }
]

DJANGO_ORT_FILES = [
    { "name": "1_高低温循环老化测试操作指引.docx" },
    { "name": "2_跌落与振动可靠性试验标准.pdf" },
    { "name": "3_ESD静电耐受度实验规范.xlsx" }
]

DJANGO_SHIPPING_FILES = [
    { "name": "1_SHIPPING成品出货检核与装车作业指导书.docx" },
    { "name": "2_客户料号与P/N防呆扫码作业标准.pdf" },
    { "name": "3_集装箱温湿度及防震动监控规范.docx" },
    { "name": "4_发货单据与出口报关文件管理守则.pdf" }
]

DJANGO_RMA_FILES = [
    { "name": "1_客退品不良现象快速分选作业流程.docx" },
    { "name": "2_8D根因分析报告标准模板.docx" },
    { "name": "3_不良元器件返修与再检验标准.pdf" }
]


def iqc_files_api(request):
    return JsonResponse(DJANGO_IQC_FILES, safe=False)

def iqc_files_download_api(request):
    return workshop_files_download_api(request, "iqc")

def cut_files_api(request):
    return JsonResponse(DJANGO_CUT_FILES, safe=False)

def cut_files_download_api(request):
    return workshop_files_download_api(request, "cut")

def pfa_files_api(request):
    return JsonResponse(DJANGO_PFA_FILES, safe=False)

def pfa_files_download_api(request):
    return workshop_files_download_api(request, "pfa")

def bonding_files_api(request):
    return JsonResponse(DJANGO_BONDING_FILES, safe=False)

def bonding_files_download_api(request):
    return workshop_files_download_api(request, "bonding")

def assy_files_api(request):
    return JsonResponse(DJANGO_ASSY_FILES, safe=False)

def assy_files_download_api(request):
    return workshop_files_download_api(request, "assy")

def oba_files_api(request):
    return JsonResponse(DJANGO_OBA_FILES, safe=False)

def oba_files_download_api(request):
    return workshop_files_download_api(request, "oba")

def ort_files_api(request):
    return JsonResponse(DJANGO_ORT_FILES, safe=False)

def ort_files_download_api(request):
    return workshop_files_download_api(request, "ort")

def shipping_files_api(request):
    return JsonResponse(DJANGO_SHIPPING_FILES, safe=False)

def shipping_files_download_api(request):
    return workshop_files_download_api(request, "shipping")

def rma_files_api(request):
    return JsonResponse(DJANGO_RMA_FILES, safe=False)

def rma_files_download_api(request):
    return workshop_files_download_api(request, "rma")


def workshop_files_api(request, workshop_name):
    """
    接口：/api/<workshop>/files
    获取各工段的受控标准文件元数据列表
    """
    ws = workshop_name.lower()
    if ws == "iqc":
        return JsonResponse(DJANGO_IQC_FILES, safe=False)
    elif ws == "cut":
        return JsonResponse(DJANGO_CUT_FILES, safe=False)
    elif ws == "pfa":
        return JsonResponse(DJANGO_PFA_FILES, safe=False)
    elif ws in ["bonding", "bnd"]:
        return JsonResponse(DJANGO_BONDING_FILES, safe=False)
    elif ws in ["assy", "asy"]:
        return JsonResponse(DJANGO_ASSY_FILES, safe=False)
    elif ws == "oba":
        return JsonResponse(DJANGO_OBA_FILES, safe=False)
    elif ws == "ort":
        return JsonResponse(DJANGO_ORT_FILES, safe=False)
    elif ws in ["shipping", "shp"]:
        return JsonResponse(DJANGO_SHIPPING_FILES, safe=False)
    elif ws == "rma":
        return JsonResponse(DJANGO_RMA_FILES, safe=False)
    else:
        return JsonResponse([
            { "name": f"1_{workshop_name.upper()}基本作业规程.docx" },
            { "name": f"2_{workshop_name.upper()}品质点检标准.pdf" }
        ], safe=False)


def workshop_files_download_api(request, workshop_name):
    """
    接口：/api/<workshop>/download?file=xxx 或 /api/<workshop>/files/download?name=xxx
    动态仿真生成带有各工段前缀的受控技术文件下载。
    """
    filename = request.GET.get('file') or request.GET.get('name')
    if not filename:
        return JsonResponse({"error": "Missing file name"}, status=400)

    ws = workshop_name.lower()
    dept_name = f"生产制造部({workshop_name.upper()})"

    if ws == "iqc":
        dept_name = "品质管理部进料检验组(IQC)"
    elif ws == "cut":
        dept_name = "生产制造部切割工段(CUT)"
    elif ws == "pfa":
        dept_name = "生产制造部偏贴车间(PFA)"
    elif ws in ["bonding", "bnd"]:
        dept_name = "生产制造部绑定车间(BONDING)"
    elif ws in ["assy", "asy"]:
        dept_name = "生产制造部组装车间(ASSY)"
    elif ws == "oba":
        dept_name = "品质管理部开箱稽核组(OBA)"
    elif ws == "ort":
        dept_name = "可靠性测试实验室(ORT)"
    elif ws in ["shipping", "shp"]:
        dept_name = "生产制造部出货物流车间(SHIPPING)"
    elif ws == "rma":
        dept_name = "客户服务与售后返修中心(RMA)"

    now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    virtual_content = f"""===========================================================
               【工业智能制程管理 SOP 技术规程 - Django】
===========================================================
受控部门: {dept_name}
受控文件名: {filename}
生成时间: {now_str} (本地系统时间)
安全等级: 核心受控 (Confidential - Controlled SOP Document)

[SOP-{ws.upper()}-DJANGO-VIRTUAL-PREVIEW]
本文件为 Django 后台服务器动态生成的虚拟受控标准技术规程，支持完整业务测试。
生产系统可在后续部署中直接替换为实际物理文档。

【工艺纪律核心红线】
1. 操作人员上岗必须持有该制程岗位的有效认证资质。
2. 严禁私自绕过或关闭设备上的防呆连锁机构及警报系统。
3. 温湿度及粒子洁净指标未达标前严禁开机。

------------------ [受控文本结束 - Django] ------------------
"""

    response = HttpResponse(virtual_content, content_type='text/plain; charset=utf-8')
    encoded_filename = urllib.parse.quote(filename)
    response['Content-Disposition'] = f"attachment; filename*=UTF-8''{encoded_filename}"
    return response


# ================================================================================
# 🌟 核心高精度内嵌 SOP 模板数据库
# ================================================================================
MOCK_SOP_DATABASE = {
    "1_切割规范基本操作规程.docx": {
        "title": "玻璃基板高精度冷切断基本作业指导书",
        "code": "SOP-CUT-001",
        "version": "Rev A/2",
        "dept": "工艺工程部 / 切割工段",
        "auditor": "张建国 (高级制程专家)",
        "pages": [
            [
                {"type": "p", "content": "1. 目的：规范操作规程，预防冷切割异常崩边和微裂纹。"},
                {"type": "h2", "content": "切割设备参数设定标准表"},
                {"type": "table"},
                {"type": "p", "content": "2. 首件检查要件：首件切割完毕后必须在20倍工具显微镜下进行侧边碎屑测量。"},
                {"type": "p", "content": "3. 5S安全规范：操作员作业时必须佩戴防切割钢丝手套、防护目镜。"}
            ]
        ],
        "table": {
            "headers": ["参数项", "额定标准值", "控制上限(UCL)", "控制下限(LCL)"],
            "rows": [
                ["金刚石刀轮压力", "0.15 MPa", "0.18 MPa", "0.12 MPa"],
                ["切割进给速度", "450 mm/s", "480 mm/s", "420 mm/s"],
                ["皮带真空负压", "-60 kPa", "-50 kPa", "-75 kPa"],
                ["刀轮转速速度", "12000 rpm", "12500 rpm", "11500 rpm"]
            ]
        }
    },
    "1_IQC来料物理尺寸检验规程.docx": {
        "title": "IQC 来料物理精密尺寸检验指导规范",
        "code": "SOP-IQC-001",
        "version": "Rev A/2",
        "dept": "品质管理部 / IQC组",
        "auditor": "吴秀荣 (资深品质主管)",
        "pages": [
            [
                {"type": "p", "content": "1. 目的：针对偏光片、导光板、背光模组等核心物料进行精密公差测量。"},
                {"type": "h2", "content": "物料核心抽样检测控制表"},
                {"type": "table"},
                {"type": "p", "content": "2. 抽样程序：遵循 AQL II 级正常检查抽样方案，出现一项致命缺陷(CR)即整批拒收。"},
                {"type": "p", "content": "3. 仪器校准：投影显微镜与二次元每天开机必须使用基准校准片归零校正。"}
            ]
        ],
        "table": {
            "headers": ["检测项目", "公差/控制标准", "测量仪器", "抽样标准"],
            "rows": [
                ["外形投影长宽", "标准尺寸 ± 0.05 mm", "精密二次元测量仪", "AQL 0.65"],
                ["基板厚度均一性", "偏差范围 ≤ 0.02 mm", "激光测厚仪", "每批次抽测30pcs"],
                ["背光面源照度", "照度 ≥ 1100 Lux 且均匀度 ≥ 88%", "标准光学积分球", "AQL 1.0"],
                ["偏光度与透射率", "偏光度 ≥ 99.98%", "偏振分光仪", "每批次抽测5pcs"]
            ]
        }
    },
    "1_SHIPPING成品出货检核与装车作业指导书.docx": {
        "title": "SHIPPING 成品出货检核与智能装车作业指导书",
        "code": "SOP-SHP-001",
        "version": "Rev A/1",
        "dept": "生产制造部 / 物流出货工段",
        "auditor": "陈建国 (出货中心主管)",
        "pages": [
            [
                {"type": "p", "content": "1. 目的：规范出货扫码校验流程，杜绝混料、错发，保障长途运输安全。"},
                {"type": "h2", "content": "智能装车与料号校检控制表"},
                {"type": "table"},
                {"type": "p", "content": "2. 防呆要求：出货栈板必须完成 RFID/条码防呆二次复核扫描，通过后方可装运。"},
                {"type": "p", "content": "3. 环境监控：长途海运/空运货柜需内置经校准的温湿度传感器记录仪。"}
            ]
        ],
        "table": {
            "headers": ["出货核查项", "作业要求/标准限值", "检验工具", "核查频次"],
            "rows": [
                ["栈板称重精度", "偏差控制在 ±0.05 kg 以内", "工业地磅系统", "100%全检"],
                ["料号防呆条码", "100% 符合发货工单 B/L 单号", "固定/手持扫描枪", "每件逐箱复扫"],
                ["货柜环境温控", "范围 18.0 °C ~ 26.0 °C", "温湿度数据记录仪", "每车配置定位"],
                ["防震缓压气袋", "货柜缝隙必须填满充气背袋", "目视检查", "封箱前确认"]
            ]
        }
    }
}


def get_sop_detail(request):
    """
    接口：/api/sop/detail/?doc_name=xxx.docx
    用途：获取指定 SOP 文档的高精度 JSON 结构。
    """
    doc_name = request.GET.get('doc_name') or request.GET.get('name', '')
    if not doc_name:
        return JsonResponse({"status": "error", "message": "参数 doc_name 缺失"}, status=400)
    
    clean_name = doc_name.replace(".pdf", "").replace(".xlsx", "").replace(".doc", "").replace(".docx", "") + ".docx"
    
    # 1. 精准匹配
    if clean_name in MOCK_SOP_DATABASE or doc_name in MOCK_SOP_DATABASE:
        data = MOCK_SOP_DATABASE.get(clean_name) or MOCK_SOP_DATABASE.get(doc_name)
        return JsonResponse({
            "status": "success",
            "data": data
        })
    
    # 2. 动态自适应生成算法
    base_name = doc_name.replace(".docx", "").replace(".pdf", "").replace(".xlsx", "").replace(".doc", "")
    code_hash = abs(hash(base_name)) % 10000
    fallback_data = {
        "title": f"关于【{base_name}】的标准作业规程指导书",
        "code": f"SOP-NODE-{code_hash:04d}",
        "version": "Rev A/1 (System Generated)",
        "dept": "工艺标准委员会 / 生产控制部",
        "auditor": "生产工段首席签发官",
        "pages": [
            [
                {"type": "p", "content": f"1. 目的与适用范围：本标准指导书针对“{base_name}”的现场作业而专门制定。适用于车间全体技术员、品管工程师。"},
                {"type": "h2", "content": "工业标准作业监控及复核项"},
                {"type": "table"},
                {"type": "p", "content": f"2. 操作规范红线：严禁不具备工艺授权认证资格的操作员单独点检或点动调试“{base_name}”相关工位设备。"},
                {"type": "p", "content": "3. 5S现场控制：每次换班交接时，必须保证工位、台面工具置于定位贴内，物料包装完好无损。"}
            ]
        ],
        "table": {
            "headers": ["控制维度", "控制指标/目标值", "执行频次", "记录表单"],
            "rows": [
                ["人员防护", "符合车间防静电与安全规范", "上线作业前", "工段出勤日志表"],
                ["物料质量", "表面无灰尘、伤痕及划伤", "每批次抽样点检", "品管来料巡检单"],
                ["关键参数", "严格按设备额定规格限值运行", "日常连续监测", "工艺控制卡(SPC)"],
                ["台面整理", "工作台及设备面无杂物积水", "每班交班前", "5S看板记录本"]
            ]
        }
    }
    
    return JsonResponse({
        "status": "success",
        "data": fallback_data
    })


def download_sop_file(request, file_name=None):
    """
    接口：/api/sop/download/<str:file_name>/  或者 /api/sop/download/?name=xxx 或 ?file=xxx
    用途：安全传送并触发浏览器物理 SOP 文件的下载；当物理文件未上传到本地目录时，自动仿真返回工业标准受控技术规程文件。
    """
    if not file_name:
        file_name = request.GET.get('name') or request.GET.get('file', '')
        
    if not file_name:
        return JsonResponse({"status": "error", "message": "未指定要下载的文件名"}, status=400)
        
    media_path = os.path.join(settings.MEDIA_ROOT, 'docs', file_name)
    static_path = os.path.join(settings.BASE_DIR, 'static', 'docs', file_name)
    
    target_path = None
    if os.path.exists(media_path):
        target_path = media_path
    elif os.path.exists(static_path):
        target_path = static_path
        
    if target_path and os.path.isfile(target_path):
        try:
            response = FileResponse(open(target_path, 'rb'))
            response['Content-Type'] = 'application/octet-stream'
            encoded_name = urllib.parse.quote(file_name)
            response['Content-Disposition'] = f"attachment; filename*=UTF-8''{encoded_name}"
            return response
        except Exception as e:
            return JsonResponse({"status": "error", "message": f"服务器读取物理文件失败: {str(e)}"}, status=500)
    else:
        now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        virtual_content = f"""===========================================================
               【工业智能制程管理 SOP 技术规程 - Django】
===========================================================
受控系统: Django 企业级工业云控制台
受控文件名: {file_name}
生成时间: {now_str} (本地系统时间)
安全等级: 核心机密 (Confidential - Controlled SOP Document)

[SOP-DJANGO-VIRTUAL-PREVIEW]
本文件为 Django 后台在未检测到本地物理文档时，为您自动创建的标准受控技术规程仿真文件。
如需下发真实 Word (.docx) 或 PDF 附件，请将正式文档放置于服务器目录：
1. /static/docs/{file_name}
2. /media/docs/{file_name}

【SOP 作业核心纪律条款】
1. 操作员上岗必须完成安全与静电防护装备点检，合格方可作业。
2. 任何核心工艺控制参数或程序更改须经过 ECN 流程审批签署。
3. 严格遵循 5S 现场定置与无尘室作业守则。

------------------ [受控技术文本结束 - Django] ------------------
"""
        response = HttpResponse(virtual_content, content_type='text/plain; charset=utf-8')
        encoded_name = urllib.parse.quote(file_name)
        response['Content-Disposition'] = f"attachment; filename*=UTF-8''{encoded_name}"
        return response


def export_project_api(request):
    """
    接口：/api/export-project
    动态打包项目代码为 ZIP 文件提供下载
    """
    try:
        buffer = io.BytesIO()
        base_dir = str(settings.BASE_DIR)
        
        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as z:
            for root, dirs, files in os.walk(base_dir):
                # 过滤掉不必要的缓存及构建输出
                dirs[:] = [d for d in dirs if d not in ['__pycache__', '.git', 'node_modules', '.venv', 'env']]
                for file in files:
                    if not file.endswith(('.pyc', '.pyo', '.sqlite3-journal')):
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, base_dir)
                        z.write(file_path, arcname)
                        
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename="django-project-export.zip"'
        return response
    except Exception as e:
        return JsonResponse({"error": f"Export failed: {str(e)}"}, status=500)
