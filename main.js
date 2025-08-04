if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 50);

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
document.getElementById('container3D').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
scene.add(topLight);

const islandLight = new THREE.DirectionalLight(0x87ceeb, 0.8);
islandLight.position.set(-200, 300, -200);
scene.add(islandLight);

const pointLight = new THREE.PointLight(0xffffff, 2, 50);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

let island;
let islandMixer;
const loader = new THREE.GLTFLoader();

// Position configuration
const ISLAND_CENTER_POSITION = { x: 0, y: 0, z: 0 };

let arrPositionModel = [
  {
    id: 'banner',
    position: { x: ISLAND_CENTER_POSITION.x, y: ISLAND_CENTER_POSITION.y, z: ISLAND_CENTER_POSITION.z },
    rotation: { x: 0, y: 1.5, z: 0 }
  },
  {
    id: 'intro',
    position: { x: 5, y: 11, z: -5 },
    rotation: { x: 0, y: 0.5, z: 0 }
  },
  {
    id: 'description',
    position: { x: 4, y: -1, z: -5 },
    rotation: { x: 0, y: 0.5, z: 0 }
  },
  {
    id: 'members',
    position: { x: 12, y: 1, z: -5 },
    rotation: { x: 0, y: 0.5, z: 0 }
  },
  {
    id: 'contact',
    position: { x: -25, y: 1, z: -10 },
    rotation: { x: 0, y: -0.5, z: 0 }
  }
];

// Load GLB model
const modelUrl = 'workingisland.glb';

loader.load(
  modelUrl,
  (gltf) => {
    island = gltf.scene;
    island.scale.set(1, 1, 1);
    scene.add(island);

    // Set initial position
    const bannerEntry = arrPositionModel.find(e => e.id === 'banner');
    if (bannerEntry) {
      island.position.set(
        bannerEntry.position.x,
        bannerEntry.position.y,
        bannerEntry.position.z
      );
      island.rotation.set(
        bannerEntry.rotation.x,
        bannerEntry.rotation.y,
        bannerEntry.rotation.z
      );
    }

    // Improve texture quality
    island.traverse((child) => {
      if (child.isMesh && child.material.map) {
        child.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
        child.material.map.encoding = THREE.sRGBEncoding;
        child.material.needsUpdate = true;
      }
    });
  },
  (xhr) => {
    console.log('Island loading progress:', (xhr.loaded / xhr.total) * 100 + '%');
  },
  (error) => {
    console.error('Error loading island model:', error);
  }
);

// Model movement based on scroll
function modelMove() {
  if (!island) return;

  const sections = document.querySelectorAll('.section');
  let currentSectionId;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight / 3) {
      currentSectionId = section.id;
    }
  });

  const idx = arrPositionModel.findIndex((entry) => entry.id === currentSectionId);
  if (idx < 0) return;

  const { position, rotation } = arrPositionModel[idx];

  gsap.to(island.position, {
    x: position.x,
    y: position.y,
    z: position.z,
    duration: 1,
    ease: 'power1.out'
  });

  gsap.to(island.rotation, {
    x: rotation.x,
    y: rotation.y,
    z: rotation.z,
    duration: 1,
    ease: 'power1.out'
  });
}

function reRender3D() {
  requestAnimationFrame(reRender3D);
  renderer.render(scene, camera);
  if (islandMixer) islandMixer.update(0.02);
}
reRender3D();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

window.addEventListener('scroll', () => {
  modelMove();
});
