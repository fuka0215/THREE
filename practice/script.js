import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js'
import { Sky } from 'three/addons/objects/Sky.js';

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
// Material
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4
material.color = new THREE.Color(0xff0000)

// Objects
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
)
cube.position.y = 0.25
scene.add(cube)

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

//     const plane = new THREE.Mesh(
//     new THREE.PlaneGeometry(1000, 1000),
//     gridMaterial
// )
// plane.rotation.x = - Math.PI * 0.5
// plane.position.y = - 0.5
// scene.add(plane)

const radius        = 500;
        const widthSegs     = 64;
        const heightSegs    = 64;
        const phiStart      = 0;
        const phiLength     = Math.PI * 2;
        const thetaStart    = 0;
        const thetaLength   = Math.PI / 2; // 上半分を切り落として「床」に

        const sphereGeo = new THREE.SphereGeometry(
          radius,
          widthSegs,
          heightSegs,
          phiStart,
          phiLength,
          thetaStart,
          thetaLength
        );

        const sphere = new THREE.Mesh(sphereGeo, gridMaterial);
        // 上を向くように回転
        sphere.rotation.x = Math.PI / 4;
        // ちょうど y=0 を床面に合わせる
        sphere.position.y = -radius;
        // sphere.position.y = -1;

        scene.add(sphere);

  },
  undefined,
  err => console.error("SVGテクスチャ読み込みエラー", err)
)


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
controls.maxPolarAngle = Math.PI / 2; //床下にカメラが行かないように
controls.minDistance = 3;
controls.maxDistance = 50;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(scene.background)


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