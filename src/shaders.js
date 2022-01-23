var make_shader = function (gl, name) {

    const sourceV = `
    attribute vec3 position;
    attribute vec3 normal;
    
    varying vec3 v_normal;
    varying vec3 v_frag_coord;
    
    uniform mat4 M;
    uniform mat4 itM;  // inverse transpose model!
    uniform mat4 V;
    uniform mat4 P;
    
    void main() {
      vec4 frag_coord = M*vec4(position, 1.0);
      gl_Position = P*V*frag_coord;
      v_normal = vec3(itM * vec4(normal, 1.0));
      v_frag_coord = frag_coord.xyz;
    }
    `;
    
    const sourceF = `
    precision mediump float;
    varying vec3 v_normal;
    varying vec3 v_frag_coord;
    
    uniform vec3 u_light_pos;
    uniform vec3 u_view_dir;

    void main() {
      vec3 normal = normalize(v_normal);
      
      // light color
      vec3 light_color = vec3(0.9, 0.3, 0.4);
      
      // Ambient
      float ambient = 0.1;
      
      vec3 L = normalize(u_light_pos - v_frag_coord);
      
      // Diffuse
      float diffusion = max(0.0, dot(normal, L));
      
      // specural
      float spec_strength = 0.8;
      vec3 view_dir = normalize(u_view_dir - v_frag_coord);
      vec3 reflect_dir = reflect(-L, normal);
      float spec = pow(max(dot(view_dir, reflect_dir), 0.0), 32.0);
      float specular = spec_strength * spec;

      vec3 color = (ambient + specular + diffusion) * light_color;
      gl_FragColor = vec4(color, 1.0);
    }
`;
    
    const sourceCubemapV = `
    attribute vec3 position;
    attribute vec2 texcoord;
    attribute vec3 normal;
    varying vec3 v_texcoord;
    
    uniform mat4 M;
    uniform mat4 itM;
    uniform mat4 V;
    uniform mat4 P;

    void main() {
      mat3 Vrotation = mat3(V);
      vec4 frag_coord = vec4(position, 1.0);
      gl_Position = (P*mat4(Vrotation)*frag_coord).xyww;
      v_texcoord = frag_coord.xyz;
    }
    `;

    const sourceCubemapF = `
    precision mediump float;
    varying vec3 v_texcoord;
    uniform samplerCube u_cubemap;

    void main() {
      gl_FragColor = textureCube(u_cubemap, v_texcoord);
    }
    `;
    
    const sourceReflexionV = `
    attribute vec3 position;
    attribute vec2 texcoord;
    attribute vec3 normal;
    
    varying vec3 v_normal;
    varying vec3 v_frag_coord;
    
    uniform mat4 M;
    uniform mat4 itM;
    uniform mat4 V;
    uniform mat4 P;

    void main() {
      vec4 frag_coord = M*vec4(position, 1.0);
      gl_Position = (P*V*frag_coord);
      v_normal = vec3(itM * vec4(normal, 1.0));
      v_frag_coord = frag_coord.xyz;
    }
  `;
    
    const sourceReflexionF = `
    precision mediump float;     
    varying vec3 v_normal;
    varying vec3 v_frag_coord; 
    uniform vec3 u_view_dir;
    uniform samplerCube u_cubemap;

    void main() {
      vec3 I = normalize(v_frag_coord - u_view_dir);
      vec3 R = reflect(I, normalize(v_normal));
      gl_FragColor = vec4(textureCube(u_cubemap, R).rgb, 1.0);
    }
  `;
    const sourceRefractionV = `
    attribute vec3 position;
    attribute vec2 texcoord;
    attribute vec3 normal;
    
    varying vec3 v_normal;
    varying vec3 v_frag_coord;
    
    uniform mat4 M;
    uniform mat4 itM;
    uniform mat4 V;
    uniform mat4 P;

    void main() {
      vec4 frag_coord = M*vec4(position, 1.0);
      gl_Position = (P*V*frag_coord);
      v_normal = vec3(itM * vec4(normal, 1.0));
      v_frag_coord = frag_coord.xyz;
    }
  `;

    const sourceRefractionF = `
    precision mediump float;
    varying vec3 v_normal;
    varying vec3 v_frag_coord;
    uniform vec3 u_view_dir;
    uniform samplerCube u_cubemap;

    void main() {
      float ratio = 1.00 / 1.52;
      vec3 I = normalize(v_frag_coord - u_view_dir);
      vec3 R = refract(I, normalize(v_normal), ratio);
      gl_FragColor = vec4(textureCube(u_cubemap, R).rgb, 1.0);
    }
  `;

    const sourceV_texture = `
    attribute vec3 position;
    attribute vec2 texcoord;
    attribute vec3 normal;
    attribute vec3 tangent;
    attribute vec3 bitangent;

    varying vec2 v_texcoord;
    varying vec3 v_frag_coord;
    varying mat3 TBN;
    
    uniform mat4 M;
    uniform mat4 V;
    uniform mat4 P;
    
    void main() {
      vec4 frag_coord = M*vec4(position, 1.0);
      gl_Position = P*V*frag_coord;

      v_frag_coord = frag_coord.xyz;
      v_texcoord = texcoord;

      vec3 T = normalize(vec3(M * vec4(tangent,   0.0)));
      vec3 N = normalize(vec3(M * vec4(normal,    0.0)));

      T = normalize(T - dot(T, N) * N);

      vec3 B = cross(N, T);

      TBN = mat3(T, B, N);
    }
  `;

    const sourceF_texture = `
    precision mediump float;
    varying vec3 v_frag_coord;
    varying vec2 v_texcoord;
    varying mat3 TBN;
    
    uniform sampler2D u_texture;
    uniform sampler2D u_normalMap;
    uniform vec3 u_light_pos;
    uniform vec3 u_view_dir;

    void main() {
      vec3 normal = texture2D(u_normalMap, vec2(v_texcoord.x, 1.0-v_texcoord.y)).rgb;
      normal = normal * 2.0 - 1.0;   
      normal = normalize(TBN * normal);
    
      // light color
      vec3 light_color = vec3(1.0, 1.0, 1.0);
      
      // Ambient
      float ambient = 1.0;
      
      vec3 L = normalize(u_light_pos - v_frag_coord);
      
      // Diffuse
      float diffusion = max(0.0, dot(normal, L));
      
      // specural
      float spec_strength = 0.8;
      vec3 view_dir = normalize(u_view_dir - v_frag_coord);
      vec3 reflect_dir = reflect(-L, normal);
      float spec = pow(max(dot(view_dir, reflect_dir), 0.0), 32.0);
      float specular = spec_strength * spec;

      vec3 color = (ambient ) * light_color;
      gl_FragColor = vec4(color, 1.0) * texture2D(u_texture, vec2(v_texcoord.x, 1.0-v_texcoord.y));
    }
  `;

    const sourceVMultiLight = `
    attribute vec3 position;
    attribute vec2 texcoord;
    attribute vec3 normal;
    attribute vec3 tangent;
    attribute vec3 bitangent;

    varying vec2 v_texcoord;
    varying vec3 v_frag_coord;
    varying mat3 TBN;
    
    uniform mat4 M;
    uniform mat4 V;
    uniform mat4 P;
    
    void main() {
      vec4 frag_coord = M*vec4(position, 1.0);
      gl_Position = P*V*frag_coord;

      v_frag_coord = frag_coord.xyz;
      v_texcoord = texcoord;

      vec3 T = normalize(vec3(M * vec4(tangent,   0.0)));
      vec3 N = normalize(vec3(M * vec4(normal,    0.0)));

      T = normalize(T - dot(T, N) * N);

      vec3 B = cross(N, T);

      TBN = mat3(T, B, N);
    }
  `;

    const sourceFMultiLight = `
    precision mediump float;
    varying vec3 v_frag_coord;
    varying vec2 v_texcoord;
    varying mat3 TBN;
    
    uniform sampler2D u_texture;
    uniform sampler2D u_normalMap;
    uniform vec3 u_view_dir;`
    + ObjectLoader.getInstance().generateLightStringInit()
    + `
    void main() {
      vec3 normal = texture2D(u_normalMap, vec2(v_texcoord.x, 1.0-v_texcoord.y)).rgb;
      normal = normal * 2.0 - 1.0;   
      normal = normalize(TBN * normal);
      float spec_strength = 0.8;
      float ambient = 0.1;
      vec3 L;
      float diffusion;
      vec3 view_dir;
      float spec;
      float specular;
      float att;
      vec3 reflect_dir;
      vec3 color;
      vec3 light_color;
    `
    + ObjectLoader.getInstance().generateLightStringBoolParse()
    + ObjectLoader.getInstance().generateLightStringComputation()
    +`
      gl_FragColor = vec4(color, 1.0) * texture2D(u_texture, vec2(v_texcoord.x, 1.0-v_texcoord.y));
    }
  `;

    const sourceShadowsV = `
    attribute vec3 position;
    attribute vec3 normal;
    
    uniform mat4 M;
    uniform mat4 uPMatrix;
    uniform mat4 uMVMatrix;

    void main (void) {
    vec4 pos = M*vec4(position, 1.0);
    gl_Position = uPMatrix * uMVMatrix * pos;
    }
		`;
		
		const sourceShadowsF = `
    precision mediump float;

    vec4 encodeFloat (float depth) {
      const vec4 bitShift = vec4(
          256 * 256 * 256,
          256 * 256,
          256,
          1.0
      );
      const vec4 bitMask = vec4(
          0,
          1.0 / 256.0,
          1.0 / 256.0,
          1.0 / 256.0
      );
      vec4 comp = fract(depth * bitShift);
      comp -= comp.xxyz * bitMask;
      return comp;
    }

    void main (void) {
    gl_FragColor = vec4(gl_FragCoord.z, gl_FragCoord.z,gl_FragCoord.z,1.0);
    }
    `;

    const sourceShadowsObjectsV = `
    attribute vec3 position;
    attribute vec2 texcoord;
    attribute vec3 normal;
    attribute vec3 tangent;
    attribute vec3 bitangent;
    
    uniform mat4 M;
    uniform mat4 itM;
    uniform mat4 V;
    uniform mat4 P;
    uniform mat4 lightMViewMatrix;
    uniform mat4 lightProjectionMatrix;

    varying vec3 v_normal;
    varying vec3 v_frag_coord;
    varying vec4 shadowPos;
    varying vec2 v_texcoord;
    varying mat3 TBN;
    
    void main (void) {
      vec4 frag_coord = M*vec4(position, 1.0);
      gl_Position = P*V*frag_coord;
    
      shadowPos = lightProjectionMatrix * lightMViewMatrix * frag_coord;

      v_normal = vec3(itM * vec4(normal, 1.0));
      v_frag_coord = frag_coord.xyz;
      v_texcoord = texcoord;

      vec3 T = normalize(vec3(M * vec4(tangent,   0.0)));
      vec3 N = normalize(vec3(M * vec4(normal,    0.0)));

      T = normalize(T - dot(T, N) * N);

      vec3 B = cross(N, T);

      TBN = mat3(T, B, N);
    }
    `;

    shadowDepthTextureSize = 1024;

    const sourceShadowsObjectsF = `
    precision mediump float;

    varying vec4 shadowPos;
    varying vec3 v_normal;
    varying vec3 v_frag_coord;
    varying vec2 v_texcoord;
    varying mat3 TBN;
    
    uniform vec3 u_light_pos;
    uniform vec3 u_view_dir;

    uniform sampler2D depthColorTexture;
    uniform sampler2D u_texture;
    uniform sampler2D u_normalMap;`
   + ObjectLoader.getInstance().generateLightStringInit()
   + `
    
    float shadowLightIntensity (vec3 fragmentDepth) {
      float texelSize = 1.0 / ${shadowDepthTextureSize}.0;
      float light = 0.0;
      float texelDepth;

      for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
          texelDepth = texture2D(depthColorTexture,fragmentDepth.xy 
          + vec2(x, y) * texelSize).x;
          if (fragmentDepth.z < texelDepth) {
            light += 1.0;
          }
        }
      }
      light /= 9.0;
      return light;
    }

    void main(void) {
      `
      + ObjectLoader.getInstance().generateLightStringBoolParse()
      + `
      float spec_strength = 0.8;
      float ambient = 0.1;
      vec3 L;
      float diffusion;
      vec3 view_dir;
      float spec;
      float specular;
      float att;
      vec3 reflect_dir;
      vec3 light_color;
      vec3 color;
      float amountInLight;
      light_color = vec3(1.0, 1.0, 1.0);

      //// Normal transform
      vec3 normal = texture2D(u_normalMap, vec2(v_texcoord.x, 1.0-v_texcoord.y)).rgb;
      normal = normal * 2.0 - 1.0;   
      normal = normalize(TBN * normal);

      //// Shadow computation
      vec3 fragmentDepth = shadowPos.xyz;
      float shadowAcneRemover = 0.007;
      fragmentDepth.z -= shadowAcneRemover;
      fragmentDepth = fragmentDepth * 0.5 + 0.5;

      amountInLight = shadowLightIntensity(fragmentDepth);

      //// Light computation
      `
      + ObjectLoader.getInstance().generateLightStringComputation()
      + `
      gl_FragColor = vec4(color, 1.0) * texture2D(u_texture, vec2(v_texcoord.x, 1.0-v_texcoord.y));
      
    }
`;

    const sourcePortalV = `
        attribute vec3 position;
        attribute vec2 texcoord;
        
        uniform mat4 M;
        uniform mat4 V;
        uniform mat4 P;

        varying vec2 v_texcoord;
        
        void main (void) {
          vec4 frag_coord = M*vec4(position, 1.0);
          gl_Position = P*V*frag_coord;
          v_texcoord = texcoord;
        }
        `;
      const sourcePortalF = `
          precision mediump float;

          varying vec2 v_texcoord;
          uniform sampler2D frameTexture;

          void main(void) {
            vec3 color = vec3(1.0, 1.0, 1.0);
            vec4 tex = texture2D(frameTexture, vec2(1.0-v_texcoord.x, v_texcoord.y));
            gl_FragColor = vec4(color, 1.0) * tex;

            // if(tex == vec4(0.0, 0.0, 0.0, 1.0)){
            //   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            // }
            // else {
            //   gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
            // }
            
            
          }
      `;

    // console.log(sourceShadowsObjectsF);


    function compile_shader(source, type) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            throw new Error('Failed to compile ' + type + ' shader');
        }
        
        return shader;
    }
    
    function create_program(vertex_shader, fragment_shader) {
        let program = gl.createProgram();
        gl.attachShader(program, vertex_shader);
        gl.attachShader(program, fragment_shader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          console.error(gl.getProgramInfoLog(program));
          throw new Error('Unable to compile program');
        }
        
        return program;
    }
    
    function get_uniforms() {
        const u_M = gl.getUniformLocation(program, 'M');
        const u_V = gl.getUniformLocation(program, 'V');
        const u_P = gl.getUniformLocation(program, 'P');
        const u_light_pos = gl.getUniformLocation(program, 'u_light_pos');
        const u_light_pos2 = gl.getUniformLocation(program, 'u_light_pos2');
        const u_light_color2 = gl.getUniformLocation(program, 'u_light_color2');
        const u_itM = gl.getUniformLocation(program, 'itM');
        const u_view_dir = gl.getUniformLocation(program, 'u_view_dir');
        const u_cubemap = gl.getUniformLocation(program, 'u_cubemap');
        const u_image_texture = gl.getUniformLocation(program, 'u_texture');
        const u_normal_map = gl.getUniformLocation(program, 'u_normalMap');
        return {
            "model": u_M,
            "view": u_V,
            "proj": u_P,
            "u_light_pos": u_light_pos,
            "u_light_pos2": u_light_pos2,
            "u_light_color2":u_light_color2,
            "itM": u_itM,
            "u_view_dir": u_view_dir,
            "u_cubemap": u_cubemap,
            "u_texture": u_image_texture,
            "u_normalMap": u_normal_map
        }
    }
    
    function use() {
        gl.useProgram(program);
    }

    switch(name){
        case "normal":
            vertex_shader = sourceV;
            fragment_shader = sourceF;
            break;
        case "cubemap":
            vertex_shader = sourceCubemapV;
            fragment_shader = sourceCubemapF;
            break;
        case "reflexion":
            vertex_shader = sourceReflexionV;
            fragment_shader = sourceReflexionF;
            break;
        case "refraction":
            vertex_shader = sourceRefractionV;
            fragment_shader = sourceRefractionF;
            break;
        case "texture":
          vertex_shader = sourceV_texture;
          fragment_shader = sourceF_texture;
          break;
        case "multi_light":
          vertex_shader = sourceVMultiLight;
          fragment_shader = sourceFMultiLight;
          break;
        case "shadow":
          vertex_shader = sourceShadowsV;
          fragment_shader = sourceShadowsF;
          break;
        case "shadow_objects":
          vertex_shader = sourceShadowsObjectsV;
          fragment_shader = sourceShadowsObjectsF;
          break;
        case "portal":
          vertex_shader = sourcePortalV;
          fragment_shader = sourcePortalF;
          break;
        default:
            console.log("Wrong shader type");
            break;
    }
    
    const shaderV = compile_shader(vertex_shader, gl.VERTEX_SHADER);
    const shaderF = compile_shader(fragment_shader, gl.FRAGMENT_SHADER);
    
    const program = create_program(shaderV, shaderF);
    
    return {
        name:name,
        program:program,
        get_uniforms:get_uniforms,
        use:use,
    }
}