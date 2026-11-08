/* Planar reflections for the project's orthographic camera. Three.js r160, MIT.
   Projection approach: https://github.com/mrdoob/three.js/blob/r160/examples/jsm/objects/Reflector.js
   World-space clipping also supports orthographic projections without perspective-only oblique math. */
window.createBedroomMirrors = function createBedroomMirrors(renderer, scene, getWindowDetails) {
  'use strict';
  const T = window.THREE, mirrors = new Set();
  let rendering = false;
  function create(geometry, name, size, parent, position, rotationY) {
    const target = new T.WebGLRenderTarget(size, size);
    const textureMatrix = new T.Matrix4();
    const material = new T.ShaderMaterial({
      uniforms: { reflection: { value: target.texture }, textureMatrix: { value: textureMatrix } },
      vertexShader: `uniform mat4 textureMatrix; varying vec4 mirrorUv;
        void main(){mirrorUv=textureMatrix*vec4(position,1.0);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `uniform sampler2D reflection; varying vec4 mirrorUv;
        void main(){vec3 reflected=texture2DProj(reflection,mirrorUv).rgb;
          gl_FragColor=vec4(reflected*vec3(.96,.98,.98),1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
    });
    const surface = new T.Mesh(geometry, material);
    surface.name = name; surface.position.set(...position); surface.rotation.y = rotationY;
    surface.castShadow = false; surface.receiveShadow = false;
    const record = { surface, target, size, updates: 0 }; mirrors.add(record); parent.add(surface);
    const plane = new T.Plane(), origin = new T.Vector3(), normal = new T.Vector3(), eye = new T.Vector3();
    const forward = new T.Vector3(), up = new T.Vector3(), direction = new T.Vector3();
    const rotation = new T.Matrix4();
    let reflectedCamera;
    function reflectPoint(point) { return point.addScaledVector(normal, -2 * plane.distanceToPoint(point)); }
    surface.onBeforeRender = function (_, world, camera) {
      if (rendering) return;
      origin.setFromMatrixPosition(surface.matrixWorld);
      rotation.extractRotation(surface.matrixWorld);
      normal.set(0, 0, 1).applyMatrix4(rotation).normalize();
      eye.setFromMatrixPosition(camera.matrixWorld);
      if (direction.subVectors(eye, origin).dot(normal) <= .00001) return;
      plane.setFromNormalAndCoplanarPoint(normal, origin);
      if (!reflectedCamera || reflectedCamera.type !== camera.type) reflectedCamera = camera.clone();
      else reflectedCamera.copy(camera);
      camera.getWorldDirection(forward); forward.add(eye); reflectPoint(forward);
      reflectPoint(eye); reflectedCamera.position.copy(eye);
      up.set(0, 1, 0).transformDirection(camera.matrixWorld).reflect(normal);
      reflectedCamera.up.copy(up); reflectedCamera.lookAt(forward); reflectedCamera.updateMatrixWorld();
      textureMatrix.set(.5,0,0,.5, 0,.5,0,.5, 0,0,.5,.5, 0,0,0,1);
      textureMatrix.multiply(reflectedCamera.projectionMatrix).multiply(reflectedCamera.matrixWorldInverse).multiply(surface.matrixWorld);
      const previousTarget = renderer.getRenderTarget(), previousClip = renderer.clippingPlanes;
      const previousTone = renderer.toneMapping, previousXr = renderer.xr.enabled;
      const shadowAuto = renderer.shadowMap.autoUpdate, shadowDirty = renderer.shadowMap.needsUpdate;
      const clearColour = renderer.getClearColor(new T.Color()), clearAlpha = renderer.getClearAlpha();
      const windowDetails = getWindowDetails(), windowsVisible = windowDetails.visible;
      const visibility = [...mirrors].map(item => [item.surface, item.surface.visible]);
      rendering = true;
      try {
        visibility.forEach(([mesh]) => { mesh.visible = false; });
        windowDetails.visible = true;
        const clipping = plane.clone(); clipping.constant -= .001;
        renderer.clippingPlanes = [clipping];
        renderer.toneMapping = T.NoToneMapping; renderer.xr.enabled = false;
        renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = false;
        renderer.setClearColor('#eeeee5', 1);
        renderer.setRenderTarget(target); renderer.clear(); renderer.render(world, reflectedCamera);
        record.updates++;
      } finally {
        renderer.setRenderTarget(previousTarget); renderer.clippingPlanes = previousClip;
        renderer.toneMapping = previousTone; renderer.xr.enabled = previousXr;
        renderer.shadowMap.autoUpdate = shadowAuto; renderer.shadowMap.needsUpdate = shadowDirty;
        renderer.setClearColor(clearColour, clearAlpha); windowDetails.visible = windowsVisible;
        visibility.forEach(([mesh, visible]) => { mesh.visible = visible; }); rendering = false;
      }
    };
    surface.getRenderTarget = () => target;
    surface.dispose = () => { mirrors.delete(record); target.dispose(); material.dispose(); geometry.dispose(); };
    return surface;
  }
  return { create, getState: () => [...mirrors].map(({surface,size,updates}) => ({name:surface.name,size,updates})) };
};
