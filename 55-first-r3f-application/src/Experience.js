import { useThree, extend, useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import CustomObject from "./CustomObject"


// ここではあえて難しく書いている。本質を理解するために。
extend({ OrbitControls })

export default function Experience () {

  // const three = useThree()
  const { camera, gl } = useThree()

  const cubeRef = useRef()
  const groupRef = useRef()

  useFrame((state, delta) => {
    // カメラを回す
    // const angle = state.clock.elapsedTime
    // state.camera.position.x = Math.sin(angle) * 8
    // state.camera.position.z = Math.cos(angle) * 8
    // state.camera.lookAt(0,0,0) 中心を向いて

    cubeRef.current.rotation.y += delta
    // groupRef.current.rotation.y += delta
  })
  return(
    <>
    <orbitControls args={[ camera, gl.domElement]} />

    <directionalLight position={[ 1, 2, 3 ]} intensity={4.5} />
    <ambientLight intensity={1.5} />

    <group ref={groupRef}>
      <mesh position-x={-2}>
        <sphereGeometry />
        {/* <meshBasicMaterial color="orange" /> */}
        <meshStandardMaterial color="orange" />
      </mesh>

      <mesh ref={cubeRef} scale={1.5} position-x={2} rotation-y={Math.PI * 0.25}>
          <boxGeometry scale={1.5} />
          {/* <meshBasicMaterial color="mediumpurple" wireframe /> */}
          <meshStandardMaterial color="mediumpurple" />
      </mesh>
    </group>

    <mesh position-y={-1} rotation-x={ - Math.PI * 0.5} scale={10}>
      <planeGeometry />
      {/* <meshBasicMaterial color="greenyellow" /> */}
      <meshStandardMaterial color="greenyellow" />
    </mesh>

    <CustomObject />
    </>
  )
}