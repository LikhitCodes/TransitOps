from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles new user registration.
    - password is write-only and hashed via set_password()
    - username is auto-derived from the email prefix so callers don't need to send it
    """

    password = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})

    class Meta:
        model  = User
        fields = ['id', 'email', 'password', 'role', 'phone']

    def validate_email(self, value: str) -> str:
        """Ensure email uniqueness with a friendly error message."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def create(self, validated_data: dict) -> User:
        password = validated_data.pop('password')

        # Auto-derive a unique username from the email prefix
        email_prefix = validated_data['email'].split('@')[0]
        username = email_prefix
        counter  = 1
        while User.objects.filter(username=username).exists():
            username = f"{email_prefix}{counter}"
            counter += 1

        user = User(**validated_data, username=username)
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for the /api/auth/me/ endpoint.
    Exposes safe user data only — no password field.
    """

    class Meta:
        model  = User
        fields = ['id', 'email', 'username', 'role', 'phone', 'date_joined', 'is_staff']
        read_only_fields = fields
