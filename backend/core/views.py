from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .serializers import RegistroSerializer, UsuarioSerializer

class RegistroView(generics.CreateAPIView):
    serializer_class = RegistroSerializer

class MeView(generics.RetrieveAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
