/* Main Script for Iván Ismael Cardozo's Technical Portfolio */

document.addEventListener("DOMContentLoaded", () => {
    initLiveClock();
    initCanvasParticles();
    initSandbox();
    initSecurityConsole();
    initJsonViewer();
    initContactForm();
    initProjectsSection();
    initModals();
    initScrollReveal();
});

/* ==========================================
   Live HUD Clock
   ========================================== */
function initLiveClock() {
    const clockEl = document.getElementById("live-clock");
    if (!clockEl) return;
    
    function updateClock() {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        clockEl.textContent = `${hrs}:${mins}:${secs}`;
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

/* ==========================================
   Interactive Canvas Particle Mesh
   ========================================== */
/* ==========================================
   Interactive Canvas Particle Mesh & Text
   ========================================== */
class Particle {
    constructor() {
        this.pos = { x: 0, y: 0 };
        this.vel = { x: 0, y: 0 };
        this.acc = { x: 0, y: 0 };
        this.target = { x: 0, y: 0 };

        this.closeEnoughTarget = 80;
        this.maxSpeed = 6.0;
        this.maxForce = 0.3;
        this.particleSize = 6;
        this.isKilled = false;

        this.startColor = { r: 0, g: 0, b: 0 };
        this.targetColor = { r: 0, g: 0, b: 0 };
        this.colorWeight = 0;
        this.colorBlendRate = 0.01;
    }

    move() {
        let proximityMult = 1;
        const distance = Math.sqrt(Math.pow(this.pos.x - this.target.x, 2) + Math.pow(this.pos.y - this.target.y, 2));

        if (distance < this.closeEnoughTarget) {
            proximityMult = distance / this.closeEnoughTarget;
        }

        const towardsTarget = {
            x: this.target.x - this.pos.x,
            y: this.target.y - this.pos.y,
        };

        const magnitude = Math.sqrt(towardsTarget.x * towardsTarget.x + towardsTarget.y * towardsTarget.y);
        if (magnitude > 0) {
            towardsTarget.x = (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult;
            towardsTarget.y = (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult;
        }

        const steer = {
            x: towardsTarget.x - this.vel.x,
            y: towardsTarget.y - this.vel.y,
        };

        const steerMagnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
        if (steerMagnitude > 0) {
            steer.x = (steer.x / steerMagnitude) * this.maxForce;
            steer.y = (steer.y / steerMagnitude) * this.maxForce;
        }

        this.acc.x += steer.x;
        this.acc.y += steer.y;

        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.acc.x = 0;
        this.acc.y = 0;
    }

    draw(ctx, drawAsPoints) {
        if (this.colorWeight < 1.0) {
            this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0);
        }

        const currentColor = {
            r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
            g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
            b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight),
        };

        if (drawAsPoints) {
            ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
            ctx.fillRect(this.pos.x, this.pos.y, 2, 2);
        } else {
            ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    kill(width, height) {
        if (!this.isKilled) {
            const randomPos = this.generateRandomPos(width / 2, height / 2, (width + height) / 2);
            this.target.x = randomPos.x;
            this.target.y = randomPos.y;

            this.startColor = {
                r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
                g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
                b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight,
            };
            this.targetColor = { r: 0, g: 0, b: 0 };
            this.colorWeight = 0;

            this.isKilled = true;
        }
    }

    generateRandomPos(x, y, mag) {
        const randomX = Math.random() * 1200;
        const randomY = Math.random() * 600;

        const direction = {
            x: randomX - x,
            y: randomY - y,
        };

        const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        if (magnitude > 0) {
            direction.x = (direction.x / magnitude) * mag;
            direction.y = (direction.y / magnitude) * mag;
        }

        return {
            x: x + direction.x,
            y: y + direction.y,
        };
    }
}

function initCanvasParticles() {
    const canvas = document.getElementById("canvas-mesh");
    if (!canvas) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
        canvas.style.display = "none";
        return;
    }

    const ctx = canvas.getContext("2d");
    const particles = [];
    let animationFrameId;
    let frameCount = 0;
    let wordIndex = 0;
    
    const words = ["IVÁN CARDOZO", "PROGRAMADOR", "SOLID & OOP", "CONEXIÓN SEGURA", "E.E.S.T. N°2"];
    const themeColors = [
        { r: 255, g: 87, b: 34 },    // Vibrant Cyber Orange
        { r: 255, g: 171, b: 0 },    // Electric Amber
        { r: 255, g: 61, b: 0 },     // Neon Red-Orange
        { r: 255, g: 255, b: 255 }   // Pure White
    ];

    const pixelSteps = 6;
    const drawAsPoints = true;

    const mouse = { x: 0, y: 0, isPressed: false, isRightClick: false };

    function resizeCanvas() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        // Reinitialize word mapping on window resize to reposition centered text
        nextWord(words[wordIndex]);
    }

    window.addEventListener("resize", resizeCanvas);

    const generateRandomPos = (x, y, mag) => {
        const randomX = Math.random() * canvas.width;
        const randomY = Math.random() * canvas.height;

        const direction = {
            x: randomX - x,
            y: randomY - y,
        };

        const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        if (magnitude > 0) {
            direction.x = (direction.x / magnitude) * mag;
            direction.y = (direction.y / magnitude) * mag;
        }

        return {
            x: x + direction.x,
            y: y + direction.y,
        };
    };

    const nextWord = (word) => {
        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
        const offscreenCtx = offscreenCanvas.getContext("2d");

        // Calculate responsive font size capped at 100px
        const fontSize = Math.min(canvas.width * 0.08, 90);

        offscreenCtx.fillStyle = "white";
        offscreenCtx.font = `bold ${fontSize}px Space Grotesk`;
        offscreenCtx.textAlign = "center";
        offscreenCtx.textBaseline = "middle";
        offscreenCtx.fillText(word, canvas.width / 2, canvas.height / 2);

        const imageData = offscreenCtx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Choose color from curated system theme cycles
        const newColor = themeColors[wordIndex % themeColors.length];

        let particleIndex = 0;
        const coordsIndexes = [];

        for (let i = 0; i < pixels.length; i += pixelSteps * 4) {
            coordsIndexes.push(i);
        }

        // Shuffle coordinates for organic entry effects
        for (let i = coordsIndexes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [coordsIndexes[i], coordsIndexes[j]] = [coordsIndexes[j], coordsIndexes[i]];
        }

        for (const coordIndex of coordsIndexes) {
            const pixelIndex = coordIndex;
            const alpha = pixels[pixelIndex + 3];

            if (alpha > 0) {
                const x = (pixelIndex / 4) % canvas.width;
                const y = Math.floor(pixelIndex / 4 / canvas.width);

                let particle;

                if (particleIndex < particles.length) {
                    particle = particles[particleIndex];
                    particle.isKilled = false;
                    particleIndex++;
                } else {
                    particle = new Particle();

                    const randomPos = generateRandomPos(canvas.width / 2, canvas.height / 2, (canvas.width + canvas.height) / 2);
                    particle.pos.x = randomPos.x;
                    particle.pos.y = randomPos.y;

                    particle.maxSpeed = Math.random() * 6 + 4;
                    particle.maxForce = particle.maxSpeed * 0.05;
                    particle.particleSize = Math.random() * 6 + 6;
                    particle.colorBlendRate = Math.random() * 0.0275 + 0.0025;

                    particles.push(particle);
                }

                // Smooth color transition
                particle.startColor = {
                    r: particle.startColor.r + (particle.targetColor.r - particle.startColor.r) * particle.colorWeight,
                    g: particle.startColor.g + (particle.targetColor.g - particle.startColor.g) * particle.colorWeight,
                    b: particle.startColor.b + (particle.targetColor.b - particle.startColor.b) * particle.colorWeight,
                };
                particle.targetColor = newColor;
                particle.colorWeight = 0;

                particle.target.x = x;
                particle.target.y = y;
            }
        }

        // Kill off excess particles
        for (let i = particleIndex; i < particles.length; i++) {
            particles[i].kill(canvas.width, canvas.height);
        }
    };

    const animate = () => {
        // Clear background with subtle motion trail
        ctx.fillStyle = "rgba(255, 252, 249, 0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update & Render active particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.move();
            particle.draw(ctx, drawAsPoints);

            // Remove particles that completed kill animations out of boundaries
            if (particle.isKilled) {
                if (
                    particle.pos.x < 0 ||
                    particle.pos.x > canvas.width ||
                    particle.pos.y < 0 ||
                    particle.pos.y > canvas.height
                ) {
                    particles.splice(i, 1);
                }
            }
        }

        // Handle right-click erase destruction interaction
        if (mouse.isPressed && mouse.isRightClick) {
            particles.forEach((particle) => {
                const distance = Math.sqrt(
                    Math.pow(particle.pos.x - mouse.x, 2) + Math.pow(particle.pos.y - mouse.y, 2)
                );
                if (distance < 50) {
                    particle.kill(canvas.width, canvas.height);
                }
            });
        }

        // Change text values every 4 seconds (240 frames @ 60fps)
        frameCount++;
        if (frameCount % 240 === 0) {
            wordIndex = (wordIndex + 1) % words.length;
            nextWord(words[wordIndex]);
        }

        animationFrameId = requestAnimationFrame(animate);
    };

    // Initialize dimensions and trigger first loop
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
    nextWord(words[0]);
    animate();

    // Attach listeners on mouse canvas interaction
    const updateMousePos = (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    };

    canvas.addEventListener("mousedown", (e) => {
        mouse.isPressed = true;
        mouse.isRightClick = e.button === 2 || e.ctrlKey; // support ctrl+click for systems without right click
        updateMousePos(e);
    });

    window.addEventListener("mouseup", () => {
        mouse.isPressed = false;
        mouse.isRightClick = false;
    });

    canvas.addEventListener("mousemove", updateMousePos);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
}

/* ==========================================
   Clean Architecture Interactive Sandbox
   ========================================== */
const mockLayerDetails = {
    presentation: {
        title: "capa_de_presentacion.sys",
        lang: "L1 // CONTROLADORES Y SEGURIDAD",
        code: `
            <div class="layer-details-card">
                <h3>Capa de Presentación (Interfaz de Usuario)</h3>
                <p>Es la primera línea de contacto con el visitante. Se encarga de mostrar la información en pantalla y recibir las interacciones de forma amigable.</p>
                <ul class="layer-details-benefits">
                    <li><strong>Beneficio Directo:</strong> Garantiza que la web funcione de forma rápida y se adapte automáticamente a teléfonos móviles, tablets y computadoras de escritorio.</li>
                    <li><strong>Protección Activa:</strong> Limpia todo lo que el usuario escribe en los formularios, bloqueando intentos de ataques maliciosos (XSS) y asegurando que las sesiones activas no puedan ser robadas.</li>
                </ul>
            </div>
        `
    },
    business: {
        title: "capa_de_negocio.sys",
        lang: "L2 // REGLAS Y PROCESOS",
        code: `
            <div class="layer-details-card">
                <h3>Capa de Negocio (Reglas de Funcionamiento)</h3>
                <p>Representa el "cerebro" del sistema, donde se aplican las reglas, fórmulas y lógica específicas del software administrativo escolar.</p>
                <ul class="layer-details-benefits">
                    <li><strong>Beneficio Directo:</strong> Automatiza la evaluación y cálculos de inasistencias acumuladas en base al reglamento escolar oficial, eliminando errores de contabilidad manual.</li>
                    <li><strong>Protección Activa:</strong> Restringe los accesos según permisos detallados (ej. los preceptores solo cargan faltas, los directivos ven reportes generales, los alumnos no acceden).</li>
                </ul>
            </div>
        `
    },
    persistence: {
        title: "capa_de_persistencia.sys",
        lang: "L3 // TRANSACCIONES Y MAPEO",
        code: `
            <div class="layer-details-card">
                <h3>Capa de Persistencia (Mapeador de Datos)</h3>
                <p>Sirve como puente de comunicación blindado entre las reglas lógicas del cerebro del sistema y la base de datos física.</p>
                <ul class="layer-details-benefits">
                    <li><strong>Beneficio Directo:</strong> Empaqueta la información de forma estructurada para que la base de datos se mantenga organizada y responda con la máxima velocidad.</li>
                    <li><strong>Protección Activa:</strong> Agrupa las operaciones críticas en transacciones aisladas. Si hay una falla de conexión en medio de un registro, el sistema deshace los cambios evitando que se corrompa la información.</li>
                </ul>
            </div>
        `
    },
    data: {
        title: "capa_de_datos.sys",
        lang: "L4 // BASE DE DATOS PROTEGIDA",
        code: `
            <div class="layer-details-card">
                <h3>Capa de Datos (Base de Datos MySQL)</h3>
                <p>El almacén permanente donde se resguarda el historial académico, notas, boletines y usuarios de toda la institución.</p>
                <ul class="layer-details-benefits">
                    <li><strong>Beneficio Directo:</strong> Ofrece consistencia e integridad referencial, asegurando que cada nota pertenezca exactamente a su respectivo alumno de por vida.</li>
                    <li><strong>Protección Activa:</strong> Utiliza consultas preparadas nativas blindadas contra inyecciones SQL (la vulnerabilidad más común de robo de datos en internet), denegando accesos no autorizados.</li>
                </ul>
            </div>
        `
    }
};

function initSandbox() {
    const layerButtons = document.querySelectorAll(".layer-btn");
    const fileTitleEl = document.getElementById("code-file-title");
    const codeContentEl = document.getElementById("code-content");
    const btnRunSim = document.getElementById("btn-run-simulation");
    const btnClearTerminal = document.getElementById("btn-clear-terminal");
    const terminalOutput = document.getElementById("terminal-log-output");
    const simStatusEl = document.getElementById("simulation-status");
    
    if (!layerButtons || !fileTitleEl || !codeContentEl) return;
    
    // Load initial code viewer selection
    updateCodeViewer("presentation");
    
    layerButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active class
            layerButtons.forEach(b => b.classList.remove("active"));
            
            // Add active class
            btn.classList.add("active");
            
            const layer = btn.getAttribute("data-layer");
            updateCodeViewer(layer);
            
            // Highlight diagram steps matching selection
            updateDiagramBar(layer);
        });
    });
    
    function updateCodeViewer(layer) {
        const data = mockLayerDetails[layer];
        fileTitleEl.textContent = data.title;
        const fileLangEl = document.getElementById("code-file-lang");
        if (fileLangEl) fileLangEl.textContent = data.lang;
        codeContentEl.innerHTML = data.code;
    }
    
    function updateDiagramBar(activeLayer) {
        const steps = document.querySelectorAll(".diagram-step");
        steps.forEach(step => {
            const stepId = step.id;
            step.classList.remove("active");
            if (
                (activeLayer === "presentation" && stepId === "diagram-l1") ||
                (activeLayer === "business" && stepId === "diagram-l2") ||
                (activeLayer === "persistence" && stepId === "diagram-l3") ||
                (activeLayer === "data" && stepId === "diagram-l4")
            ) {
                step.classList.add("active");
            }
        });
    }
    
    // Simulation Logic
    let isSimulating = false;
    
    btnRunSim.addEventListener("click", () => {
        if (isSimulating) return;
        runRequestSimulation();
    });
    
    btnClearTerminal.addEventListener("click", () => {
        terminalOutput.innerHTML = `<p class="log-line output"><span class="text-cyan">></span> Consola limpia. Esperando simulación...</p>`;
    });
    
    function printTerminalLine(text, type = "output") {
        const line = document.createElement("p");
        line.className = `log-line ${type}`;
        
        const now = new Date();
        const timeStr = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
        
        line.innerHTML = `<span class="log-timestamp">${timeStr}</span> ${text}`;
        terminalOutput.appendChild(line);
        
        // Scroll to bottom
        terminalOutput.parentElement.scrollTop = terminalOutput.parentElement.scrollHeight;
    }
    
    function setSimStatus(text, dotClass = "") {
        simStatusEl.textContent = text;
        const dot = simStatusEl.previousElementSibling;
        dot.className = "status-dot";
        if (dotClass) {
            dot.classList.add(dotClass);
        }
    }
    
    function setDiagramStepStatus(stepNum, statusClass) {
        const step = document.getElementById(`diagram-l${stepNum}`);
        if (!step) return;
        step.className = `diagram-step active ${statusClass}`;
    }
    
    function resetDiagramStepClasses() {
        for (let i = 1; i <= 4; i++) {
            const step = document.getElementById(`diagram-l${i}`);
            if (step) step.className = `diagram-step`;
        }
        // Restore active L1 by default
        const activeBtn = document.querySelector(".layer-btn.active");
        if (activeBtn) {
            const layer = activeBtn.getAttribute("data-layer");
            updateDiagramBar(layer);
        }
    }
    
    function runRequestSimulation() {
        isSimulating = true;
        btnRunSim.disabled = true;
        setSimStatus("PROCESSING", "running");
        resetDiagramStepClasses();
        
        // Clean start
        terminalOutput.innerHTML = "";
        printTerminalLine("<span class='text-cyan'>[INIT]</span> Lanzando simulación de Asistencia (POST /asistencia)...", "sim-trace");
        
        setTimeout(() => {
            // STEP 1: Presentation Layer
            setDiagramStepStatus(1, "running");
            printTerminalLine("<span class='log-tag'>[L1 Presentation]</span> Petición HTTP recibida en Controller. payload: <span class='text-amber'>{ alumno_id: 42, tipo: 'tardanza' }</span>", "sim-trace");
            
            setTimeout(() => {
                printTerminalLine("<span class='log-tag'>[L1 Presentation]</span> Middleware: Validando token CSRF criptográfico... <span class='text-green'>[VERIFICADO]</span>", "sim-trace");
                printTerminalLine("<span class='log-tag'>[L1 Presentation]</span> Middleware: Validando firmas de sesión (IP y UserAgent coinciden)... <span class='text-green'>[SEGURO]</span>", "sim-trace");
                printTerminalLine("<span class='log-tag'>[L1 Presentation]</span> Middleware: Sanitizando inyección de entrada XSS... <span class='text-green'>[COMPLETO]</span>", "sim-trace");
                setDiagramStepStatus(1, "success");
                
                setTimeout(() => {
                    // STEP 2: Business Layer
                    setDiagramStepStatus(2, "running");
                    printTerminalLine("<span class='log-tag'>[L2 Business]</span> Invocando ServicioAsistencia::registrarAsistencia()...", "sim-trace");
                    
                    setTimeout(() => {
                        printTerminalLine("<span class='log-tag'>[L2 Business]</span> Regla Académica: Evaluando tardanza (+0.25 inasistencia)...", "sim-trace");
                        printTerminalLine("<span class='log-tag'>[L2 Business]</span> Regla Académica: Asistencia acumulada de alumno #42: 84.5%... <span class='text-green'>[DENTRO DEL LIMITE 75%]</span>", "sim-trace");
                        setDiagramStepStatus(2, "success");
                        
                        setTimeout(() => {
                            // STEP 3: Persistence Layer
                            setDiagramStepStatus(3, "running");
                            printTerminalLine("<span class='log-tag'>[L3 Persistence]</span> Iniciando transacción SQL en EstudianteMapper::save()...", "sim-trace");
                            
                            setTimeout(() => {
                                printTerminalLine("<span class='log-tag'>[L3 Persistence]</span> Mapeando objeto Entidad 'Asistencia' a consultas relacionales...", "sim-trace");
                                setDiagramStepStatus(3, "success");
                                
                                setTimeout(() => {
                                    // STEP 4: Data Layer
                                    setDiagramStepStatus(4, "running");
                                    printTerminalLine("<span class='log-tag'>[L4 Data]</span> PdoDatabase: Enviando query parametrizada nativa con PDO.", "sim-trace");
                                    printTerminalLine("<span class='log-tag'>[L4 Data]</span> MySQL: <span class='text-muted'>INSERT INTO asistencia (alumno_id, valor, fecha) VALUES (?, ?, NOW())</span>", "sim-trace");
                                    
                                    setTimeout(() => {
                                        printTerminalLine("<span class='log-tag'>[L4 Data]</span> PdoDatabase: PDO::ATTR_EMULATE_PREPARES es falso. Ejecución directa en motor.", "sim-trace");
                                        printTerminalLine("<span class='log-tag'>[L4 Data]</span> MySQL: Fila insertada exitosamente. ID generado: #5013", "sim-trace");
                                        setDiagramStepStatus(4, "success");
                                        
                                        setTimeout(() => {
                                            // FINAL SUCCESS
                                            printTerminalLine("<span class='text-green'>[OK] Transacción de base de datos exitosa. Commit realizado.</span>", "sim-check");
                                            printTerminalLine("<span class='text-cyan'>[SYS_COMPLETED] Resupesta HTTP: 201 Created. Proceso completado en 320ms.</span>", "sim-trace");
                                            setSimStatus("SUCCESS", "success");
                                            isSimulating = false;
                                            btnRunSim.disabled = false;
                                        }, 400);
                                    }, 400);
                                }, 500);
                            }, 500);
                        }, 500);
                    }, 500);
                }, 500);
            }, 600);
        }, 400);
    }
}

/* ==========================================
   21 Protections Console & Details Modal
   ========================================== */
const securityProtections = [
    { id: "P-01", title: "Prevención SQLi", layer: "L4 Data Layer", cat: "injection", owasp: "A03:2021-Injection", desc: "Uso de consultas preparadas nativas en el adaptador PDO con desactivación de la emulación de prepares (PDO::ATTR_EMULATE_PREPARES => false), asegurando que los comandos SQL y las cargas de datos estén separados de forma estricta a nivel del motor de base de datos.", files: ["src/Database/PdoDatabase.php"] },
    { id: "P-02", title: "Defensa Cross-Site Scripting (XSS)", layer: "L1 Presentation Layer", cat: "injection", owasp: "A03:2021-Injection", desc: "Sanitización exhaustiva de entradas y sanitización de salidas dinámicas utilizando codificación de entidades HTML (htmlspecialchars con flags estricto ENT_QUOTES | ENT_HTML5 y codificación en UTF-8) en todo el renderizado de plantillas.", files: ["src/middleware/SecurizarEntrada.php"] },
    { id: "P-03", title: "Protección CSRF en Formularios", layer: "L1 Presentation Layer", cat: "session", owasp: "A01:2021-Broken Access Control", desc: "Validación estricta de tokens criptográficos temporales en el lado del servidor para todas las peticiones POST y solicitudes asíncronas AJAX, previniendo falsificación de peticiones en sitios cruzados.", files: ["src/services/ValidationService.php"] },
    { id: "P-04", title: "Mitigación de Secuestro de Sesión", layer: "L1 Presentation Layer", cat: "session", owasp: "A07:2021-Identification & Auth Failures", desc: "Middleware de seguridad de sesión que valida de forma continua la dirección IP de origen y el agente de usuario (User Agent) del cliente para detectar anomalías y destruir sesiones de inmediato si hay discrepancias.", files: ["src/middleware/SecurizarEntrada.php"] },
    { id: "P-05", title: "Validación de Subidas de Archivos", layer: "L1 Presentation Layer", cat: "infrastructure", owasp: "A03:2021-Injection", desc: "Inspección de la firma interna real del archivo cargado (MIME type derivado con finfo en PHP) contra una whitelist estricta de formatos permitidos, impidiendo ataques de ejecución remota de código (RCE).", files: ["src/middleware/UploadSecurityMiddleware.php"] },
    { id: "P-06", title: "Resguardo de Contraseñas (Argon2id)", layer: "L4 Data Layer", cat: "session", owasp: "A07:2021-Identification & Auth Failures", desc: "Utilización del algoritmo Argon2id para el almacenamiento seguro de credenciales con alto costo computacional y de memoria, protegiendo las contraseñas contra ataques de diccionario y hardware especializado.", files: ["src/services/AuthService.php"] },
    { id: "P-07", title: "Doble Factor de Autenticación (MFA)", layer: "L1 Presentation Layer", cat: "session", owasp: "A07:2021-Identification & Auth Failures", desc: "Implementación opcional de segundo factor de seguridad basado en contraseñas de un solo uso en tiempo real (TOTP) compatibles con Google Authenticator.", files: ["src/services/MfaService.php"] },
    { id: "P-08", title: "Control de Acceso Basado en Roles (RBAC)", layer: "L1 Presentation Layer", cat: "session", owasp: "A01:2021-Broken Access Control", desc: "Sistema dinámico en base de datos para mapear permisos granulares específicos a roles asignados, verificados en los controladores mediante directivas can('permission_slug').", files: ["src/services/PermissionService.php", "src/middleware/RbacMiddleware.php"] },
    { id: "P-09", title: "Backups con Token HMAC", layer: "L4 Data Layer", cat: "infrastructure", owasp: "A05:2021-Security Misconfiguration", desc: "Copia de seguridad y restauración del sistema protegida mediante tokens hash de autenticación HMAC generados con llave secreta del servidor, previniendo descargas no autorizadas de backups.", files: ["src/services/BackupService.php"] },
    { id: "P-10", title: "Prevención de Session Fixation", layer: "L1 Presentation Layer", cat: "session", owasp: "A07:2021-Identification & Auth Failures", desc: "Regeneración obligatoria del identificador de sesión PHP (session_regenerate_id(true)) justo en el momento del login del usuario para anular tokens de sesión preestablecidos.", files: ["src/services/AuthService.php"] },
    { id: "P-11", title: "Headers de Seguridad (HTTP)", layer: "L1 Presentation Layer", cat: "infrastructure", owasp: "A05:2021-Security Misconfiguration", desc: "Configuración estricta de cabeceras HTTP: X-Frame-Options (DENY), X-Content-Type-Options (nosniff), X-XSS-Protection (1; mode=block), y HSTS para forzar canales HTTPS seguros.", files: ["src/middleware/SecurityHeadersMiddleware.php"] },
    { id: "P-12", title: "CSP con Nonce Dinámico", layer: "L1 Presentation Layer", cat: "infrastructure", owasp: "A05:2021-Security Misconfiguration", desc: "Content Security Policy que bloquea inyecciones de scripts remotos limitando los orígenes permitidos solo a recursos locales y requiriendo firmas nonce generadas en cada petición.", files: ["src/middleware/SecurityHeadersMiddleware.php"] },
    { id: "P-13", title: "Prevención de Inyección XXE", layer: "L3 Persistence Layer", cat: "injection", owasp: "A03:2021-Injection", desc: "Desactivación explícita de cargadores de entidades externas (libxml_disable_entity_loader(true)) durante el parsing de cargas XML en el sistema administrativo.", files: ["src/middleware/XmlSecurityMiddleware.php"] },
    { id: "P-14", title: "Mitigación de Vulnerabilidades SSRF", layer: "L1 Presentation Layer", cat: "injection", owasp: "A10:2021-Server-Side Request Forgery", desc: "Validación de URLs enviadas por clientes mediante una lista blanca estricta de hosts y puertos permitidos, y resolución DNS antes de la invocación del cliente HTTP.", files: ["src/middleware/SsrfSecurityMiddleware.php"] },
    { id: "P-15", title: "Protección contra HTTP Parameter Pollution", layer: "L1 Presentation Layer", cat: "injection", owasp: "A03:2021-Injection", desc: "Middleware que inspecciona cadenas de consulta HTTP complejas y previene colisiones o manipulaciones maliciosas de múltiples parámetros homónimos.", files: ["src/middleware/HppSecurityMiddleware.php"] },
    { id: "P-16", title: "Prevención de Timing Attacks", layer: "L2 Business Layer", cat: "session", owasp: "A07:2021-Identification & Auth Failures", desc: "Uso de comparaciones de cadenas seguras en tiempo constante (hash_equals()) para validar claves API y tokens de restablecimiento, previniendo ataques de canal lateral.", files: ["src/services/ValidationService.php"] },
    { id: "P-17", title: "Bloqueo de Open Redirects", layer: "L1 Presentation Layer", cat: "injection", owasp: "A03:2021-Injection", desc: "Validación estricta de los parámetros de redirección en controladores. Solo se permiten rutas relativas locales o dominios verificados en archivo de configuración.", files: ["src/middleware/RedirectSecurityMiddleware.php"] },
    { id: "P-18", title: "Auditoría Interna y Logging", layer: "L4 Data Layer", cat: "infrastructure", owasp: "A09:2021-Security Logging & Monitoring", desc: "Servicio de bitácora centralizada que registra eventos críticos de seguridad, fallos de inicio de sesión y auditoría de cambios en base de datos en ficheros protegidos.", files: ["src/services/AuditLogger.php"] },
    { id: "P-19", title: "Desactivación de Exposición PHP (Server)", layer: "L4 Data Layer", cat: "infrastructure", owasp: "A05:2021-Security Misconfiguration", desc: "Configuración defensiva del entorno de runtime (expose_php = Off y display_errors = Off) para evitar la filtración de tecnologías y versiones a atacantes externos.", files: ["config/production.php"] },
    { id: "P-20", title: "Directivas de Seguridad en Apache", layer: "L4 Data Layer", cat: "infrastructure", owasp: "A05:2021-Security Misconfiguration", desc: "Configuración en .htaccess con directivas 'Options -Indexes' para evitar lectura recursiva de directorios y bloqueos específicos a archivos de configuración .env y .sql.", files: [".htaccess"] },
    { id: "P-21", title: "Usuarios BD de Mínimos Privilegios", layer: "L4 Data Layer", cat: "infrastructure", owasp: "A01:2021-Broken Access Control", desc: "Aseguramiento del esquema aislando las operaciones del sistema administrativo para usar un rol MySQL limitado únicamente a SELECT, INSERT, UPDATE, DELETE.", files: ["database/sistema_completo.sql"] }
];

function initSecurityConsole() {
    const grid = document.getElementById("security-matrix");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const modal = document.getElementById("security-detail-modal");
    
    if (!grid || !filterBtns || !modal) return;
    
    // Initial Render of All Items
    renderMatrix("all");
    
    // Filter click handlers
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const filter = btn.getAttribute("data-filter");
            renderMatrix(filter);
        });
    });
    
    function renderMatrix(filter) {
        grid.innerHTML = "";
        
        const filtered = securityProtections.filter(p => {
            if (filter === "all") return true;
            return p.cat === filter;
        });
        
        filtered.forEach(p => {
            const card = document.createElement("button");
            card.className = "security-card-compact";
            card.setAttribute("data-id", p.id);
            
            card.innerHTML = `
                <div class="security-card-compact-left">
                    <span class="security-card-compact-idx monospace">${p.id}</span>
                    <span class="security-card-compact-title">${p.title}</span>
                </div>
                <span class="security-card-compact-tag monospace">${p.owasp.split(":")[0]}</span>
            `;
            
            card.addEventListener("click", () => openProtectionModal(p));
            grid.appendChild(card);
        });
    }
    
    // Modal Interaction
    const btnCloseModal = document.getElementById("btn-close-modal");
    
    btnCloseModal.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Close modal on escape key
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("open")) {
            closeModal();
        }
    });
    
    function openProtectionModal(p) {
        document.getElementById("modal-idx").textContent = p.id;
        document.getElementById("modal-title").textContent = p.title;
        document.getElementById("modal-layer").textContent = p.layer;
        document.getElementById("modal-owasp").textContent = p.owasp;
        document.getElementById("modal-desc").textContent = p.desc;
        
        const filesContainer = document.getElementById("modal-files");
        filesContainer.innerHTML = "";
        p.files.forEach(f => {
            const badge = document.createElement("span");
            badge.className = "code-ref-badge monospace";
            badge.textContent = f;
            filesContainer.appendChild(badge);
        });
        
        modal.classList.add("open");
        document.body.style.overflow = "hidden"; // disable scroll behind
    }
    
    function closeModal() {
        modal.classList.remove("open");
        document.body.style.overflow = ""; // restore scroll
    }
}

/* ==========================================
   Collapsible JSON Manifest Viewer
   ========================================== */
function initJsonViewer() {
    const nodes = document.querySelectorAll(".json-node");
    
    nodes.forEach(node => {
        node.addEventListener("click", (e) => {
            // Check if click was on the toggle or the main line, not the child elements
            if (e.target.closest(".json-collapsed-content")) return;
            
            node.classList.toggle("exploded");
            
            // Adjust height or layout if needed
        });
    });
    
    // Explode first node by default for user feedback
    const languageNode = document.getElementById("node-languages");
    if (languageNode) {
        setTimeout(() => {
            languageNode.classList.add("exploded");
        }, 800);
    }
}

/* ==========================================
   Contact Form & Simulated Decryption Response
   ========================================== */
function initContactForm() {
    const form = document.getElementById("secure-contact-form");
    const successScreen = document.getElementById("contact-success-screen");
    const btnReset = document.getElementById("btn-reset-form");
    const btnSend = document.getElementById("btn-send-message");
    
    if (!form || !successScreen || !btnReset) return;
    
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Disable submit button
        btnSend.disabled = true;
        const origText = btnSend.querySelector(".btn-text").textContent;
        btnSend.querySelector(".btn-text").textContent = "CIPHERING_PACKETS...";
        
        // Mock transmission time
        setTimeout(() => {
            // Show success screen overlay
            successScreen.classList.add("show");
            
            // Log message sent status in sandbox terminal too if user is debugging
            const terminalOutput = document.getElementById("terminal-log-output");
            if (terminalOutput) {
                const line = document.createElement("p");
                line.className = "log-line sim-alert";
                const now = new Date();
                const timeStr = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
                line.innerHTML = `<span class="log-timestamp">${timeStr}</span> <span class="text-amber">[HANDSHAKE] Recibida transmisión de contacto de: ${document.getElementById("contact-name").value}.</span>`;
                terminalOutput.appendChild(line);
            }
        }, 1200);
    });
    
    btnReset.addEventListener("click", () => {
        // Reset form inputs
        form.reset();
        
        // Hide success overlay
        successScreen.classList.remove("show");
        
        // Restore submit button
        btnSend.disabled = false;
        btnSend.querySelector(".btn-text").textContent = "TRANSMIT_MESSAGE (POST)";
    });
}

/* ==========================================
   Projects Section Registry & Inspector Lógica
   ========================================== */

const projectsData = [
    {
        id: "cuida_mdp",
        name: "CuidaMDP",
        fileName: "cuidamdp.sys",
        status: "RUNNING",
        statusText: "COMPLETED",
        stack: ["React", "Leaflet", "Supabase", "PostgreSQL", "Vanilla CSS"],
        desc: "Aplicación web interactiva de reporte ciudadano para Mar del Plata (Partido de General Pueyrredón). Permite a los vecinos geolocalizar y reportar problemas urbanos (baches, basura, luminarias rotas) de forma visual sobre un mapa interactivo. Cuenta con panel de administración moderado por Supabase Auth, triggers en PostgreSQL para prevención de spam, y carga dinámica de imágenes.",
        metrics: [
            "Autolocalización GPS (Geolocation API)",
            "Geocodificación Inversa (Nominatim API)",
            "Límite de spam por IP (Triggers en BD)",
            "Supabase Storage & Canales Realtime"
        ],
        challenge: "Prevenir el spam de reportes falsos y duplicados manteniendo una experiencia fluida y rápida en dispositivos móviles.",
        solution: "Se programó un límite en PostgreSQL que restringe la creación a un máximo de 3 reportes por 24 horas por dirección IP. Si se sobrepasa, un disparador BEFORE INSERT aborta la transacción devolviendo un error controlado al cliente, complementado con el panel de moderación municipal protegido por Supabase Auth.",
        images: ["project/assets/CuidaMDP/DarkMode.png", "project/assets/CuidaMDP/LightMode.png"],
        liveUrl: "https://github.com/IvanCR48/CuidaMDP",
        repoUrl: "https://github.com/IvanCR48/CuidaMDP"
    },
    {
        id: "rathon_ware",
        name: "RathonWare",
        fileName: "rathon_ware.exe",
        status: "RUNNING",
        statusText: "COMPLETED",
        stack: ["C++20", "Qt 6 (QML)", "Windows API", "NVML Driver API"],
        desc: "Suite de administración de tareas y diagnóstico de rendimiento para Windows. Proporciona visualización en tiempo real de la carga de CPU, RAM, GPU y temperaturas mediante gráficos QML animados por hardware y listado interactivo de procesos activos con capacidad de finalización forzada.",
        metrics: [
            "Telemetría en tiempo real (<100ms)",
            "Consumo de CPU extremadamente bajo (<1%)",
            "Mapeo de memoria por proceso (QML List)",
            "Integración nativa con Windows APIs"
        ],
        challenge: "Obtener lecturas precisas de hardware gráfico dedicada de NVIDIA (temperaturas y VRAM) sin obligar a los usuarios a instalar el SDK pesado de CUDA o romper la compatibilidad en sistemas con gráficos integrados Intel/AMD.",
        solution: "Se implementó la carga dinámica de librerías mediante las funciones de Windows API LoadLibrary y GetProcAddress para la DLL del controlador oficial de NVIDIA (nvml.dll). Si la DLL no está presente en la computadora del usuario, el sistema realiza un fallback graceful omitiendo las lecturas sin bloquear el hilo principal.",
        images: [
            "project/assets/RathonWare/One.png",
            "project/assets/RathonWare/Twwo.png",
            "project/assets/RathonWare/Three.png",
            "project/assets/RathonWare/Four.png"
        ],
        liveUrl: "https://github.com/IvanCR48/RathonWare/releases",
        repoUrl: "https://github.com/IvanCR48/RathonWare"
    },
    {
        id: "monitor_pcs",
        name: "MonitorPCs",
        fileName: "monitor_pcs.py",
        status: "RUNNING",
        statusText: "COMPLETED",
        stack: ["Python", "FastAPI", "SQLite", "psutil", "PowerShell", "React"],
        desc: "Sistema autónomo y liviano diseñado para monitorizar el estado del hardware en tiempo real en los laboratorios de informática de la E.E.S.T. N°2. Alerta de forma visual si algún periférico (mouse/teclado) es desconectado por alumnos y reporta sobrecargas críticas de recursos.",
        metrics: [
            "Monitoreo asíncrono (FastAPI backend)",
            "Consumo del agente Python <0.1% CPU",
            "PowerShell WMI/CIM query binding",
            "Bucle de actualización automatizado (5s)"
        ],
        challenge: "Detectar si un teclado o ratón ha sido físicamente desconectado del puerto USB de la computadora desde un script en segundo plano en Windows sin causar sobrecarga de CPU.",
        solution: "Se estructuró el agente con psutil para métricas de sistema y consultas asíncronas CIM nativas a través de PowerShell ('Win32_Keyboard' y 'Win32_PointingDevice') para verificar el enlace de hardware, enviando la telemetría en formato JSON a la API REST del backend FastAPI en intervalos de 5 segundos.",
        images: ["project/assets/MonitorPCs/Main.png", "project/assets/MonitorPCs/Pc.png"],
        liveUrl: "https://github.com/IvanCR48/MonitorPCs",
        repoUrl: "https://github.com/IvanCR48/MonitorPCs"
    },
    {
        id: "sistema_admin",
        name: "Sistema E.E.S.T N°2",
        fileName: "sistema_admin.php",
        status: "RUNNING",
        statusText: "COMPLETED",
        stack: ["PHP 8.1+", "MySQL", "Docker", "MFA (TOTP)", "OWASP Security"],
        desc: "Plataforma integral de administración académica y disciplinaria diseñada a medida para la Escuela de Educación Secundaria Técnica N°2. Permite gestionar cursos, profesores, inasistencias acumuladas y notas ponderadas según regulaciones oficiales.",
        metrics: [
            "21 protecciones de seguridad activas",
            "Autenticación doble factor (TOTP MFA)",
            "Control de accesos granular (RBAC)",
            "Contraseñas hasheadas con Argon2id"
        ],
        challenge: "Migrar la lógica legada a una arquitectura limpia orientada a objetos (SOLID) y garantizar seguridad absoluta contra inyecciones SQL y alteraciones de boletines por alumnos en servidores locales.",
        solution: "Se estructuró el sistema bajo patrón MVC y PSR-4 con PDO en modo de sentencias preparadas estrictas (desactivando la emulación de prepares). Se implementaron middlewares de CSRF, honeypots, rate limiting y MFA por TOTP, auditando cada acción administrativa en logs firmados con HMAC.",
        images: ["project/assets/SistemaAdmin/SystemExample.png"],
        liveUrl: "https://github.com/IvanCR48/sistema-admin-eest2",
        repoUrl: "https://github.com/IvanCR48/sistema-admin-eest2"
    },
    {
        id: "advanced_monitor",
        name: "NOC Enterprise Monitor",
        fileName: "advanced_monitor.bin",
        status: "wip",
        statusText: "IN_DEVELOPMENT",
        stack: ["Java 21", "Spring Boot", "PostgreSQL", "React", "TypeScript", "Recharts"],
        desc: "Plataforma de visualización y monitoreo de red de nivel empresarial estilo NOC. Diseñado para registrar el inventario de telecomunicaciones (ONTs, routers, clientes) y realizar simulaciones asíncronas de estabilidad y latencia en tiempo real.",
        metrics: [
            "Spring Task Scheduling concurrente",
            "Base de datos relacional PostgreSQL",
            "Prevención de ciclos JSON (Jackson)",
            "Gráficos interactivos en Recharts"
        ],
        challenge: "Monitorear e inspeccionar de forma periódica el estado de conectividad (uptime, latencia, pérdidas) de cientos de dispositivos sin congelar el hilo principal de la aplicación ni saturar las conexiones de base de datos.",
        solution: "Se implementó un planificador (Spring Task Scheduler) que levanta tareas asíncronas concurrentes cada 30 segundos ejecutando un ping simulado a todos los dispositivos, almacenando transiciones de estado e histórico de logs en PostgreSQL mediante Spring Data JPA.",
        images: ["project/assets/AdvancedMonitor/noc_dashboard.png"],
        liveUrl: "https://github.com/IvanCR48/AdvancedMonitor",
        repoUrl: "https://github.com/IvanCR48/AdvancedMonitor"
    }
];

function initProjectsSection() {
    const listContainer = document.getElementById("projects-list-container");
    const fileTitleEl = document.getElementById("project-file-title");
    const statusBadgeEl = document.getElementById("project-status-badge");
    const nameEl = document.getElementById("project-detail-name");
    const descEl = document.getElementById("project-detail-desc");
    const techTagsContainer = document.getElementById("project-tech-tags");
    const metricsListEl = document.getElementById("project-metrics-list");
    const caseStudyEl = document.getElementById("project-case-study");
    const activeImageEl = document.getElementById("project-active-image");
    const imageTabsContainer = document.getElementById("project-image-tabs");
    const btnLive = document.getElementById("btn-project-live");
    const btnRepo = document.getElementById("btn-project-repo");

    if (!listContainer || !nameEl) return;

    if (activeImageEl) {
        activeImageEl.style.cursor = "zoom-in";
        activeImageEl.addEventListener("click", () => {
            const lightboxModal = document.getElementById("lightbox-modal");
            const lightboxImg = document.getElementById("lightbox-img");
            const lightboxCaption = document.getElementById("lightbox-caption");
            
            if (lightboxModal && lightboxImg) {
                lightboxImg.src = activeProject.images[activeImageIndex];
                if (lightboxCaption) {
                    lightboxCaption.textContent = `${activeProject.name} - Vista del Software (Captura ${activeImageIndex + 1}/${activeProject.images.length})`;
                }
                lightboxModal.classList.add("open");
                document.body.style.overflow = "hidden";
            }
        });
    }

    let activeProject = projectsData[0];
    let activeImageIndex = 0;

    // Render registry tree list
    listContainer.innerHTML = "";
    projectsData.forEach((project, idx) => {
        const item = document.createElement("button");
        item.className = `project-item ${idx === 0 ? "active" : ""}`;
        item.setAttribute("data-id", project.id);
        
        const statusClass = project.status.toLowerCase();
        item.innerHTML = `
            <span>> ${project.fileName}</span>
            <span class="project-item-status ${statusClass}"></span>
        `;

        item.addEventListener("click", () => {
            document.querySelectorAll(".project-item").forEach(btn => btn.classList.remove("active"));
            item.classList.add("active");
            activeProject = project;
            activeImageIndex = 0;
            updateProjectInspector();
        });

        listContainer.appendChild(item);
    });

    function updateProjectInspector() {
        // Apply loading effect (simulate terminal decryption)
        const viewerWindow = document.querySelector(".project-viewer-window");
        viewerWindow.style.opacity = 0.6;
        
        setTimeout(() => {
            fileTitleEl.textContent = activeProject.fileName;
            
            // Status badge class mapping
            statusBadgeEl.textContent = activeProject.statusText;
            statusBadgeEl.className = `window-lang monospace ${activeProject.status.toLowerCase()}`;
            if (activeProject.status === "wip") {
                statusBadgeEl.style.backgroundColor = "var(--accent-amber)";
            } else {
                statusBadgeEl.style.backgroundColor = "var(--accent-green)";
            }

            nameEl.textContent = activeProject.name;
            descEl.textContent = activeProject.desc;
            
            // Render Tech Tags
            techTagsContainer.innerHTML = "";
            activeProject.stack.forEach(tech => {
                const tag = document.createElement("span");
                tag.className = "project-tag";
                tag.textContent = tech;
                techTagsContainer.appendChild(tag);
            });

            // Render Metrics
            metricsListEl.innerHTML = "";
            activeProject.metrics.forEach(metric => {
                const li = document.createElement("li");
                li.textContent = metric;
                metricsListEl.appendChild(li);
            });

            // Case study
            caseStudyEl.textContent = activeProject.solution;
            // Challenge prefix in case study
            const boldChallenge = document.createElement("p");
            boldChallenge.innerHTML = `<strong>REQUISITO/DESAFÍO:</strong> ${activeProject.challenge}<br><br><strong>RESOLUCIÓN:</strong> `;
            caseStudyEl.prepend(boldChallenge);

            // Action links
            btnLive.href = activeProject.liveUrl;
            btnRepo.href = activeProject.repoUrl;

            // Render Image controls & first image
            renderImageConsole();

            viewerWindow.style.opacity = 1;
        }, 200);
    }

    function renderImageConsole() {
        activeImageEl.style.opacity = 0;
        
        setTimeout(() => {
            activeImageEl.src = activeProject.images[activeImageIndex];
            activeImageEl.alt = `${activeProject.name} Capture ${activeImageIndex + 1}`;
            activeImageEl.style.opacity = 1;
        }, 150);

        imageTabsContainer.innerHTML = "";
        
        // If there are multiple images, render tabs
        if (activeProject.images.length > 1) {
            activeProject.images.forEach((img, idx) => {
                const tabBtn = document.createElement("button");
                tabBtn.className = `img-tab-btn ${idx === activeImageIndex ? "active" : ""}`;
                
                // Customize tab labels for CuidaMDP modes if applicable
                if (activeProject.id === "cuida_mdp") {
                    tabBtn.textContent = idx === 0 ? "DARK_MODE" : "LIGHT_MODE";
                } else {
                    tabBtn.textContent = `IMG_0${idx + 1}`;
                }

                tabBtn.addEventListener("click", () => {
                    activeImageIndex = idx;
                    renderImageConsole();
                });

                imageTabsContainer.appendChild(tabBtn);
            });
            imageTabsContainer.style.display = "flex";
        } else {
            // Only one image, hide control bar or show single active label
            const label = document.createElement("span");
            label.className = "img-tab-btn active";
            label.style.cursor = "default";
            label.style.width = "100%";
            label.textContent = "SINGLE_VIEW";
            imageTabsContainer.appendChild(label);
            imageTabsContainer.style.display = "flex";
        }
    }

    // Initialize with first project
    updateProjectInspector();
}

function initModals() {
    // Lightbox Close Handlers
    const lightboxModal = document.getElementById("lightbox-modal");
    const lightboxClose = document.getElementById("lightbox-close");
    
    if (lightboxModal && lightboxClose) {
        lightboxClose.addEventListener("click", () => {
            lightboxModal.classList.remove("open");
            document.body.style.overflow = "";
        });
        
        lightboxModal.addEventListener("click", (e) => {
            if (e.target === lightboxModal) {
                lightboxModal.classList.remove("open");
                document.body.style.overflow = "";
            }
        });
    }

    // Privacy Policy Modal Handlers
    const privacyLink = document.getElementById("link-privacy");
    const privacyModal = document.getElementById("privacy-modal");
    const privacyClose = document.getElementById("privacy-close");

    if (privacyLink && privacyModal && privacyClose) {
        privacyLink.addEventListener("click", (e) => {
            e.preventDefault();
            privacyModal.classList.add("open");
            document.body.style.overflow = "hidden";
        });

        privacyClose.addEventListener("click", () => {
            privacyModal.classList.remove("open");
            document.body.style.overflow = "";
        });

        privacyModal.addEventListener("click", (e) => {
            if (e.target === privacyModal) {
                privacyModal.classList.remove("open");
                document.body.style.overflow = "";
            }
        });
    }
    
    // Close modals on Escape key
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (lightboxModal && lightboxModal.classList.contains("open")) {
                lightboxModal.classList.remove("open");
                document.body.style.overflow = "";
            }
            if (privacyModal && privacyModal.classList.contains("open")) {
                privacyModal.classList.remove("open");
                document.body.style.overflow = "";
            }
        }
    });
}

function initScrollReveal() {
    const revealElements = document.querySelectorAll(".scroll-reveal");
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target); // only reveal once
            }
        });
    }, {
        threshold: 0.1, // trigger when 10% of the element is visible
        rootMargin: "0px 0px -50px 0px" // offset trigger slightly for better visual entry
    });
    
    revealElements.forEach(el => {
        observer.observe(el);
    });
}
