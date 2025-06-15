import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'


/**
 * Base
 */

// glTF: デフォルトの形式。複数のファイルからなる。JSON形式のものとあと、geometryやテクスチャの画像など。
// glTF-binary: バイナリ。2進数。大概軽くなる。ファイルは一個だけ。代わりに色や画像を変えるのが難しくなる。
// glTF-Draco: 圧縮されたファイル。
// glTF-Embedded: ファイルは一個だけ。しかも重たい。JSON形式のものが入ってる。

// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Models
 */
// loadingmanagerは全ての読み込みが進行中かどうか
// ここでインスタンス化して使えるようにする
const dracoLoader = new DRACOLoader()
// node_modulesからstaticフォルダにコピペしたからパスが短い
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
// 上でドラコローダーを用意したらここにセットしてあげるだけで良い
gltfLoader.setDRACOLoader(dracoLoader)

// アヒル
// gltfLoader.load(
//     '/models/Duck/glTF/Duck.gltf',
//     (gltf) => {
//         // ロードしたgltfの中には配列が入っているのでそこから取り出してsceneに追加する
//         scene.add(gltf.scene.children[0])
//     },
//     // 下二つはなくても大丈夫。エラーを出したいなら置いときな。
//     () => {
//         console.log("progress")
//     },
//     () => {
//         console.log("error")
//     },
// )

// ヘルメット
// gltfLoader.load(
//     '/models/FlightHelmet/glTF/FlightHelmet.gltf',
//     (gltf) => {
//         // 取得した配列の複製 中に入っているものを一つずつ選んで追加できることを知るためのコード。
//     //    const children = [...gltf.scene.children]
//     //    for(const child of children){
//     //     scene.add(child)
//     //    }
//     // scene.add(gltf.scene)
//     },)

    //Draco圧縮について。デフォルトファイルに比べて軽い。bufferデータ。
//     // 複数のファイルを読み込む必要があるので、そもそも軽いデータではドラコローダーを使う必要はない。メガバイトの重たいデータであれば使ったほうが良い。
//     // フリーズが起こる可能性。解凍する必要があるので重たいデータなら0.5秒ほどフリーズすることがあります。2秒ロードするのか0.5秒フリーズするのかどちらが良いかはその時による。
// gltfLoader.load(
//     '/models/Duck/glTF-Draco/Duck.gltf',
//     (gltf) => {
//     scene.add(gltf.scene)
//     },)


// キツネ
// tick関数でmixerを使用して画面を更新したいが、constで宣言するとスコープの問題で呼び出せないので更新できるletで宣言する
let mixer = null
gltfLoader.load(
    '/models/Fox/glTF/Fox.gltf',
    (gltf) => {

        mixer = new THREE.AnimationMixer(gltf.scene)
        // 配列の番号を変えれば用意されたアニメーション内で違う動きをすることもできる。
        const action = mixer.clipAction(gltf.animations[0])
        action.play()
    //スケールサイズの変更
    gltf.scene.scale.set(0.025, 0.025, 0.025)
    scene.add(gltf.scene)
    },)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update mixer モデルを読み込む時間があるのでif文で分岐させる
    if(mixer !== null){
        mixer.update(deltaTime)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()