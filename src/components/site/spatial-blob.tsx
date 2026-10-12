"use client";
import { useEffect, useRef } from "react";

// Shader and sphere geometry reused from scriptfx-spatial/web/world3d.mjs.
const vertex=`uniform float time;uniform float energy;varying vec3 normalW;varying vec3 positionW;varying float ripple;
void main(){vec3 p=position;float wave=sin(p.x*7.+time*.9)*sin(p.y*6.-time*.7)*sin(p.z*8.+time*.5);p+=normal*(wave*(.035+energy*.09));ripple=wave;vec4 w=modelMatrix*vec4(p,1.);positionW=w.xyz;normalW=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`;
const fragment=`uniform vec3 tint;uniform float energy;uniform float time;varying vec3 normalW;varying vec3 positionW;varying float ripple;
void main(){vec3 v=normalize(cameraPosition-positionW);float fres=pow(1.-abs(dot(normalize(normalW),v)),2.);float bands=.5+.5*sin(ripple*6.+positionW.y*12.-time);vec3 c=tint*(.48+bands*.5+energy*.65)+vec3(.8,.87,1.)*pow(fres,3.)*.8;gl_FragColor=vec4(c,.72+fres*.2);}`;

export function SpatialBlob() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    import("three").then(T => {
      if (disposed || !ref.current) return;
      const canvas = ref.current;
      let renderer: InstanceType<typeof T.WebGLRenderer>;
      try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(240, 240, false);
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(45, 1, .05, 10);
      camera.position.set(0, .12, 1.2);
      camera.lookAt(0, 0, 0);
      const material = new T.ShaderMaterial({ uniforms: { time: { value: 0 }, energy: { value: 0 }, tint: { value: new T.Color("#d9ad55") } }, vertexShader: vertex, fragmentShader: fragment, transparent: true });
      const geometry = new T.SphereGeometry(.29, 40, 28);
      scene.add(new T.Mesh(geometry, material));
      const points = Array.from({ length: 65 }, (_, i) => new T.Vector3(Math.cos(i / 64 * Math.PI * 2) * .41, 0, Math.sin(i / 64 * Math.PI * 2) * .41));
      const ringGeometry = new T.BufferGeometry().setFromPoints(points);
      const ringMaterial = new T.LineBasicMaterial({ color: "#d9ad55", transparent: true, opacity: .18 });
      const ring = new T.Line(ringGeometry, ringMaterial);
      ring.rotation.x = .22;
      scene.add(ring);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      let frame = 0;
      const draw = (time: number) => {
        material.uniforms.time.value = reduced.matches ? 0 : time / 1000;
        ring.rotation.z = reduced.matches ? 0 : Math.sin(time / 1000 * .4) * .17;
        renderer.render(scene, camera);
        if (!reduced.matches) frame = requestAnimationFrame(draw);
      };
      const observer = new IntersectionObserver(([entry]) => {
        cancelAnimationFrame(frame);
        if (entry.isIntersecting) draw(performance.now());
      });
      observer.observe(canvas);
      renderer.render(scene, camera);
      cleanup = () => { observer.disconnect(); cancelAnimationFrame(frame); geometry.dispose(); material.dispose(); ringGeometry.dispose(); ringMaterial.dispose(); renderer.dispose(); };
    });
    return () => { disposed = true; cleanup(); };
  }, []);
  return <canvas className="partner-spatial-blob" ref={ref} width={240} height={240} role="img" aria-label="Animated gold spatial audio blob"/>;
}
