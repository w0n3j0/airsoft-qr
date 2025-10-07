// ============================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================

const COOLDOWN_DURATION = 60 * 60 * 1000; // 60 minutos (1 hora) en milisegundos
const RETRY_INTERVAL = 15000; // 15 segundos para reintentos

// Coordenadas de los HQ de cada equipo
const HQ_LOCATIONS = {
    india: {
        lat: -32.83175,
        lng: -60.70847,
        name: "HQ Indio"
    },
    pakistan: {
        lat: -32.83208,
        lng: -60.70394,
        name: "HQ Pakistaní"
    }
};

// Radio de validación en metros (distancia máxima permitida del HQ)
const HQ_VALIDATION_RADIUS = 100; // 100 metros

// Coordenadas fijas del evento (Rosario, Argentina) - punto central
const EVENT_LOCATION = {
    lat: -32.8311426,
    lng: -60.7055789,
    zoom: 17 // Nivel de zoom para el mapa
};

// Configuración cargada desde config.json
let CONFIG = null;

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

// Cargar configuración desde config.json
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        if (response.ok) {
            CONFIG = await response.json();
            console.log('✅ Configuración cargada:', CONFIG);
        } else {
            console.warn('⚠️ No se pudo cargar config.json, usando valores por defecto');
        }
    } catch (error) {
        console.warn('⚠️ Error cargando config.json:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Cargar configuración primero
    await loadConfig();
    
    deviceId = getOrCreateDeviceId();
    const team = getTeamFromURL();
    
    if (team) {
        currentTeam = team;
        
        // VERIFICAR COOLDOWN PRIMERO - Si está en cooldown, saltar animación
        const cooldown = isOnCooldown(team);
        if (cooldown.active) {
            // Saltar directamente al juego (que mostrará la pantalla de cooldown)
            document.body.className = `theme-${team}`;
            initGame(team);
        } else {
            // Si no está en cooldown, mostrar animación GPS
            showGPSAnimation(team);
        }
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
    
    // Mostrar coordenadas del evento desde el inicio de forma responsive
    const coords = `${EVENT_LOCATION.lat.toFixed(6)}, ${EVENT_LOCATION.lng.toFixed(6)}`;
    coordsDisplay.textContent = coords;
    
    // Iniciar canvas de mapa con ubicación del evento
    initMapCanvas();
    
    // Obtener ubicación GPS del usuario para validación
    if ('geolocation' in navigator) {
        // Mensaje más corto para pantallas pequeñas
        const isMobile = window.innerWidth <= 600;
        statusText.textContent = isMobile ? 'Localizando...' : 'Localizando jugador...';
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                
                // Calcular distancia al evento
                const distance = calculateDistance(
                    userLocation.lat, userLocation.lng,
                    EVENT_LOCATION.lat, EVENT_LOCATION.lng
                );
                
                // Mensaje adaptado al tamaño de pantalla
                if (isMobile) {
                    statusText.textContent = `${Math.round(distance)}m | ±${Math.round(userLocation.accuracy)}m`;
                } else {
                    statusText.textContent = `Distancia: ${Math.round(distance)}m | Precisión: ±${Math.round(userLocation.accuracy)}m`;
                }
                
                // Animar zoom del mapa hacia el evento
                setTimeout(() => {
                    statusText.textContent = 'OBJETIVO LOCALIZADO';
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
                const errorMsg = isMobile ? 'Posición desconocida' : 'Posición del jugador desconocida';
                statusText.textContent = errorMsg;
                
                // Continuar con animación del evento
                setTimeout(() => {
                    statusText.textContent = 'OBJETIVO LOCALIZADO';
                    animateMapZoom(() => {
                        setTimeout(() => {
                            gpsScreen.classList.add('hidden');
                            initGame(team);
                        }, 500);
                    });
                }, 1500);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        statusText.textContent = 'OBJETIVO LOCALIZADO';
        setTimeout(() => {
            animateMapZoom(() => {
                setTimeout(() => {
                    gpsScreen.classList.add('hidden');
                    initGame(team);
                }, 500);
            });
        }, 1500);
    }
}

function initMapCanvas() {
    const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d');
    
    // Ajustar tamaño al dispositivo con high DPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    ctx.scale(dpr, dpr);
    
    // Cargar mapa real de fondo desde OpenStreetMap
    loadMapBackground(ctx, rect.width, rect.height);
    
    // Reajustar canvas al cambiar orientación
    window.addEventListener('resize', debounce(() => {
        const newRect = canvas.getBoundingClientRect();
        canvas.width = newRect.width * dpr;
        canvas.height = newRect.height * dpr;
        canvas.style.width = newRect.width + 'px';
        canvas.style.height = newRect.height + 'px';
        ctx.scale(dpr, dpr);
        loadMapBackground(ctx, newRect.width, newRect.height);
    }, 100));
}

// Cargar mapa real de OpenStreetMap como fondo
function loadMapBackground(ctx, width, height) {
    // Calcular tile del mapa para las coordenadas del evento
    const zoom = EVENT_LOCATION.zoom;
    const lat = EVENT_LOCATION.lat;
    const lng = EVENT_LOCATION.lng;
    
    // Convertir lat/lng a coordenadas de tile
    const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    
    // Crear imagen de fondo
    const mapImage = new Image();
    mapImage.crossOrigin = 'anonymous';
    
    // Usar tiles de OpenStreetMap (satelital: satellite-v9, calles: streets-v11)
    // Vamos a cargar un tile de 3x3 para cubrir mejor el área
    const tileUrls = [];
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            tileUrls.push(`https://tile.openstreetmap.org/${zoom}/${x + dx}/${y + dy}.png`);
        }
    }
    
    // Primero dibujar el mapa táctico de fondo
    drawTacticalMap(ctx, width, height);
    
    // Cargar y dibujar el primer tile principal
    const mainTile = new Image();
    mainTile.crossOrigin = 'anonymous';
    mainTile.onload = () => {
        // Dibujar el mapa real con transparencia sobre el fondo táctico
        ctx.globalAlpha = 0.4;
        
        // Calcular posición para centrar el tile
        const tileSize = 256;
        const scale = Math.min(width, height) / tileSize;
        const offsetX = (width - tileSize * scale * 3) / 2;
        const offsetY = (height - tileSize * scale * 3) / 2;
        
        // Dibujar grid de 3x3 tiles
        let loadedTiles = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const tileImg = new Image();
                tileImg.crossOrigin = 'anonymous';
                tileImg.onload = () => {
                    const posX = offsetX + (dx + 1) * tileSize * scale;
                    const posY = offsetY + (dy + 1) * tileSize * scale;
                    ctx.drawImage(tileImg, posX, posY, tileSize * scale, tileSize * scale);
                    
                    loadedTiles++;
                    if (loadedTiles === 1) {
                        // Después de cargar el primer tile, dibujar overlay táctico
                        ctx.globalAlpha = 1.0;
                        drawTacticalOverlay(ctx, width, height);
                    }
                };
                tileImg.onerror = () => {
                    console.warn('Error cargando tile del mapa');
                    // Si falla, solo usar el mapa táctico
                    ctx.globalAlpha = 1.0;
                    drawTacticalOverlay(ctx, width, height);
                };
                tileImg.src = `https://tile.openstreetmap.org/${zoom}/${x + dx}/${y + dy}.png`;
            }
        }
    };
    
    mainTile.onerror = () => {
        console.warn('Error cargando mapa de fondo, usando solo overlay táctico');
        drawTacticalOverlay(ctx, width, height);
    };
    
    mainTile.src = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
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
}

function drawTacticalOverlay(ctx, width, height) {
    // Círculos concéntricos en el centro
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.strokeStyle = 'rgba(232, 197, 71, 0.3)';
    ctx.lineWidth = 2;
    
    for (let r = 50; r < Math.max(width, height); r += 100) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Punto central (ubicación objetivo)
    ctx.fillStyle = 'rgba(232, 197, 71, 0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(232, 197, 71, 1.0)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Anillo exterior del punto
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 18, 0, Math.PI * 2);
    ctx.stroke();
    
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
// UTILIDADES GPS
// ============================================

// Calcular distancia entre dos coordenadas GPS (fórmula de Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
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
    
    // Agregar listener para redimensionamiento
    window.addEventListener('resize', debounce(redrawConnections, 100));
    window.addEventListener('orientationchange', () => {
        setTimeout(redrawConnections, 200);
    });
}

// Función para redibujar las conexiones al cambiar tamaño de pantalla
function redrawConnections() {
    const svg = document.getElementById('connections');
    if (!svg) return;
    
    // Limpiar conexiones existentes
    svg.innerHTML = '';
    connections.length = 0;
    
    // Redibujar conexiones para pins conectados
    const connectedPins = document.querySelectorAll('.pin.connected');
    const leftPins = Array.from(connectedPins).filter(pin => pin.dataset.side === 'left');
    
    leftPins.forEach(leftPin => {
        const rightPin = Array.from(connectedPins).find(pin => 
            pin.dataset.side === 'right' && pin.dataset.id === leftPin.dataset.id
        );
        if (rightPin) {
            drawConnection(leftPin, rightPin);
        }
    });
}

// Función debounce para optimizar el redimensionamiento
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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
    
    // Actualizar viewBox del SVG para que coincida con el contenedor
    const containerRect = gameContainer.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);
    svg.setAttribute('width', containerRect.width);
    svg.setAttribute('height', containerRect.height);
    
    // Obtener las posiciones de los pins
    const leftRect = leftPin.getBoundingClientRect();
    const rightRect = rightPin.getBoundingClientRect();
    
    // Calcular coordenadas relativas al contenedor del juego
    const x1 = leftRect.left + leftRect.width / 2 - containerRect.left;
    const y1 = leftRect.top + leftRect.height / 2 - containerRect.top;
    const x2 = rightRect.left + rightRect.width / 2 - containerRect.left;
    const y2 = rightRect.top + rightRect.height / 2 - containerRect.top;
    
    // Crear la línea de conexión
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    
    // Asignar color basado en el pin
    const color = leftPin.dataset.color === 'red' ? '#FF4444' : 
                  leftPin.dataset.color === 'green' ? '#00FF88' : '#4488FF';
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '4');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('opacity', '0');
    
    // Añadir efecto de glow
    line.style.filter = `drop-shadow(0 0 6px ${color})`;
    
    svg.appendChild(line);
    connections.push(line);
    
    // Animar la aparición de la línea
    const distance = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
    line.animate([
        { opacity: 0, strokeDasharray: `0 ${distance}` },
        { opacity: 1, strokeDasharray: `${distance} 0` }
    ], {
        duration: 400,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards'
    });
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
    // 1. Prioridad: data-api en body
    const bodyApiUrl = document.body.dataset.api;
    if (bodyApiUrl) return bodyApiUrl;
    
    // 2. Segunda prioridad: config.json cargado
    if (CONFIG && CONFIG.apiUrl) {
        return CONFIG.apiUrl;
    }
    
    // 3. Fallback: placeholder (mostrará error)
    console.error('❌ No se encontró URL de API. Verifica config.json');
    return 'https://example.com/api/capture';
}

async function sendCapture() {
    // Calcular distancia al HQ del equipo
    let distanceToHQ = null;
    let hqValidation = null;
    
    if (userLocation && HQ_LOCATIONS[currentTeam]) {
        const hq = HQ_LOCATIONS[currentTeam];
        distanceToHQ = calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            hq.lat, 
            hq.lng
        );
        
        // Validar si está dentro del radio permitido
        hqValidation = {
            distanceMeters: Math.round(distanceToHQ),
            isValid: distanceToHQ <= HQ_VALIDATION_RADIUS,
            hqName: hq.name,
            maxRadius: HQ_VALIDATION_RADIUS
        };
        
        console.log(`📍 Distancia al ${hq.name}: ${Math.round(distanceToHQ)}m (${hqValidation.isValid ? 'VÁLIDO' : 'FUERA DE RANGO'})`);
    }
    
    const payload = {
        team: currentTeam,
        ts: new Date().toISOString(),
        deviceId: deviceId,
        userAgent: navigator.userAgent,
        location: userLocation ? {
            lat: parseFloat(userLocation.lat.toFixed(5)),      // SharePoint acepta máximo 5 decimales
            lng: parseFloat(userLocation.lng.toFixed(5)),      // SharePoint acepta máximo 5 decimales
            accuracy: Math.round(userLocation.accuracy)        // Redondear a metros enteros
        } : null,
        hqValidation: hqValidation  // Agregar validación del HQ
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
