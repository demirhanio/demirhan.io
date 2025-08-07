import * as THREE from 'three';
export class HeroAnimation {
  constructor(mountRef, mouseRef) {
    this.mountRef = mountRef;
    this.mouseRef = mouseRef;
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.animationId = null;
    this.tunnelSegments = [];
    this.clock = new THREE.Clock();
    this.frameCount = 0;
    this.tunnelSpeed = 3; 
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.animationIntensity = 0; 
    this.targetIntensity = 0;
    this.introAnimationPlayed = false;
    this.lastScrollTime = 0;
  }
  init() {
    this.setupScene();
    this.createTunnelGeometry();
    this.setupEventListeners();
    this.animate();
    this.playIntroAnimation();
  }
  playIntroAnimation() {
    
    this.targetIntensity = 1;
    this.introAnimationPlayed = true;
    
    
    setTimeout(() => {
      if (!this.isScrolling) {
        this.targetIntensity = 0;
      }
    }, 200);
  }
  setupScene() {
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a); 
    
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;
    
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: false, 
      antialias: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); 
    this.mountRef.current.appendChild(this.renderer.domElement);
  }
  createTunnelGeometry() {
    const segmentCount = 100; 
    const segmentSpacing = 1; 
    
    for (let i = 0; i < segmentCount; i++) {
      
      const segmentGroup = new THREE.Group();
      
      
      this.createTunnelWalls(segmentGroup, i);
      
      
      segmentGroup.position.z = -i * segmentSpacing;
      segmentGroup.userData = {
        originalZ: segmentGroup.position.z,
        segmentIndex: i
      };
      
      this.scene.add(segmentGroup);
      this.tunnelSegments.push(segmentGroup);
    }
  }
  createTunnelWalls(group, segmentIndex) {
    
    const tunnelRadius = 4;
    const lineCount = 24; 
    
    
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2;
      const x = Math.cos(angle) * tunnelRadius;
      const y = Math.sin(angle) * tunnelRadius;
      
      
      const lineGeometry = new THREE.PlaneGeometry(0.015, 2);
      
      
      const colorIntensity = 0.3 + (Math.sin(segmentIndex * 0.15 + i * 0.4) * 0.4);
      const material = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color(colorIntensity * 0.8, colorIntensity * 0.9, colorIntensity), 
        transparent: true,
        opacity: 0.6
      });
      
      const line = new THREE.Mesh(lineGeometry, material);
      line.position.set(x, y, 0);
      line.lookAt(0, 0, 0); 
      group.add(line);
    }
    
    
    if (segmentIndex % 3 === 0) {
      this.addTunnelRings(group, segmentIndex);
    }
    
    
    if (segmentIndex % 6 === 0) {
      this.addRadialStreaks(group, segmentIndex);
    }
  }
  addNaturalDetails(group, baseMaterial) {
    
    const detailMaterial = new THREE.MeshBasicMaterial({ 
      color: new THREE.Color(0.4, 0.5, 0.3), 
      transparent: true,
      opacity: 0.4
    });
    
    
    const crossH = new THREE.PlaneGeometry(3, 0.2); 
    const crossV = new THREE.PlaneGeometry(0.2, 3);
    
    const crossHMesh = new THREE.Mesh(crossH, detailMaterial);
    const crossVMesh = new THREE.Mesh(crossV, detailMaterial);
    
    crossHMesh.position.z = 0.08;
    crossVMesh.position.z = 0.08;
    
    
    crossHMesh.rotation.z = 0.05;
    crossVMesh.rotation.z = 0.05;
    
    group.add(crossHMesh);
    group.add(crossVMesh);
    
    
    const circleMaterial = new THREE.MeshBasicMaterial({ 
      color: new THREE.Color(0.6, 0.45, 0.35), 
      transparent: true,
      opacity: 0.3
    });
    
    for (let x = -2.5; x <= 2.5; x += 5) {
      for (let y = -1.5; y <= 1.5; y += 3) {
        const circleGeometry = new THREE.CircleGeometry(0.4, 8); 
        const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
        circleMesh.position.set(x, y, 0.06);
        group.add(circleMesh);
      }
    }
    
    
    const branchMaterial = new THREE.MeshBasicMaterial({ 
      color: new THREE.Color(0.35, 0.25, 0.2), 
      transparent: true,
      opacity: 0.2
    });
    
    for (let i = 0; i < 3; i++) {
      const branchGeometry = new THREE.PlaneGeometry(4, 0.1);
      const branchMesh = new THREE.Mesh(branchGeometry, branchMaterial);
      branchMesh.position.z = 0.04;
      branchMesh.rotation.z = (Math.PI / 6) * i + Math.random() * 0.2; 
      branchMesh.position.x = (Math.random() - 0.5) * 2;
      branchMesh.position.y = (Math.random() - 0.5) * 2;
      group.add(branchMesh);
    }
  }
  addTunnelRings(group, segmentIndex) {
    
    const ringRadius = 4;
    const ringSegments = 32;
    const ringGeometry = new THREE.RingGeometry(ringRadius - 0.1, ringRadius + 0.1, ringSegments);
    
    const ringMaterial = new THREE.MeshBasicMaterial({ 
      color: new THREE.Color(0.6, 0.7, 0.9), 
      transparent: true,
      opacity: 0.3
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.z = 0.1;
    group.add(ring);
  }
  addRadialStreaks(group, segmentIndex) {
    
    const streakCount = 8;
    
    for (let i = 0; i < streakCount; i++) {
      const angle = (i / streakCount) * Math.PI * 2;
      const length = 3 + Math.random() * 2;
      
      const streakGeometry = new THREE.PlaneGeometry(0.01, length);
      const streakMaterial = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color(0.9, 0.9, 1.0), 
        transparent: true,
        opacity: 0.4
      });
      
      const streak = new THREE.Mesh(streakGeometry, streakMaterial);
      streak.position.set(
        Math.cos(angle) * length * 0.5,
        Math.sin(angle) * length * 0.5,
        0.05
      );
      streak.rotation.z = angle + Math.PI / 2;
      group.add(streak);
    }
  }
  setupEventListeners() {
    
    this.handleMouseMove = (event) => {
      const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      
      
      this.mouseRef.current.x = mouseX;
      this.mouseRef.current.y = mouseY;
    };
    
    this.handleScroll = (event) => {
      const currentTime = Date.now();
      this.lastScrollTime = currentTime;
      
      
      this.isScrolling = true;
      this.targetIntensity = 1;
      
      
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      
      
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
        this.targetIntensity = 0;
      }, 200); 
    };
    this.handleResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.handleResize);
  }
  animate = () => {
    this.frameCount++;
    const elapsedTime = this.clock.getElapsedTime();
    
    
    this.updateAnimationIntensity();
    
    
    if (this.animationIntensity > 0) {
      this.updateTunnel(elapsedTime);
      this.updateCamera();
    }
    
    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(this.animate);
  }
  updateAnimationIntensity() {
    
    
    const lerpSpeed = (this.clock.getElapsedTime() < 2) ? 0.15 : 0.1;
    this.animationIntensity += (this.targetIntensity - this.animationIntensity) * lerpSpeed;
    
    
    if (Math.abs(this.animationIntensity - this.targetIntensity) < 0.001) {
      this.animationIntensity = this.targetIntensity;
    }
  }
  updateTunnel(elapsedTime) {
    
    const intensity = this.animationIntensity;
    
    
    this.tunnelSegments.forEach((segment) => {
      
      segment.position.z += this.tunnelSpeed * 0.05 * intensity;
      
      
      if (segment.position.z > 5) {
        segment.position.z = segment.userData.originalZ;
      }
      
      
      segment.rotation.z = Math.sin(elapsedTime * 1.2 + segment.userData.segmentIndex * 0.3) * 0.05 * intensity;
      
      
      segment.position.x = Math.sin(elapsedTime * 1.5 + segment.userData.segmentIndex) * 0.1 * intensity;
      segment.position.y = Math.cos(elapsedTime * 1.2 + segment.userData.segmentIndex) * 0.08 * intensity;
      
      
      const distance = Math.abs(segment.position.z);
      const maxDistance = 100;
      const distanceOpacity = Math.max(0.1, 1 - (distance / maxDistance));
      
      
      segment.children.forEach((child) => {
        if (child.material) {
          
          child.material.opacity = distanceOpacity * 0.5 * intensity;
        }
      });
    });
  }
  updateCamera() {
    
    const intensity = this.animationIntensity;
    
    
    const targetX = this.mouseRef.current.x * 0.3 * intensity;
    const targetY = this.mouseRef.current.y * 0.3 * intensity;
    
    
    this.camera.position.x += (targetX - this.camera.position.x) * 0.05;
    this.camera.position.y += (targetY - this.camera.position.y) * 0.05;
    
    
    this.camera.lookAt(targetX * 0.5, targetY * 0.5, -10 * intensity);
  }
  dispose() {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.mountRef.current && this.renderer.domElement) {
      this.mountRef.current.removeChild(this.renderer.domElement);
    }
    
    
    this.tunnelSegments.forEach(segment => {
      segment.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    });
    
    this.renderer.dispose();
  }
}