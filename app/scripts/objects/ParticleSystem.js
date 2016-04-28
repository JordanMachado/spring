import THREE from 'three';
const glslify = require('glslify');
window.THREE = THREE;


export default class ParticleSystem extends THREE.Object3D {
  constructor(renderer) {
    super();

    const width = 48;
    const height = 48;
    this.data = new Float32Array(width * height * 4);
    this.addParticleDiv();


    const geo = new THREE.SphereGeometry(10, 36, 36);
    // const geo = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    // let geo = new THREE.CubeGeometry(10, 36, 36);


    this.geom = new THREE.Geometry();
    const points = THREE.GeometryUtils.randomPointsInGeometry(geo, this.data.length / 3);
    this.geom = new THREE.BufferGeometry();

    const vertices = new Float32Array(width * height * 3);

    const uvs = new Float32Array(width * height * 2);

    let count = 0;

    for (let i = 0, l = width * height * 4; i < l; i += 4) {

      this.data[i] = points[count].x;
      this.data[i + 1] = points[count].y;
      this.data[i + 2] = points[count].z;


      uvs[count * 2 + 0] = (count % width) / width;
      uvs[count * 2 + 1] = Math.floor(count / width) / height;

      vertices[count * 3 + 0] = points[count].x;
      vertices[count * 3 + 1] = points[count].y;
      vertices[count * 3 + 2] = points[count].z;
      count++;

    }
    this.geom.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    this.geom.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    this.textureData = new THREE.DataTexture(
      this.data, width, height, THREE.RGBAFormat, THREE.FloatType);

    this.textureData.minFilter = THREE.NearestFilter;
    this.textureData.magFilter = THREE.NearestFilter;
    this.textureData.needsUpdate = true;


    this.rtTexturePos = new THREE.WebGLRenderTarget(width, height, {
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      stencilBuffer: false,
      flipY: false,
    });

    this.rtTexturePos2 = this.rtTexturePos.clone();

    this.simulationShader = new THREE.ShaderMaterial({
      uniforms: {
        tPositions: {
          type: 't',
          value: this.textureData,
        },
        otPositions: {
          type: 't',
          value: this.textureData,
        },
        restLength: {
          type: 'f',
          value: 24,
        },
        k: {
          type: 'f',
          value: 0.93,
        },
        distanceAtract: {
          type: 'f',
          value: 14,
        },
        mouse: {
          type: 'v3',
          value: new THREE.Vector3(),
        },
        repulsion: {
          type: 'uVec3Array',
          value: new THREE.Vector3(),
        },
        origin: {
          type: 't',
          value: this.textureData,
        },
        timer: {
          type: 'f',
          value: 0,
        },
      },
      vertexShader: glslify('../shaders/simulation/simulation.vert'),
      fragmentShader: glslify('../shaders/simulation/simulation.frag'),
    });
    this.fboParticles = new THREE.FBOUtils(width, renderer, this.simulationShader);
    this.fboParticles.renderToTexture(this.rtTexturePos, this.rtTexturePos2);
    this.fboParticles.in = this.rtTexturePos;
    this.fboParticles.out = this.rtTexturePos2;

    this.uniforms = {
      map: {
        type: 't',
        value: this.rtTexturePos,
      },
      oldmap: {
        type: 't',
        value: this.rtTexturePos,
      },
      origin: {
        type: 't',
        value: this.textureData,
      },
      mouse: {
        type: 'v2',
        value: new THREE.Vector2(),
      },
      width: {
        type: 'f',
        value: width,
      },
      height: {
        type: 'f',
        value: height,
      },
      pointSize: {
        type: 'f',
        value: 3.0,
      },
    };
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: glslify('../shaders/particle/particle.vert'),
      fragmentShader: glslify('../shaders/particle/particle.frag'),
      blending: THREE.AdditiveBlending,
      wireframeLineWidth: 10,
    });

    // this.system = new THREE.Line(this.geom, this.mat);
    this.system = new THREE.Mesh(this.geom, this.mat);
    // this.system = new THREE.Points(this.geom, this.mat);
    this.add(this.system);

    this.timer = 0;

  }
  addParticleDiv() {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.margin = '10px';
    div.style.fontFamily = 'Helvetica';
    div.style.zIndex = '2';
    div.style.color = 'white';
    // div.innerHTML = 'particles count: '+this.data.length / 3;
    document.body.appendChild(div);
    console.log('particles count: ', this.data.length / 3);

  }
  addGUI(folder) {
    this.folder = folder.addFolder('particles');
    this.folder.add(this.simulationShader.uniforms.restLength, 'value').min(1).max(100);
    this.folder.add(this.simulationShader.uniforms.k, 'value').min(0.10).max(1);
    this.folder.add(this.simulationShader.uniforms.distanceAtract, 'value').min(5).max(50);
    this.folder.open();
  }
  update(mouse) {

    this.timer += 0.01;
    this.simulationShader.uniforms.timer.value = this.timer;
    this.simulationShader.uniforms.mouse.value = mouse;
    // this.simulationShader.uniforms.otPositions.value = this.fboParticles.in;

    const tmp = this.fboParticles.in;
    this.fboParticles.in = this.fboParticles.out;
    this.fboParticles.out = tmp;

    this.simulationShader.uniforms.tPositions.value = this.fboParticles.in;


    this.fboParticles.simulate(this.fboParticles.out);
    // this.simulationShader.uniforms.otPositions.value = this.fboParticles.out;

    this.uniforms.map.value = this.fboParticles.out;
    this.uniforms.oldmap.value = this.fboParticles.in;

  }
}
