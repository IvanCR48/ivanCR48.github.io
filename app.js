/* Main Script for Iván Ismael Cardozo's Technical Portfolio */

document.addEventListener("DOMContentLoaded", () => {
    initLiveClock();
    initCanvasParticles();
    initSandbox();
    initSecurityConsole();
    initJsonViewer();
    initContactForm();
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
const mockCodeFiles = {
    presentation: {
        title: "src/middleware/SecurizarEntrada.php",
        lang: "PHP 8.0",
        code: `<span class="code-keyword">namespace</span> App\\Middleware;

<span class="code-keyword">class</span> <span class="code-class">SecurizarEntrada</span> {
    <span class="code-comment">// Previene secuestro de sesión validando IP/UA de forma continua</span>
    <span class="code-keyword">public function</span> <span class="code-method">validarSesion</span>(): <span class="code-keyword">bool</span> {
        $ip = $_SERVER[<span class="code-string">'REMOTE_ADDR'</span>] ?? <span class="code-string">''</span>;
        $agent = $_SERVER[<span class="code-string">'HTTP_USER_AGENT'</span>] ?? <span class="code-string">''</span>;
        
        <span class="code-keyword">if</span> ($_SESSION[<span class="code-string">'ip_original'</span>] !== $ip || $_SESSION[<span class="code-string">'ua_original'</span>] !== $agent) {
            <span class="code-comment">// Anomalía detectada, destruir sesión</span>
            session_destroy();
            <span class="code-keyword">return false</span>;
        }
        <span class="code-keyword">return true</span>;
    }
    
    <span class="code-comment">// Sanitización contra Cross-Site Scripting (XSS)</span>
    <span class="code-keyword">public function</span> <span class="code-method">sanitizar</span>(<span class="code-keyword">string</span> <span class="code-variable">$data</span>): <span class="code-keyword">string</span> {
        <span class="code-keyword">return</span> htmlspecialchars(<span class="code-variable">$data</span>, ENT_QUOTES | ENT_HTML5, <span class="code-string">'UTF-8'</span>);
    }
}`
    },
    business: {
        title: "src/Services/ServicioAsistencia.php",
        lang: "PHP 8.0",
        code: `<span class="code-keyword">namespace</span> App\\Services;

<span class="code-keyword">class</span> <span class="code-class">ServicioAsistencia</span> {
    <span class="code-comment">// Implementa normativa de inasistencias de la Provincia de Bs.As.</span>
    <span class="code-keyword">public function</span> <span class="code-method">calcularPonderacion</span>(<span class="code-keyword">string</span> <span class="code-variable">$tipoFalta</span>): <span class="code-keyword">float</span> {
        <span class="code-keyword">return match</span> (<span class="code-variable">$tipoFalta</span>) {
            <span class="code-string">'ausente'</span> => <span class="code-num">1.00</span>,
            <span class="code-string">'media_falta'</span> => <span class="code-num">0.50</span>,
            <span class="code-string">'tardanza'</span> => <span class="code-num">0.25</span>,
            <span class="code-keyword">default</span> => <span class="code-num">0.00</span>
        };
    }
    
    <span class="code-comment">// Alertas de asistencia en riesgo (límite menor al 75%)</span>
    <span class="code-keyword">public function</span> <span class="code-method">evaluarRiesgoRepitencia</span>(<span class="code-keyword">int</span> <span class="code-variable">$diasCursados</span>, <span class="code-keyword">float</span> <span class="code-variable">$inasistencias</span>): <span class="code-keyword">bool</span> {
        $porcentajeAsistencia = ((<span class="code-variable">$diasCursados</span> - <span class="code-variable">$inasistencias</span>) / <span class="code-variable">$diasCursados</span>) * <span class="code-num">100</span>;
        <span class="code-keyword">return</span> $porcentajeAsistencia &lt; <span class="code-num">75.0</span>;
    }
}`
    },
    persistence: {
        title: "src/Mappers/EstudianteMapper.php",
        lang: "PHP 8.0",
        code: `<span class="code-keyword">namespace</span> App\\Mappers;

<span class="code-keyword">class</span> <span class="code-class">EstudianteMapper</span> {
    <span class="code-keyword">private</span> <span class="code-class">Database</span> <span class="code-variable">$db</span>;
    
    <span class="code-keyword">public function</span> <span class="code-method">save</span>(<span class="code-class">Estudiante</span> <span class="code-variable">$estudiante</span>): <span class="code-keyword">bool</span> {
        <span class="code-comment">// Utiliza transacciones para operaciones multisitio seguras</span>
        $this-><span class="code-variable">db</span>->beginTransaction();
        
        $sql = <span class="code-string">"INSERT INTO estudiantes (dni, nombre, apellido, curso_id)
                VALUES (?, ?, ?, ?)"</span>;
                
        <span class="code-keyword">try</span> {
            $this-><span class="code-variable">db</span>->query($sql, [
                <span class="code-variable">$estudiante</span>->getDni(),
                <span class="code-variable">$estudiante</span>->getNombre(),
                <span class="code-variable">$estudiante</span>->getApellido(),
                <span class="code-variable">$estudiante</span>->getCursoId()
            ]);
            $this-><span class="code-variable">db</span>->commit();
            <span class="code-keyword">return true</span>;
        } <span class="code-keyword">catch</span> (\\Exception $e) {
            $this-><span class="code-variable">db</span>->rollBack();
            <span class="code-keyword">return false</span>;
        }
    }
}`
    },
    data: {
        title: "src/Database/PdoDatabase.php",
        lang: "PHP 8.0",
        code: `<span class="code-keyword">namespace</span> App\\Database;

<span class="code-keyword">class</span> <span class="code-class">PdoDatabase</span> {
    <span class="code-keyword">private</span> \\PDO <span class="code-variable">$pdo</span>;
    
    <span class="code-keyword">public function</span> <span class="code-method">__construct</span>(array <span class="code-variable">$config</span>) {
        $dsn = <span class="code-string">"mysql:host={$config['host']};dbname={$config['name']};charset=utf8mb4"</span>;
        
        <span class="code-comment">// CONFIGURACIÓN DE CONEXIÓN CRÍTICA DE SEGURIDAD</span>
        $options = [
            \\PDO::ATTR_ERRMODE => \\PDO::ERRMODE_EXCEPTION,
            <span class="code-comment">// Desactivación de prepares simulados contra ataques SQLi de segundo nivel</span>
            \\PDO::ATTR_EMULATE_PREPARES => <span class="code-keyword">false</span>,
            \\PDO::ATTR_DEFAULT_FETCH_MODE => \\PDO::FETCH_ASSOC
        ];
        
        $this-><span class="code-variable">pdo</span> = <span class="code-keyword">new</span> \\PDO($dsn, <span class="code-variable">$config</span>[<span class="code-string">'user'</span>], <span class="code-variable">$config</span>[<span class="code-string">'pass'</span>], $options);
    }
}`
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
        const data = mockCodeFiles[layer];
        fileTitleEl.textContent = data.title;
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
            const card = document.createElement("div");
            card.className = "security-card";
            card.setAttribute("data-id", p.id);
            
            card.innerHTML = `
                <div class="card-header-row">
                    <span class="card-index monospace">${p.id}</span>
                    <span class="layer-badge monospace">${p.layer.split(" ")[0]}</span>
                </div>
                <h4 class="card-title">${p.title}</h4>
                <span class="card-tag monospace">${p.owasp.split(":")[0]}</span>
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
