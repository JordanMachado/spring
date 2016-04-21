

varying vec2 vUv;
varying float vnoise;
uniform float time;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

void main(){


  gl_FragColor =   vec4(vnoise,vnoise,1.0,1.0);



}
