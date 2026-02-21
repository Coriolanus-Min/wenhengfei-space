document.addEventListener('DOMContentLoaded', () => {
    const path = document.getElementById('droplet-path');
    const highlight = document.getElementById('droplet-highlight');
    if (!path) return; // Exit if not on a page with the oracle

    // Base anchors for a rounded, fluid droplet shape
    const baseAnchors = [
        { x: 50, y: 15 },  // Top
        { x: 85, y: 35 },  // Top Right
        { x: 90, y: 70 },  // Bottom Right
        { x: 50, y: 95 },  // Bottom
        { x: 10, y: 70 },  // Bottom Left
        { x: 15, y: 35 }   // Top Left
    ];

    let points = baseAnchors.map(p => ({ ...p }));
    let targets = baseAnchors.map(p => ({ ...p }));
    let isHovering = false;

    // The inner metallic highlight core
    const highlightBase = [
        { x: 45, y: 25 },
        { x: 65, y: 35 },
        { x: 55, y: 60 },
        { x: 35, y: 50 }
    ];
    let highlightPoints = highlightBase.map(p => ({ ...p }));
    let highlightTargets = highlightBase.map(p => ({ ...p }));

    const container = document.querySelector('.bot-icon-container');
    if (container) {
        container.addEventListener('mouseenter', () => isHovering = true);
        container.addEventListener('mouseleave', () => isHovering = false);
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function updateTargets() {
        // Fluid variance
        let variance = isHovering ? 8 : 3; // Morphs wildly when hovered

        targets = baseAnchors.map(anchor => ({
            x: anchor.x + random(-variance, variance),
            y: anchor.y + random(-variance, variance)
        }));

        highlightTargets = highlightBase.map(anchor => ({
            x: anchor.x + random(-variance/2, variance/2),
            y: anchor.y + random(-variance/2, variance/2)
        }));
    }

    // Catmull-Rom Path Generator
    function getPath(pts) {
        let d = "";
        const tension = 0.3; // Higher tension for smoother fluid look
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

    // Animation Loop
    let lastTargetUpdate = 0;
    function animate(time) {
        if (time - lastTargetUpdate > (isHovering ? 300 : 800)) {
            updateTargets();
            lastTargetUpdate = time;
        }

        // Interpolate points towards targets (Spring physics)
        const easing = isHovering ? 0.1 : 0.05;
        
        for (let i = 0; i < points.length; i++) {
            points[i].x += (targets[i].x - points[i].x) * easing;
            points[i].y += (targets[i].y - points[i].y) * easing;
        }

        for (let i = 0; i < highlightPoints.length; i++) {
            highlightPoints[i].x += (highlightTargets[i].x - highlightPoints[i].x) * easing;
            highlightPoints[i].y += (highlightTargets[i].y - highlightPoints[i].y) * easing;
        }

        // Render
        if (path) path.setAttribute('d', getPath(points));
        if (highlight) highlight.setAttribute('d', getPath(highlightPoints));

        requestAnimationFrame(animate);
    }

    updateTargets();
    requestAnimationFrame(animate);
});