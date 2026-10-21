# TalentMatch IA

MVP académico del Sistema Inteligente de Desarrollo Profesional y Prácticas. Convierte el flujo de los documentos de `documents/` en una aplicación local: **perfil → prácticas → coincidencias y brechas → plan de aprendizaje con IA → postulación → seguimiento**.

## Ejecutar

Requisitos: Docker Engine con Docker Compose v2 o posterior, internet para la primera instalación y puertos 5173, 8080, 9001 y 5050 disponibles. Se recomienda disponer de al menos 6 GB de RAM libres. Ollama trabaja con CPU; no requiere GPU.

```bash
cp .env.example .env
docker compose up -d --build
```

Abre **http://localhost:5173**. El primer inicio tarda más: descarga las imágenes y el modelo. Consulta el progreso con:

```bash
docker compose ps
docker compose logs -f ollama-init
```

Espera a que `ollama-init` termine con código 0 para generar planes con IA. Keycloak puede tardar unos segundos después del inicio de la API: si la pantalla de acceso aún no responde, recarga cuando termine su arranque.

| Acceso | Usuario | Contraseña |
| --- | --- | --- |
| Estudiante | `estudiante` | `Demo2026!` |
| Empresa | `empresa` | `Demo2026!` |
| Keycloak http://localhost:8080/admin | `admin` | `admin-local-2026` |
| MinIO http://localhost:9001 | `talentmatch` | `talentmatch-local-files` |
| pgAdmin http://localhost:5050 | `admin@talentmatch.com` | `pgadmin-local-2026` |

Son credenciales de demostración local. Los servicios publicados escuchan solo en `127.0.0.1`. Usa **localhost**, no la IP ni `127.0.0.1` en el navegador: el emisor de tokens y las redirecciones están configurados para localhost.

El registro público crea **estudiantes**. Las empresas se aprovisionan desde Keycloak, asignando el rol de realm `company`. La cuenta de empresa precargada permite hacer toda la demostración sin configuración adicional. Los datos iniciales son ficticios.

## Administrar PostgreSQL con pgAdmin

Abre **http://localhost:5050** e ingresa con las credenciales de pgAdmin de la tabla anterior. En **Servers → TalentMatch → TalentMatch PostgreSQL** ya está registrado el servidor. Al conectarte, introduce la contraseña de PostgreSQL (`talentmatch-local-db` por defecto, o el valor de `POSTGRES_PASSWORD` en `.env`). Puedes guardarla en pgAdmin.

La conexión interna utiliza host `postgres`, puerto `5432` y usuario `talentmatch`. Dentro de **Databases** están `talentmatch` (datos de la aplicación) y `keycloak` (identidad). Las tablas de la aplicación están en **talentmatch → Schemas → public → Tables**. El volumen `pgadmin_data` conserva la configuración de pgAdmin.

Para iniciar solamente este servicio y su dependencia:

```bash
docker --context desktop-linux compose up -d pgadmin
```

Las variables `PGADMIN_DEFAULT_EMAIL` y `PGADMIN_DEFAULT_PASSWORD` crean el administrador en el primer inicio del volumen. Para cambiar posteriormente su contraseña, utiliza la interfaz de pgAdmin.

## Qué funciona

- Login, registro de estudiantes y logout con Keycloak. React usa Authorization Code + PKCE; la API verifica firma RS256, emisor, audiencia y expiración de los JWT.
- Edición persistente de nombre, carrera, semestre, presentación, habilidades, proyectos y certificaciones.
- Prácticas de demostración y publicación real por empresas. Cada empresa administra exclusivamente sus propias convocatorias.
- Búsqueda por título, habilidad, área o empresa; filtros de modalidad y compatibilidad.
- Porcentaje de habilidades coincidentes, con desglose explícito de coincidencias y faltantes. Recalcula cuando cambia el perfil.
- Plan de acciones generado por Ollama para las habilidades faltantes. Valida la estructura y los nombres de las habilidades devueltas.
- Carga de CV, certificados y evidencias en PDF (máximo 5 MB), almacenados en un bucket privado de MinIO.
- Postulación con CV propio y prevención de duplicados. El documento seleccionado permanece asociado a la solicitud.
- Consulta de postulaciones por estudiante y revisión de candidatos por la empresa correspondiente.
- Descarga del CV por su propietario o por la empresa a la que se compartió al postularse.
- Estados: Enviada, En revisión, Entrevista, Aceptada y No seleccionada.

## Demostración para el parcial

1. Ingresa como `estudiante` y revisa el panel general.
2. En **Mi perfil**, comprueba Python y SQL; carga un PDF como hoja de vida.
3. En **Explorar prácticas**, abre **Practicante de análisis de datos**. El perfil inicial cumple Python, SQL y Trabajo en equipo: **75%**, con **Power BI** como brecha.
4. Presiona **Generar mi plan**. Comprueba que el resultado indica IA local. La primera inferencia puede tardar; hay un límite de 75 segundos.
5. Elige tu CV y envía la postulación. Comprueba su aparición en **Mis postulaciones**.
6. Cierra sesión e ingresa como `empresa`. En **Candidatos**, descarga el CV y cambia el estado a **En revisión**.
7. Regresa como estudiante y verifica el nuevo estado.
8. Agrega Power BI al perfil y guarda. La práctica de análisis de datos debe mostrar **100%**. El sistema orienta; el estudiante decide si se postula.
9. Como empresa, publica una nueva práctica y verifica que aparece para el estudiante.

Puedes crear un PDF de ejemplo para la demostración con `node scripts/create-demo-cv.mjs`: escribe `documents/CV-demostracion.pdf`, con datos ficticios y un PDF válido.

## IA y límites del prototipo

El motor de coincidencia es explicable: `habilidades requeridas coincidentes / total de habilidades requeridas únicas × 100`. Ignora mayúsculas, espacios y tildes, y reconoce algunos alias (`postgres`/`PostgreSQL`, `powerbi`/`Power BI`). No evalúa experiencia, dominio real ni garantiza empleabilidad. Las habilidades y requisitos se declaran mediante formularios; este MVP no extrae automáticamente el contenido de los CV ni analiza ofertas de fuentes externas.

El contenedor usa `alpine/ollama:0.40.6`, una distribución comunitaria CPU de Ollama (repositorio `alpine-docker/ollama`) que evita descargar las bibliotecas de GPU. Ollama usa por defecto **qwen3:0.6b**, un modelo pequeño configurable en `.env` mediante `OLLAMA_MODEL`. Genera acciones prácticas en español, con salida JSON estructurada, sin servicios externos de IA. Puede producir consejos de calidad variable. Los porcentajes no dependen del modelo. No se envían CV, nombres ni correos a Ollama: solo el título de la práctica y las habilidades faltantes.

Si Ollama falla, tarda más de 75 segundos o devuelve datos inválidos, se muestran sugerencias básicas **identificadas como reglas**, y el resto del sistema sigue disponible. Para cambiar el modelo, edita `.env` y ejecuta:

```bash
docker compose up -d --force-recreate ollama-init api
```

El modelo se descarga automáticamente con el servicio de inicialización. Los servicios mantienen sus datos en volúmenes Docker.

Este MVP no incluye portal universitario, retos con puntos, correo, recuperación de contraseña, chat, integraciones de mercado, embeddings, procesamiento automático de PDF ni operación de producción. La autenticación usa `start-dev` y HTTP local. Las contraseñas de demo y Direct Access Grants del cliente se incluyen únicamente para pruebas locales; el navegador usa PKCE. No exponer esta configuración públicamente.

## Arquitectura

| Componente | Tecnología | Responsabilidad |
| --- | --- | --- |
| Web | React, Vite, Nginx | Portales, formularios y navegación |
| API | NestJS, TypeScript, pg | Validación, autorización y lógica del negocio |
| Identidad | Keycloak | Usuarios, sesiones y roles |
| Datos | PostgreSQL | Perfiles, prácticas, documentos y postulaciones |
| Archivos | MinIO | Objetos privados compatibles con S3 |
| IA | Ollama + Qwen3 0.6B | Recomendaciones de aprendizaje |

Una instancia de PostgreSQL contiene bases separadas `talentmatch` y `keycloak`. Nginx, Keycloak, la consola de MinIO y pgAdmin publican puertos al host. La API, PostgreSQL, S3 y Ollama se comunican en la red interna Docker.

MinIO usa por defecto el espejo `dappros/minio:RELEASE.2025-09-07T16-13-09Z`. Su publicador lo describe como una copia sin modificaciones de la imagen original, retirada de los registros públicos de MinIO. Es un distribuidor independiente de MinIO. La etiqueta está fijada y puede reemplazarse con `MINIO_IMAGE` en `.env`. La licencia de MinIO es AGPL-3.0.

También se incluye `infra/minio/Dockerfile` para compilar desde el archivo fuente oficial. Para usarlo en lugar del espejo:

```bash
docker compose -f compose.yaml -f compose.source.yaml up -d --build
```

Esta opción descarga el código y las dependencias Go, por lo que su primera compilación tarda más.

## Pruebas y desarrollo

Con Node.js 22:

```bash
npm ci
npm run build
npm test
node scripts/smoke.mjs
```

El smoke test necesita los servicios ya iniciados. Verifica autenticación, roles, persistencia de perfil, subida y descarga de PDF, postulación, duplicados, cambio de estado y una respuesta real de Ollama. Crea una práctica y una postulación de prueba persistentes para poder repetirlo; usa las cuentas demo. Para omitir solo la comprobación de IA durante diagnóstico: `SKIP_AI=1 node scripts/smoke.mjs`.

Los lockfiles fijan las dependencias. Para reconstruir tras cambiar código:

```bash
docker compose up -d --build api web
```

El SQL inicial y el realm se importan **solo en volúmenes nuevos**. Cambiarlos no migra datos existentes. Para reiniciar una demo desde cero, `docker compose down -v` **elimina todos los datos locales**, incluidos archivos y modelo; después ejecuta nuevamente el inicio. Para parar conservando los datos: `docker compose down`.

## API principal

Todas las rutas excepto salud requieren `Authorization: Bearer <token de Keycloak>`.

| Método y ruta | Función |
| --- | --- |
| `GET /api/health` | Salud de API y conexión PostgreSQL |
| `GET /api/me`, `PUT /api/me` | Leer/actualizar perfil propio |
| `GET /api/opportunities` | Prácticas disponibles o propias según rol |
| `POST /api/opportunities` | Publicar práctica (empresa) |
| `POST /api/opportunities/:id/toggle` | Abrir/cerrar práctica propia |
| `POST /api/opportunities/:id/plan` | Generar recomendaciones (estudiante) |
| `GET /api/documents`, `POST /api/documents` | Listar propios/cargar PDF multipart (`kind`, `file`) |
| `GET /api/documents/:id/download` | Descargar archivo con autorización |
| `GET /api/applications`, `POST /api/applications` | Consultar/enviar postulaciones |
| `PUT /api/applications/:id/status` | Actualizar estado (empresa propietaria) |

## Soporte básico

- **Login falla:** revisa `docker compose logs keycloak`, usa localhost y comprueba el puerto 8080. Los usuarios importados no deben tener acciones pendientes.
- **IA en modo de reglas:** consulta `docker compose logs ollama ollama-init api`. Espera a que termine la descarga y vuelve a generar el plan.
- **Archivos no se guardan:** consulta `docker compose logs minio api` y verifica las credenciales de `.env`.
- **API no inicia:** revisa `docker compose logs api postgres`. La base debe haberse inicializado sin errores.
- **Puertos ocupados:** detén el servicio ajeno o ajusta puertos y las URLs de Keycloak, CORS y React de forma consistente.
- **No aparecen cambios de datos:** recarga la página. Este MVP no usa actualización en tiempo real entre navegadores.

### Verificación adicional de la API

`node scripts/api-integration.mjs` usa una base PostgreSQL **de pruebas** ya inicializada y un emisor JWKS efímero. Configura `DATABASE_URL`; por defecto apunta a `127.0.0.1:55432/talentmatch`. Comprueba firma, emisor, audiencia y vencimiento de JWT, aislamiento entre empresas, validación del perfil, postulación con CV propio, duplicados y continuidad sin Ollama. No verifica Keycloak ni la persistencia física S3; para esos servicios usa el smoke test completo.

Para verificar navegación, login PKCE, carga de PDF y diseño móvil con Chrome instalado:

```bash
node scripts/browser-smoke.mjs
```

Genera capturas en `artifacts/screenshots/`. Usa `CHROME_BIN` si tu ejecutable tiene otra ruta. No cambies el contexto Docker durante las descargas o el arranque: `docker context show` indica el activo. Si usas Docker Desktop en Linux puedes fijarlo por comando con `docker --context desktop-linux compose up -d --build`.
