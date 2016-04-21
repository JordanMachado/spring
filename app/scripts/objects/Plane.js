import THREE from 'three';
const glslify = require('glslify');

export default class Plane extends THREE.Object3D {
    constructor() {
        super();
        this.startTime = Date.now();
        this.time = 0.0;
        this.timeScale = .2;
        this.repeat = 2.0;
        this.uniforms = {
            time: {
                type: 'f',
                value: this.time
            },
            timeScale: {
                type: 'f',
                value: this.timeScale
            },
            repeat: {
                type: 'f',
                value: this.repeat
            }
        }
        this.mat = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: glslify('../shaders/plane/plane.vert'),
            fragmentShader: glslify('../shaders/plane/plane.frag'),
            wireframe:true,
        });


        this.geo = new THREE.PlaneGeometry(500, 500,100,100);
        this.mesh = new THREE.Mesh(this.geo, this.mat);
        this.mesh.position.z = -100;

        this.add(this.mesh);

    }
    addGUI(folder) {
        this.folder = folder.addFolder('plane')
        this.folder.add(this, 'repeat').min(1.0).max(10.0)
            .listen()
            .onFinishChange(() => {
                this.uniforms.repeat.value = this.repeat;
            });

        this.folder.add(this, 'timeScale').min(.01).max(.5)
            .listen()
            .onFinishChange(() => {
                this.uniforms.timeScale.value = this.timeScale;
            });
    }
    update() {
        this.uniforms.time.value = 0.0025 * (Date.now() - this.startTime);
    }
}
