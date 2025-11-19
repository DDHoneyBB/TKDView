import React, { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function Avatar() {
  const { scene, animations } = useGLTF('/1.glb')
  const avatarRef = useRef()
  const mixer = useRef()
z
  useEffect(() => {
    if (animations && animations.length > 0 && scene) {
      mixer.current = new THREE.AnimationMixer(scene)
      const action = mixer.current.clipAction(animations[0])
      action.loop = THREE.LoopRepeat
      action.clampWhenFinished = false
      action.play()
    }
    return () => {
      if (mixer.current) mixer.current.stopAllAction()
    }
  }, [animations, scene])

  useFrame((_, delta) => {
    if (mixer.current) mixer.current.update(delta)
  })

  return <primitive object={scene} ref={avatarRef} scale={5} position={[0, -5, 0]} />
}

export default function AvatarViewer() {
  return (
    <Canvas camera={{ position: [0, 2, 6], fov: 70 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 5, 5]} />
      <OrbitControls />
      <Avatar />
    </Canvas>
  )
}
