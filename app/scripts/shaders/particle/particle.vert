uniform sampler2D map;
uniform sampler2D origin;
uniform float width;
uniform float height;
uniform float pointSize;
uniform vec2 mouse;
uniform float time;

attribute vec3 color;

varying vec3 vColor;
varying vec2 vUv;
varying vec4 buffer;

void main() {


	// vUv = uv + vec2(0.5 / width, 0.5 / height);
	vColor = color;
	vUv = uv;
	vec4 origin = texture2D(origin, vUv);
	buffer = texture2D(map, vUv);
	vec3 newPosition = origin.xyz + buffer.xyz;


	// vec4 buffer = texture2D(map, vUv);
	// vec3 p = originMap.xyz + buffer.rgb;
	gl_PointSize = 5. ;
	// gl_PointSize = 5.;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

}
