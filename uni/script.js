import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js'
import { Sky } from 'three/addons/objects/Sky.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

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
const textureLoader = new THREE.TextureLoader()
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


// うに１
const geometry = new THREE.IcosahedronGeometry(1, 20);
const posAttr  = geometry.attributes.position;
const normAttr = geometry.attributes.normal;
const count    = posAttr.count;

for (let i = 0; i < count; i++) {
  const nx = normAttr.getX(i);
  const ny = normAttr.getY(i);
  const nz = normAttr.getZ(i);
  // 0.1～0.4 の長さでトゲを伸ばす
  const spike = Math.random() * 0.3 + 0.1;
  posAttr.setXYZ(
    i,
    posAttr.getX(i) + nx * spike,
    posAttr.getY(i) + ny * spike,
    posAttr.getZ(i) + nz * spike
  );
}
geometry.computeVertexNormals();
const material = new THREE.MeshStandardMaterial({
  color: 0x2e8b57,
  flatShading: true
});
const seaUrchin = new THREE.Mesh(geometry, material);
seaUrchin.position.y = 1
seaUrchin.position.x = 3
scene.add(seaUrchin);

// まりも
const marimoGeometry = new THREE.SphereGeometry(1.2)
const marimo = new THREE.Mesh(marimoGeometry, material)
marimo.position.x = 3
marimo.position.y = 1
scene.add(marimo)

// 虹色の球体から棒が伸びてる
// // --- SphereGeometry を非インデックス化 & DynamicDrawUsage ---
// const sphereGeom = new THREE.SphereGeometry(1, 32, 16).toNonIndexed();
// sphereGeom.attributes.position.setUsage(THREE.DynamicDrawUsage);

// // 元データを退避
// const origPos   = sphereGeom.attributes.position.array.slice();
// const normalArr = sphereGeom.attributes.normal.array.slice();
// const posArr    = sphereGeom.attributes.position.array;
// const vCount    = sphereGeom.attributes.position.count;

// // --- 頂点ごとに “押し出しの影響度” weight を計算 ---
// // ここでは Y 座標が閾値以上の頂点だけに weight=0→1 を線形割当
// const weights = new Float32Array(vCount);
// const yThreshold = 0.9;  // 押し出し開始する Y の高さ
// const falloff    = 0.1;  // 線形フェード幅
// for (let i = 0; i < vCount; i++) {
//   const y = origPos[i*3 + 1];
//   let w = (y - yThreshold) / falloff;
//   w = Math.min(Math.max(w, 0), 1);
//   weights[i] = w;
// }
// sphereGeom.setAttribute('weight', new THREE.BufferAttribute(weights, 1));

// // --- メッシュ作成 ---
// const materialBase   = new THREE.MeshNormalMaterial({ flatShading: false });
// const sphereMesh = new THREE.Mesh(sphereGeom, materialBase);
// scene.add(sphereMesh);
// sphereMesh.position.y = 1

// // 押し出す関数
// const extrudeDistance = 2.0;
// function applyExtrusion() {
//   for (let i = 0; i < vCount; i++) {
//     const w = weights[i];
//     const idx = i * 3;
//     posArr[idx  ] = origPos[idx  ] + normalArr[idx  ] * extrudeDistance * w;
//     posArr[idx+1] = origPos[idx+1] + normalArr[idx+1] * extrudeDistance * w;
//     posArr[idx+2] = origPos[idx+2] + normalArr[idx+2] * extrudeDistance * w;
//   }
//   sphereGeom.attributes.position.needsUpdate = true;
//   sphereGeom.computeVertexNormals();
// }
// applyExtrusion();


// 見る角度で色が変わる箱
// let geometry = new THREE.BoxGeometry(1, 1, 1);
//     geometry = geometry.toNonIndexed();
//     geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);

//     const material = new THREE.MeshNormalMaterial({ flatShading: true });
//     const mesh     = new THREE.Mesh(geometry, material);
//     scene.add(mesh);



// const group = new THREE.Group()
// scene.add(group)

// // マテリアル
// const fabricMat = new THREE.MeshPhysicalMaterial({
//   color: 0x90ee90,
// });
// const woodMat = new THREE.MeshPhysicalMaterial({
//   color: 0x593a25,
//   roughness: 0.7,
//   metalness: 0.1,
//   clearcoat: 0.2,
//   clearcoatRoughness: 0.4,
//   // map: doorColorTexture,
// });

// // 座面
// const seat = new THREE.Mesh(
//   new THREE.BoxGeometry(1.3, 0.4, 0.7, 8, 4, 2),
//   fabricMat,
// );
// seat.position.y = 0.8;
// group.add(seat);

// // 背もたれ
// const back = new THREE.Mesh(
//   new THREE.BoxGeometry(1.3, 0.6, 0.1, 8, 4, 2),
//   fabricMat,
// );
// back.position.set(0, 1.2, -0.35);
// back.rotation.x = -0.2;
// group.add(back);

// // 脚（4本）
// const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 16);
// const legPositions = [
//   [ 0.5, 0.4,  0.3],
//   [-0.5, 0.4,  0.3],
//   [ 0.5, 0.4, -0.3],
//   [-0.5, 0.4, -0.3],
// ];
// legPositions.forEach(p => {
//   const leg = new THREE.Mesh(legGeo, woodMat);
//   leg.position.set(p[0], p[1], p[2]);
//   group.add(leg);
// });

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
camera.position.x = 2
camera.position.y = 0.5
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
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