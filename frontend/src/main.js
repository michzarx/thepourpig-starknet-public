/**
 * The Pour Pig - A 3D Adventure Game
 * Built with Three.js
 */

import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { connect, disconnect, getAccount, getAddress, shortAddress } from './controller.js';
import {
  mintPig, startGame, submitScore, claimAchievement, hasAchievement,
  getPlayerPig, getPigAttributes, getPlayerScore,
  getLeaderboard, getDailySeed, getGamesPlayed,
  getDailyLeaderboard, getCurrentDay, getPlayerDailyScore, getPlayerStreak,
  rarityName, seededRandom,
} from './contract.js';

// ============================================================================
// PATTERN NAMES — VRF-driven unique pig skins
// ============================================================================
const PATTERN_LIST = [
  'Houndstooth',
  'Stripes',
  'Polka Dots',
  'Plaid',
  'Stars',
  'Diamond',
  'Chevron',
  'Camo',
];

function getPatternName(colorHue, rarity) {
  const idx = (colorHue + rarity * 37) % PATTERN_LIST.length;
  return PATTERN_LIST[idx];
}

function getPatternIndex(colorHue, rarity) {
  return (colorHue + rarity * 37) % PATTERN_LIST.length;
}

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
    // Character movement
    walkSpeed: 3,
    runSpeed: 6,
    backwardSpeed: 2,
    rotationSpeed: 4,

    // Camera settings
    cameraDistance: 4,
    cameraHeight: 2,
    cameraLookAtHeight: 1.0,

    // Spring-damper camera system
    cameraPositionLag: 0.04,
    cameraRotationLag: 0.03,
    cameraLookAtLag: 0.06,
    cameraMinHeight: 1.0,
    cameraTiltAngle: 0.15,

    // World boundaries (circular)
    worldRadius: 40,

    // Animation blend duration
    animationFadeDuration: 0.2,
};

// ============================================================================
// GAME STATE
// ============================================================================
const gameState = {
    isLoaded: false,
    currentAnimation: 'idle',
    pig: null,
    mixer: null,
    animations: {},
    clock: new THREE.Clock(),

    // Input state
    keys: {
        forward: false,
        backward: false,
        left: false,
        right: false,
        shift: false,
    },

    // Camera state for smooth spring-damper following
    cameraTarget: new THREE.Vector3(),
    cameraPosition: new THREE.Vector3(),
    cameraCurrentRotation: 0,
    cameraVelocity: new THREE.Vector3(),

    // Intro orbit — 360° showcase before gameplay
    introOrbit: true,
    introAngle: 0,
};

// ============================================================================
// SCENE SETUP
// ============================================================================
const container = document.getElementById('game-container');
const loadingScreen = document.getElementById('loading-screen');
const debugInfo = document.getElementById('debug-info');

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 30, 80);

// Create camera
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, CONFIG.cameraHeight, CONFIG.cameraDistance);

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

// ============================================================================
// LIGHTING
// ============================================================================
function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(20, 100, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.1;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3d5c3d, 0.4);
    scene.add(hemiLight);
}

// ============================================================================
// ENVIRONMENT CREATION
// ============================================================================
function createEnvironment() {
    const groundGeometry = new THREE.CircleGeometry(CONFIG.worldRadius + 5, 64);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a7c3f,
        roughness: 0.9,
        metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    createGrassPatches();
    createTrees();
    createRocks();
    createFlowers();
    createBoundaryMarkers();
}

function createGrassPatches() {
    const patchGeometry = new THREE.CircleGeometry(3, 8);
    const patchMaterial = new THREE.MeshStandardMaterial({
        color: 0x5a8c4f,
        roughness: 1,
    });

    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (CONFIG.worldRadius - 5);
        const patch = new THREE.Mesh(patchGeometry, patchMaterial);
        patch.position.set(
            Math.cos(angle) * radius,
            0.01,
            Math.sin(angle) * radius
        );
        patch.rotation.x = -Math.PI / 2;
        patch.scale.setScalar(0.5 + Math.random() * 1.5);
        scene.add(patch);
    }
}

function createTree(x, z) {
    const tree = new THREE.Group();

    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9,
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    trunk.castShadow = true;
    tree.add(trunk);

    const foliageMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        roughness: 0.8,
    });

    const foliagePositions = [
        { x: 0, y: 3, z: 0, scale: 1.5 },
        { x: 0.5, y: 2.5, z: 0.3, scale: 1 },
        { x: -0.4, y: 2.6, z: -0.3, scale: 1.1 },
        { x: 0, y: 3.8, z: 0, scale: 1 },
    ];

    foliagePositions.forEach(pos => {
        const foliageGeometry = new THREE.IcosahedronGeometry(pos.scale, 0);
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.set(pos.x, pos.y, pos.z);
        foliage.castShadow = true;
        tree.add(foliage);
    });

    tree.position.set(x, 0, z);
    tree.scale.setScalar(0.8 + Math.random() * 0.6);
    scene.add(tree);

    return tree;
}

function createTrees() {
    const treePositions = [];

    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 10 + Math.random() * (CONFIG.worldRadius - 15);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        let tooClose = false;
        for (const pos of treePositions) {
            const dist = Math.sqrt((x - pos.x) ** 2 + (z - pos.z) ** 2);
            if (dist < 5) {
                tooClose = true;
                break;
            }
        }

        if (!tooClose) {
            treePositions.push({ x, z });
            createTree(x, z);
        }
    }
}

function createRock(x, z, scale = 1) {
    const rockGeometry = new THREE.DodecahedronGeometry(scale, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.9,
        metalness: 0.1,
    });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.position.set(x, scale * 0.3, z);
    rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
}

function createRocks() {
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * (CONFIG.worldRadius - 10);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const scale = 0.3 + Math.random() * 0.8;
        createRock(x, z, scale);
    }
}

function createFlower(x, z) {
    const flower = new THREE.Group();

    const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.15;
    flower.add(stem);

    const colors = [0xFF69B4, 0xFFFF00, 0xFF6347, 0xFFFFFF, 0x9370DB];
    const petalColor = colors[Math.floor(Math.random() * colors.length)];
    const petalGeometry = new THREE.SphereGeometry(0.08, 6, 6);
    const petalMaterial = new THREE.MeshStandardMaterial({ color: petalColor });
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    petal.position.y = 0.35;
    flower.add(petal);

    flower.position.set(x, 0, z);
    scene.add(flower);
}

function createFlowers() {
    for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 3 + Math.random() * (CONFIG.worldRadius - 8);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        createFlower(x, z);
    }
}

function createBoundaryMarkers() {
    const postGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1.5, 6);
    const postMaterial = new THREE.MeshStandardMaterial({
        color: 0xDEB887,
        roughness: 0.8,
    });

    const numPosts = 24;
    for (let i = 0; i < numPosts; i++) {
        const angle = (i / numPosts) * Math.PI * 2;
        const x = Math.cos(angle) * CONFIG.worldRadius;
        const z = Math.sin(angle) * CONFIG.worldRadius;

        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.set(x, 0.75, z);
        post.castShadow = true;
        scene.add(post);
    }
}

// ============================================================================
// PIG MODEL LOADING
// ============================================================================
function loadPigModel() {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();

        console.log('Loading pig model...');

        loader.load(
            '/poorPIG.glb',
            (gltf) => {
                console.log('Pig model loaded successfully!');
                console.log('Available animations:', gltf.animations.map(a => a.name));

                const pig = gltf.scene;
                pig.position.set(0, 0, 0);
                pig.scale.setScalar(1);

                pig.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                scene.add(pig);
                gameState.pig = pig;

                gameState.mixer = new THREE.AnimationMixer(pig);

                gltf.animations.forEach((clip) => {
                    const name = clip.name.toLowerCase();
                    gameState.animations[name] = gameState.mixer.clipAction(clip);
                    console.log(`Registered animation: ${name}`);
                });

                if (gameState.animations['idle']) {
                    gameState.animations['idle'].play();
                    gameState.currentAnimation = 'idle';
                } else {
                    const firstAnim = Object.keys(gameState.animations)[0];
                    if (firstAnim) {
                        gameState.animations[firstAnim].play();
                        gameState.currentAnimation = firstAnim;
                    }
                }

                resolve(pig);
            },
            (progress) => {
                const percent = (progress.loaded / progress.total * 100).toFixed(0);
                console.log(`Loading: ${percent}%`);
            },
            (error) => {
                console.error('Error loading pig model:', error);
                reject(error);
            }
        );
    });
}

// ============================================================================
// ANIMATION HANDLING
// ============================================================================
function switchAnimation(newAnimationName) {
    if (gameState.currentAnimation === newAnimationName) return;

    const currentAction = gameState.animations[gameState.currentAnimation];
    const newAction = gameState.animations[newAnimationName];

    if (!newAction) {
        console.warn(`Animation '${newAnimationName}' not found`);
        return;
    }

    if (currentAction) {
        currentAction.fadeOut(CONFIG.animationFadeDuration);
    }

    newAction.reset();
    newAction.fadeIn(CONFIG.animationFadeDuration);
    newAction.play();

    gameState.currentAnimation = newAnimationName;
}

function updateAnimation() {
    const { keys } = gameState;
    const isMovingForward = keys.forward;
    const isMovingBackward = keys.backward;
    const isRunning = keys.shift && isMovingForward;

    if (isRunning) {
        switchAnimation('run');
    } else if (isMovingForward || isMovingBackward) {
        switchAnimation('walk');
    } else {
        switchAnimation('idle');
    }
}

// ============================================================================
// INPUT HANDLING
// ============================================================================
function setupInputHandling() {
    const keyMap = {
        'KeyW': 'forward',
        'ArrowUp': 'forward',
        'KeyS': 'backward',
        'ArrowDown': 'backward',
        'KeyA': 'left',
        'ArrowLeft': 'left',
        'KeyD': 'right',
        'ArrowRight': 'right',
        'ShiftLeft': 'shift',
        'ShiftRight': 'shift',
    };

    window.addEventListener('keydown', (event) => {
        const action = keyMap[event.code];
        if (action) {
            gameState.keys[action] = true;
            event.preventDefault();
        }
    });

    window.addEventListener('keyup', (event) => {
        const action = keyMap[event.code];
        if (action) {
            gameState.keys[action] = false;
            event.preventDefault();
        }
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());
}

// ============================================================================
// CHARACTER MOVEMENT
// ============================================================================
function updateCharacterMovement(deltaTime) {
    if (!gameState.pig) return;

    const { keys } = gameState;
    const pig = gameState.pig;

    if (keys.left) {
        pig.rotation.y += CONFIG.rotationSpeed * deltaTime;
    }
    if (keys.right) {
        pig.rotation.y -= CONFIG.rotationSpeed * deltaTime;
    }

    let speed = 0;
    if (keys.forward) {
        speed = keys.shift ? CONFIG.runSpeed : CONFIG.walkSpeed;
    } else if (keys.backward) {
        speed = -CONFIG.backwardSpeed;
    }

    if (speed !== 0) {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(pig.quaternion);

        const newPosition = pig.position.clone();
        newPosition.addScaledVector(direction, speed * deltaTime);

        const distanceFromCenter = Math.sqrt(newPosition.x ** 2 + newPosition.z ** 2);
        if (distanceFromCenter < CONFIG.worldRadius - 1) {
            pig.position.copy(newPosition);
        } else {
            const angle = Math.atan2(newPosition.z, newPosition.x);
            pig.position.x = Math.cos(angle) * (CONFIG.worldRadius - 1);
            pig.position.z = Math.sin(angle) * (CONFIG.worldRadius - 1);
        }
    }
}

// ============================================================================
// CAMERA FOLLOW - Spring-Damper System
// ============================================================================
function lerpAngle(current, target, t) {
    let diff = target - current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return current + diff * t;
}

function springDamp(current, target, velocity, smoothTime, deltaTime) {
    const omega = 2 / smoothTime;
    const x = omega * deltaTime;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

    const change = current - target;
    const temp = (velocity + omega * change) * deltaTime;

    const newVelocity = (velocity - omega * temp) * exp;
    const newValue = target + (change + temp) * exp;

    return { value: newValue, velocity: newVelocity };
}

function exitIntroOrbit() {
    if (!gameState.introOrbit) return;
    gameState.introOrbit = false;
    // Sync camera rotation to current intro angle so there's no jump
    gameState.cameraCurrentRotation = gameState.introAngle;
}

function startIntroOrbit() {
    gameState.introOrbit = true;
    gameState.introAngle = 0;
}

// Expose for demo/recording
window.startIntroOrbit = startIntroOrbit;
window.exitIntroOrbit = exitIntroOrbit;

function updateCamera(deltaTime) {
    if (!gameState.pig) return;

    const pig = gameState.pig;
    const dt = Math.min(deltaTime, 0.1);

    // Intro orbit: slowly rotate camera around pig
    if (gameState.introOrbit) {
        gameState.introAngle += dt * 0.5; // ~12s for full 360°
        const orbitRadius = CONFIG.cameraDistance + 1;
        const cx = pig.position.x + Math.sin(gameState.introAngle) * orbitRadius;
        const cz = pig.position.z + Math.cos(gameState.introAngle) * orbitRadius;
        const cy = pig.position.y + CONFIG.cameraHeight;

        camera.position.set(cx, cy, cz);
        camera.up.set(0, 1, 0);
        camera.lookAt(pig.position.x, pig.position.y + CONFIG.cameraLookAtHeight, pig.position.z);
        gameState.cameraPosition.set(cx, cy, cz);
        gameState.cameraTarget.set(pig.position.x, pig.position.y + CONFIG.cameraLookAtHeight, pig.position.z);
        return;
    }

    const targetRotation = pig.rotation.y;
    gameState.cameraCurrentRotation = lerpAngle(
        gameState.cameraCurrentRotation,
        targetRotation,
        1 - Math.pow(1 - CONFIG.cameraRotationLag, dt * 60)
    );

    const offsetX = Math.sin(gameState.cameraCurrentRotation) * CONFIG.cameraDistance;
    const offsetZ = Math.cos(gameState.cameraCurrentRotation) * CONFIG.cameraDistance;

    const idealPosition = new THREE.Vector3(
        pig.position.x + offsetX,
        pig.position.y + CONFIG.cameraHeight,
        pig.position.z + offsetZ
    );

    const springX = springDamp(
        gameState.cameraPosition.x,
        idealPosition.x,
        gameState.cameraVelocity.x,
        0.15,
        dt
    );
    const springY = springDamp(
        gameState.cameraPosition.y,
        idealPosition.y,
        gameState.cameraVelocity.y,
        0.2,
        dt
    );
    const springZ = springDamp(
        gameState.cameraPosition.z,
        idealPosition.z,
        gameState.cameraVelocity.z,
        0.15,
        dt
    );

    gameState.cameraPosition.set(springX.value, springY.value, springZ.value);
    gameState.cameraVelocity.set(springX.velocity, springY.velocity, springZ.velocity);

    if (gameState.cameraPosition.y < CONFIG.cameraMinHeight) {
        gameState.cameraPosition.y = CONFIG.cameraMinHeight;
        gameState.cameraVelocity.y = 0;
    }

    const idealLookAt = new THREE.Vector3(
        pig.position.x,
        pig.position.y + CONFIG.cameraLookAtHeight,
        pig.position.z
    );

    const lookAtLagFactor = 1 - Math.pow(1 - CONFIG.cameraLookAtLag, dt * 60);
    gameState.cameraTarget.lerp(idealLookAt, lookAtLagFactor);

    camera.position.copy(gameState.cameraPosition);
    camera.up.set(0, 1, 0);
    camera.lookAt(gameState.cameraTarget);
    camera.rotateX(-CONFIG.cameraTiltAngle);
}

// ============================================================================
// WINDOW RESIZE HANDLING
// ============================================================================
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// ============================================================================
// RENDER LOOP
// ============================================================================
// POLISH — PARTICLES, SOUNDS, POPUPS
// ============================================================================
const particles = []; // { mesh, velocity, life }

function spawnCoinParticles(worldPos, isGolden) {
    const count = isGolden ? 30 : 12;
    const color = isGolden ? 0xFFD700 : 0xf7931a;
    const geo = new THREE.SphereGeometry(0.06, 4, 4);

    for (let i = 0; i < count; i++) {
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
        const p = new THREE.Mesh(geo, mat);
        p.position.copy(worldPos);
        p.position.y += 0.6;
        scene.add(p);

        const speed = isGolden ? 4 : 2.5;
        const vel = new THREE.Vector3(
            (Math.random() - 0.5) * speed,
            Math.random() * speed * 1.2 + 1,
            (Math.random() - 0.5) * speed,
        );
        particles.push({ mesh: p, velocity: vel, life: 1.0 });
    }
}

function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt * 1.5;
        if (p.life <= 0) {
            scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            p.mesh.material.dispose();
            particles.splice(i, 1);
            continue;
        }
        p.velocity.y -= 9.8 * dt;
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.mesh.material.opacity = p.life;
        p.mesh.scale.setScalar(p.life);
    }
}

// Score popup — floating +10 / +50 at screen position of coin
function showScorePopup(worldPos, value) {
    const screenPos = worldPos.clone();
    screenPos.y += 1.2;
    screenPos.project(camera);
    const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;

    const el = document.createElement('div');
    el.className = `score-popup ${value >= GOLDEN_COIN_VALUE ? 'golden' : 'normal'}`;
    el.textContent = `+${value}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

// Achievement toast
function showAchievementToast(name) {
    const el = document.createElement('div');
    el.className = 'achievement-toast';
    el.textContent = `🏆 Achievement Unlocked: ${name}!`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
}

// Round banner (GO! / Time's Up!)
function showBanner(text) {
    const el = document.createElement('div');
    el.className = 'round-banner';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
}

// Screen shake
let shakeIntensity = 0;
let shakeDuration = 0;

function triggerScreenShake(intensity, duration) {
    shakeIntensity = intensity;
    shakeDuration = duration;
}

function updateScreenShake(dt) {
    if (shakeDuration <= 0) return;
    shakeDuration -= dt;
    const amt = shakeIntensity * (shakeDuration > 0 ? 1 : 0);
    camera.position.x += (Math.random() - 0.5) * amt;
    camera.position.y += (Math.random() - 0.5) * amt;
}

// Sound effects via Web Audio API (no files needed)
let audioCtx = null;

function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

function playCoinSound(isGolden) {
    try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (isGolden) {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
            osc.frequency.exponentialRampToValueAtTime(2640, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        } else {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(660, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.15);
        }
    } catch {}
}

function playRoundSound(isStart) {
    try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';

        if (isStart) {
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        } else {
            osc.frequency.setValueAtTime(660, ctx.currentTime);
            osc.frequency.setValueAtTime(440, ctx.currentTime + 0.2);
            osc.frequency.setValueAtTime(330, ctx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.6);
        }
    } catch {}
}

// ============================================================================
// COIN RUSH — COLLECTIBLES SYSTEM
// ============================================================================
const COIN_COUNT = 15;
const GOLDEN_COIN_VALUE = 50;
const NORMAL_COIN_VALUE = 10;
const COIN_COLLECT_RADIUS = 1.5;
const ROUND_DURATION = 50; // seconds (contract allows 65s, leave buffer for tx confirmation)

const coins = []; // { mesh, value, collected }
let goldenCoin = null;
let pigAttrs = null; // VRF attributes applied to gameplay
let coinModelTemplate = null; // Preloaded coin GLB

function loadCoinModel() {
    return new Promise((resolve) => {
        const loader = new GLTFLoader();
        loader.load('/coin.glb', (gltf) => {
            coinModelTemplate = gltf.scene;
            coinModelTemplate.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            console.log('Coin model loaded successfully!');
            resolve();
        }, undefined, (err) => {
            console.warn('Coin GLB failed to load, using fallback:', err);
            coinModelTemplate = null;
            resolve();
        });
    });
}

function createCoinMesh(value) {
    const isGolden = value === GOLDEN_COIN_VALUE;

    if (coinModelTemplate) {
        const group = coinModelTemplate.clone();
        const scale = isGolden ? 1.6 : 1.0;
        group.scale.setScalar(scale);

        // Tint golden coins — extra bright and obvious
        if (isGolden) {
            group.traverse((child) => {
                if (child.isMesh && child.material) {
                    const mat = child.material.clone();
                    mat.color = new THREE.Color(0xFFD700);
                    mat.emissive = new THREE.Color(0xFFAA00);
                    mat.emissiveIntensity = 1.2;
                    mat.metalness = 1.0;
                    mat.roughness = 0.05;
                    child.material = mat;
                }
            });
            // Large outer glow
            const glowGeo = new THREE.SphereGeometry(1.4, 16, 16);
            const glowMat = new THREE.MeshBasicMaterial({
                color: 0xFFD700,
                transparent: true,
                opacity: 0.2,
            });
            group.add(new THREE.Mesh(glowGeo, glowMat));
            // Inner bright glow
            const innerGlowGeo = new THREE.SphereGeometry(0.8, 16, 16);
            const innerGlowMat = new THREE.MeshBasicMaterial({
                color: 0xFFFF44,
                transparent: true,
                opacity: 0.3,
            });
            group.add(new THREE.Mesh(innerGlowGeo, innerGlowMat));
            // Point light so it illuminates surroundings
            const light = new THREE.PointLight(0xFFD700, 3, 8);
            light.position.set(0, 0.5, 0);
            group.add(light);
        }

        group.position.y = 0.6;
        return group;
    }

    // Fallback: procedural cylinder if GLB didn't load
    const group = new THREE.Group();
    const coinColor = isGolden ? 0xFFD700 : 0xf7931a;
    const coinSize = isGolden ? 0.5 : 0.3;
    const coinGeo = new THREE.CylinderGeometry(coinSize, coinSize, 0.08, 16);
    const coinMat = new THREE.MeshStandardMaterial({
        color: coinColor, metalness: 0.8, roughness: 0.2,
        emissive: coinColor, emissiveIntensity: isGolden ? 0.4 : 0.15,
    });
    const mesh = new THREE.Mesh(coinGeo, coinMat);
    mesh.rotation.x = Math.PI / 2;
    group.add(mesh);
    group.position.y = 0.6;
    return group;
}

function spawnCoins(seed) {
    clearCoins();
    const rng = seededRandom(seed);

    for (let i = 0; i < COIN_COUNT; i++) {
        const angle = rng() * Math.PI * 2;
        const radius = 5 + rng() * (CONFIG.worldRadius - 12);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const mesh = createCoinMesh(NORMAL_COIN_VALUE);
        mesh.position.x = x;
        mesh.position.z = z;
        scene.add(mesh);
        coins.push({ mesh, value: NORMAL_COIN_VALUE, collected: false });
    }

    // Golden coin — special daily position
    const gAngle = rng() * Math.PI * 2;
    const gRadius = 15 + rng() * (CONFIG.worldRadius - 25);
    const gx = Math.cos(gAngle) * gRadius;
    const gz = Math.sin(gAngle) * gRadius;

    const gMesh = createCoinMesh(GOLDEN_COIN_VALUE);
    gMesh.position.x = gx;
    gMesh.position.z = gz;
    scene.add(gMesh);
    goldenCoin = { mesh: gMesh, value: GOLDEN_COIN_VALUE, collected: false };
    coins.push(goldenCoin);
}

function clearCoins() {
    for (const c of coins) {
        scene.remove(c.mesh);
    }
    coins.length = 0;
    goldenCoin = null;
}

function animateCoins(time) {
    for (const c of coins) {
        if (c.collected) continue;
        c.mesh.rotation.y = time * 2;
        c.mesh.position.y = 0.6 + Math.sin(time * 3 + c.mesh.position.x) * 0.15;
    }
}

function checkCoinCollisions() {
    if (!gameState.pig || !roundState.active) return 0;
    let collected = 0;
    const pigPos = gameState.pig.position;

    for (const c of coins) {
        if (c.collected) continue;
        const dx = pigPos.x - c.mesh.position.x;
        const dz = pigPos.z - c.mesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < COIN_COLLECT_RADIUS) {
            const isGolden = c.value === GOLDEN_COIN_VALUE;
            const coinWorldPos = c.mesh.position.clone();

            c.collected = true;
            c.mesh.visible = false;
            collected += c.value;

            // Polish effects
            spawnCoinParticles(coinWorldPos, isGolden);
            showScorePopup(coinWorldPos, c.value);
            playCoinSound(isGolden);
            if (isGolden) {
                triggerScreenShake(0.15, 0.3);
            }
        }
    }
    return collected;
}

// ============================================================================
// POWER-UP SYSTEM
// ============================================================================
const POWERUP_TYPES = [
    { id: 'magnet',  color: 0x4488FF, emissive: 0x2244AA, label: '🧲 Magnet',  duration: 5 },
    { id: 'speed',   color: 0xFFDD00, emissive: 0xCC8800, label: '⚡ Speed',   duration: 4 },
    { id: 'freeze',  color: 0x44FFAA, emissive: 0x22AA66, label: '⏰ Freeze',  duration: 3 },
];
const POWERUP_COLLECT_RADIUS = 1.8;
const MAGNET_ATTRACT_RADIUS = 8;
const MAGNET_ATTRACT_SPEED = 12;

const powerUps = []; // { mesh, type, collected }
const activePowerUps = {}; // { magnet: { timeLeft, bonusDuration }, ... }
let powerUpParticles = []; // visual effect particles for active power-ups
let originalWalkSpeed = CONFIG.walkSpeed;
let originalRunSpeed = CONFIG.runSpeed;

function createPowerUpMesh(typeObj) {
    const group = new THREE.Group();

    if (typeObj.id === 'magnet') {
        // Blue torus (magnet ring)
        const torusGeo = new THREE.TorusGeometry(0.4, 0.12, 8, 16);
        const torusMat = new THREE.MeshStandardMaterial({
            color: typeObj.color, emissive: typeObj.emissive, emissiveIntensity: 0.8,
            metalness: 0.6, roughness: 0.2,
        });
        group.add(new THREE.Mesh(torusGeo, torusMat));
    } else if (typeObj.id === 'speed') {
        // Yellow octahedron (lightning bolt)
        const octGeo = new THREE.OctahedronGeometry(0.35, 0);
        const octMat = new THREE.MeshStandardMaterial({
            color: typeObj.color, emissive: typeObj.emissive, emissiveIntensity: 1.0,
            metalness: 0.7, roughness: 0.1,
        });
        group.add(new THREE.Mesh(octGeo, octMat));
    } else {
        // Green sphere (time freeze)
        const sphereGeo = new THREE.SphereGeometry(0.35, 16, 16);
        const sphereMat = new THREE.MeshStandardMaterial({
            color: typeObj.color, emissive: typeObj.emissive, emissiveIntensity: 0.8,
            metalness: 0.3, roughness: 0.3,
        });
        group.add(new THREE.Mesh(sphereGeo, sphereMat));
    }

    // Glow sphere
    const glowGeo = new THREE.SphereGeometry(0.7, 12, 12);
    const glowMat = new THREE.MeshBasicMaterial({
        color: typeObj.color, transparent: true, opacity: 0.15,
    });
    group.add(new THREE.Mesh(glowGeo, glowMat));

    // Point light
    const light = new THREE.PointLight(typeObj.color, 1.5, 5);
    light.position.set(0, 0.3, 0);
    group.add(light);

    group.position.y = 0.8;
    return group;
}

function spawnPowerUps(seed) {
    clearPowerUps();
    const rng = seededRandom(seed + 9999);

    for (let i = 0; i < POWERUP_TYPES.length; i++) {
        const typeObj = POWERUP_TYPES[i];
        const angle = rng() * Math.PI * 2;
        const radius = 8 + rng() * (CONFIG.worldRadius - 18);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const mesh = createPowerUpMesh(typeObj);
        mesh.position.x = x;
        mesh.position.z = z;
        scene.add(mesh);
        powerUps.push({ mesh, type: typeObj, collected: false });
    }
}

function clearPowerUps() {
    for (const p of powerUps) {
        scene.remove(p.mesh);
    }
    powerUps.length = 0;
    // Clear active effects
    for (const key of Object.keys(activePowerUps)) {
        delete activePowerUps[key];
    }
    powerUpParticles.forEach(p => { scene.remove(p.mesh); p.mesh.geometry.dispose(); p.mesh.material.dispose(); });
    powerUpParticles = [];
    // Restore speeds
    CONFIG.walkSpeed = originalWalkSpeed;
    CONFIG.runSpeed = originalRunSpeed;
}

function animatePowerUps(time) {
    for (const p of powerUps) {
        if (p.collected) continue;
        p.mesh.rotation.y = time * 3;
        p.mesh.position.y = 0.8 + Math.sin(time * 4 + p.mesh.position.x * 0.5) * 0.2;
        // Pulse scale
        const pulse = 1 + Math.sin(time * 5) * 0.1;
        p.mesh.scale.setScalar(pulse);
    }
}

function checkPowerUpCollisions() {
    if (!gameState.pig || !roundState.active) return;
    const pigPos = gameState.pig.position;

    for (const p of powerUps) {
        if (p.collected) continue;
        const dx = pigPos.x - p.mesh.position.x;
        const dz = pigPos.z - p.mesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < POWERUP_COLLECT_RADIUS) {
            p.collected = true;
            p.mesh.visible = false;

            // Calculate bonus duration from rarity
            let bonusDuration = 0;
            if (pigAttrs) {
                const r = pigAttrs.rarity;
                if (r === 1) bonusDuration = 0.5;
                else if (r === 2) bonusDuration = 1.0;
                else if (r === 3) bonusDuration = 1.5;
            }

            activatePowerUp(p.type, bonusDuration);
            playPowerUpSound(p.type.id);
            showBanner(p.type.label);
            spawnCoinParticles(p.mesh.position.clone(), true); // reuse particle burst
        }
    }
}

function activatePowerUp(typeObj, bonusDuration) {
    const totalDuration = typeObj.duration + bonusDuration;
    activePowerUps[typeObj.id] = { timeLeft: totalDuration, totalDuration };

    if (typeObj.id === 'speed') {
        CONFIG.walkSpeed = originalWalkSpeed * 2;
        CONFIG.runSpeed = originalRunSpeed * 2;
    }
}

function updatePowerUps(dt) {
    // Magnet effect: attract nearby coins
    if (activePowerUps.magnet && activePowerUps.magnet.timeLeft > 0 && gameState.pig) {
        const pigPos = gameState.pig.position;
        for (const c of coins) {
            if (c.collected) continue;
            const dx = pigPos.x - c.mesh.position.x;
            const dz = pigPos.z - c.mesh.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < MAGNET_ATTRACT_RADIUS && dist > 0.1) {
                const speed = MAGNET_ATTRACT_SPEED * dt;
                c.mesh.position.x += (dx / dist) * speed;
                c.mesh.position.z += (dz / dist) * speed;
            }
        }
        // Spawn magnet ring particles
        if (Math.random() < 0.3) {
            spawnPowerUpParticle(pigPos, 0x4488FF);
        }
    }

    // Freeze effect: pause timer
    const isFrozen = activePowerUps.freeze && activePowerUps.freeze.timeLeft > 0;

    // Speed effect particles
    if (activePowerUps.speed && activePowerUps.speed.timeLeft > 0 && gameState.pig) {
        if (Math.random() < 0.4) {
            const pos = gameState.pig.position.clone();
            pos.y += 0.5;
            spawnPowerUpParticle(pos, 0xFFDD00);
        }
    }

    // Freeze effect particles
    if (isFrozen && Math.random() < 0.2) {
        const edge = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            Math.random() * 2,
            0,
        );
        if (gameState.pig) {
            edge.add(gameState.pig.position);
        }
        spawnPowerUpParticle(edge, 0x44FFAA);
    }

    // Tick down active power-ups
    for (const key of Object.keys(activePowerUps)) {
        const pu = activePowerUps[key];
        if (isFrozen && key !== 'freeze') {
            // Don't tick other power-ups while frozen
        } else {
            pu.timeLeft -= dt;
        }
        if (pu.timeLeft <= 0) {
            // Deactivate
            if (key === 'speed') {
                CONFIG.walkSpeed = originalWalkSpeed;
                CONFIG.runSpeed = originalRunSpeed;
            }
            delete activePowerUps[key];
        }
    }

    // Update power-up particles
    for (let i = powerUpParticles.length - 1; i >= 0; i--) {
        const p = powerUpParticles[i];
        p.life -= dt * 2;
        if (p.life <= 0) {
            scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            p.mesh.material.dispose();
            powerUpParticles.splice(i, 1);
            continue;
        }
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.mesh.material.opacity = p.life;
        p.mesh.scale.setScalar(p.life * 0.5);
    }

    return isFrozen;
}

function spawnPowerUpParticle(pos, color) {
    const geo = new THREE.SphereGeometry(0.05, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    scene.add(mesh);
    const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.5 + 0.5,
        (Math.random() - 0.5) * 2,
    );
    powerUpParticles.push({ mesh, velocity: vel, life: 1.0 });
}

function playPowerUpSound(typeId) {
    try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (typeId === 'magnet') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(120, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.4);
        } else if (typeId === 'speed') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.25);
        } else {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1000, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        }
    } catch {}
}

function getPowerUpHUDText() {
    const parts = [];
    for (const key of Object.keys(activePowerUps)) {
        const pu = activePowerUps[key];
        const type = POWERUP_TYPES.find(t => t.id === key);
        if (type && pu.timeLeft > 0) {
            parts.push(`${type.label} ${pu.timeLeft.toFixed(1)}s`);
        }
    }
    return parts.length > 0 ? ' | ' + parts.join(' ') : '';
}

// VRF rarity → starting power-ups
function grantRarityPowerUps() {
    if (!pigAttrs) return;
    const r = pigAttrs.rarity;
    if (r === 0) return; // Common: no starting power-ups

    const available = [...POWERUP_TYPES];
    const count = r >= 3 ? 2 : 1; // Legendary=2, Uncommon/Rare=1
    let bonusDuration = 0;
    if (r === 1) bonusDuration = 0.5;
    else if (r === 2) bonusDuration = 1.0;
    else if (r === 3) bonusDuration = 1.5;

    for (let i = 0; i < count && available.length > 0; i++) {
        const idx = Math.floor(Math.random() * available.length);
        const typeObj = available.splice(idx, 1)[0];
        activatePowerUp(typeObj, bonusDuration);
        showAchievementToast(`Rarity bonus: ${typeObj.label}!`);
    }
}

// ============================================================================
// ROUND STATE
// ============================================================================
const roundState = {
    active: false,
    startTime: 0,
    timeLeft: ROUND_DURATION,
    score: 0,
};

// ============================================================================
// BLOCKCHAIN UI + COIN RUSH FLOW
// ============================================================================
const walletBtn = document.getElementById('wallet-btn');
const playerInfo = document.getElementById('player-info');
const playerAddress = document.getElementById('player-address');
const playerScoreEl = document.getElementById('player-score');
const mintPanel = document.getElementById('mint-panel');
const mintBtn = document.getElementById('mint-btn');
const mintStatus = document.getElementById('mint-status');
const pigStats = document.getElementById('pig-stats');
const gameHud = document.getElementById('game-hud');
const hudScore = document.getElementById('hud-score');
const submitScoreBtn = document.getElementById('submit-score-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const leaderboardPanel = document.getElementById('leaderboard-panel');
const leaderboardList = document.getElementById('leaderboard-list');
const closeLeaderboard = document.getElementById('close-leaderboard');
const achievementsBtn = document.getElementById('achievements-btn');
const achievementsPanel = document.getElementById('achievements-panel');
const achievementsList = document.getElementById('achievements-list');
const closeAchievements = document.getElementById('close-achievements');

console.log('Leaderboard button element:', leaderboardBtn);
console.log('Leaderboard panel element:', leaderboardPanel);

let hasPig = false;
let bestScore = 0;

// Wallet connect/disconnect
walletBtn.addEventListener('click', async () => {
  if (getAccount()) {
    await disconnect();
    walletBtn.textContent = 'Connect Wallet';
    walletBtn.classList.remove('connected');
    playerInfo.classList.add('hidden');
    mintPanel.classList.add('hidden');
    pigStats.classList.add('hidden');
    gameHud.classList.add('hidden');
    achievementsBtn.classList.add('hidden');
    achievementsPanel.classList.add('hidden');
    dailyBanner.classList.add('hidden');
    if (dailyBannerInterval) { clearInterval(dailyBannerInterval); dailyBannerInterval = null; }
    hasPig = false;
    endRound();
    return;
  }

  try {
    walletBtn.textContent = 'Connecting...';
    const acct = await connect();
    console.log('Connected account:', acct);
    const addr = getAddress();
    console.log('Address:', addr);
    if (!addr) {
      console.error('No address after connect');
      walletBtn.textContent = 'Connect Wallet';
      return;
    }
    walletBtn.textContent = shortAddress(addr);
    walletBtn.classList.add('connected');
    playerInfo.classList.remove('hidden');
    playerAddress.textContent = shortAddress(addr);

    console.log('Checking for existing pig...');
    const tokenId = await getPlayerPig(addr);
    console.log('Player pig tokenId:', tokenId);
    if (tokenId > 0) {
      hasPig = true;
      await showPigStats(tokenId);
      bestScore = await getPlayerScore(addr);
      playerScoreEl.textContent = `Best: ${bestScore}`;
      gameHud.classList.remove('hidden');
      achievementsBtn.classList.remove('hidden');
      leaderboardBtn.classList.remove('hidden');
      submitScoreBtn.textContent = 'Start Round';
      submitScoreBtn.classList.remove('hidden');
      startDailyBannerUpdates();
    } else {
      console.log('No pig found, showing mint panel');
      mintPanel.classList.remove('hidden');
    }
  } catch (e) {
    console.error('Connect failed:', e);
    walletBtn.textContent = 'Connect Wallet';
  }
});

// Mint pig
mintBtn.addEventListener('click', async () => {
  try {
    mintBtn.disabled = true;
    mintStatus.textContent = 'Requesting VRF + Minting...';
    await mintPig();
    mintStatus.textContent = 'Minted! Loading attributes...';

    const addr = getAddress();
    const tokenId = await getPlayerPig(addr);
    hasPig = true;
    mintPanel.classList.add('hidden');

    // Fetch score (should be 0 for newly minted pig)
    bestScore = await getPlayerScore(addr);
    playerScoreEl.textContent = `Best: ${bestScore}`;

    await showPigStats(tokenId);
    gameHud.classList.remove('hidden');
    achievementsBtn.classList.remove('hidden');
    leaderboardBtn.classList.remove('hidden');
    submitScoreBtn.textContent = 'Start Round';
    submitScoreBtn.classList.remove('hidden');
    startDailyBannerUpdates();
    startIntroOrbit();
  } catch (e) {
    console.error('Mint failed:', e);
    mintStatus.textContent = `Mint failed: ${e.message || e}`;
    mintBtn.disabled = false;
  }
});

async function showPigStats(tokenId) {
  const attrs = await getPigAttributes(tokenId);
  if (!attrs) return;
  pigAttrs = attrs;

  const patternName = getPatternName(attrs.colorHue, attrs.rarity);
  document.getElementById('pig-color').textContent = `Pattern: ${patternName}`;
  document.getElementById('pig-speed').textContent = `Speed: +${attrs.speedBonus}`;
  document.getElementById('pig-size').classList.add('hidden');
  document.getElementById('pig-rarity').textContent = `Rarity: ${rarityName(attrs.rarity)}`;
  pigStats.classList.remove('hidden');

  applyPigAttributes(attrs);
}

function applyPigAttributes(attrs) {
  if (!gameState.pig) return;

  // Generate pattern texture and apply to pig
  const patternIdx = getPatternIndex(attrs.colorHue, attrs.rarity);
  const hue = attrs.colorHue / 360;
  const patternTexture = generatePatternTexture(patternIdx, hue);
  console.log('Applying pattern:', PATTERN_LIST[patternIdx], 'hue:', attrs.colorHue);

  gameState.pig.traverse((child) => {
    if (child.isMesh && child.material) {
      const mat = child.material.clone();
      const originalMap = child.material.map;

      if (originalMap && originalMap.image) {
        // Blend pattern over original texture, preserving eyes/face details
        const blended = blendPatternOverTexture(originalMap.image, patternTexture.image);
        const blendedTex = new THREE.CanvasTexture(blended);
        blendedTex.flipY = originalMap.flipY;
        blendedTex.wrapS = originalMap.wrapS;
        blendedTex.wrapT = originalMap.wrapT;
        blendedTex.colorSpace = originalMap.colorSpace;
        mat.map = blendedTex;
      } else {
        // No original texture — apply pattern directly
        mat.map = patternTexture;
      }

      mat.color = new THREE.Color(1, 1, 1);
      mat.needsUpdate = true;
      child.material = mat;
    }
  });

  // Fixed size — no gameplay advantage from mint RNG
  gameState.pig.scale.setScalar(1.0);

  // Apply speed bonus — affects actual movement speed!
  const speedMultiplier = 1 + (attrs.speedBonus / 20) * 0.5; // 0-20 → 1.0x-1.5x
  CONFIG.walkSpeed = 3 * speedMultiplier;
  CONFIG.runSpeed = 6 * speedMultiplier;
  CONFIG.backwardSpeed = 2 * speedMultiplier;
}

// Blend pattern over original texture, preserving dark features (eyes, nostrils, mouth)
function blendPatternOverTexture(originalImage, patternCanvas) {
  const w = originalImage.width || originalImage.naturalWidth;
  const h = originalImage.height || originalImage.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Draw original texture first (eyes, face, all details)
  ctx.drawImage(originalImage, 0, 0, w, h);

  // Read original pixels to detect dark features (eyes, nostrils, outlines)
  const origData = ctx.getImageData(0, 0, w, h);
  const origPixels = origData.data;

  // Draw pattern scaled to match original texture size
  ctx.globalAlpha = 0.45; // Pattern overlay strength
  ctx.drawImage(patternCanvas, 0, 0, w, h);
  ctx.globalAlpha = 1.0;

  // Read the blended result
  const blendedData = ctx.getImageData(0, 0, w, h);
  const blendedPixels = blendedData.data;

  // Restore dark pixels from original (eyes, nostrils, outlines, mouth)
  // Dark = luminance below threshold → keep original pixel untouched
  const darkThreshold = 100;
  for (let i = 0; i < origPixels.length; i += 4) {
    const r = origPixels[i], g = origPixels[i + 1], b = origPixels[i + 2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    if (luminance < darkThreshold) {
      // This is a dark feature pixel — restore original
      blendedPixels[i] = r;
      blendedPixels[i + 1] = g;
      blendedPixels[i + 2] = b;
      blendedPixels[i + 3] = origPixels[i + 3];
    }
  }

  ctx.putImageData(blendedData, 0, 0);
  return canvas;
}

// ============================================================================
// PATTERN TEXTURE GENERATOR — Canvas2D → Three.js Texture
// ============================================================================
function generatePatternTexture(patternIdx, hue) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base pig skin color (warm pink-beige)
  const baseR = 210, baseG = 160, baseB = 130;
  ctx.fillStyle = `rgb(${baseR},${baseG},${baseB})`;
  ctx.fillRect(0, 0, size, size);

  // Pattern color from VRF hue — balanced contrast for visibility
  const pc = hslToRgb(hue, 0.8, 0.32);  // Moderate saturation and darkness
  const patternColor = `rgb(${pc[0]},${pc[1]},${pc[2]})`;
  const pc2 = hslToRgb((hue + 0.15) % 1, 0.7, 0.45);
  const accentColor = `rgb(${pc2[0]},${pc2[1]},${pc2[2]})`;

  switch (patternIdx) {
    case 0: drawHoundstooth(ctx, size, patternColor); break;
    case 1: drawStripes(ctx, size, patternColor, accentColor); break;
    case 2: drawPolkaDots(ctx, size, patternColor); break;
    case 3: drawPlaid(ctx, size, patternColor, accentColor); break;
    case 4: drawStars(ctx, size, patternColor); break;
    case 5: drawDiamond(ctx, size, patternColor, accentColor); break;
    case 6: drawChevron(ctx, size, patternColor); break;
    case 7: drawCamo(ctx, size, hue); break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.flipY = false;
  return texture;
}

// HSL to RGB helper (h: 0-1, s: 0-1, l: 0-1) → [r,g,b] 0-255
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Pattern 0: Houndstooth
function drawHoundstooth(ctx, size, color) {
  const cellSize = size / 16;
  ctx.fillStyle = color;
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      // Classic houndstooth: draw notched check pattern
      if ((row + col) % 2 === 0) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellSize, y);
        ctx.lineTo(x + cellSize, y + cellSize / 2);
        ctx.lineTo(x + cellSize / 2, y + cellSize);
        ctx.lineTo(x, y + cellSize);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(x + cellSize, y);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.lineTo(x, y + cellSize);
        ctx.lineTo(x, y + cellSize / 2);
        ctx.lineTo(x + cellSize / 2, y);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
}

// Pattern 1: Stripes
function drawStripes(ctx, size, color, accent) {
  const stripeW = size / 12;
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = i % 3 === 0 ? color : (i % 3 === 1 ? accent : 'transparent');
    if (i % 3 !== 2) {
      ctx.fillRect(0, i * stripeW, size, stripeW);
    }
  }
}

// Pattern 2: Polka Dots
function drawPolkaDots(ctx, size, color) {
  const dotR = size / 24;
  const spacing = size / 8;
  ctx.fillStyle = color;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const offsetX = (row % 2) * (spacing / 2);
      ctx.beginPath();
      ctx.arc(col * spacing + offsetX, row * spacing, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Pattern 3: Plaid
function drawPlaid(ctx, size, color, accent) {
  ctx.globalAlpha = 0.4;
  const bandW = size / 8;
  // Horizontal bands
  ctx.fillStyle = color;
  for (let i = 0; i < 8; i += 2) {
    ctx.fillRect(0, i * bandW, size, bandW);
  }
  // Vertical bands
  ctx.fillStyle = accent;
  for (let i = 0; i < 8; i += 2) {
    ctx.fillRect(i * bandW, 0, bandW, size);
  }
  // Thin accent lines
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(i * bandW + bandW / 2, 0);
    ctx.lineTo(i * bandW + bandW / 2, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * bandW + bandW / 2);
    ctx.lineTo(size, i * bandW + bandW / 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// Pattern 4: Stars
function drawStars(ctx, size, color) {
  const spacing = size / 6;
  ctx.fillStyle = color;
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      const cx = col * spacing + (row % 2) * (spacing / 2);
      const cy = row * spacing;
      drawStar(ctx, cx, cy, 5, spacing * 0.25, spacing * 0.12);
    }
  }
}

function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
  let rot = Math.PI / 2 * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerR);
  ctx.closePath();
  ctx.fill();
}

// Pattern 5: Diamond
function drawDiamond(ctx, size, color, accent) {
  const cellW = size / 8;
  const cellH = size / 8;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cx = col * cellW + cellW / 2;
      const cy = row * cellH + cellH / 2;
      ctx.fillStyle = (row + col) % 2 === 0 ? color : accent;
      ctx.beginPath();
      ctx.moveTo(cx, cy - cellH / 2);
      ctx.lineTo(cx + cellW / 2, cy);
      ctx.lineTo(cx, cy + cellH / 2);
      ctx.lineTo(cx - cellW / 2, cy);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// Pattern 6: Chevron
function drawChevron(ctx, size, color) {
  const rowH = size / 10;
  ctx.strokeStyle = color;
  ctx.lineWidth = rowH * 0.4;
  ctx.lineCap = 'round';
  for (let row = 0; row < 11; row++) {
    const y = row * rowH;
    ctx.beginPath();
    for (let x = -size / 4; x < size + size / 4; x += size / 4) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + size / 8, y - rowH / 2);
      ctx.lineTo(x + size / 4, y);
    }
    ctx.stroke();
  }
}

// Pattern 7: Camo
function drawCamo(ctx, size, hue) {
  const colors = [
    hslToRgb(hue, 0.3, 0.3),
    hslToRgb((hue + 0.08) % 1, 0.4, 0.4),
    hslToRgb((hue + 0.16) % 1, 0.25, 0.5),
    hslToRgb((hue + 0.04) % 1, 0.35, 0.25),
  ];
  // Draw random blobs
  for (let i = 0; i < 40; i++) {
    const c = colors[i % colors.length];
    ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
    const cx = (Math.sin(i * 7.3) * 0.5 + 0.5) * size;
    const cy = (Math.cos(i * 11.1) * 0.5 + 0.5) * size;
    const rx = 30 + (Math.sin(i * 3.7) * 0.5 + 0.5) * 60;
    const ry = 20 + (Math.cos(i * 5.3) * 0.5 + 0.5) * 50;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, i * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Start/Submit round button
submitScoreBtn.addEventListener('click', async () => {
  if (!hasPig) return;

  if (!roundState.active) {
    // START ROUND
    try {
      submitScoreBtn.textContent = 'Starting...';
      submitScoreBtn.disabled = true;

      // Call start_game on-chain (records timestamp)
      await startGame();

      // Spawn coins and power-ups using daily seed
      const seed = await getDailySeed();
      spawnCoins(seed);
      spawnPowerUps(seed);

      // Reset pig position
      if (gameState.pig) {
        gameState.pig.position.set(0, 0, 0);
        gameState.pig.rotation.y = 0;
      }

      // Start round
      roundState.active = true;
      roundState.startTime = Date.now();
      roundState.timeLeft = ROUND_DURATION;
      roundState.score = 0;

      hudScore.textContent = `Score: 0 | Time: ${ROUND_DURATION}s`;
      submitScoreBtn.textContent = 'Round in progress...';
      submitScoreBtn.disabled = true;

      showBanner('GO!');
      playRoundSound(true);

      // Grant rarity-based starting power-ups (Uncommon+)
      grantRarityPowerUps();
    } catch (e) {
      console.error('Start game failed:', e);
      submitScoreBtn.textContent = 'Start Round';
      submitScoreBtn.disabled = false;
    }
  }
});

async function endRound() {
  if (!roundState.active) return;
  roundState.active = false;
  clearCoins();
  clearPowerUps();

  const finalScore = roundState.score;
  hudScore.textContent = `Round Over! Score: ${finalScore}`;
  showBanner(`Time's Up! Score: ${finalScore}`);
  playRoundSound(false);

  if (finalScore > 0) {
    // Auto-submit score immediately to stay within contract time window
    try {
      submitScoreBtn.textContent = 'Submitting on-chain...';
      submitScoreBtn.disabled = true;
      await submitScore(finalScore);
      bestScore = Math.max(bestScore, finalScore);
      playerScoreEl.textContent = `Best: ${bestScore}`;
      hudScore.textContent = `Submitted! Best: ${bestScore}`;

      // Check achievements
      await checkAndClaimAchievements(finalScore);
    } catch (e) {
      console.error('Submit failed:', e);
      hudScore.textContent = `Submit failed. Score: ${finalScore}`;
    }
  }

  setTimeout(() => {
    submitScoreBtn.textContent = 'Start Round';
    submitScoreBtn.disabled = false;
    hudScore.textContent = `Best: ${bestScore}`;
  }, 2000);
}

async function checkAndClaimAchievements(score) {
  const addr = getAddress();
  if (!addr) return;
  try {
    // Score-based achievements
    const thresholds = [
      { id: 0, minScore: 100, name: 'Coin Collector' },
      { id: 1, minScore: 500, name: 'Coin Master' },
      { id: 3, minScore: 1000, name: 'Legend' },
    ];
    for (const { id, minScore, name } of thresholds) {
      if (score >= minScore) {
        const already = await hasAchievement(addr, id);
        if (already) {
          console.log(`Achievement '${name}' already claimed, skipping`);
          continue;
        }
        try {
          await claimAchievement(id);
          console.log(`Achievement unlocked: ${name}!`);
          showAchievementToast(name);
        } catch (e) {
          console.warn(`Failed to claim '${name}':`, e);
        }
      }
    }

    // Daily Champion (id=4) — only attempt if player is #1 today
    try {
      const has4 = await hasAchievement(addr, 4);
      if (!has4) {
        const day = await getCurrentDay();
        const lb = await getDailyLeaderboard(day);
        if (lb.length > 0 && lb[0].player.toLowerCase() === addr.toLowerCase()) {
          await claimAchievement(4);
          showAchievementToast('Daily Champion');
        }
      }
    } catch {}

    // Streak Master (id=5) — only attempt if streak >= 3
    try {
      const has5 = await hasAchievement(addr, 5);
      if (!has5) {
        const streak = await getPlayerStreak(addr);
        if (streak >= 3) {
          await claimAchievement(5);
          showAchievementToast('Streak Master');
        }
      }
    } catch {}
  } catch {}

  // Refresh daily banner after round
  updateDailyBanner();
}

function updateRound(time) {
  if (!roundState.active) return;

  const dt = gameState.clock.getDelta ? 0.016 : 0.016; // approx frame dt
  const frameDt = Math.min(time - (updateRound._lastTime || 0), 0.1);
  updateRound._lastTime = time;

  // Update power-ups (returns true if time is frozen)
  const isFrozen = updatePowerUps(frameDt > 0 ? frameDt : 0.016);

  // Update timer (freeze pauses countdown)
  if (!isFrozen) {
    const elapsed = (Date.now() - roundState.startTime) / 1000;
    roundState.timeLeft = Math.max(0, ROUND_DURATION - elapsed);
  } else {
    // Push startTime forward to compensate for frozen time
    roundState.startTime += 16; // ~1 frame worth of ms
  }

  // Check power-up collisions
  checkPowerUpCollisions();

  // Collect coins
  const collected = checkCoinCollisions();
  if (collected > 0) {
    roundState.score += collected;
  }

  // Animate coins and power-ups
  animateCoins(time);
  animatePowerUps(time);

  // Update HUD with power-up info
  const timeStr = Math.ceil(roundState.timeLeft);
  const puText = getPowerUpHUDText();
  hudScore.textContent = `Score: ${roundState.score} | Time: ${timeStr}s${puText}`;

  // End round when time's up
  if (roundState.timeLeft <= 0) {
    endRound();
  }
}

// Leaderboard with Today / All Time tabs
let lbMode = 'alltime'; // 'today' | 'alltime'

function renderLbEntries(entries) {
  if (entries.length === 0) {
    return '<div style="color:#888">No scores yet</div>';
  }
  return entries.map((e, i) => `
    <div class="lb-row">
      <span class="rank">#${i + 1}</span>
      <span class="addr">${shortAddress(e.player)}</span>
      <span class="score">${e.score}</span>
    </div>
  `).join('');
}

async function loadLeaderboard(mode) {
  console.log('loadLeaderboard called with mode:', mode);
  lbMode = mode;
  leaderboardList.innerHTML = 'Loading...';

  // Update tab active state
  document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
  const activeTab = document.querySelector(`.lb-tab[data-mode="${mode}"]`);
  if (activeTab) activeTab.classList.add('active');

  try {
    let entries;
    if (mode === 'today') {
      const day = await getCurrentDay();
      console.log('Fetching daily leaderboard for day:', day);
      // Use window reference to allow demo mode override
      const dailyFn = window.getDailyLeaderboard || getDailyLeaderboard;
      entries = await dailyFn(day);
    } else {
      console.log('Fetching all-time leaderboard');
      // Use window reference to allow demo mode override
      const allTimeFn = window.getLeaderboard || getLeaderboard;
      entries = await allTimeFn();
    }
    console.log('Leaderboard entries fetched:', entries.length, entries);
    leaderboardList.innerHTML = renderLbEntries(entries);
  } catch (e) {
    console.error('loadLeaderboard error:', e);
    leaderboardList.innerHTML = '<div style="color:#f66">Failed to load</div>';
  }
}

leaderboardBtn.addEventListener('click', async () => {
  console.log('Leaderboard button clicked');
  leaderboardPanel.classList.remove('hidden');
  console.log('Panel hidden class removed, classes:', leaderboardPanel.classList.toString());

  // Inject tabs if not present
  if (!leaderboardPanel.querySelector('.lb-tabs')) {
    console.log('Injecting tabs');
    const tabsHtml = `<div class="lb-tabs">
      <button class="lb-tab active" data-mode="alltime">All Time</button>
      <button class="lb-tab" data-mode="today">Today</button>
    </div>`;
    leaderboardList.insertAdjacentHTML('beforebegin', tabsHtml);

    leaderboardPanel.querySelectorAll('.lb-tab').forEach(tab => {
      tab.addEventListener('click', () => loadLeaderboard(tab.dataset.mode));
    });
  }

  console.log('Loading leaderboard with mode:', lbMode);
  await loadLeaderboard(lbMode);
});

closeLeaderboard.addEventListener('click', () => {
  leaderboardPanel.classList.add('hidden');
});

// ============================================================================
// ACHIEVEMENTS SYSTEM
// ============================================================================
const ACHIEVEMENTS = [
  { id: 0, icon: '🪙', name: 'Coin Collector', desc: 'Score 100+ points in a single round' },
  { id: 1, icon: '💰', name: 'Coin Master', desc: 'Score 500+ points in a single round' },
  { id: 2, icon: '🎮', name: 'Veteran', desc: 'Play 10+ game rounds' },
  { id: 3, icon: '👑', name: 'Legend', desc: 'Score 1000+ points in a single round' },
  { id: 4, icon: '🏆', name: 'Daily Champion', desc: 'Reach #1 on the Today leaderboard' },
  { id: 5, icon: '🔥', name: 'Streak Master', desc: 'Play on 3+ consecutive days' },
];

achievementsBtn.addEventListener('click', async () => {
  achievementsPanel.classList.remove('hidden');
  await loadAchievements();
});

closeAchievements.addEventListener('click', () => {
  achievementsPanel.classList.add('hidden');
});

async function loadAchievements() {
  const addr = getAddress();
  if (!addr) {
    achievementsList.innerHTML = '<div style="color:#888">Connect wallet to view achievements</div>';
    return;
  }

  achievementsList.innerHTML = 'Loading...';

  try {
    // Fetch all achievement statuses in parallel
    const statuses = await Promise.all(
      ACHIEVEMENTS.map(a => hasAchievement(addr, a.id))
    );

    // Get current streak for progress display
    const streakFn = window.getPlayerStreak || getPlayerStreak;
    const streak = await streakFn(addr);
    const score = await getPlayerScore(addr);
    const games = await getGamesPlayed(addr);
    const dayFn = window.getCurrentDay || getCurrentDay;
    const day = await dayFn();
    const dailyLbFn = window.getDailyLeaderboard || getDailyLeaderboard;
    const dailyLb = await dailyLbFn(day);
    const isDailyChamp = dailyLb.length > 0 && dailyLb[0].player.toLowerCase() === addr.toLowerCase();

    achievementsList.innerHTML = ACHIEVEMENTS.map((ach, i) => {
      const unlocked = statuses[i];
      const statusText = unlocked ? '✓ Unlocked' : getAchievementProgress(ach.id, score, games, streak, isDailyChamp);
      return `
        <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
          <div class="achievement-icon">${ach.icon}</div>
          <div class="achievement-info">
            <div class="achievement-name">${ach.name}</div>
            <div class="achievement-desc">${ach.desc}</div>
            <div class="achievement-status">${statusText}</div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Failed to load achievements:', e);
    achievementsList.innerHTML = '<div style="color:#f66">Failed to load achievements</div>';
  }
}

function getAchievementProgress(id, score, games, streak, isDailyChamp) {
  switch (id) {
    case 0: return `Progress: ${score}/100 points`;
    case 1: return `Progress: ${score}/500 points`;
    case 2: return `Progress: ${games}/10 games`;
    case 3: return `Progress: ${score}/1000 points`;
    case 4: return isDailyChamp ? 'Ready to claim!' : 'Not #1 today';
    case 5: return `Progress: ${streak}/3 days streak`;
    default: return 'Locked';
  }
}

// Daily Challenge Banner
const dailyBanner = document.getElementById('daily-banner');
const dailyDayEl = document.getElementById('daily-day');
const dailyCountdownEl = document.getElementById('daily-countdown');
const dailyBestEl = document.getElementById('daily-best');
const dailyStreakEl = document.getElementById('daily-streak');

async function updateDailyBanner() {
  try {
    const addr = getAddress();
    if (!addr) return;

    const dayFn = window.getCurrentDay || getCurrentDay;
    const day = await dayFn();
    dailyDayEl.textContent = `🏆 Daily Challenge`;

    // Countdown to next day (UTC midnight)
    const now = Math.floor(Date.now() / 1000);
    const nextDay = (day + 1) * 86400;
    const remaining = Math.max(0, nextDay - now);
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    dailyCountdownEl.textContent = `⏳ ${h}h ${m}m`;

    // Player's daily best
    const dailyScoreFn = window.getPlayerDailyScore || getPlayerDailyScore;
    const dailyScore = await dailyScoreFn(addr, day);
    dailyBestEl.textContent = dailyScore > 0 ? `Your Best: ${dailyScore}` : '';

    // Streak
    const streakFn = window.getPlayerStreak || getPlayerStreak;
    const streak = await streakFn(addr);
    dailyStreakEl.textContent = streak > 0 ? `🔥 ${streak} day` : '';

    dailyBanner.classList.remove('hidden');
  } catch (e) {
    console.warn('Daily banner update failed:', e);
  }
}

// Refresh daily banner every 60s
let dailyBannerInterval = null;
function startDailyBannerUpdates() {
  updateDailyBanner();
  if (dailyBannerInterval) clearInterval(dailyBannerInterval);
  dailyBannerInterval = setInterval(updateDailyBanner, 60000);
}

// ============================================================================
// MAIN GAME LOOP
// ============================================================================
let gameTime = 0;

function gameLoop() {
  requestAnimationFrame(gameLoop);

  const deltaTime = gameState.clock.getDelta();
  gameTime += deltaTime;

  if (gameState.mixer) {
    gameState.mixer.update(deltaTime);
  }

  updateAnimation();
  updateCharacterMovement(deltaTime);
  updateCamera(deltaTime);
  updateRound(gameTime);
  updateParticles(deltaTime);
  updateScreenShake(deltaTime);

  renderer.render(scene, camera);
}

// ============================================================================
// INITIALIZATION
// ============================================================================
async function init() {
  console.log('Initializing The Pour Pig (Starknet Coin Rush)...');

  setupLighting();
  createEnvironment();
  setupInputHandling();

  gameState.cameraPosition.set(0, CONFIG.cameraHeight, CONFIG.cameraDistance);
  gameState.cameraTarget.set(0, CONFIG.cameraLookAtHeight, 0);

  try {
    await Promise.all([loadPigModel(), loadCoinModel()]);

    loadingScreen.classList.add('hidden');
    gameState.isLoaded = true;

    console.log('Game initialized successfully!');

    // Exit intro orbit on any user interaction
    const exitIntro = () => {
      exitIntroOrbit();
      window.removeEventListener('keydown', exitIntro);
      window.removeEventListener('mousedown', exitIntro);
      window.removeEventListener('touchstart', exitIntro);
    };
    window.addEventListener('keydown', exitIntro);
    window.addEventListener('mousedown', exitIntro);
    window.addEventListener('touchstart', exitIntro);

    gameLoop();

  } catch (error) {
    console.error('Failed to initialize game:', error);
    loadingScreen.querySelector('p').textContent = 'Failed to load game. Check console for details.';
    loadingScreen.querySelector('.loading-spinner').style.display = 'none';
  }
}

// ============================================================================
// DEMO MODE: Expose contract functions to window for interception
// ============================================================================
window.getLeaderboard = getLeaderboard;
window.getDailyLeaderboard = getDailyLeaderboard;
window.getPlayerDailyScore = getPlayerDailyScore;
window.getPlayerStreak = getPlayerStreak;
window.getCurrentDay = getCurrentDay;
window.updateDailyBanner = updateDailyBanner;  // For demo mode to refresh banner immediately

// DEMO MODE: Listen for pig preview events from demo-mode.js
window.addEventListener('demo-preview-pig', (event) => {
  const preset = event.detail;
  console.log('Applying pig preset:', preset);

  // Update pig attributes
  pigAttrs = {
    colorHue: preset.colorHue,
    rarity: preset.rarity,
    speedBonus: preset.speedBonus,
    sizeScale: preset.sizeScale,
  };

  // Apply to the pig model if it exists
  if (gameState.pig) {
    applyPigAttributes(pigAttrs);
  }

  // Update the UI stats display
  const patternName = getPatternName(preset.colorHue, preset.rarity);
  const pigColorEl = document.getElementById('pig-color');
  const pigSpeedEl = document.getElementById('pig-speed');
  const pigSizeEl = document.getElementById('pig-size');
  const pigRarityEl = document.getElementById('pig-rarity');

  if (pigColorEl) pigColorEl.textContent = `Pattern: ${patternName}`;
  if (pigSpeedEl) pigSpeedEl.textContent = `Speed: +${preset.speedBonus}`;
  if (pigSizeEl) pigSizeEl.classList.add('hidden');
  if (pigRarityEl) pigRarityEl.textContent = `Rarity: ${rarityName(preset.rarity)}`;

  console.log('%c✅ Pig preview applied!', 'color: #4ecdc4; font-weight: bold');
});

init();
