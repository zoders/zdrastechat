from django.urls import path
from .views import CurrentUserAvatarView, CurrentUserView, RegisterView, UserSearchView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("search/", UserSearchView.as_view(), name="user-search"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("me/avatar/", CurrentUserAvatarView.as_view(), name="current-user-avatar"),
]
