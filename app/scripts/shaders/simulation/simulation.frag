// simulation
varying vec2 vUv;

uniform sampler2D tPositions;
uniform sampler2D otPositions;
uniform sampler2D origin;
uniform vec3 mouse;

uniform float timer;
uniform float restLength;
uniform float k;
uniform float distanceAttract;

void main() {


      vec4 porigin = texture2D(origin, vUv);
      vec3 anchor = porigin.xyz * 1.2;

      float damping = k;
      // float restLength =  length(anchor-porigin.xyz) + 1.;

      vec4 buffer = texture2D(tPositions, vUv);
      vec3 new = vec3(0.0,0.0,0.0);
      vec3 to = vec3(0.0);

      vec3 current = porigin.xyz - buffer.xyz;

      //
      if(distance(mouse, porigin.xyz) < distanceAttract) {
        to = vec3( mouse.x - porigin.x, mouse.y - porigin.y, mouse.z - porigin.z  ) * 0.01;
        new = buffer.xyz + to;

      } else {
        vec3 force = current -  anchor;
        float d = length(force);
        float df = restLength - d;

        vec3 acc = vec3(0.0);
        acc = -1. * normalize(force) * df;
        new = acc;
        new *= damping;

      }

      gl_FragColor = vec4(new.xyz, 1.0);
}
