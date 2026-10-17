import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MoodType } from '../types/cafe';
import { RotateCw, Sparkles, Flame, Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface ThreeDrinkCanvasProps {
  activeMood: MoodType;
  drinkType?: 'hot' | 'iced';
  onMoodChange?: (mood: MoodType) => void;
  className?: string;
  isInteractive?: boolean;
}

const MOOD_COLORS: Record<MoodType, { primary: number; secondary: number; name: string }> = {
  comfort: { primary: 0xE6A85C, secondary: 0x9333EA, name: 'Comfort (Warm Amber)' },
  focus: { primary: 0x60A5FA, secondary: 0x38BDF8, name: 'Focus (Cool Navy & Silver)' },
  adventure: { primary: 0xA855F7, secondary: 0xF59E0B, name: 'Adventure (Purple & Gold)' },
  celebration: { primary: 0xF59E0B, secondary: 0xEC4899, name: 'Celebration (Warm Gold & Rose)' },
  refresh: { primary: 0x10B981, secondary: 0x06B6D4, name: 'Refresh (Crisp Mint & Cyan)' },
  treat: { primary: 0xF472B6, secondary: 0xFBBF24, name: 'Little Treat (Pastel Caramel)' },
};

export const ThreeDrinkCanvas: React.FC<ThreeDrinkCanvasProps> = ({
  activeMood,
  drinkType = 'iced',
  onMoodChange,
  className = '',
  isInteractive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [viewAngle, setViewAngle] = useState<'front' | 'top' | 'isometric'>('isometric');
  const [hudCollapsed, setHudCollapsed] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  // References to communicate with render loop
  const stateRef = useRef({
    activeMood,
    drinkType,
    isRotating: true,
    targetRotationY: 0,
    targetRotationX: 0.2,
    targetCameraY: 2.5,
    targetCameraZ: 5.5,
    isDragging: false,
    prevPointerX: 0,
    prevPointerY: 0,
  });

  useEffect(() => {
    stateRef.current.activeMood = activeMood;
  }, [activeMood]);

  useEffect(() => {
    stateRef.current.drinkType = drinkType;
  }, [drinkType]);

  useEffect(() => {
    stateRef.current.isRotating = isRotating;
  }, [isRotating]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvasTest = document.createElement('canvas');
      const gl = canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    let animationFrameId: number;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x10172A, 0.05);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(0, 2.5, 5.5);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Procedural Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    pmremGenerator.dispose();

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x302238, 0x10172A, 0.8);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffecd2, 2.2);
    keyLight.position.set(4, 7, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 1.2);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    // Dynamic Mood Point Light
    const moodLight = new THREE.PointLight(MOOD_COLORS[activeMood].primary, 3.5, 10);
    moodLight.position.set(0, 3.2, 1.5);
    scene.add(moodLight);

    const floorGlowLight = new THREE.PointLight(MOOD_COLORS[activeMood].secondary, 1.5, 6);
    floorGlowLight.position.set(0, -0.5, 0);
    scene.add(floorGlowLight);

    // 5. Build Procedural Multi-Part Drink Subject (THREE.Group)
    const drinkGroup = new THREE.Group();
    scene.add(drinkGroup);

    // A. Reflective Coaster Plate / Base
    const coasterGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.08, 48);
    const coasterMat = new THREE.MeshPhysicalMaterial({
      color: 0x1E293B,
      metalness: 0.85,
      roughness: 0.25,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
    });
    const coaster = new THREE.Mesh(coasterGeo, coasterMat);
    coaster.position.y = -1.04;
    coaster.receiveShadow = true;
    drinkGroup.add(coaster);

    // Brass Inlay Ring on coaster
    const brassRingGeo = new THREE.TorusGeometry(1.5, 0.02, 16, 64);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xE6A85C,
      metalness: 0.9,
      roughness: 0.2,
    });
    const brassRing = new THREE.Mesh(brassRingGeo, brassMat);
    brassRing.rotation.x = Math.PI / 2;
    brassRing.position.y = -1.0;
    drinkGroup.add(brassRing);

    // Soft Radial Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(4.2, 4.2);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.07;
    drinkGroup.add(shadowMesh);

    // B. Glassware Container (Ribbed Luxury Tumbler / Fluted Glass)
    const glassGeo = new THREE.CylinderGeometry(0.95, 0.78, 2.3, 36, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.08,
      ior: 1.52,
      thickness: 0.4,
      depthWrite: false,
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.y = 0.15;
    drinkGroup.add(glass);

    // Glass Base (thick solid bottom)
    const glassBottomGeo = new THREE.CylinderGeometry(0.8, 0.78, 0.2, 36);
    const glassBottom = new THREE.Mesh(glassBottomGeo, glassMat);
    glassBottom.position.y = -0.92;
    glassBottom.castShadow = true;
    drinkGroup.add(glassBottom);

    // C. Liquid Inner Core
    const liquidGeo = new THREE.CylinderGeometry(0.9, 0.75, 2.05, 36);
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: 0xE6A85C, // caramel amber default
      transmission: 0.5,
      roughness: 0.15,
      metalness: 0.05,
      ior: 1.34,
      attenuationColor: new THREE.Color(0x78350F),
      attenuationDistance: 0.6,
    });
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = 0.06;
    liquid.castShadow = true;
    drinkGroup.add(liquid);

    // D. Froth / Microfoam Layer (Top cream swirl)
    const foamGeo = new THREE.CylinderGeometry(0.92, 0.9, 0.22, 36);
    const foamMat = new THREE.MeshStandardMaterial({
      color: 0xFDFBF7,
      roughness: 0.75,
      metalness: 0.05,
    });
    const foam = new THREE.Mesh(foamGeo, foamMat);
    foam.position.y = 1.15;
    drinkGroup.add(foam);

    // Caramel / Mocha Ripple on top of foam
    const swirlGeo = new THREE.TorusGeometry(0.45, 0.06, 16, 32);
    const swirlMat = new THREE.MeshStandardMaterial({
      color: 0xB45309,
      roughness: 0.3,
      metalness: 0.1,
    });
    const swirl = new THREE.Mesh(swirlGeo, swirlMat);
    swirl.rotation.x = Math.PI / 2;
    swirl.position.y = 1.27;
    drinkGroup.add(swirl);

    // E. Realistic Ice Cubes (for iced drinks)
    const iceGroup = new THREE.Group();
    const iceGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
    const iceMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.94,
      roughness: 0.12,
      ior: 1.31,
      thickness: 0.6,
      transparent: true,
      depthWrite: false,
    });

    const cube1 = new THREE.Mesh(iceGeo, iceMat);
    cube1.position.set(0.2, 0.6, 0.1);
    cube1.rotation.set(0.3, 0.4, 0.1);
    iceGroup.add(cube1);

    const cube2 = new THREE.Mesh(iceGeo, iceMat);
    cube2.position.set(-0.25, 0.35, -0.15);
    cube2.rotation.set(0.1, 0.8, 0.5);
    iceGroup.add(cube2);

    const cube3 = new THREE.Mesh(iceGeo, iceMat);
    cube3.position.set(0.05, -0.15, 0.2);
    cube3.rotation.set(0.5, 0.2, 0.7);
    iceGroup.add(cube3);

    drinkGroup.add(iceGroup);

    // F. Golden Straw / Metal Stirrer
    const strawGeo = new THREE.CylinderGeometry(0.035, 0.035, 3.2, 16);
    const strawMat = new THREE.MeshStandardMaterial({
      color: 0xE6A85C,
      metalness: 0.95,
      roughness: 0.2,
    });
    const straw = new THREE.Mesh(strawGeo, strawMat);
    straw.position.set(0.3, 0.85, 0.2);
    straw.rotation.z = -0.22;
    straw.rotation.x = 0.15;
    straw.castShadow = true;
    drinkGroup.add(straw);

    // G. Mint Leaf / Botanical Garnish
    const mintGroup = new THREE.Group();
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.2, 0.25, 0, 0.55);
    leafShape.quadraticCurveTo(-0.2, 0.25, 0, 0);
    const leafGeo = new THREE.ShapeGeometry(leafShape);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.5,
      side: THREE.DoubleSide,
    });
    const leaf1 = new THREE.Mesh(leafGeo, leafMat);
    leaf1.scale.set(0.55, 0.55, 0.55);
    leaf1.rotation.set(-0.6, 0.3, 0.8);
    leaf1.position.set(-0.2, 1.25, 0.2);
    mintGroup.add(leaf1);

    const leaf2 = new THREE.Mesh(leafGeo, leafMat);
    leaf2.scale.set(0.45, 0.45, 0.45);
    leaf2.rotation.set(-0.8, -0.4, -0.4);
    leaf2.position.set(-0.1, 1.22, 0.15);
    mintGroup.add(leaf2);

    drinkGroup.add(mintGroup);

    // H. Atmospheric Effervescence / Steam Particle System
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 1.2;
      particlePos[i * 3 + 1] = 1.1 + Math.random() * 1.5;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
      particleVel[i] = 0.005 + Math.random() * 0.01;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xE6A85C,
      size: 0.06,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    drinkGroup.add(particles);

    // Initial positioning
    drinkGroup.position.y = 0.1;

    // Interaction Handlers (Pointer drag with dampening)
    const onPointerDown = (e: PointerEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.prevPointerX = e.clientX;
      stateRef.current.prevPointerY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!stateRef.current.isDragging) return;
      const deltaX = e.clientX - stateRef.current.prevPointerX;
      const deltaY = e.clientY - stateRef.current.prevPointerY;
      stateRef.current.prevPointerX = e.clientX;
      stateRef.current.prevPointerY = e.clientY;

      stateRef.current.targetRotationY += deltaX * 0.008;
      stateRef.current.targetRotationX = Math.max(
        -0.2,
        Math.min(0.6, stateRef.current.targetRotationX + deltaY * 0.005)
      );
    };

    const onPointerUp = () => {
      stateRef.current.isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation & Render Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth auto rotation when not dragging
      if (stateRef.current.isRotating && !stateRef.current.isDragging) {
        stateRef.current.targetRotationY += 0.5 * delta;
      }

      // Smooth Damping for rotation
      drinkGroup.rotation.y = THREE.MathUtils.damp(
        drinkGroup.rotation.y,
        stateRef.current.targetRotationY,
        6,
        delta
      );
      drinkGroup.rotation.x = THREE.MathUtils.damp(
        drinkGroup.rotation.x,
        stateRef.current.targetRotationX,
        6,
        delta
      );

      // Camera position damping
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        stateRef.current.targetCameraY,
        4,
        delta
      );
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        stateRef.current.targetCameraZ,
        4,
        delta
      );
      camera.lookAt(0, 0.2, 0);

      // Floating bobbing motion
      const time = clock.getElapsedTime();
      drinkGroup.position.y = 0.1 + Math.sin(time * 1.5) * 0.04;

      // Dynamic mood color interpolation
      const moodConfig = MOOD_COLORS[stateRef.current.activeMood];
      const targetColor = new THREE.Color(moodConfig.primary);
      const targetSecColor = new THREE.Color(moodConfig.secondary);

      moodLight.color.lerp(targetColor, 0.05);
      floorGlowLight.color.lerp(targetSecColor, 0.05);
      particleMat.color.lerp(targetColor, 0.05);

      // Adjust drink visuals based on temperature
      const isIced = stateRef.current.drinkType === 'iced';
      iceGroup.visible = isIced;
      straw.visible = isIced;

      // Adjust liquid color based on mood
      let liquidTargetHex = 0xE6A85C; // Amber caramel
      if (stateRef.current.activeMood === 'focus') liquidTargetHex = 0x3E2723; // Dark espresso
      else if (stateRef.current.activeMood === 'refresh') liquidTargetHex = 0xFB923C; // Blood orange
      else if (stateRef.current.activeMood === 'adventure') liquidTargetHex = 0x4A0E17; // Blackberry mocha
      else if (stateRef.current.activeMood === 'celebration') liquidTargetHex = 0xD97706; // Golden honey

      liquidMat.color.lerp(new THREE.Color(liquidTargetHex), 0.05);

      // Animate particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleVel[i];
        if (positions[i * 3 + 1] > 2.6) {
          positions[i * 3 + 1] = 1.1;
          positions[i * 3] = (Math.random() - 0.5) * 0.9;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 0.9;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);

      // Resource Disposal
      coasterGeo.dispose();
      coasterMat.dispose();
      brassRingGeo.dispose();
      brassMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTexture.dispose();
      glassGeo.dispose();
      glassMat.dispose();
      glassBottomGeo.dispose();
      liquidGeo.dispose();
      liquidMat.dispose();
      foamGeo.dispose();
      foamMat.dispose();
      swirlGeo.dispose();
      swirlMat.dispose();
      iceGeo.dispose();
      iceMat.dispose();
      strawGeo.dispose();
      strawMat.dispose();
      leafGeo.dispose();
      leafMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      renderer.dispose();
      if (container && domElement.parentNode === container) {
        container.removeChild(domElement);
      }
    };
  }, []);

  const handleAngleChange = (angle: 'front' | 'top' | 'isometric') => {
    setViewAngle(angle);
    if (angle === 'front') {
      stateRef.current.targetCameraY = 0.5;
      stateRef.current.targetCameraZ = 5.0;
      stateRef.current.targetRotationX = 0;
    } else if (angle === 'top') {
      stateRef.current.targetCameraY = 4.8;
      stateRef.current.targetCameraZ = 2.8;
      stateRef.current.targetRotationX = 0.6;
    } else {
      stateRef.current.targetCameraY = 2.5;
      stateRef.current.targetCameraZ = 5.5;
      stateRef.current.targetRotationX = 0.2;
    }
  };

  return (
    <div className={`relative w-full h-full select-none overflow-hidden ${className}`}>
      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        style={{ minHeight: '380px' }}
      />

      {/* WebGL Fallback container if WebGL is disabled/unsupported */}
      {!hasWebGL && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#10172A] p-6 text-center">
          <div className="max-w-md">
            <Sparkles className="w-8 h-8 text-[#E6A85C] mx-auto mb-3" />
            <p className="text-sm text-[#F8F6F2] font-medium">Interactive 3D Preview</p>
            <p className="text-xs text-[#B6BAC7] mt-1">
              Your browser is running in compatibility mode. Discover all signature drinks through our high-resolution tasting gallery.
            </p>
          </div>
        </div>
      )}

      {/* Sleek Ergonomic Collapsible Bottom Control Dock (skill directive: zero central viewport occlusion) */}
      {isInteractive && hasWebGL && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
          {/* Collapse/Expand Toggle Pill */}
          <button
            onClick={() => setHudCollapsed(!hudCollapsed)}
            className="flex items-center gap-1.5 px-3 py-1 mb-1.5 text-xs text-[#B6BAC7] bg-[#10172A]/85 hover:text-[#F8F6F2] hover:bg-[#1E293B] border border-white/10 rounded-full transition-colors backdrop-blur-none"
            title="Toggle 3D Viewport Controls"
          >
            {hudCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-[#E6A85C]" />
                <span>Show 3D Studio Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Zen Mode</span>
              </>
            )}
          </button>

          {/* Unified Horizontal Dock */}
          {!hudCollapsed && (
            <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-2 bg-[#10172A]/90 border border-white/10 rounded-xl shadow-2xl transition-all">
              {/* Rotation Toggle */}
              <button
                onClick={() => setIsRotating(!isRotating)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  isRotating
                    ? 'bg-[#E6A85C] text-[#10172A]'
                    : 'text-[#B6BAC7] hover:text-[#F8F6F2] bg-white/5'
                }`}
                title="Auto Orbit Rotation"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                <span>Orbit</span>
              </button>

              <div className="w-[1px] h-4 bg-white/10 hidden sm:block" />

              {/* Angle Presets */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[#B6BAC7] mr-1 text-[11px] hidden sm:inline">Angle:</span>
                {(['isometric', 'front', 'top'] as const).map((angle) => (
                  <button
                    key={angle}
                    onClick={() => handleAngleChange(angle)}
                    className={`px-2 py-1 rounded text-xs capitalize transition-colors ${
                      viewAngle === angle
                        ? 'bg-white/15 text-[#F8F6F2] font-medium'
                        : 'text-[#B6BAC7] hover:text-[#F8F6F2]'
                    }`}
                  >
                    {angle}
                  </button>
                ))}
              </div>

              <div className="w-[1px] h-4 bg-white/10 hidden sm:block" />

              {/* Mood Studio Lighting Selector */}
              {onMoodChange && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[#B6BAC7] text-[11px] hidden md:inline">Lighting:</span>
                  {(['comfort', 'focus', 'adventure', 'celebration', 'refresh'] as MoodType[]).map((mood) => {
                    const isActive = activeMood === mood;
                    return (
                      <button
                        key={mood}
                        onClick={() => onMoodChange(mood)}
                        className={`px-2 py-0.5 rounded text-xs capitalize transition-colors ${
                          isActive
                            ? 'border border-[#E6A85C] text-[#E6A85C] font-semibold bg-[#E6A85C]/10'
                            : 'text-[#B6BAC7] hover:text-[#F8F6F2]'
                        }`}
                        title={`Ambiance: ${mood}`}
                      >
                        {mood}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
