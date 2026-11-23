'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * The music box's dancer, modelled in three.js from simple shapes after a turnaround of
 * a ballerina figurine: crossed legs en pointe in satin shoes, a slim bodice, a long
 * romantic skirt (a lathe with pleats) that flares and ripples as she turns, one arm
 * curved overhead and one held out to the side, hair in a bun, on a round mirrored
 * pedestal with a gold rim. She turns while `spinning`; otherwise one frame is drawn.
 */

const SKIN = '#f2cdb8';
const BODICE = '#d47fa2';
const SATIN = '#f6bccb';
const HAIR = '#3a2620';

function tube(points: [number, number, number][], radius: number, mat: THREE.Material) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, radius, 10, false), mat);
  // round off both ends
  [points[0], points[points.length - 1]].forEach((p) => {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(radius, 10, 8), mat);
    cap.position.set(...p);
    mesh.add(cap);
  });
  return mesh;
}

function lathe(profile: [number, number][], mat: THREE.Material, segments = 48) {
  return new THREE.Mesh(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments), mat);
}

export function Ballerina3D({ spinning, width = 84, height = 168 }: { spinning: boolean; width?: number; height?: number }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef(spinning);
  useEffect(() => {
    spinRef.current = spinning;
  }, [spinning]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1) * 1.5);
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 20);
    // seen from a little above, matching how you look down into the box
    camera.position.set(0, 1.55, 4.4);
    camera.lookAt(0, 1.0, 0);

    scene.add(new THREE.HemisphereLight('#fff4f8', '#b98aa0', 1.1));
    const key = new THREE.DirectionalLight('#fff1e4', 1.6);
    key.position.set(1.4, 3, 2.5);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#ffc4dc', 1.2);
    rim.position.set(-2, 1.5, -2.5);
    scene.add(rim);

    const skin = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.6 });
    const bodice = new THREE.MeshStandardMaterial({ color: BODICE, roughness: 0.55 });
    const satin = new THREE.MeshStandardMaterial({ color: SATIN, roughness: 0.35, metalness: 0.05 });
    const hair = new THREE.MeshStandardMaterial({ color: HAIR, roughness: 0.7 });
    const mirror = new THREE.MeshStandardMaterial({ color: '#eef2f8', roughness: 0.12, metalness: 0.9 });
    const gold = new THREE.MeshStandardMaterial({ color: '#d4ad57', roughness: 0.3, metalness: 0.85 });

    // the pedestal
    const pedestal = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.5, 0.1, 48), gold);
    base.position.y = 0.05;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 48), mirror);
    top.position.y = 0.12;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.022, 10, 64), gold);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.14;
    pedestal.add(base, top, ring);
    scene.add(pedestal);

    // the dancer, turning on the pedestal
    const dancer = new THREE.Group();
    scene.add(dancer);

    // legs, crossed en pointe, and satin shoes
    dancer.add(tube([[0.0, 0.2, 0.0], [-0.01, 0.42, 0.01], [-0.03, 0.6, 0.02]], 0.032, skin));
    dancer.add(tube([[-0.03, 0.6, 0.02], [-0.05, 0.8, 0.01], [-0.06, 0.97, 0.0]], 0.05, skin));
    dancer.add(tube([[0.07, 0.2, 0.07], [0.07, 0.42, 0.07], [0.06, 0.6, 0.06]], 0.032, skin));
    dancer.add(tube([[0.06, 0.6, 0.06], [0.06, 0.8, 0.03], [0.06, 0.97, 0.0]], 0.05, skin));
    [
      [0.0, 0.0],
      [0.07, 0.07],
    ].forEach(([x, z]) => {
      const shoe = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.024, 0.12, 12), satin);
      shoe.position.set(x, 0.2, z);
      dancer.add(shoe);
    });

    // bodice and shoulders (a little flatter front to back)
    const torso = new THREE.Group();
    torso.add(
      lathe(
        [
          [0.0, 0.93],
          [0.12, 0.94],
          [0.125, 1.0],
          [0.095, 1.12],
          [0.11, 1.24],
          [0.12, 1.31],
          [0.0, 1.31],
        ],
        bodice,
      ),
    );
    torso.add(
      lathe(
        [
          [0.0, 1.31],
          [0.12, 1.31],
          [0.13, 1.36],
          [0.1, 1.41],
          [0.04, 1.445],
          [0.0, 1.45],
        ],
        skin,
      ),
    );
    torso.scale.z = 0.72;
    dancer.add(torso);

    // neck, head, hair and bun, tilted a little toward the raised arm
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.12, 12), skin);
    neck.position.y = 1.49;
    const head = new THREE.Group();
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.085, 24, 20), skin);
    face.scale.set(0.92, 1.08, 0.98);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.089, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), hair);
    cap.rotation.x = -0.45;
    cap.position.set(0, 0.008, -0.006);
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), hair);
    bun.position.set(0, 0.07, -0.08);
    head.add(face, cap, bun);
    head.position.set(0, 1.62, 0);
    head.rotation.set(0.12, 0.3, 0.18);
    dancer.add(neck, head);

    // one arm curved overhead, the other held out to the side
    dancer.add(tube([[0.12, 1.39, 0.0], [0.22, 1.6, 0.02], [0.17, 1.84, 0.04], [0.07, 1.94, 0.05], [0.01, 1.95, 0.06]], 0.022, skin));
    dancer.add(tube([[-0.12, 1.39, 0.0], [-0.3, 1.33, 0.05], [-0.46, 1.23, 0.1], [-0.53, 1.17, 0.13]], 0.022, skin));

    // the skirt: a long bell with soft pleats, pink at the waist fading to white at the hem
    const skirtProfile: [number, number][] = [
      [0.125, 1.02],
      [0.16, 0.97],
      [0.23, 0.86],
      [0.31, 0.72],
      [0.38, 0.58],
      [0.42, 0.48],
    ];
    const skirtGeo = new THREE.LatheGeometry(
      skirtProfile.map(([r, y]) => new THREE.Vector2(r, y)),
      120,
    );
    const pos = skirtGeo.attributes.position as THREE.BufferAttribute;
    const basePos = Float32Array.from(pos.array as Float32Array);
    const colors = new Float32Array(pos.count * 3);
    const top3 = new THREE.Color('#e3a0bb');
    const hem3 = new THREE.Color('#fff4f8');
    for (let i = 0; i < pos.count; i++) {
      const k = (1.02 - basePos[i * 3 + 1]) / 0.54;
      const c = top3.clone().lerp(hem3, Math.min(1, Math.max(0, k)));
      colors.set([c.r, c.g, c.b], i * 3);
    }
    skirtGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const skirtMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.86,
      roughness: 0.75,
    });
    const skirt = new THREE.Mesh(skirtGeo, skirtMat);
    dancer.add(skirt);

    // the skirt flares out as she turns, ripples at the hem, and keeps soft pleats
    let flare = 0;
    const shapeSkirt = (t: number) => {
      for (let i = 0; i < pos.count; i++) {
        const x = basePos[i * 3];
        const y = basePos[i * 3 + 1];
        const z = basePos[i * 3 + 2];
        const r = Math.hypot(x, z);
        if (r < 1e-4) continue;
        const a = Math.atan2(z, x);
        const depth = Math.min(1, Math.max(0, (1.0 - y) / 0.52)); // 0 at the waist, 1 at the hem
        const pleat = Math.sin(a * 36) * 0.006 * depth;
        const ripple = Math.sin(a * 5 - t * 3.2) * 0.022 * depth * depth;
        // one side lifts higher, like the references: the skirt swings out behind the turn
        const swing = (0.5 + 0.5 * Math.sin(a + t * 0.6)) * flare * 0.14 * depth * depth;
        const nr = r + pleat + ripple + swing;
        pos.setXYZ(i, Math.cos(a) * nr, y + swing * 0.35, Math.sin(a) * nr);
      }
      pos.needsUpdate = true;
      skirtGeo.computeVertexNormals();
    };

    let raf = 0;
    let last = performance.now();
    let angle = -0.5;
    let t = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const spin = spinRef.current;
      flare += ((spin ? 1 : 0) - flare) * Math.min(1, dt * 1.5);
      if (spin) angle += dt * 1.6;
      t += dt;
      dancer.rotation.y = angle;
      shapeSkirt(t);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still) {
      shapeSkirt(0);
      renderer.render(scene, camera);
    } else raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
      [skin, bodice, satin, hair, mirror, gold, skirtMat].forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [width, height]);

  return <div ref={hostRef} className="mb-ballerina" style={{ width, height }} aria-hidden />;
}
