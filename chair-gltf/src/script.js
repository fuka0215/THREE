import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js'
import { Sky } from 'three/addons/objects/Sky.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

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

/**
 * Models
 */
// ここでインスタンス化して使えるようにする
const dracoLoader = new DRACOLoader()
// node_modulesからstaticフォルダにコピペしたからパスが短い。
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
// 上でドラコローダーを用意したらここにセットしてあげるだけで良い
gltfLoader.setDRACOLoader(dracoLoader)




// 椅子
gltfLoader.load(
    '/models/ChairDamaskPurplegold/glTF/ChairDamaskPurplegold.gltf',
      (gltf) => {
    const root = gltf.scene;
    root.scale.set(3, 3, 3);

  // // Mesh.nameを特定するためのコンソールログ
  gltf.scene.traverse(obj => {
    if (obj.isMesh) console.log(obj.name, obj);
  });

  //   const seatMesh = root.getObjectByName('oval-tufted-chair_seat-fabric');
  //     if (seatMesh && seatMesh.isMesh) {
  //   //   // 古いマテリアルは破棄
  //         const oldMat = seatMesh.material;
  //     if (Array.isArray(oldMat)) {
  //       oldMat.forEach(mat => mat.dispose());
  //     } else {
  //       oldMat.dispose();
  //     }

  //       const newMat = new THREE.MeshStandardMaterial({
  //       color: 0x156289,
  //       metalness: 0.5,
  //       roughness: 0.4,
  //     });
  //     seatMesh.material = newMat
  //     scene.add(root)
  // }


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

  seatNames.forEach(name => {
    const mesh = root.getObjectByName(name);
    if (mesh && mesh.isMesh) {
      // 古いマテリアル破棄
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
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





    // シーンに追加する前に traverse でマテリアルを変更
    // root.traverse((child) => {
      // if (child.isMesh) {
        // 色を赤にする例 色を被せる感じになる。
        // child.material.color.set(0xff0000);

        // 透明度や透明設定も可能
        // child.material.transparent = true;
        // child.material.opacity = 0.8;

        // 金属感を追加したいなら
        // child.material.metalness = 0.9;
        // child.material.roughness = 0.1;
    //   }
    // });
    // scene.add(root);

    // root.traverse((child) => {
    //   if (!child.isMesh) return;


    

    //   // 1) 古いマテリアルを破棄してメモリをクリア
    //   //    ※ マテリアルが配列の場合にも対応
    //   const oldMat = child.material;
    //   if (Array.isArray(oldMat)) {
      //     oldMat.forEach(mat => mat.dispose());
      //   } else {
        //     oldMat.dispose();
        //   }
        
        //   // 2) 新しいマテリアルを生成
        //   const newMat = new THREE.MeshStandardMaterial({
          //     color: 0x156289,
          //     metalness: 0.5,
          //     roughness: 0.4,
          //   });
          
          //   // 3) メッシュにセットし直す
          //   child.material = newMat;
          // });
          
          // scene.add(root);
  }

    // (gltf) => {
    //   gltf.scene.scale.set(3, 3, 3)
    //   scene.add(gltf.scene)
    // },
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