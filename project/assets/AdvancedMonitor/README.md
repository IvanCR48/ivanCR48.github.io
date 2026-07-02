# NOC Enterprise Monitor - Sistema de Monitoreo de Red y Registro de Equipos

Este proyecto es una plataforma completa de nivel empresarial estilo **NOC (Network Operations Center)** para la gestión y monitoreo en tiempo real de dispositivos de red (Routers, ONTs, Decodificadores) y clientes de telecomunicaciones. Está inspirado en los sistemas de monitoreo y soporte técnico utilizados en operadoras de telecomunicaciones como Claro (gestión de inventario físico de red, estados de línea e incidencias).

---

## 🚀 ¿Qué hace el sistema? (Funcionalidades Clave)

1.  **Dashboard de Operaciones (NOC):**
    *   Muestra métricas críticas consolidadas: total de abonados, equipos registrados en la red, porcentaje de **Uptime de red** global en tiempo real y dispositivos caídos (`Offline`).
    *   Gráficos dinámicos e interactivos (estados de red y volumen por tipo de hardware).
    *   Consola lateral de alertas que despliega en tiempo real los últimos 10 eventos críticos detectados por el sistema de monitoreo.

2.  **Simulación de Red Automatizada (Scheduler):**
    *   Una tarea asíncrona en Spring Boot ejecuta de manera automática cada 30 segundos una comprobación de red ("ping" simulado) sobre todos los equipos registrados.
    *   Calcula latencias aleatorias y pérdidas de paquetes.
    *   Transiciona dinámicamente los estados de los equipos: **ACTIVO** (latencia <150ms), **FALLANDO** (latencia alta o degradación) u **OFFLINE** (pérdida total de conexión / timeout).

3.  **Historial de Logs e Incidencias:**
    *   El sistema escribe un registro histórico en la base de datos cada vez que un dispositivo cambia su estado de salud de red (ej. de *Activo* a *Offline*), almacenando la fecha, hora, tipo de evento, estado anterior/nuevo y el diagnóstico del ping.

4.  **Gestión de Inventario (CRUD de Clientes y Equipos):**
    *   **Clientes:** Registro completo de abonados con validación de datos.
    *   **Equipos:** Inventario de dispositivos con MAC Address y Serial únicos obligatorios. Permite asociar cada equipo a un cliente (instalado en domicilio) o dejarlo "En bodega/Stock".
    *   **Ping Manual:** Posibilidad de gatillar en cualquier momento un diagnóstico instantáneo sobre cualquier equipo desde la tabla de visualización con feedback visual de carga.

5.  **API Autodocumentada con Swagger UI:**
    *   El backend expone y documenta automáticamente todos los endpoints de su API REST en una interfaz web interactiva para pruebas rápidas.

---

## 🛠️ ¿Qué tecnologías tiene? (Arquitectura Técnica)

### Backend (Capas Lógicas y Robustez)
*   **Java 21 & Spring Boot 3.3.0:** Core del backend para alta concurrencia.
*   **Spring Data JPA & Hibernate:** Mapeo objeto-relacional y persistencia automatizada.
*   **Spring Task Scheduling:** Motor encargado del ciclo automático del simulador de red.
*   **Springdoc OpenAPI v2 (Swagger UI):** Generación automática de documentación interactiva de la API.
*   **Lógica de Prevención de Ciclos JSON:** Configurada mediante anotaciones de Jackson `@JsonIgnoreProperties` para evitar bucles de recursividad infinita en relaciones bidireccionales de base de datos.

### Base de Datos
*   **PostgreSQL:** Base de datos relacional para garantizar consistencia transaccional e integridad referencial de los datos históricos de red.

### Frontend (Moderno y Ultra Rápido)
*   **React 18 & TypeScript:** Estructura de componentes tipada y robusta.
*   **Vite:** Herramienta de compilación ultra rápida.
*   **Recharts:** Librería de visualización interactiva de gráficos.
*   **Lucide React:** Iconografía minimalista.
*   **NOC Dark Theme (Vanilla CSS):** Tema oscuro de alto contraste diseñado bajo la filosofía *Modern Flat Design* (sin sombras pesadas, centrado en tipografía monoespaciada *Fira Code* y LEDs semánticos parpadeantes para representar la salud del hardware).

---

## 📊 Modelo de Datos (Entidades Principales)

*   **Cliente:** Mapea los suscriptores (`nombre`, `email` único, `telefono`, `direccion`). Posee relaciones 1-a-muchos con sus servicios contratados y equipos en comodato.
*   **Servicio:** Mapea el contrato comercial (`tipo: INTERNET/TV/TELEFONIA`, `estado: ACTIVO/SUSPENDIDO/CANCELADO`, `velocidad_contratada`, `velocidad_actual`).
*   **Equipo:** Mapea el hardware físico (`tipo: ROUTER/ONT/DECODER/MODEM`, `modelo`, `serial` único, `macAddress` única, `estado: ACTIVO/FALLANDO/OFFLINE/REPARACION`, `ultimo_chequeo`).
*   **LogMonitoreo:** Mapea la bitácora de red (`fecha_hora`, `tipo_evento: PING_TIMEOUT/ALTO_PING/RECUPERACION/REINICIO`, `estado_anterior`, `estado_nuevo`, `detalles`).

---

## 🚀 Instrucciones para Levantar el Proyecto

### Requisitos Previos
*   Java JDK 17 o 21 instalado.
*   Node.js v18 o superior.
*   PostgreSQL activo localmente.

### 1. Preparar la Base de Datos
Crea una base de datos vacía en PostgreSQL mediante pgAdmin o consola llamada:
```sql
CREATE DATABASE advanced_monitor;
```

### 2. Levantar el Backend (Spring Boot)
1. Abre el proyecto en tu IDE (Eclipse o IntelliJ IDEA) como un proyecto Maven existente.
2. Asegúrate de configurar tus credenciales de PostgreSQL en `src/main/resources/application.yml`.
3. Ejecuta la clase `AdvancedMonitorApplication.java`.
4. El backend se iniciará en el puerto `8080`.
5. Abre la documentación interactiva en:
   👉 [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

### 3. Levantar el Frontend (React)
1. Abre una terminal y navega a la carpeta:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre tu navegador en:
   👉 [http://localhost:5173/](http://localhost:5173/)
