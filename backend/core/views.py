from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .serializers import RegistroSerializer, UsuarioSerializer, TutorSerializer, SolicitudSerializer, CalendarioSerializer, NotificacionSerializer
from .models import Tutor, Solicitud, Notificacion

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


#vistas para las consultas de solicitudes de parte del estudiante
class MisSolicitudesView(generics.ListAPIView):
    serializer_class = SolicitudSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Solicitud.objects.filter(
            estudiante=self.request.user
        )


#vista para el calendario
class CalendarioView(generics.ListAPIView):
    serializer_class = CalendarioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        usuario = self.request.user

        if usuario.rol == 'tutor':
            return Solicitud.objects.filter(
                tutor__usuario=usuario,
                estado='aceptada'
            )

        return Solicitud.objects.filter(
            estudiante=usuario,
            estado='aceptada'
        )

#vista de notificacion
class NotificacionesView(generics.ListAPIView):
    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notificacion.objects.filter(
            usuario=self.request.user
        ).order_by('-fecha')