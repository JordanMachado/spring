import THREE from 'three';
window.THREE = THREE;
import WAGNER from '@superguigui/wagner';

// Passes
const FXAAPass = require('@superguigui/wagner/src/passes/fxaa/FXAAPASS');
const VignettePass = require('@superguigui/wagner/src/passes/vignette/VignettePass');
const NoisePass = require('@superguigui/wagner/src/passes/noise/noise');

// Objects
import ParticleSystem from './objects/ParticleSystem';

export default class WebGL {
  constructor(params) {
    this.params = {
      name: params.name || 'WebGL',
      device: params.device || 'desktop',
      postProcessing: params.postProcessing || false,
      keyboard: params.keyboard || false,
      mouse: params.mouse || false,
      touch: params.touch || false,
    };

    this.mouse = new THREE.Vector2();
    this.originalMouse = new THREE.Vector2();
    this.mouseWorldPosition = new THREE.Vector2(10000, 10000);


    this.raycaster = new THREE.Raycaster();

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, params.size.width / params.size.height, 1, 1000);
    this.camera.position.z = 100;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(params.size.width, params.size.height);
    this.renderer.setClearColor(0xeeeeee);


    this.composer = null;
    this.initLights();
    this.initObjects();

    if (window.DEBUG || window.DEVMODE) this.initGUI();

    this.initPostprocessing();



  }
  initPostprocessing() {
    this.composer = new WAGNER.Composer(this.renderer);
    this.composer.setSize(window.innerWidth, window.innerHeight);
    window.composer = this.composer;

    // Passes
    this.fxaaPass = new FXAAPass();
    this.vignettePass = new VignettePass({});
    this.vignettePass.params.boost = 1;
    this.vignettePass.params.reduction = 0.7;
    this.noisePass = new NoisePass({});
    this.noisePass.params.speed = 0.4;
    this.noisePass.params.amount = 0.1;

    let postprossfolder = this.folder.addFolder('postprocessing');
    postprossfolder.add(  this.vignettePass.params, 'boost');
    postprossfolder.add(  this.vignettePass.params, 'reduction');

    postprossfolder.add(  this.noisePass.params, 'speed');
    postprossfolder.add(  this.noisePass.params, 'amount');


  }
  initLights() {

  }
  initObjects() {
    this.planeRay = new THREE.Mesh(new THREE.PlaneBufferGeometry(400, 200), new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }));
    this.planeRay.material.visible = false;
    this.scene.add(this.planeRay);

    let geo = new THREE.SphereGeometry(10, 4, 4);
    let mat = new THREE.MeshBasicMaterial({
      wireframe: true,
      wireframeLineWidth: 4,
      color: 0x0000FF,
    });
    this.sphere = new THREE.Mesh(geo,mat)

    this.sphere.scale.set(0.2, 0.2, 0.2)
    this.scene.add(this.sphere);

    this.particleSystem = new ParticleSystem(this.renderer);

    this.scene.add(this.particleSystem);
  }
  initGUI() {
    this.folder = window.gui.addFolder(this.params.name);
    this.folder.add(this.params, 'postProcessing');
    this.folder.add(this.params, 'keyboard');
    this.folder.add(this.params, 'mouse');
    this.folder.add(this.params, 'touch');

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
      this.composer.pass(this.fxaaPass);
      this.composer.pass(this.vignettePass);
      this.composer.pass(this.noisePass);
      this.composer.toScreen();

    } else {
      this.renderer.render(this.scene, this.camera);
    }

    let damping = 0.1;
    this.sphere.position.x += (this.mouseWorldPosition.x- this.sphere.position.x  )* damping;
    this.sphere.position.y += ( this.mouseWorldPosition.y -this.sphere.position.y )* damping;


    this.particleSystem.update(this.sphere.position);

  }
  rayCast() {

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.planeRay, true);
    if (intersects.length > 0) {
        this.mouseWorldPosition.x = intersects[0].point.x ;
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
    console.log('keyPress');
  }
  keyDown() {
    if (!this.params.keyboard) return;
    console.log('keyDown');
  }
  keyUp() {
    if (!this.params.keyboard) return;
    console.log('keyUp');
  }
  click() {
    if (!this.params.mouse) return;
    console.log('click');
  }
  mouseMove(x,y,time) {
    if (!this.params.mouse) return;
    let _x = (x / window.innerWidth - 0.5) * 2;
    let _y = (y / window.innerHeight - 0.5) * 2;
    this.mouse.x = _x;
    this.mouse.y = _y;

    this.rayCast();
  }
  touchStart() {
    if (!this.params.touch) return;
    console.log('touchstart');
  }
  touchEnd() {
    if (!this.params.touch) return;
    console.log('touchend');
  }
  touchMove() {
    if (!this.params.touch) return;
    console.log('touchmove');
  }

}
