# -*- coding: utf-8 -*-
"""
================================================================================
💡 智能工厂车间系统 - Django ORM 数据库模型定义 (models.py)
================================================================================

本文件定义了系统在向持久化关系型数据库（如 PostgreSQL / MySQL / SQLite）迁移时的
数据模型体系。支持各车间站点（CUT, IQC, PFA, BONDING, ASSY, SHIPPING）的严格数据隔离。
"""

from django.db import models
from django.utils import timezone


class WorkshopSite(models.Model):
    """
    车间工段站点模型 (数据隔离维度)
    """
    code = models.CharField(max_length=32, unique=True, verbose_name="工段代码 (如 cut, iqc, pfa, bonding, assy, shipping)")
    name = models.CharField(max_length=64, verbose_name="工段中文名称")
    dept_name = models.CharField(max_length=128, verbose_name="受控归属部门")
    description = models.TextField(blank=True, default="", verbose_name="工段职能描述")
    is_active = models.BooleanField(default=True, verbose_name="是否启用")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")

    class Meta:
        verbose_name = "工段站点"
        verbose_name_plural = "工段站点列表"
        ordering = ["code"]

    def __str__(self):
        return f"{self.name} ({self.code.upper()})"


class ProductionTrend(models.Model):
    """
    车间每日良率与产出记录模型
    """
    site = models.ForeignKey(WorkshopSite, on_delete=models.CASCADE, related_name="trends", verbose_name="所属工段")
    record_date = models.DateField(verbose_name="生产日期")
    yield_rate = models.FloatField(verbose_name="综合良率 (%)")
    productivity = models.IntegerField(verbose_name="当日产出量 (pcs)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")

    class Meta:
        verbose_name = "生产趋势记录"
        verbose_name_plural = "生产趋势记录列表"
        unique_together = ("site", "record_date")
        ordering = ["-record_date"]

    def __str__(self):
        return f"{self.site.name} - {self.record_date}: 良率 {self.yield_rate}%, 产量 {self.productivity}"


class EquipmentStatusParam(models.Model):
    """
    工段产线设备实时工艺参数控制限模型
    """
    STATUS_CHOICES = (
        ("OK", "正常 (OK)"),
        ("WARN", "预警 (WARN)"),
        ("ALARM", "报警 (ALARM)"),
    )

    site = models.ForeignKey(WorkshopSite, on_delete=models.CASCADE, related_name="status_params", verbose_name="所属工段")
    line_name = models.CharField(max_length=64, verbose_name="产线/工位编号 (如 CUT-10#, BD-03#, DOCK-01)")
    param_name = models.CharField(max_length=64, verbose_name="关键工艺参数名称 (如 切割压力, 本压温度)")
    val = models.CharField(max_length=32, verbose_name="实测值")
    upper_limit = models.CharField(max_length=32, verbose_name="工艺上限 (USL)")
    lower_limit = models.CharField(max_length=32, verbose_name="工艺下限 (LSL)")
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="OK", verbose_name="运行状态")
    record_date = models.DateField(default=timezone.now, verbose_name="点检记录日期")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")

    class Meta:
        verbose_name = "产线工艺参数"
        verbose_name_plural = "产线工艺参数记录"
        ordering = ["site", "line_name", "param_name"]

    def __str__(self):
        return f"[{self.site.code.upper()}] {self.line_name} - {self.param_name}: {self.val} ({self.status})"


class SopDocument(models.Model):
    """
    标准作业指导书 (SOP) 受控文档模型
    """
    site = models.ForeignKey(WorkshopSite, on_delete=models.CASCADE, related_name="sop_docs", verbose_name="所属工段")
    file_name = models.CharField(max_length=255, verbose_name="受控文件名 (含扩展名)")
    doc_code = models.CharField(max_length=64, blank=True, default="", verbose_name="受控SOP编号")
    version = models.CharField(max_length=32, default="Rev A/1", verbose_name="版本号")
    file_path = models.FileField(upload_to="docs/", blank=True, null=True, verbose_name="物理文件附件")
    is_controlled = models.BooleanField(default=True, verbose_name="是否核心受控")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="发布时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="修订时间")

    class Meta:
        verbose_name = "SOP标准文档"
        verbose_name_plural = "SOP标准文档列表"
        ordering = ["site", "file_name"]

    def __str__(self):
        return f"[{self.site.code.upper()}] {self.file_name} ({self.version})"
