from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Role, Recruiter

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if self.user.role == Role.CANDIDATE and not self.user.is_email_verified:
            raise serializers.ValidationError({
                "detail": "Please verify your email address before logging in. Check your inbox for the activation link."
            })
        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "name", "email", "role", "bio", "facebook_link", "linkedin_link", "github_link", "resume", "can_view_recruiters", "created_at")
        read_only_fields = ("id", "role", "created_at")

    def validate(self, attrs):
        # Prevent non-admin users from changing their own can_view_recruiters flag
        request = self.context.get("request")
        if request and request.user:
            if request.user.role != Role.ADMIN:
                if "can_view_recruiters" in attrs:
                    attrs.pop("can_view_recruiters")
        return attrs

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ("id", "name", "email", "password")

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            name=validated_data["name"],
            password=validated_data["password"],
            role=Role.CANDIDATE
        )
        return user

class RecruiterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recruiter
        fields = ("id", "name", "company", "number", "created_at")
        read_only_fields = ("id", "created_at")
