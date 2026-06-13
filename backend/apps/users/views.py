from rest_framework import status, generics, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from .models import Role, Recruiter
from .serializers import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer, RecruiterSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class CookieTokenObtainPairView(TokenObtainPairView):
    """
    Subclass standard token obtain view to set tokens in HTTP-only cookies
    instead of sending them in response body.
    """
    serializer_class = CustomTokenObtainPairSerializer
    def finalize_response(self, request, response, *args, **kwargs):
        if response.status_code == status.HTTP_200_OK:
            access_token = response.data.get("access")
            refresh_token = response.data.get("refresh")
            
            if access_token and refresh_token:
                # Set access token cookie
                response.set_cookie(
                    getattr(settings, "JWT_COOKIE_ACCESS_NAME", "access_token"),
                    access_token,
                    max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds(),
                    httponly=getattr(settings, "JWT_COOKIE_HTTPONLY", True),
                    secure=getattr(settings, "JWT_COOKIE_SECURE", False),
                    samesite=getattr(settings, "JWT_COOKIE_SAMESITE", "Lax"),
                    path="/"
                )
                
                # Set refresh token cookie
                response.set_cookie(
                    getattr(settings, "JWT_COOKIE_REFRESH_NAME", "refresh_token"),
                    refresh_token,
                    max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds(),
                    httponly=getattr(settings, "JWT_COOKIE_HTTPONLY", True),
                    secure=getattr(settings, "JWT_COOKIE_SECURE", False),
                    samesite=getattr(settings, "JWT_COOKIE_SAMESITE", "Lax"),
                    path="/"
                )
                
                # Delete tokens from the response JSON body
                del response.data["access"]
                del response.data["refresh"]
                
                response.data["message"] = "Login successful"
                
        return super().finalize_response(request, response, *args, **kwargs)

class CookieTokenRefreshView(TokenRefreshView):
    """
    Subclass token refresh view to fetch refresh token from cookie
    and set new access token cookie in the response.
    """
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(getattr(settings, "JWT_COOKIE_REFRESH_NAME", "refresh_token"))
        if refresh_token:
            # Inject refresh token into request data for parent class
            request.data["refresh"] = refresh_token
        return super().post(request, *args, **kwargs)

    def finalize_response(self, request, response, *args, **kwargs):
        if response.status_code == status.HTTP_200_OK:
            access_token = response.data.get("access")
            refresh_token = response.data.get("refresh")
            
            if access_token:
                response.set_cookie(
                    getattr(settings, "JWT_COOKIE_ACCESS_NAME", "access_token"),
                    access_token,
                    max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds(),
                    httponly=getattr(settings, "JWT_COOKIE_HTTPONLY", True),
                    secure=getattr(settings, "JWT_COOKIE_SECURE", False),
                    samesite=getattr(settings, "JWT_COOKIE_SAMESITE", "Lax"),
                    path="/"
                )
                del response.data["access"]
                
            if refresh_token:
                response.set_cookie(
                    getattr(settings, "JWT_COOKIE_REFRESH_NAME", "refresh_token"),
                    refresh_token,
                    max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds(),
                    httponly=getattr(settings, "JWT_COOKIE_HTTPONLY", True),
                    secure=getattr(settings, "JWT_COOKIE_SECURE", False),
                    samesite=getattr(settings, "JWT_COOKIE_SAMESITE", "Lax"),
                    path="/"
                )
                del response.data["refresh"]
                
            response.data["message"] = "Token refresh successful"
            
        return super().finalize_response(request, response, *args, **kwargs)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        
        # Generate secure activation token
        from django.core import signing
        token = signing.dumps({"user_id": str(user.id)}, salt="email-verification")
        
        # Build activation link pointing to React frontend
        activation_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        
        # Dispatch background email
        from apps.interviews.services.email import send_html_email_async
        
        context = {
            "candidate_name": user.name,
            "activation_url": activation_url
        }
        
        send_html_email_async(
            subject="Please verify your email - InterviewHub",
            template_name="emails/email_verification.html",
            context=context,
            recipient_list=[user.email]
        )

class VerifyEmailView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        token = request.query_params.get("token")
        if not token:
            return Response({"error": "Token query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            from django.core import signing
            # Load and verify token with a 24-hour expiration threshold
            data = signing.loads(token, salt="email-verification", max_age=86400)
            user_id = data.get("user_id")
            
            user = User.objects.get(id=user_id)
            if user.is_email_verified:
                return Response({"message": "Email is already verified."}, status=status.HTTP_200_OK)
                
            user.is_email_verified = True
            user.save()
            
            return Response({"message": "Email verified successfully! You can now log in."}, status=status.HTTP_200_OK)
            
        except signing.SignatureExpired:
            return Response({"error": "The verification link has expired. Please contact support or register again."}, status=status.HTTP_400_BAD_REQUEST)
        except (signing.BadSignature, User.DoesNotExist):
            return Response({"error": "Invalid or corrupt verification link."}, status=status.HTTP_400_BAD_REQUEST)

class ResendVerificationView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email.strip().lower())
            if user.is_email_verified:
                return Response({"message": "This email is already verified. Please log in."}, status=status.HTTP_200_OK)
            
            # Generate secure activation token
            from django.core import signing
            token = signing.dumps({"user_id": str(user.id)}, salt="email-verification")
            
            # Build activation link pointing to React frontend
            activation_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
            
            # Dispatch background email
            from apps.interviews.services.email import send_html_email_async
            
            context = {
                "candidate_name": user.name,
                "activation_url": activation_url
            }
            
            send_html_email_async(
                subject="Please verify your email - InterviewHub",
                template_name="emails/email_verification.html",
                context=context,
                recipient_list=[user.email]
            )
            
            return Response({"message": "Verification email resent successfully! Check your inbox."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            # Prevent user enumeration by returning a generic success but clear message
            return Response({"message": "If the email is registered and unverified, a verification link has been sent."}, status=status.HTTP_200_OK)

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        response = Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        
        # Blacklist the refresh token
        refresh_token = request.COOKIES.get(getattr(settings, "JWT_COOKIE_REFRESH_NAME", "refresh_token"))
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
                
        # Clear cookies
        response.delete_cookie(getattr(settings, "JWT_COOKIE_ACCESS_NAME", "access_token"), path="/")
        response.delete_cookie(getattr(settings, "JWT_COOKIE_REFRESH_NAME", "refresh_token"), path="/")
        return response

class MeView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == Role.ADMIN

class RecruiterPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # ADMIN has full access
        if request.user.role == Role.ADMIN:
            return True
            
        # CANDIDATE has read-only access (GET/HEAD/OPTIONS) if allowed
        if request.user.role == Role.CANDIDATE:
            if request.method in ("GET", "HEAD", "OPTIONS"):
                return getattr(request.user, "can_view_recruiters", False)
                
        return False

class RecruiterViewSet(viewsets.ModelViewSet):
    queryset = Recruiter.objects.all().order_by("name")
    serializer_class = RecruiterSerializer
    permission_classes = [IsAuthenticated, RecruiterPermission]

class CandidateManagementViewSet(viewsets.ModelViewSet):
    """
    Admin-only viewport to fetch all Candidates and update their recruiter permission toggle.
    """
    queryset = User.objects.filter(role=Role.CANDIDATE).order_by("name")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    http_method_names = ['get', 'patch']
