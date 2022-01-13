async function main() {
    // Boilerplate code
    const canvas = document.getElementById('webgl_canvas');
    c_width = canvas.width
    c_height = canvas.height
    const gl = canvas.getContext('webgl');

    // Enable tests for better rendering
    gl.enable(gl.DEPTH_TEST);
    //gl.enable(gl.CULL_FACE); // cull hidden faces behind normals!

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


    var shader_show_object = make_shader(gl, sourceV, sourceF);
    var shader_cubemap = make_shader(gl, sourceCubemapV, sourceCubemapF);
            
    // loading the object from a file
    var cubemapObject = await ObjectLoader.getInstance().getObjectData("cube");
    var cubemapMesh = await ObjectLoader.getInstance().make_object(gl, cubemapObject);
    
    // loading the object from a file
    // var cube = await load_obj('../obj/wall.obj');
    // Asynchronous call, we waited till the object was ready
    // Make the buffer and the functions to draw the object:

    var loader = await map_loader();
    loader.parse_map(gl, path="../maps/map.txt");
    

    var player = await make_player(gl, obj_path="../obj/sphere_smooth.obj");
    player.place_player();

    var projection = player.get_projection(45.0, c_width / c_height, 0.01, 100.0);

    // We define a light in space and retrieve its ID in the shader
    const light_pos = glMatrix.vec3.fromValues(0.0, 2.0, -10.0);
    const u_light_pos = gl.getUniformLocation(shader_show_object.program, 'u_light_pos');
    
    // We need to send the inverse transpose of the model matrix for the model
    const u_itM = gl.getUniformLocation(shader_show_object.program, 'itM');
    
    // We need the camera position
    const u_view_dir = gl.getUniformLocation(shader_show_object.program, 'u_view_dir');

    const camMatElem = document.querySelector("#camera_mat");
    const projMatElem = document.querySelector("#proj_mat");

    // Retrieve the adress of the cubemap texture
    var texCube = make_texture_cubemap(gl, '../textures/cubemaps/yokohama3');
    const u_cubemap = gl.getUniformLocation(shader_cubemap.program, 'u_cubemap');

    function animate(time) {
        //Draw loop
        gl.clearColor(0.2, 0.2, 0.2, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        


        view = player.get_view_matrix();

        // Shader for cubemap
        gl.depthFunc(gl.LEQUAL);
        shader_cubemap.use();
        cubemapMesh.activate(shader_cubemap);

        var unif = shader_cubemap.get_uniforms();

        gl.uniformMatrix4fv(unif['model'], false, cubemapMesh.model);
        gl.uniformMatrix4fv(unif['view'], false, view);
        gl.uniformMatrix4fv(unif['proj'], false, projection);
        
        // Activate the texture for the cube
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texCube);
        gl.uniform1i(u_cubemap, 0);

        cubemapMesh.draw();
        // set back the depth function for next frame
        gl.depthFunc(gl.LESS);

        // Classic shaders for objects

        shader_show_object.use();
        var unif = shader_show_object.get_uniforms();
        
        gl.uniformMatrix4fv(unif['view'], false, view);
        gl.uniformMatrix4fv(unif['proj'], false, projection);
        // Send the light position to the shader
        gl.uniform3fv(u_light_pos, light_pos);
        // Add the viewer position
        console.log(typeof( player.get_camera_position()))
        // Set one time the camera position for all the shaders
        gl.uniform3fv(u_view_dir, player.get_camera_position());

        player.draw_player(gl, shader_show_object, unif);
        ObjectLoader.getInstance().draw_map(gl, shader_show_object, unif);

        player.show_view_html(camMatElem, view);
        player.show_model_html(projMatElem);
        fps(time);
        window.requestAnimationFrame(animate); // While(True) loop!
    }

    var prev = 0
    const fpsElem = document.querySelector("#fps");

    function fps(now) {
        now *= 0.001;
        const deltaTime = now - prev;
        prev = now;
        const fps = 1 / deltaTime;
        fpsElem.textContent = 'FPS: ' + fps.toFixed(1);
        return fps;
    }

    animate(0);
}

main();