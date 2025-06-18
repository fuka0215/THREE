import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Sky } from 'three/addons/objects/Sky.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DragControls } from 'three/addons/controls/DragControls.js'

/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1,2,2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true
controls.maxPolarAngle = Math.PI / 2 -0.03; // 床下にカメラが行かないように
controls.minDistance = 3; // ズームインした時の上限値
controls.maxDistance = 50; // ズームアウトした時の上限

/**
 * Renderer
*/
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// 地平線をぼやけさせる
scene.fog = new THREE.FogExp2( 0xffffff, 0.015 );

// 空
const sky = new Sky();
sky.scale.setScalar( 450000 );
scene.add( sky );

const skyUniforms = sky.material.uniforms;
skyUniforms['turbidity'].value = 14; //空の霞み
skyUniforms['rayleigh'].value = 0.5; //レイリー散乱

const sun = new THREE.Vector3();
const phi = THREE.MathUtils.degToRad(18); // 高度
const theta = THREE.MathUtils.degToRad(0); // 方角
sun.setFromSphericalCoords(1, phi, theta);
skyUniforms['sunPosition'].value.copy(sun);

// x,y,zへの補助線
const axesHelper = new THREE.AxesHelper()
scene.add(axesHelper)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight()
ambientLight.color = new THREE.Color(0xffffff)
ambientLight.intensity = 1
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9)
directionalLight.position.set(0, 1, 0.5)
scene.add(directionalLight)

const textureLoader = new THREE.TextureLoader();

/**
 * Objects
*/

// マス目の床
const svgString = encodeURIComponent(`<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <!-- １．まず背景用の rect を最初に置く -->
  <rect width="100%" height="100%" fill="#f0f0f0" />

  <defs>
    <!-- 細かいグリッド（10px 間隔、薄い線） -->
    <pattern id="smallGrid" width="10" height="5" patternUnits="userSpaceOnUse">
      <path
        d="M10 0 L0 0 0 10"
        fill="none"
        stroke="#ff1493"
        stroke-width="0.5"
      />
    </pattern>

    <!-- 太いグリッド（50px 間隔、濃い線）＋細かいグリッドを重ねる -->
    <pattern id="grid" width="50" height="25" patternUnits="userSpaceOnUse">
      <rect width="50" height="50" fill="url(#smallGrid)" />
      <path
        d="M50 0 L0 0 0 50"
        fill="none"
        stroke="#008000"
        stroke-width="1"
      />
    </pattern>
  </defs>

  <!-- ２．その上からグリッドを敷く -->
  <rect width="100%" height="100%" fill="url(#grid)" />
</svg>
`)
const url = `data:image/svg+xml;charset=utf-8,${svgString}`
textureLoader.load(url,
  texture => {
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(200, 200)

    const gridMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.FrontSide,
    })

    const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    gridMaterial
)
plane.rotation.x = - Math.PI * 0.5
scene.add(plane)
  },
  undefined,
  err => console.error("SVGテクスチャ読み込みエラー", err)
)


// 床
const floorMat  = new THREE.MeshStandardMaterial({
  map: textureLoader.load('./Wood.jpg')
});
const floorGeo = new THREE.PlaneGeometry(20, 20);
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI/2;
floor.position.y = 0.01
scene.add(floor);

// 壁
function makeWall(width, height, depth, pos, rotY = 0) {
  const geo = new THREE.BoxGeometry(width, height, depth);
  const mat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
  const wall = new THREE.Mesh(geo, mat);
  wall.position.set(pos.x, pos.y, pos.z);
  wall.rotation.y = rotY;
  scene.add(wall);
}
makeWall(20, 3, 0.1, { x: 0, y: 1.5, z: -10 });
makeWall(20, 3, 0.1, { x: 0, y: 1.5, z: 10 });
makeWall(20, 3, 0.1, { x: 10, y: 1.5, z: 0 }, Math.PI/2);
makeWall(20, 3, 0.1, { x: -10, y: 1.5, z: 0 }, Math.PI/2);

/**
 * Models
 */
// カメラ／シーン／レンダラー／controls 周りの初期化が済んだあとで：
const raycaster = new THREE.Raycaster();
const mouse    = new THREE.Vector2();
const plane    = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // y=0 の水平面
let selected   = null;
const offset   = new THREE.Vector3();

const draggableObjects = [];
const gltfLoader = new GLTFLoader()

// 椅子
gltfLoader.load(
    '/models/ChairDamaskPurplegold/glTF/ChairDamaskPurplegold.gltf',
      (gltf) => {
    const root = gltf.scene;
    root.scale.set(3, 3, 3);
  const seatNames = [
    'oval-tufted-chair_seat-panel',
    'oval-tufted-chair_seat-fabric',
    'oval-tufted-chair_seat-buttons',
    'oval-tufted-chair_seat-welt',
  ];
  const newSeatMat = new THREE.MeshStandardMaterial({
    color: 0x156289,
    metalness: 0.5,
    roughness: 0.4,
  });
  seatNames.map(name => {
    const mesh = root.getObjectByName(name);
    if (mesh && mesh.isMesh) {
      // 古いマテリアル破棄
      if (Array.isArray(mesh.material)) {
        mesh.material.map(m => m.dispose());
      } else {
        mesh.material.dispose();
      }
      // 新しいマテリアルをセット
      mesh.material = newSeatMat;
    } else {
      console.warn(`Mesh "${name}" が見つかりませんでした`);
    }
  });
  scene.add(root);
    // ドラッグ対象として追加
  draggableObjects.push(root);
})


gltfLoader.load(
    '/models/ｷｯﾁﾝR01.gltf',
      (gltf) => {
    const root = gltf.scene;
    root.scale.set(3, 3, 3);
    root.position.set(-5,0,-7)
  scene.add(root);
    // ドラッグ対象として追加
  draggableObjects.push(root);
})

function updateMouse(event) {
  mouse.x = ( event.clientX / sizes.width ) * 2 - 1;
  mouse.y = -( event.clientY / sizes.height ) * 2 + 1;
}


// ドラッグ&ドロップ
canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('pointermove', onPointerMove);
canvas.addEventListener('pointerup',   onPointerUp);

function onPointerDown(event) {
  updateMouse(event);
  raycaster.setFromCamera(mouse, camera);

  // draggableObjects の中からヒットを探す
  const hits = raycaster.intersectObjects(draggableObjects, true);
  if (hits.length > 0) {
    // 先頭のオブジェクトの「ルートグループ」を selected に
    // hits[0].object には子メッシュが入るので、そのルートを探す
    let obj = hits[0].object;
    while (obj && !draggableObjects.includes(obj)) {
      obj = obj.parent;
    }
    selected = obj || null;

    if (selected) {
      // Plane(Y=0)との交点を計算し、モデル位置との差分を offset に
      const intersectPoint = raycaster.ray.intersectPlane(plane, new THREE.Vector3());
      offset.copy(intersectPoint).sub(selected.position);

      // ドラッグ中はカメラ操作を無効化
      controls.enabled = false;
    }
  }
}

function onPointerMove(event) {
  if (!selected) return;

  updateMouse(event);
  raycaster.setFromCamera(mouse, camera);

  // Plane との交点に offset を引いた位置を selected.position にセット
  const intersectPoint = raycaster.ray.intersectPlane(plane, new THREE.Vector3());
  if (intersectPoint) {
    selected.position.copy(intersectPoint.sub(offset));
  }
}

function onPointerUp() {
  if (selected) {
    selected = null;
    controls.enabled = true;
  }
}

/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()