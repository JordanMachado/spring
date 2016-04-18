uniform sampler2D map;
uniform sampler2D origin;

uniform sampler2D oldmap;


uniform float width;
uniform float height;

uniform float pointSize;
uniform vec2 mouse;
uniform float time;

varying vec2 vUv;


varying vec4 buffer;
varying vec4 oldBuffer;

void main() {


	// vUv = uv + vec2(0.5 / width, 0.5 / height);
	vUv = uv ;
	vec4 origin = texture2D(origin, vUv);
	buffer = texture2D(map, vUv);
	oldBuffer = texture2D(oldmap, vUv);

	vec3 newPosition = origin.xyz + buffer.xyz;


	// vec4 buffer = texture2D(map, vUv);
	// vec3 p = originMap.xyz + buffer.rgb;
	gl_PointSize = 5. ;
	// gl_PointSize = 5.;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

}
