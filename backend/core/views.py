from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .serializers import RegistroSerializer, UsuarioSerializer, TutorSerializer
from .models import Tutor

class RegistroView(generics.CreateAPIView):
    serializer_class = RegistroSerializer

class MeView(generics.RetrieveAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


#vista tuttor
class TutoresView(generics.ListAPIView):
    serializer_class = TutorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        materia = self.request.query_params.get('materia')

        queryset = Tutor.objects.all()

        if materia:
            queryset = queryset.filter(
                materias__nombre__iexact=materia
            )

        return queryset