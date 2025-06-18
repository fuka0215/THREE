import * as THREE      from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

/////// セットアップ ///////
const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.1, 100);
camera.position.set(5, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// カメラ操作
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/////// 照明 ///////
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
const dl = new THREE.DirectionalLight(0xffffff, 0.8);
dl.position.set(5, 10, 7);
scene.add(dl);

const loader = new SVGLoader()

// 2. SVG を読み込む
loader.load(
  // './static/tetsunabe-green.svg',  // あなたの SVG ファイルパス
  './static/TETSUNABE.svg',  // あなたの SVG ファイルパス
  (data) => {
    const paths = data.paths;
    const group = new THREE.Group();

    // 3. 各パスをチェック
    paths.map((path) => {
      const color = new THREE.Color(path.color);
        // 4. Shape 配列を生成
        const shapes = SVGLoader.createShapes(path);
        console.log(shapes)

        shapes.map((shape) => {
          // 5. 押し出しジオメトリを作成
          const extrudeSettings = {
            depth: 10,           // 押し出しの深さ（数値はお好みで調整）
          };
          const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

          // 6. マテリアルに元の色を適用
          const material = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.FrontSide
          });

          const mesh = new THREE.Mesh(geometry, material);
          group.add(mesh);
        });
    });

    // SVG の Y 軸を反転して three.js 方向に合わせる。これをしないと上下逆さまになる。three.jsは縦軸がyだけどSVGは縦軸がzだからだったはず。とにかく軸が違う。
    // ここでスケールを小さくしないと大きすぎて画面に映りきらなくなってしまう
    group.scale.set(0.05, -0.05, 0.05)

    // 任意で位置調整。ここは特に変更しないとオブジェクトの左上を頂点にしたような感じになるので違和感があれば動かした方が良い。
    group.position.set(0, 0, 0);

    // シーンに追加
    scene.add(group);
  },
  undefined,
  (error) => {
    console.error('SVGの読み込み中にエラーが発生しました:', error);
  }
);

/////// レンダーループ ///////
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();



// SVGから3Dを描画する方法はSVGLoaderを使えば出来たけど、ここは壁で、ここは床で、みたいな判断をどうやってさせるのかが分からない。
// ロゴを立体にしようとしたけど、赤い部分だけ押し出して表示、ができなかった。なぜ？
// 実際にやりたいことはSVGから壁の3Dモデルを作りたい。SVGの作り方がわかんない。
// CADデータからでも作れるのかな？とは思うがそもそもCADデータのサンプルがないから検証できない。
// 2Dはなんのために必要なのかが分からない。壁を動かすことがあるのか？
// 図面を3Dに起こすなら図面のデータがどの形なのかが知りたい。あと普通に図面欲しい。
// 図面のデータってそこら辺にあるのかな？