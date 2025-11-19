import React, { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function Avatar({ play }) {
  const { scene, animations } = useGLTF('/avatars/avatar_saludo.glb')
  const avatarRef = useRef()
  const mixer = useRef()
  const action = useRef()

  useEffect(() => {
    if (animations && animations.length > 0 && scene) {
      mixer.current = new THREE.AnimationMixer(scene)
      action.current = mixer.current.clipAction(animations[0])
      action.current.clampWhenFinished = true
      action.current.loop = THREE.LoopOnce
    }
    return () => {
      if (mixer.current) mixer.current.stopAllAction()
    }
  }, [animations, scene])

  useEffect(() => {
    if (play && action.current) {
      action.current.reset().play()
      // Detener la animaciÃ³n al finalizar
      const onFinished = () => {
        action.current.stop()
      }
      action.current.getMixer().addEventListener('finished', onFinished)
      return () => {
        action.current.getMixer().removeEventListener('finished', onFinished)
      }
    }
  }, [play])

  useFrame((_, delta) => {
    if (mixer.current) mixer.current.update(delta)
  })

 return <primitive object={scene} ref={avatarRef} scale={5} position={[0, -5, 0]} />
}

export default function AvatarViewer({ play }) {
  return (
    <Canvas camera={{ position: [0, 2, 6], fov: 70}}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 5, 5]} />
      <OrbitControls />
      <Avatar play={play} />
    </Canvas>
  )
}