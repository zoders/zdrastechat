from rest_framework import serializers
from apps.core.models import FileType, UploadedFile
from .models import User


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "avatar_url"]

    def get_avatar_url(self, obj):
        if not obj.avatar or not obj.avatar.file:
            return None

        request = self.context.get("request")
        url = obj.avatar.file.url
        return request.build_absolute_uri(url) if request else url


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class AvatarUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        content_type = getattr(value, "content_type", "")
        if content_type and not content_type.startswith("image/"):
            raise serializers.ValidationError("Аватаркой может быть только изображение")
        return value

    def save(self, **kwargs):
        user = self.context["request"].user
        old_avatar = user.avatar

        uploaded_file = UploadedFile.objects.create(
            file=self.validated_data["file"],
            file_type=FileType.AVATAR,
        )
        user.avatar = uploaded_file
        user.save(update_fields=["avatar"])

        if old_avatar:
            old_avatar.delete()

        return user
