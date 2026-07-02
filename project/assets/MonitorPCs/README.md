# 🖥️ MonitorPCs: Sistema de Monitoreo de Hardware Escolar

Este proyecto es una solución autónoma, liviana y en tiempo real diseñada para el monitoreo de hardware e integridad física de las computadoras en los laboratorios de informática de la **E.E.S.T. N°2**. 

Permite a los directivos y encargados de soporte técnico visualizar el estado operativo de los equipos y detectar inmediatamente problemas como la desconexión de teclados o ratones, saturación de recursos (CPU/RAM) y espacio crítico en disco.

---

## 🏗️ Arquitectura del Sistema

El sistema es híbrido y está estructurado en tres componentes principales:

1. **Agente Cliente (`agent/`):** Script ligero escrito en Python que se ejecuta en segundo plano en cada PC cliente. Utiliza la librería `psutil` y consultas CIM nativas de Windows PowerShell para leer el estado del hardware y periféricos, enviándolos vía HTTP POST JSON.
2. **Backend API (`backend/`):** API REST moderna construida con **FastAPI** y base de datos local **SQLite**. Recibe la telemetría, actualiza el estado de los equipos en la base de datos y sirve los archivos de la interfaz gráfica.
3. **Frontend Dashboard (`frontend/`):** Interfaz web interactiva del tipo SPA (Single Page Application) que se actualiza automáticamente cada 5 segundos mediante peticiones asíncronas para mostrar una cuadrícula interactiva de las aulas.

---

## 🚀 Instalación y Despliegue Local

### 1. Clonar el repositorio y configurar dependencias
Asegúrate de tener instalado Python 3.8+. Instala las dependencias necesarias en la raíz del proyecto:

```bash
py -m pip install -r requirements.txt
```

### 2. Iniciar el Servidor Backend (API + Dashboard)
Entra a la carpeta del backend y ejecuta el servidor FastAPI mediante Uvicorn:

```bash
cd backend
py -m uvicorn main:app --reload
```

* El servidor API y el Dashboard estarán disponibles en: **`http://localhost:8000`**
* La documentación interactiva autogenerada de la API (Swagger UI) estará disponible en: **`http://localhost:8000/docs`**

### 3. Iniciar el Agente Cliente en las Computadoras
En cada PC que desees monitorear, inicia el agente local:

```bash
cd agent
py agent.py
```

* *Nota:* En entornos de desarrollo que no sean Windows, el agente simulará que el teclado y mouse están conectados para permitir pruebas de flujo rápidas. En Windows, utilizará comandos nativos de PowerShell para comprobar si están conectados físicamente.

---

## 🎨 Características Destacadas

* **Detección Física de Periféricos:** Chequeo directo mediante consultas a `Win32_Keyboard` y `Win32_PointingDevice` para alertar si un alumno desconectó el teclado o mouse de la PC.
* **Alertas Visuales Inteligentes:** Grilla interactiva donde las PCs en línea se muestran en verde, las PCs con algún periférico faltante o sobrecarga de recursos (CPU/RAM > 85%) en amarillo, y las PCs desconectadas en rojo.
* **Asignación Dinámica:** Panel para asignar dinámicamente un nombre de Aula (ej: "Laboratorio de Programación") y número de puesto físico a cada PC desde el propio panel web.
* **Bucle Altamente Optimizado:** El agente utiliza un consumo de CPU prácticamente nulo ($< 0.1\%$) y realiza lecturas asíncronas para no interferir con las tareas del alumno.
