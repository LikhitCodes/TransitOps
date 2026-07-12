from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import RegisterSerializer, UserProfileSerializer


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Public endpoint — creates a new user account.
    Returns the created user profile (no token — caller must login separately).
    """

    permission_classes = [AllowAny]
    serializer_class   = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserProfileSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    """
    GET /api/auth/me/
    Returns the authenticated user's profile and role.
    Requires a valid Bearer JWT in the Authorization header.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
