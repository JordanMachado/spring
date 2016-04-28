import THREE from 'three';

export default class RepulsionMesh extends THREE.Object3D {
  constructor() {
    super();

    this.velocity = new THREE.Vector3( Math.random(),Math.random(),Math.random());
    this.damping = 0.8;
    this.force = new THREE.Vector3();

    this.geo = new THREE.SphereGeometry(10, 4, 4);
    this.mat = new THREE.MeshBasicMaterial({
      wireframeLineWidth: 40,
      color: 0x303030,
    });
    this.mesh = new THREE.Mesh(this.geo, this.mat);
    const scale = Math.random() * 0.1;
    this.mesh.scale.set(scale, scale, scale);
    this.add(this.mesh);
  }
  addGUI(folder) {
    // this.folder = folder.addFolder('Cube');
  }
  update(mouse) {

    this.force.x = mouse.x - this.mesh.position.x;
    this.force.y = mouse.y - this.mesh.position.y;
    this.force.z = mouse.z - this.mesh.position.z;
    if(this.force.length()>10) {
      this.velocity.multiplyScalar(this.damping);
      this.velocity.add(this.force.normalize());
    };



    this.mesh.position.x += this.velocity.x;
    this.mesh.position.y += this.velocity.y;
    this.mesh.position.z += this.velocity.z;
  }

}
