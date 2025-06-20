from django.urls import path,include
from . import views
from rest_framework.routers import DefaultRouter

app_name="diary"

router = DefaultRouter()
router.register(r'diary',views.DiaryViewSet, basename='diary')
router.register(r'good', views.GoodViewSet, basename='good')

urlpatterns = [
    path("",views.TopView.as_view(),name="top"),

    path("home/",views.HomeView.as_view(),name="home"),
    # path("home/good/<uuid:pk>",views.good_for_diary,name="good_for_diary"),
    
    # path("diary/",views.DiaryNewView.as_view(),name="diary"),
    path("diary/photo/",views.DiaryPhotoView.as_view(),name="diary_photo"),
    path("diary/update/<uuid:pk>",views.DiaryUpdateAPIView.as_view(),name="diary-update"),

    path("weather/",views.WeatherView.as_view(),name="weather_report"),
    # path("location2weather/",views.ajax_location2weather,name="ajax_location2weather"), 

    path("address/",views.AddressUserView.as_view(),name= "address_user"),
    path("address/search/",views.AddressSearchView.as_view(),name="address_search"),
    path("address/current-position",views.AddressCurrentPositionView.as_view(),name="get_current_address"),

    path("calendar/",views.CalendarView.as_view(),name="calendar"),
    # path("calendar_edit/",views.DiaryNewView.as_view(),name="calendar_edit"),

    path("map/",views.MapView.as_view(),name="map"),

    # path("diary/sendDiaries",views.sendDairies,name="sendDiaries"),
    # path("diary/photos2Locations",views.photos2Locations,name="photos2Locations"),
    path("diary/photos2Locations",views.Photos2LocationsView.as_view(),name="photos2Locations"),
    # path('diary/delete-all-diaries/', views.delete_all_diaries, name='delete_all_diaries'),

    # path('diary/edit-diary-noPK/', views.diary_edit_noPK, name='editDiary_noPK'),
    # path('diary/delete-diary-noPK/', views.diary_delete_noPK, name='deleteDiary_noPK'),
    # path('diary/delete-diary/<uuid:pk>', views.DiaryDeleteView.as_view(), name='deleteDiary'),

    # routerで自動的に設定されたURLを含める(API用のURL)
    path('api/', include(router.urls)),
]

