import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience'
import * as THREE from 'three'

const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(
    <Canvas
    // pixel ratioの比率の変更。どのデバイスでも同じように見えるように。
    // dpr={[1,2]} // これはデフォルト値
        // flat // 原色に見える。デフォルトのトーンマッピングを無効にしている。
        gl={ { 
            antialias: true, //falseにしたら画面がガビガビになる。デフォルトはtrueだから指定しなくても大丈夫。ここでできるよって言いたいだけ。
            // toneMapping: THREE.CineonToneMapping // 別のトーンマッピングを指定することもできる。デフォルトはACESFilmicToneMapping
            // outputColorSpace: THREE.LinearEncoding // 色の感じを変えられる。デフォルトはSRGBColorSpace
        }}
        // orthographic // 奥行きのないカメラ。デフォルトだとちっちゃく見えるからzoomしてね。
        camera={{
            // zoom: 100,
            fov: 45,
            near: 0.1,
            far: 200,
            position: [ 3, 2, 6 ]
        }}
    >
        <Experience />
    </Canvas>
)