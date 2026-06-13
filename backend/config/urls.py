from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.views.static import serve
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("apps.users.urls")),
    path("api/chats/", include("apps.chats.urls")),
    # JWT токены
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("media/<path:path>", serve, {"document_root": settings.MEDIA_ROOT}),
]
