const vertexSource = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position;
  gl_Position = vec4(a_position, 0., 1.);
}`;

// Original burning_reveal noise and fire-edge equations; only the title texture is branded.
const fragmentSource = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_text;
uniform vec2 u_resolution;
uniform float u_progress;
uniform float u_time;
float rand(vec2 n) {
  return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
float noise(vec2 n) {
  const vec2 d = vec2(0., 1.);
  vec2 b = floor(n), f = smoothstep(vec2(0.), vec2(1.), fract(n));
  return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}
float fbm(vec2 n) {
  float total = 0., amplitude = .4;
  for (int i = 0; i < 4; i++) {
    total += noise(n) * amplitude;
    n += n;
    amplitude *= .6;
  }
  return total;
}
void main() {
  vec2 uv = v_uv;
  uv.x *= min(1., u_resolution.x / u_resolution.y);
  uv.y *= min(1., u_resolution.y / u_resolution.x);
  vec2 screenUv = v_uv * .5 + .5;
  screenUv.y = 1. - screenUv.y;
  float t = u_progress;
  vec3 color = texture2D(u_text, screenUv).rgb;
  float main_noise = 1. - fbm(.75 * uv + 10. - vec2(.3, .9 * t));
  float paper_darkness = smoothstep(main_noise - .1, main_noise, t);
  color -= vec3(.99, .95, .99) * paper_darkness;
  vec3 fire_color = fbm(6. * uv - vec2(0., .005 * u_time)) * vec3(6., 1.4, 0.);
  float show_fire = smoothstep(.4, .9, fbm(10. * uv + 2. - vec2(0., .005 * u_time)));
  show_fire += smoothstep(.7, .8, fbm(.5 * uv + 5. - vec2(0., .001 * u_time)));
  float fire_border = .02 * show_fire;
  float fire_edge = smoothstep(main_noise - fire_border, main_noise - .5 * fire_border, t);
  fire_edge *= 1. - smoothstep(main_noise - .5 * fire_border, main_noise, t);
  color += fire_color * fire_edge;
  float opacity = 1. - smoothstep(main_noise - .0005, main_noise, t);
  gl_FragColor = vec4(color, opacity);
}`;

export function createBurningIntro(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false, powerPreference: "low-power" });
  if (!gl) throw new Error("WebGL is unavailable");
  const shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let texture: WebGLTexture | null = null;
  const dispose = () => {
    if (texture) gl.deleteTexture(texture);
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    shaders.forEach(shader => gl.deleteShader(shader));
  };
  try {
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Could not allocate intro shader");
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "Intro shader compilation failed");
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    program = gl.createProgram();
    if (!program) throw new Error("Could not allocate intro program");
    gl.attachShader(program, vertex); gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "Intro shader link failed");
    gl.useProgram(program);
    buffer = gl.createBuffer();
    texture = gl.createTexture();
    if (!buffer || !texture) throw new Error("Could not allocate intro graphics");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    if (position < 0) throw new Error("Intro position attribute is missing");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    const progress = gl.getUniformLocation(program, "u_progress");
    const time = gl.getUniformLocation(program, "u_time");
    const resolution = gl.getUniformLocation(program, "u_resolution");
    gl.uniform1i(gl.getUniformLocation(program, "u_text"), 0);
    const text = document.createElement("canvas");
    const ctx = text.getContext("2d");
    if (!ctx) throw new Error("Canvas text rendering is unavailable");
    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5, 1600 / window.innerWidth, 1000 / window.innerHeight);
      canvas.width = text.width = Math.max(1, Math.round(window.innerWidth * scale));
      canvas.height = text.height = Math.max(1, Math.round(window.innerHeight * scale));
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, text.width, text.height);
      const fontSize = Math.min(text.width * .15, text.height * .18);
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = "#000";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("Tecsecure", text.width / 2, text.height / 2, text.width * .82);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, text);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, canvas.width, canvas.height);
    };
    const render = (value: number, seconds: number) => {
      gl.uniform1f(progress, value);
      gl.uniform1f(time, seconds);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    resize();
    return { resize, render, dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}

// Decide before first paint so the site does not flash ahead of the opening.
export const introBootstrapScript = `(()=>{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.tecIntro="pending";const timer=setTimeout(()=>{if(document.documentElement.dataset.tecIntro==="pending"){document.querySelector("dialog.site-intro[open]")?.close();delete document.documentElement.dataset.tecIntro}},10000);document.addEventListener("tecsecure:intro-ready",()=>clearTimeout(timer),{once:true})}})()`;
