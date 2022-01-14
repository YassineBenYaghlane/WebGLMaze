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
    
    // Transform correctly the normals!
    v_normal = vec3(itM * vec4(normal, 1.0));
    
    v_frag_coord = frag_coord.xyz;
    
    // We will display the normals as a color
    //v_color = (normal + 1.0) / 2.0;
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
          float diffusion = max(0.0, dot(v_normal, L));
          
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
          uniform mat4 itM;  // inverse transpose model!
          uniform mat4 V;
          uniform mat4 P;
    
          // If you look at internet, different and maybe better ways
          // exist to define a skybox/environmental map/cubemap ;)
          // here it is defined like this only for convenience
          void main() {
            // we do NOT multiply by the model as
            // the cubemap should not move with the camera!
            // We keep only the rotation from the View matrix
            mat3 Vrotation = mat3(V);
            vec4 frag_coord = vec4(position, 1.0);
            // the positions xyz are divided by w after the vertex shader
            // the z component is equal to the depth value
            // we want a z always equal to 1.0 here, so we set z = w!
            // Remember: z=1.0 is the MAXIMUM depth value ;)
            // When we will have other objects, we need to change the
            // depth evaluation function (see next exercise)
            gl_Position = (P*mat4(Vrotation)*frag_coord).xyww;
            
            // We set the texture coordinates accordingly
            // to the position!
            v_texcoord = frag_coord.xyz;
          }
        `;
    
                const sourceCubemapF = `
          precision mediump float;
          varying vec3 v_texcoord;
          
          // We have a samplerCube this time! not a 2D texture
          uniform samplerCube u_cubemap;
    
          void main() {
            //gl_FragColor = texture2D(u_texture, vec2(v_texcoord.x, 1.0-v_texcoord.y));
            // We sample the cube at the position of the vertices!
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
        uniform mat4 itM;  // inverse transpose model!
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
        
        // We need the camera position to display a reflection/refraction!
        uniform vec3 u_view_dir;
        // This time We need the cubemap to display a reflection/refraction!
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
      uniform mat4 itM;  // inverse transpose model!
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
      
      // We need the camera position to display a reflection/refraction!
      uniform vec3 u_view_dir;
      // This time We need the cubemap to display a reflection/refraction!
      uniform samplerCube u_cubemap;

      void main() {
        /*
            Refraction indices:
            Air:      1.0
            Water:    1.33
            Ice:      1.309
            Glass:    1.52
            Diamond:  2.42
        */
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
        gl_FragColor = vec4(color, 1.0) * texture2D(u_texture, vec2(v_texcoord.x, 1.0-v_texcoord.y));
      }
    `;

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
        default:
            console.log("Wrong shader type");
            break;
    }
    
    const shaderV = compile_shader(vertex_shader, gl.VERTEX_SHADER);
    const shaderF = compile_shader(fragment_shader, gl.FRAGMENT_SHADER);
    
    const program = create_program(shaderV, shaderF);
    
    return {
        program:program,
        get_uniforms:get_uniforms,
        use:use,
    }
}