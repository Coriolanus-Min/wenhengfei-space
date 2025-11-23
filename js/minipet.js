document.addEventListener('DOMContentLoaded', () => {
    const path = document.getElementById('droplet-path');
    const highlight = document.getElementById('droplet-highlight');
    const eyeLeft = document.getElementById('eye-left');
    const eyeRight = document.getElementById('eye-right');
    const eyebrowLeft = document.getElementById('eyebrow-left');
    const eyebrowRight = document.getElementById('eyebrow-right');
    const highlightLeft = document.getElementById('highlight-left');
    const highlightRight = document.getElementById('highlight-right');
    const smile = document.getElementById('droplet-smile');
    const cheekLeft = document.getElementById('cheek-left');
    const cheekRight = document.getElementById('cheek-right');
    const botIcon = document.querySelector('.bot-icon');

    // --- Configuration ---

    // Base "Raw Rice" anchors (Diagonal LB to RT, Tapered Top-Right, Blunt Bottom-Left)
    const baseAnchors = [
        { x: 65, y: 15 },  // Top (Leaning right)
        { x: 92, y: 18 },  // Top Right (Sharp Point)
        { x: 90, y: 55 },  // Right side (Even Narrower)
        { x: 72, y: 92 },  // Bottom Right (Even Narrower)
        { x: 45, y: 105 }, // Bottom (Rounder)
        { x: 18, y: 92 },  // Bottom Left (Narrower)
        { x: 18, y: 55 },  // Left side (Narrower)
        { x: 38, y: 25 }   // Top Left (Narrower)
    ];

    // Shape Definitions
    const SHAPES = {
        raw: baseAnchors, // Hard, Tapered, Smooth
        cooked: [ // Plump, Soft, Oval, Sticky
            { x: 60, y: 15 }, { x: 88, y: 22 }, { x: 90, y: 60 }, { x: 75, y: 95 },
            { x: 45, y: 105 }, { x: 18, y: 90 }, { x: 12, y: 55 }, { x: 35, y: 25 }
        ]
    };

    // State Variables
    let points = baseAnchors.map(p => ({ ...p }));
    let targets = baseAnchors.map(p => ({ ...p }));
    
    // Internal element base positions
    const initialElements = {
        eyeLeft: { cx: 35, cy: 50 },
        eyeRight: { cx: 65, cy: 50 },
        highlight: { cx: 40, cy: 30 },
        highlightLeft: { cx: 36.5, cy: 48.5 },
        highlightRight: { cx: 66.5, cy: 48.5 },
        cheekLeft: { cx: 25, cy: 55 },
        cheekRight: { cx: 75, cy: 55 },
    };

    let isHovering = false;
    
    // Mood State
    let currentMood = 'normal';
    let currentShape = 'raw'; // 'raw' or 'cooked'
    
    let nextMoodChange = Date.now() + 3000;

    // Helper: Random number generator
    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Pick new targets based on current Shape + Random Variance
    function updateTargets() {
        const base = SHAPES[currentShape];
        
        // Variance Logic:
        // Raw: Very low variance (Hard, Solid, "No Give")
        // Cooked: Higher variance (Soft, Plump, "Sticky")
        let variance = 2; // Default Raw
        if (currentShape === 'cooked') variance = 6;
        
        if (isHovering) {
            // Hover intensifies the effect
            variance *= 2; 
        }

        targets = base.map((anchor, i) => {
            let v = variance;
            return {
                x: anchor.x + random(-v, v),
                y: anchor.y + random(-v, v)
            };
        });
    }

    // Catmull-Rom Path Generator
    function getPath(pts) {
        let d = "";
        const tension = 0.2; 
        const n = pts.length;
        const p = (i) => pts[(i + n) % n];

        d += `M ${pts[0].x},${pts[0].y} `;
        for (let i = 0; i < n; i++) {
            const p0 = p(i - 1);
            const p1 = p(i);
            const p2 = p(i + 1);
            const p3 = p(i + 2);

            const cp1x = p1.x + (p2.x - p0.x) * tension;
            const cp1y = p1.y + (p2.y - p0.y) * tension;
            const cp2x = p2.x - (p3.x - p1.x) * tension;
            const cp2y = p2.y - (p3.y - p1.y) * tension;

            d += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y} `;
        }
        d += "Z";
        return d;
    }

    // --- Feature Generators ---

    function getEyePath(cx, cy, mood) {
        const scale = 1.2;
        // Eyes are always rice grains (Normal)
        const w = 4 * scale; 
        const h = 6 * scale; 
        return `
            M ${cx},${cy - h}
            C ${cx + w},${cy - h} ${cx + w},${cy + h} ${cx},${cy + h}
            C ${cx - w},${cy + h} ${cx - w},${cy - h} ${cx},${cy - h}
            Z
        `;
    }

    function getEyebrowPath(cx, cy, isRight, mood) {
        const w = 6;
        let h = 4;
        let yOff = -8;
        
        if (mood === 'surprised') {
            // Embarrassed slant for O-mouth
            yOff = -10;
            if (!isRight) {
                return `M ${cx+w},${cy+yOff-2} Q ${cx},${cy+yOff-1} ${cx-w},${cy+yOff+2}`;
            } else {
                return `M ${cx-w},${cy+yOff-2} Q ${cx},${cy+yOff-1} ${cx+w},${cy+yOff+2}`;
            }
        } else if (mood === 'happy') {
             yOff = -6;
             h = 2; // Flatter
        }

        return `M ${cx - w},${cy + yOff} Q ${cx},${cy + yOff - h} ${cx + w},${cy + yOff}`;
    }

    function getMouthPath(cx, cy, mood) {
        if (mood === 'surprised') {
            // O-shape
            const r = 4;
            return `
                M ${cx},${cy - r}
                C ${cx + r},${cy - r} ${cx + r},${cy + r} ${cx},${cy + r}
                C ${cx - r},${cy + r} ${cx - r},${cy - r} ${cx},${cy - r}
                Z
            `;
        } else if (mood === 'happy' || mood === 'love') {
            // Big Smile
            const w = 12;
            const dip = 8;
            return `M ${cx - w},${cy - 2} Q ${cx},${cy + dip} ${cx + w},${cy - 2}`;
        } else {
            // Normal small smile
            const w = 8;
            const dip = 4;
            return `M ${cx - w},${cy} Q ${cx},${cy + dip} ${cx + w},${cy}`;
        }
    }

    // --- Logic Control ---

    function changeMood() {
        const moods = ['normal', 'normal', 'happy', 'surprised', 'love'];
        
        // Pick random mood
        const newMood = moods[Math.floor(Math.random() * moods.length)];
        
        // Shape Logic: Raw vs Cooked
        // 'Happy' and 'Love' make it feel "Cooked" (Soft, warm, sticky)
        // 'Normal' and 'Surprised' feel "Raw" (Hard, solid)
        
        if (newMood === 'happy' || newMood === 'love') {
            currentShape = 'cooked';
        } else {
            currentShape = 'raw';
        }

        currentMood = newMood;

        // Reset timer
        nextMoodChange = Date.now() + 3000 + Math.random() * 2000;
        
        // Trigger immediate target update for new shape
        updateTargets();
    }

    // Animation Loop
    function animate() {
        // Animation Physics
        // Raw: Standard movement
        // Cooked: Slower? Or perhaps just stickier. 
        // Let's keep ease consistent but vary variance (handled in updateTargets)
        // actually, sticky might mean slower reaction (lower ease) but bigger amplitude?
        
        let ease = isHovering ? 0.01 : 0.005;
        
        if (currentShape === 'cooked' && isHovering) {
            // "Sticky" feeling: slightly sluggish but moves a lot
             ease = 0.008; 
        }

        let maxDist = 0;

        // Morph points
        points.forEach((p, i) => {
            const t = targets[i];
            const dx = t.x - p.x;
            const dy = t.y - p.y;
            p.x += dx * ease;
            p.y += dy * ease;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > maxDist) maxDist = dist;
        });

        if (maxDist < (isHovering ? 10 : 0.5) || (isHovering && Math.random() < 0.05)) {
            updateTargets();
        }

        // Apply Shape
        path.setAttribute('d', getPath(points));

        // Mood Switching
        if (Date.now() > nextMoodChange && !isHovering) {
            changeMood();
        }

        // --- Render Facial Features ---

        // Calculate centroid for offset
        let cx = 0, cy = 0;
        points.forEach(p => { cx += p.x; cy += p.y; });
        cx /= points.length;
        cy /= points.length;

        // Offset intensity
        const offsetX = (cx - 50) * 0.85;
        const offsetY = (cy - 60) * 0.85;

        // Subtle idle wobble
        const time = Date.now() / 1000;
        const wobbleX = Math.sin(time * 2) * 1.5;
        const wobbleY = Math.cos(time * 1.5) * 1.5;
        
        const finalX = offsetX + wobbleX;
        const finalY = offsetY + wobbleY;

        // Positions
        const lx = initialElements.eyeLeft.cx + finalX;
        const ly = initialElements.eyeLeft.cy + finalY;
        const rx = initialElements.eyeRight.cx + finalX;
        const ry = initialElements.eyeRight.cy + finalY;
        
        // Cheeks
        const clx = initialElements.cheekLeft.cx + finalX;
        const cly = initialElements.cheekLeft.cy + finalY;
        const crx = initialElements.cheekRight.cx + finalX;
        const cry = initialElements.cheekRight.cy + finalY;

        // Mouth center
        const mx = 50 + finalX;
        const my = 75 + finalY;

        // Apply D attributes for paths
        eyeLeft.setAttribute('d', getEyePath(lx, ly, currentMood));
        eyeRight.setAttribute('d', getEyePath(rx, ry, currentMood));
        
        // Eyes are always filled dark now (standard rice grain)
        eyeLeft.setAttribute('fill', '#333');
        eyeLeft.setAttribute('stroke', 'none');
        eyeRight.setAttribute('fill', '#333');
        eyeRight.setAttribute('stroke', 'none');

        eyebrowLeft.setAttribute('d', getEyebrowPath(lx, ly, false, currentMood));
        eyebrowRight.setAttribute('d', getEyebrowPath(rx, ry, true, currentMood));

        // Mouth
        smile.setAttribute('d', getMouthPath(mx, my, currentMood));
        if (currentMood === 'surprised') {
            smile.setAttribute('fill', '#333'); 
        } else {
            smile.setAttribute('fill', 'none');
        }

        // Cheeks & Highlights
        let cheekOpacity = 0;
        // Cooked rice (Happy/Love) is warm and maybe shiny/steaming?
        if (currentMood === 'happy' || currentMood === 'love') cheekOpacity = 0.5;
        else if (currentMood === 'surprised') cheekOpacity = 0.2;
        
        cheekLeft.setAttribute('cx', clx);
        cheekLeft.setAttribute('cy', cly);
        cheekLeft.setAttribute('opacity', cheekOpacity);
        
        cheekRight.setAttribute('cx', crx);
        cheekRight.setAttribute('cy', cry);
        cheekRight.setAttribute('opacity', cheekOpacity);

        // Highlight
        highlight.setAttribute('cx', initialElements.highlight.cx + finalX * 0.5);
        highlight.setAttribute('cy', initialElements.highlight.cy + finalY * 0.5);
        
        const showHi = (currentMood !== 'happy'); 
        const hlx = initialElements.highlightLeft.cx + finalX;
        const hly = initialElements.highlightLeft.cy + finalY;
        const hrx = initialElements.highlightRight.cx + finalX;
        const hry = initialElements.highlightRight.cy + finalY;
        
        highlightLeft.setAttribute('cx', hlx);
        highlightLeft.setAttribute('cy', hly);
        highlightLeft.setAttribute('opacity', showHi ? 1 : 0);
        
        highlightRight.setAttribute('cx', hrx);
        highlightRight.setAttribute('cy', hry);
        highlightRight.setAttribute('opacity', showHi ? 1 : 0);

        requestAnimationFrame(animate);
    }

    // Interactions
    const chatWindow = document.getElementById('chat-window');
    const closeChatBtn = document.getElementById('close-chat');
    
    botIcon.addEventListener('mouseenter', () => {
        isHovering = true;
        // Hover reaction: Surprised (Raw) or Happy (Cooked)?
        // Let's make it Happy/Cooked on hover for that sticky feel
        currentMood = 'happy';
        currentShape = 'cooked';
        updateTargets();
    });

    botIcon.addEventListener('mouseleave', () => {
        isHovering = false;
        currentMood = 'normal';
        currentShape = 'raw';
        updateTargets();
    });

    // Chat Window Toggle
    botIcon.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
    });

    closeChatBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering other clicks if overlapping
        chatWindow.classList.remove('active');
    });

    // Start
    updateTargets();
    animate();
});