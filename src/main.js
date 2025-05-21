// 🌟 Importing Modules
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import gsap from 'gsap/src';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/Addons.js';



// 🏗️ Scene Setup
const scene = new THREE.Scene();
// const fog = new THREE.Fog('orange', 0, 30);
// scene.fog = fog;
// 🎥 Camera Setup
const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const cameraFLY = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
cameraFLY.visible = false
camera.position.set(10, 100, 15);

// 🖼️ Renderer Setup
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.querySelector('#canvas'),
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1.25; // tweak for brightness
renderer.physicallyCorrectLights = true;
// renderer.setClearColor('orange', 1.0); // Set background color to transparent
document.body.appendChild(renderer.domElement);

// const axisHelper = new THREE.AxesHelper(5);
// scene.add(axisHelper);
// 🕹️ Controls
//const controls = new OrbitControls(camera, renderer.domElement);

// // 🌄 Environment (HDRI)
const rgbeLoader = new RGBELoader();
rgbeLoader.load('/hdri/hdri.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  // scene.background = texture; // Optional: uncomment to set background
});

// 🌌 Texture Loading
const textureLoader = new THREE.TextureLoader();
const star = textureLoader.load('/texture/star.png');

// 💡 Lighting Setup
const directionalLight = new THREE.DirectionalLight("white", 4);
directionalLight.position.set(30, 50, 40);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 🔦 Light Helpers
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
// scene.add(directionalLightHelper);

directionalLight.shadow.mapSize.set(4096, 4096);
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
directionalLight.shadow.bias = -0.001;
directionalLight.shadow.normalBias = 0.02;

const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(cameraHelper);

// ⏱️ Animation and Clock
const clock = new THREE.Clock();
let mixer;
let car01;
let sunMesh, earthMesh, moonMesh;
let hasEffectAdded = false;

let mixerdance, mixerdance2, mixerdance3
// 🚗 Load GLTF Model
const loader = new GLTFLoader();
const objects = [];
let door = null
//loading model
loader.load(
  'exhibition.glb',
  (gltf) => {

    scene.add(gltf.scene);
    // 🧩 Traverse GLTF Scene
    gltf.scene.traverse((node) => {
      // ✨ One-time dynamic effect
      if (!hasEffectAdded) {
        const port = gltf.scene.getObjectByName('port');
        if (port) {
          dynamicEffect(port);
          console.log(port);
          hasEffectAdded = true;
        }
      }
      if (node.name === 'door') {
        node.traverse((child) => {
          child.userData['doorFather'] = node
        });
      }
      // 🌗 Enable shadow
      node.castShadow = true;
      node.receiveShadow = true;

    });
    loader.load('dance.glb', (gltf) => {
      const danceplayer = gltf.scene// 💥 store only the scene!
      danceplayer.position.copy(scene.getObjectByName('danceTarget').position.clone().add(new THREE.Vector3(0, 0, 0)))
      danceplayer.rotateY(Math.PI / 2)
      const danceplayer2 = clone(danceplayer)// clone the character
      danceplayer2.position.copy(scene.getObjectByName('danceTarget2').position.clone().add(new THREE.Vector3(0, 0, 0)))
      const danceplayer3 = clone(danceplayer)// clone the character
      danceplayer3.position.copy(scene.getObjectByName('danceTarget3').position.clone().add(new THREE.Vector3(0, 0, 0)))
      scene.add(danceplayer);
      scene.add(danceplayer2);
      scene.add(danceplayer3);

      danceplayer.traverse((node) => {
        node.castShadow = true;
        node.receiveShadow = true;
      })
      danceplayer2.traverse((node) => {
        node.castShadow = true;
        node.receiveShadow = true;
      })
      danceplayer3.traverse((node) => {
        node.castShadow = true;
        node.receiveShadow = true;
      })

      danceplayer.scale.set(3, 3, 3);
      danceplayer2.scale.set(3, 3, 3);
      danceplayer3.scale.set(3, 3, 3);
      mixerdance = new THREE.AnimationMixer(danceplayer); // ✅ use the correct model
      const dance = new THREE.AnimationAction(mixerdance, gltf.animations[0])
      mixerdance2 = new THREE.AnimationMixer(danceplayer2); // ✅ use the correct model
      const dance2 = new THREE.AnimationAction(mixerdance2, gltf.animations[0])
      mixerdance3 = new THREE.AnimationMixer(danceplayer3); // ✅ use the correct model
      const dance3 = new THREE.AnimationAction(mixerdance3, gltf.animations[0])
      // 🎬 Play the idle animation by defaul
      dance.play();
      dance2.play();
      dance3.play();




    })
    addGameTree()
  },
);

//LOADING FIREWORK
let model;
// loader.load(
//   'firework.glb',
//   (gltf) => {
//     model = gltf// 💥 store only the scene!
//     scene.add(model.scene);
//     gltf.scene.traverse((node) => {
//       objects.push(node);
//     })
//   },
//   undefined,
//   (error) => {
//     console.error('❌ Error loading firework model:', error);
//   }
// );

let labelRenderer;
function setPlayerName() {
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  document.body.appendChild(labelRenderer.domElement);


  const namDiv = document.createElement('div')
  //suggest me a player name that cute:
  namDiv.textContent = 'FLICKY'
  namDiv.style.cssText = 'color:white;font-size:14px;font-family:Arial;background-color:rgba(2, 85, 241, 0.5);padding:10px;border-radius:5px;'

  const nameLabel = new CSS2DObject(namDiv)
  player.add(nameLabel)
  nameLabel.position.set(0, 2.1, 0)

}
let setRandomScale;
function addGameTree() {
  const treeLeftStart = scene.getObjectByName('sideleftStart')
  const treeLeftEnd = scene.getObjectByName('sideleftEnd')
  const treeRightStart = scene.getObjectByName('siderightStart')
  const treeRightEnd = scene.getObjectByName('siderightEnd')
  loader.load(
    'tree.glb',
    (gltfLeft) => {
      const tree = gltfLeft// 💥 store only the scene!
      const treePosition=new THREE.Vector3()
      const treeCount=8;
      //leftside
      for(let i=0;i<treeCount;i++){
        treePosition.lerpVectors(treeLeftStart.position,treeLeftEnd.position,i/treeCount)
        setRandomScale=(Math.random())/2+ 0.5
        const treeClone=tree.scene.clone()
        treeClone.position.copy(treePosition)
        scene.add(treeClone)
        treeClone.scale.set(setRandomScale,setRandomScale,setRandomScale)

        gsap.to(treeClone.position, {
          x: treeLeftEnd.position.x,
          y: treeLeftEnd.position.y,
          z: treeLeftEnd.position.z,
          duration: 8-i,
          ease: 'none',
          onComplete:()=>{
            treeClone.position.copy(treeLeftStart.position)
            gsap.to(treeClone.position, {
              x: treeLeftEnd.position.x,
              y: treeLeftEnd.position.y,
              z: treeLeftEnd.position.z,
              duration:8,
              ease:'none',
              repeat:-1
            })
          }
        })
      }
      //rightside
      for(let i=0;i<treeCount;i++){
        treePosition.lerpVectors(treeRightStart.position,treeRightStart.position,i/treeCount)
        setRandomScale=(Math.random())/2+ 0.5
        const treeClone=tree.scene.clone()
        treeClone.position.copy(treePosition)
        scene.add(treeClone)
        treeClone.scale.set(setRandomScale,setRandomScale,setRandomScale)

        gsap.to(treeClone.position, {
          x: treeRightEnd.position.x,
          y: treeRightEnd.position.y,
          z: treeRightEnd.position.z,
          duration: 8-i,
          ease: 'none',
          onComplete:()=>{
            treeClone.position.copy(treeRightStart.position)
            gsap.to(treeClone.position, {
              x: treeRightEnd.position.x,
              y: treeRightEnd.position.y,
              z: treeRightEnd.position.z,
              duration:8,
              ease:'none',
              repeat:-1
            })
          }
        })
      }
      gltfLeft.scene.traverse((node) => {
        objects.push(node);
        node.castShadow = true;
        node.receiveShadow = true;
      })
    },
    undefined,
    (error) => {
      console.error('❌ Error loading firework model:', error);
    }
  );
}
let clipIdle
let model01
let mixer01;
let player;
let clipRun
let clipWalk
let actionIdle
let actionWalk
let actionRun
//loading character
loader.load('characteranimation.glb', (gltf) => {
  player = gltf.scene// 💥 store only the scene!
  model01 = gltf// 💥 store only the scene!
  scene.add(gltf.scene);

  gltf.scene.traverse((node) => {
    node.castShadow = true;
    node.receiveShadow = true;
  })
  // gltf.scene.position.set(0,1.9,0);
  // gltf.scene.scale.set(2,2,2);
  mixer01 = new THREE.AnimationMixer(model01.scene); // ✅ use the correct model
  clipIdle = THREE.AnimationUtils.subclip(gltf.animations[0], 'idle', 0, 61);
  clipWalk = THREE.AnimationUtils.subclip(gltf.animations[0], 'walk', 65, 96);
  clipRun = THREE.AnimationUtils.subclip(gltf.animations[0], 'running', 100, 117);

  // 🎬 Play the idle animation by defaul
  actionIdle = mixer01.clipAction(clipIdle);
  actionWalk = mixer01.clipAction(clipWalk);
  actionRun = mixer01.clipAction(clipRun);
  actionIdle.play();

  setThirdPersonCamera(player);
  setPlayerName()
})


// 🌞🌍🌑 Dynamic Effect: Sun, Earth, Moon
const dynamicEffect = (e) => {
  // ☀️ Sun
  if (!e) {
    console.error('No object found to attach the sun effect to.');
    return;
  }
  const sun = new THREE.SphereGeometry(1, 34, 34);
  const sunMaterial = new THREE.MeshStandardMaterial({
    color: 0xFDB813,
    emissive: 0xFDB813,
    emissiveIntensity: 1,
    metalness: 0.8,
    roughness: 0.1,
  });
  sunMesh = new THREE.Mesh(sun, sunMaterial);
  sunMesh.position.copy(new THREE.Vector3()).set(e.position.x, e.position.y + 2, e.position.z);
  scene.add(sunMesh);

  // 🌍 Earth
  const earth = new THREE.SphereGeometry(0.5, 34, 34);
  const earthMaterial = new THREE.MeshStandardMaterial({
    color: 0x1E90FF,
    metalness: 0.8,
    roughness: 0.1,
  });
  earthMesh = new THREE.Mesh(earth, earthMaterial);
  earthMesh.position.set(5, 0, 0);

  // 🌑 Moon
  const moon = new THREE.SphereGeometry(0.3, 34, 34);
  const moonMaterial = new THREE.MeshStandardMaterial({
    color: 0xC0C0C0,
    metalness: 0.8,
    roughness: 0.1,
  });
  moonMesh = new THREE.Mesh(moon, moonMaterial);
  moonMesh.position.set(2, 0, 0);

  // 🔗 Hierarchy
  sunMesh.add(earthMesh);
  earthMesh.add(moonMesh);
};
dynamicEffect()

// Create geometry with N points
const count = 500;
const positions = new Float32Array(count * 3); // x, y, z
const colors = new Float32Array(count * 3);    // r, g, b

for (let i = 0; i < count; i++) {
  const i3 = i * 3;

  // Random position
  positions[i3 + 0] = (Math.random() - 0.5) * 60;
  positions[i3 + 1] = (Math.random() - 0.5) * 60;
  positions[i3 + 2] = (Math.random() - 0.5) * 60;

  // Random color using THREE.Color
  const color = new THREE.Color(Math.random(), Math.random(), Math.random());

  colors[i3 + 0] = color.r;
  colors[i3 + 1] = color.g;
  colors[i3 + 2] = color.b;
}

// Create geometry and add attributes
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Material with vertex colors enabled
const material = new THREE.PointsMaterial({
  size: 1,
  map: star,
  transparent: true,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
});

// Create and add points to scene
const points = new THREE.Points(geometry, material);
scene.add(points);

// 🎬 GSAP Animation for Stars
gsap.to(points.position, { x: 28, duration: 50, repeat: -1, yoyo: true, ease: 'ease' });
// Update the raycaster setup
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let camerWorldPosition = new THREE.Vector3();
let cameraWorldRotation = new THREE.Quaternion();
let sphere;
function castingRay() {
  // Update raycaster
  if (cameraFLY.visible === true) {
    raycaster.setFromCamera(pointer, cameraFLY);
  } else {
    raycaster.setFromCamera(pointer, camera);
  }

  // Get all objects in the scene to check for intersections
  const objectsToIntersect = [];
  scene.traverse((object) => {
    if (object.isMesh) {
      objectsToIntersect.push(object);
    }
  });

  const intersects = raycaster.intersectObjects(objectsToIntersect, true);

  if (intersects.length > 0) {
    // Check for firework interaction
    if (intersects[0].object.name === 'Cylinder005') {
      const fireworkGroup = scene.getObjectByName('fireworkgroup');
      if (fireworkGroup) {
        fireworkGroup.rotateY(30);
        mixer = new THREE.AnimationMixer(model.scene);
        model.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          action.setLoop(THREE.LoopOnce);
          action.clampWhenFinished = true;
          action.play();
        });
      }
    }
  }

}

// Update the click event listener
window.addEventListener('click', (event) => {
  // Calculate normalized device coordinates
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Call the raycast function
  castingRay();
});
//keys event
let isMoving = false;
let isRunning = false;
let preWalkTime = 0;
// Update these constants at the top of your file
const WALK_SPEED = 0.1;  // Increased from 0.1
const RUN_SPEED = 0.3;    // Increased from 0.2
const RUN_TRANSITION_TIME = 3; // Reduced from 4 seconds
const playerDirection = new THREE.Vector3();
const playerFront = new THREE.Vector3(0, 0, 0);

// Modify the keydown event listener
window.addEventListener('keydown', (event) => {
  if (event.key === 'w') {

    if (player) {
      // player.rotation.copy(visualTargetMesh.rotation);
      const playDirection = new THREE.Vector3();
      player.getWorldDirection(playDirection);
      playDirection.y = 0;

      const virtualTargetDirection = new THREE.Vector3();
      visualTargetMesh.getWorldDirection(virtualTargetDirection);
      virtualTargetDirection.y = 0;

      const radian = playDirection.angleTo(virtualTargetDirection);
      visualTargetMesh.position.copy(player.position).add(new THREE.Vector3(0, -1.5, 0));
      // player.rotateY(radian);
      const playerDirection = new THREE.Vector3();
      playDirection.cross(virtualTargetDirection)

      if (playDirection.y > 0) {
        if (radian > 0.1) {
          player.rotateY(0.1);
        }

      } else if (playDirection.y < 0) {
        if (radian > 0.1) {
          player.rotateY(-0.1);
        }
      }

      // First get player direction
      player.getWorldDirection(playerFront);

      // Setup raycaster with origin and direction
      const raycasterFront = new THREE.Raycaster(player.position.clone(), playerFront);

      // Then check for intersections
      const frontCollision = raycasterFront.intersectObjects(scene.children, true);
      // Only allow movement if no collision is detected or collision is far enough
      if (frontCollision.length === 0 || frontCollision[0].distance > 1) {
        if (!isMoving) {
          crossPlay(actionIdle, actionRun);
          isMoving = true;
        }
        if (!preWalkTime) {
          preWalkTime = clock.getElapsedTime();
        }
        // if (!isRunning && clock.getElapsedTime() - preWalkTime > 4) {
        //   crossPlay(actionWalk, actionRun);
        //   isRunning = true;
        // }
        if (isMoving) {
          player.translateZ(0.3);
        }
        // if(isRunning){
        //   player.translateZ(0.2);
        // }
      }
    }
  }


})
window.addEventListener('keyup', (event) => {
  if (event.key === 'w') {
    if (isMoving) {
      crossPlay(actionRun, actionIdle);
      isMoving = false;
    }
    preWalkTime = 0;
    // if(isRunning) {
    //   crossPlay(actionRun, actionIdle);
    //   isRunning = false;
    // }


  }
})
// to make the animation smooth
function crossPlay(prevAct, newAct) {
  prevAct.fadeOut(0.2); // Reduced from 0.5
  newAct.reset();
  newAct.setEffectiveWeight(1);
  newAct.fadeIn(0.2);  // Reduced from 0.5
  newAct.play();
}
// ...existing code...
let preScreenX = 0;
let mouseOffsetX = 0;
let mouseOffsetY = 0;
let preScreenY = 0;
let yAxis = new THREE.Vector3(0, 1, 0);
let xAxis = new THREE.Vector3(1, 0, 0);

// Track if we're currently rotating horizontally or vertically
let isRotatingHorizontal = false;
let isRotatingVertical = false;
let cameraYvec3 = new THREE.Vector3(0, 0, 0);
window.addEventListener('mousemove', (event) => {
  const screenX = event.clientX;
  const screenY = event.clientY;

  mouseOffsetX = screenX - preScreenX;
  mouseOffsetY = screenY - preScreenY;

  if (isMouseDown && cameraFLY.visible === true) {
    if (preScreenX) {
      cameraFLY.rotateOnWorldAxis(yAxis, -mouseOffsetX * delta)
    }
  }
  // Check if the mouse is down and the camera is visible
  if (isMouseDown && camera.visible === true) {
    if (visualTargetMesh) {
      // Determine rotation type based on which offset is larger
      if (Math.abs(mouseOffsetX) > Math.abs(mouseOffsetY)) {
        // Horizontal rotation
        if (mouseOffsetX > 0) {
          visualTargetMesh.rotateOnWorldAxis(yAxis, -0.1);
        } else if (mouseOffsetX < 0) {
          visualTargetMesh.rotateOnWorldAxis(yAxis, 0.1);
        }
      } else {
        // Vertical rotation
        if (mouseOffsetY > 0) {
          camera.getWorldPosition(cameraYvec3);
          if (cameraYvec3.y > 2) {
            visualTargetMesh.rotateX(-0.01);
          }
        } else if (mouseOffsetY < 0) {
          camera.getWorldPosition(cameraYvec3);
          if (cameraYvec3.y < 4) {
            visualTargetMesh.rotateX(0.01);
          }
        }
      }
    }
  }

  preScreenX = screenX;
  preScreenY = screenY;
});

//mouse Down event
let isMouseDown = false;
window.addEventListener('mousedown', (event) => {
  if (event.button === 0) { // Left mouse button
    isMouseDown = true;
    preScreenX = undefined
    preScreenY = undefined
  }
});

window.addEventListener('mouseup', (event) => {
  if (event.button === 0) { // Left mouse button
    isMouseDown = false;
    console.log('Mouse up!');
  }
})
//thirdpersone camera
let visualTargetMesh;
function setThirdPersonCamera(playerMesh) {
  //box geometry for the camera
  const boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  visualTargetMesh = new THREE.Mesh(boxGeometry, boxMaterial);
  visualTargetMesh.visible = false; // Hide the box mesh
  scene.add(visualTargetMesh);

  // playerMesh.add(visualTargetMesh);
  visualTargetMesh.add(camera);
  camera.position.set(0, 3.5, -3); // Set camera position relative to the playe
  camera.lookAt(playerMesh.position.clone().add(new THREE.Vector3(0, 2.5, 0))); // Look at the player position
}

//mousewheel event
let scrollspeed = 0
window.addEventListener('wheel', (event) => {
  scrollspeed += delta
  if (event.deltaY < 0) {
    camera.translateZ(-scrollspeed)
  } else if (event.deltaY > 0) {
    camera.translateZ(scrollspeed)
  }
});
// 🔄 Animation Loop
let delta = 0;
function animate() {
  requestAnimationFrame(animate);

  delta = clock.getDelta();
  //controls.update();

  if (mixer) mixer.update(delta);
  if (mixer01) mixer01.update(delta);
  if (mixerdance && mixerdance2 && mixerdance3) {
    mixerdance.update(delta);
    mixerdance2.update(delta);
    mixerdance3.update(delta);
  }
  // // 🌌 Planet Rotations
  if (sunMesh && earthMesh && moonMesh) {
    sunMesh.rotation.y += 0.002;
    earthMesh.rotation.y += 0.02;
    moonMesh.rotation.y += 0.04;
  }

  if (camera.visible === true) {
    renderer.render(scene, camera);
  }
  if (cameraFLY.visible === true) {
    renderer.render(scene, cameraFLY);
  }
  if (labelRenderer) {
    labelRenderer.render(scene, camera)
  }

}

// 🔁 Responsive Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 🚀 Start the animation
animate();
