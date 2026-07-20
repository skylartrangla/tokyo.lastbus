import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const $ = (id) => document.getElementById(id);
const sceneHost = $('scene');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.82;
sceneHost.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x06090d);
scene.fog = new THREE.FogExp2(0x0b1015, 0.022);

const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 180);
camera.position.set(13.5, 5.1, 16.5);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(-1.5, 2.3, 0);
controls.enableDamping = true;
controls.enabled = false;
controls.minDistance = 6;
controls.maxDistance = 38;
controls.maxPolarAngle = Math.PI * 0.49;
controls.update();

const world = new THREE.Group();
scene.add(world);
const dynamicGroup = new THREE.Group();
world.add(dynamicGroup);

const mat = (color, roughness = .82, metalness = .05) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const mesh = (geometry, material, position, parent = world) => {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(...position);
  item.castShadow = true;
  item.receiveShadow = true;
  parent.add(item);
  return item;
};
const box = (size, material, position, parent) => mesh(new THREE.BoxGeometry(...size), material, position, parent);

// Ground, road, pavement, and subdued lane markings.
const asphalt = mat(0x0b1014, .95);
mesh(new THREE.PlaneGeometry(120, 80), asphalt, [0, 0, 0]).rotation.x = -Math.PI / 2;
const curbMat = mat(0x394044, .96);
box([60, .2, 7.3], curbMat, [0, .1, -4.9]);
box([60, .32, .34], mat(0x555c5e), [0, .18, -1.2]);
for (let x = -42; x < 42; x += 7) box([3.2, .018, .09], mat(0x8b8b76), [x, .023, 3.1]);

// Low city silhouettes. These are intentionally primitive and easy to replace.
for (let i = 0; i < 18; i++) {
  const h = 5 + (i % 5) * 1.7;
  const b = box([4.8, h, 3], mat(i % 3 === 0 ? 0x11181d : 0x0d1318), [-43 + i * 5.1, h / 2, -12 - (i % 3)], dynamicGroup);
  b.castShadow = false;
}

// Bus shelter.
const metal = mat(0x252c2f, .38, .72);
const shelter = new THREE.Group();
shelter.position.set(-1.2, 0, -3.5);
world.add(shelter);
box([9.8, .25, 3.1], metal, [0, 4.25, 0], shelter);
box([10.2, .16, 3.45], mat(0x151b1e, .5, .55), [0, 4.43, 0], shelter);
for (const x of [-4.6, 0, 4.6]) {
  box([.13, 4.2, .13], metal, [x, 2.1, -.95], shelter);
  box([.13, 4.2, .13], metal, [x, 2.1, 1.15], shelter);
}
const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x8fa5aa, roughness: .16, metalness: 0, transparent: true, opacity: .19, transmission: .38 });
box([9.3, 3.7, .055], glassMat, [0, 2.15, 1.12], shelter);
box([.055, 3.7, 2], glassMat, [-4.56, 2.15, .08], shelter);

// Bench.
for (const z of [-.28, .33]) box([5.8, .18, .38], mat(0x3b2922, .7), [-.25, 1.05, z], shelter);
for (const x of [-2.5, 2]) box([.14, .9, .14], metal, [x, .54, 0], shelter);

// Route sign and timetable.
box([1.05, 2.4, .08], mat(0xe7e2d4), [-3.65, 2.25, 1.05], shelter);
box([.82, .18, .09], mat(0xc7493f), [-3.65, 3.05, 1.0], shelter);
for (let i = 0; i < 7; i++) box([.63 - (i % 2) * .14, .025, .02], mat(0x2b3032), [-3.68, 2.78 - i * .22, .995], shelter);

// Vending machine, built from named groups for future GLTF replacement.
const vending = new THREE.Group();
vending.name = 'PLACEHOLDER_VENDING_MACHINE';
vending.position.set(5.15, 0, -3.55);
world.add(vending);
box([2.05, 3.75, 1.22], mat(0x8f251e, .4, .35), [0, 1.9, 0], vending);
const vendingScreenMat = new THREE.MeshStandardMaterial({ color: 0xdbeaff, emissive: 0xbfdcff, emissiveIntensity: 3.2, roughness: .18 });
box([1.62, 1.75, .08], vendingScreenMat, [0, 2.58, .65], vending);
for (let row = 0; row < 3; row++) for (let col = 0; col < 5; col++) {
  const canMat = new THREE.MeshStandardMaterial({ color: (row + col) % 3 === 0 ? 0xe15345 : 0xd8d2bd, emissive: 0x665544, emissiveIntensity: .3 });
  box([.18, .36, .07], canMat, [-.63 + col * .31, 3.13 - row * .48, .705], vending);
}
box([.55, .5, .08], mat(0x161c20, .35), [.43, 1.12, .66], vending);
box([1.35, .24, .1], mat(0x15191b, .35), [0, .42, .67], vending);
const vendingLight = new THREE.PointLight(0xbfdcff, 7, 8, 2);
vendingLight.position.set(0, 2.4, 1.55);
vending.add(vendingLight);

// Streetlight and its warm pool.
const lamp = new THREE.Group();
lamp.name = 'PLACEHOLDER_STREETLIGHT';
lamp.position.set(-7.4, 0, -1.7);
world.add(lamp);
box([.18, 6.9, .18], metal, [0, 3.45, 0], lamp);
box([2.2, .13, .16], metal, [.98, 6.76, 0], lamp);
box([.8, .18, .55], mat(0x33383a, .3, .65), [1.86, 6.62, 0], lamp);
const bulbMat = new THREE.MeshStandardMaterial({ color: 0xffd39a, emissive: 0xffa34e, emissiveIntensity: 6 });
box([.55, .05, .35], bulbMat, [1.86, 6.49, 0], lamp);
const streetLight = new THREE.SpotLight(0xffb15c, 52, 22, Math.PI * .32, .62, 1.55);
streetLight.position.set(1.86, 6.4, 0);
streetLight.target.position.set(2.2, 0, .3);
streetLight.castShadow = true;
streetLight.shadow.mapSize.set(1024, 1024);
lamp.add(streetLight, streetLight.target);

// Bus-stop pole, utility details, and puddles.
box([.13, 4.5, .13], metal, [-8.2, 2.25, -1.15]);
const sign = mesh(new THREE.CylinderGeometry(.48, .48, .11, 32), mat(0xe9e2d2), [-8.2, 4.2, -1.15]);
sign.rotation.x = Math.PI / 2;
const signDot = mesh(new THREE.CylinderGeometry(.19, .19, .12, 32), mat(0xd54e42), [-8.2, 4.2, -1.14]);
signDot.rotation.x = Math.PI / 2;
for (let i = 0; i < 12; i++) {
  const puddle = mesh(new THREE.CircleGeometry(.5 + (i % 4) * .42, 32), new THREE.MeshPhysicalMaterial({ color: 0x121d23, roughness: .12, metalness: .22, transparent: true, opacity: .68 }), [-11 + i * 2.1, .025, -1.8 - (i % 3) * 1.2], dynamicGroup);
  puddle.rotation.x = -Math.PI / 2;
  puddle.scale.y = .3 + (i % 2) * .18;
}

// Atmospheric lights.
const hemi = new THREE.HemisphereLight(0x18293a, 0x030405, .62);
scene.add(hemi);
const rim = new THREE.DirectionalLight(0x476d86, .35);
rim.position.set(8, 14, -12);
scene.add(rim);

// Rain particle field.
const maxDrops = 9200;
const rainPositions = new Float32Array(maxDrops * 3);
const resetDrop = (i, high = true) => {
  rainPositions[i * 3] = (Math.random() - .5) * 52;
  rainPositions[i * 3 + 1] = high ? Math.random() * 22 : 18 + Math.random() * 7;
  rainPositions[i * 3 + 2] = (Math.random() - .5) * 35;
};
for (let i = 0; i < maxDrops; i++) resetDrop(i);
const rainGeometry = new THREE.BufferGeometry();
rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
rainGeometry.setDrawRange(0, Math.floor(maxDrops * .55));
const rain = new THREE.Points(rainGeometry, new THREE.PointsMaterial({ color: 0xaec5cf, size: .035, transparent: true, opacity: .62, depthWrite: false }));
scene.add(rain);

// Passing traffic. Simple luminous blocks suggest cars through the rain.
const cars = [];
for (let i = 0; i < 7; i++) {
  const car = new THREE.Group();
  const body = box([2.6, .68, 1.05], mat(i % 3 === 0 ? 0x26333c : 0x13191d, .3, .45), [0, .58, 0], car);
  body.name = 'PLACEHOLDER_CAR';
  const front = new THREE.MeshStandardMaterial({ color: 0xf4e6c0, emissive: 0xffe3a6, emissiveIntensity: 7 });
  const rear = new THREE.MeshStandardMaterial({ color: 0xd62e26, emissive: 0xe32b23, emissiveIntensity: 5 });
  box([.06, .22, .24], front, [1.33, .56, -.33], car);
  box([.06, .22, .24], front, [1.33, .56, .33], car);
  box([.06, .2, .23], rear, [-1.33, .55, -.33], car);
  box([.06, .2, .23], rear, [-1.33, .55, .33], car);
  car.position.set(-42 - i * 17, 0, 2.2 + (i % 2) * 2.2);
  car.userData.speed = 6.5 + i * .72;
  car.visible = i < 3;
  scene.add(car);
  cars.push(car);
}

// Seeded environmental variation.
function mulberry32(seed) {
  return () => { let t = seed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
let currentSeed = 42;
function applySeed(seed) {
  currentSeed = seed;
  const rand = mulberry32(seed);
  $('seed-value').textContent = `NIGHT-${String(seed).padStart(3, '0')}`;
  dynamicGroup.children.forEach((item, index) => {
    if (item.geometry?.type === 'CircleGeometry') {
      item.position.x = -12 + rand() * 28;
      item.position.z = -1.5 - rand() * 5;
      item.scale.set(.55 + rand() * 1.3, .18 + rand() * .3, 1);
    } else if (item.geometry?.type === 'BoxGeometry') {
      item.material.color.offsetHSL(0, 0, (rand() - .5) * .035);
    }
    item.userData.seedIndex = index;
  });
  cars.forEach((car, i) => {
    car.position.x = -45 - rand() * 65 - i * 7;
    car.userData.speed = 5.4 + rand() * 5.2;
  });
}
applySeed(currentSeed);

// Browser-generated ambient audio: filtered noise, electrical hum, distant traffic.
let audio;
function ensureAudio() {
  if (audio) return audio.ctx.resume();
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource(); noise.buffer = buffer; noise.loop = true;
  const rainFilter = ctx.createBiquadFilter(); rainFilter.type = 'highpass'; rainFilter.frequency.value = 1800;
  const rainGain = ctx.createGain(); rainGain.gain.value = .2;
  noise.connect(rainFilter).connect(rainGain).connect(master); noise.start();
  const hum = ctx.createOscillator(); hum.frequency.value = 55;
  const humGain = ctx.createGain(); humGain.gain.value = .045;
  hum.connect(humGain).connect(master); hum.start();
  const trafficNoise = ctx.createBufferSource(); trafficNoise.buffer = buffer; trafficNoise.loop = true;
  const trafficFilter = ctx.createBiquadFilter(); trafficFilter.type = 'lowpass'; trafficFilter.frequency.value = 240;
  const trafficGain = ctx.createGain(); trafficGain.gain.value = .08;
  trafficNoise.connect(trafficFilter).connect(trafficGain).connect(master); trafficNoise.start();
  audio = { ctx, master, rainGain, trafficGain };
}

const settings = { rain: .55, fog: .38, traffic: .34, time: 42, photo: false };
function setRangeFill(input) {
  const value = (input.value - input.min) / (input.max - input.min) * 100;
  input.style.setProperty('--fill', `${value}%`);
}
document.querySelectorAll('input[type="range"]').forEach((input) => { setRangeFill(input); input.addEventListener('input', () => setRangeFill(input)); });

$('rain').addEventListener('input', (e) => {
  settings.rain = e.target.value / 100;
  rainGeometry.setDrawRange(0, Math.floor(maxDrops * settings.rain));
  $('rain-output').value = `${e.target.value}%`;
  if (audio) audio.rainGain.gain.setTargetAtTime(.05 + settings.rain * .35, audio.ctx.currentTime, .2);
});
$('fog').addEventListener('input', (e) => {
  settings.fog = e.target.value / 100;
  scene.fog.density = .006 + settings.fog * .043;
  $('fog-output').value = `${e.target.value}%`;
});
$('street-color').addEventListener('input', (e) => {
  streetLight.color.set(e.target.value);
  bulbMat.color.set(e.target.value);
  bulbMat.emissive.set(e.target.value);
});
$('vending-glow').addEventListener('input', (e) => {
  const amount = e.target.value / 100;
  vendingScreenMat.emissiveIntensity = .25 + amount * 5;
  vendingLight.intensity = amount * 10;
});
function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
$('time').addEventListener('input', (e) => {
  settings.time = Number(e.target.value);
  const time = formatTime(settings.time);
  $('time-output').value = time; $('clock').textContent = time;
  const dawn = settings.time / 300;
  scene.background.setRGB(.018 + dawn * .055, .03 + dawn * .085, .045 + dawn * .13);
  scene.fog.color.copy(scene.background).lerp(new THREE.Color(0x17212a), .4);
  hemi.intensity = .42 + dawn * .65;
  renderer.toneMappingExposure = .73 + dawn * .32;
});
$('traffic').addEventListener('input', (e) => {
  settings.traffic = e.target.value / 100;
  const labels = settings.traffic < .15 ? 'Empty' : settings.traffic < .45 ? 'Occasional' : settings.traffic < .75 ? 'Steady' : 'Busy';
  $('traffic-output').value = labels;
  cars.forEach((car, i) => car.visible = i < Math.ceil(settings.traffic * cars.length));
  if (audio) audio.trafficGain.gain.setTargetAtTime(.025 + settings.traffic * .15, audio.ctx.currentTime, .2);
});
$('sound').addEventListener('input', async (e) => {
  await ensureAudio();
  const amount = e.target.value / 100;
  audio.master.gain.setTargetAtTime(amount * .44, audio.ctx.currentTime, .15);
  $('sound-output').value = amount === 0 ? 'Off' : `${e.target.value}%`;
});
$('randomize').addEventListener('click', () => applySeed(Math.floor(Math.random() * 999) + 1));

function setPhotoMode(enabled) {
  settings.photo = enabled;
  controls.enabled = enabled;
  document.body.classList.toggle('photo', enabled);
  $('photo-tools').hidden = !enabled;
}
$('photo-mode').addEventListener('click', () => setPhotoMode(true));
$('exit-photo').addEventListener('click', () => setPhotoMode(false));
$('save-frame').addEventListener('click', () => {
  renderer.render(scene, camera);
  const link = document.createElement('a');
  link.download = `last-bus-${currentSeed}-${formatTime(settings.time).replace(':', '')}.png`;
  link.href = renderer.domElement.toDataURL('image/png');
  link.click();
});
$('toggle-panel').addEventListener('click', () => {
  const closed = $('panel').classList.toggle('closed');
  $('toggle-panel').setAttribute('aria-expanded', String(!closed));
});
addEventListener('keydown', (event) => { if (event.key === 'Escape' && settings.photo) setPhotoMode(false); });

const clock = new THREE.Clock();
let elapsed = 0;
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), .03);
  elapsed += delta;
  const positions = rainGeometry.attributes.position.array;
  const activeDrops = rainGeometry.drawRange.count;
  for (let i = 0; i < activeDrops; i++) {
    positions[i * 3 + 1] -= (.24 + settings.rain * .48);
    positions[i * 3] += .018;
    if (positions[i * 3 + 1] < 0) resetDrop(i, false);
  }
  rainGeometry.attributes.position.needsUpdate = true;
  cars.forEach((car) => {
    if (!car.visible) return;
    car.position.x += car.userData.speed * delta * (.55 + settings.traffic);
    if (car.position.x > 48) car.position.x = -52 - Math.random() * 45;
  });
  if (!settings.photo && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    camera.position.x = 13.5 + Math.sin(elapsed * .09) * 1.15;
    camera.position.y = 5.1 + Math.sin(elapsed * .13) * .18;
    camera.lookAt(-1.5 + Math.sin(elapsed * .075) * .6, 2.15, 0);
  }
  controls.update();
  renderer.render(scene, camera);
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

animate();
setTimeout(() => $('loading').classList.add('done'), 850);
