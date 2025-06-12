import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js'

/**
 * Base
 */

// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */

// ambientLightは全方向から均一に光が当たっている。このライトだけでは不十分なので他のライトと組み合わせて使うもの。
// 最初のパラメーターはcolor(色)、2個目のパラメーターはintensity(強度)
// const ambientLight = new THREE.AmbientLight(0xffffff, 1)
// この書き方でも同じように動く materialのように。
const ambientLight = new THREE.AmbientLight()
ambientLight.color = new THREE.Color(0xffffff)
ambientLight.intensity = 1
scene.add(ambientLight)

// 光線は同じ方向からきます。すべて並行で。太陽光はこんな感じですね。
const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.9)
directionalLight.position.set(1, 0.25, 0)
scene.add(directionalLight)

// 上から当たる光と下から当たる光を指定できる。例えば下は芝生が広がっているなら緑、上は青空が広がっているなら青を当てると楽しいかも
const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.9)
scene.add(hemisphereLight)

// ライターで当てたように一点が存在しますね。3つ目の引数はdistance
const pointLight = new THREE.PointLight(0xff9000, 1.5, 10, 2)
pointLight.position.set(1, - 0.5, 1)
scene.add(pointLight)

// 長方形のライト。引数の3番目はwidth, 4番目はheight。
// MeshStandardMaterialまたはMeshPhysicalMaterialでしか当たらないから気をつけて。MeshPhysicalを継承しているからMeshStandardMaterialも使えます。
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 6, 1, 1)
rectAreaLight.position.set(-0.5, 0, 1.5)
// 動かしてからlookAtを向かせる。何も引数に渡さなければ0,0,0を向く(中心)
rectAreaLight.lookAt(new THREE.Vector3())
scene.add(rectAreaLight)

// スポットライト 懐中電灯のようなもの引数は順番に、
// 色、
// 強度、
// distance(距離)、
// angle(アングル、スポットライトの当たる幅。小さくなれば狭くなる。),
// penumbra(ペナンブラ。端が暗くぼやける。0にするとはっきりとシャープなスポットライトになる。), 
// decay(ディケイ。減衰。基本は弄らない。スポットライトの限界値)
const spotLight = new THREE.SpotLight(0x78ff00, 4.5, 10, Math.PI * 0.1, 0.25, 1)
spotLight.position.set(0,2,3)
scene.add(spotLight)

// スポットライトが当たる位置を変えたい時には、ポジションを指定してからsceneに追加する必要がある。特に計算は必要ないし目には見えないけどスポットライトが当たっている場所(target)が存在しているから追加しなくちゃ動かない。
spotLight.target.position.x = - 0.75
scene.add(spotLight.target)

// 村を作って数百個のライトで照らすとなるととんでもない。パフォーマンスの問題が発生する。
//コストがあまりかからないのはAmbientLight, HemisphereLight
// 中くらいのコストならDirectionalLight, PointLight
// ハイコストはSpotLight, RectAreaLight


// Helpers
// ライトは目に見えないのでヘルパーが存在しています。

// ヘミスフィアライト？のヘルパー。上下から当たっている色が何色かを示してくれる。第一引数は上で定義したライトの名前、第二引数はヘルパーの表示サイズ。
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2)
scene.add(hemisphereLightHelper)

// どこから太陽光的な光が来ているのかを示してくれています。引数は同上
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
scene.add(directionalLightHelper)

// ポイントライトがどこにいるのか示してくれる。わかりやすい！
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
scene.add(pointLightHelper)

// スポットライトのヘルパーにはサイズは渡せない。やってみればわかる。
const spotLightHelper = new THREE.SpotLightHelper(spotLight)
scene.add(spotLightHelper)

// RectAreaLightHelperはTHREEの中に含まれていないから一番上でimportしてくる必要があるから注意。
const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight)
scene.add(rectAreaLightHelper)




// デバッグ用。右上で細かく調整できるように追加しているだけ。
gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001)
gui.add(directionalLight, 'intensity').min(0).max(3).step(0.001)


/**
 * Objects
*/
// Material
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.position.x = - 1.5

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.65

scene.add(sphere, cube, torus, plane)

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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

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
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    cube.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    cube.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()