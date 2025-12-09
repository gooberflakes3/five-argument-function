try {
const scene = new THREE.Scene();
window.scene = scene
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // optional, nicer shadows

// Create a physics world
let world = new CANNON.World();
window.world = world
world.gravity.set(0, -9.82, 0); // gravity along Y axis

// Create ground plane
const groundMaterial = new CANNON.Material("groundMaterial")
let groundBody = new CANNON.Body({
  mass: 0, // static
  material: groundMaterial,
  type: CANNON.Body.STATIC
});
groundBody.addShape(new CANNON.Plane());
groundBody.quaternion.setFromEuler(-Math.PI/2, 0, 0); // rotate to lie flat
groundBody.position.set(0, -5, 0);
world.addBody(groundBody);


// player hitbox


function createCapsule(radius, height, mass = 1, capsuleMaterial) {

  const capsuleBody = new CANNON.Body({
    mass: mass,
    material: capsuleMaterial
    // fixedRotation: true // keeps it upright
  });

  // Cylinder part (height is the straight section between the spheres)
  const cylinder = new CANNON.Cylinder(radius, radius, height, 8);
  capsuleBody.addShape(cylinder);

  // Top sphere
  const sphereTop = new CANNON.Sphere(radius);
  capsuleBody.addShape(sphereTop, new CANNON.Vec3(0, height/2, 0));

  // Bottom sphere
  const sphereBottom = new CANNON.Sphere(radius);
  capsuleBody.addShape(sphereBottom, new CANNON.Vec3(0, -height/2, 0));

  return capsuleBody;
}

// create the body
const playerMaterial = new CANNON.Material("playerMaterial")
const playerBody = createCapsule(0.5, 1.5, 1, playerMaterial)

// starting position
playerBody.position.set(0, 2, 5);
playerBody.angularDamping = 1.0; // smooth stop when keys released

// add to world
world.addBody(playerBody);


// end of player hitbox

const hemi = new THREE.HemisphereLight(0xaaaaaa, 0x444444, 0.6);
// sky color, ground color, intensity
scene.add(hemi);

scene.background = new THREE.Color(0x87ceeb); // sky blue

const contact = new CANNON.ContactMaterial(
    groundMaterial,
    playerMaterial,
    {
        friction: 0,
        restitution: 0,
    }
);
world.addContactMaterial(contact);

let objects = []
window.objectsarray = objects

objectInterface.produce("cube", 0, { pos: [0, -2, 0], rot: [0, 0, 0], scl: [1, 1, 1], color: 0x008080 })

objectInterface.produce("physcube", 1, { pos: [-2, 0, 0], rot: [0, 0, 0], scl: [2, 1, 1], color: 0xff0000 }, 1)
objectInterface.produce("cube", 2, { pos: [0, 0, 0], rot: [0, 0, 0], scl: [1, 2, 1], color: 0x00ff00 })
objectInterface.produce("cube", 3, { pos: [2, 0, 0], rot: [0, 0, 0], scl: [1, 1, 2], color: 0x0000ff })
objectInterface.produce("plane", 4, { pos: [-2, 2, 0], rot: [0, 0, 0], scl: [2, 1, 1], color: 0xffff00 })
objectInterface.produce("plane", 5, { pos: [0, 2, 0], rot: [0, 0, 0], scl: [1, 2, 1], color: 0x00ffff })
objectInterface.produce("plane", 6, { pos: [2, 2, 0], rot: [0, 0, 0], scl: [1, 1, 2], color: 0xff00ff })
objectInterface.produce("sphere", 13, { pos: [4, 0, 0], rot: [0, 0, 0], radius: 1, color: 0x555555 })
objectInterface.produce("physsphere", 14, { pos: [7, 0, 0], rot: [0, 0, 0], radius: 1, color: 0xfafafa }, 1)

objectInterface.produce("plane", "ground", { pos: [0, -5, 0], rot: [90, 0, 0], scl: [0, 50, 50], color: 0x333333 })

objectInterface.produce("mapgeocube", 7, { pos: [5, -5, 5], rot: [0, 0, 0], scl: [2, 2, 2], color: 0xaa00aa })
objectInterface.produce("mapgeocube", 8, { pos: [9, -4, 5], rot: [0, 0, 0], scl: [2, 2, 3], color: 0xaa00aa })
objectInterface.produce("mapgeocube", 9, { pos: [13, -3, 5], rot: [0, 0, 0], scl: [2, 2, 4], color: 0xaa00aa })
objectInterface.produce("mapgeocube", 10, { pos: [17, -2, 5], rot: [0, 0, 0], scl: [2, 2, 5], color: 0xaa00aa })
objectInterface.produce("mapgeocube", 11, { pos: [21, -1, 5], rot: [0, 0, 0], scl: [2, 2, 6], color: 0xaa00aa })

objectInterface.produce("lightsun", 12, { pos: [15, 15, 50], color: 0xffffff, intensity: 5})

camera.position.z = 5;

// Create controls
const controls = new THREE.PointerLockControls(camera, document.body);

// Add to scene (optional, but good practice)
scene.add(controls.getObject());

// Enable pointer lock on click
document.body.addEventListener('click', () => {
  controls.lock();
});

let keys = {}
document.addEventListener("keydown", function(e) {
    keys[e.code] = true;
});

document.addEventListener("keyup", function(e) {
    delete keys[e.code];
});

function handleKeys() {
    let speed = 5;

    // Calculate direction vectors (same as your code)
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, camera.up).normalize();

    // Target movement direction
    const move = new CANNON.Vec3(0, 0, 0);

    if (keys["KeyW"]) move.vadd(new CANNON.Vec3(forward.x, 0, forward.z), move);
    if (keys["KeyS"]) move.vsub(new CANNON.Vec3(forward.x, 0, forward.z), move);
    if (keys["KeyA"]) move.vsub(new CANNON.Vec3(right.x, 0, right.z), move);
    if (keys["KeyD"]) move.vadd(new CANNON.Vec3(right.x, 0, right.z), move);
    if (keys["Space"] && isGrounded(playerBody, world, 2)) playerBody.velocity.y = 5

    if (move.length() > 0) move.normalize();

    // Set horizontal velocity DIRECTLY
    playerBody.velocity.x = move.x * speed;
    playerBody.velocity.z = move.z * speed;

    // Keep vertical velocity from physics

}

function isGrounded(body, w, capsuleHeight) {
    if (!body || !body.position) { return false; }

    // Ray goes from player center down to slightly below the bottom of the capsule
    let from = body.position.clone();
    let to = body.position.clone();
    from.y -= capsuleHeight / 2 + 0.05;
    to.y = from.y
    to.y -= 0.2

    // alert(from)
    // alert(to)

    const ray = new CANNON.Ray(from, to);
    const result = new CANNON.RaycastResult();

    // Old Cannon.js expects the result in the options object
    ray.intersectWorld(w, { skipBackfaces: true, collisionFilterMask: -1, result: result });

    // Hit something other than the player = grounded
    return result.hasHit && result.body.id !== body.id;
}

objectInterface.syncGround(groundBody)

// const composer = new THREE.EffectComposer(renderer);
// const renderPass = new THREE.RenderPass(scene, camera);
// composer.addPass(renderPass);
// 
// const ssaoPass = new THREE.SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
// ssaoPass.kernelRadius = 4; // tweak for strength
// ssaoPass.output = THREE.SSAOPass.OUTPUT.Default
// composer.addPass(ssaoPass);

function animate() {
    handleKeys()
    
    // Step physics world
    world.step(1/60);
    
    // sync camera to body
    controls.getObject().position.copy(playerBody.position);
    controls.getObject().position.y += 0.8; // eye height

    objects.forEach(obj => {
        if (obj instanceof PhysicsProp) {
            obj.object.position.copy(obj.body.position);
            obj.object.quaternion.copy(obj.body.quaternion);
        }
    });

    document.getElementById("textthing").innerHTML = `y ${playerBody.position.y.toFixed(2)} from ${(playerBody.position.y - 1.05).toFixed(2)} to ${((playerBody.position.y - 1.05) - 0.2).toFixed(2)} g ${isGrounded(playerBody, world, 2)}`

    objectInterface.find(0).rotation.x += 0.01

    renderer.render( scene, camera );
    // composer.render()
}
renderer.setAnimationLoop( animate );

} catch (error) {
    alert(`${error}\n---\n${error.stack}`)
}