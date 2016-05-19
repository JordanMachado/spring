import THREE from 'three';
window.THREE = THREE;
import WAGNER from '@superguigui/wagner';

// Passes
const FXAAPass = require('@superguigui/wagner/src/passes/fxaa/FXAAPASS');
const VignettePass = require('@superguigui/wagner/src/passes/vignette/VignettePass');
const NoisePass = require('@superguigui/wagner/src/passes/noise/noise');
const LutPass = require('@superguigui/wagner/src/passes/lookup/lookup');

// Objects
import Plane from './objects/Plane';
import ParticleSystem from './objects/ParticleSystem';
import RepulstionMesh from './objects/RepulsionMesh';

export default class WebGL {
  constructor(params) {
    this.params = {
      name: params.name || 'WebGL',
      device: params.device || 'desktop',
      postProcessing: params.postProcessing || false,
      keyboard: params.keyboard || false,
      mouse: params.mouse || false,
      touch: params.touch || false,
      clearColor: params.clearColor || '#456990',
    };

    this.mouse = new THREE.Vector2();
    this.originalMouse = new THREE.Vector2();
    this.mouseWorldPosition = new THREE.Vector2(1000, 1000);
    this.tick = 0;

    this.raycaster = new THREE.Raycaster();

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, params.size.width / params.size.height, 1, 1000);
    this.camera.position.z = 100;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(params.size.width, params.size.height);
    this.renderer.setClearColor(this.params.clearColor);

    this.composer = null;
    this.initLights();
    this.initObjects();
    this.initPostprocessing();


    if (window.DEBUG || window.DEVMODE) this.initGUI();

  }
  initPostprocessing() {
    this.composer = new WAGNER.Composer(this.renderer);
    this.composer.setSize(window.innerWidth, window.innerHeight);
    window.composer = this.composer;
    this.passes = [];

    // Passes
    this.fxaaPass = new FXAAPass();
    this.passes.push(this.fxaaPass);

    this.vignettePass = new VignettePass({});
    this.vignettePass.params.boost = 1.15;
    this.vignettePass.params.reduction = 0.9;
    this.passes.push(this.vignettePass);

    this.noisePass = new NoisePass({});
    this.noisePass.params.speed = 0.2;
    this.noisePass.params.amount = 0.03;
    this.passes.push(this.noisePass);

    this.lutPass = new LutPass({});
    const loader = new THREE.TextureLoader();
    loader.load('./build/assets/lut.jpg', (texture) => {
      texture.minFilter = texture.magFilter = THREE.LinearFilter;
      this.lutPass.params.uLookup = texture;
    });
    this.passes.push(this.lutPass);

    for (let i = 0; i < this.passes.length; i++) {
      const pass = this.passes[i];
      pass.enabled = true;
    }


  }
  initLights() {

  }
  initObjects() {

    this.planeRay = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(400, 200),
    new THREE.MeshNormalMaterial({
      side: THREE.DoubleSide,
    }));
    this.planeRay.material.visible = false;
    this.scene.add(this.planeRay);

    const geo = new THREE.SphereGeometry(10, 4, 4);
    const mat = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0xc3c3c3,
    });

    this.sphere = new THREE.Mesh(geo, mat);

    const scale = 0.2;
    this.sphere.scale.set(scale, scale, scale);
    this.scene.add(this.sphere);
    this.plane = new Plane();

    this.damping = 0.1;

    this.particleSystem = new ParticleSystem(this.renderer, this.repulsionMeshs);
    this.scene.add(this.particleSystem);

  }
  initGUI() {
    this.folder = window.gui.addFolder(this.params.name);
    this.folder.add(this.params, 'postProcessing');
    this.folder.add(this.params, 'keyboard');
    this.folder.add(this.params, 'mouse');
    this.folder.add(this.params, 'touch');
    this.folder.addColor(this.params, 'clearColor').onChange((value) => {
      this.renderer.setClearColor(value);
    });

    this.postProcessingFolder = this.folder.addFolder('PostProcessing');
    for (let i = 0; i < this.passes.length; i++) {
      const pass = this.passes[i];
      let containsNumber = false;
      for (const key of Object.keys(pass.params)) {
        if (typeof pass.params[key] === 'number') {
          containsNumber = true;
        }
      }
      const folder = this.postProcessingFolder.addFolder(pass.constructor.name);
      folder.add(pass, 'enabled');
      if (containsNumber) {
        for (const key of Object.keys(pass.params)) {
          if (typeof pass.params[key] === 'number') {
            folder.add(pass.params, key);
          }
        }
      }
      folder.open();
    }
    this.postProcessingFolder.open();

    // init child GUI
    for (let i = 0; i < this.scene.children.length; i++) {
      const child = this.scene.children[i];
      if (typeof child.addGUI === 'function') {
        child.addGUI(this.folder);
      }
    }
    this.folder.open();
  }
  render() {
    if (this.params.postProcessing) {
      this.composer.reset();
      this.composer.render(this.scene, this.camera);

      // Passes
      for (let i = 0; i < this.passes.length; i++) {
        if (this.passes[i].enabled) {
          this.composer.pass(this.passes[i]);
        }
      }
      this.composer.toScreen();

    } else {
      this.renderer.render(this.scene, this.camera);
    }
    this.tick += 0.05;
    this.sphere.position.x += (this.mouseWorldPosition.x - this.sphere.position.x) * this.damping;
    this.sphere.position.y += (this.mouseWorldPosition.y - this.sphere.position.y) * this.damping;
    this.sphere.position.z += Math.cos(this.tick);

    // this.repulstionMesh.update(this.sphere.position);
    this.plane.update();
    this.particleSystem.update(this.sphere.position);

  }
  rayCast() {

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.planeRay, true);
    if (intersects.length > 0) {
      this.mouseWorldPosition.x = intersects[0].point.x;
      this.mouseWorldPosition.y = -intersects[0].point.y;
    }
  }
  // Events
  resize(width, height) {
    if (this.composer) {
      this.composer.setSize(width, height);
    }

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
  keyPress() {
    if (!this.params.keyboard) return;
  }
  keyDown() {
    if (!this.params.keyboard) return;
  }
  keyUp() {
    if (!this.params.keyboard) return;
  }
  click() {
    if (!this.params.mouse) return;
  }
  mouseMove(x, y, time) {
    if (!this.params.mouse) return;
    const _x = (x / window.innerWidth - 0.5) * 2;
    const _y = (y / window.innerHeight - 0.5) * 2;
    this.mouse.x = _x;
    this.mouse.y = _y;

    this.rayCast();
  }
  touchStart(touches) {
    if (!this.params.touch) return;
    const _x = (touches[0].clientX / window.innerWidth - 0.5) * 2;
    const _y = (touches[0].clientY / window.innerHeight - 0.5) * 2;
    this.mouse.x = _x;
    this.mouse.y = _y;
    this.rayCast();
  }
  touchEnd() {
    if (!this.params.touch) return;
  }
  touchMove(touches) {
    if (!this.params.touch) return;

    const _x = (touches[0].clientX / window.innerWidth - 0.5) * 2;
    const _y = (touches[0].clientY / window.innerHeight - 0.5) * 2;
    this.mouse.x = _x;
    this.mouse.y = _y;
    this.rayCast();

  }

}
