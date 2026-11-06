const vertexSource = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position;
  gl_Position = vec4(a_position, 0., 1.);
}`;

// The supplied burning_reveal idea, reworked so the sheet ignites all over at once:
// many small fires open across the page, scorch ahead of the flame, and leave real holes.
const fragmentSource = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
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
  float aspect = u_resolution.x / u_resolution.y;
  vec2 uv = v_uv * vec2(max(1., aspect), max(1., 1. / aspect));
  vec2 screenUv = v_uv * .5 + .5;
  screenUv.y = 1. - screenUv.y;
  float t = u_progress;

  // Burn order. Warping the noise by itself gives torn, organic fronts, and its scale
  // puts many separate ignition points across the whole sheet.
  vec2 warp = vec2(fbm(3.1 * uv + 1.7), fbm(3.1 * uv + 9.2));
  float field = fbm(2.1 * uv + 2.4 * warp + 7.3) + .05 * fbm(24. * uv);
  float burn = clamp((field - .24) / .34, 0., 1.);
  float d = burn - t;

  // Paper: warm white with faint fibres, printed with the wordmark.
  float fibre = fbm(vec2(90., 26.) * uv);
  vec3 color = texture2D(u_text, screenUv).rgb * vec3(.975, .955, .915) * (.94 + .1 * fibre);

  // Heat travels ahead of the flame: a long soft browning, then char, then the hole.
  float scorch = 1. - smoothstep(.03, .3, d);
  color = mix(color, color * vec3(.74, .55, .33), scorch * scorch);
  float toast = 1. - smoothstep(.02, .13, d);
  color = mix(color, vec3(.2, .095, .035), toast * toast);
  float char = 1. - smoothstep(.006, .06, d);
  color = mix(color, vec3(.022, .016, .014), char);

  // Embers: a thin hot line right at the hole, cooling to deep red, with sparks of glow in the char.
  float flicker = fbm(11. * uv + vec2(0., -1.5 * u_time));
  float line = 1. - smoothstep(.0, .011 + .016 * flicker, d);
  float halo = 1. - smoothstep(.0, .05, d);
  color += vec3(.85, .16, .01) * halo * halo * (.5 + flicker);
  color = mix(color, mix(vec3(1., .36, .04), vec3(1., .86, .5), flicker * flicker * 2.2), line);
  float cinders = smoothstep(.56, .68, fbm(38. * uv + vec2(0., -.5 * u_time))) * char;
  color += vec3(.9, .25, .02) * cinders * (.4 + flicker);

  float opacity = smoothstep(-.004, .004, d);

  // Firelight falling on what is revealed behind the burning edge.
  float light = (1. - smoothstep(.0, .06, -d)) * (1. - opacity);
  color = mix(color, vec3(1., .42, .06), 1. - opacity);
  opacity = max(opacity, light * .34 * (.6 + flicker));

  // Sparks rising off the sheet while it burns.
  vec2 sparkUv = vec2(uv.x * 30., uv.y * 30. - u_time * 4.6);
  vec2 cell = floor(sparkUv);
  float seed = rand(cell);
  vec2 point = vec2(rand(cell + 1.3), rand(cell + 2.7));
  float life = smoothstep(.04, .16, t) * (1. - smoothstep(.84, 1., t));
  float spark = step(.94, seed) * smoothstep(.07, .012, length(fract(sparkUv) - point)) * life;
  color = mix(color, vec3(1., .66, .2), spark);
  opacity = max(opacity, spark);

  gl_FragColor = vec4(color, opacity);
}`;

/** How long the opening runs. */
export const INTRO_MS = 3600;

/** A beat of clean paper, then an even burn that clears the sheet before the end. */
export function burnProgress(fraction: number): number {
  const clamped = Math.max(0, Math.min(1, fraction));
  const eased = clamped * clamped * (3 - 2 * clamped);
  return -.04 + 1.1 * (clamped * .55 + eased * .45);
}

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
      ctx.font = `800 ${fontSize}px -apple-system, "Segoe UI", Arial, sans-serif`;
      ctx.fillStyle = "#0d1b33";
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
export const introBootstrapScript = `(()=>{if(location.pathname==="/"&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.tecIntro="pending";const timer=setTimeout(()=>{if(document.documentElement.dataset.tecIntro==="pending"){document.querySelector("dialog.site-intro[open]")?.close();delete document.documentElement.dataset.tecIntro}},6000);document.addEventListener("tecsecure:intro-ready",()=>clearTimeout(timer),{once:true})}})()`;
