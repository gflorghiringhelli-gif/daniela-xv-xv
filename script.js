// ACTIVAR INVITACIÓN (ABRIR SOBRE)
function activarInvitacion() {
    const contenedorPrincipal = document.getElementById("contenedor-principal");
    const videoSobre = document.getElementById("videoSobre");
    const imgSobre = document.getElementById("imgSobreEstetica");
    const capaBoton = document.getElementById("capa-boton");
    const seccionFinal = document.getElementById("seccion-final");
    const musica = document.getElementById("musicaInvitacion");
    const musicBtn = document.getElementById("music-toggle");
    const videoPortada = document.getElementById("videoPortada");

    imgSobre.style.opacity = "0";
    capaBoton.style.display = "none";
    videoSobre.style.display = "block";
    videoSobre.play();

    musica.play().catch(error => console.log("Interacción requerida para audio."));
    musicBtn.style.display = "flex";

    setTimeout(() => {
        contenedorPrincipal.style.display = "none";
        seccionFinal.classList.remove("oculto");
        
        if(videoPortada) {
            videoPortada.play();
        }

        // INICIALIZA LOS CÍRCULOS DE RASPADITA UNA VEZ QUE ES VISIBLE LA PANTALLA
        setupScratchCards();

        iniciarCuentaRegresiva();
        observarRevelados();
    }, 2800); 
}

// CONTROL DE MÚSICA
function toggleMusic() {
    const musica = document.getElementById("musicaInvitacion");
    const icon = document.querySelector("#music-toggle i");
    if (musica.paused) {
        musica.play();
        icon.classList.remove("fa-music-slash");
        icon.classList.add("fa-music");
    } else {
        musica.pause();
        icon.classList.remove("fa-music");
        icon.classList.add("fa-music-slash");
    }
}

// LÓGICA DE LA RASPADITA (CANVAS)
let circulosRevelados = 0;

function setupScratchCards() {
    const canvases = [
        { id: 'scratch-dia', text: 'DÍA' },
        { id: 'scratch-mes', text: 'MES' },
        { id: 'scratch-ano', text: 'AÑO' }
    ];

    canvases.forEach(item => {
        initScratchCard(item.id, item.text);
    });
}

function initScratchCard(canvasId, text) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let isDrawing = false;
    let isRevealed = false;

    // Ajustar el tamaño del canvas interno al tamaño CSS (90x90)
    canvas.width = 90;
    canvas.height = 90;

    // Pintar fondo rosa oscuro
    ctx.fillStyle = "#d698a3"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar el texto guía
    ctx.font = "bold 13px Montserrat";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.letterSpacing = "2px";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Función para obtener la posición exacta del dedo/mouse
    function getBrushPos(xRef, yRef) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: Math.floor((xRef - rect.left) / (rect.right - rect.left) * canvas.width),
            y: Math.floor((yRef - rect.top) / (rect.bottom - rect.top) * canvas.height)
        };
    }

    // Función que "borra" lo pintado
    function scratch(e) {
        if (!isDrawing || isRevealed) return;
        e.preventDefault();
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const pos = getBrushPos(clientX, clientY);

        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        // Tamaño del "borrador" (15px)
        ctx.arc(pos.x, pos.y, 15, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Evalúa qué porcentaje está borrado
    function handlePercentage() {
        if (isRevealed) return;
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let clearPixels = 0;
        const totalPixels = pixels.length / 4;

        for (let i = 0; i < pixels.length; i += 16) {
            if (pixels[i + 3] === 0) clearPixels++;
        }

        const percent = (clearPixels / (totalPixels / 4)) * 100;

        // Si borró más del 40%, revelamos completo
        if (percent > 40) {
            isRevealed = true;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.transition = "opacity 0.4s ease";
            canvas.style.opacity = "0";
            
            canvas.parentElement.querySelector('.circle-reveal-content').classList.add('revealed-glow');
            
            setTimeout(() => { canvas.style.display = 'none'; }, 400);
            
            circulosRevelados++;
            if (circulosRevelados === 3) {
                setTimeout(() => {
                    document.getElementById('fecha-revelada').classList.add('show-revealed');
                }, 500);
            }
        }
    }

    // Eventos Mouse
    canvas.addEventListener("mousedown", (e) => { isDrawing = true; scratch(e); });
    canvas.addEventListener("mousemove", scratch);
    canvas.addEventListener("mouseup", () => { isDrawing = false; handlePercentage(); });
    canvas.addEventListener("mouseleave", () => { isDrawing = false; handlePercentage(); });

    // Eventos Touch (Celulares)
    canvas.addEventListener("touchstart", (e) => { isDrawing = true; scratch(e); }, {passive: false});
    canvas.addEventListener("touchmove", scratch, {passive: false});
    canvas.addEventListener("touchend", () => { isDrawing = false; handlePercentage(); });
}

// DESPLEGAR ACORDEÓN DE REGALO
function toggleGiftAccordion() {
    const content = document.getElementById("gift-content");
    content.classList.toggle("open");
}

// COPIAR ALIAS
function copiarAlias(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        const toast = document.getElementById("toast");
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2500);
    });
}

// ANIMACIONES AL HACER SCROLL (REVEAL)
function observarRevelados() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    reveals.forEach(reveal => observer.observe(reveal));
}

// CUENTA REGRESIVA PARA EL 29 DE NOVIEMBRE 2026 A LAS 19:00
function iniciarCuentaRegresiva() {
    const fechaBoda = new Date("November 29, 2026 19:00:00").getTime();

    const intervalo = setInterval(() => {
        const ahora = new Date().getTime();
        const distancia = fechaBoda - ahora;

        if (distancia < 0) {
            clearInterval(intervalo);
            document.getElementById("dias").innerText = "00";
            document.getElementById("horas").innerText = "00";
            document.getElementById("minutos").innerText = "00";
            document.getElementById("segundos").innerText = "00";
            return;
        }

        const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

        document.getElementById("dias").innerText = dias.toString().padStart(2, '0');
        document.getElementById("horas").innerText = horas.toString().padStart(2, '0');
        document.getElementById("minutos").innerText = minutos.toString().padStart(2, '0');
        document.getElementById("segundos").innerText = segundos.toString().padStart(2, '0');
    }, 1000);
}