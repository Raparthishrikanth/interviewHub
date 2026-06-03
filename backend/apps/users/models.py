import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class Role(models.TextChoices):
    CANDIDATE = "CANDIDATE"
    ADMIN     = "ADMIN"
    VIEWER    = "VIEWER"

class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, role=Role.CANDIDATE, **extra):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, role=role, **extra)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        extra.setdefault("is_email_verified", True)
        return self.create_user(email, name, password, role=Role.ADMIN, **extra)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CANDIDATE)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # Candidate Profile Fields
    bio = models.TextField(blank=True, default="")
    facebook_link = models.URLField(blank=True, default="")
    linkedin_link = models.URLField(blank=True, default="")
    github_link = models.URLField(blank=True, default="")
    resume = models.FileField(upload_to="resumes/", blank=True, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]
    
    objects = UserManager()

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.role}"
