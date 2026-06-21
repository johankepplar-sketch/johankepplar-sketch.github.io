(function () {
    "use strict";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

    if (reducedMotion || coarsePointer) {
        return;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
        return;
    }

    const particles = [];
    const maxParticles = 90;
    const spawnDistance = 7;
    const palette = [
        "rgba(79, 119, 217, 0.72)",
        "rgba(39, 128, 111, 0.58)",
        "rgba(255, 255, 255, 0.75)"
    ];

    let width = 0;
    let height = 0;
    let dpr = 1;
    let lastX = null;
    let lastY = null;
    let animationFrame = null;

    canvas.setAttribute("aria-hidden", "true");
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.zIndex = "2";
    canvas.style.pointerEvents = "none";
    canvas.style.mixBlendMode = "multiply";

    document.body.appendChild(canvas);

    function resizeCanvas() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function addParticle(x, y) {
        if (particles.length >= maxParticles) {
            particles.shift();
        }

        particles.push({
            x: x + (Math.random() - 0.5) * 6,
            y: y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45 - 0.08,
            radius: 2 + Math.random() * 3.5,
            life: 1,
            decay: 0.018 + Math.random() * 0.012,
            color: palette[Math.floor(Math.random() * palette.length)]
        });
    }

    function handlePointerMove(event) {
        const x = event.clientX;
        const y = event.clientY;

        if (lastX === null || Math.hypot(x - lastX, y - lastY) >= spawnDistance) {
            addParticle(x, y);
            lastX = x;
            lastY = y;
        }

        if (!animationFrame) {
            animationFrame = window.requestAnimationFrame(draw);
        }
    }

    function draw() {
        context.clearRect(0, 0, width, height);

        for (let index = particles.length - 1; index >= 0; index -= 1) {
            const particle = particles[index];
            particle.life -= particle.decay;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.radius *= 0.988;

            if (particle.life <= 0) {
                particles.splice(index, 1);
                continue;
            }

            const gradient = context.createRadialGradient(
                particle.x,
                particle.y,
                0,
                particle.x,
                particle.y,
                particle.radius * 2.8
            );
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

            context.globalAlpha = particle.life;
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.radius * 2.8, 0, Math.PI * 2);
            context.fill();
        }

        context.globalAlpha = 1;
        animationFrame = particles.length ? window.requestAnimationFrame(draw) : null;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", function () {
        lastX = null;
        lastY = null;
    });
}());