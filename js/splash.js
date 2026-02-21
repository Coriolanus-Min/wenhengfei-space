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

// --- GENERATIVE AUDIO (THE FLOCK & THE RESONANCE) ---
function initAudio() {
    if (audioCtx) return;
    
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // 1. THE DEEP AIR RESONANCE / LOW WING FLAPS (Soft, distant thuds/whooshes)
    // We use a low-pass filtered brown/pink noise equivalent mixed with a low sine wave
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Simple Brown noise approximation (much softer, deeper than white noise)
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compensate gain
    }
    
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    // Heavily muffle the noise (like distant wind/wings moving massive air)
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 150; // Very deep, booming air displacement
    
    // The "flap" envelope: slow, rhythmic, but soft and breathing
    const flapLfo = audioCtx.createOscillator();
    flapLfo.type = 'sine';
    flapLfo.frequency.value = 0.8; // Very slow, heavy flaps (less than 1 per second)
    
    const flapLfoGain = audioCtx.createGain();
    flapLfoGain.gain.value = 0.6;
    flapLfo.connect(flapLfoGain);
    
    const flapVca = audioCtx.createGain();
    flapVca.gain.value = 0.4; 
    flapLfoGain.connect(flapVca.gain);
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(flapVca);

    
    // 2. THE DISTANT, MELANCHOLIC CHIRPS / CALLS (Short, slow, distinct)
    const callOsc = audioCtx.createOscillator();
    callOsc.type = 'sine'; // Sine wave is smooth, round, not harsh or alarming
    callOsc.frequency.value = 1200; // Lower, more mournful pitch (not a screech)

    // Very gentle pitch bending (like a solitary bird call echoing)
    const callPitchLfo = audioCtx.createOscillator();
    callPitchLfo.type = 'sine';
    callPitchLfo.frequency.value = 0.5;
    
    const callPitchGain = audioCtx.createGain();
    callPitchGain.gain.value = 150;
    callPitchLfo.connect(callPitchGain);
    callPitchGain.connect(callOsc.frequency);

    // The timing of the calls: Short bursts, but widely spaced out
    const callTimingLfo = audioCtx.createOscillator();
    callTimingLfo.type = 'sine';
    callTimingLfo.frequency.value = 0.15; // Only triggers very rarely (once every ~6 seconds)
    
    // We use a wave shaper to make the trigger a short "ping" rather than a long fade
    const curve = new Float32Array(4096);
    for (let i = 0; i < 4096; ++i) {
        const x = i * 2 / 4096 - 1;
        // Only let the very peak of the sine wave through (creates a short burst)
        curve[i] = x > 0.95 ? (x - 0.95) * 20 : 0; 
    }
    const waveShaper = audioCtx.createWaveShaper();
    waveShaper.curve = curve;
    callTimingLfo.connect(waveShaper);

    const callVca = audioCtx.createGain();
    callVca.gain.value = 0; // default silent
    waveShaper.connect(callVca.gain);

    // Add a huge amount of Delay/Reverb (Echo) to push the chirps far into the distance
    const delay = audioCtx.createDelay();
    delay.delayTime.value = 0.6; // 600ms echo
    const feedback = audioCtx.createGain();
    feedback.gain.value = 0.4;
    delay.connect(feedback);
    feedback.connect(delay);
    
    callOsc.connect(callVca);
    callVca.connect(delay);

    // 3. EXTREME SPATIAL PANNING (忽远忽近很分明)
    const panner = audioCtx.createStereoPanner();
    panner.pan.value = 0;
    
    // Very slow, sweeping pan that travels entirely from one ear to the exact opposite
    const panLfo = audioCtx.createOscillator();
    panLfo.type = 'triangle'; // Linear sweep, distinct movement
    panLfo.frequency.value = 0.05; // extremely slow (20 seconds per cycle)
    
    const panLfoGain = audioCtx.createGain();
    panLfoGain.gain.value = 1.0; // Hard left to hard right
    panLfo.connect(panLfoGain);
    panLfoGain.connect(panner.pan);

    
    // 1.5 THE SCATTERED LEAVES / FLUTTER (哒哒哒 / 哗哗哗)
    const leavesBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const leavesOutput = leavesBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        leavesOutput[i] = Math.random() * 2 - 1;
    }
    const leavesSource = audioCtx.createBufferSource();
    leavesSource.buffer = leavesBuffer;
    leavesSource.loop = true;

    const leavesFilter = audioCtx.createBiquadFilter();
    leavesFilter.type = 'bandpass';
    leavesFilter.frequency.value = 600; 
    leavesFilter.Q.value = 1.2;

    const leavesLfo = audioCtx.createOscillator();
    leavesLfo.type = 'sawtooth';
    leavesLfo.frequency.value = 12; 
    
    const leavesChaosLfo = audioCtx.createOscillator();
    leavesChaosLfo.type = 'sine';
    leavesChaosLfo.frequency.value = 0.5;
    const leavesChaosGain = audioCtx.createGain();
    leavesChaosGain.gain.value = 8;
    leavesChaosLfo.connect(leavesChaosGain);
    leavesChaosGain.connect(leavesLfo.frequency);

    const leavesLfoGain = audioCtx.createGain();
    leavesLfoGain.gain.value = 0.8;
    leavesLfo.connect(leavesLfoGain);

    const leavesVca = audioCtx.createGain();
    leavesVca.gain.value = 0.15; 
    leavesLfoGain.connect(leavesVca.gain);

    leavesSource.connect(leavesFilter);
    leavesFilter.connect(leavesVca);
    // NOW panner exists, so we can connect to it!
    leavesVca.connect(panner); 

    leavesSource.start();
    leavesLfo.start();
    leavesChaosLfo.start();

    // Master Volume Control
    droneGain = audioCtx.createGain();
    droneGain.gain.value = 0; // starts muted, fades in
    
    // Routing
    flapVca.connect(panner);
    callVca.connect(panner);
    delay.connect(panner); // The echoes also pan
    panner.connect(droneGain);
    droneGain.connect(audioCtx.destination);
    
    // Start nodes
    noiseSource.start();
    flapLfo.start();
    callOsc.start();
    callPitchLfo.start();
    callTimingLfo.start();
    panLfo.start();

    window.birdAudio = {
        flapLfo: flapLfo,
        noiseFilter: noiseFilter,
        panLfo: panLfo
    };
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

    // Subtle Audio modulation based on flock speed/chaos
    if (audioCtx && isAudioPlaying && !isScattering && window.birdAudio) {
        averageSpeed /= boids.length;
        
        // Very subtle flap speed increase (from 0.8 up to maybe 1.5 max)
        const targetFlapSpeed = 0.8 + (averageSpeed * 0.15);
        window.birdAudio.flapLfo.frequency.setTargetAtTime(targetFlapSpeed, audioCtx.currentTime, 1.0);

        // Low frequency air displacement gets slightly brighter, but never harsh (max ~300Hz)
        const targetResonance = 150 + (averageSpeed * 50);
        window.birdAudio.noiseFilter.frequency.setTargetAtTime(targetResonance, audioCtx.currentTime, 1.0);
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
