// js/splash.js

let scene, camera, renderer;
let boids = [];
let isScattering = false;
let fadeStartTime = null;
const FADE_DURATION = 2500; // 2.5 seconds fade
const BOID_COUNT = 300;
let mouse = new THREE.Vector3(0, 0, 0);

// Audio variables
let audioCtx;
let droneOscillator;
let droneGain;
let isAudioPlaying = false;

function initSplash() {
    const container = document.getElementById('splash-screen');
    const canvas = document.getElementById('murmuration-canvas');
    if (!container || !canvas) return;

    // Check if splash has already been played in this session
    if (sessionStorage.getItem('splashPlayed') === 'true') {
        container.style.display = 'none';
        document.body.style.overflow = ''; // Ensure scrolling is enabled
        return; // Skip initialization
    }

    // --- SCENE SETUP ---
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); // Dark charcoal
    // The Wuthering Heights fog: dense, brooding mist
    scene.fog = new THREE.FogExp2(0x1a1a1a, 0.0025);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 250;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- BOIDS GEOMETRY ---
    // Simple tetrahedron shapes for stark, technical contrast
    const geometry = new THREE.ConeGeometry(1.5, 4, 3);
    geometry.rotateX(Math.PI / 2); // Point forward along Z
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x888888, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.6 
    });

    for (let i = 0; i < BOID_COUNT; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            (Math.random() - 0.5) * 400,
            (Math.random() - 0.5) * 400,
            (Math.random() - 0.5) * 400
        );
        
        const boid = {
            mesh: mesh,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ),
            acceleration: new THREE.Vector3()
        };
        
        boids.push(boid);
        scene.add(mesh);
    }

    // --- EVENT LISTENERS ---
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    
    // Setup Mute Button (prevents scatter event from firing if clicked)
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent triggering the scatter
            toggleAudio();
        });
    }

    // The Scatter Trigger
    container.addEventListener('click', triggerScatter);

    // Prevent scrolling while splash screen is active
    document.body.style.overflow = 'hidden';

    // Start Loop
    requestAnimationFrame(animate);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    // Map mouse to 3D space roughly
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    mouse.z = 0;
    mouse.unproject(camera);
    const dir = mouse.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    mouse = camera.position.clone().add(dir.multiplyScalar(distance));
}

// --- GENERATIVE AUDIO ---
function initAudio() {
    if (audioCtx) return;
    
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Drone oscillator (elemental, low, haunting drone)
    droneOscillator = audioCtx.createOscillator();
    droneOscillator.type = 'triangle';
    droneOscillator.frequency.value = 55; // Low A
    
    // LFO for wind-like modulation
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2; // slow haunting swell
    
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 10;
    
    lfo.connect(lfoGain);
    lfoGain.connect(droneOscillator.frequency);
    
    // Lowpass filter for the "muffled" stormy feel
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    
    droneGain = audioCtx.createGain();
    droneGain.gain.value = 0; // start muted, fade in
    
    droneOscillator.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(audioCtx.destination);
    
    droneOscillator.start();
    lfo.start();
}

function toggleAudio() {
    initAudio();
    const muteBtn = document.getElementById('mute-btn');
    // SVG paths for mute/unmute
    const svgOff = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="1" x2="1" y2="23"></line></svg>`;
    const svgOn = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`;

    if (isAudioPlaying) {
        // Fade out
        droneGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
        muteBtn.innerHTML = svgOff;
        isAudioPlaying = false;
    } else {
        // Fade in
        if(audioCtx.state === 'suspended') audioCtx.resume();
        droneGain.gain.setTargetAtTime(0.3, audioCtx.currentTime, 1.0);
        muteBtn.innerHTML = svgOn;
        isAudioPlaying = true;
    }
}

function triggerScatter() {
    if (isScattering) return; 
    
    isScattering = true;
    fadeStartTime = performance.now();
    sessionStorage.setItem('splashPlayed', 'true');

    // Allow scrolling again
    document.body.style.overflow = '';

    // 1. THE SCATTER MECHANIC
    for (let i = 0; i < boids.length; i++) {
        const boid = boids[i];
        
        // A sudden, violent randomized force in all directions (X, Y, Z)
        // This simulates the "Wuthering Heights" stormy gust of wind
        const windForce = 15.0; 
        
        boid.velocity.x += (Math.random() - 0.5) * windForce;
        boid.velocity.y += (Math.random() - 0.5) * windForce;
        boid.velocity.z += (Math.random() - 0.5) * windForce;
    }

    // Audio fade out abruptly on shatter
    if (audioCtx && isAudioPlaying) {
        droneGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
    }

    // 2. THE MEDITATIVE FADE (CSS)
    const canvas = document.getElementById('murmuration-canvas');
    const headerUI = document.querySelector('#splash-screen .minimal-header');
    const muteBtn = document.getElementById('mute-btn');
    
    canvas.style.transition = `opacity ${FADE_DURATION}ms ease-in-out`;
    canvas.style.opacity = '0';
    
    if (headerUI) {
        // Fade the text out slightly faster than the birds
        headerUI.style.transition = 'opacity 1s ease'; 
        headerUI.style.opacity = '0';
    }
    
    if (muteBtn) {
        muteBtn.style.transition = 'opacity 0.5s ease';
        muteBtn.style.opacity = '0';
    }
}

// --- BOIDS LOGIC ---
function applyStandardBoidsRules() {
    const perceptionRadius = 40;
    const maxSpeed = 2.5;
    const maxForce = 0.05;

    // Simplified flocking calculation
    for (let i = 0; i < boids.length; i++) {
        const boid = boids[i];
        
        let alignment = new THREE.Vector3();
        let cohesion = new THREE.Vector3();
        let separation = new THREE.Vector3();
        let total = 0;

        for (let j = 0; j < boids.length; j++) {
            if (i === j) continue;
            const other = boids[j];
            const d = boid.mesh.position.distanceTo(other.mesh.position);

            if (d > 0 && d < perceptionRadius) {
                alignment.add(other.velocity);
                cohesion.add(other.mesh.position);
                
                let diff = boid.mesh.position.clone().sub(other.mesh.position);
                diff.divideScalar(d * d); // Weight by distance squared
                separation.add(diff);
                
                total++;
            }
        }

        if (total > 0) {
            alignment.divideScalar(total);
            alignment.setLength(maxSpeed);
            alignment.sub(boid.velocity);
            alignment.clampLength(0, maxForce);

            cohesion.divideScalar(total);
            cohesion.sub(boid.mesh.position);
            cohesion.setLength(maxSpeed);
            cohesion.sub(boid.velocity);
            cohesion.clampLength(0, maxForce);

            separation.divideScalar(total);
            separation.setLength(maxSpeed);
            separation.sub(boid.velocity);
            separation.clampLength(0, maxForce * 1.5); // stronger separation
        }

        // Seek mouse
        let mouseForce = new THREE.Vector3();
        const dMouse = boid.mesh.position.distanceTo(mouse);
        if (dMouse < 250) { // Seek if within range
            mouseForce = mouse.clone().sub(boid.mesh.position);
            mouseForce.setLength(maxSpeed);
            mouseForce.sub(boid.velocity);
            mouseForce.clampLength(0, maxForce * 0.8);
        }

        // A little chaos/wind (Slight chaos as requested)
        let chaos = new THREE.Vector3(
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05
        );

        // Add forces
        boid.acceleration.add(alignment.multiplyScalar(1.0));
        boid.acceleration.add(cohesion.multiplyScalar(1.0));
        boid.acceleration.add(separation.multiplyScalar(1.5));
        boid.acceleration.add(mouseForce.multiplyScalar(1.2));
        boid.acceleration.add(chaos);
    }
}

function updateBoidPositions() {
    // If scattering, max speed limit is removed/increased heavily
    const maxSpeed = isScattering ? 25 : 2.5;

    let averageSpeed = 0;

    for (let i = 0; i < boids.length; i++) {
        const boid = boids[i];
        
        boid.velocity.add(boid.acceleration);
        boid.velocity.clampLength(0, maxSpeed);
        boid.mesh.position.add(boid.velocity);
        
        // Reset acceleration
        boid.acceleration.set(0, 0, 0);

        // Point mesh in direction of velocity
        const target = boid.mesh.position.clone().add(boid.velocity);
        boid.mesh.lookAt(target);

        // Simple wrapping so they don't fly off forever before scattering
        if (!isScattering) {
            const limit = 250;
            if (boid.mesh.position.x > limit) boid.mesh.position.x = -limit;
            if (boid.mesh.position.x < -limit) boid.mesh.position.x = limit;
            if (boid.mesh.position.y > limit) boid.mesh.position.y = -limit;
            if (boid.mesh.position.y < -limit) boid.mesh.position.y = limit;
            if (boid.mesh.position.z > limit) boid.mesh.position.z = -limit;
            if (boid.mesh.position.z < -limit) boid.mesh.position.z = limit;
        }

        averageSpeed += boid.velocity.length();
    }

    // Audio modulation based on flock speed/chaos
    if (audioCtx && isAudioPlaying && !isScattering) {
        averageSpeed /= boids.length;
        // Map average speed to drone pitch slightly to feel dynamic
        const targetFreq = 50 + (averageSpeed * 8);
        droneOscillator.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.2);
    }
}

// --- THE ANIMATION LOOP ---
function animate(currentTime) {
    if (!currentTime) currentTime = performance.now();

    // 3. PERFORMANCE SHUTDOWN
    if (isScattering) {
        // If the birds are scattering, ignore standard cohesion/alignment rules
        // Just let their new violent velocity carry them outward
        
        // Check if the 2.5 second fade is completely finished
        if (currentTime - fadeStartTime > FADE_DURATION) {
            // Hide the wrapper entirely to allow clicks through to the main site
            document.getElementById('splash-screen').style.display = 'none';
            
            // Suspend audio context to save resources
            if (audioCtx && audioCtx.state === 'running') {
                audioCtx.suspend();
            }

            // Return WITHOUT calling requestAnimationFrame. 
            // This kills the Three.js loop, saving the user's battery and CPU.
            return; 
        }
    } else {
        // If not scattering, run the standard Boids rules (Seek Mouse, Cohesion, etc.)
        applyStandardBoidsRules(); 
    }

    // Always update positions based on velocity and render
    updateBoidPositions();
    renderer.render(scene, camera);
    
    // Continue the loop
    requestAnimationFrame(animate);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSplash);
} else {
    initSplash();
}
