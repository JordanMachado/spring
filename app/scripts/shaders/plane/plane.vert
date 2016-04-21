

varying vec2 vUv;
uniform float time;
uniform float repeat;
uniform float timeScale;
varying float vnoise;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)



void main(){

	vec4 p = vec4(position,1.0);
  vUv = uv * repeat;
  vec2 pposition = vec2(vUv.x,vUv.y+time*timeScale);

  vnoise =  snoise2(pposition);
  p.z += vnoise * 10.;

	gl_Position = projectionMatrix * modelViewMatrix * p;
}
