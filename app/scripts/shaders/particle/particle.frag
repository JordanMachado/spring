

uniform sampler2D map;
varying float distTomouse;
uniform sampler2D tVel;

varying vec4 buffer;

varying vec2 vUv;
varying vec3 vColor;

void main() {
		gl_FragColor = vec4(vColor,1.0);
}
