// ============================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================

const COOLDOWN_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos
const RETRY_INTERVAL = 15000; // 15 segundos para reintentos

let currentTeam = null;
let deviceId = null;
let selectedPin = null;
let matches = 0;
let connections = [];

const wireData = [
    { id: 'a', symbol: '▲', color: 'red' },
    { id: 'b', symbol: '●', color: 'green' },
    { id: 'c', symbol: '◆', color: 'blue' }
];

// ============================================
// INICIALIZACIÓN
// ============================================

let userLocation = null;

document.addEventListener('DOMContentLoaded', () => {
    deviceId = getOrCreateDeviceId();
    const team = getTeamFromURL();
    
    if (team) {
        currentTeam = team;
        // Mostrar animación GPS primero
        showGPSAnimation(team);
    } else {
        showTeamSelector();
    }

    // Event listeners para selección de bando
    document.querySelectorAll('.team-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const team = btn.dataset.team;
            window.location.href = `?team=${team}`;
        });
    });

    // Listener para reintentos de eventos pendientes
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            retryPendingEvents();
        }
    });

    // Reintento periódico
    setInterval(retryPendingEvents, RETRY_INTERVAL);
});

// ============================================
// GESTIÓN DE DEVICE ID
// ============================================

function getOrCreateDeviceId() {
    let id = localStorage.getItem('deviceId');
    if (!id) {
        id = generateUUID();
        localStorage.setItem('deviceId', id);
    }
    return id;
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ============================================
// ANIMACIÓN GPS Y MAPA
// ============================================

function showGPSAnimation(team) {
    const gpsScreen = document.getElementById('gpsAnimation');
    const coordsDisplay = document.getElementById('coordsDisplay');
    const statusText = document.getElementById('gpsStatus');
    
    // Aplicar tema antes de mostrar
    document.body.className = `theme-${team}`;
    
    gpsScreen.classList.remove('hidden');
    
    // Iniciar canvas de mapa
    initMapCanvas();
    
    // Obtener ubicación GPS
    if ('geolocation' in navigator) {
        statusText.textContent = 'Obteniendo GPS...';
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                
                // Mostrar coordenadas
                coordsDisplay.textContent = `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`;
                statusText.textContent = `Precisión: ±${Math.round(userLocation.accuracy)}m`;
                
                // Animar zoom del mapa
                setTimeout(() => {
                    statusText.textContent = 'UBICACIÓN CONFIRMADA';
                    animateMapZoom(() => {
                        // Después de la animación, iniciar juego
                        setTimeout(() => {
                            gpsScreen.classList.add('hidden');
                            initGame(team);
                        }, 500);
                    });
                }, 1500);
            },
            (error) => {
                console.warn('Error GPS:', error);
                statusText.textContent = 'GPS no disponible - Continuando...';
                coordsDisplay.textContent = 'Ubicación no detectada';
                
                // Continuar sin GPS después de 2 segundos
                setTimeout(() => {
                    gpsScreen.classList.add('hidden');
                    initGame(team);
                }, 2000);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        statusText.textContent = 'GPS no soportado';
        setTimeout(() => {
            gpsScreen.classList.add('hidden');
            initGame(team);
        }, 2000);
    }
}

function initMapCanvas() {
    const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d');
    
    // Ajustar tamaño al dispositivo
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Dibujar mapa estilo táctico
    drawTacticalMap(ctx, canvas.width, canvas.height);
}

function drawTacticalMap(ctx, width, height) {
    // Fondo base
    ctx.fillStyle = '#0a1e2a';
    ctx.fillRect(0, 0, width, height);
    
    // Cuadrícula táctica
    ctx.strokeStyle = 'rgba(27, 190, 132, 0.15)';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Líneas diagonales de fondo
    ctx.strokeStyle = 'rgba(27, 190, 132, 0.08)';
    ctx.lineWidth = 2;
    
    for (let i = -height; i < width; i += 100) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
    }
    
    // Círculos concéntricos en el centro
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.strokeStyle = 'rgba(232, 197, 71, 0.2)';
    ctx.lineWidth = 2;
    
    for (let r = 50; r < Math.max(width, height); r += 100) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Punto central (ubicación objetivo)
    ctx.fillStyle = 'rgba(232, 197, 71, 0.6)';
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(232, 197, 71, 0.8)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Líneas de radar giratorias
    animateRadarLines(ctx, centerX, centerY);
}

function animateRadarLines(ctx, centerX, centerY) {
    let angle = 0;
    const radarInterval = setInterval(() => {
        // Solo animar si la pantalla GPS está visible
        const gpsScreen = document.getElementById('gpsAnimation');
        if (gpsScreen.classList.contains('hidden')) {
            clearInterval(radarInterval);
            return;
        }
        
        // Redibujar solo las líneas de radar
        ctx.strokeStyle = 'rgba(27, 190, 132, 0.3)';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        const length = Math.max(centerX, centerY) * 2;
        ctx.lineTo(
            centerX + Math.cos(angle) * length,
            centerY + Math.sin(angle) * length
        );
        ctx.stroke();
        
        angle += 0.05;
    }, 50);
}

function animateMapZoom(callback) {
    const container = document.querySelector('.map-container');
    container.classList.add('map-zooming');
    
    setTimeout(() => {
        container.classList.remove('map-zooming');
        if (callback) callback();
    }, 3000);
}

// ============================================
// NAVEGACIÓN Y SELECCIÓN DE BANDO
// ============================================

function getTeamFromURL() {
    const params = new URLSearchParams(window.location.search);
    const team = params.get('team');
    return (team === 'india' || team === 'pakistan') ? team : null;
}

function showTeamSelector() {
    document.getElementById('teamSelector').classList.remove('hidden');
    document.getElementById('mainScreen').classList.add('hidden');
}

function initGame(team) {
    document.getElementById('teamSelector').classList.add('hidden');
    document.getElementById('mainScreen').classList.remove('hidden');
    
    // Aplicar tema
    document.body.className = `theme-${team}`;
    
    // Actualizar título dinámico
    const teamName = team === 'india' ? 'India' : 'Pakistán';
    document.title = `Bando ${teamName} - Captura de Base`;
    document.getElementById('teamName').textContent = `BANDO ${teamName.toUpperCase()}`;
    
    // Renderizar bandera
    renderTeamFlag(team);
    
    // Verificar cooldown
    const cooldown = isOnCooldown(team);
    if (cooldown.active) {
        showCooldownScreen(cooldown.msLeft);
    } else {
        setupMiniGame();
    }
}

function renderTeamFlag(team) {
    const flagSvg = document.getElementById('teamFlag');
    
    if (team === 'india') {
        flagSvg.innerHTML = `
            <rect width="60" height="13.33" fill="#FF9933"/>
            <rect y="13.33" width="60" height="13.33" fill="#FFFFFF"/>
            <rect y="26.67" width="60" height="13.33" fill="#138808"/>
            <circle cx="30" cy="20" r="5" fill="none" stroke="#000080" stroke-width="0.8"/>
        `;
    } else {
        flagSvg.innerHTML = `
            <rect width="60" height="40" fill="#01411C"/>
            <rect width="15" height="40" fill="#FFFFFF"/>
            <circle cx="35" cy="20" r="6" fill="none" stroke="#FFFFFF" stroke-width="1.2"/>
            <path d="M 38 15 L 41 20 L 38 25 L 35 22 L 35 18 Z" fill="#FFFFFF"/>
        `;
    }
}

// ============================================
// COOLDOWN
// ============================================

function isOnCooldown(team) {
    const key = `captureCooldown:${team}`;
    const timestamp = localStorage.getItem(key);
    
    if (!timestamp) {
        return { active: false, msLeft: 0 };
    }
    
    const elapsed = Date.now() - parseInt(timestamp, 10);
    const msLeft = COOLDOWN_DURATION - elapsed;
    
    if (msLeft > 0) {
        return { active: true, msLeft };
    } else {
        localStorage.removeItem(key);
        return { active: false, msLeft: 0 };
    }
}

function startCooldown(team) {
    const key = `captureCooldown:${team}`;
    localStorage.setItem(key, Date.now().toString());
}

function showCooldownScreen(msLeft) {
    document.getElementById('gameContainer').classList.add('hidden');
    document.getElementById('cooldownScreen').classList.remove('hidden');
    
    renderCountdown(msLeft);
}

function renderCountdown(msLeft) {
    const countdownElement = document.getElementById('countdown');
    
    const updateCountdown = () => {
        const cooldown = isOnCooldown(currentTeam);
        
        if (!cooldown.active) {
            location.reload();
            return;
        }
        
        const minutes = Math.floor(cooldown.msLeft / 60000);
        const seconds = Math.floor((cooldown.msLeft % 60000) / 1000);
        
        countdownElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        setTimeout(updateCountdown, 1000);
    };
    
    updateCountdown();
}

// ============================================
// MINI-JUEGO: CONECTAR CABLES
// ============================================

function setupMiniGame() {
    document.getElementById('gameContainer').classList.remove('hidden');
    document.getElementById('cooldownScreen').classList.add('hidden');
    
    matches = 0;
    connections = [];
    selectedPin = null;
    
    renderPins();
    updateMatchCount();
}

function renderPins() {
    const leftPins = document.getElementById('leftPins');
    const rightPins = document.getElementById('rightPins');
    
    leftPins.innerHTML = '';
    rightPins.innerHTML = '';
    
    // Mezclar los pines
    const leftWires = [...wireData].sort(() => Math.random() - 0.5);
    const rightWires = [...wireData].sort(() => Math.random() - 0.5);
    
    leftWires.forEach((wire, index) => {
        const pin = createPin(wire, 'left', index);
        leftPins.appendChild(pin);
    });
    
    rightWires.forEach((wire, index) => {
        const pin = createPin(wire, 'right', index);
        rightPins.appendChild(pin);
    });
}

function createPin(wire, side, index) {
    const pin = document.createElement('div');
    pin.className = 'pin';
    pin.dataset.id = wire.id;
    pin.dataset.side = side;
    pin.dataset.index = index;
    pin.dataset.color = wire.color;
    pin.textContent = wire.symbol;
    pin.tabIndex = 0;
    pin.setAttribute('role', 'button');
    pin.setAttribute('aria-label', `Pin ${wire.symbol}`);
    
    // Touch y click
    pin.addEventListener('click', () => handlePinClick(pin));
    
    // Teclado (accesibilidad)
    pin.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handlePinClick(pin);
        }
    });
    
    return pin;
}

function handlePinClick(pin) {
    if (pin.classList.contains('connected')) return;
    
    if (!selectedPin) {
        // Primera selección
        selectedPin = pin;
        pin.classList.add('selected');
        vibrate(30);
    } else {
        // Segunda selección
        const firstId = selectedPin.dataset.id;
        const secondId = pin.dataset.id;
        const firstSide = selectedPin.dataset.side;
        const secondSide = pin.dataset.side;
        
        selectedPin.classList.remove('selected');
        
        // Verificar que sean de lados diferentes
        if (firstSide === secondSide) {
            selectedPin = pin;
            pin.classList.add('selected');
            vibrate(30);
            return;
        }
        
        // Verificar match
        if (firstId === secondId) {
            // Correcto!
            const leftPin = firstSide === 'left' ? selectedPin : pin;
            const rightPin = firstSide === 'right' ? selectedPin : pin;
            
            leftPin.classList.add('connected');
            rightPin.classList.add('connected');
            
            drawConnection(leftPin, rightPin);
            
            matches++;
            updateMatchCount();
            vibrate(30);
            
            if (matches === 3) {
                setTimeout(() => captureSuccess(), 500);
            }
        } else {
            // Incorrecto - efecto de error
            showErrorSpark(pin);
            vibrate([50, 50, 50]);
        }
        
        selectedPin = null;
    }
}

function drawConnection(leftPin, rightPin) {
    const svg = document.getElementById('connections');
    const gameContainer = document.querySelector('.wires-game');
    
    const leftRect = leftPin.getBoundingClientRect();
    const rightRect = rightPin.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    
    // Coordenadas relativas al contenedor SVG
    const x1 = leftRect.left + leftRect.width / 2 - containerRect.left - 80;
    const y1 = leftRect.top + leftRect.height / 2 - containerRect.top;
    const x2 = rightRect.left + rightRect.width / 2 - containerRect.left - 80;
    const y2 = rightRect.top + rightRect.height / 2 - containerRect.top;
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', leftPin.dataset.color === 'red' ? '#FF4444' : 
                                 leftPin.dataset.color === 'green' ? '#00FF88' : '#4488FF');
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-linecap', 'round');
    
    svg.appendChild(line);
    connections.push(line);
}

function updateMatchCount() {
    document.getElementById('matchCount').textContent = matches;
}

function showErrorSpark(pin) {
    pin.style.animation = 'none';
    setTimeout(() => {
        pin.style.animation = 'pulse 0.3s ease-in-out';
    }, 10);
}

function vibrate(pattern) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

// ============================================
// CAPTURA EXITOSA
// ============================================

function captureSuccess() {
    const overlay = document.getElementById('successOverlay');
    overlay.classList.remove('hidden');
    
    // Iniciar cooldown
    startCooldown(currentTeam);
    
    // Enviar datos
    setTimeout(() => {
        sendCapture();
    }, 1500);
}

// ============================================
// ENVÍO A API
// ============================================

function getApiUrl() {
    const bodyApiUrl = document.body.dataset.api;
    if (bodyApiUrl) return bodyApiUrl;
    
    // Intentar cargar desde config.json (si existe)
    // Para simplicidad, usar un placeholder por defecto
    return 'https://example.com/api/capture';
}

async function sendCapture() {
    const payload = {
        team: currentTeam,
        ts: new Date().toISOString(),
        deviceId: deviceId,
        userAgent: navigator.userAgent,
        location: userLocation ? {
            lat: userLocation.lat,
            lng: userLocation.lng,
            accuracy: userLocation.accuracy
        } : null
    };
    
    const apiUrl = getApiUrl();
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            console.log('✅ Captura enviada con éxito');
            updateSuccessMessage('¡Datos enviados con éxito!');
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.warn('⚠️ Error al enviar, guardando para reintento:', error);
        
        // Intentar con sendBeacon
        if (trySendBeacon(apiUrl, payload)) {
            updateSuccessMessage('Datos enviados (beacon)');
            setTimeout(() => location.reload(), 2000);
        } else {
            // Guardar en cola
            queueEvent(payload);
            updateSuccessMessage('Guardado, se reintentará');
            setTimeout(() => location.reload(), 2000);
        }
    }
}

function trySendBeacon(url, payload) {
    if ('sendBeacon' in navigator) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        return navigator.sendBeacon(url, blob);
    }
    return false;
}

function updateSuccessMessage(message) {
    const msgElement = document.querySelector('.success-message');
    if (msgElement) {
        msgElement.textContent = message;
    }
}

// ============================================
// COLA DE EVENTOS PENDIENTES
// ============================================

function queueEvent(payload) {
    let queue = JSON.parse(localStorage.getItem('pendingEvents') || '[]');
    queue.push(payload);
    localStorage.setItem('pendingEvents', JSON.stringify(queue));
}

async function retryPendingEvents() {
    let queue = JSON.parse(localStorage.getItem('pendingEvents') || '[]');
    if (queue.length === 0) return;
    
    const apiUrl = getApiUrl();
    const successfulIndices = [];
    
    for (let i = 0; i < queue.length; i++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(queue[i])
            });
            
            if (response.ok) {
                console.log('✅ Evento pendiente enviado:', queue[i]);
                successfulIndices.push(i);
            }
        } catch (error) {
            console.warn('⚠️ Reintento fallido:', error);
        }
    }
    
    // Eliminar eventos enviados con éxito
    if (successfulIndices.length > 0) {
        queue = queue.filter((_, index) => !successfulIndices.includes(index));
        localStorage.setItem('pendingEvents', JSON.stringify(queue));
    }
}
