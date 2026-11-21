/* ============================================
   CHRONOS TUNNEL â€” 3D/2D RESILIENT ENGINE
   Inspired by TeamLab Planets Tokyo
   ============================================ */

(function () {
  'use strict';

  // ---------- Scene Data ----------
  const SCENES = [
    {
      id: 'bigbang',
      title: 'The Universe Is Born',
      subtitle: 'In a single blinding flash, everything begins. Stars ignite across the darkness, galaxies swirl into being, and the story of everything we know starts right here.',
      era: '13.8 Billion Years Ago',
      imgSrc: 'img/bigbang.png',
      duration: 16000,
      lightColor: 0xffaa44,
      particleType: 'stars',
      particleColor: { h: [190, 250], s: 100, l: 80 }
    },
    {
      id: 'earth',
      title: 'A World of Fire',
      subtitle: 'Meteors rain down from the sky. Volcanoes erupt across a boiling landscape. Our planet Earth is being born â€” a world of molten rock and fire.',
      era: '4.6 Billion Years Ago',
      imgSrc: 'img/molten_earth.png',
      duration: 16000,
      lightColor: 0xff3300,
      particleType: 'embers',
      particleColor: { h: [10, 40], s: 100, l: 60 }
    },
    {
      id: 'ocean',
      title: 'Life Begins in the Sea',
      subtitle: 'Deep in warm, ancient oceans, the very first living things appear. Tiny bioluminescent cells divide and grow as life takes its first steps.',
      era: '3.8 Billion Years Ago',
      imgSrc: 'img/ancient_ocean.png',
      duration: 16000,
      lightColor: 0x00aaff,
      particleType: 'bubbles',
      particleColor: { h: [180, 220], s: 80, l: 75 }
    },
    {
      id: 'dinosaurs',
      title: 'Giants Walk the Earth',
      subtitle: 'Enormous dinosaurs roam through misty prehistoric jungles. Brachiosaurus stretches to eat from the tallest trees while pterosaurs rule the skies.',
      era: '150 Million Years Ago',
      imgSrc: 'img/dinosaurs.png',
      duration: 18000,
      lightColor: 0x22aa55,
      particleType: 'leaves',
      particleColor: { h: [80, 120], s: 60, l: 65 }
    },
    {
      id: 'meteor',
      title: 'The Day the Sky Fell',
      subtitle: 'A massive asteroid slams into Earth. The sky burns orange. Dust blocks out the sun for years. The mighty dinosaurs are gone, but life will find a way.',
      era: '66 Million Years Ago',
      imgSrc: 'img/meteor.png',
      duration: 18000,
      lightColor: 0xff5500,
      particleType: 'ashes',
      particleColor: { h: [5, 35], s: 100, l: 55 }
    },
    {
      id: 'iceage',
      title: 'The World Freezes',
      subtitle: 'Ice covers the continents. Woolly mammoths march across frozen plains with their calves, while Northern Lights dance above the silent glaciers.',
      era: '2 Million Years Ago',
      imgSrc: 'img/ice_age.png',
      duration: 16000,
      lightColor: 0x77bbff,
      particleType: 'snow',
      particleColor: { h: [200, 240], s: 50, l: 90 }
    },
    {
      id: 'humans',
      title: 'The First Storytellers',
      subtitle: 'Homo sapiens discover fire. Families gather in cave entrances, painting animals on the stone walls â€” the very first art and stories in human history.',
      era: '300,000 Years Ago',
      imgSrc: 'img/early_humans.png',
      duration: 16000,
      lightColor: 0xff6611,
      particleType: 'sparks',
      particleColor: { h: [15, 45], s: 100, l: 55 }
    },
    {
      id: 'reef',
      title: 'A World of Wonder',
      subtitle: 'Today, coral reefs burst with thousands of colors. Sea turtles glide through sunlit waters. Our planet is alive and thriving â€” and it\'s ours to protect.',
      era: 'Present Day',
      imgSrc: 'img/coral_reef.png',
      duration: 16000,
      lightColor: 0x00ffcc,
      particleType: 'bubbles',
      particleColor: { h: [150, 190], s: 90, l: 70 }
    }
  ];

  // ---------- Engine State ----------
  let container, subtitleText, progressLine, eraDots;
  let rendererMode = '3d';
  let canvas2D, ctx2D;

  // WebGL properties
  let scene, camera, renderer, wallTexture;
  let tunnelSegments = [];
  const TUNNEL_RADIUS = 12;
  const TUNNEL_LENGTH = 60;
  const SEGMENT_COUNT = 3;
  const PARTICLE_COUNT = 1000;
  let movingLight1, movingLight2;
  let particleGeometry, particleMaterial, particleSystem;
  let particlePositions = [];
  let particleSpeeds = [];

  // Offscreen Canvas for WebGL Texture Drawing
  let textureCanvas, textureCtx;

  // Shared Animation State
  let bgImages = {};
  let currentSceneIndex = 0;
  let nextSceneIndex = 1;
  let sceneTimer = 0;
  let transitionProgress = 0;
  let inTransition = false;
  let lastTime = 0;

  // Shared Procedural Assets
  let spaceStars = [];
  let volcanicSparks = [];
  let volcanoEruptions = [];
  let oceanJellyfish = [];
  let oceanCells = []; // Swarming bioluminescent spawning cells
  let dinosaurPterosaurs = [];
  let dinoBrachiosaurus = { x: 0, y: 0, neckAngle: 0, headOffset: 0, step: 0 };
  let meteorStrike = { stage: 'descend', progress: 0, fireball: null, sparks: [] };
  let iceAgeSnow = [];
  let iceAgeMammoth = { x: 0, y: 0, legAngle: 0 };
  let fireParticles = [];
  let humanStickFigures = [];
  let cavePaintings = [];
  let reefFish = [];
  let reefTurtles = [];
  let reefBubbles = [];

  // Scrolling Background Positions
  let bgScrollX = 0;
  let bgScrollY = 0;

  // ============================================
  // INITIALIZATION & FALLBACK DETECTION
  // ============================================
  function init() {
    container = document.getElementById('canvas-container');
    subtitleText = document.getElementById('subtitle-text');
    progressLine = document.getElementById('timeline-progress');
    eraDots = document.getElementById('era-dots');

    if (!container || !subtitleText || !progressLine || !eraDots) {
      console.error("DOM elements initialization failed. Script halted.");
      return;
    }

    createDots();
    
    try {
      if (typeof THREE !== 'undefined' && hasWebGLSupport()) {
        rendererMode = '3d';
        setupWebGL();
        setupOffscreenCanvas();
      } else {
        throw new Error("Three.js not loaded or WebGL unsupported");
      }
    } catch (e) {
      console.warn("WebGL initialization failed. Falling back to 2D Canvas:", e.message);
      rendererMode = '2d';
      setup2DCanvas();
    }

    preloadImages();
  }

  function hasWebGLSupport() {
    try {
      const cvs = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (cvs.getContext('webgl') || cvs.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  function createDots() {
    SCENES.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = 'era-dot' + (idx === 0 ? ' active' : '');
      eraDots.appendChild(dot);
    });
  }

  function updateDots(activeIdx) {
    const dots = eraDots.children;
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('active', i === activeIdx);
    }
  }

  // ============================================
  // WEBGL SETUP
  // ============================================
  function setupWebGL() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.012);

    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    movingLight1 = new THREE.PointLight(0xffaa44, 2.5, 45);
    movingLight1.position.set(0, 0, -15);
    scene.add(movingLight1);

    movingLight2 = new THREE.PointLight(0x00aaff, 1.8, 45);
    movingLight2.position.set(0, 2, -30);
    scene.add(movingLight2);

    const ambientLight = new THREE.AmbientLight(0x151525);
    scene.add(ambientLight);

    window.addEventListener('resize', onWindowResize);
  }

  function setupOffscreenCanvas() {
    textureCanvas = document.createElement('canvas');
    textureCanvas.width = 2048;
    textureCanvas.height = 1024;
    textureCtx = textureCanvas.getContext('2d');

    wallTexture = new THREE.CanvasTexture(textureCanvas);
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(1, 1);
  }

  // ============================================
  // 2D CANVAS FALLBACK SETUP
  // ============================================
  function setup2DCanvas() {
    canvas2D = document.createElement('canvas');
    canvas2D.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:1;display:block;';
    document.body.insertBefore(canvas2D, container);
    ctx2D = canvas2D.getContext('2d');
    
    if (container) {
      container.style.display = 'none';
    }

    window.addEventListener('resize', () => {
      canvas2D.width = window.innerWidth;
      canvas2D.height = window.innerHeight;
    });
    canvas2D.width = window.innerWidth;
    canvas2D.height = window.innerHeight;
  }

  // ============================================
  // IMAGE LOADER & ERROR CRASH RESILIENCE
  // ============================================
  function preloadImages() {
    let loaded = 0;
    const total = SCENES.length;
    let started = false;

    // Safety fallback timeout: if loading takes > 3.5 seconds, force start
    const safetyTimeout = setTimeout(() => {
      console.warn("Image preloading timed out. Forcing experience start with fallbacks.");
      SCENES.forEach((sceneData) => {
        if (!bgImages[sceneData.id]) {
          const placeholder = document.createElement('canvas');
          placeholder.width = 512;
          placeholder.height = 256;
          const pCtx = placeholder.getContext('2d');
          pCtx.fillStyle = '#0a0a1a';
          pCtx.fillRect(0, 0, 512, 256);
          pCtx.fillStyle = '#ffffff';
          pCtx.font = '24px sans-serif';
          pCtx.fillText(sceneData.title, 50, 120);
          bgImages[sceneData.id] = placeholder;
        }
      });
      loaded = total;
      checkAllLoaded();
    }, 3500);

    SCENES.forEach((sceneData) => {
      const img = new Image();
      img.onload = () => {
        bgImages[sceneData.id] = img;
        loaded++;
        checkAllLoaded();
      };
      img.onerror = () => {
        console.warn(`Could not load image: ${sceneData.imgSrc}. Creating procedural fallback texture.`);
        
        const placeholder = document.createElement('canvas');
        placeholder.width = 512;
        placeholder.height = 256;
        const pCtx = placeholder.getContext('2d');
        pCtx.fillStyle = '#0a0a1a';
        pCtx.fillRect(0, 0, 512, 256);
        pCtx.fillStyle = '#ffffff';
        pCtx.font = '24px sans-serif';
        pCtx.fillText(sceneData.title, 50, 120);

        bgImages[sceneData.id] = placeholder;
        loaded++;
        checkAllLoaded();
      };
      img.src = sceneData.imgSrc;
    });

    function checkAllLoaded() {
      if (loaded === total && !started) {
        started = true;
        clearTimeout(safetyTimeout);
        if (rendererMode === '3d') {
          build3DTunnel();
          build3DParticles();
        }
        initAnimationAssets();
        updateSubtitle();
        lastTime = performance.now();
        requestAnimationFrame(animateLoop);
      }
    }
  }

  // ============================================
  // BUILD 3D WEBGL CYLINDER PARTS
  // ============================================
  function build3DTunnel() {
    const geom = new THREE.CylinderGeometry(TUNNEL_RADIUS, TUNNEL_RADIUS, TUNNEL_LENGTH, 32, 1, true);
    geom.rotateX(Math.PI / 2);

    const mat = new THREE.MeshStandardMaterial({
      map: wallTexture,
      side: THREE.BackSide,
      roughness: 0.8,
      metalness: 0.1
    });

    for (let i = 0; i < SEGMENT_COUNT; i++) {
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.z = -i * TUNNEL_LENGTH;
      scene.add(mesh);
      tunnelSegments.push(mesh);
    }
  }

  function build3DParticles() {
    particleGeometry = new THREE.BufferGeometry();
    const particlePositions = [];
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * (TUNNEL_RADIUS - 1.5);
      
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      const pz = -Math.random() * (TUNNEL_LENGTH * SEGMENT_COUNT);
      
      particlePositions.push(px, py, pz);
      particleSpeeds.push(0.3 + Math.random() * 0.5);
    }

    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 16;
    pCanvas.height = 16;
    const pCtx = pCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    grad.addColorStop(1, 'transparent');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 16, 16);
    
    const pTexture = new THREE.CanvasTexture(pCanvas);

    particleMaterial = new THREE.PointsMaterial({
      size: 0.28,
      map: pTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xffffff
    });

    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
  }

  // ============================================
  // SEED PROCEDURAL GRAPHICS AND PARTICLES
  // ============================================
  function initAnimationAssets() {
    const w = rendererMode === '3d' ? textureCanvas.width : canvas2D.width;
    const h = rendererMode === '3d' ? textureCanvas.height : canvas2D.height;

    // Stars
    spaceStars = [];
    for (let i = 0; i < 150; i++) {
      spaceStars.push({
        x: (Math.random() - 0.5) * w * 1.5,
        y: (Math.random() - 0.5) * h * 1.5,
        z: Math.random() * w,
        speed: 1.5 + Math.random() * 3,
        size: 1 + Math.random() * 2
      });
    }

    // Volcano Eruptions Setup
    volcanoEruptions = [
      { x: w * 0.35, y: h * 0.72, state: 'idle', timer: 0 },
      { x: w * 0.65, y: h * 0.75, state: 'idle', timer: 1000 }
    ];

    // Earth Sparks
    volcanicSparks = [];
    for (let i = 0; i < 50; i++) {
      resetEarthSpark(volcanicSparks, i, w, h);
    }

    // Ocean Jellyfish & Bioluminescent Cell Spawning
    oceanJellyfish = [];
    for (let i = 0; i < 4; i++) {
      oceanJellyfish.push({
        x: w * (0.2 + i * 0.2),
        y: h * (0.4 + Math.random() * 0.4),
        r: w * 0.025,
        speed: 0.6 + Math.random() * 0.5,
        pulseSpeed: 0.02 + Math.random() * 0.02,
        pulseOffset: Math.random() * Math.PI * 2,
        pulseScale: 1,
        tentacles: Array.from({ length: 6 }, () => ({
          len: h * 0.1 + Math.random() * (h * 0.1),
          wiggleOffset: Math.random() * 10
        }))
      });
    }

    // Seed ocean cells (start as single parents, then undergo cell division)
    oceanCells = [];
    for (let i = 0; i < 12; i++) {
      oceanCells.push(createBioluminescentCell(w, h));
    }

    // Dinosaur flying pterosaurs & Brachiosaurus walk cycle
    dinosaurPterosaurs = [
      { x: -100, y: h * 0.15, size: w * 0.025, speedX: 2.8, wingPhase: 0 },
      { x: -300, y: h * 0.28, size: w * 0.018, speedX: 2.2, wingPhase: Math.PI }
    ];

    dinoBrachiosaurus = {
      x: w + 100,
      y: h * 0.72,
      neckAngle: 0,
      headOffset: 0,
      step: 0
    };

    // Ice Age Snow & Mammoth walk cycle
    iceAgeSnow = [];
    for (let i = 0; i < 120; i++) {
      iceAgeSnow.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.2 + Math.random() * 3.5,
        speedX: -3 - Math.random() * 4,
        speedY: 1.5 + Math.random() * 3
      });
    }

    iceAgeMammoth = {
      x: w + 150,
      y: h * 0.76,
      legAngle: 0
    };

    // Fire Sparks
    fireParticles = [];
    for (let i = 0; i < 35; i++) {
      resetFireParticle(w, h, i);
    }

    // Cave paintings progress
    cavePaintings = [
      { type: 'horse', x: w * 0.18, y: h * 0.45, progress: 0, scale: 0.8 },
      { type: 'bison', x: w * 0.75, y: h * 0.48, progress: 0, scale: 0.75 }
    ];

    // Reef Fish & Turtles
    reefFish = [];
    for (let i = 0; i < 25; i++) {
      reefFish.push({
        x: Math.random() * w,
        y: h * (0.25 + Math.random() * 0.55),
        speed: 1.8 + Math.random() * 2.5,
        dir: Math.random() > 0.5 ? 1 : -1,
        size: 12 + Math.random() * 16,
        color: `hsl(${Math.random() * 360}, 95%, 65%)`,
        wigglePhase: Math.random() * Math.PI
      });
    }

    reefTurtles = [
      { x: w + 200, y: h * 0.45, size: w * 0.04, speed: -1.0, flipperPhase: 0 }
    ];

    reefBubbles = [];
    for (let i = 0; i < 20; i++) {
      reefBubbles.push({
        x: Math.random() * w,
        y: h + 20,
        r: 2.5 + Math.random() * 6,
        speedY: -1.5 - Math.random() * 2.5,
        driftSpeed: 0.04 + Math.random() * 0.04,
        driftPhase: Math.random() * Math.PI * 2
      });
    }
  }

  function createBioluminescentCell(w, h) {
    return {
      x: w * (0.1 + Math.random() * 0.8),
      y: h * (0.3 + Math.random() * 0.5),
      size: 6 + Math.random() * 6,
      vx: -1 + Math.random() * 2,
      vy: -0.5 - Math.random() * 1,
      color: `rgba(${0 + Math.floor(Math.random() * 100)}, 255, ${200 + Math.floor(Math.random() * 55)}, `,
      state: 'growing', // 'growing', 'dividing', 'split'
      divTimer: 0,
      divX1: 0,
      divY1: 0,
      divX2: 0,
      divY2: 0
    };
  }

  function resetEarthSpark(sparks, i, w, h) {
    sparks[i] = {
      x: w * (0.3 + Math.random() * 0.4),
      y: h * 0.7,
      vx: -3 + Math.random() * 6,
      vy: -8 - Math.random() * 12,
      gravity: 0.2 + Math.random() * 0.1,
      life: 1.0,
      decay: 0.015 + Math.random() * 0.02,
      size: 2.5 + Math.random() * 5,
      color: `hsl(${10 + Math.random() * 30}, 100%, 60%)`
    };
  }

  function resetFireParticle(w, h, i) {
    fireParticles[i] = {
      x: w * 0.5 + (-30 + Math.random() * 60),
      y: h * 0.85,
      vx: -1.5 + Math.random() * 3,
      vy: -3 - Math.random() * 5,
      life: 1.0,
      decay: 0.012 + Math.random() * 0.015,
      size: 8 + Math.random() * 12,
      color: `rgba(${230 + Math.floor(Math.random() * 25)}, ${80 + Math.floor(Math.random() * 120)}, 20, `
    };
  }

  function resetMeteorStrike() {
    const w = rendererMode === '3d' ? textureCanvas.width : canvas2D.width;
    const h = rendererMode === '3d' ? textureCanvas.height : canvas2D.height;
    meteorStrike = {
      stage: 'descend',
      progress: 0,
      fireball: {
        x: w * 0.8,
        y: -100,
        targetX: w * 0.4,
        targetY: h * 0.65,
        r: w * 0.025,
        tail: []
      },
      sparks: []
    };
  }

  // ============================================
  // UPDATE SCREEN SUBTITLES
  // ============================================
  function updateSubtitle() {
    const scene = SCENES[currentSceneIndex];
    subtitleText.classList.remove('visible');
    
    setTimeout(() => {
      subtitleText.innerHTML = `<strong>${scene.title}</strong> (${scene.era})<br>${scene.subtitle}`;
      subtitleText.classList.add('visible');
    }, 600);
  }

  // ============================================
  // ENGINE ANIMATION LOOP
  // ============================================
  function animateLoop(time) {
    requestAnimationFrame(animateLoop);

    const delta = time - lastTime;
    lastTime = time;

    if (delta > 250) return;

    // Advance Timers
    sceneTimer += delta;
    const activeConfig = SCENES[currentSceneIndex];

    const progressTotal = ((currentSceneIndex + (sceneTimer / activeConfig.duration)) / SCENES.length) * 100;
    progressLine.style.width = `${progressTotal}%`;

    if (sceneTimer >= activeConfig.duration && !inTransition) {
      inTransition = true;
      transitionProgress = 0;
    }

    if (inTransition) {
      transitionProgress += delta / 2500;
      if (transitionProgress >= 1) {
        currentSceneIndex = nextSceneIndex;
        nextSceneIndex = (currentSceneIndex + 1) % SCENES.length;
        inTransition = false;
        transitionProgress = 0;
        sceneTimer = 0;
        updateSubtitle();
        updateDots(currentSceneIndex);

        // Reset elements upon era entry
        if (SCENES[currentSceneIndex].id === 'meteor') {
          resetMeteorStrike();
        }
        if (SCENES[currentSceneIndex].id === 'dinosaurs') {
          const w = rendererMode === '3d' ? textureCanvas.width : canvas2D.width;
          dinoBrachiosaurus.x = w + 100;
        }
        if (SCENES[currentSceneIndex].id === 'iceage') {
          const w = rendererMode === '3d' ? textureCanvas.width : canvas2D.width;
          iceAgeMammoth.x = w + 150;
        }
        if (SCENES[currentSceneIndex].id === 'humans') {
          cavePaintings.forEach(p => p.progress = 0);
        }
      }
    }

    // Panoramic horizontal scrolling
    bgScrollX -= 0.65 * (delta / 16);
    bgScrollY = Math.sin(time * 0.0006) * 12;

    if (rendererMode === '3d') {
      renderWebGL(delta);
    } else {
      render2D(delta);
    }
  }

  // ============================================
  // WEBGL RENDER ROUTINE
  // ============================================
  function renderWebGL(delta) {
    camera.position.z -= 0.05 * (delta / 16);

    const activeColor = SCENES[currentSceneIndex].lightColor;
    const nextColor = SCENES[nextSceneIndex].lightColor;
    let currentColor = activeColor;
    if (inTransition) {
      currentColor = lerpColor(activeColor, nextColor, transitionProgress);
    }
    movingLight1.color.setHex(currentColor);
    movingLight1.position.z = camera.position.z - 15;
    movingLight2.position.z = camera.position.z - 30;

    tunnelSegments.forEach(segment => {
      if (segment.position.z - TUNNEL_LENGTH / 2 > camera.position.z) {
        segment.position.z -= SEGMENT_COUNT * TUNNEL_LENGTH;
      }
    });

    wallTexture.offset.y = camera.position.z * 0.005;

    drawTextureFrame(delta);
    update3DParticles(delta);

    renderer.render(scene, camera);
  }

  function drawTextureFrame(delta) {
    const w = textureCanvas.width;
    const h = textureCanvas.height;
    const ctx = textureCtx;

    const activeScene = SCENES[currentSceneIndex];
    const activeImg = bgImages[activeScene.id];

    if (!activeImg) return;

    if (!inTransition) {
      drawScrollingBackdrop(activeImg, w, h, ctx);
      renderSceneLayer(activeScene.id, w, h, delta, ctx);
    } else {
      ctx.globalAlpha = 1.0;
      drawScrollingBackdrop(activeImg, w, h, ctx);
      renderSceneLayer(activeScene.id, w, h, delta, ctx);

      ctx.globalAlpha = transitionProgress;
      const nextImg = bgImages[SCENES[nextSceneIndex].id];
      if (nextImg) {
        drawScrollingBackdrop(nextImg, w, h, ctx);
      }
      renderSceneLayer(SCENES[nextSceneIndex].id, w, h, delta, ctx);
      ctx.globalAlpha = 1.0;
    }

    wallTexture.needsUpdate = true;
  }

  function drawScrollingBackdrop(img, w, h, ctx) {
    const scrollX = (bgScrollX * 0.8) % w;
    ctx.drawImage(img, scrollX, bgScrollY, w, h);
    ctx.save();
    if (scrollX < 0) {
      ctx.translate(scrollX + w * 2, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, bgScrollY, w, h);
    } else if (scrollX > 0) {
      ctx.translate(scrollX, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, bgScrollY, w, h);
    }
    ctx.restore();
  }

  function update3DParticles(delta) {
    const posAttr = particleGeometry.getAttribute('position');
    const positions = posAttr.array;
    const currentScene = SCENES[currentSceneIndex];
    
    particleMaterial.color.setHex(currentScene.lightColor);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      // Particles move towards camera relative to travel direction
      positions[idx + 2] += particleSpeeds[i] * 12 * (delta / 16);

      // Re-seed ahead of the moving camera relative to Z position
      if (positions[idx + 2] > camera.position.z + 5) {
        positions[idx + 2] = camera.position.z - (TUNNEL_LENGTH * SEGMENT_COUNT) + (Math.random() * 20);
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (TUNNEL_RADIUS - 1.5);
        positions[idx] = Math.cos(angle) * radius;
        positions[idx + 1] = Math.sin(angle) * radius;
      }
    }
    posAttr.needsUpdate = true;
  }

  // ============================================
  // 2D CANVAS FALLBACK RENDER ROUTINE
  // ============================================
  function render2D(delta) {
    const w = canvas2D.width;
    const h = canvas2D.height;
    const ctx = ctx2D;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    const activeScene = SCENES[currentSceneIndex];
    const activeImg = bgImages[activeScene.id];

    if (!activeImg) return;

    ctx.save();
    
    if (inTransition) {
      const transType = SCENES[nextSceneIndex].transition;
      if (transType === 'fade') {
        ctx.globalAlpha = 1 - transitionProgress;
        drawScrollingBackdrop(activeImg, w, h, ctx);
        renderSceneLayer(activeScene.id, w, h, delta, ctx);

        ctx.globalAlpha = transitionProgress;
        const nextImg = bgImages[SCENES[nextSceneIndex].id];
        if (nextImg) drawScrollingBackdrop(nextImg, w, h, ctx);
        renderSceneLayer(SCENES[nextSceneIndex].id, w, h, delta, ctx);
      } else {
        const shiftX = transitionProgress * w;
        ctx.translate(-shiftX, 0);
        drawScrollingBackdrop(activeImg, w, h, ctx);
        renderSceneLayer(activeScene.id, w, h, delta, ctx);
        
        ctx.translate(w, 0);
        const nextImg = bgImages[SCENES[nextSceneIndex].id];
        if (nextImg) drawScrollingBackdrop(nextImg, w, h, ctx);
        renderSceneLayer(SCENES[nextSceneIndex].id, w, h, delta, ctx);
      }
    } else {
      drawScrollingBackdrop(activeImg, w, h, ctx);
      renderSceneLayer(activeScene.id, w, h, delta, ctx);
    }
    
    ctx.restore();
    draw2DDepthParticles(w, h, delta, ctx);
  }

  function draw2DDepthParticles(w, h, delta, ctx) {
    const activeScene = SCENES[currentSceneIndex];
    ctx.fillStyle = `rgba(${activeScene.id === 'earth' || activeScene.id === 'meteor' ? '255, 100, 0' : activeScene.id === 'ocean' || activeScene.id === 'reef' ? '0, 220, 255' : '255, 255, 255'}, 0.45)`;
    
    for (let i = 0; i < 60; i++) {
      const px = (Math.sin(i * 99) * w * 0.5 + w * 0.5 + performance.now() * 0.05 * (1 + (i % 3))) % w;
      const py = (Math.cos(i * 123) * h * 0.5 + h * 0.5 + performance.now() * 0.08 * (1 + (i % 2))) % h;
      ctx.beginPath();
      ctx.arc(px, py, 1.5 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ============================================
  // ANIMATE PROCEDURAL EVENTS MATCHING DIALOGUES
  // ============================================
  function renderSceneLayer(sceneId, w, h, delta, ctx) {
    
    // --- 1. BIG BANG (Universe Emergence) ---
    if (sceneId === 'bigbang') {
      const timeInScene = sceneTimer;
      
      if (timeInScene < 1500) {
        // Phase 1: Pure darkness before everything
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, w, h);
      } 
      else if (timeInScene >= 1500 && timeInScene < 3500) {
        // Phase 2: Giant expanding flash (The Bang!)
        const flashProgress = (timeInScene - 1500) / 2000;
        const radius = w * Math.sin(flashProgress * Math.PI * 0.5);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
        ctx.fillRect(0, 0, w, h);

        const flashGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(0.1, radius));
        flashGrad.addColorStop(0, 'white');
        flashGrad.addColorStop(0.3, '#ffea88');
        flashGrad.addColorStop(1.0, 'transparent');
        ctx.fillStyle = flashGrad;
        ctx.beginPath();
        ctx.arc(w/2, h/2, Math.max(0.1, radius * 1.5), 0, Math.PI * 2);
        ctx.fill();
      } 
      else {
        // Phase 3: Swirling galaxies emerging
        const centerRad = h * 0.18 + Math.sin(performance.now() * 0.002) * 15;
        const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(0.1, centerRad));
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        grad.addColorStop(0.3, 'rgba(255, 110, 20, 0.5)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(w/2, h/2, Math.max(0.1, centerRad * 1.6), 0, Math.PI * 2);
        ctx.fill();

        // Expanding galaxy arms (spiral)
        ctx.strokeStyle = 'rgba(130, 80, 255, 0.2)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 6; a += 0.1) {
          const r = a * 25 + Math.sin(performance.now() * 0.001) * 30;
          const px = w/2 + Math.cos(a + performance.now() * 0.0005) * r;
          const py = h/2 + Math.sin(a + performance.now() * 0.0005) * r;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Flying background stars
        spaceStars.forEach(s => {
          s.z -= s.speed;
          if (s.z <= 0) {
            s.z = w;
            s.x = (Math.random() - 0.5) * w * 1.5;
            s.y = (Math.random() - 0.5) * h * 1.5;
          }
          const px = (s.x / s.z) * w * 0.6 + w/2;
          const py = (s.y / s.z) * h * 0.6 + h/2;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.1, s.size * (1 - s.z/w) * 2.5), 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }
    
    // --- 2. MOLTEN EARTH (Active Volcanoes & Meteorites) ---
    else if (sceneId === 'earth') {
      // Erupting volcanoes drawing
      volcanoEruptions.forEach(vol => {
        vol.timer += delta;
        
        // Eruption cycles
        if (vol.state === 'idle' && Math.random() < 0.008) {
          vol.state = 'erupting';
          vol.timer = 0;
        }
        
        // Draw volcano shape
        ctx.fillStyle = 'rgba(20, 5, 5, 0.95)';
        ctx.beginPath();
        ctx.moveTo(vol.x - 90, vol.y + 100);
        ctx.lineTo(vol.x - 20, vol.y);
        ctx.lineTo(vol.x + 20, vol.y);
        ctx.lineTo(vol.x + 90, vol.y + 100);
        ctx.closePath();
        ctx.fill();

        // Erupting fire column
        if (vol.state === 'erupting') {
          const eruptProgress = Math.min(1, vol.timer / 2000);
          ctx.fillStyle = `rgba(255, ${80 + Math.floor(Math.random() * 100)}, 0, ${1 - eruptProgress})`;
          ctx.beginPath();
          ctx.moveTo(vol.x - 18, vol.y);
          ctx.lineTo(vol.x + 18, vol.y);
          ctx.lineTo(vol.x + 40, vol.y - 120 * eruptProgress);
          ctx.lineTo(vol.x - 40, vol.y - 120 * eruptProgress);
          ctx.closePath();
          ctx.fill();

          if (eruptProgress >= 1) {
            vol.state = 'idle';
          }
        }
      });

      // Erupting Sparks
      volcanicSparks.forEach((spark, i) => {
        spark.vy += spark.gravity;
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.life -= spark.decay;

        if (spark.life <= 0) {
          resetEarthSpark(volcanicSparks, i, w, h);
        }

        ctx.fillStyle = spark.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, spark.life));
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, Math.max(0.1, spark.size * spark.life), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
    }
    
    // --- 3. ANCIENT OCEAN (Water Emerging & Cells Mitosis Spawning) ---
    else if (sceneId === 'ocean') {
      const emergeProgress = Math.min(1, sceneTimer / 5000); // 5 seconds water level emerge
      
      // Draw rising ocean water blue layer
      ctx.fillStyle = `rgba(0, 80, 150, ${emergeProgress * 0.45})`;
      ctx.fillRect(0, 0, w, h);

      // Bioluminescent cell division/spawning
      oceanCells.forEach(cell => {
        cell.x += cell.vx;
        cell.y += cell.vy;

        // Swim boundary bounce
        if (cell.x < 50 || cell.x > w - 50) cell.vx *= -1;
        if (cell.y < 100 || cell.y > h - 100) cell.vy *= -1;

        if (cell.state === 'growing') {
          cell.size += 0.02 * (delta / 16);
          if (cell.size > 14) {
            cell.state = 'dividing';
            cell.divTimer = 0;
          }

          // Draw single cell
          ctx.fillStyle = cell.color + '0.8)';
          ctx.shadowColor = 'cyan';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(cell.x, cell.y, Math.max(0.1, cell.size), 0, Math.PI * 2);
          ctx.fill();
        } 
        else if (cell.state === 'dividing') {
          cell.divTimer += delta;
          const divPct = Math.min(1, cell.divTimer / 2500); // division takes 2.5 seconds
          
          const offset = divPct * cell.size * 0.8;
          cell.divX1 = cell.x - offset;
          cell.divY1 = cell.y;
          cell.divX2 = cell.x + offset;
          cell.divY2 = cell.y;

          // Draw stretching parent cell body (dumbbell shape)
          ctx.fillStyle = cell.color + '0.75)';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(cell.divX1, cell.divY1, Math.max(0.1, cell.size * 0.85), 0, Math.PI * 2);
          ctx.arc(cell.divX2, cell.divY2, Math.max(0.1, cell.size * 0.85), 0, Math.PI * 2);
          ctx.fill();

          // Draw bridge connection
          ctx.lineWidth = cell.size * 0.7 * (1 - divPct);
          ctx.strokeStyle = cell.color + '0.6)';
          ctx.beginPath();
          ctx.moveTo(cell.divX1, cell.divY1);
          ctx.lineTo(cell.divX2, cell.divY2);
          ctx.stroke();

          if (divPct >= 1) {
            cell.state = 'split';
          }
        } 
        else if (cell.state === 'split') {
          // Spawn new cells into main list
          oceanCells.push({
            x: cell.divX1,
            y: cell.divY1,
            size: 6,
            vx: -0.5 - Math.random() * 1.0,
            vy: -0.5 - Math.random() * 0.5,
            color: cell.color,
            state: 'growing',
            divTimer: 0
          });

          // Mutate parent cell to split child
          cell.x = cell.divX2;
          cell.y = cell.divY2;
          cell.size = 6;
          cell.vx = 0.5 + Math.random() * 1.0;
          cell.vy = -0.5 - Math.random() * 0.5;
          cell.state = 'growing';
        }

        ctx.shadowBlur = 0; // reset glow
      });

      // Keep cell count stable
      if (oceanCells.length > 35) {
        oceanCells.shift();
      }

      // Jellyfish pulsing
      oceanJellyfish.forEach(j => {
        j.pulseOffset += j.pulseSpeed;
        const sizeOffset = Math.sin(j.pulseOffset);
        j.pulseScale = 1.0 + sizeOffset * 0.15;
        j.y -= j.speed * (1.1 + sizeOffset * 0.7) * (delta / 16);

        if (j.y < -150) {
          j.y = h + 150;
          j.x = w * (0.15 + Math.random() * 0.7);
        }

        ctx.fillStyle = `rgba(0, 190, 255, ${0.5 + sizeOffset * 0.15})`;
        ctx.beginPath();
        ctx.arc(j.x, j.y, Math.max(0.1, j.r * j.pulseScale), Math.PI, 0, false);
        ctx.quadraticCurveTo(j.x + j.r * j.pulseScale, j.y + j.r * 0.3 * j.pulseScale, j.x, j.y + j.r * 0.35 * j.pulseScale);
        ctx.quadraticCurveTo(j.x - j.r * j.pulseScale, j.y + j.r * 0.3 * j.pulseScale, j.x - j.r * j.pulseScale, j.y);
        ctx.fill();

        ctx.lineWidth = 2;
        j.tentacles.forEach((tentacle, ti) => {
          ctx.strokeStyle = `rgba(0, 230, 255, ${0.25 + (5 - ti) * 0.05})`;
          ctx.beginPath();
          ctx.moveTo(j.x - j.r * 0.6 + (j.r * 1.2 / 5) * ti, j.y + j.r * 0.2);

          const controlX1 = j.x - j.r * 0.6 + (j.r * 1.2 / 5) * ti + Math.sin(j.pulseOffset * 1.5 + ti) * 15;
          const controlY1 = j.y + j.r * 0.8;
          const endX = j.x - j.r * 0.6 + (j.r * 1.2 / 5) * ti + Math.sin(j.pulseOffset + ti) * 25;
          const endY = j.y + tentacle.len;

          ctx.quadraticCurveTo(controlX1, controlY1, endX, endY);
          ctx.stroke();
        });
      });
    }
    
    // --- 4. DINOSAURS (Brachiosaurus Walking & Tree Leaf Eating) ---
    else if (sceneId === 'dinosaurs') {
      dinoBrachiosaurus.x -= 1.0 * (delta / 16);
      dinoBrachiosaurus.step += 0.08 * (delta / 16);

      if (dinoBrachiosaurus.x < -300) {
        dinoBrachiosaurus.x = w + 200;
      }

      // Draw walking Brachiosaurus silhouette
      ctx.fillStyle = 'rgba(15, 25, 20, 0.95)';
      ctx.save();
      ctx.translate(dinoBrachiosaurus.x, dinoBrachiosaurus.y);
      
      ctx.beginPath();
      // Body shape
      ctx.ellipse(0, 0, 90, 55, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Tail
      ctx.beginPath();
      ctx.moveTo(85, -10);
      ctx.quadraticCurveTo(180, 40, 220, 60);
      ctx.quadraticCurveTo(160, 20, 80, 10);
      ctx.closePath();
      ctx.fill();

      // Animated Head and Neck
      ctx.save();
      ctx.translate(-70, -20);
      const neckSway = Math.sin(dinoBrachiosaurus.step * 0.5) * 0.08;
      ctx.rotate(neckSway);
      ctx.beginPath();
      // Neck
      ctx.moveTo(-10, 20);
      ctx.quadraticCurveTo(-60, -80, -90, -180); // neck curving up
      ctx.lineTo(-70, -190);
      ctx.quadraticCurveTo(-45, -90, 10, 20);
      ctx.closePath();
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.ellipse(-95, -185, 22, 12, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Animated Legs moving back and forth
      const legOffset = Math.sin(dinoBrachiosaurus.step) * 25;
      
      // Leg 1 (Front Left)
      ctx.beginPath();
      ctx.moveTo(-50, 20);
      ctx.lineTo(-50 + legOffset, 120);
      ctx.lineTo(-30 + legOffset, 120);
      ctx.lineTo(-30, 20);
      ctx.fill();

      // Leg 2 (Back Right)
      ctx.beginPath();
      ctx.moveTo(40, 20);
      ctx.lineTo(40 - legOffset, 120);
      ctx.lineTo(60 - legOffset, 120);
      ctx.lineTo(60, 20);
      ctx.fill();

      ctx.restore();

      // Pterosaurs flying overhead
      dinosaurPterosaurs.forEach(p => {
        p.x += p.speedX * (delta / 16);
        p.wingPhase += 0.15 * (delta / 16);
        const wingSway = Math.sin(p.wingPhase) * p.size * 0.7;

        if (p.x > w + 200) p.x = -200;

        ctx.fillStyle = 'rgba(10, 25, 20, 0.9)';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.size, p.y + p.size * 0.15);
        ctx.lineTo(p.x - p.size * 0.5, p.y - wingSway);
        ctx.lineTo(p.x - p.size * 0.35, p.y + p.size * 0.1);
        ctx.lineTo(p.x - p.size * 0.5, p.y + wingSway);
        ctx.closePath();
        ctx.fill();
      });
    }
    
    // --- 5. METEOR STRIKE (Dinosaur Extinction Event) ---
    else if (sceneId === 'meteor') {
      if (meteorStrike.stage === 'descend') {
        if (!meteorStrike.fireball) resetMeteorStrike();
        const fb = meteorStrike.fireball;
        
        fb.x -= 6.5 * (delta / 16);
        fb.y += 4.5 * (delta / 16);

        fb.tail.push({ x: fb.x, y: fb.y, r: fb.r * (0.6 + Math.random() * 0.4), life: 1.0 });
        if (fb.tail.length > 30) fb.tail.shift();

        fb.tail.forEach((t, i) => {
          t.life -= 0.035;
          ctx.fillStyle = `rgba(255, ${80 + i * 5}, 0, ${Math.max(0, Math.min(1, t.life)) * 0.8})`;
          ctx.beginPath();
          ctx.arc(t.x + (Math.random() - 0.5) * 15, t.y + (Math.random() - 0.5) * 15, Math.max(0.1, t.r * t.life), 0, Math.PI * 2);
          ctx.fill();
        });

        // Fireball Core
        const fireGrad = ctx.createRadialGradient(fb.x, fb.y, 0, fb.x, fb.y, fb.r);
        fireGrad.addColorStop(0, '#ffffff');
        fireGrad.addColorStop(0.3, '#ffcc00');
        fireGrad.addColorStop(0.7, '#ff3300');
        fireGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.arc(fb.x, fb.y, Math.max(0.1, fb.r * 1.5), 0, Math.PI * 2);
        ctx.fill();

        // Dinosaur silhouette running away in panic before impact
        ctx.fillStyle = 'rgba(10, 5, 5, 0.9)';
        ctx.beginPath();
        const runX = w * 0.2 + (sceneTimer * 0.05);
        ctx.ellipse(runX, h * 0.72, 45, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        // Neck stretched forward running
        ctx.moveTo(runX - 35, h * 0.72);
        ctx.quadraticCurveTo(runX - 70, h * 0.65, runX - 90, h * 0.66);
        ctx.lineTo(runX - 85, h * 0.69);
        ctx.lineTo(runX - 35, h * 0.76);
        ctx.closePath();
        ctx.fill();

        if (fb.x <= fb.targetX) {
          meteorStrike.stage = 'flash';
          meteorStrike.progress = 0;
        }
      } 
      else if (meteorStrike.stage === 'flash') {
        meteorStrike.progress += delta / 500;
        const flashAlpha = Math.sin(meteorStrike.progress * Math.PI);
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx.fillRect(0, 0, w, h);

        if (meteorStrike.progress >= 1) {
          meteorStrike.stage = 'shockwave';
          meteorStrike.progress = 0;
          meteorStrike.sparks = [];
          for (let i = 0; i < 70; i++) {
            meteorStrike.sparks.push({
              x: Math.random() * w,
              y: h + 10,
              vx: -6 + Math.random() * 12,
              vy: -15 - Math.random() * 12,
              life: 1.0,
              decay: 0.015 + Math.random() * 0.02,
              size: 3 + Math.random() * 5
            });
          }
        }
      } 
      else if (meteorStrike.stage === 'shockwave') {
        meteorStrike.progress += delta / 5000;
        
        ctx.fillStyle = `rgba(255, 40, 0, ${0.45 * (1 - meteorStrike.progress)})`;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = `rgba(255, 160, 30, ${1 - meteorStrike.progress})`;
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.arc(w * 0.4, h * 0.65, Math.max(0.1, meteorStrike.progress * w * 1.8), 0, Math.PI * 2);
        ctx.stroke();

        // Flying burning chunks
        meteorStrike.sparks.forEach(spark => {
          spark.x += spark.vx;
          spark.y += spark.vy;
          spark.vy += 0.08;
          spark.life -= spark.decay;

          if (spark.life > 0) {
            ctx.fillStyle = `rgba(255, ${80 + Math.floor(Math.max(0, Math.min(1, spark.life)) * 175)}, 0, ${Math.max(0, Math.min(1, spark.life))})`;
            ctx.beginPath();
            ctx.arc(spark.x, spark.y, Math.max(0.1, spark.size * spark.life), 0, Math.PI * 2);
            ctx.fill();
          }
        });

        if (meteorStrike.progress >= 1) {
          meteorStrike.stage = 'descend';
          resetMeteorStrike();
        }
      }
    }
    
    // --- 6. ICE AGE (World Freezes & Mammoths Marching) ---
    else if (sceneId === 'iceage') {
      const freezeProgress = Math.min(1, sceneTimer / 5000); // 5 seconds screen freeze
      
      // Draw frost growing around edges
      ctx.strokeStyle = `rgba(200, 240, 255, ${freezeProgress * 0.5})`;
      ctx.lineWidth = 30 * freezeProgress;
      ctx.strokeRect(0, 0, w, h);

      // Mammoth walk cycle
      iceAgeMammoth.x -= 0.8 * (delta / 16);
      iceAgeMammoth.legAngle = Math.sin(performance.now() * 0.003) * 0.3;

      if (iceAgeMammoth.x < -200) {
        iceAgeMammoth.x = w + 150;
      }

      ctx.save();
      ctx.translate(iceAgeMammoth.x, iceAgeMammoth.y);
      ctx.fillStyle = 'rgba(25, 20, 25, 0.95)';

      // 1. Parent Mammoth
      // Body
      ctx.beginPath();
      ctx.ellipse(0, 0, 60, 48, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head & Trunk
      ctx.beginPath();
      ctx.arc(-55, -15, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-65, -5);
      ctx.quadraticCurveTo(-90, 10, -75, 45); // trunk curved
      ctx.lineTo(-65, 45);
      ctx.quadraticCurveTo(-75, 10, -55, 0);
      ctx.closePath();
      ctx.fill();

      // Tusks (White/Cyan lines)
      ctx.strokeStyle = '#eef8ff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-58, -5);
      ctx.quadraticCurveTo(-85, -2, -92, -18);
      ctx.stroke();

      // Moving Legs
      ctx.fillStyle = 'rgba(25, 20, 25, 0.95)';
      // Front Leg
      ctx.save();
      ctx.translate(-30, 30);
      ctx.rotate(iceAgeMammoth.legAngle);
      ctx.fillRect(-10, 0, 18, 50);
      ctx.restore();

      // Back Leg
      ctx.save();
      ctx.translate(30, 30);
      ctx.rotate(-iceAgeMammoth.legAngle);
      ctx.fillRect(-10, 0, 18, 50);
      ctx.restore();

      // 2. Baby Mammoth trailing behind
      ctx.save();
      ctx.translate(110, 20);
      ctx.scale(0.5, 0.5);

      // Baby Body
      ctx.beginPath();
      ctx.ellipse(0, 0, 60, 48, 0, 0, Math.PI * 2);
      ctx.fill();

      // Baby Head & Trunk
      ctx.beginPath();
      ctx.arc(-55, -15, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-65, -5);
      ctx.quadraticCurveTo(-90, 10, -70, 35);
      ctx.lineTo(-60, 35);
      ctx.quadraticCurveTo(-75, 10, -55, 0);
      ctx.closePath();
      ctx.fill();

      // Baby Moving Legs
      ctx.save();
      ctx.translate(-30, 30);
      ctx.rotate(-iceAgeMammoth.legAngle);
      ctx.fillRect(-10, 0, 18, 50);
      ctx.restore();

      ctx.save();
      ctx.translate(30, 30);
      ctx.rotate(iceAgeMammoth.legAngle);
      ctx.fillRect(-10, 0, 18, 50);
      ctx.restore();

      ctx.restore(); // Baby end

      ctx.restore(); // Parent end

      // Snow blowing
      iceAgeSnow.forEach(s => {
        s.x += s.speedX * (delta / 16);
        s.y += s.speedY * (delta / 16);

        if (s.x < -20) {
          s.x = w + 20;
          s.y = Math.random() * h;
        }
        if (s.y > h + 20) {
          s.y = -20;
          s.x = Math.random() * w;
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    
    // --- 7. EARLY HUMANS (Discovering Fire & Wall Drawings) ---
    else if (sceneId === 'humans') {
      const timeInScene = sceneTimer;
      
      // Fire Sparks
      fireParticles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          resetFireParticle(w, h, i);
        }

        ctx.fillStyle = p.color + Math.max(0, Math.min(1, p.life)) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, p.size * p.life), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Animate human stick figures rubbing sticks to make fire (0 to 3 seconds)
      ctx.strokeStyle = 'rgba(20, 20, 20, 0.9)';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      
      // Figure 1 (Left)
      ctx.beginPath();
      ctx.moveTo(w * 0.44, h * 0.86);
      ctx.lineTo(w * 0.45, h * 0.8); // Torso
      ctx.arc(w * 0.45, h * 0.77, 8, 0, Math.PI*2); // Head
      // Arms rubbing
      const rubbingOffset = Math.sin(performance.now() * 0.04) * 8;
      ctx.moveTo(w * 0.45, h * 0.81);
      ctx.lineTo(w * 0.48 + rubbingOffset, h * 0.83);
      ctx.stroke();

      // Cave art drawings progress stroke-by-stroke
      const drawingPct = Math.min(1, Math.max(0, (timeInScene - 3000) / 8000)); // paints from 3s to 11s
      
      cavePaintings.forEach(art => {
        ctx.save();
        ctx.translate(art.x, art.y);
        ctx.scale(art.scale, art.scale);
        
        ctx.strokeStyle = `rgba(180, 80, 30, ${drawingPct * 0.7})`;
        ctx.lineWidth = 4;
        
        if (art.type === 'horse') {
          // Draw path according to progress percentage
          ctx.beginPath();
          ctx.moveTo(0, 0);
          if (drawingPct > 0.2) ctx.quadraticCurveTo(50, -30, 80, -20);
          if (drawingPct > 0.4) ctx.quadraticCurveTo(110, -5, 130, -5);
          if (drawingPct > 0.6) ctx.lineTo(125, 15);
          if (drawingPct > 0.8) ctx.quadraticCurveTo(90, 5, 80, 20);
          if (drawingPct > 0.9) {
            ctx.lineTo(75, 70);
            ctx.moveTo(85, 20);
            ctx.quadraticCurveTo(30, 25, 0, 30);
            ctx.lineTo(-10, 80);
          }
          ctx.stroke();
        } 
        else if (art.type === 'bison') {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          if (drawingPct > 0.2) ctx.quadraticCurveTo(-40, -40, -80, -20); // hump
          if (drawingPct > 0.5) ctx.quadraticCurveTo(-110, 20, -70, 40); // head
          if (drawingPct > 0.8) {
            ctx.lineTo(-65, 80); // leg
            ctx.moveTo(-50, 40);
            ctx.quadraticCurveTo(0, 35, 20, 0); // belly
          }
          ctx.stroke();
        }
        ctx.restore();
      });
    }
    
    // --- 8. CORAL REEF (Colorful Swimming Fish & Flapping Turtles) ---
    else if (sceneId === 'reef') {
      // Swarming fish
      reefFish.forEach(f => {
        f.x += f.speed * f.dir * (delta / 16);
        f.wigglePhase += 0.22 * (delta / 16);

        if (f.dir === 1 && f.x > w + 50) f.x = -50;
        if (f.dir === -1 && f.x < -50) f.x = w + 50;

        ctx.fillStyle = f.color;
        ctx.beginPath();
        const noseX = f.x + (f.size * 0.8) * f.dir;
        const tailX = f.x - (f.size * 0.8) * f.dir;
        const tailOffset = Math.sin(f.wigglePhase) * 7;

        ctx.moveTo(noseX, f.y);
        ctx.quadraticCurveTo(f.x, f.y - f.size * 0.5, tailX, f.y + tailOffset);
        ctx.lineTo(tailX - 8 * f.dir, f.y - f.size * 0.35 + tailOffset);
        ctx.lineTo(tailX - 8 * f.dir, f.y + f.size * 0.35 + tailOffset);
        ctx.lineTo(tailX, f.y + tailOffset);
        ctx.quadraticCurveTo(f.x, f.y + f.size * 0.5, noseX, f.y);
        ctx.fill();
      });

      // Sea turtle swim
      reefTurtles.forEach(t => {
        t.x += t.speed * (delta / 16);
        t.flipperPhase += 0.055 * (delta / 16);

        if (t.x < -250) {
          t.x = w + 250;
          t.y = h * (0.35 + Math.random() * 0.4);
        }

        ctx.fillStyle = 'rgba(25, 75, 65, 0.9)';
        ctx.beginPath();
        ctx.ellipse(t.x, t.y, t.size, t.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(t.x - t.size * 1.2, t.y, t.size * 0.22, 0, Math.PI * 2);
        ctx.fill();

        // Upper flipper flaping
        const flipperSway = Math.sin(t.flipperPhase) * t.size * 0.9;
        ctx.beginPath();
        ctx.ellipse(t.x - t.size * 0.6, t.y - t.size * 0.25, t.size * 0.35, t.size * 1.0, -0.6 + flipperSway * 0.01, 0, Math.PI * 2);
        ctx.fill();
      });

      // Rising bubbles
      reefBubbles.forEach(b => {
        b.y += b.speedY * (delta / 16);
        b.driftPhase += b.driftSpeed;
        const driftX = Math.sin(b.driftPhase) * 3;

        if (b.y < -20) {
          b.y = h + 20;
          b.x = Math.random() * w;
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(b.x + driftX, b.y, b.r, 0, Math.PI * 2);
        ctx.stroke();
      });
    }
  }

  // ============================================
  // AUXILIARY LERP COLORS
  // ============================================
  function lerpColor(c1, c2, factor) {
    const r1 = (c1 >> 16) & 255;
    const g1 = (c1 >> 8) & 255;
    const b1 = c1 & 255;

    const r2 = (c2 >> 16) & 255;
    const g2 = (c2 >> 8) & 255;
    const b2 = c2 & 255;

    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    return (r << 16) + (g << 8) + b;
  }

  // ============================================
  // WINDOW RESIZE EVENT
  // ============================================
  function onWindowResize() {
    if (rendererMode === '3d') {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  // ============================================
  // CHRONOS SOUND + NARRATION ENGINE v6
  // - Natural calm TTS narration
  // - Cinematic Volcanic Eruptions (World of Fire)
  // - Realistic Prehistoric Dinosaur Roars (Dinosaurs)
  // - Audible ambient per era (ducked during speech)
  // ============================================

  var _ctx      = null;
  var _dest     = null;   // direct destination reference
  var _ambGain  = null;   // ambient bus gain (ducked during narration)
  var _ambNodes = [];
  var _soundEra = null;
  var _soundOn  = false;
  var _lastScene = -1;
  var _sfxTimer  = null;
  var _eraExtraTimers = [];

  // ---- Pink noise buffer (3s looping) ----
  function _pinkBuf() {
    var sr=_ctx.sampleRate, len=sr*3;
    var buf=_ctx.createBuffer(1,len,sr), d=buf.getChannelData(0);
    var b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for(var i=0;i<len;i++){
      var w=Math.random()*2-1;
      b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
      b2=0.969*b2+w*0.153852;    b3=0.8665*b3+w*0.3104856;
      b4=0.55*b4+w*0.5329522;    b5=-0.7616*b5-w*0.016898;
      d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926;
    }
    return buf;
  }

  // ---- Ambient helpers (go through ambGain bus -> destination) ----
  function _addNoise(freq, gain, filterType) {
    var src=_ctx.createBufferSource(); src.buffer=_pinkBuf(); src.loop=true;
    var f=_ctx.createBiquadFilter(); f.type=filterType||'bandpass';
    f.frequency.value=freq; f.Q.value=0.7;
    var g=_ctx.createGain(); g.gain.value=gain;
    src.connect(f); f.connect(g); g.connect(_ambGain); src.start();
    _ambNodes.push(src,f,g);
  }
  function _addOsc(type, freq, gain) {
    var o=_ctx.createOscillator(), g=_ctx.createGain();
    o.type=type; o.frequency.value=freq; g.gain.value=gain;
    o.connect(g); g.connect(_ambGain); o.start(); _ambNodes.push(o,g);
  }

  // ---- Sound effect helper (direct to output) ----
  function _sfxOsc(freq, type, gainPeak, duration, freqEnd) {
    var o=_ctx.createOscillator(), g=_ctx.createGain();
    var now=_ctx.currentTime;
    o.type=type||'sine'; o.frequency.setValueAtTime(freq,now);
    if(freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, now+duration);
    g.gain.setValueAtTime(gainPeak,now);
    g.gain.exponentialRampToValueAtTime(0.0001, now+duration);
    o.connect(g); g.connect(_dest); o.start(now); o.stop(now+duration+0.05);
  }
  function _sfxNoise(filterFreq, gainPeak, duration, filterType) {
    var src=_ctx.createBufferSource(); src.buffer=_pinkBuf(); src.loop=false;
    var f=_ctx.createBiquadFilter(); f.type=filterType||'bandpass';
    f.frequency.value=filterFreq; f.Q.value=0.5;
    var g=_ctx.createGain(); var now=_ctx.currentTime;
    g.gain.setValueAtTime(gainPeak,now);
    g.gain.exponentialRampToValueAtTime(0.0001, now+duration);
    src.connect(f); f.connect(g); g.connect(_dest); src.start(now);
  }

  // ============================================
  // VOLCANIC ERUPTION SOUND ENGINE
  // ============================================
  function _triggerVolcanoEruption(intensity) {
    if(!_ctx || _ctx.state !== 'running') return;
    intensity = intensity || 1.0;
    var now = _ctx.currentTime;

    // 1. Concussive Sub-Bass Volcanic Blast
    var blastOsc = _ctx.createOscillator();
    var blastGain = _ctx.createGain();
    blastOsc.type = 'sawtooth';
    blastOsc.frequency.setValueAtTime(160, now);
    blastOsc.frequency.exponentialRampToValueAtTime(24, now + 1.4);
    blastGain.gain.setValueAtTime(0.40 * intensity, now);
    blastGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

    var blastFlt = _ctx.createBiquadFilter();
    blastFlt.type = 'lowpass';
    blastFlt.frequency.setValueAtTime(220, now);
    blastFlt.frequency.exponentialRampToValueAtTime(55, now + 2.2);

    blastOsc.connect(blastFlt);
    blastFlt.connect(blastGain);
    blastGain.connect(_dest);
    blastOsc.start(now);
    blastOsc.stop(now + 2.9);

    // 2. High-Pressure Eruptive Gas & Lava Roar
    var roarSrc = _ctx.createBufferSource();
    roarSrc.buffer = _pinkBuf();
    roarSrc.loop = false;
    var roarGain = _ctx.createGain();
    var roarFlt = _ctx.createBiquadFilter();
    roarFlt.type = 'bandpass';
    roarFlt.Q.value = 1.4;
    roarFlt.frequency.setValueAtTime(140, now);
    roarFlt.frequency.linearRampToValueAtTime(680, now + 0.35);
    roarFlt.frequency.exponentialRampToValueAtTime(110, now + 3.6);

    roarGain.gain.setValueAtTime(0.01, now);
    roarGain.gain.linearRampToValueAtTime(0.45 * intensity, now + 0.22);
    roarGain.gain.exponentialRampToValueAtTime(0.0005, now + 4.0);

    roarSrc.connect(roarFlt);
    roarFlt.connect(roarGain);
    roarGain.connect(_dest);
    roarSrc.start(now);

    // 3. Sizzling Flying Magma & Falling Debris Crackles
    for (var i = 0; i < 9; i++) {
      var dTime = 0.25 + Math.random() * 2.5;
      var timerId = setTimeout(function() {
        if (!_ctx || _ctx.state !== 'running' || _soundEra !== 'earth') return;
        var t = _ctx.currentTime;
        var pSrc = _ctx.createBufferSource();
        pSrc.buffer = _pinkBuf();
        var pFlt = _ctx.createBiquadFilter();
        pFlt.type = 'highpass';
        pFlt.frequency.value = 1400 + Math.random() * 1600;
        var pGain = _ctx.createGain();
        pGain.gain.setValueAtTime((0.08 + Math.random() * 0.12) * intensity, t);
        pGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        pSrc.connect(pFlt);
        pFlt.connect(pGain);
        pGain.connect(_dest);
        pSrc.start(t);
      }, dTime * 1000);
      _eraExtraTimers.push(timerId);
    }
  }

  // ============================================
  // PREHISTORIC DINOSAUR ROAR ENGINE
  // ============================================
  function _triggerDinosaurRoar(variant) {
    if(!_ctx || _ctx.state !== 'running') return;
    var now = _ctx.currentTime;
    variant = variant || 'rex';

    if (variant === 'rex') {
      // 1. Dual Harmonic Vocal Chords (Sawtooth + Pulse)
      var osc1 = _ctx.createOscillator();
      var osc2 = _ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';

      // Pitch contour: predatory low rumble -> violent throat bellow -> deep guttural roar
      osc1.frequency.setValueAtTime(68, now);
      osc1.frequency.linearRampToValueAtTime(210, now + 0.32);
      osc1.frequency.exponentialRampToValueAtTime(145, now + 1.1);
      osc1.frequency.exponentialRampToValueAtTime(42, now + 2.8);

      // Detuned oscillator creates massive organic phasing
      osc2.frequency.setValueAtTime(71, now);
      osc2.frequency.linearRampToValueAtTime(216, now + 0.32);
      osc2.frequency.exponentialRampToValueAtTime(148, now + 1.1);
      osc2.frequency.exponentialRampToValueAtTime(44, now + 2.8);

      // Rapid vocal cord fluttering (tremolo LFO)
      var trem = _ctx.createOscillator();
      var tremGain = _ctx.createGain();
      trem.frequency.setValueAtTime(24, now); // 24 Hz guttural growl
      tremGain.gain.setValueAtTime(0.35, now);
      trem.connect(tremGain);

      var preAmp = _ctx.createGain();
      preAmp.gain.setValueAtTime(0.40, now);
      tremGain.connect(preAmp.gain);
      trem.start(now);
      trem.stop(now + 2.9);

      osc1.connect(preAmp);
      osc2.connect(preAmp);

      // 2. Animal Vocal Formant Filters (Simulates throat, jaw, and chest cavity)
      var f1 = _ctx.createBiquadFilter(); // Deep chest resonance
      f1.type = 'peaking';
      f1.frequency.setValueAtTime(360, now);
      f1.Q.value = 4.0;
      f1.gain.value = 15;

      var f2 = _ctx.createBiquadFilter(); // Mouth cavity resonance
      f2.type = 'peaking';
      f2.frequency.setValueAtTime(920, now);
      f2.Q.value = 3.5;
      f2.gain.value = 16;

      var f3 = _ctx.createBiquadFilter(); // Snarl formant
      f3.type = 'peaking';
      f3.frequency.setValueAtTime(1750, now);
      f3.Q.value = 2.5;
      f3.gain.value = 11;

      var lowpass = _ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(2800, now);
      lowpass.frequency.exponentialRampToValueAtTime(550, now + 2.8);

      preAmp.connect(f1);
      f1.connect(f2);
      f2.connect(f3);
      f3.connect(lowpass);

      // Main amplitude envelope
      var mainGain = _ctx.createGain();
      mainGain.gain.setValueAtTime(0.01, now);
      mainGain.gain.linearRampToValueAtTime(0.46, now + 0.28);
      mainGain.gain.setValueAtTime(0.42, now + 0.9);
      mainGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.9);

      lowpass.connect(mainGain);
      mainGain.connect(_dest);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.95);
      osc2.stop(now + 2.95);

      // 3. Ferocious Breath Turbulence / Open-Mouth Air Roar
      var breathSrc = _ctx.createBufferSource();
      breathSrc.buffer = _pinkBuf();
      var breathFlt = _ctx.createBiquadFilter();
      breathFlt.type = 'bandpass';
      breathFlt.frequency.setValueAtTime(750, now);
      breathFlt.frequency.linearRampToValueAtTime(1550, now + 0.32);
      breathFlt.frequency.exponentialRampToValueAtTime(350, now + 2.6);
      breathFlt.Q.value = 1.9;

      var breathGain = _ctx.createGain();
      breathGain.gain.setValueAtTime(0.01, now);
      breathGain.gain.linearRampToValueAtTime(0.32, now + 0.26);
      breathGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.7);

      breathSrc.connect(breathFlt);
      breathFlt.connect(breathGain);
      breathGain.connect(_dest);
      breathSrc.start(now);

      // 4. Prehistoric Jungle Echo Reverb
      var echo = _ctx.createDelay();
      echo.delayTime.value = 0.24;
      var echoFb = _ctx.createGain();
      echoFb.gain.value = 0.38;
      var echoFlt = _ctx.createBiquadFilter();
      echoFlt.type = 'lowpass';
      echoFlt.frequency.value = 1000;

      mainGain.connect(echo);
      echo.connect(echoFlt);
      echoFlt.connect(echoFb);
      echoFb.connect(echo);
      echoFlt.connect(_dest);

    } else {
      // Brachiosaurus bellowing trumpet call
      var bOsc = _ctx.createOscillator();
      var bGain = _ctx.createGain();
      bOsc.type = 'triangle';
      bOsc.frequency.setValueAtTime(90, now);
      bOsc.frequency.linearRampToValueAtTime(155, now + 0.7);
      bOsc.frequency.exponentialRampToValueAtTime(65, now + 2.5);

      bGain.gain.setValueAtTime(0.01, now);
      bGain.gain.linearRampToValueAtTime(0.36, now + 0.5);
      bGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);

      var bFlt = _ctx.createBiquadFilter();
      bFlt.type = 'bandpass';
      bFlt.frequency.value = 460;
      bFlt.Q.value = 3.2;

      bOsc.connect(bFlt);
      bFlt.connect(bGain);
      bGain.connect(_dest);
      bOsc.start(now);
      bOsc.stop(now + 2.7);
    }
  }

  // ---- Era periodic sound effects ----
  function _playSFX(eraId) {
    if(!_ctx||_ctx.state!=='running') return;
    if(eraId==='bigbang') {
      _sfxOsc(55,'sine',0.20,4,110);
      setTimeout(function(){ _sfxOsc(880,'sine',0.07,2); },1000);
    } else if(eraId==='earth') {
      _triggerVolcanoEruption(1.1);
    } else if(eraId==='ocean') {
      _sfxNoise(350,0.22,3,'bandpass');
      setTimeout(function(){ _sfxOsc(144,'sine',0.09,2); },500);
    } else if(eraId==='dinosaurs') {
      _triggerDinosaurRoar('rex');
    } else if(eraId==='meteor') {
      _sfxOsc(80,'sawtooth',0.32,2.5,15);
      setTimeout(function(){ _sfxNoise(300,0.22,2,'lowpass'); },200);
    } else if(eraId==='iceage') {
      _sfxNoise(600,0.20,3,'bandpass');
      [800,1600,2400].forEach(function(ms){
        setTimeout(function(){ _sfxOsc(1400+Math.random()*800,'sine',0.11,1.2); },ms);
      });
    } else if(eraId==='humans') {
      [0,350,750,1200,1900].forEach(function(ms){
        setTimeout(function(){ _sfxNoise(1800,0.13+Math.random()*0.08,0.4,'highpass'); },ms);
      });
    } else if(eraId==='reef') {
      [0,400,700,1050,1500,2100,2700].forEach(function(ms){
        setTimeout(function(){ _sfxOsc(1500+Math.random()*1500,'sine',0.10,0.18); },ms);
      });
    }
  }

  // ---- Start/stop SFX timer ----
  function _startSFXTimer(eraId) {
    if(_sfxTimer) clearInterval(_sfxTimer);
    _eraExtraTimers.forEach(function(id){ clearTimeout(id); });
    _eraExtraTimers = [];

    // Trigger immediate effects right when entering specific scenes
    if (eraId === 'earth') {
      // Immediate eruption as the world of fire appears!
      var t1 = setTimeout(function(){ if(_soundOn) _triggerVolcanoEruption(1.2); }, 800);
      var t2 = setTimeout(function(){ if(_soundOn) _triggerVolcanoEruption(0.85); }, 5800);
      var t3 = setTimeout(function(){ if(_soundOn) _triggerVolcanoEruption(1.0); }, 11500);
      _eraExtraTimers.push(t1, t2, t3);
    } else if (eraId === 'dinosaurs') {
      // Terrifying dinosaur roar in the background right as scene starts!
      var d1 = setTimeout(function(){ if(_soundOn) _triggerDinosaurRoar('rex'); }, 1100);
      var d2 = setTimeout(function(){ if(_soundOn) _triggerDinosaurRoar('brachio'); }, 6200);
      var d3 = setTimeout(function(){ if(_soundOn) _triggerDinosaurRoar('rex'); }, 11800);
      _eraExtraTimers.push(d1, d2, d3);
    } else {
      var tInit = setTimeout(function(){ if(_soundOn) _playSFX(eraId); }, 2000);
      _eraExtraTimers.push(tInit);
    }

    _sfxTimer = setInterval(function(){
      if(_soundOn && _soundEra) _playSFX(_soundEra);
    }, 11000);
  }

  function _stopSFXTimer() {
    if(_sfxTimer){ clearInterval(_sfxTimer); _sfxTimer=null; }
    _eraExtraTimers.forEach(function(id){ clearTimeout(id); });
    _eraExtraTimers = [];
  }

  // ---- Kill ambient nodes ----
  function _stopAmbient() {
    _stopSFXTimer();
    _ambNodes.forEach(function(n){
      try{n.stop&&n.stop(0);}catch(e){}
      try{n.disconnect();}catch(e){}
    });
    _ambNodes=[]; _soundEra=null;
  }

  // ---- Era ambient sound definitions ----
  var _ERAS = {
    bigbang:   function(){ _addNoise(900,0.22);  _addOsc('sine',55,0.18); _addOsc('sine',220,0.09); _addOsc('sine',440,0.045); },
    earth:     function(){
      // Active volcanic boiling earth: low rumble + roaring gas + boiling magma
      _addNoise(120,0.45,'lowpass');
      _addNoise(380,0.28,'bandpass');
      _addNoise(2200,0.08,'highpass'); // sizzling lava vents
      _addOsc('sawtooth',36,0.16);
      _addOsc('sine',52,0.14);
      _addOsc('triangle',74,0.08);
    },
    ocean:     function(){ _addNoise(360,0.20);  _addOsc('sine',72,0.16); _addOsc('sine',144,0.08); _addOsc('sine',528,0.04); },
    dinosaurs: function(){
      // Prehistoric jungle atmosphere
      _addNoise(540,0.20);
      _addOsc('sine',44,0.18); // deep earth resonance
      _addOsc('sine',640,0.045);
      _addNoise(1600,0.04,'highpass'); // jungle canopy rustle
    },
    meteor:    function(){ _addNoise(90,0.42,'lowpass');  _addOsc('sine',28,0.28); _addOsc('sawtooth',52,0.10); },
    iceage:    function(){ _addNoise(520,0.25);  _addOsc('triangle',55,0.16); _addOsc('sine',1200,0.03); },
    humans:    function(){ _addNoise(950,0.18);  _addOsc('sine',90,0.16); _addOsc('triangle',175,0.10); },
    reef:      function(){ _addNoise(580,0.18);  _addOsc('triangle',220,0.15); _addOsc('sine',440,0.08); _addOsc('sine',880,0.04); }
  };

  function _playAmbient(eraId) {
    if(!_soundOn||!_ctx||_ctx.state!=='running') return;
    if(_soundEra===eraId) return;
    _stopAmbient();
    _soundEra=eraId;
    if(_ERAS[eraId]) _ERAS[eraId]();
    _startSFXTimer(eraId);
  }

  // ---- Best calm voice ----
  function _bestVoice() {
    var vv=window.speechSynthesis.getVoices();
    var pick=['Google UK English Female','Google UK English Male',
              'Microsoft Aria Online (Natural) - English (United States)',
              'Microsoft Jenny Online (Natural) - English (United States)',
              'Google US English','Samantha','Karen'];
    for(var i=0;i<pick.length;i++){
      var v=vv.find(function(x){return x.name===pick[i];});
      if(v) return v;
    }
    return vv.find(function(v){return v.lang==='en-GB';})||
           vv.find(function(v){return v.lang==='en-US';})||
           vv.find(function(v){return v.lang.startsWith('en');})||null;
  }

  // ---- Narrate with ducking ----
  function _narrate(sceneData) {
    if(!_soundOn||!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var utt=new SpeechSynthesisUtterance(sceneData.title+'. '+sceneData.subtitle);
    utt.lang='en-US'; utt.rate=0.80; utt.pitch=0.92; utt.volume=1.0;
    var v=_bestVoice(); if(v) utt.voice=v;

    // Duck ambient while speaking (volcano & dinosaur roars bypass ducking!)
    utt.onstart=function(){
      if(_ambGain&&_ctx) _ambGain.gain.setTargetAtTime(0.18,_ctx.currentTime,0.4);
    };
    function _restore(){ if(_ambGain&&_ctx) _ambGain.gain.setTargetAtTime(1.0,_ctx.currentTime,1.5); }
    utt.onend=_restore; utt.onerror=_restore;

    var wordCount=(sceneData.title+' '+sceneData.subtitle).split(' ').length;
    var estMs=Math.ceil(wordCount/2.2)*1000;
    setTimeout(_restore, estMs+2000);
    window.speechSynthesis.speak(utt);
  }

  // ---- Per-frame watcher ----
  function _tick(){
    if(_soundOn&&_lastScene!==currentSceneIndex){
      _lastScene=currentSceneIndex;
      var sd=SCENES[currentSceneIndex];
      _playAmbient(sd.id);
      setTimeout(function(){_narrate(sd);},600);
    }
    requestAnimationFrame(_tick);
  }

  // ---- UI ----
  function _createUI(){
    var btn=document.createElement('button');
    btn.id='chronos-snd-btn';
    btn.innerHTML='&#128263;&nbsp;Sound &amp; Narration';
    btn.style.cssText=[
      'position:fixed','top:16px','right:16px','z-index:9999',
      'background:rgba(0,0,0,0.78)','color:#ccc',
      'border:2px solid rgba(255,255,255,0.28)','border-radius:24px',
      'padding:10px 20px','font-size:13px','font-weight:600',
      'font-family:sans-serif','letter-spacing:0.5px','cursor:pointer',
      'backdrop-filter:blur(14px)','-webkit-backdrop-filter:blur(14px)',
      'box-shadow:0 2px 18px rgba(0,0,0,0.6)','transition:all 0.25s'
    ].join(';');

    btn.addEventListener('click', async function(){
      _soundOn=!_soundOn;
      if(_soundOn){
        if(!_ctx){
          _ctx=new (window.AudioContext||window.webkitAudioContext)();
          _dest=_ctx.destination;
          _ambGain=_ctx.createGain(); _ambGain.gain.value=1.0;
          _ambGain.connect(_dest);
        }
        if(_ctx.state==='suspended') await _ctx.resume();
        btn.innerHTML='&#128266;&nbsp;Sound &amp; Narration';
        btn.style.borderColor='rgba(100,255,180,0.6)';
        btn.style.color='#b0ffcc';
        btn.style.boxShadow='0 2px 24px rgba(0,255,120,0.25)';
        _soundEra=null; _lastScene=-1;
        var sd=SCENES[currentSceneIndex];
        _playAmbient(sd.id);
        setTimeout(function(){_narrate(sd);},500);
      } else {
        btn.innerHTML='&#128263;&nbsp;Sound &amp; Narration';
        btn.style.borderColor='rgba(255,255,255,0.28)';
        btn.style.color='#ccc';
        btn.style.boxShadow='0 2px 18px rgba(0,0,0,0.6)';
        _stopAmbient();
        window.speechSynthesis&&window.speechSynthesis.cancel();
        if(_ambGain&&_ctx) _ambGain.gain.setTargetAtTime(0,_ctx.currentTime,0.3);
      }
    });
    document.body.appendChild(btn);
    requestAnimationFrame(_tick);
  }

  // ---------- Bootstrap ----------
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){init();_createUI();});
  } else { init(); _createUI(); }

})();
