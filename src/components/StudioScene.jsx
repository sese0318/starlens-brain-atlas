import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {ATLAS_COLORS, layerColor} from '../atlas-colors.mjs';
import {boundaryPositions, compactIndexedGeometry, displayPoint, explosionOffset, partitionCortex} from '../core/studio-geometry.mjs';

const VIEWS = {oblique: [-1.05,.56,1.22], left: [-1,0,0], right: [1,0,0], front: [0,0,-1], back: [0,0,1], top: [0,1,.001]};

function surfaceShading(surface) {
  const positions = [];
  for (let i = 0; i < surface.positions.length; i += 3)
    positions.push(...displayPoint(surface.positions.slice(i, i + 3)));
  const full = new THREE.BufferGeometry();
  full.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  full.setIndex(surface.faces);
  full.computeVertexNormals();
  const normals = new Float32Array(full.getAttribute('normal').array);
  const counts = new Uint16Array(positions.length / 3), neighbours = new Float32Array(positions.length);
  for (let i = 0; i < surface.faces.length; i += 3) for (let j = 0; j < 3; j++) {
    const a = surface.faces[i + j];
    for (let side = 1; side <= 2; side++) {
      const b = surface.faces[i + (j + side) % 3];
      counts[a]++;
      for (let d = 0; d < 3; d++) neighbours[a * 3 + d] += positions[b * 3 + d];
    }
  }
  const shades = new Float32Array(counts.length);
  for (let i = 0; i < counts.length; i++) {
    let cavity = 0;
    for (let d = 0; d < 3; d++) cavity += (neighbours[i * 3 + d] / Math.max(1, counts[i]) - positions[i * 3 + d]) * normals[i * 3 + d];
    shades[i] = THREE.MathUtils.clamp(1 - Math.max(0, cavity) * .39, .53, 1);
  }
  full.dispose();
  return {normals, shades};
}

export default function StudioScene({surfaces, deepMeshes = [], regions = [], selected, onSelect, visibleKeys, values, mode = 'anatomy', explode = 0, opacity = 1, borders = false, rotate = false, preset, focusToken, colorByLobe = false, lobeColors = {}}) {
  const host = useRef(null), sceneRef = useRef(null), live = useRef(null);
  const [error, setError] = useState(''), [hover, setHover] = useState('');
  const hoverKey = useRef('');
  live.current = {regions, selected, onSelect, visibleKeys, values, mode, explode, opacity, borders, rotate, colorByLobe, lobeColors};

  useEffect(() => {
    if (!host.current || !surfaces?.length) return;
    const element = host.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
    } catch {
      setError('The 3D view could not start. Enable hardware acceleration or try another browser. The anatomy list and data panel still work.');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor('#111418');
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', 'Interactive brain anatomy. Drag to rotate, scroll or pinch to zoom, and click a structure. Use the anatomy list for keyboard selection.');
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    element.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, .5, 3000);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = .085;
    controls.minDistance = 24;
    controls.maxDistance = 1600;
    controls.autoRotateSpeed = .55;
    const ambient = new THREE.HemisphereLight('#e6ecf3', '#353945', 1.7);
    const key = new THREE.DirectionalLight('#fff0df', 3.5);
    key.position.set(-180, 230, 200);
    const fill = new THREE.DirectionalLight('#c5d9f2', 1.2);
    fill.position.set(180, 60, 170);
    const rim = new THREE.DirectionalLight('#d3e2f0', 2.5);
    rim.position.set(100, 180, -210);
    scene.add(ambient, key, fill, rim);

    const meshes = [], resources = [];
    function addPart(part, shading) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(part.positions, 3));
      geometry.setIndex(part.indices);
      if (shading) {
        const normals = [], colors = [];
        for (const index of part.sourceVertexIndices) {
          normals.push(...shading.normals.slice(index * 3, index * 3 + 3));
          const shade = shading.shades[index];
          colors.push(shade, shade, shade);
        }
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      } else geometry.computeVertexNormals();
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      const anatomy = new THREE.MeshPhysicalMaterial({color: '#d1b8a7', vertexColors: !!shading, roughness: .52, metalness: 0, clearcoat: .12, clearcoatRoughness: .62, side: THREE.DoubleSide});
      const data = new THREE.MeshBasicMaterial({color: ATLAS_COLORS.missing, side: THREE.DoubleSide, toneMapped: false, fog: false});
      const mesh = new THREE.Mesh(geometry, anatomy);
      mesh.userData = {part, key: part.key, deep: part.deep, neutral: part.neutral, anatomy, data, targetOffset: new THREE.Vector3()};
      mesh.name = part.key;
      const boundary = boundaryPositions(part.positions, part.indices);
      const linesGeometry = new THREE.BufferGeometry();
      linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(boundary, 3));
      const lines = new THREE.LineSegments(linesGeometry, new THREE.LineBasicMaterial({color: '#333b45', transparent: true, opacity: .5, depthWrite: false, toneMapped: false}));
      mesh.add(lines);
      mesh.userData.border = lines;

      let highlight;
      if (part.deep) {
        highlight = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: ATLAS_COLORS.selected, side: THREE.BackSide, toneMapped: false, depthWrite: false}));
        const scale = 1.045;
        highlight.scale.setScalar(scale);
        highlight.position.set(...part.center.map(value => value * (1 - scale)));
        resources.push(highlight.material);
      } else {
        highlight = new THREE.LineSegments(linesGeometry, new THREE.LineBasicMaterial({color: ATLAS_COLORS.selected, transparent: false, depthWrite: false, toneMapped: false}));
        resources.push(highlight.material);
      }
      highlight.renderOrder = 5;
      highlight.visible = false;
      mesh.add(highlight);
      mesh.userData.highlight = highlight;
      scene.add(mesh);
      meshes.push(mesh);
      resources.push(geometry, anatomy, data, linesGeometry, lines.material);
    }

    try {
      surfaces.forEach((surface, index) => {
        const hemisphere = index === 0 ? 'lh' : 'rh';
        const shading = surfaceShading(surface);
        partitionCortex(surface, hemisphere).forEach(part => addPart(part, shading));
      });
      deepMeshes.forEach(mesh => addPart({...compactIndexedGeometry(mesh.positions, mesh.faces), key: mesh.key, hemisphere: mesh.hemisphere, deep: true, neutral: false}));
    } catch (problem) {
      resources.forEach(resource => resource.dispose());
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      setError(`The anatomical model could not be prepared. ${problem.message}`);
      return;
    }

    const state = {renderer, scene, camera, controls, meshes, transition: null, initialized: false};
    function move(position, target, immediate = false) {
      if (immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        camera.position.copy(position);
        controls.target.copy(target);
        state.transition = null;
        controls.update();
      } else state.transition = {time: performance.now(), from: camera.position.clone(), to: position, fromTarget: controls.target.clone(), target};
    }
    function fit({part = null, direction = null, immediate = false} = {}) {
      const box = new THREE.Box3();
      const candidates = part ? meshes.filter(mesh => mesh.userData.key === part && mesh.visible) : meshes.filter(mesh => mesh.visible);
      for (const mesh of candidates) {
        // Fit the destination layout while the rigid pieces are still animating.
        box.union(mesh.geometry.boundingBox.clone().translate(mesh.userData.targetOffset));
      }
      if (box.isEmpty()) return;
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
      const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
      const distance = Math.max(38, sphere.radius / Math.sin(Math.min(vertical, horizontal)) * 1.12);
      const vector = direction ? new THREE.Vector3(...direction) : camera.position.clone().sub(controls.target);
      if (vector.lengthSq() < .001) vector.set(...VIEWS.oblique);
      vector.normalize();
      move(sphere.center.clone().addScaledVector(vector, distance), sphere.center, immediate);
    }
    state.fit = fit;
    state.move = move;
    sceneRef.current = state;

    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
    let down = null, lastHoverTime = 0;
    function hit(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const candidates = meshes.filter(mesh => mesh.visible && !mesh.userData.neutral);
      if (live.current.opacity < .4) {
        const deep = raycaster.intersectObjects(candidates.filter(mesh => mesh.userData.deep), false)[0];
        if (deep) return deep;
      }
      return raycaster.intersectObjects(candidates, false)[0] || null;
    }
    function updateHover(key) {
      if (key === hoverKey.current) return;
      hoverKey.current = key;
      const region = live.current.regions.find(region => region.key === key);
      setHover(region ? region.label : '');
      renderer.domElement.style.cursor = key ? 'pointer' : 'grab';
    }
    const pointerDown = event => {down = [event.clientX, event.clientY]; state.transition = null;};
    const pointerUp = event => {
      if (down && Math.hypot(event.clientX - down[0], event.clientY - down[1]) < 5) {
        const intersection = hit(event);
        if (intersection) live.current.onSelect?.(intersection.object.userData.key);
      }
      down = null;
    };
    const pointerMove = event => {
      if (down || event.pointerType === 'touch' || performance.now() - lastHoverTime < 65) return;
      lastHoverTime = performance.now();
      updateHover(hit(event)?.object.userData.key || '');
    };
    const pointerLeave = () => {down = null; updateHover('');};
    const wheel = () => {state.transition = null;};
    const contextLost = event => {event.preventDefault(); setError('The 3D graphics connection was lost. Reload this page to restore the atlas.');};
    const events = {pointerdown: pointerDown, pointerup: pointerUp, pointermove: pointerMove, pointerleave: pointerLeave, pointercancel: pointerLeave, wheel, webglcontextlost: contextLost};
    for (const [name, handler] of Object.entries(events)) renderer.domElement.addEventListener(name, handler);

    const resize = () => {
      const {width, height} = element.getBoundingClientRect();
      if (!width || !height) return;
      const previousAspect = camera.aspect;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (!state.initialized) {
        fit({direction: VIEWS.oblique, immediate: true});
        state.initialized = true;
      } else if (Math.abs(previousAspect - camera.aspect) > .3) fit({immediate: true});
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    let frame, previousFrame = performance.now();
    const render = () => {
      frame = requestAnimationFrame(render);
      if (!document.hidden && element.offsetWidth && element.offsetHeight) {
        const now = performance.now();
        const fraction = 1 - Math.exp(-Math.min(.1, (now - previousFrame) / 1000) * 13);
        previousFrame = now;
        for (const mesh of meshes) {
          const target = mesh.userData.targetOffset;
          if (mesh.position.distanceToSquared(target) < .000004) mesh.position.copy(target);
          else mesh.position.lerp(target, fraction);
        }
        const transition = state.transition;
        if (transition) {
          const time = Math.min(1, (performance.now() - transition.time) / 650);
          const amount = 1 - Math.pow(1 - time, 3);
          camera.position.lerpVectors(transition.from, transition.to, amount);
          controls.target.lerpVectors(transition.fromTarget, transition.target, amount);
          if (time === 1) state.transition = null;
        }
        controls.update();
        renderer.render(scene, camera);
      }
    };
    render();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      for (const [name, handler] of Object.entries(events)) renderer.domElement.removeEventListener(name, handler);
      controls.dispose();
      for (const resource of new Set(resources)) resource.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      sceneRef.current = null;
    };
  }, [surfaces, deepMeshes]);

  useEffect(() => {
    const state = sceneRef.current;
    if (!state) return;
    const visible = new Set(visibleKeys || regions.map(region => region.key));
    const metadata = new Map(regions.map(region => [region.key, region]));
    const deepKeys = new Set(deepMeshes.map(mesh => mesh.key));
    const cortical = regions.filter(region => !deepKeys.has(region.key));
    const corticalIndex = new Map(cortical.map((region, index) => [region.key, index]));
    const finite = values?.filter(Number.isFinite) || [];
    const min = finite.length ? Math.min(...finite) : 0, max = finite.length ? Math.max(...finite) : 0;
    const anatomy = mode === 'anatomy';
    for (const mesh of state.meshes) {
      const {part, data, anatomy: anatomicalMaterial, border, highlight} = mesh.userData;
      const region = metadata.get(part.key);
      mesh.visible = part.neutral ? cortical.filter(region => region.hemisphere === part.hemisphere).every(region => visible.has(region.key)) : visible.has(part.key);
      // Absolute offsets preserve mesh-local source positions and exact restoration.
      mesh.userData.targetOffset.set(...explosionOffset(part.center, part.hemisphere, part.deep, explode));
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) mesh.position.copy(mesh.userData.targetOffset);
      mesh.material = anatomy ? anatomicalMaterial : data;
      if (anatomy) anatomicalMaterial.color.set(colorByLobe && region ? lobeColors[region.lobe] || '#d1b8a7' : part.deep ? '#b6a69e' : '#d1b8a7');
      else data.color.copy(layerColor(part.deep || part.neutral ? null : values?.[corticalIndex.get(part.key)], min, max));
      // Numeric colors must match the legend without background blending.
      mesh.material.opacity = anatomy && !part.deep ? opacity : 1;
      mesh.material.transparent = mesh.material.opacity < .999;
      mesh.material.depthWrite = mesh.material.opacity >= .95;
      border.visible = borders && !part.neutral;
      highlight.visible = selected === part.key && !part.neutral;
      mesh.updateMatrixWorld(true);
    }
    state.controls.autoRotate = rotate;
    state.renderer.toneMapping = anatomy ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
    state.renderer.domElement.dataset.visibleCount = String(state.meshes.filter(mesh => mesh.visible && !mesh.userData.neutral).length);
    state.renderer.domElement.dataset.explode = String(explode);
    state.renderer.domElement.dataset.mode = mode;
    state.renderer.domElement.dataset.selected = selected || '';
    if (hoverKey.current && !visible.has(hoverKey.current)) {hoverKey.current = ''; setHover('');}
  }, [visibleKeys, regions, selected, values, mode, explode, opacity, borders, rotate, colorByLobe, lobeColors, surfaces, deepMeshes]);

  useEffect(() => {
    const state = sceneRef.current;
    if (!state) return;
    state.fit();
  }, [explode, surfaces, deepMeshes]);

  useEffect(() => {
    const state = sceneRef.current;
    if (!state || !preset) return;
    // Keep OrbitControls' up axis stable, including at the near-polar top view.
    state.camera.up.set(0,1,0);
    state.fit({direction: VIEWS[preset.name] || VIEWS.oblique});
  }, [preset, surfaces, deepMeshes]);

  useEffect(() => {
    const state = sceneRef.current;
    if (state && focusToken) state.fit({part: live.current.selected});
  }, [focusToken]);

  return <div className="studio-scene" style={{position: 'relative', width: '100%', height: '100%', minHeight: 300}}>
    <div ref={host} className="studio-canvas-host" style={{position: 'absolute', inset: 0}} />
    <div className="studio-hover-status" aria-live="polite" aria-atomic="true" style={{position: 'absolute', left: 16, bottom: 16, maxWidth: 'calc(100% - 32px)', pointerEvents: 'none', color: '#e8edf3', fontSize: 12}}>{hover}</div>
    {error && <div className="studio-render-error" role="alert">{error}</div>}
  </div>;
}
