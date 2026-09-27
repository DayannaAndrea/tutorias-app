from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    ROL_CHOICES = [
        ('estudiante', 'Estudiante'),
        ('tutor', 'Tutor'),
    ]

    rol = models.CharField(
        max_length = 20,
        choices = ROL_CHOICES
    )


#modelo para materias y tutor
class Materia(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre


class Tutor(models.Model):
    usuario = models.OneToOneField(
        Usuario,
        on_delete = models.CASCADE,
        related_name = 'tutor'
    )
    materias = models.ManyToManyField(
        Materia,
        related_name = 'tutores'
    )

    def __str__(self):
        return self.usuario.username


#modelo de las solicitudes

class Solicitud(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('aceptada', 'Aceptada'),
        ('rechazada', 'Rechazada'),
    ]

    estudiante = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='solicitudes_enviadas'
    )

    tutor = models.ForeignKey(
        Tutor, 
        on_delete=models.CASCADE,
        related_name='solicitudes_recibidas'
    )

    materia = models.ForeignKey(
        Materia,
        on_delete=models.CASCADE
    )

    fecha = models.DateField()
    hora = models.TimeField()
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='pendiente'
    )

    def __str__(self):
        return f'{self.estudiante.username} - {self.tutor.usuario.username}'