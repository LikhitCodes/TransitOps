from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Extended user model that adds a role and phone field.
    Login is done via email (not username). The username field is
    retained because AbstractUser requires it, but it is auto-populated
    from the email prefix in the serializer so callers never need to
    supply it explicitly.
    """

    class Role(models.TextChoices):
        FLEET_MANAGER     = 'Fleet Manager',     'Fleet Manager'
        DRIVER            = 'Driver',            'Driver'
        SAFETY_OFFICER    = 'Safety Officer',    'Safety Officer'
        FINANCIAL_ANALYST = 'Financial Analyst', 'Financial Analyst'

    role  = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.DRIVER,
    )
    phone = models.CharField(max_length=20, blank=True)

    # Override email to enforce uniqueness — used as USERNAME_FIELD
    email = models.EmailField(unique=True)

    USERNAME_FIELD  = 'email'
    # username is still required by createsuperuser but not by the API
    REQUIRED_FIELDS = ['username', 'role']

    class Meta:
        verbose_name        = 'User'
        verbose_name_plural = 'Users'

    def __str__(self) -> str:
        return f"{self.email} ({self.role})"
