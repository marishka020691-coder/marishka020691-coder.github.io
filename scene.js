/* Project-local procedural room. Metres; geometry follows the supplied sketch. */
window.createBedroomScene = function createBedroomScene(host, initial) {
  'use strict';
  const T = window.THREE;
  if (!T) throw new Error('Three.js did not load.');
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Объёмная схема спальни. Поворот — перетаскиванием или стрелками. Масштаб — плюс и минус. Доступен отдельный вид сверху.');
  host.replaceChildren(canvas);
  const scene = new T.Scene();
  const room = new T.Group();
  scene.add(room);
  const camera = new T.OrthographicCamera(-4, 4, 3, -3, .1, 50);
  const target = new T.Vector3(0, 1.14, 0);
  // One sphere encloses the room at every orbit angle: rotation never changes zoom.
  const framingRadius = Math.hypot(1.65, 1.33, 2.44) * 1.04;
  let palette = initial.palette;
  let currentLayout;
  let visible = true;
  let frame = 0;
  let lastFrameTime = 0;
  let userZoom = 1;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const presets = {
    overview: { theta: .70, phi: .92 },
    entrance: { theta: -.72, phi: 1.15 },
    window: { theta: 1.50, phi: 1.07 },
    top: { theta: 0, phi: .015 }
  };
  const view = { ...presets.overview };
  const goal = { ...view };

  function texture(kind) {
    const tile = document.createElement('canvas'); tile.width = 256; tile.height = 256;
    const ctx = tile.getContext('2d');
    let seed = 257;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    ctx.fillStyle = '#eee7d6'; ctx.fillRect(0, 0, 256, 256);
    if (kind === 'wood') {
      for (let i = 0; i < 1050; i++) {
        const x = random() * 256; const y = random() * 256;
        ctx.strokeStyle = `rgba(100,75,40,${random() * .11})`;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + 3, y + 25, x - 3, y + 50, x + 1, y + 85); ctx.stroke();
      }
      ctx.strokeStyle = '#a88e6d55'; ctx.lineWidth = 1;
      for (let x = 0; x < 256; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(0, 90); ctx.lineTo(64, 90); ctx.moveTo(64, 195); ctx.lineTo(128, 195); ctx.moveTo(128, 45); ctx.lineTo(192, 45); ctx.moveTo(192, 150); ctx.lineTo(256, 150); ctx.stroke();
    } else {
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 7000; i++) { ctx.fillStyle = `rgba(45,40,30,${random() * .13})`; ctx.fillRect(random() * 256, random() * 256, 1, 1); }
      ctx.strokeStyle = '#91887813';
      for (let i = 0; i < 256; i += 3) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke(); }
    }
    const map = new T.CanvasTexture(tile); map.colorSpace = T.SRGBColorSpace;
    map.wrapS = map.wrapT = T.RepeatWrapping;
    if (kind === 'wood') map.repeat.set(1.4, 1.4);
    return map;
  }
  const fabric = texture('fabric');
  const woodTexture = texture('wood');
  const throwCanvas = document.createElement('canvas'); throwCanvas.width = 512; throwCanvas.height = 512;
  const throwContext = throwCanvas.getContext('2d');
  throwContext.fillStyle = '#ecebdc'; throwContext.fillRect(0, 0, 512, 512);
  throwContext.strokeStyle = '#85867428'; throwContext.lineWidth = 1;
  for (let i = 0; i < 512; i += 4) {
    throwContext.beginPath(); throwContext.moveTo(i, 0); throwContext.lineTo(i, 512);
    throwContext.moveTo(0, i); throwContext.lineTo(512, i); throwContext.stroke();
  }
  throwContext.fillStyle = '#ffffff70';
  for (const y of [45, 58, 71, 434, 447, 460]) throwContext.fillRect(0, y, 512, 3);
  const throwTexture = new T.CanvasTexture(throwCanvas); throwTexture.colorSpace = T.SRGBColorSpace;
  for (const map of [fabric, woodTexture, throwTexture]) map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const mat = (color, extra = {}) => new T.MeshStandardMaterial({ color, roughness: .88, ...extra });
  const mirrorSystem = window.createBedroomMirrors(renderer, scene, () => windowDetails);
  const materials = {
    wall: mat(palette.wall, { side: T.FrontSide, shadowSide: T.DoubleSide }),
    trim: mat('#e5ddcb'),
    wood: mat(palette.wood, { map: woodTexture }),
    // Already owned bed: one upholstery material shared by every layout and palette.
    bed: mat(window.bedroomOwnedBed.colour, { map: fabric }),
    bedding: mat('#f6f0df', { map: fabric }),
    pillow: mat('#e4dfd1', { map: fabric }),
    bench: mat('#d2c4ad', { map: fabric }),
    mirror: mat('#bdccc4', { metalness: .12, roughness: .23 }),
    accent: mat(palette.accent, { map: fabric }),
    throw: mat(palette.accent, { map: throwTexture }),
    piping: mat('#d9d3c4'),
    wardrobe: mat('#eeeae1'),
    lampGlass: mat('#e8dfca', { side: T.DoubleSide, roughness: .55 }),
    brass: mat('#ab8b50', { metalness: .65, roughness: .4 }),
    dark: mat('#4e5147'),
    rug: mat('#e1dac8', { map: fabric }),
    curtain: mat('#d5cbb7', { map: fabric }),
    glow: mat('#fff0ce', { emissive: '#ffb75e', emissiveIntensity: .3 }),
    glass: mat('#e8f0e9', { side: T.FrontSide, emissive: '#d8e7df', emissiveIntensity: .12 })
  };

  function mesh(geometry, material, x, y, z, parent = room) {
    const item = new T.Mesh(geometry, material);
    item.position.set(x, y, z); item.castShadow = true; item.receiveShadow = true;
    parent.add(item); return item;
  }
  const box = (w, h, d, material, x, y, z, parent) => mesh(new T.BoxGeometry(w, h, d), material, x, y, z, parent);
  function roundBox(w, h, d, radius, material, x, y, z, parent) {
    // Rounded-cube projection adapted from Three.js RoundedBoxGeometry r160 (MIT).
    // See assets/vendor/Three-LICENSE.txt; keep explicit smooth normals at face seams.
    const segments = 9;
    const r = Math.min(radius, w / 2, h / 2, d / 2);
    const g = new T.BoxGeometry(1, 1, 1, segments, segments, segments);
    const positions = g.attributes.position, normals = g.attributes.normal, uvs = g.attributes.uv;
    const p = new T.Vector3(), n = new T.Vector3();
    const core = new T.Vector3(w / 2 - r, h / 2 - r, d / 2 - r);
    const halfSegment = .5 / segments;
    for (let i = 0; i < positions.count; i++) {
      const faceX = normals.getX(i), faceY = normals.getY(i);
      p.fromBufferAttribute(positions, i);
      n.set(p.x - Math.sign(p.x) * halfSegment, p.y - Math.sign(p.y) * halfSegment, p.z - Math.sign(p.z) * halfSegment).normalize();
      p.set(core.x * Math.sign(p.x) + n.x * r, core.y * Math.sign(p.y) + n.y * r, core.z * Math.sign(p.z) + n.z * r);
      positions.setXYZ(i, p.x, p.y, p.z); normals.setXYZ(i, n.x, n.y, n.z);
      if (faceX) uvs.setXY(i, p.z / d + .5, p.y / h + .5);
      else if (faceY) uvs.setXY(i, p.x / w + .5, p.z / d + .5);
      else uvs.setXY(i, p.x / w + .5, p.y / h + .5);
    }
    g.computeBoundingBox(); g.computeBoundingSphere();
    return mesh(g, material, x, y, z, parent);
  }

  const signedPower = (value, power) => Math.sign(value) * Math.abs(value) ** power;
  function cushion(name, w, h, d, material, x, z, supportHeight, tilt, roll = 0) {
    const group = new T.Group(); group.name = name; room.add(group);
    const exponent = .58, power = 2 / exponent;
    const half = new T.Vector3(w / 2, h / 2, d / 2);
    const geometry = new T.SphereGeometry(1, 40, 24);
    const positions = geometry.attributes.position, normals = geometry.attributes.normal;
    const n = new T.Vector3();
    for (let i = 0; i < positions.count; i++) {
      const px = signedPower(positions.getX(i), exponent);
      const py = signedPower(positions.getY(i), exponent);
      const pz = signedPower(positions.getZ(i), exponent);
      positions.setXYZ(i, px * half.x, py * half.y, pz * half.z);
      n.set(signedPower(px, power - 1) / half.x, signedPower(py, power - 1) / half.y, signedPower(pz, power - 1) / half.z).normalize();
      normals.setXYZ(i, n.x, n.y, n.z);
    }
    geometry.computeBoundingBox(); geometry.computeBoundingSphere();
    mesh(geometry, material, 0, 0, 0, group);
    const seam = [];
    for (let i = 0; i < 96; i++) {
      const angle = i / 96 * Math.PI * 2;
      seam.push(new T.Vector3(signedPower(Math.cos(angle), exponent) * half.x, 0, signedPower(Math.sin(angle), exponent) * half.z));
    }
    const piping = mesh(new T.TubeGeometry(new T.CatmullRomCurve3(seam, true), 96, .0018, 5, true), materials.piping, 0, 0, 0, group);
    piping.castShadow = false;
    group.position.set(x, 0, z); group.rotation.set(tilt, 0, roll);
    group.updateMatrixWorld(true);
    const bounds = new T.Box3().setFromObject(group);
    group.position.y += supportHeight - bounds.min.y + .0015;
    group.updateMatrixWorld(true);
    return group;
  }

  function duvetSurface(u, v) {
    const side = Math.abs(u), edge = Math.max(0, (side - .88) / .12);
    const end = Math.max(0, (v - .88) / .12);
    const sideAngle = edge * Math.PI / 2, endAngle = end * Math.PI / 2;
    const x = Math.sign(u) * (side <= .88 ? side / .88 * .76 : .76 + .07 * Math.sin(sideAngle));
    const z = v <= .88 ? -1.54 + v / .88 * 1.39 : -.15 + .145 * Math.sin(endAngle);
    const folds = .006 * Math.sin(v * 14 + u * 2) * Math.cos(u * 3) + .004 * Math.sin(u * 12 + v * 5);
    const drop = Math.hypot(.15 * (1 - Math.cos(sideAngle)), .15 * (1 - Math.cos(endAngle)));
    const y = .682 + folds - drop;
    const edgeBlend = Math.max(edge, end);
    const thickness = (.682 + folds - .636) * (1 - edgeBlend) + .014 * edgeBlend;
    return { x, y, z, thickness };
  }
  function cloth(name, material, uExtent = 1, vStart = 0, vEnd = 1, lift = 0, nx = 48, nz = 64) {
    const positions = [], uv = [], indices = [];
    const stride = nx + 1, count = stride * (nz + 1);
    for (let layer = 0; layer < 2; layer++) {
      for (let row = 0; row <= nz; row++) for (let column = 0; column <= nx; column++) {
        const u = (column / nx * 2 - 1) * uExtent, v = vStart + row / nz * (vEnd - vStart);
        const surface = duvetSurface(u, v);
        const thickness = name === 'bed-throw' ? .008 : surface.thickness;
        positions.push(surface.x, surface.y + lift - layer * thickness, surface.z);
        uv.push(column / nx, row / nz);
      }
    }
    for (let row = 0; row < nz; row++) for (let column = 0; column < nx; column++) {
      const a = row * stride + column, b = a + 1, c = a + stride, d = c + 1;
      indices.push(a, c, b, b, c, d, a + count, b + count, c + count, b + count, d + count, c + count);
    }
    const boundary = [];
    for (let x = 0; x <= nx; x++) boundary.push(x);
    for (let z = 1; z <= nz; z++) boundary.push(z * stride + nx);
    for (let x = nx - 1; x >= 0; x--) boundary.push(nz * stride + x);
    for (let z = nz - 1; z > 0; z--) boundary.push(z * stride);
    for (let i = 0; i < boundary.length; i++) {
      const a = boundary[i], b = boundary[(i + 1) % boundary.length];
      indices.push(a, b, a + count, b, b + count, a + count);
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
    geometry.setIndex(indices); geometry.computeVertexNormals(); geometry.computeBoundingBox(); geometry.computeBoundingSphere();
    const item = mesh(geometry, material, 0, 0, 0); item.name = name;
    item.userData = { columns: nx + 1, rows: nz + 1, vStart, vEnd, uExtent, lift };
    if (name === 'bed-throw') item.castShadow = false;
    return item;
  }
  function cylinder(top, bottom, h, material, x, y, z, parent, segments = 32) { return mesh(new T.CylinderGeometry(top, bottom, h, segments), material, x, y, z, parent); }
  function sphere(radius, material, x, y, z, parent) { return mesh(new T.SphereGeometry(radius, 20, 12), material, x, y, z, parent); }
  function lineBetween(start, end, radius, material, parent = room) {
    const a = new T.Vector3(...start), b = new T.Vector3(...end);
    const item = cylinder(radius, radius, a.distanceTo(b), material, 0, 0, 0, parent, 12);
    item.position.copy(a.add(b).multiplyScalar(.5));
    item.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(...end).sub(new T.Vector3(...start)).normalize());
    return item;
  }

  const footprint = [[-1.56, -2.365], [1.56, -2.365], [1.56, 2.365], [.51, 2.365], [.51, 2.035], [.32, 2.035], [.32, 1.065], [-1.56, 1.065]];
  const floorShape = new T.Shape();
  footprint.forEach(([x, z], i) => { if (i) floorShape.lineTo(x, -z); else floorShape.moveTo(x, -z); });
  floorShape.closePath();
  const floorGeo = new T.ExtrudeGeometry(floorShape, { depth: .14, bevelEnabled: false });
  floorGeo.rotateX(-Math.PI / 2);
  mesh(floorGeo, materials.wood, 0, -.14, 0);
  const ground = mesh(new T.PlaneGeometry(30, 30), new T.ShadowMaterial({ opacity: .14 }), 0, -.155, 0, scene);
  ground.rotation.x = -Math.PI / 2; ground.castShadow = false;

  function wallPanel(axis, from, to, y0 = 0, y1 = 2.42) {
    const width = to - from;
    if (width <= 0) return;
    const isBack = axis === 'back';
    const item = mesh(new T.PlaneGeometry(width, y1 - y0), materials.wall,
      isBack ? (from + to) / 2 : axis === 'left' ? -1.56 : 1.56,
      (y0 + y1) / 2, isBack ? -2.365 : (from + to) / 2);
    if (!isBack) item.rotation.y = axis === 'left' ? Math.PI / 2 : -Math.PI / 2;
    return item;
  }
  wallPanel('back', -1.56, 1.56);
  wallPanel('left', -2.365, -.015);
  wallPanel('left', .865, 1.065);
  wallPanel('right', -2.365, -1.155);
  wallPanel('right', -.125, .325);
  wallPanel('right', 1.355, 2.365);
  // Door preview only. Plan opening: x=0, y=235..323 cm, height 198 cm.
  // Hinges are at the 20 cm return; the leaf opens inward toward the 188 cm wall.
  const doorway = new T.Group(); doorway.name = 'entry-doorway'; room.add(doorway);
  const entryDoor = new T.Group(); entryDoor.name = 'entry-door'; room.add(entryDoor);
  const doorPaint = mat('#e7d6b9', { roughness: .85 });
  const doorPanelPaint = mat('#eddfca', { roughness: .85 });
  const doorFramePaint = mat('#f3e8d2', { roughness: .9 });
  const openingWidth = .88, openingHeight = 1.98;
  const leafWidth = .874, leafHeight = 1.966;
  const hinge = new T.Group(); hinge.name = 'entry-door-hinge';
  hinge.position.set(-1.535, 0, .862); entryDoor.add(hinge);
  const leaf = roundBox(.035, leafHeight, leafWidth, .004, doorPaint, 0, .01 + leafHeight / 2, -leafWidth / 2, hinge);
  leaf.name = 'entry-door-leaf';
  // Surface panels have physical thickness and a separate face, avoiding coplanar flicker.
  for (const side of [-1, 1]) {
    box(.007, .60, .65, doorPanelPaint, side * .021, .51, -leafWidth / 2, hinge);
    box(.007, .76, .65, doorPanelPaint, side * .021, 1.43, -leafWidth / 2, hinge);
    const handle = new T.Group(); handle.position.set(side * .022, 1.0, -.79); hinge.add(handle);
    const rose = new T.Mesh(new T.CylinderGeometry(.026, .026, .006, 24), materials.brass);
    rose.rotation.z = Math.PI / 2; handle.add(rose);
    const stem = new T.Mesh(new T.CylinderGeometry(.009, .009, .034, 16), materials.brass);
    stem.rotation.z = Math.PI / 2; stem.position.x = side * .018; handle.add(stem);
    const lever = new T.Mesh(new T.CylinderGeometry(.008, .008, .105, 16), materials.brass);
    lever.rotation.x = Math.PI / 2; lever.position.set(side * .035, 0, .0475); handle.add(lever);
  }
  for (const y of [.28, 1.0, 1.70]) {
    const pin = cylinder(.009, .009, .10, materials.brass, .018, y, 0, hinge, 16);
    pin.name = 'entry-door-hardware';
  }
  for (const z of [-.0425, .8925]) box(.075, openingHeight, .055, doorFramePaint, -1.55, openingHeight / 2, z, doorway);
  box(.075, .055, openingWidth + .11, doorFramePaint, -1.55, openingHeight + .0275, .425, doorway);
  wallPanel('left', -.015, .865, openingHeight + .055, 2.42);
  let doorVisible = initial.doorVisible !== false;
  let doorGoalOpen = Boolean(initial.doorOpen), doorAngle = doorGoalOpen ? Math.PI / 2 : 0, doorFrame = 0;
  hinge.rotation.y = -doorAngle; entryDoor.visible = doorVisible;
  function getDoorState() {
    hinge.updateWorldMatrix(true, true);
    const tip = hinge.localToWorld(new T.Vector3(0, 0, -leafWidth));
    return {
      visible: doorVisible, open: doorGoalOpen, animating: Boolean(doorFrame),
      angleDegrees: Number(T.MathUtils.radToDeg(doorAngle).toFixed(3)),
      openingWidthCm: openingWidth * 100, openingHeightCm: openingHeight * 100,
      leafWidthCm: leafWidth * 100, leafHeightCm: leafHeight * 100,
      hingePlanCm: { x: 2.5, y: 322.7 },
      freeEdgePlanCm: { x: Number((tip.x * 100 + 156).toFixed(3)), y: Number((tip.z * 100 + 236.5).toFixed(3)) },
      colour: '#' + doorPaint.color.getHexString(), bedColour: '#' + materials.bed.color.getHexString()
    };
  }
  function doorChanged() { host.dispatchEvent(new CustomEvent('room-door-change', { detail: getDoorState() })); }
  function setDoorVisible(value) {
    if (doorFrame) { cancelAnimationFrame(doorFrame); doorFrame = 0; doorAngle = doorGoalOpen ? Math.PI / 2 : 0; hinge.rotation.y = -doorAngle; }
    doorVisible = Boolean(value); entryDoor.visible = doorVisible;
    renderer.shadowMap.needsUpdate = true; requestRender(); doorChanged();
  }
  function setDoorOpen(value, animate = true) {
    if (!doorVisible) return;
    cancelAnimationFrame(doorFrame); doorFrame = 0;
    doorGoalOpen = Boolean(value);
    const start = doorAngle, end = doorGoalOpen ? Math.PI / 2 : 0;
    function apply(angle) { doorAngle = angle; hinge.rotation.y = -angle; renderer.shadowMap.needsUpdate = true; requestRender(); }
    if (!animate || reduceMotion.matches || Math.abs(start - end) < .0001) { apply(end); doorChanged(); return; }
    const began = performance.now();
    function step(now) {
      const t = Math.min(1, (now - began) / 340);
      apply(start + (end - start) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) doorFrame = requestAnimationFrame(step);
      else { doorFrame = 0; doorChanged(); }
    }
    doorFrame = requestAnimationFrame(step); doorChanged();
  }


  const windowDetails = new T.Group(); room.add(windowDetails);
  for (const [from, to] of [[-1.155, -.125], [.325, 1.355]]) {
    wallPanel('right', from, to, 0, .78); wallPanel('right', from, to, 2.08, 2.42);
    const glass = mesh(new T.PlaneGeometry(to - from, 1.3), materials.glass, 1.565, 1.43, (from + to) / 2);
    glass.rotation.y = -Math.PI / 2; glass.castShadow = false;
    box(.055, .04, to - from + .05, materials.trim, 1.53, .78, (from + to) / 2, windowDetails);
    box(.045, .035, to - from + .05, materials.trim, 1.53, 2.08, (from + to) / 2, windowDetails);
    for (const z of [from, to, (from + to) / 2]) box(.045, 1.33, .025, materials.trim, 1.53, 1.43, z, windowDetails);
    for (const z of [from - .065, to + .065]) {
      for (let i = 0; i < 4; i++) {
        cylinder(.025, .035, 2.28, materials.curtain, 1.46 + (i % 2) * .018, 1.16, z + (i - 1.5) * .037, windowDetails, 10);
      }
    }
    lineBetween([1.46, 2.30, from - .17], [1.46, 2.30, to + .17], .012, materials.trim, windowDetails);
    for (const z of [from - .15, to + .15]) box(.12, .018, .025, materials.trim, 1.50, 2.30, z, windowDetails);
    box(.05, .008, to - from, mat('#91aaa3'), 1.56, .125, (from + to) / 2);
  }
  // Hiding window trim for the cutaway must not change the light on the bedding.
  windowDetails.traverse(item => { if (item.isMesh) item.castShadow = false; });
  // Low perimeter keeps the irregular outline readable in every cutaway view.
  footprint.forEach(([x, z], i) => {
    const [nx, nz] = footprint[(i + 1) % footprint.length];
    if (x === -1.56 && nx === -1.56) {
      box(.045, .12, 2.35, materials.trim, -1.56, .06, -1.19);
      box(.045, .12, .20, materials.trim, -1.56, .06, .965);
    } else {
      const w = Math.abs(nx - x), d = Math.abs(nz - z);
      box(Math.max(w, .045), .12, Math.max(d, .045), materials.trim, (x + nx) / 2, .06, (z + nz) / 2);
    }
  });
  // Wall moulding above the original wide headboard.
  box(2.72, .018, .025, materials.trim, 0, 2.12, -2.345);
  box(2.72, .018, .025, materials.trim, 0, 1.72, -2.345);
  for (const x of [-1.36, 1.36]) box(.018, .40, .025, materials.trim, x, 1.92, -2.345);

  roundBox(2.70, 1.32, .15, .035, materials.bed, 0, .94, -2.19);
  for (let i = -7; i <= 7; i++) roundBox(.115, 1.24, .035, .012, materials.bed, i * .13, .96, -2.094);
  const bedBase = roundBox(1.72, .38, 2.12, .055, materials.bed, 0, .25, -1.075); bedBase.name = 'bed-base';
  const mattress = roundBox(1.60, .21, 2.0, .055, materials.bedding, 0, .53, -1.075); mattress.name = 'bed-mattress';
  cloth('bed-duvet', materials.bedding);
  // Reuse the duvet's grid rows so the throw stays exactly above it at every edge.
  cloth('bed-throw', materials.throw, 1, 40 / 64, 61 / 64, .012, 48, 21);
  cushion('bed-pillow-left', .66, .18, .43, materials.pillow, -.39, -1.81, .635, -.16, -.025);
  cushion('bed-pillow-right', .66, .18, .43, materials.pillow, .39, -1.81, .635, -.13, .025);
  let lumbarSupport = 0;
  for (let u = -.4; u <= .4; u += .05) for (let v = 0; v <= .25; v += .025) lumbarSupport = Math.max(lumbarSupport, duvetSurface(u, v).y);
  cushion('bed-pillow-lumbar', .50, .17, .29, materials.accent, 0, -1.39, lumbarSupport, -.08);
  const readingLights = [];
  for (const x of [-1.10, 1.10]) {
    box(.33, .16, .31, materials.dark, x, .55, -1.98);
    sphere(.015, materials.brass, x, .56, -1.815);
    const disk = cylinder(.045, .045, .014, materials.brass, x, 1.18, -2.08); disk.rotation.x = Math.PI / 2;
    lineBetween([x, 1.18, -2.06], [x, 1.07, -2.01], .008, materials.brass);
    sphere(.038, materials.glow, x, 1.055, -2.01);
    const light = new T.PointLight(0xffbd75, .5, 1.5, 2); light.position.set(x, 1.06, -1.96); room.add(light); readingLights.push(light);
  }
  // Modest bedside objects, all within the already owned wings.
  cylinder(.035, .04, .09, materials.trim, -1.10, .68, -1.98);
  box(.12, .018, .10, materials.wood, 1.10, .65, -1.98);

  // STOENSE 200 x 300 cm, with the long side running across the bed.
  const rug = roundBox(3.0, .018, 2.0, .006, materials.rug, 0, .015, -1.055);
  rug.name = 'large-rug';
  rug.receiveShadow = true;

  // Arte Sofia 100 x 55 x 182 cm: overlapping door leaves on two tracks.
  const wardrobe = new T.Group(); wardrobe.name = 'sliding-wardrobe'; room.add(wardrobe);
  // Hollow carcass: a solid box front used to coincide with the mirrored leaf.
  // Adjacent parts have separated faces; the two leaves occupy distinct tracks.
  for (const x of [.544, 1.526]) box(.018, 1.82, .55, materials.wardrobe, x, .91, 2.07, wardrobe);
  for (const y of [.009, 1.811]) box(.964, .018, .55, materials.wardrobe, 1.035, y, 2.07, wardrobe);
  box(.964, 1.784, .018, materials.wardrobe, 1.035, .91, 2.336, wardrobe);
  const rearLeaf = box(.49, 1.74, .012, materials.wardrobe, .790, .91, 1.822, wardrobe); rearLeaf.name = 'wardrobe-rear-leaf';
  const frontLeaf = box(.51, 1.74, .012, materials.mirror, 1.265, .91, 1.804, wardrobe); frontLeaf.name = 'wardrobe-front-leaf';
  mirrorSystem.create(new T.PlaneGeometry(.485, 1.70), 'wardrobe-mirror', host.clientWidth < 650 ? 256 : 512, wardrobe, [1.265, .91, 1.797], Math.PI);
  for (const y of [.035, 1.785]) for (const z of [1.798, 1.822]) box(.96, .012, .006, materials.dark, 1.035, y, z, wardrobe);
  for (const x of [1.025, 1.505]) box(.012, .20, .012, materials.dark, x, .94, 1.794, wardrobe);

  // Cossington 33 cm uplighter, 25 cm overall drop. Bowl is open at the top.
  const uplighter = new T.Group(); uplighter.name = 'ceiling-uplighter'; room.add(uplighter);
  cylinder(.055, .055, .018, materials.brass, 0, 2.411, -.65, uplighter);
  lineBetween([0, 2.40, -.65], [0, 2.18, -.65], .008, materials.brass, uplighter);
  const bowlProfile = [[0,0],[.035,.004],[.075,.020],[.115,.047],[.148,.083],[.165,.11],[.158,.11],[.141,.085],[.110,.052],[.071,.027],[.032,.012],[0,.010]].map(([x,y]) => new T.Vector2(x,y));
  mesh(new T.LatheGeometry(bowlProfile, 48), materials.lampGlass, 0, 2.17, -.65, uplighter);
  const rim = mesh(new T.TorusGeometry(.162, .003, 8, 48), materials.brass, 0, 2.28, -.65, uplighter); rim.rotation.x = Math.PI / 2;
  for (const x of [-.06,.06]) {
    cylinder(.012, .012, .025, materials.brass, x, 2.215, -.65, uplighter);
    sphere(.024, materials.glow, x, 2.25, -.65, uplighter);
  }
  uplighter.traverse(item => { if (item.isMesh) item.castShadow = false; });
  const downlighter = new T.Group(); downlighter.name = 'ceiling-downlighter'; room.add(downlighter);
  cylinder(.055, .055, .018, materials.brass, 0, 2.411, -.65, downlighter);
  lineBetween([0, 2.40, -.65], [0, 2.28, -.65], .008, materials.brass, downlighter);
  const downProfile = [[.028,.11],[.065,.105],[.11,.075],[.15,.025],[.165,0],[.158,0],[.144,.027],[.105,.072],[.06,.098],[.028,.103]].map(([x,y]) => new T.Vector2(x,y));
  mesh(new T.LatheGeometry(downProfile, 48), materials.brass, 0, 2.17, -.65, downlighter);
  cylinder(.157, .157, .008, materials.lampGlass, 0, 2.177, -.65, downlighter);
  downlighter.traverse(item => { if (item.isMesh) item.castShadow = false; });
  let currentFixture = initial.fixture === 'down' ? 'down' : 'up';
  function setFixture(value) {
    currentFixture = value === 'down' ? 'down' : 'up';
    uplighter.visible = currentFixture === 'up'; downlighter.visible = currentFixture === 'down';
    ceiling.position.y = currentFixture === 'down' ? 2.13 : 2.30;
    renderer.shadowMap.needsUpdate = true; requestRender();
  }

  const extraFurniture = new T.Group(); extraFurniture.name = 'layout-furniture'; room.add(extraFurniture);
  function disposeGroup(group) {
    group.traverse(item => { if (item.getRenderTarget) item.dispose(); else if (item.geometry) item.geometry.dispose(); });
    group.clear();
  }
  function setLayout(layout) {
    if (layout === currentLayout) return;
    currentLayout = layout;
    disposeGroup(extraFurniture);
    if (layout === 'work') {
      // MICKE 73 x 50 cm, turned against the right window wall.
      box(.50, .035, .73, materials.wardrobe, 1.31, .75, .80, extraFurniture);
      box(.45, .14, .68, materials.wardrobe, 1.31, .66, .80, extraFurniture);
      for (const x of [1.10, 1.50]) for (const z of [.49, 1.11]) box(.025, .72, .025, materials.wardrobe, x, .36, z, extraFurniture);
      roundBox(.42, .09, .42, .025, materials.accent, .76, .44, .80, extraFurniture);
      for (const x of [.60, .92]) for (const z of [.64, .96]) box(.023, .40, .023, materials.wood, x, .20, z, extraFurniture);
      box(.18, .01, .24, materials.dark, 1.27, .775, .80, extraFurniture);
    } else if (layout === 'read') {
      roundBox(.64, .26, .66, .075, materials.accent, 1.08, .39, .855, extraFurniture);
      roundBox(.64, .49, .15, .045, materials.accent, 1.08, .65, 1.18, extraFurniture);
      for (const x of [.80, 1.36]) roundBox(.12, .24, .66, .035, materials.accent, x, .57, .86, extraFurniture);
      for (const x of [.86, 1.30]) for (const z of [.63, 1.09]) { const leg = cylinder(.017, .012, .26, materials.wood, x, .13, z, extraFurniture, 12); leg.rotation.z = x > 1 ? -.08 : .08; }
      cylinder(.14, .18, .22, materials.bedding, 1.19, 1.29, .235, extraFurniture);
      lineBetween([1.19, .04, .235], [1.19, 1.20, .235], .012, materials.brass, extraFurniture);
      cylinder(.16, .16, .022, materials.brass, 1.19, .02, .235, extraFurniture);
    } else if (layout === 'vanity') {
      // D: Argos HOMCOM bench 95 x 38 cm; seat H45 cm, 4 cm from the bed.
      const bench = new T.Group(); bench.name = 'layout-d-bench'; extraFurniture.add(bench);
      roundBox(.95, .19, .38, .028, materials.bench, 0, .295, .215, bench);
      roundBox(.95, .06, .38, .025, materials.bench, 0, .42, .215, bench);
      for (const x of [-.38, .38]) for (const z of [.075, .355]) cylinder(.022, .016, .20, materials.dark, x, .10, z, bench, 12);

      // Table follows the second right-hand window: 75 x 40 cm, 75 cm high.
      const vanity = new T.Group(); vanity.name = 'layout-d-vanity'; extraFurniture.add(vanity);
      roundBox(.40, .035, .75, .008, materials.wood, 1.36, .7325, .87, vanity);
      box(.37, .105, .69, materials.wood, 1.36, .6675, .87, vanity);
      for (const x of [1.19, 1.53]) for (const z of [.535, 1.205]) box(.025, .715, .025, materials.wood, x, .3575, z, vanity);
      sphere(.011, materials.brass, 1.162, .665, .87, vanity);

      // Upright tabletop mirror, seen edge-on in the matching floor plan.
      cylinder(.058, .058, .012, materials.brass, 1.49, .756, .985, vanity);
      lineBetween([1.49, .762, .985], [1.49, 1.125, .985], .006, materials.brass, vanity);
      const mirrorFrame = cylinder(.20, .20, .014, materials.brass, 1.49, 1.125, .985, vanity, 48);
      mirrorFrame.rotation.z = Math.PI / 2;
      mirrorSystem.create(new T.CircleGeometry(.187, 48), 'vanity-mirror', host.clientWidth < 650 ? 128 : 256, vanity, [1.481, 1.125, .985], -Math.PI / 2);
      const mirrorBack = mesh(new T.CircleGeometry(.187, 48), materials.brass, 1.499, 1.125, .985, vanity);
      mirrorBack.rotation.y = Math.PI / 2;
      box(.13, .009, .18, materials.trim, 1.34, .7545, .67, vanity);
      cylinder(.018, .018, .075, materials.glass, 1.34, .7965, .625, vanity, 16);
      cylinder(.012, .012, .015, materials.brass, 1.34, .8415, .625, vanity, 16);
      cylinder(.02, .02, .06, materials.bedding, 1.34, .789, .71, vanity, 16);
      cylinder(.012, .012, .012, materials.brass, 1.34, .825, .71, vanity, 16);

      const stool = new T.Group(); stool.name = 'layout-d-stool'; extraFurniture.add(stool);
      roundBox(.34, .38, .34, .035, materials.bench, 1.35, .23, .87, stool);
      roundBox(.34, .045, .34, .012, materials.bench, 1.35, .4325, .87, stool);
      for (const x of [1.24, 1.46]) for (const z of [.76, .98]) cylinder(.014, .014, .04, materials.wood, x, .02, z, stool, 10);
    }
    renderer.shadowMap.needsUpdate = true;
    requestRender();
  }

  const ambient = new T.HemisphereLight(0xfff5e2, 0x8d9077, 2.0); scene.add(ambient);
  const sun = new T.DirectionalLight(0xfff0ce, 3.2); sun.position.set(5, 6, 1); sun.castShadow = true;
  const shadowSize = host.clientWidth > 700 ? 2048 : 1024;
  sun.shadow.mapSize.set(shadowSize, shadowSize); sun.shadow.camera.left = -5; sun.shadow.camera.right = 5; sun.shadow.camera.top = 5; sun.shadow.camera.bottom = -5; sun.shadow.normalBias = .008; sun.shadow.bias = -.0002; scene.add(sun);
  const ceiling = new T.PointLight(0xffc17d, 0, 7, 2); ceiling.position.set(0, 2.30, -.65); scene.add(ceiling);
  const fill = new T.DirectionalLight(0xffffff, .45); fill.position.set(-4, 3, 5); scene.add(fill);

  let currentLight = initial.light;
  let exposure = ['north', 'south'].includes(initial.exposure) ? initial.exposure : 'unknown';
  const daylight = {
    unknown: { sky: 0xfff5e2, sun: 0xfff0ce, ambient: 2.0, direct: 3.2, fill: .45 },
    north: { sky: 0xdde8f1, sun: 0xe7edf4, ambient: 1.65, direct: .45, fill: .65 },
    south: { sky: 0xfff4df, sun: 0xffe9bc, ambient: 2.0, direct: 3.4, fill: .4 }
  };
  function setLight(value) {
    currentLight = value;
    const night = value === 'evening';
    const daylightPreset = daylight[exposure];
    ambient.color.set(night ? 0xfff5e2 : daylightPreset.sky);
    sun.color.set(night ? 0xfff0ce : daylightPreset.sun);
    ambient.intensity = night ? .55 : daylightPreset.ambient;
    sun.intensity = night ? .10 : daylightPreset.direct;
    fill.intensity = night ? .15 : daylightPreset.fill;
    ceiling.intensity = night ? 7 : .3;
    readingLights.forEach(light => { light.intensity = night ? 2.2 : .3; });
    materials.glow.emissiveIntensity = night ? 2.8 : .3;
    materials.glass.emissiveIntensity = night ? .01 : .12;
    renderer.toneMappingExposure = night ? 1.2 : 1.12;
    renderer.shadowMap.needsUpdate = true;
    requestRender();
  }
  function setExposure(value) {
    exposure = Object.hasOwn(daylight, value) ? value : 'unknown';
    setLight(currentLight);
  }
  function setPalette(next) {
    palette = next;
    materials.wall.color.set(palette.wall);
    materials.accent.color.set(palette.accent);
    materials.throw.color.set(palette.accent);
    materials.wood.color.set(palette.wood);
    materials.curtain.color.set(palette.curtain || '#d5cbb7');
    requestRender();
  }

  function placeCamera() {
    const r = 11;
    camera.position.set(r * Math.sin(view.phi) * Math.sin(view.theta), r * Math.cos(view.phi) + target.y, r * Math.sin(view.phi) * Math.cos(view.theta));
    camera.lookAt(target); camera.updateMatrixWorld();
    windowDetails.visible = camera.position.x < 1.5;
    const aspect = Math.max(.1, host.clientWidth / Math.max(1, host.clientHeight));
    const half = framingRadius / Math.min(1, aspect) / userZoom;
    camera.left = -half * aspect; camera.right = half * aspect;
    camera.top = half; camera.bottom = -half; camera.updateProjectionMatrix();
  }
  function draw(time) {
    frame = 0;
    if (!visible) return;
    const elapsed = lastFrameTime ? Math.min(64, time - lastFrameTime) : 1000 / 60;
    lastFrameTime = time;
    const moving = Math.abs(view.theta - goal.theta) + Math.abs(view.phi - goal.phi) > .002;
    const blend = 1 - Math.exp(-elapsed / 70);
    if (moving && !reduceMotion.matches) { view.theta += (goal.theta - view.theta) * blend; view.phi += (goal.phi - view.phi) * blend; }
    else { view.theta = goal.theta; view.phi = goal.phi; }
    placeCamera(); renderer.render(scene, camera);
    if (moving && !reduceMotion.matches) frame = requestAnimationFrame(draw);
  }
  function requestRender() { if (!frame && visible) { lastFrameTime = 0; frame = requestAnimationFrame(draw); } }
  function resize() {
    const width = host.clientWidth, height = host.clientHeight;
    if (width && height) { renderer.setSize(width, height, false); requestRender(); }
  }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host);
  function setCamera(preset) {
    if (!presets[preset]) return;
    goal.theta = view.theta + Math.atan2(Math.sin(presets[preset].theta - view.theta), Math.cos(presets[preset].theta - view.theta));
    goal.phi = presets[preset].phi; requestRender();
  }
  function resetCamera() { userZoom = 1; notifyZoom(); setCamera('overview'); }
  function captureViews(width = 960) {
    const height = Math.round(width * .75);
    const renderTarget = new T.WebGLRenderTarget(width, height);
    renderTarget.texture.colorSpace = T.SRGBColorSpace;
    const previousTarget = renderer.getRenderTarget(), previousDetails = windowDetails.visible;
    const snapshotCamera = camera.clone();
    const pixels = new Uint8Array(width * height * 4), flipped = new Uint8ClampedArray(pixels.length);
    const output = document.createElement('canvas'); output.width = width; output.height = height;
    const context = output.getContext('2d');
    const results = [];
    const half = framingRadius, aspect = width / height;
    snapshotCamera.left = -half * aspect; snapshotCamera.right = half * aspect;
    snapshotCamera.top = half; snapshotCamera.bottom = -half; snapshotCamera.updateProjectionMatrix();
    try {
      for (const theta of [-.85, Math.PI + .55, 1.50, .55]) {
        const phi = .94, r = 11;
        snapshotCamera.position.set(r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi) + target.y, r * Math.sin(phi) * Math.cos(theta));
        snapshotCamera.lookAt(target); snapshotCamera.updateMatrixWorld();
        windowDetails.visible = snapshotCamera.position.x < 1.5;
        renderer.setRenderTarget(renderTarget); renderer.render(scene, snapshotCamera);
        renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixels);
        for (let row = 0; row < height; row++) flipped.set(pixels.subarray(row * width * 4, (row + 1) * width * 4), (height - row - 1) * width * 4);
        context.putImageData(new ImageData(flipped, width, height), 0, 0);
        context.globalCompositeOperation = 'destination-over';
        context.fillStyle = currentLight === 'evening' ? '#4a5144' : '#eeeee5'; context.fillRect(0, 0, width, height);
        context.globalCompositeOperation = 'source-over';
        results.push(output.toDataURL('image/webp', .9));
      }
      return results;
    } finally {
      renderer.setRenderTarget(previousTarget); windowDetails.visible = previousDetails;
      renderTarget.dispose(); requestRender();
    }
  }
  function notifyZoom() { host.dispatchEvent(new CustomEvent('room-zoom-change', { detail: Math.round(userZoom * 100) })); }
  function zoomBy(delta) { userZoom = Math.max(.75, Math.min(1.65, userZoom + delta)); notifyZoom(); requestRender(); }
  function customView() { host.dispatchEvent(new Event('room-camera-custom')); }
  let pointer = null;
  canvas.addEventListener('pointerdown', event => { if (event.button !== 0) return; pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, theta: goal.theta, phi: goal.phi, dragging: false, touch: event.pointerType === 'touch' }; });
  canvas.addEventListener('pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    if (!pointer.dragging) {
      if (pointer.touch && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) { pointer = null; return; }
      if (Math.abs(dx) + Math.abs(dy) < 6) return;
      pointer.dragging = true; canvas.setPointerCapture(event.pointerId); customView();
    }
    goal.theta = pointer.theta - dx * .008;
    goal.phi = Math.max(.03, Math.min(1.38, pointer.phi - (pointer.touch ? 0 : dy * .006)));
    requestRender();
  });
  function endPointer(event) { if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); pointer = null; }
  canvas.addEventListener('pointerup', endPointer); canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', '_', 'Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') {
      resetCamera(); host.dispatchEvent(new CustomEvent('room-camera-preset', { detail: 'overview' })); return;
    }
    if (event.key === 'ArrowLeft') goal.theta -= .16;
    if (event.key === 'ArrowRight') goal.theta += .16;
    if (event.key === 'ArrowUp') goal.phi = Math.max(.03, goal.phi - .12);
    if (event.key === 'ArrowDown') goal.phi = Math.min(1.38, goal.phi + .12);
    if (['+', '='].includes(event.key)) zoomBy(.1);
    if (['-', '_'].includes(event.key)) zoomBy(-.1);
    customView(); requestRender();
  });
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); cancelAnimationFrame(doorFrame); doorFrame = 0; cancelAnimationFrame(frame); frame = 0; visible = false; host.dispatchEvent(new Event('room-context-lost')); });
  const visibilityObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting) && visible) requestRender();
  }); visibilityObserver.observe(host);
  setLayout(initial.layout); setPalette(initial.palette); setLight(initial.light); setFixture(currentFixture); resize();
  return {
    setLayout, setPalette, setLight, setExposure, setFixture, setCamera, resetCamera, captureViews, zoomBy,
    setDoorVisible, setDoorOpen, getDoorState, getMirrorState: mirrorSystem.getState,
    setVisible(value) { visible = value; if (value) { resize(); requestRender(); } else { cancelAnimationFrame(frame); frame = 0; } }
  };
};
