from django.urls import path
from .views import (
    RegisterView,
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    LogoutView,
    MeView,
    VerifyEmailView,
    ResendVerificationView,
    RequestPasswordResetView,
    ConfirmPasswordResetView,
    ChangePasswordView
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CookieTokenObtainPairView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token-refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("resend-verification/", ResendVerificationView.as_view(), name="resend-verification"),
    path("password-reset-request/", RequestPasswordResetView.as_view(), name="password-reset-request"),
    path("password-reset-confirm/", ConfirmPasswordResetView.as_view(), name="password-reset-confirm"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]


