

uniform sampler2D map;
varying float distTomouse;
uniform sampler2D tVel;

varying vec4 buffer;

varying vec2 vUv;

void main() {


		// gl_FragColor = buffer;
		// gl_FragColor = vec4(1.0,vUv,1.0);
		gl_FragColor = vec4(vUv,1.0,1.0);
		// gl_FragColor = vec4(vUv,vUv.y,vUv.y);


}
