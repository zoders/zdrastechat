from django.urls import path
from .views import RegisterView, UserSearchView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("search/", UserSearchView.as_view(), name="user-search"),
]