/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Color } from 'three'

const hexToNormalizedRGB = (hex) => {
  const value = hex.replace('#', '')
  return [parseInt(value.slice(0, 2), 16) / 255, parseInt(value.slice(2, 4), 16) / 255, parseInt(value.slice(4, 6), 16) / 255]
}

const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
const fragmentShader = `varying vec2 vUv; uniform float uTime; uniform float uSpeed; uniform float uScale; uniform vec3 uColor; uniform float uNoiseIntensity; uniform float uRotation; vec2 rotateUvs(vec2 uv, float angle) { float c = cos(angle); float s = sin(angle); return mat2(c, -s, s, c) * uv; } float noise(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); } void main() { vec2 uv = rotateUvs(vUv * uScale, uRotation); float t = uTime * uSpeed; float fold = 0.58 + 0.42 * sin(5.0 * (uv.x + uv.y + cos(3.0 * uv.x + 5.0 * uv.y) + 0.02 * t) + sin(18.0 * (uv.x + uv.y - 0.08 * t))); float grain = noise(gl_FragCoord.xy) * 0.025 * uNoiseIntensity; vec3 color = uColor * (0.72 + fold * 0.38) - grain; gl_FragColor = vec4(clamp(color, 0.0, 1.0), 0.82); }`

const SilkPlane = forwardRef(function SilkPlane({ uniforms }, ref) {
  const { viewport } = useThree()
  useLayoutEffect(() => { if (ref.current) ref.current.scale.set(viewport.width, viewport.height, 1) }, [ref, viewport])
  useFrame((_, delta) => { if (ref.current) ref.current.material.uniforms.uTime.value += 0.1 * delta })
  return <mesh ref={ref}><planeGeometry args={[1, 1]} /><shaderMaterial transparent uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} /></mesh>
})

export default function Silk({ speed = 5, scale = 1, color = '#8dc9dc', noiseIntensity = 1, rotation = 0 }) {
  const meshRef = useRef()
  const uniforms = useMemo(() => ({ uSpeed: { value: speed }, uScale: { value: scale }, uNoiseIntensity: { value: noiseIntensity }, uColor: { value: new Color(...hexToNormalizedRGB(color)) }, uRotation: { value: rotation }, uTime: { value: 0 } }), [])
  useEffect(() => { uniforms.uSpeed.value = speed; uniforms.uScale.value = scale; uniforms.uNoiseIntensity.value = noiseIntensity; uniforms.uColor.value.setRGB(...hexToNormalizedRGB(color)); uniforms.uRotation.value = rotation }, [speed, scale, noiseIntensity, color, rotation, uniforms])
  return <Canvas dpr={[1, 1.5]} frameloop="always" camera={{ position: [0, 0, 1] }}><SilkPlane ref={meshRef} uniforms={uniforms} /></Canvas>
}
