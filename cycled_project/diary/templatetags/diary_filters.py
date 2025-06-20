from django import template
from django.utils import timezone
import jpholiday

register = template.Library()

@register.filter
def days_ago(value):
    if not value:
        return ''

    diff_in_time = timezone.now().date() - value
    diff_in_days = diff_in_time.days  # 日単位で差を取得

    if diff_in_days == 0:
        return '今日'
    elif diff_in_days == 1:
        return '昨日'
    elif diff_in_days >= 30:
        return '30日以上前'
    else:
        return f'{diff_in_days}日前'

@register.filter
def get_item(dictionary, key):
    """辞書からキーに対応する値を取得"""
    try:
        return dictionary.get(str(key))  # keyを文字列に変換して取得
    except (ValueError, TypeError):
        return None

# 祝日はんてい
@register.filter
def is_saturday(value):
    try:
        date = value.date()
    except AttributeError:
        date = value
    return date.weekday() == 5
@register.filter
def is_sunday(value):
    try:
        date = value.date()
    except AttributeError:
        date = value
    return date.weekday() == 6
@register.filter
def is_holiday(value):
    try:
        return jpholiday.is_holiday(value.date())
    except AttributeError:
        return jpholiday.is_holiday(value)