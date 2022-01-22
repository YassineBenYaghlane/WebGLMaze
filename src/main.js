async function main() {
    const canvas = document.getElementById('webgl_canvas');
    c_width = canvas.width
    c_height = canvas.height
    const gl = canvas.getContext('webgl');

    gl.enable(gl.DEPTH_TEST);
    
    ObjectLoader.getInstance().init(gl);
            
    var cubemapObject = await ObjectLoader.getInstance().getObjectData("cube");
    var cubemapMesh = await ObjectLoader.getInstance().make_object(gl, cubemapObject);
    
    var loader = await map_loader();
    await loader.parse_map(gl, path="../maps/map.txt", objt_type="cube_texture");

    var shader_show_object = make_shader(gl, "normal");
    var shader_cubemap = make_shader(gl, "cubemap");
    var shader_reflexion = make_shader(gl, "refraction");
    var shader_texture = make_shader(gl, "texture");
    //var shader_multi_light = make_shader(gl, "multi_light");
    var shader_shadow = make_shader(gl, "shadow");
    var shader_shadow_objects = make_shader(gl, "shadow_objects");
    

    var player = await make_player(gl, obj_path="../obj/sphere_smooth.obj");
    player.setStartPosition(loader.getStartPosition());
    player.setEndPosition(loader.getEndPosition());
    player.place_player();

    var projection = player.get_projection(45.0, c_width / c_height, 0.01, 100.0);

    const itemElem = document.querySelector("#Keys");
    const camMatElem = document.querySelector("#camera_mat");
    const projMatElem = document.querySelector("#proj_mat");

    var texCube = make_texture_cubemap(gl, '../textures/cubemaps/fortnite');

    var shadowDepthTextureSize = 512

    var shadowFramebuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer)

    var shadowDepthTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, shadowDepthTexture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, shadowDepthTextureSize,
    shadowDepthTextureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    var renderBuffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
    shadowDepthTextureSize, shadowDepthTextureSize)

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D, shadowDepthTexture, 0)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
    gl.RENDERBUFFER, renderBuffer)

    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    var s = 3;
    var lightProjectionMatrix = glMatrix.mat4.ortho(
        [], -10 * s, 10 * s, -10 * s, 10 * s, -10 , 80 
      )
    var lightViewMatrix = glMatrix.mat4.lookAt(
        [], 
        ObjectLoader.getInstance().getLights()[0].getPosVec3(),
        [0, 0, 30],
        [0, 1, 0])


    function animate(time) {
        //Draw loop
        gl.clearColor(0.5, 0.5, 0.5, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        ObjectLoader.getInstance().animate(time);
        player.animate(time);

        view = player.get_view_matrix();

        // Shader for shadow map
        shader_shadow.use();
        var unif = shader_shadow.get_uniforms();

        var shadowPMatrix = gl.getUniformLocation(shader_shadow.program,'uPMatrix')
        var shadowMVMatrix = gl.getUniformLocation(shader_shadow.program,'uMVMatrix')

        gl.uniformMatrix4fv(shadowPMatrix, false, lightProjectionMatrix)
        gl.uniformMatrix4fv(shadowMVMatrix, false, lightViewMatrix)

        gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer)
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer)
        gl.bindTexture(gl.TEXTURE_2D, shadowDepthTexture)

        gl.enable(gl.DEPTH_TEST);
        gl.viewport(0, 0, shadowDepthTextureSize, shadowDepthTextureSize)
        gl.clearDepth(1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        ObjectLoader.getInstance().draw_map(gl, shader_shadow, unif);
        player.draw_player(gl, shader_shadow, unif);

        gl.bindTexture(gl.TEXTURE_2D, null)
        gl.bindRenderbuffer(gl.RENDERBUFFER, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)

        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.clearDepth(1.0)
        gl.clearColor(0.0, 0.0, 0.5, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        // shader for objects with shadows
        shader_shadow_objects.use();
        var unif = shader_shadow_objects.get_uniforms();
        
        gl.uniformMatrix4fv(unif['view'], false, view);
        gl.uniformMatrix4fv(unif['proj'], false, projection);
        var shadowPMatrix = gl.getUniformLocation(shader_shadow_objects.program,'lightProjectionMatrix')
        var shadowMVMatrix = gl.getUniformLocation(shader_shadow_objects.program,'lightMViewMatrix')
        gl.uniformMatrix4fv(shadowPMatrix, false, lightProjectionMatrix)
        gl.uniformMatrix4fv(shadowMVMatrix, false, lightViewMatrix)
        gl.uniform3fv(unif["u_light_pos"], ObjectLoader.getInstance().getLights()[0].getPosVec3());
        gl.uniform3fv(unif["u_view_dir"], player.get_camera_position());
        
        for(var i = 0; i < ObjectLoader.getInstance().getLights().length; i++){
            gl.uniform4fv(gl.getUniformLocation(shader_shadow_objects.program, `u_light_pos${i}`), ObjectLoader.getInstance().getLights()[i].getPosVec4());
            gl.uniform3fv(gl.getUniformLocation(shader_shadow_objects.program, `u_light_color${i}`), ObjectLoader.getInstance().getLights()[i].getCurrentColor());
        }

        var samplerUniform = gl.getUniformLocation(shader_shadow_objects.program,
            'depthColorTexture')
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, shadowDepthTexture)
        gl.uniform1i(samplerUniform, 0)
  
        ObjectLoader.getInstance().draw_map(gl, shader_shadow_objects, unif);
        // player.draw_player(gl, shader_shadow_objects, unif);

        // // Shader for cubemap
        gl.depthFunc(gl.LEQUAL);
        shader_cubemap.use();
        var unif = shader_cubemap.get_uniforms();

        cubemapMesh.activate(shader_cubemap);

        gl.uniformMatrix4fv(unif['model'], false, cubemapMesh.model);
        gl.uniformMatrix4fv(unif['view'], false, view);
        gl.uniformMatrix4fv(unif['proj'], false, projection);
        
        // Activate the texture for the cube
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, texCube);
        gl.uniform1i(unif["u_cubemap"], 0);

        cubemapMesh.draw();
        gl.depthFunc(gl.LESS);

        // // Classic shaders for objects

        // shader_show_object.use();
        // var unif = shader_show_object.get_uniforms();
        
        // gl.uniformMatrix4fv(unif['view'], false, view);
        // gl.uniformMatrix4fv(unif['proj'], false, projection);
        // gl.uniform3fv(unif["u_light_pos"], ObjectLoader.getInstance().getLights()[0].getPosVec3());
        // gl.uniform3fv(unif["u_view_dir"], player.get_camera_position());
  
        // ObjectLoader.getInstance().draw_map(gl, shader_show_object, unif);

        // // Texture shader
        // shader_texture.use();
        // var unif = shader_texture.get_uniforms();
        // gl.uniformMatrix4fv(unif['view'], false, view);
        // gl.uniformMatrix4fv(unif['proj'], false, projection);


        // gl.uniform3fv(unif["u_light_pos"], ObjectLoader.getInstance().getLights()[0].getPosVec3());
        // gl.uniform3fv(unif["u_view_dir"], player.get_camera_position());

        // ObjectLoader.getInstance().draw_map(gl, shader_texture, unif);
        
        // // Multi light shader
        // shader_multi_light.use();
        // var unif = shader_multi_light.get_uniforms();
        // gl.uniformMatrix4fv(unif['view'], false, view);
        // gl.uniformMatrix4fv(unif['proj'], false, projection);
        // gl.uniform3fv(unif["u_view_dir"], player.get_camera_position());

        // for(var i = 0; i < ObjectLoader.getInstance().getLights().length; i++){
        //     gl.uniform4fv(gl.getUniformLocation(shader_multi_light.program, `u_light_pos${i}`), ObjectLoader.getInstance().getLights()[i].getPosVec4());
        //     gl.uniform3fv(gl.getUniformLocation(shader_multi_light.program, `u_light_color${i}`), ObjectLoader.getInstance().getLights()[i].getCurrentColor());
        // }

        // ObjectLoader.getInstance().draw_map(gl, shader_multi_light, unif);

        // Effect shader
        gl.depthFunc(gl.LEQUAL);
        shader_reflexion.use();
        var unif = shader_reflexion.get_uniforms();
        gl.uniformMatrix4fv(unif['view'], false, view);
        gl.uniformMatrix4fv(unif['proj'], false, projection);

        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, texCube);
        gl.uniform1i(unif["u_cubemap"], 0);

        player.draw_player(gl, shader_reflexion, unif);

        gl.depthFunc(gl.LESS);

        // // Print Infos
        ObjectLoader.getInstance().getPlayerItemList().displayKeys(itemElem);
        // player.show_view_html(camMatElem, view);
        // player.show_model_html(projMatElem);
        fps(time);
        window.requestAnimationFrame(animate);
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