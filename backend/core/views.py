from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .serializers import RegistroSerializer, UsuarioSerializer, TutorSerializer, SolicitudSerializer
from .models import Tutor, Solicitud

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

#serialicer para las solicitud de tutorias]

class SolicitudView(generics.CreateAPIView):
    serializer_class = SolicitudSerializer
    permission_classes = [IsAuthenticated]

#creamos la vista del tutor para revision de solicitudes
class SolicitudesTutorView(generics.ListAPIView):
    serializer_class = SolicitudSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Solicitud.objects.filter(
            tutor__usuario=self.request.user
        ) 

#vistas para aceptar y recahazar las solicitudes
class GestionarSolicitudView(generics.UpdateAPIView):
    serializer_class = SolicitudSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Solicitud.objects.filter(
            tutor__usuario=self.request.user
        )
    
    