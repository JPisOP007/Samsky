// Drone viewer: loads a 3D model into #drone-canvas using Three.js
(function(){
  const canvas = document.getElementById('drone-canvas');
  if (!canvas) return;

  const loadingUI = document.getElementById('model-loading-ui');
  const loadingFill = document.getElementById('loading-fill');
  const loadingText = document.getElementById('loading-text');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(canvas.clientWidth || 800, canvas.clientHeight || 600, false);

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 2000);
  camera.position.set(0, 0.8, 2.4);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
  hemi.position.set(0, 1, 0);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 10, 7.5);
  scene.add(dir);

  const ambient = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambient);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0,0.2,0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.9;

  let modelGroup = new THREE.Group();
  scene.add(modelGroup);

  function updateLoading(pct, text) {
    if (loadingFill) loadingFill.style.width = pct + '%';
    if (loadingText && text) loadingText.textContent = text;
  }

  function showLoaded() {
    if (loadingUI) loadingUI.style.display = 'none';
  }

  function handleError(err) {
    console.error('Model load error', err);
    if (loadingText) loadingText.textContent = 'Failed to load model';
  }

  function fitCameraToObject( camera, object, offset = 1.25 ) {
    const box = new THREE.Box3().setFromObject( object );
    const size = box.getSize( new THREE.Vector3() );
    const center = box.getCenter( new THREE.Vector3() );

    const maxSize = Math.max( size.x, size.y, size.z );
    const fitHeightDistance = maxSize / ( 2 * Math.atan( Math.PI * camera.fov / 360 ) );
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = offset * Math.max( fitHeightDistance, fitWidthDistance );

    camera.position.set(center.x, center.y, center.z + distance);
    camera.lookAt(center);
    controls.target.copy(center);
    controls.update();
  }

  // Prefer GLB (drone.glb) if available — dynamically load GLTFLoader; otherwise fall back to OBJ loader.
  (async function chooseLoader(){
    const tryGLB = new URL('./drone.glb', document.baseURI).href;
    const tryOBJ = new URL('./uploads_files_4125317_DJI+Phantom+3+Quadcopter.obj', document.baseURI).href;

    // Test existence of GLB
    try {
      const res = await fetch(tryGLB, { method: 'HEAD' });
      if (res.ok) {
        // load GLTFLoader script then load glb
        const gltfUrl = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = gltfUrl; s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
        });
        const loader = new THREE.GLTFLoader();
        loader.load(tryGLB, (gltf) => {
          modelGroup.clear();
          modelGroup.add(gltf.scene);
          fitCameraToObject(camera, gltf.scene, 1.4);
          updateLoading(100, 'Model loaded');
          showLoaded();
        }, (xhr) => {
          const pct = xhr.total ? Math.min(99, Math.round((xhr.loaded / xhr.total) * 100)) : 50;
          updateLoading(pct, 'Loading drone model…');
        }, (err)=>{ handleError(err); });
        return;
      }
    } catch(e){ /* ignore */ }

    // Fallback to OBJ
    try {
      const res2 = await fetch(tryOBJ, { method: 'HEAD' });
      if (res2.ok) {
        const objLoader = new THREE.OBJLoader();
        objLoader.load(tryOBJ, (obj) => {
          modelGroup.clear();
          // basic material
          obj.traverse((c) => { if (c.isMesh) c.material = new THREE.MeshStandardMaterial({ color: 0xdddddd }); });
          modelGroup.add(obj);
          fitCameraToObject(camera, obj, 1.2);
          updateLoading(100, 'Model loaded');
          showLoaded();
        }, (xhr) => {
          const pct = xhr.total ? Math.min(99, Math.round((xhr.loaded / xhr.total) * 100)) : 50;
          updateLoading(pct, 'Loading drone model…');
        }, (err)=>{ handleError(err); });
        return;
      }
    } catch(e) { /* ignore */ }

    // Neither model found
    updateLoading(100, 'No model file found (drone.glb / .obj)');
  })();

  // handle resize
  function resize() {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth || 800;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight || 600;
    renderer.setSize(w, h, false);
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
})();
