import * as THREE from 'three';

// --- CONFIGURATION & STATE ---
let scene, camera, renderer;
let busGroup, wheels = [];
let groundPlane;
let lights = {};
let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
let currentTargetLookAt = new THREE.Vector3(0, 0, 0);

// Camera path positions for each section
const cameraPositions = {
  sec1: { x: 4.2, y: 1.2, z: 5.8, lookX: 0, lookY: 0.1, lookZ: 0 },   // Front-three-quarter cinematic
  sec2: { x: -6.0, y: 0.7, z: 1.0, lookX: 0, lookY: 0, lookZ: 0 },    // Full profile side view
  sec3: { x: 0.6, y: 0.8, z: 3.5, lookX: 0, lookY: 0.4, lookZ: 1.8 }, // Cockpit zoom
  sec4: { x: 0.0, y: 1.5, z: 7.2, lookX: 0, lookY: 0.3, lookZ: -3.0 }  // Back center, watching it drive away
};

// Current target camera parameters (which GSAP will animate)
const activeCam = {
  x: cameraPositions.sec1.x,
  y: cameraPositions.sec1.y,
  z: cameraPositions.sec1.z,
  lookX: cameraPositions.sec1.lookX,
  lookY: cameraPositions.sec1.lookY,
  lookZ: cameraPositions.sec1.lookZ,
  busZ: 0,
  busRotationY: -Math.PI / 6.5,
  wheelRotationSpeed: 0,
  lightIntensity: 4.5
};

// --- DOM ELEMENTS ---
const loader = document.getElementById('loader');
const progressBar = document.getElementById('progress-bar');
const navLinks = document.querySelectorAll('.nav-link');

// --- INITIALIZE WEBGL SCENE ---
function init() {
  const canvas = document.getElementById('webgl-canvas');

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05060b);
  scene.fog = new THREE.FogExp2(0x05060b, 0.045);

  // Camera
  camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(activeCam.x, activeCam.y, activeCam.z);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // Bus Group
  busGroup = new THREE.Group();
  scene.add(busGroup);

  // Build Scene Parts
  setupLights();
  buildGround();
  buildFuturisticBus();

  // Progress Loading
  updateProgress(60);

  // Event Listeners
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);

  // Register GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Bind UI Links
  setupNavigation();

  // Setup Scroll Animation Timeline
  setupScrollTimeline();

  // Finalize Loader
  setTimeout(() => {
    updateProgress(100);
    setTimeout(hideLoader, 600);
  }, 1200);
}

// --- ROAD GROUND PLANE ---
function buildGround() {
  // Road plane with high specularity for reflections
  const groundGeom = new THREE.PlaneGeometry(100, 100);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x07080f,
    roughness: 0.35,
    metalness: 0.4
  });
  groundPlane = new THREE.Mesh(groundGeom, groundMat);
  groundPlane.rotation.x = -Math.PI / 2;
  groundPlane.position.y = -0.5;
  groundPlane.receiveShadow = true;
  scene.add(groundPlane);

  // Subtle grid overlay to give spatial references
  const gridHelper = new THREE.GridHelper(100, 50, 0x00f0ff, 0x111322);
  gridHelper.position.y = -0.49;
  scene.add(gridHelper);
}

// --- PROCEDURAL FUTURISTIC BUS MODEL ---
function buildFuturisticBus() {
  // Materials
  const bodyPaint = new THREE.MeshPhysicalMaterial({
    color: 0x141624,
    roughness: 0.15,
    metalness: 0.8,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });

  const bodyWhitePaint = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 0.8
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x000000,
    roughness: 0.05,
    transmission: 0.9,
    transparent: true,
    opacity: 0.35,
    thickness: 0.25
  });

  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x0c0c11,
    roughness: 0.75
  });

  const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.2,
    metalness: 0.9
  });

  const emissiveCyan = new THREE.MeshBasicMaterial({
    color: 0x00f0ff
  });

  const emissiveRed = new THREE.MeshBasicMaterial({
    color: 0xff0055
  });

  // 1. Lower Chassis (Dark Metallic)
  const chassisGeom = new THREE.BoxGeometry(2.1, 0.3, 5.8);
  const chassis = new THREE.Mesh(chassisGeom, bodyPaint);
  chassis.position.y = -0.15;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  busGroup.add(chassis);

  // 2. Main Body Cabin (Luxury White Ceramic/Glass Hybrid)
  const mainBodyGeom = new THREE.BoxGeometry(2.0, 1.1, 5.6);
  const mainBody = new THREE.Mesh(mainBodyGeom, bodyWhitePaint);
  mainBody.position.y = 0.55;
  mainBody.castShadow = true;
  mainBody.receiveShadow = true;
  busGroup.add(mainBody);

  // 3. Roof Aerodynamic Wing (Accent Blue/Purple/Cyan glow strip)
  const roofGeom = new THREE.BoxGeometry(1.98, 0.12, 5.2);
  const roof = new THREE.Mesh(roofGeom, bodyPaint);
  roof.position.y = 1.15;
  roof.castShadow = true;
  busGroup.add(roof);

  // 4. Windows (Futuristic Continuous Glass Ribbon)
  // Front Windshield (curved wrap-around style)
  const windshieldGeom = new THREE.BoxGeometry(1.92, 0.65, 0.1);
  const windshield = new THREE.Mesh(windshieldGeom, glassMaterial);
  windshield.position.set(0, 0.68, 2.76);
  busGroup.add(windshield);

  // Side Windows (Left & Right)
  const sideGlassGeom = new THREE.BoxGeometry(0.05, 0.55, 4.4);
  const leftGlass = new THREE.Mesh(sideGlassGeom, glassMaterial);
  leftGlass.position.set(1.01, 0.65, 0.3);
  busGroup.add(leftGlass);

  const rightGlass = leftGlass.clone();
  rightGlass.position.x = -1.01;
  busGroup.add(rightGlass);

  // 5. LED Headlight Arrays
  const lightBarGeom = new THREE.BoxGeometry(0.6, 0.04, 0.05);
  const leftHeadlight = new THREE.Mesh(lightBarGeom, emissiveCyan);
  leftHeadlight.position.set(0.6, 0.1, 2.86);
  busGroup.add(leftHeadlight);

  const rightHeadlight = leftHeadlight.clone();
  rightHeadlight.position.x = -0.6;
  busGroup.add(rightHeadlight);

  // Headlight spot cones (volumetric effect)
  const leftSpot = new THREE.SpotLight(0x00f0ff, 8, 15, Math.PI / 5, 0.6, 1);
  leftSpot.position.set(0.6, 0.1, 2.9);
  leftSpot.target.position.set(1.2, 0.1, 10);
  busGroup.add(leftSpot);
  busGroup.add(leftSpot.target);
  lights.leftSpot = leftSpot;

  const rightSpot = new THREE.SpotLight(0x00f0ff, 8, 15, Math.PI / 5, 0.6, 1);
  rightSpot.position.set(-0.6, 0.1, 2.9);
  rightSpot.target.position.set(-1.2, 0.1, 10);
  busGroup.add(rightSpot);
  busGroup.add(rightSpot.target);
  lights.rightSpot = rightSpot;

  // Rear RED tail light bar
  const rearLightGeom = new THREE.BoxGeometry(1.7, 0.05, 0.05);
  const rearLight = new THREE.Mesh(rearLightGeom, emissiveRed);
  rearLight.position.set(0, 0.6, -2.81);
  busGroup.add(rearLight);

  // 6. Wheels (4 detailed axles)
  const wheelGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 28);
  const hubGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.34, 28);

  const wheelPositions = [
    { x: 1.05, y: -0.3, z: 1.8 },  // Front Right
    { x: -1.05, y: -0.3, z: 1.8 }, // Front Left
    { x: 1.05, y: -0.3, z: -1.8 }, // Rear Right
    { x: -1.05, y: -0.3, z: -1.8 } // Rear Left
  ];

  wheelPositions.forEach((pos, idx) => {
    const wheelAssembly = new THREE.Group();
    wheelAssembly.position.set(pos.x, pos.y, pos.z);

    const tire = new THREE.Mesh(wheelGeom, tireMaterial);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheelAssembly.add(tire);

    const rim = new THREE.Mesh(hubGeom, rimMaterial);
    rim.rotation.z = Math.PI / 2;
    wheelAssembly.add(rim);

    busGroup.add(wheelAssembly);
    wheels.push(wheelAssembly);
  });
}

// --- DYNAMIC LIGHTING ---
function setupLights() {
  // Ambient Soft Fill
  const ambient = new THREE.AmbientLight(0x0a0b14, 1.5);
  scene.add(ambient);

  // Main shadow casting light
  const mainDir = new THREE.DirectionalLight(0xffffff, 1.8);
  mainDir.position.set(5, 8, 3);
  mainDir.castShadow = true;
  mainDir.shadow.mapSize.width = 1024;
  mainDir.shadow.mapSize.height = 1024;
  mainDir.shadow.camera.near = 0.5;
  mainDir.shadow.camera.far = 20;
  mainDir.shadow.bias = -0.0005;
  scene.add(mainDir);

  // Purple/Cyan ambient rim backlights
  const cyanRim = new THREE.DirectionalLight(0x00f0ff, 1.2);
  cyanRim.position.set(-6, 2, -4);
  scene.add(cyanRim);

  const purpleRim = new THREE.DirectionalLight(0xbd00ff, 0.8);
  purpleRim.position.set(6, 1, -4);
  scene.add(purpleRim);

  // Underglow Strip LED casting light underneath
  const underglow = new THREE.PointLight(0x00f0ff, 6, 5, 1.5);
  underglow.position.set(0, -0.4, 0);
  busGroup.add(underglow);
  lights.underglow = underglow;
}

// --- GSAP SCROLL TIMELINE ---
function setupScrollTimeline() {
  const sections = document.querySelectorAll('.scroll-section');
  
  // Create intersection observer / ScrollTrigger for fading section text
  sections.forEach((sec, idx) => {
    const content = sec.querySelector('.section-content');
    
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => {
        content.classList.add('active');
        updateActiveNavLink(idx);
      },
      onLeave: () => content.classList.remove('active'),
      onEnterBack: () => {
        content.classList.add('active');
        updateActiveNavLink(idx);
      },
      onLeaveBack: () => content.classList.remove('active')
    });
  });

  // Core scrub timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.scroll-wrapper',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.0 // Smooth scrubbing
    }
  });

  // Transition from Section 1 to Section 2 (Side profile)
  tl.to(activeCam, {
    x: cameraPositions.sec2.x,
    y: cameraPositions.sec2.y,
    z: cameraPositions.sec2.z,
    lookX: cameraPositions.sec2.lookX,
    lookY: cameraPositions.sec2.lookY,
    lookZ: cameraPositions.sec2.lookZ,
    busRotationY: Math.PI / 1.95, // Pivots profile
    wheelRotationSpeed: 2.5,
    duration: 1.5
  });

  // Transition from Section 2 to Section 3 (Cockpit Zoom)
  tl.to(activeCam, {
    x: cameraPositions.sec3.x,
    y: cameraPositions.sec3.y,
    z: cameraPositions.sec3.z,
    lookX: cameraPositions.sec3.lookX,
    lookY: cameraPositions.sec3.lookY,
    lookZ: cameraPositions.sec3.lookZ,
    busRotationY: Math.PI / 2.3, // Subtle angle
    wheelRotationSpeed: 1.2,
    duration: 1.5
  });

  // Transition from Section 3 to Section 4 (Drive off)
  tl.to(activeCam, {
    x: cameraPositions.sec4.x,
    y: cameraPositions.sec4.y,
    z: cameraPositions.sec4.z,
    lookX: cameraPositions.sec4.lookX,
    lookY: cameraPositions.sec4.lookY,
    lookZ: cameraPositions.sec4.lookZ,
    busRotationY: Math.PI, // Facing straight away
    busZ: -18.0, // Accelerates off screen!
    wheelRotationSpeed: 15.0,
    lightIntensity: 0.1, // Dims out headlights as it gets away
    duration: 2.0
  });
}

// --- USER INTERACTION EVENTS ---
function onMouseMove(event) {
  // Normalize coordinates (-1 to 1)
  mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.targetY = -(event.clientY / window.innerHeight) * 2 - 1;
}

function updatePhysics(time) {
  // Smoothly interpolate mouse parallax offset
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;

  // Apply camera position (Scroll position + mouse parallax tilt)
  camera.position.x = activeCam.x + mouse.x * 1.5;
  camera.position.y = activeCam.y - mouse.y * 1.0;
  camera.position.z = activeCam.z;

  // Animate target look-at coordinates smoothly
  currentTargetLookAt.x += (activeCam.lookX - currentTargetLookAt.x) * 0.05;
  currentTargetLookAt.y += (activeCam.lookY - currentTargetLookAt.y) * 0.05;
  currentTargetLookAt.z += (activeCam.lookZ - currentTargetLookAt.z) * 0.05;
  camera.lookAt(currentTargetLookAt);

  // Apply bus rotation and coordinates
  busGroup.rotation.y = activeCam.busRotationY;
  
  // Idle floating animation when parked (scroll position near 0)
  if (activeCam.busZ > -1.0) {
    busGroup.position.y = Math.sin(time * 0.0015) * 0.03;
    busGroup.position.z = activeCam.busZ;
  } else {
    // Accelerating off screen
    busGroup.position.y = 0;
    busGroup.position.z = activeCam.busZ;
  }

  // Rotate wheels
  if (activeCam.wheelRotationSpeed > 0.01) {
    wheels.forEach(wheel => {
      wheel.children[0].rotation.x += activeCam.wheelRotationSpeed * 0.04;
      wheel.children[1].rotation.x += activeCam.wheelRotationSpeed * 0.04;
    });
  }

  // Headlight intensities
  if (lights.leftSpot && lights.rightSpot) {
    lights.leftSpot.intensity = activeCam.lightIntensity;
    lights.rightSpot.intensity = activeCam.lightIntensity;
  }
}

// --- LOADER PROGRESS & NAVIGATION ---
function updateProgress(val) {
  if (progressBar) {
    progressBar.style.width = `${val}%`;
  }
}

function hideLoader() {
  if (loader) {
    loader.style.opacity = 0;
    loader.style.visibility = 'hidden';
  }
  
  // Trigger entry animation of first section
  const firstContent = document.querySelector('.section-content');
  if (firstContent) {
    firstContent.classList.add('active');
  }
}

function setupNavigation() {
  navLinks.forEach((link, idx) => {
    link.addEventListener('click', (e) => {
      if (link.classList.contains('nav-btn')) return; // Ignore contact booking action
      e.preventDefault();
      
      const sections = document.querySelectorAll('.scroll-section');
      const targetSec = sections[idx];
      if (targetSec) {
        window.scrollTo({
          top: targetSec.offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // Replay scroll trigger back to top
  const replayBtn = document.getElementById('btn-replay');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

function updateActiveNavLink(idx) {
  navLinks.forEach((link, i) => {
    if (i === idx) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// --- RENDER & TICK LOOP ---
function animate(time) {
  requestAnimationFrame(animate);

  updatePhysics(time);

  renderer.render(scene, camera);
}

// --- WINDOW RESIZE ---
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// --- INIT ---
window.addEventListener('DOMContentLoaded', () => {
  updateProgress(20);
  init();
  animate(0);
});

// Scroll navbar overlay styling
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});
