import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle } from 'ogl'
import './GradientWaves.css'

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uScale;
uniform float uSwell;
uniform float uTurbulence;
uniform float uBrightness;
uniform vec2 uMouse;
uniform vec3 uHorizon;
uniform vec3 uWave;
uniform vec3 uCrest;
out vec4 fragColor;

float wave(vec2 p, float t) {
  float x = p.x + sin(p.y * 1.4 + t * .7) * uSwell;
  float y = p.y + cos(p.x * 1.1 - t * .55) * uTurbulence;
  return sin(x * uScale + t) * uAmplitude + sin(y * uScale * .7 - t * 1.2) * uAmplitude * .55;
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  vec2 p = (uv - .5) * vec2(iResolution.x / iResolution.y, 1.0) * 5.0;
  p.x += (uMouse.x - .5) * .35;
  p.y += (uMouse.y - .5) * .2;
  float t = iTime * uSpeed;
  float field = wave(p, t);
  float horizon = smoothstep(-1.8, 1.5, uv.y + field * .045);
  float crest = smoothstep(.45, 1.3, sin(field * .55 + uv.y * 4.0));
  vec3 color = mix(uHorizon, uWave, horizon);
  color = mix(color, uCrest, crest * horizon * .6);
  float vignette = 1.0 - smoothstep(.25, .85, length(uv - .5));
  fragColor = vec4(color * uBrightness * (.72 + vignette * .28), 1.0);
}
`

function hexToRgb(hex) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return match ? [parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255] : [1, 1, 1]
}

export default function GradientWaves({ horizonColor = '#7d174c', waveColor = '#ed77ad', crestColor = '#fff2fa', speed = .4, amplitude = 2.5, waveScale = .6, swell = 1.2, turbulence = 1.2, brightness = 1, className = '' }) {
  const containerRef = useRef(null)
  const settingsRef = useRef({ horizonColor, waveColor, crestColor, speed, amplitude, waveScale, swell, turbulence, brightness })

  settingsRef.current = { horizonColor, waveColor, crestColor, speed, amplitude, waveScale, swell, turbulence, brightness }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    const renderer = new Renderer({ webgl: 2, alpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 2) })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    const geometry = new Triangle(gl)
    const settings = settingsRef.current
    const program = new Program(gl, { vertex, fragment, uniforms: { iResolution: { value: [1, 1] }, iTime: { value: 0 }, uSpeed: { value: settings.speed }, uAmplitude: { value: settings.amplitude }, uScale: { value: settings.waveScale }, uSwell: { value: settings.swell }, uTurbulence: { value: settings.turbulence }, uBrightness: { value: settings.brightness }, uMouse: { value: [.5, .5] }, uHorizon: { value: hexToRgb(settings.horizonColor) }, uWave: { value: hexToRgb(settings.waveColor) }, uCrest: { value: hexToRgb(settings.crestColor) } } })
    const mesh = new Mesh(gl, { geometry, program })
    const canvas = gl.canvas
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    container.appendChild(canvas)

    const resize = () => { const rect = container.getBoundingClientRect(); renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height)); program.uniforms.iResolution.value[0] = gl.drawingBufferWidth; program.uniforms.iResolution.value[1] = gl.drawingBufferHeight }
    const mouse = [.5, .5]
    const onPointerMove = event => { const rect = canvas.getBoundingClientRect(); mouse[0] = (event.clientX - rect.left) / rect.width; mouse[1] = 1 - (event.clientY - rect.top) / rect.height }
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    canvas.addEventListener('pointermove', onPointerMove)
    resize()
    let frame = 0
    const start = performance.now()
    const render = time => { const current = settingsRef.current; program.uniforms.iTime.value = (time - start) / 1000; program.uniforms.uSpeed.value = current.speed; program.uniforms.uAmplitude.value = current.amplitude; program.uniforms.uScale.value = current.waveScale; program.uniforms.uSwell.value = current.swell; program.uniforms.uTurbulence.value = current.turbulence; program.uniforms.uBrightness.value = current.brightness; program.uniforms.uMouse.value[0] += (mouse[0] - program.uniforms.uMouse.value[0]) * .04; program.uniforms.uMouse.value[1] += (mouse[1] - program.uniforms.uMouse.value[1]) * .04; program.uniforms.uHorizon.value = hexToRgb(current.horizonColor); program.uniforms.uWave.value = hexToRgb(current.waveColor); program.uniforms.uCrest.value = hexToRgb(current.crestColor); renderer.render({ scene: mesh }); frame = requestAnimationFrame(render) }
    frame = requestAnimationFrame(render)
    return () => { cancelAnimationFrame(frame); observer.disconnect(); canvas.removeEventListener('pointermove', onPointerMove); if (canvas.parentNode === container) container.removeChild(canvas); gl.getExtension('WEBGL_lose_context')?.loseContext() }
  }, [])

  return <div ref={containerRef} className={`gradient-waves-container ${className}`.trim()} aria-hidden="true" />
}
