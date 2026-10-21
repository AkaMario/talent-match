# TalentMatch IA — Primera versión funcional

**Evaluación parcial de Electiva 5 · 20 de octubre de 2026**

El prototipo implementa el flujo principal de la propuesta y el wireframe originales: el estudiante registra sus habilidades, compara su perfil con prácticas, identifica brechas, solicita un plan de aprendizaje con IA local, comparte su CV y hace seguimiento a su postulación. La empresa publica convocatorias, revisa candidatos y actualiza el estado del proceso.

## Funcionalidad principal demostrable

El perfil inicial de Mariana contiene Python, SQL, Git y Trabajo en equipo. La práctica de análisis de datos requiere Python, SQL, Power BI y Trabajo en equipo. El sistema calcula **75% de compatibilidad**, identifica **Power BI** como habilidad faltante y permite generar una recomendación con **Qwen3 0.6B ejecutado en Ollama**. El estudiante conserva la decisión de postularse.

La postulación y su CV se guardan realmente en PostgreSQL y MinIO. La empresa puede descargar el CV compartido y marcar la solicitud como En revisión o Entrevista; el estudiante ve ese estado al volver a consultar sus postulaciones.

## Implementación

| Necesidad | Implementación |
| --- | --- |
| Portal del estudiante y empresa | React con diseño responsivo |
| Lógica y API | NestJS con TypeScript |
| Usuarios, roles y sesiones | Keycloak local, Authorization Code + PKCE |
| Persistencia | PostgreSQL |
| CV, certificados y evidencias | MinIO, bucket privado y descarga con autorización |
| Sugerencias de aprendizaje | Ollama local con Qwen3 0.6B |
| Ejecución en el computador | Docker Compose con volúmenes persistentes |

El porcentaje se calcula con reglas explicables, sin depender de la IA. Ollama genera las acciones de aprendizaje. Si el modelo falla, se muestran sugerencias básicas señaladas como reglas y siguen disponibles las postulaciones.

## Verificación realizada

- Compilación de NestJS y React e imágenes Docker construidas correctamente.
- Pruebas de coincidencias, alias y rechazo de habilidades inventadas o repetidas.
- API contra PostgreSQL real: firma, emisor, audiencia y expiración de JWT; aislamiento entre empresas; validación de perfiles; CV propio; postulaciones duplicadas; actualización de estados y continuidad sin IA.
- Prueba integral del despliegue Docker: autenticación real con Keycloak, persistencia, subida y descarga de PDF desde MinIO, postulación, revisión por empresa, cierre/reapertura de convocatoria y respuesta real de Qwen3 0.6B.
- Chrome: login PKCE de ambos roles, navegación, análisis de brechas, carga de CV, logout y comprobación de ancho móvil sin desbordamiento.

Los comandos para repetir estas pruebas y el guion de presentación están en [README.md](../README.md). Las capturas están en [artifacts/screenshots](../artifacts/screenshots/).

## Alcance de esta entrega

Se implementan estudiante y empresa. Quedan para futuras versiones: universidad y administración, retos con puntos, correo, integraciones con bolsas de empleo, búsqueda vectorial y extracción automática de los documentos. Los datos demo son ficticios; las habilidades se declaran manualmente. El porcentaje de compatibilidad orienta la búsqueda y no garantiza una selección.

MinIO utiliza un espejo independiente de la versión original, fijado por digest, porque sus registros oficiales no permitieron descargarla. El proyecto también conserva una opción para compilar desde el código fuente oficial. Esta compilación opcional no forma parte de la ejecución verificada; el despliegue probado usa la imagen fijada.

## Acceso

- Aplicación: **http://localhost:5173**.
- Estudiante: `estudiante` / `Demo2026!`.
- Empresa: `empresa` / `Demo2026!`.

Iniciar: `docker compose up -d --build`. En el computador de desarrollo, el despliegue verificado está en el contexto Docker `desktop-linux`.
