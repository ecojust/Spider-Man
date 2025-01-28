export interface IShaderSource {
  vertexShaderSource: string;
  fragmentShaderSource: string;
}

export class ShaderToy {
  static get default(): IShaderSource {
    const vertexShaderSource = `
        attribute vec4 a_Position;
        attribute vec3 a_Normal;
        varying vec3 v_Normal;
        void main() {
            gl_Position = a_Position;
            v_Normal = a_Normal;
        }
      `;
    const fragmentShaderSource = `
        precision mediump float;
        varying vec3 v_Normal;
        uniform float u_Time;
        void main() {
            vec3 lightDirection = normalize(vec3(0.5, 0.7, 1.0));
            float nDotL = max(dot(v_Normal, lightDirection), 0.0);
            vec4 diffuse = vec4(1.0, 0.0, 0.0, 1.0) * fract(u_Time); 
            gl_FragColor = diffuse;
        }
      `;
    return { vertexShaderSource, fragmentShaderSource };
  }

  static get galaxy(): IShaderSource {
    //https://www.shadertoy.com/view/wdtczM
    const vertexShaderSource = `
          attribute vec4 a_Position;
          attribute vec2 a_UV;
          varying vec2 uv;
          void main() {
              gl_Position = a_Position;
              uv = a_UV;
          }
        `;
    const fragmentShaderSource = `
         precision mediump float;
          varying vec2 uv;
  
          uniform float u_Time;
          uniform vec2 u_Resolution;
  
          void main() {
              vec2 R = u_Resolution.xy;
              vec2 F =  gl_FragCoord.xy;
              vec4 color = vec4(0.0, 0.0, 0.0,1.0);
  
              for (float i = 1.0; i > -1.0; i -= 0.06) {
                  float t = u_Time * 0.1;
                  float d = fract(i - 1.0 * t);
                  vec4 c = vec4((F - R * 0.5) / R.y * d, i, 0.0) * 28.0;
                  for (int j = 0; j < 27; j++) {
                      c.xzyw = abs( c / dot(c,c) -vec4( 7.-.2*sin(t) , 6.3 , .7 , 1.-cos(t/.8))/7.);	
                  }
                  color -= c * c.yzww  * d--*d  / vec4(3,5,1,1);                     
              }
              gl_FragColor = color;
          }
        `;
    return { vertexShaderSource, fragmentShaderSource };
  }
}
