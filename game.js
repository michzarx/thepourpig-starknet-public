/**
 * The Pour Pig - A Pokémon-style 3D Adventure Game
 * Built with Three.js
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
    // Character movement
    walkSpeed: 1.5,
    runSpeed: 3,
    backwardSpeed: 1,
    rotationSpeed: 3,
    
    // Camera settings
    cameraDistance: 4,
    cameraHeight: 2,
    cameraLookAtHeight: 1.0,
    
    // Spring-damper camera system
    cameraPositionLag: 0.04,      // Position smoothing (lower = more lag)
    cameraRotationLag: 0.03,      // Rotation smoothing (lower = more lag)
    cameraLookAtLag: 0.06,        // Look-at target smoothing
    cameraMinHeight: 1.0,         // Minimum camera height above ground
    cameraTiltAngle: 0.15,        // Slight downward tilt (radians)
    
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
    cameraCurrentRotation: 0,         // Current camera yaw (smoothed)
    cameraVelocity: new THREE.Vector3(), // For spring physics
};

// ============================================================================
// SCENE SETUP
// ============================================================================
const container = document.getElementById('game-container');
const loadingScreen = document.getElementById('loading-screen');
const debugInfo = document.getElementById('debug-info');

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue
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
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(50, 80, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    sunLight.shadow.bias = -0.001;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);
    
    // Hemisphere light for natural outdoor feel
    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3d5c3d, 0.4);
    scene.add(hemiLight);
}

// ============================================================================
// ENVIRONMENT CREATION
// ============================================================================
function createEnvironment() {
    // Ground plane with grass texture
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
    
    // Add grass patches for visual variety
    createGrassPatches();
    
    // Add trees
    createTrees();
    
    // Add rocks
    createRocks();
    
    // Add flowers
    createFlowers();
    
    // Add boundary markers (fence posts)
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
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9,
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    trunk.castShadow = true;
    tree.add(trunk);
    
    // Foliage (multiple spheres for low-poly look)
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
    
    // Generate random tree positions avoiding center
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 10 + Math.random() * (CONFIG.worldRadius - 15);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Check distance from other trees
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
    
    // Stem
    const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.15;
    flower.add(stem);
    
    // Petals
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
            'poorPIG.glb',
            (gltf) => {
                console.log('Pig model loaded successfully!');
                console.log('Available animations:', gltf.animations.map(a => a.name));
                
                const pig = gltf.scene;
                pig.position.set(0, 0, 0);
                pig.scale.setScalar(1);
                
                // Enable shadows for all meshes
                pig.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                scene.add(pig);
                gameState.pig = pig;
                
                // Setup animation mixer
                gameState.mixer = new THREE.AnimationMixer(pig);
                
                // Store animations by name
                gltf.animations.forEach((clip) => {
                    const name = clip.name.toLowerCase();
                    gameState.animations[name] = gameState.mixer.clipAction(clip);
                    console.log(`Registered animation: ${name}`);
                });
                
                // Start with idle animation
                if (gameState.animations['idle']) {
                    gameState.animations['idle'].play();
                    gameState.currentAnimation = 'idle';
                } else {
                    // Fallback: play first available animation
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
    
    // Crossfade to new animation
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
    
    // Prevent context menu on right click
    window.addEventListener('contextmenu', (e) => e.preventDefault());
}

// ============================================================================
// CHARACTER MOVEMENT
// ============================================================================
function updateCharacterMovement(deltaTime) {
    if (!gameState.pig) return;
    
    const { keys } = gameState;
    const pig = gameState.pig;
    
    // Rotation
    if (keys.left) {
        pig.rotation.y += CONFIG.rotationSpeed * deltaTime;
    }
    if (keys.right) {
        pig.rotation.y -= CONFIG.rotationSpeed * deltaTime;
    }
    
    // Movement
    let speed = 0;
    if (keys.forward) {
        speed = keys.shift ? CONFIG.runSpeed : CONFIG.walkSpeed;
    } else if (keys.backward) {
        speed = -CONFIG.backwardSpeed;
    }
    
    if (speed !== 0) {
        // Calculate movement direction based on pig's rotation
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(pig.quaternion);
        
        // Calculate new position
        const newPosition = pig.position.clone();
        newPosition.addScaledVector(direction, speed * deltaTime);
        
        // Check world boundaries (circular)
        const distanceFromCenter = Math.sqrt(newPosition.x ** 2 + newPosition.z ** 2);
        if (distanceFromCenter < CONFIG.worldRadius - 1) {
            pig.position.copy(newPosition);
        } else {
            // Slide along boundary
            const angle = Math.atan2(newPosition.z, newPosition.x);
            pig.position.x = Math.cos(angle) * (CONFIG.worldRadius - 1);
            pig.position.z = Math.sin(angle) * (CONFIG.worldRadius - 1);
        }
    }
}

// ============================================================================
// CAMERA FOLLOW - Spring-Damper System
// ============================================================================

/**
 * Attempt to smooth angle differences (handles wrap-around at ±PI)
 */
function lerpAngle(current, target, t) {
    let diff = target - current;
    
    // Normalize to [-PI, PI]
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    
    return current + diff * t;
}

/**
 * Spring-damper interpolation for smoother, more natural camera movement
 * Returns a value that eases toward target with velocity-based smoothing
 */
function springDamp(current, target, velocity, smoothTime, deltaTime) {
    // Critically damped spring approximation
    const omega = 2 / smoothTime;
    const x = omega * deltaTime;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    
    const change = current - target;
    const temp = (velocity + omega * change) * deltaTime;
    
    const newVelocity = (velocity - omega * temp) * exp;
    const newValue = target + (change + temp) * exp;
    
    return { value: newValue, velocity: newVelocity };
}

function updateCamera(deltaTime) {
    if (!gameState.pig) return;
    
    const pig = gameState.pig;
    
    // Clamp deltaTime to avoid huge jumps on lag spikes
    const dt = Math.min(deltaTime, 0.1);
    
    // -------------------------------------------------------------------------
    // 1. Smoothly interpolate camera rotation to match pig's facing direction
    // -------------------------------------------------------------------------
    const targetRotation = pig.rotation.y;
    gameState.cameraCurrentRotation = lerpAngle(
        gameState.cameraCurrentRotation,
        targetRotation,
        1 - Math.pow(1 - CONFIG.cameraRotationLag, dt * 60)
    );
    
    // -------------------------------------------------------------------------
    // 2. Calculate ideal camera position based on smoothed rotation
    // -------------------------------------------------------------------------
    // Offset behind the pig (in local space, then rotated by smoothed yaw)
    const offsetX = Math.sin(gameState.cameraCurrentRotation) * CONFIG.cameraDistance;
    const offsetZ = Math.cos(gameState.cameraCurrentRotation) * CONFIG.cameraDistance;
    
    const idealPosition = new THREE.Vector3(
        pig.position.x + offsetX,
        pig.position.y + CONFIG.cameraHeight,
        pig.position.z + offsetZ
    );
    
    // -------------------------------------------------------------------------
    // 3. Apply spring-damper smoothing to camera position
    // -------------------------------------------------------------------------
    const positionLagFactor = 1 - Math.pow(1 - CONFIG.cameraPositionLag, dt * 60);
    
    // Smooth each axis with velocity tracking for natural deceleration
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
    
    // -------------------------------------------------------------------------
    // 4. Ground collision avoidance - keep camera above minimum height
    // -------------------------------------------------------------------------
    if (gameState.cameraPosition.y < CONFIG.cameraMinHeight) {
        gameState.cameraPosition.y = CONFIG.cameraMinHeight;
        gameState.cameraVelocity.y = 0; // Stop downward velocity
    }
    
    // -------------------------------------------------------------------------
    // 5. Smoothly interpolate look-at target (slightly ahead of pig)
    // -------------------------------------------------------------------------
    const idealLookAt = new THREE.Vector3(
        pig.position.x,
        pig.position.y + CONFIG.cameraLookAtHeight,
        pig.position.z
    );
    
    const lookAtLagFactor = 1 - Math.pow(1 - CONFIG.cameraLookAtLag, dt * 60);
    gameState.cameraTarget.lerp(idealLookAt, lookAtLagFactor);
    
    // -------------------------------------------------------------------------
    // 6. Apply final camera transform (NO ROLL - always horizon-aligned)
    // -------------------------------------------------------------------------
    camera.position.copy(gameState.cameraPosition);
    
    // Force camera up vector to world up (prevents roll/banking)
    camera.up.set(0, 1, 0);
    camera.lookAt(gameState.cameraTarget);
    
    // Apply additional downward tilt
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
// DEBUG INFO
// ============================================================================
function updateDebugInfo() {
    if (!gameState.pig) return;
    
    const pig = gameState.pig;
    debugInfo.innerHTML = `
        Position: (${pig.position.x.toFixed(1)}, ${pig.position.z.toFixed(1)})<br>
        Rotation: ${(pig.rotation.y * 180 / Math.PI).toFixed(0)}°<br>
        Animation: ${gameState.currentAnimation}<br>
        FPS: ${(1 / gameState.clock.getDelta()).toFixed(0)}
    `;
}

// ============================================================================
// RENDER LOOP
// ============================================================================
function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = gameState.clock.getDelta();
    
    // Update animation mixer
    if (gameState.mixer) {
        gameState.mixer.update(deltaTime);
    }
    
    // Update game logic
    updateAnimation();
    updateCharacterMovement(deltaTime);
    updateCamera(deltaTime);
    
    // Render
    renderer.render(scene, camera);
}

// ============================================================================
// INITIALIZATION
// ============================================================================
async function init() {
    console.log('Initializing The Pour Pig...');
    
    // Setup scene
    setupLighting();
    createEnvironment();
    setupInputHandling();
    
    // Initialize camera position
    gameState.cameraPosition.set(0, CONFIG.cameraHeight, CONFIG.cameraDistance);
    gameState.cameraTarget.set(0, CONFIG.cameraLookAtHeight, 0);
    
    try {
        // Load pig model
        await loadPigModel();
        
        // Hide loading screen
        loadingScreen.classList.add('hidden');
        gameState.isLoaded = true;
        
        console.log('Game initialized successfully!');
        
        // Start render loop
        animate();
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        loadingScreen.querySelector('p').textContent = 'Failed to load game. Check console for details.';
        loadingScreen.querySelector('.loading-spinner').style.display = 'none';
    }
}

// Start the game
init();
