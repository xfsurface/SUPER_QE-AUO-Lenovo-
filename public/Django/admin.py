# -*- coding: utf-8 -*-
"""
================================================================================
💡 智能工厂车间系统 - Django Admin 后台管理注册 (admin.py)
================================================================================
"""

from django.contrib import admin
from .models import WorkshopSite, ProductionTrend, EquipmentStatusParam, SopDocument


@admin.register(WorkshopSite)
class WorkshopSiteAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "dept_name", "is_active", "created_at")
    search_fields = ("code", "name", "dept_name")
    list_filter = ("is_active",)


@admin.register(ProductionTrend)
class ProductionTrendAdmin(admin.ModelAdmin):
    list_display = ("site", "record_date", "yield_rate", "productivity", "updated_at")
    list_filter = ("site", "record_date")
    search_fields = ("site__name", "site__code")
    date_hierarchy = "record_date"


@admin.register(EquipmentStatusParam)
class EquipmentStatusParamAdmin(admin.ModelAdmin):
    list_display = ("site", "line_name", "param_name", "val", "lower_limit", "upper_limit", "status", "record_date")
    list_filter = ("site", "status", "record_date")
    search_fields = ("line_name", "param_name", "site__name")


@admin.register(SopDocument)
class SopDocumentAdmin(admin.ModelAdmin):
    list_display = ("site", "file_name", "doc_code", "version", "is_controlled", "created_at")
    list_filter = ("site", "is_controlled", "version")
    search_fields = ("file_name", "doc_code", "site__name")
