# -*- coding: utf-8 -*-
"""
================================================================================
💡 智能工厂车间系统 - Django 核心配置参考示例 (settings_sample.py)
================================================================================

在将前端 React 生产构建包与 Django 后端结合时，请将以下关键配置合并至您的 settings.py。
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# 1. 密钥与调试模式
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-industrial-smart-platform-key')
DEBUG = True
ALLOWED_HOSTS = ['*']

# 2. 已安装应用
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # 您的工业看板应用名称
    'factory_dashboard',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'factory_project.urls'

# 3. 模板引擎配置 (指向包含前端 index.html 的目录)
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates'),
            os.path.join(BASE_DIR, 'static'),
            os.path.join(BASE_DIR, 'static', 'Django'),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'factory_project.wsgi.application'

# 4. 数据库配置
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# 5. 国际化与时区
LANGUAGE_CODE = 'zh-hans'
TIME_ZONE = 'Asia/Shanghai'
USE_I18N = True
USE_TZ = True

# 6. 静态资源与媒体附件配置 (关键)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
