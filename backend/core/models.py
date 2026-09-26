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
