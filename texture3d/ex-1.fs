#version 300 es
precision mediump float;
precision highp sampler3D;

in vec2 vUv;
out vec4 fragColor;
uniform sampler2D tDiffuse;
uniform sampler3D tLookup;
const float lutSize = 32.0; // typically better as a uniform...

void main () {
  // Based on "GPU Gems 2 — Chapter 24. Using Lookup Tables to Accelerate Color Transformations"
  // More info and credits @ http://http.developer.nvidia.com/GPUGems2/gpugems2_chapter24.html
  vec4 rawColor = texture(tDiffuse, vUv);

  // Compute the 3D LUT lookup scale/offset factor
  vec3 scale = vec3((lutSize - 1.0) / lutSize);
  vec3 offset = vec3(1.0 / (2.0 * lutSize));

  // Apply 3D LUT color transform
  fragColor.rgb = texture(tLookup, scale * rawColor.rgb + offset).rgb;
  fragColor.a = rawColor.a;
}