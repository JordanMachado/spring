import THREE from 'three';
import hexRgb from 'hex-rgb';
const glslify = require('glslify');
window.THREE = THREE;


export default class ParticleSystem extends THREE.Object3D {
  constructor(renderer) {
    super();

    const width = 32;
    const height = 32;
    this.data = new Float32Array(width * height * 4);
    const geo = new THREE.SphereGeometry(10, 36, 36);
    this.geom = new THREE.Geometry();
    const points = THREE.GeometryUtils.randomPointsInGeometry(geo, this.data.length / 3);
    this.geom = new THREE.BufferGeometry();

    const vertices = new Float32Array(width * height * 3);
    const uvs = new Float32Array(width * height * 2);
    const colors = new Float32Array(width * height * 3);

    let count = 0;

    this.colors = [
      '114B5F',
      '028090',
      'E4FDE1',
      '456990',
      'F45B69',
    ];

    for (let i = 0, l = width * height * 4; i < l; i += 4) {

      this.data[i] = points[count].x;
      this.data[i + 1] = points[count].y;
      this.data[i + 2] = points[count].z;


      uvs[count * 2 + 0] = (count % width) / width;
      uvs[count * 2 + 1] = Math.floor(count / width) / height;

      const color = hexRgb(this.colors[Math.floor(Math.random() * this.colors.length)]);

      colors[count * 3 + 0] = color[0] / 255;
      colors[count * 3 + 1] = color[1] / 255;
      colors[count * 3 + 2] = color[2] / 255;

      vertices[count * 3 + 0] = points[count].x;
      vertices[count * 3 + 1] = points[count].y;
      vertices[count * 3 + 2] = points[count].z;
      count++;

    }
    this.geom.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    this.geom.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    this.geom.addAttribute('color', new THREE.BufferAttribute(colors, 3));

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
    this.restLength = 24;
    this.k = 0.93;
    this.distanceAttract = 14;
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
          value: this.restLength,
        },
        k: {
          type: 'f',
          value: this.k,
        },
        distanceAttract: {
          type: 'f',
          value: this.distanceAttract,
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
  addGUI(folder) {
    this.folder = folder.addFolder('Particles');
    this.folder.add(this, 'restLength').min(1).max(100).onChange(() => {
      this.simulationShader.uniforms.restLength.value = this.restLength;
    });
    this.folder.add(this, 'k').min(0.10).max(1).onChange(() => {
      this.simulationShader.uniforms.k.value = this.k;
    });
    this.folder.add(this, 'distanceAttract').min(5).max(50).onChange(() => {
      this.simulationShader.uniforms.distanceAttract.value = this.distanceAttract;
    });
    this.folder.open();
  }
  update(mouse) {

    this.timer += 0.01;
    this.simulationShader.uniforms.timer.value = this.timer;
    this.simulationShader.uniforms.mouse.value = mouse;

    const tmp = this.fboParticles.in;
    this.fboParticles.in = this.fboParticles.out;
    this.fboParticles.out = tmp;

    this.simulationShader.uniforms.tPositions.value = this.fboParticles.in;

    this.fboParticles.simulate(this.fboParticles.out);
    this.uniforms.map.value = this.fboParticles.out;

  }
}
