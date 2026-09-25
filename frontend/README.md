# Tutorías - APP-02

Frontend del APP-02 construido sobre el APP-01.

## Acceso temporal de desarrollo

Mientras el backend y la base de datos se integran, el acceso no consulta usuarios reales. El formulario permite continuar con cualquier correo y cualquier contraseña siempre que los campos requeridos estén completos.

No se crean cuentas de prueba ni credenciales especiales. Solo se guarda una marca temporal de sesión en `sessionStorage` para proteger la ruta `/tutores` durante la navegación.

Cuando se conecte el backend, este comportamiento deberá reemplazarse por la autenticación real del proyecto.

## APP-02

- Lista de tutores
- Filtro por materia
- Búsqueda por nombre o materia
- Diseño responsive
- Consumo preparado para `GET /api/tutores/?materia=`

## Ejecutar

```bash
npm install
npm run dev
```
