import * as THREE from 'three'

// Canvas
const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()


/**
 * Objects
*/
// const geometry = new THREE.BoxGeometry(1, 1, 1)
// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
// const mesh = new THREE.Mesh(geometry, material)
// scene.add(mesh)

// Position
// mesh.position.x = 0.7
// mesh.position.y = -0.6
// mesh.position.z = 1
// mesh.position.set(0.7, -0.6, 1)

// Scale デフォルトは1 ポジションで設定したサイズから変更してくれる。
// mesh.scale.x = 2
// mesh.scale.y = 0.5
// mesh.scale.z = 0.5
// mesh.scale.set(2, 0.5, 0.5)

// Rotation 物に軸を指すイメージ
// mesh.rotation.reorder('YXZ')
// 円周率πで半分回るよね〜PI
// mesh.rotation.y = 3.14159
// mesh.rotation.y = Math.PI * 0.25
// mesh.rotation.x = Math.PI * 0.25


// Axes helper緑赤青の線を表示してくれる 引数は線の長さ。
const axesHelper = new THREE.AxesHelper()
scene.add(axesHelper)


/**
 * Objects
*/
const group = new THREE.Group()

group.position.y = 1
// スケールの指定
group.scale.y = 2
// 回転
group.rotation.y = 1
scene.add(group)

const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({ color: 0xff0000})
)
group.add(cube1)

const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({ color: 0x00ff00})
)
cube2.position.x = -2
group.add(cube2)

const cube3 = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({ color: 0x00ff})
)
cube3.position.x = 2
group.add(cube3)

/**
 * Sizes
*/
const sizes = {
    width: 800,
    height: 600
}

/**
 * Camera
*/
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 3
scene.add(camera)

// camera.lookAt(mesh.position)

// console.log(mesh.position.distanceTo(camera.position))

/**
 * Renderer
*/
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})


renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)