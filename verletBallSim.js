/*
*	Ball Physics Simulation Javascript (Three.js Version) - Version 3.01 Work In Progress  7/24/25
*
*	Original Copyright: 2017+ Jeff Miller
*	Three.js Conversion & Correction: 2025
*	License: MIT
*
*
*	Dependencies:
*	- three.min.js      - WebGL 3D Library
*	- Mainloop.js       - Managing main loop & FPS
*/

// Force restrictive declarations
"use strict";

//================================//
//  THREE.JS SCENE GLOBALS
//================================//
let scene, camera, renderer;

//================================//
//  SIMULATION GLOBALS
//================================//
var fpsCounter = document.getElementById('fpscounter');
let simulationPaused = false;
let tiltEnabled = false;

// Dimensions for physics simulation boundaries
let simWidth, simHeight;
const bottomBorderHeight = 55;

const GRAVITY_Y = 980;
var gravityVec = new THREE.Vector2(0.0, GRAVITY_Y);

// Touch/Mouse state
var isDragging = false;
var touch_Pos = new THREE.Vector2(0, 0);
var touch_Sel = -1;

// OS flags
var OS_Android = false;
var OS_iPAD = false;
var OS_iOS = false;

// Initialize function
window.onload = init;

// Resize handler
window.onresize = function() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    simWidth = width;
    simHeight = height - bottomBorderHeight;

    camera.left = 0;
    camera.right = width;
    camera.top = 0;
    camera.bottom = -height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    getOrientation();
};

// --- OS DETECTION & ORIENTATION ---
function detectOperatingSystem() {
    const ua = navigator.userAgent;
    const hasTouch = "ontouchend" in document;
    if (ua.includes("iPad") || (ua.includes("Macintosh") && hasTouch)) {
        OS_iPAD = true;
    } else if (/iPhone|iPod/.test(ua)) {
        OS_iOS = true;
    } else if (/Android/i.test(ua)) {
        OS_Android = true;
    } else if (hasTouch) {
        OS_Android = true;
    }
}

function isMobileDevice() {
    return OS_iOS || OS_iPAD || OS_Android;
}

function isLandscape() {
    return window.matchMedia("(orientation: landscape)").matches;
}

function getOrientation() {
    if (isMobileDevice()) {
        simulationPaused = isLandscape();
    }
}

async function requestOrientationPermission() {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        try {
            const response = await DeviceOrientationEvent.requestPermission();
            if (response === "granted") {
                window.addEventListener('devicemotion', handleMotionEvent);
                return true;
            }
        } catch (e) {
            console.error("Error requesting orientation permission:", e);
        }
    } else {
        window.addEventListener('devicemotion', handleMotionEvent);
        return true;
    }
    return false;
}

//================================//
//      INITIALIZE SIMULATION
//================================//
function init() {
    console.clear();
    detectOperatingSystem();

    simWidth = window.innerWidth;
    simHeight = window.innerHeight - bottomBorderHeight;

    // --- THREE.JS INITIALIZATION ---
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x505050);

    camera = new THREE.OrthographicCamera(0, simWidth, 0, -simHeight, 1, 1000);
    camera.position.z = 500;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(simWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);

    directionalLight.position.set(150, 200, 300);
    scene.add(directionalLight);

    // --- START SIMULATION & ATTACH LISTENERS ---
    new Simulation(renderer);

    // --- UI BUTTONS ---
    const enableBtn = document.getElementById("enableTiltButton");
    const mobileDevice = isMobileDevice();
    if (!mobileDevice) enableBtn.textContent = "Toggle Gravity Off";
    enableBtn.addEventListener("click", () => {
        if (mobileDevice) {
            if (!tiltEnabled) {
                requestOrientationPermission().then((granted) => {
                    if (granted) {
                        tiltEnabled = true;
                        enableBtn.textContent = "Disable Tilt";
                    }
                });
            } else {
                tiltEnabled = false;
                gravityVec.set(0.0, GRAVITY_Y);
                enableBtn.textContent = "Enable Tilt";
            }
        } else {
            tiltEnabled = !tiltEnabled;
            if (tiltEnabled) {
                gravityVec.set(0.0, 0.0);
                enableBtn.textContent = "Toggle Gravity On";
            } else {
                gravityVec.set(0.0, GRAVITY_Y);
                enableBtn.textContent = "Toggle Gravity Off";
            }
        }
    });

    getOrientation();
}

// Motion handler
function handleMotionEvent(event) {
    if (!tiltEnabled) return;
    let ax = event.accelerationIncludingGravity.x;
    let ay = event.accelerationIncludingGravity.y;
    if (ax === null || ay === null) return;
    const tilt_scale = 10000; // 10k on iphone
    let finalX, finalY;
    if (OS_iPAD || OS_iOS) { // Grouping iPhone and iPad
        finalX = ay * tilt_scale;
        finalY = ax * tilt_scale;
    } else if (OS_Android) {
        finalX = -ax * tilt_scale;
        finalY = -ay * tilt_scale;
    } else {
        // Fallback for other potential touch devices
        finalX = -ax * tilt_scale;
        finalY = -ay * tilt_scale;
    }
    gravityVec.x = finalX;
    gravityVec.y = finalY;
}

//================================//
//      BODY (BALL) CLASS
//================================//
var Body = function(x, y, radius, color, mass) {
    this.position = new THREE.Vector2(x, y);
    this.previouspos = new THREE.Vector2(x, y);
    this.acceleration = new THREE.Vector2(0, 0);
    this.radius = radius;
    this.mass = mass;

    const geometry = new THREE.SphereGeometry(radius, 32, 16);
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        metalness: 0.3,
        roughness: 0.25,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);

    this.updatePosition = function(delta) {
        const velocity = new THREE.Vector2().subVectors(this.position, this.previouspos);
        velocity.multiplyScalar(0.999);

        this.previouspos.copy(this.position);

        const deltaSq = delta * delta;
        this.position.add(velocity).add(this.acceleration.multiplyScalar(deltaSq));

        this.acceleration.set(0, 0);
    };
};

//================================//
//      WALL CLASS
//================================//
var Wall = function(p1x, p1y, p2x, p2y) {
    this.p1 = new THREE.Vector2(p1x, p1y);
    this.p2 = new THREE.Vector2(p2x, p2y);

    this.dir = new THREE.Vector2().subVectors(this.p2, this.p1);
    this.lenSq = this.dir.lengthSq();

    const material = new THREE.LineBasicMaterial({ color: 0xff4500 });
    const points = [new THREE.Vector3(p1x, -p1y, 0), new THREE.Vector3(p2x, -p2y, 0)];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
};

//================================//
//      SIMULATION ENGINE
//================================//
var Simulation = function(renderer) {
    var bodies = this.bodies = [];
    var walls = [];
    const balls_Max = 150;
    const colors = ['#ff0000', '#0000ff', '#00ff00', '#ffff00', '#ff00ff'];
    let creationFailures = 0; 

    while (bodies.length < balls_Max) {
        var bodyRadius = Math.random() * 20 + 6;
        
        // **START FINAL CORRECTION**
        const spawnableWidth = Math.max(0, simWidth - 2 * bodyRadius);
        const spawnableHeight = Math.max(0, (simHeight / 4) - 2 * bodyRadius);
        
        var body = new Body(
            bodyRadius + (Math.random() * spawnableWidth),
            bodyRadius + (Math.random() * spawnableHeight),
            bodyRadius,
            colors[Math.floor(Math.random() * colors.length)],
            Math.PI * bodyRadius * bodyRadius
        );
        // **END FINAL CORRECTION**

        let collides = false;
        for (let other of bodies) {
            if (body.position.distanceTo(other.position) < body.radius + other.radius) {
                collides = true;
                break;
            }
        }

        if (!collides) {
            bodies.push(body);
        } else {
            scene.remove(body.mesh);
        }
        
        creationFailures++;
        if (creationFailures > balls_Max * 20) {
            console.error("Aborting simulation: Unable to place balls without collision.");
            break;
        }
    }

    walls.push(new Wall(simWidth / 3, simHeight * 0.25, simWidth / 2.2, simHeight * 0.4));
    walls.push(new Wall(simWidth * 0.68, simHeight * 0.25, simWidth / 1.8, simHeight * 0.4));

    // --- NATIVE EVENT LISTENERS ---
    const canvas = renderer.domElement;

    function selectObject() {
        let distTestMax = Infinity;
        let selectedIndex = -1;
        for (let i = 0; i < bodies.length; i++) {
            const distTest = bodies[i].position.distanceTo(touch_Pos);
            if (distTest < distTestMax) {
                distTestMax = distTest;
                selectedIndex = i;
            }
        }
        if (selectedIndex !== -1 && distTestMax < bodies[selectedIndex].radius + 50) {
            touch_Sel = selectedIndex;
            bodies[touch_Sel].previouspos.copy(bodies[touch_Sel].position);
        } else {
            touch_Sel = -1;
        }
    }

    function updateTouchPos(event) {
        if (event.type.includes('touch')) {
            const rect = canvas.getBoundingClientRect();
            const touch = event.touches[0];
            touch_Pos.set(touch.clientX - rect.left, touch.clientY - rect.top);
        } else {
            touch_Pos.set(event.offsetX, event.offsetY);
        }
    }

    function handleInteractionStart(event) {
        isDragging = true;
        if (event.type === 'touchstart') event.preventDefault();
        updateTouchPos(event);
        selectObject();
    }

    function handleInteractionMove(event) {
        if (isDragging) {
            if (event.type === 'touchmove') event.preventDefault();
            updateTouchPos(event);
        }
    }

    function handleInteractionEnd() {
        isDragging = false;
        touch_Sel = -1;
    }

    canvas.addEventListener('mousedown', handleInteractionStart);
    canvas.addEventListener('mousemove', handleInteractionMove);
    canvas.addEventListener('mouseup', handleInteractionEnd);
    canvas.addEventListener('mouseleave', handleInteractionEnd);

    canvas.addEventListener('touchstart', handleInteractionStart, { passive: false });
    canvas.addEventListener('touchmove', handleInteractionMove, { passive: false });
    canvas.addEventListener('touchend', handleInteractionEnd);
    canvas.addEventListener('touchcancel', handleInteractionEnd);


    // --- SIMULATION LOGIC ---
    var applyForces = function() {
        for (const body of bodies) {
            body.acceleration.add(gravityVec);
        }
        if (touch_Sel > -1) {
            const body = bodies[touch_Sel];
            const toTouchVec = new THREE.Vector2().subVectors(touch_Pos, body.position);
            const k = 0.3;
            const springForce = toTouchVec.multiplyScalar(k * body.mass);
            body.acceleration.add(springForce);
        }
    };

    var solveCollisions = function() {
        const damping = 0.8; // Energy loss on bounce

        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];

            // --- FIX: Implement robust border collision with velocity reflection ---
            const vx = body.position.x - body.previouspos.x;
            const vy = body.position.y - body.previouspos.y;

            if (body.position.x < body.radius) {
                body.position.x = body.radius;
                body.previouspos.x = body.position.x + vx * damping;
            } else if (body.position.x > simWidth - body.radius) {
                body.position.x = simWidth - body.radius;
                body.previouspos.x = body.position.x + vx * damping;
            }

            if (body.position.y < body.radius) {
                body.position.y = body.radius;
                body.previouspos.y = body.position.y + vy * damping;
            } else if (body.position.y > simHeight - body.radius) {
                body.position.y = simHeight - body.radius;
                body.previouspos.y = body.position.y + vy * damping;
            }


            // Wall collision
            for (const wall of walls) {
                const p1_to_body = new THREE.Vector2().subVectors(body.position, wall.p1);
                let t = p1_to_body.dot(wall.dir) / wall.lenSq;
                t = Math.max(0, Math.min(1, t));

                const closest_point = wall.p1.clone().add(wall.dir.clone().multiplyScalar(t));
                const dist_vec = new THREE.Vector2().subVectors(body.position, closest_point);
                const distance = dist_vec.length();

                if (distance < body.radius) {
                    const overlap = body.radius - distance;
                    body.position.add(dist_vec.normalize().multiplyScalar(overlap));
                }
            }

            // Object-Object collision
            for (let j = i + 1; j < bodies.length; j++) {
                const other = bodies[j];
                const axis = new THREE.Vector2().subVectors(body.position, other.position);
                const dist = axis.length();
                const target = body.radius + other.radius;

                if (dist > 0 && dist < target) {
                    const overlap = (target - dist) / dist;
                    const correction = axis.multiplyScalar(overlap * 0.5);
                    body.position.add(correction);
                    other.position.sub(correction);
                }
            }
        }
    };

    var updateMeshPositions = function() {
        for (const body of bodies) {
            body.mesh.position.set(body.position.x, -body.position.y, 0);
        }
    };

    var step = function(delta) {
        if (simulationPaused) return;

        const sub_steps = 8;
        const sub_delta = delta / sub_steps;
        for (let i = 0; i < sub_steps; i++) {
            applyForces();
            for (const body of bodies) body.updatePosition(sub_delta);
            solveCollisions();
        }
    };

    var draw = function() {
        updateMeshPositions();
        renderer.render(scene, camera);
    };

    function end(fps, panic) {
        const status = simulationPaused ? "Paused - Rotate to Portrait" : `${parseInt(fps, 10)} FPS`;
        fpsCounter.textContent = status;
        if (panic) MainLoop.resetFrameDelta();
    }

    MainLoop.setUpdate((delta) => step(delta / 1000)).setDraw(draw).setEnd(end).start();
};
