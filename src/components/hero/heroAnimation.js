import * as THREE from 'three';

export class HeroAnimation {
  constructor(mountRef, mouseRef) {
    this.mountRef = mountRef;
    this.mouseRef = mouseRef;
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.nodes = [];
    this.edgePool = [];
    this.activeEdges = [];
    this.yellowMarks = [];
    this.animationId = null;
    this.frameCount = 0;
    this.clock = new THREE.Clock();
  }

  init() {
    this.setupScene();
    this.createNodes();
    this.createEdgePool();
    this.createYellowMarkGeometry();
    this.setupEventListeners();
    this.animate();
  }

  setupScene() {
    // Scene setup
    this.scene = new THREE.Scene();

    // Camera setup (orthographic for 2D feel)
    this.camera = new THREE.OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      1,
      1000
    );
    this.camera.position.z = 500;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); 
    this.mountRef.current.appendChild(this.renderer.domElement);
    
    // Create multiple scenes for different blur levels
    this.blurScenes = [];
    this.blurRenderers = [];
    
    for (let i = 0; i < 4; i++) { // 4 different blur levels
      const blurScene = new THREE.Scene();
      const blurRenderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true
      });
      blurRenderer.setSize(window.innerWidth, window.innerHeight);
      blurRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      
      const canvas = blurRenderer.domElement;
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.filter = `blur(${0.5 + i * 0.6}px)`;
      
      this.mountRef.current.appendChild(canvas);
      this.blurScenes.push(blurScene);
      this.blurRenderers.push(blurRenderer);
    }
  }

  createNodes() {
    const nodeCount = 30; // Increased for more density
    
    for (let i = 0; i < nodeCount; i++) {
      const baseSize = 2;
      const randomSize = baseSize + Math.random() * 3; // Smaller, more precise dots
      const nodeGeometry = new THREE.CircleGeometry(randomSize, 6); // Fewer segments for sharper edges
      const nodeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xcccccc, // Light gray color
        transparent: true,
        opacity: 0.9
      });
      
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.x = (Math.random() - 0.5) * window.innerWidth;
      node.position.y = (Math.random() - 0.5) * window.innerHeight;
      node.position.z = 0;
      
      // Determine blur level based on size and add to appropriate scene
      const blurLevel = Math.floor((randomSize - 2) / 0.75); // 0-3 blur levels
      const clampedBlurLevel = Math.min(Math.max(blurLevel, 0), 3);
      
      // Store velocity for movement
      node.userData = {
        velocity: new THREE.Vector2(
          (Math.random() - 0.5) * 0.1, // Slower, more deliberate movement
          (Math.random() - 0.5) * 0.1
        ),
        originalPosition: node.position.clone(),
        pulseOffset: Math.random() * Math.PI * 2,
        baseSize: randomSize,
        explosionVelocity: new THREE.Vector2(0, 0),
        isExploding: false,
        markedForExplosion: false,
        blurLevel: clampedBlurLevel
      };
      
      this.blurScenes[clampedBlurLevel].add(node);
      this.nodes.push(node);
    }
  }

  createEdgePool() {
    const maxEdges = 60; // More edges for denser connections
    
    for (let i = 0; i < maxEdges; i++) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(6);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const material = new THREE.LineBasicMaterial({
        color: 0x1a1a1a,
        transparent: true,
        opacity: 0
      });
      
      const line = new THREE.Line(geometry, material);
      this.scene.add(line); // Keep edges in main scene
      this.edgePool.push(line);
    }
  }

  createYellowMarkGeometry() {
    // Brutalist square marks instead of circles
    this.markGeometry = new THREE.PlaneGeometry(12, 12); // Square marks
    this.markMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x8a8a6b, // Grayish yellow/olive color
      transparent: true,
      opacity: 0.7
    });
  }

  setupEventListeners() {
    // Mouse movement handler
    let mouseUpdateCounter = 0;
    this.handleMouseMove = (event) => {
      mouseUpdateCounter++;
      if (mouseUpdateCounter % 2 === 0) {
        this.mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      }
    };

    this.handleResize = () => {
      this.camera.left = window.innerWidth / -2;
      this.camera.right = window.innerWidth / 2;
      this.camera.top = window.innerHeight / 2;
      this.camera.bottom = window.innerHeight / -2;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('resize', this.handleResize);
  }

  animate = () => {
    this.frameCount++;
    const elapsedTime = this.clock.getElapsedTime();
    
    // Mouse position in world coordinates
    const mouseWorld = new THREE.Vector3(
      this.mouseRef.current.x * window.innerWidth / 2,
      this.mouseRef.current.y * window.innerHeight / 2,
      0
    );

    // Check for cursor-triggered explosions
    if (this.frameCount % 15 === 0) { // Less frequent checks for more deliberate explosions
      this.checkCursorExplosion(mouseWorld);
    }

    this.updateNodes(elapsedTime, mouseWorld);
    this.updateEdges(mouseWorld);

    // Render all blur scenes
    this.blurScenes.forEach((blurScene, index) => {
      this.blurRenderers[index].render(blurScene, this.camera);
    });
    
    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(this.animate);
  }

  updateNodes(elapsedTime, mouseWorld) {
    this.nodes.forEach((node) => {
      if (node.userData.isExploding) {
        // Explosion behavior - more linear and aggressive
        node.position.x += node.userData.explosionVelocity.x;
        node.position.y += node.userData.explosionVelocity.y;
        
        // Sharp fade out
        node.material.opacity *= 0.92;
        
        // Maintain size during explosion for brutalist effect
        node.scale.setScalar(1);
        
        // Remove node when completely faded
        if (node.material.opacity < 0.01) {
          this.blurScenes[node.userData.blurLevel].remove(node);
          const index = this.nodes.indexOf(node);
          if (index > -1) {
            this.nodes.splice(index, 1);
          }
        }
        
        return;
      }
      
      // Rigid, grid-like movement
      node.position.x += node.userData.velocity.x;
      node.position.y += node.userData.velocity.y;

      // Hard boundary checks
      if (Math.abs(node.position.x) > window.innerWidth / 2) {
        node.userData.velocity.x *= -1; // Hard bounce
        node.position.x = Math.sign(node.position.x) * window.innerWidth / 2;
      }
      if (Math.abs(node.position.y) > window.innerHeight / 2) {
        node.userData.velocity.y *= -1; // Hard bounce
        node.position.y = Math.sign(node.position.y) * window.innerHeight / 2;
      }

      // Magnetic mouse attraction - more aggressive
      const distanceToMouse = node.position.distanceTo(mouseWorld);
      if (distanceToMouse < 250 && distanceToMouse > 15) {
        const force = (250 - distanceToMouse) / 250;
        const direction = new THREE.Vector3()
          .subVectors(mouseWorld, node.position)
          .normalize();
        
        // Stronger attraction
        node.position.x += direction.x * force * 1.2;
        node.position.y += direction.y * force * 1.2;
      }

      // Minimal pulsing - more static brutalist feel
      if (this.frameCount % 5 === 0) {
        const pulse = Math.sin(elapsedTime * 0.5 + node.userData.pulseOffset) * 0.05 + 0.95;
        node.material.opacity = pulse * 0.9; // Higher opacity
        node.scale.setScalar(1); // Keep constant size
      }
    });
  }

  updateEdges(mouseWorld) {
    if (this.frameCount % 3 === 0) { // Update edges less frequently
      // Reset all edges
      this.activeEdges.forEach(edge => {
        edge.material.opacity = 0;
      });
      this.activeEdges.length = 0;

      let edgeIndex = 0;
      
      for (let i = 0; i < this.nodes.length && edgeIndex < this.edgePool.length; i++) {
        for (let j = i + 1; j < this.nodes.length && edgeIndex < this.edgePool.length; j++) {
          const distance = this.nodes[i].position.distanceTo(this.nodes[j].position);
          
          // Check if either node is near mouse
          const distToMouseA = this.nodes[i].position.distanceTo(mouseWorld);
          const distToMouseB = this.nodes[j].position.distanceTo(mouseWorld);
          const nearMouse = distToMouseA < 180 || distToMouseB < 180;
          
          const maxDistance = nearMouse ? 160 : 80; // Shorter, more precise connections
          
          if (distance < maxDistance) {
            const edge = this.edgePool[edgeIndex];
            const positions = edge.geometry.attributes.position.array;
            
            // Update positions
            positions[0] = this.nodes[i].position.x;
            positions[1] = this.nodes[i].position.y;
            positions[2] = this.nodes[i].position.z;
            positions[3] = this.nodes[j].position.x;
            positions[4] = this.nodes[j].position.y;
            positions[5] = this.nodes[j].position.z;
            
            edge.geometry.attributes.position.needsUpdate = true;
            
            // Sharp opacity transitions
            const opacity = nearMouse 
              ? (1 - distance / maxDistance) * 0.5
              : (1 - distance / maxDistance) * 0.2;
            
            edge.material.opacity = opacity;
            this.activeEdges.push(edge);
            edgeIndex++;
          }
        }
      }
    }
  }

  checkCursorExplosion(mousePos) {
    // Find nodes close to cursor
    const nearbyNodes = this.nodes.filter(node => 
      !node.userData.isExploding && 
      node.position.distanceTo(mousePos) < 80 // Tighter explosion radius
    );

    if (nearbyNodes.length < 4) return; // Need more nodes for brutalist effect

    // Check if these nodes are connected
    const connectedNodes = [];
    nearbyNodes.forEach(nodeA => {
      nearbyNodes.forEach(nodeB => {
        if (nodeA !== nodeB) {
          const distance = nodeA.position.distanceTo(nodeB.position);
          if (distance < 100) {
            if (!connectedNodes.includes(nodeA)) connectedNodes.push(nodeA);
            if (!connectedNodes.includes(nodeB)) connectedNodes.push(nodeB);
          }
        }
      });
    });

    // Trigger explosion with lower probability for more impact
    if (connectedNodes.length >= 4 && Math.random() > 0.985) { // 1.5% chance
      this.triggerCursorExplosion(connectedNodes);
    }
  }

  triggerCursorExplosion(nodesToExplode) {
    nodesToExplode.forEach((node) => {
      // Create brutalist square mark at node position
      const mark = new THREE.Mesh(this.markGeometry, this.markMaterial.clone());
      mark.position.copy(node.position);
      mark.rotation.z = Math.random() * Math.PI; // Random rotation for brutalist feel
      this.scene.add(mark);
      this.yellowMarks.push(mark);
      
      // Longer-lasting marks
      setTimeout(() => {
        const fadeInterval = setInterval(() => {
          mark.material.opacity *= 0.98; // Slower fade
          if (mark.material.opacity < 0.01) {
            this.scene.remove(mark);
            const index = this.yellowMarks.indexOf(mark);
            if (index > -1) this.yellowMarks.splice(index, 1);
            clearInterval(fadeInterval);
          }
        }, 100); // Slower fade interval
      }, 500); // Wait longer before fading
      
      // Set node to exploding
      node.userData.isExploding = true;
      
      // Calculate explosion direction from cursor - more aggressive
      const direction = new THREE.Vector2(
        node.position.x - this.mouseRef.current.x * window.innerWidth / 2,
        node.position.y - this.mouseRef.current.y * window.innerHeight / 2
      ).normalize();
      
      // Set explosion velocity - more forceful
      const explosionForce = 4 + Math.random() * 6;
      node.userData.explosionVelocity = direction.multiplyScalar(explosionForce);
    });
  }

  dispose() {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('resize', this.handleResize);
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.mountRef.current && this.renderer.domElement) {
      this.mountRef.current.removeChild(this.renderer.domElement);
    }
    
    // Dispose blur renderers
    this.blurRenderers.forEach((blurRenderer, index) => {
      if (this.mountRef.current && blurRenderer.domElement) {
        this.mountRef.current.removeChild(blurRenderer.domElement);
      }
      blurRenderer.dispose();
    });
    
    this.renderer.dispose();
    
    // Dispose geometries and materials
    this.nodes.forEach(node => {
      node.geometry.dispose();
      node.material.dispose();
    });
    
    this.edgePool.forEach(edge => {
      edge.geometry.dispose();
      edge.material.dispose();
    });

    this.yellowMarks.forEach(mark => {
      mark.geometry.dispose();
      mark.material.dispose();
    });
  }
}