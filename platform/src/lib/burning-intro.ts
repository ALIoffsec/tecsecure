const vertexSource = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * .5 + .5;
  gl_Position = vec4(a_position, 0., 1.);
}`;

// Noise-driven dissolve adapted from the supplied burning_reveal demo.
const fragmentSource = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_text;
uniform vec2 u_resolution;
uniform float u_progress;
uniform float u_time;
float random(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(random(i), random(i + vec2(1., 0.)), f.x),
    mix(random(i + vec2(0., 1.)), random(i + vec2(1., 1.)), f.x), f.y);
}
float fbm(vec2 p) {
  float value = 0., amplitude = .5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p = p * 2.1 + 3.7;
    amplitude *= .5;
  }
  return value;
}
void main() {
  vec2 screen = vec2(v_uv.x, 1. - v_uv.y);
  vec2 uv = screen * vec2(u_resolution.x / max(u_resolution.y, 1.), 1.);
  float field = .43 * screen.x + .28 * (1. - screen.y) + .32 * fbm(uv * 5.);
  float remaining = smoothstep(u_progress - .012, u_progress + .012, field);
  float edge = 1. - smoothstep(.008, .055, abs(field - u_progress));
  float grain = fbm(uv * 11. + vec2(0., -u_time * .7));
  vec3 title = texture2D(u_text, screen).rgb;
  vec3 paper = vec3(.018, .025, .045) + grain * .018;
  vec3 color = mix(paper, vec3(.94, .96, 1.), title.r);
  float scorch = 1. - smoothstep(.025, .1, field - u_progress);
  color *= 1. - .82 * scorch;
  vec3 fire = mix(vec3(1., .16, .015), vec3(1., .82, .3), grain);
  color += fire * edge * (1.4 + grain);
  gl_FragColor = vec4(color, max(remaining, edge * .92));
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
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, text.width, text.height);
      const fontSize = Math.min(text.width * .15, text.height * .18);
      ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
      ctx.fillStyle = "#fff";
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

export const introStorageKey = "tecsecure-intro-seen-v1";

// Decide before first paint so the site does not flash ahead of the opening.
export const introBootstrapScript = `(()=>{try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&!sessionStorage.getItem("${introStorageKey}")){document.documentElement.dataset.tecIntro="pending";setTimeout(()=>{if(document.documentElement.dataset.tecIntro==="pending"){document.querySelector("dialog.site-intro[open]")?.close();delete document.documentElement.dataset.tecIntro}},6000)}}catch(e){console.warn("Tecsecure intro preference unavailable",e)}})()`;
