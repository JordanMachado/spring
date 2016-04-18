

uniform sampler2D map;
varying float distTomouse;
uniform sampler2D tVel;

varying vec4 buffer;

varying vec2 vUv;
varying vec2 vUv2;
vec3 colorStart = vec3(1.0,0.1,0.1);
vec3 colorEnd = vec3(.0,.0,1.0);

void main() {


		// gl_FragColor = buffer;
		gl_FragColor = vec4(vUv,1.0,1.0);


}
