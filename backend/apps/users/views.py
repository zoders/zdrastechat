from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import AvatarUploadSerializer, RegisterSerializer, UserSerializer
from .models import User

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

class UserSearchView(generics.ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        query = self.request.query_params.get("username", "")
        if query:
            return User.objects.filter(username=query)  # точное совпадение
        return User.objects.none()


class CurrentUserView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user, context={"request": request}).data)


class CurrentUserAvatarView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = AvatarUploadSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user, context={"request": request}).data, status=status.HTTP_200_OK)

    def delete(self, request):
        avatar = request.user.avatar
        if avatar:
            request.user.avatar = None
            request.user.save(update_fields=["avatar"])
            avatar.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
