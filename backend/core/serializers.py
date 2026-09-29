from rest_framework import serializers
from .models import Usuario, Tutor, Solicitud

class RegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['username', 'email', 'password', 'rol']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'rol']


#serializer para los tutotes
class TutorSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source='usuario.username')
    materias = serializers.StringRelatedField(many=True)

    class Meta:
        model = Tutor
        fields = ['id', 'nombre', 'materias']

#serializer para las solicitudes de las monitorias
class SolicitudSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solicitud
        fields = ['id', 'tutor', 'materia', 'fecha', 'hora', 'estado']
        read_only_fields = ['id']

    def validate_estado(self, value):
        if value is not None and value not in ['aceptada', 'rechazada']:
            raise serializers.ValidationError(
                'El estado debe ser aceptada o rechazada'
            )
        return value

    def create(self, validated_data):
        validated_data['estudiante'] = self.context['request'].user
        return Solicitud.objects.create(**validated_data)