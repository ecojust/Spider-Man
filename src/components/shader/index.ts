import { IShaderSource, ShaderToy } from "./shaderToy";
interface CustomWebGLProgram extends WebGLProgram {
  uTimeLocation?: WebGLUniformLocation;
}

class Shader {
  static gl: WebGLRenderingContext | null = null;
  static programs: { [key: string]: WebGLProgram } = {};
  static currentProgram: CustomWebGLProgram | null = null;
  static buffers: WebGLBuffer[] = [];

  static run() {
    Shader.initCanvas();
    Shader.createProgram("base", ShaderToy.galaxy);
    Shader.switchProgram("base");
    Shader.bindingUniform();
    Shader.createBuffer();
    Shader.render();
  }

  static initCanvas() {
    const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;

    console.log("canvas", canvas.width, canvas.height);

    const gl = canvas.getContext("webgl") as WebGLRenderingContext;

    if (Shader.resizeCanvasToDisplaySize(canvas)) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
    console.log("gl", gl);

    if (!gl) {
      console.error("WebGL not supported");
    }
    Shader.gl = gl;
  }

  static resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
    const devicePixelRatio = window.devicePixelRatio || 1;

    const displayWidth = Math.floor(canvas.clientWidth * devicePixelRatio);
    const displayHeight = Math.floor(canvas.clientHeight * devicePixelRatio);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;

      console.log("resize size");

      return true;
    }

    return false;
  }

  static _createShader(type: GLenum, source: string) {
    if (!Shader.gl) {
      return;
    }
    const shader = Shader.gl.createShader(type) as WebGLShader;
    Shader.gl.shaderSource(shader, source);
    Shader.gl.compileShader(shader);
    if (!Shader.gl.getShaderParameter(shader, Shader.gl.COMPILE_STATUS)) {
      console.error(
        "An error occurred compiling the shader:",
        Shader.gl.getShaderInfoLog(shader)
      );
      Shader.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  static bindingUniform() {
    if (!Shader.gl || !Shader.currentProgram) {
      return;
    }
    // const u_TimeLocation = Shader.gl.getUniformLocation(
    //   Shader.currentProgram,
    //   "u_Time"
    // );
    // if (u_TimeLocation) {
    //   Shader.currentProgram.uTimeLocation = u_TimeLocation;
    // }

    const u_Resolution = Shader.gl.getUniformLocation(
      Shader.currentProgram,
      "u_Resolution"
    );
    if (u_Resolution) {
      const myVec2 = {
        x: Shader.gl.drawingBufferWidth,
        y: Shader.gl.drawingBufferHeight,
      };

      console.log("myVec2", myVec2);
      Shader.gl.uniform2f(u_Resolution, myVec2.x, myVec2.y);
    }
  }

  static switchProgram(name: string) {
    const program = Shader.programs[name];
    if (program) {
      Shader.gl!.useProgram(program);
      Shader.currentProgram = program;
    } else {
      console.error(`Program with name ${name} does not exist`);
    }
  }

  static createProgram(name: string, shaderSource: IShaderSource) {
    if (!Shader.gl) {
      return;
    }

    const vertexShader = Shader._createShader(
      Shader.gl.VERTEX_SHADER,
      shaderSource.vertexShaderSource
    ) as WebGLShader;
    const fragmentShader = Shader._createShader(
      Shader.gl.FRAGMENT_SHADER,
      shaderSource.fragmentShaderSource
    ) as WebGLShader;

    const program = Shader.gl.createProgram() as CustomWebGLProgram;
    Shader.gl.attachShader(program, vertexShader);
    Shader.gl.attachShader(program, fragmentShader);
    Shader.gl.linkProgram(program);

    if (!Shader.gl.getProgramParameter(program, Shader.gl.LINK_STATUS)) {
      console.error(
        "Unable to link the program:",
        Shader.gl.getProgramInfoLog(program)
      );
      return null;
    }

    Shader.programs[name] = program;
  }
  static createBuffer() {
    if (!Shader.gl || !Shader.currentProgram) {
      return;
    }
    // Define vertices and UVs for two triangles forming a rectangle
    const verticesAndUVs = new Float32Array([
      // Positions     // UVs
      -1.0,
      1.0,
      0.0,
      0.0,
      1.0, // Top-left
      -1.0,
      -1.0,
      0.0,
      0.0,
      0.0, // Bottom-left
      1.0,
      1.0,
      0.0,
      1.0,
      1.0, // Top-right
      1.0,
      -1.0,
      0.0,
      1.0,
      0.0, // Bottom-right
    ]);

    const buffer = Shader.gl.createBuffer();
    Shader.gl.bindBuffer(Shader.gl.ARRAY_BUFFER, buffer);
    Shader.gl.bufferData(
      Shader.gl.ARRAY_BUFFER,
      verticesAndUVs,
      Shader.gl.STATIC_DRAW
    );
    Shader.buffers.push(buffer);

    const a_Position = Shader.gl.getAttribLocation(
      Shader.currentProgram,
      "a_Position"
    );
    Shader.gl.vertexAttribPointer(
      a_Position,
      3,
      Shader.gl.FLOAT,
      false,
      5 * verticesAndUVs.BYTES_PER_ELEMENT,
      0
    );
    Shader.gl.enableVertexAttribArray(a_Position);

    const a_UV = Shader.gl.getAttribLocation(Shader.currentProgram, "a_UV");
    Shader.gl.vertexAttribPointer(
      a_UV,
      2,
      Shader.gl.FLOAT,
      false,
      5 * verticesAndUVs.BYTES_PER_ELEMENT,
      3 * verticesAndUVs.BYTES_PER_ELEMENT
    );
    Shader.gl.enableVertexAttribArray(a_UV);
  }
  static render() {
    if (!Shader.gl || !Shader.currentProgram) {
      return;
    }
    Shader.gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black
    Shader.gl.clear(Shader.gl.COLOR_BUFFER_BIT);

    // Set the time uniform
    const currentTime = performance.now() / 1000; // Get time in seconds

    const uTimeLocation = Shader.gl.getUniformLocation(
      Shader.currentProgram,
      "u_Time"
    ) as CustomWebGLProgram;
    Shader.gl.uniform1f(uTimeLocation, currentTime);

    Shader.gl.drawArrays(Shader.gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(Shader.render);
  }

  static dispose() {
    if (!Shader.gl) {
      return;
    }

    // Delete buffers
    for (const buffer of Shader.buffers) {
      Shader.gl.deleteBuffer(buffer);
    }
    Shader.buffers = [];

    // Delete programs and their shaders
    for (const name in Shader.programs) {
      const program = Shader.programs[name];
      const attachedShaders = Shader.gl.getAttachedShaders(
        program
      ) as Array<any>;

      for (const shader of attachedShaders) {
        Shader.gl.detachShader(program, shader);
        Shader.gl.deleteShader(shader);
      }

      Shader.gl.deleteProgram(program);
    }
    Shader.programs = {};
    Shader.currentProgram = null;
  }
}

export default Shader;
