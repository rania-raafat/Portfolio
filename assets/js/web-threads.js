/* =========================================================
   WEB THREADS - VANILLA JS
   ORIGINAL BEHAVIOR
   ONLY CHANGE: RESPONSIVE THREAD SPREAD
   ========================================================= */

(() => {
  const container = document.getElementById("webThreads");

  if (!container) return;

  /* =========================================================
     CONFIG
     ========================================================= */

  const CONFIG = {
    color1: "#8f795b",
    color2: "#DAC5A7",
    color3: "#FFFFFF",

    /* ORIGINAL SETTINGS */
    speed: 0.2,
    threadCount: 6,
    frequency: 5.0,

    /* ORIGINAL DESKTOP SPREAD */
    spread: 0.18,

    taper: 1.0,
    position: 0.5,

    glow: 0.018,
    falloff: 0.6,
    thickness: 1.1,
    brightness: 0.55,
    opacity: 0.65,

    mirror: true,

    /* ORIGINAL MOUSE BEHAVIOR */
    mouseInteraction: true,
    mouseStrength: 0.25,

    grain: true,
    grainIntensity: 0.025
  };

  /* =========================================================
     CANVAS
     ========================================================= */

  const canvas = document.createElement("canvas");

  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true
  });

  if (!gl) {
    console.warn("WebGL2 is not supported in this browser.");
    return;
  }

  container.appendChild(canvas);

  gl.clearColor(0, 0, 0, 0);

  /* =========================================================
     HELPERS
     ========================================================= */

  function hexToRgb(hex) {
    const result =
      /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (!result) return [1, 1, 1];

    return [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    ];
  }

  const color1 = hexToRgb(CONFIG.color1);
  const color2 = hexToRgb(CONFIG.color2);
  const color3 = hexToRgb(CONFIG.color3);

  /* =========================================================
     VERTEX SHADER
     ========================================================= */

  const vertexShaderSource = `#version 300 es

    in vec2 position;

    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }

  `;

  /* =========================================================
     FRAGMENT SHADER
     ========================================================= */

  const fragmentShaderSource = `#version 300 es

    precision highp float;

    uniform vec2 uResolution;
    uniform float uTime;

    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;

    uniform float uSpeed;
    uniform float uThreadCount;
    uniform float uFrequency;
    uniform float uSpread;
    uniform float uTaper;
    uniform float uPosition;

    uniform float uGlow;
    uniform float uFalloff;
    uniform float uThickness;
    uniform float uBrightness;
    uniform float uOpacity;

    uniform float uMirror;

    uniform vec2 uMouse;
    uniform float uMouseStrength;
    uniform float uMouseActive;

    uniform float uGrain;
    uniform float uGrainIntensity;

    out vec4 fragColor;

    #define TAU 6.28318530718
    #define MAX_THREADS 10

    float glow(float x, float strength, float distanceValue) {
      return distanceValue /
        pow(max(x, 0.0001), strength);
    }

    void main() {

      vec2 uv = gl_FragCoord.xy / uResolution.xy;

      /* =====================================================
         ORIGINAL ASPECT RATIO
         ===================================================== */

      float aspect =
        uResolution.x / uResolution.y;

      vec2 centeredUV =
        uv - 0.5;

      centeredUV.x *= aspect;

      float n =
        max(uThreadCount, 1.0);

      /* =====================================================
         ORIGINAL CONVERGENCE POINT
         ===================================================== */

      float pinchX = 0.5;

      /* =====================================================
         ORIGINAL MOUSE INTERACTION
         ===================================================== */

      if (uMouseActive > 0.0) {

        float mouseInfluence =
          clamp(
            uMouseStrength,
            0.0,
            1.0
          );

        pinchX =
          mix(
            pinchX,
            uMouse.x,
            mouseInfluence
          );
      }

      /* =====================================================
         THREAD SPREAD
         ===================================================== */

      float spreadDx =
        uSpread *
        abs(
          uv.x - pinchX
        );

      float time =
        uTime *
        uSpeed;

      float tauOverN =
        TAU / n;

      float mirror =
        uMirror > 0.5
          ? sign(
              pinchX - uv.x
            )
          : 1.0;

      float invThickness =
        1.0 /
        max(
          uThickness,
          0.01
        );

      float xFreq =
        uv.x *
        uFrequency;

      float yOffset =
        uv.y -
        uPosition;

      float colorScale =
        n > 1.0
          ? 1.0 / (n - 1.0)
          : 0.0;

      vec3 color =
        vec3(0.0);

      float glowSum =
        0.0;

      /* =====================================================
         DRAW THREADS
         ===================================================== */

      for (int i = 0; i < MAX_THREADS; i++) {

        float index =
          float(i);

        if (index >= n)
          break;

        float amplitude =
          spreadDx *
          (
            1.0 +
            index * uTaper
          );

        float phase =
          (
            time +
            index * tauOverN
          ) *
          mirror;

        float sine =
          sin(
            xFreq +
            phase
          );

        float sdf =
          abs(
            yOffset +
            sine *
            amplitude
          ) *
          invThickness;

        float g =
          glow(
            sdf,
            uFalloff,
            uGlow
          );

        float colorPosition =
          index *
          colorScale;

        vec3 threadColor =
          mix(
            uColor1,
            uColor2,
            colorPosition
          );

        color +=
          g *
          threadColor;

        glowSum += g;
      }

      /* =====================================================
         CENTER GLOW
         ===================================================== */

      float core =
        smoothstep(
          0.5,
          2.2,
          glowSum
        );

      color =
        mix(
          color,
          uColor3 *
          glowSum,
          core *
          0.5
        );

      /* =====================================================
         MOUSE LIGHT
         ===================================================== */

      if (uMouseActive > 0.0) {

        vec2 mouseDistance =
          uv -
          uMouse;

        float distanceSquared =
          dot(
            mouseDistance,
            mouseDistance
          );

        color +=
          uColor2 *
          exp(
            -distanceSquared *
            6.0
          ) *
          uMouseStrength *
          0.5;
      }

      color *=
        uBrightness;

      float alpha =
        clamp(
          glowSum,
          0.0,
          1.0
        ) *
        uOpacity;

      /* =====================================================
         GRAIN
         ===================================================== */

      if (uGrain > 0.5) {

        float noise =
          fract(
            sin(
              dot(
                gl_FragCoord.xy,
                vec2(
                  12.9898,
                  78.233
                )
              ) +
              uTime
            ) *
            43758.5453
          );

        noise =
          (
            noise -
            0.5
          ) *
          uGrainIntensity;

        color =
          clamp(
            color +
            noise,
            0.0,
            1.0
          );
      }

      /* =====================================================
         FINAL COLOR
         ===================================================== */

      fragColor =
        vec4(
          color *
          alpha,
          alpha
        );
    }

  `;

  /* =========================================================
     SHADER COMPILATION
     ========================================================= */

  function createShader(type, source) {

    const shader =
      gl.createShader(type);

    gl.shaderSource(
      shader,
      source
    );

    gl.compileShader(shader);

    if (
      !gl.getShaderParameter(
        shader,
        gl.COMPILE_STATUS
      )
    ) {

      console.error(
        gl.getShaderInfoLog(shader)
      );

      gl.deleteShader(shader);

      return null;
    }

    return shader;
  }

  const vertexShader =
    createShader(
      gl.VERTEX_SHADER,
      vertexShaderSource
    );

  const fragmentShader =
    createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

  if (
    !vertexShader ||
    !fragmentShader
  ) {
    return;
  }

  /* =========================================================
     PROGRAM
     ========================================================= */

  const program =
    gl.createProgram();

  gl.attachShader(
    program,
    vertexShader
  );

  gl.attachShader(
    program,
    fragmentShader
  );

  gl.linkProgram(
    program
  );

  if (
    !gl.getProgramParameter(
      program,
      gl.LINK_STATUS
    )
  ) {

    console.error(
      gl.getProgramInfoLog(
        program
      )
    );

    return;
  }

  gl.useProgram(
    program
  );

  /* =========================================================
     FULLSCREEN TRIANGLE
     ========================================================= */

  const vertices =
    new Float32Array([
      -1, -1,
       3, -1,
      -1,  3
    ]);

  const buffer =
    gl.createBuffer();

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    buffer
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.STATIC_DRAW
  );

  const positionLocation =
    gl.getAttribLocation(
      program,
      "position"
    );

  gl.enableVertexAttribArray(
    positionLocation
  );

  gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );

  /* =========================================================
     UNIFORMS
     ========================================================= */

  const uniforms = {};

  [
    "uResolution",
    "uTime",
    "uColor1",
    "uColor2",
    "uColor3",
    "uSpeed",
    "uThreadCount",
    "uFrequency",
    "uSpread",
    "uTaper",
    "uPosition",
    "uGlow",
    "uFalloff",
    "uThickness",
    "uBrightness",
    "uOpacity",
    "uMirror",
    "uMouse",
    "uMouseStrength",
    "uMouseActive",
    "uGrain",
    "uGrainIntensity"
  ].forEach(name => {

    uniforms[name] =
      gl.getUniformLocation(
        program,
        name
      );
  });

  /* =========================================================
     MOUSE
     ========================================================= */

  let mouse = {
    x: 0.5,
    y: 0.5
  };

  let targetMouse = {
    x: 0.5,
    y: 0.5
  };

  let mouseActive = 0;
  let targetMouseActive = 0;

  function handleMouseMove(event) {

    const rect =
      container.getBoundingClientRect();

    if (
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      return;
    }

    targetMouse.x =
      (
        event.clientX -
        rect.left
      ) /
      rect.width;

    targetMouse.y =
      1 -
      (
        (
          event.clientY -
          rect.top
        ) /
        rect.height
      );

    targetMouse.x =
      Math.max(
        0,
        Math.min(
          1,
          targetMouse.x
        )
      );

    targetMouse.y =
      Math.max(
        0,
        Math.min(
          1,
          targetMouse.y
        )
      );

    /* Activate only when mouse is inside hero */

    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    targetMouseActive =
      inside ? 1 : 0;
  }

  /*
   * WINDOW listener is intentional.
   * Content can stay above the threads and
   * still be clickable while the threads
   * continue responding to the mouse.
   */

  window.addEventListener(
    "mousemove",
    handleMouseMove
  );

  /* =========================================================
     RESIZE
     ORIGINAL - DO NOT CHANGE
     ========================================================= */

  function resize() {

    const rect =
      container.getBoundingClientRect();

    const dpr =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );

    canvas.width =
      Math.max(
        1,
        Math.floor(
          rect.width *
          dpr
        )
      );

    canvas.height =
      Math.max(
        1,
        Math.floor(
          rect.height *
          dpr
        )
      );

    canvas.style.width =
      "100%";

    canvas.style.height =
      "100%";

    gl.viewport(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  const resizeObserver =
    new ResizeObserver(
      resize
    );

  resizeObserver.observe(
    container
  );

  resize();

  /* =========================================================
     ANIMATION
     ========================================================= */

  const startTime =
    performance.now();

  let animationFrame;

  function animate(now) {

    const time =
      (
        now -
        startTime
      ) /
      1000;

    /* =====================================================
       ORIGINAL SMOOTH MOUSE
       ===================================================== */

    mouse.x +=
      0.05 *
      (
        targetMouse.x -
        mouse.x
      );

    mouse.y +=
      0.05 *
      (
        targetMouse.y -
        mouse.y
      );

    mouseActive +=
      0.05 *
      (
        targetMouseActive -
        mouseActive
      );

    gl.useProgram(
      program
    );

    /* =====================================================
       RESOLUTION
       ===================================================== */

    gl.uniform2f(
      uniforms.uResolution,
      canvas.width,
      canvas.height
    );

    /* =====================================================
       TIME
       ===================================================== */

    gl.uniform1f(
      uniforms.uTime,
      time
    );

    /* =====================================================
       COLORS
       ===================================================== */

    gl.uniform3fv(
      uniforms.uColor1,
      color1
    );

    gl.uniform3fv(
      uniforms.uColor2,
      color2
    );

    gl.uniform3fv(
      uniforms.uColor3,
      color3
    );

    /* =====================================================
       ORIGINAL SETTINGS
       ===================================================== */

    gl.uniform1f(
      uniforms.uSpeed,
      CONFIG.speed
    );

    gl.uniform1f(
      uniforms.uThreadCount,
      CONFIG.threadCount
    );

    gl.uniform1f(
      uniforms.uFrequency,
      CONFIG.frequency
    );

    /* =====================================================
       RESPONSIVE SPREAD ONLY
       ===================================================== */

    let responsiveSpread =
      CONFIG.spread;

    /*
     * Desktop:
     * 0.18
     *
     * Tablet:
     * 0.14
     *
     * Mobile:
     * 0.10
     */

    if (window.innerWidth <= 480) {

      responsiveSpread =
        0.10;

    } else if (window.innerWidth <= 768) {

      responsiveSpread =
        0.14;
    }

    gl.uniform1f(
      uniforms.uSpread,
      responsiveSpread
    );

    /* =====================================================
       REST OF ORIGINAL SETTINGS
       ===================================================== */

    gl.uniform1f(
      uniforms.uTaper,
      CONFIG.taper
    );

    gl.uniform1f(
      uniforms.uPosition,
      CONFIG.position
    );

    gl.uniform1f(
      uniforms.uGlow,
      CONFIG.glow
    );

    gl.uniform1f(
      uniforms.uFalloff,
      CONFIG.falloff
    );

    gl.uniform1f(
      uniforms.uThickness,
      CONFIG.thickness
    );

    gl.uniform1f(
      uniforms.uBrightness,
      CONFIG.brightness
    );

    gl.uniform1f(
      uniforms.uOpacity,
      CONFIG.opacity
    );

    /* =====================================================
       MIRROR
       ===================================================== */

    gl.uniform1f(
      uniforms.uMirror,
      CONFIG.mirror
        ? 1
        : 0
    );

    /* =====================================================
       MOUSE
       ===================================================== */

    gl.uniform2f(
      uniforms.uMouse,
      mouse.x,
      mouse.y
    );

    gl.uniform1f(
      uniforms.uMouseStrength,
      CONFIG.mouseStrength
    );

    gl.uniform1f(
      uniforms.uMouseActive,
      CONFIG.mouseInteraction
        ? mouseActive
        : 0
    );

    /* =====================================================
       GRAIN
       ===================================================== */

    gl.uniform1f(
      uniforms.uGrain,
      CONFIG.grain
        ? 1
        : 0
    );

    gl.uniform1f(
      uniforms.uGrainIntensity,
      CONFIG.grainIntensity
    );

    /* =====================================================
       DRAW
       ===================================================== */

    gl.drawArrays(
      gl.TRIANGLES,
      0,
      3
    );

    animationFrame =
      requestAnimationFrame(
        animate
      );
  }

  animationFrame =
    requestAnimationFrame(
      animate
    );

  /* =========================================================
     CLEANUP
     ========================================================= */

  window.addEventListener(
    "beforeunload",
    () => {

      cancelAnimationFrame(
        animationFrame
      );

      resizeObserver.disconnect();

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    }
  );

})();