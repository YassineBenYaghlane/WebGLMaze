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
    var shader_multi_light = make_shader(gl, "multi_light");

    var player = await make_player(gl, obj_path="../obj/sphere_smooth.obj");
    player.setStartPosition(loader.getStartPosition());
    player.setEndPosition(loader.getEndPosition());
    player.place_player();

    var projection = player.get_projection(45.0, c_width / c_height, 0.01, 100.0);

    const itemElem = document.querySelector("#Keys");
    const camMatElem = document.querySelector("#camera_mat");
    const projMatElem = document.querySelector("#proj_mat");

    var texCube = make_texture_cubemap(gl, '../textures/cubemaps/twilight_sky_2');




    function animate(time) {
        //Draw loop
        gl.clearColor(0.2, 0.2, 0.2, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        ObjectLoader.getInstance().animate(time);
        player.animate(time);

        view = player.get_view_matrix();

        // Shader for cubemap
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

        // Classic shaders for objects

        shader_show_object.use();
        var unif = shader_show_object.get_uniforms();
        
        gl.uniformMatrix4fv(unif['view'], false, view);
        gl.uniformMatrix4fv(unif['proj'], false, projection);
        gl.uniform3fv(unif["u_light_pos"], ObjectLoader.getInstance().getLights()[0].getPosVec3());
        gl.uniform3fv(unif["u_view_dir"], player.get_camera_position());
  
        ObjectLoader.getInstance().draw_map(gl, shader_show_object, unif);

        // Texture shader
        shader_texture.use();
        var unif = shader_texture.get_uniforms();
        gl.uniformMatrix4fv(unif['view'], false, view);
        gl.uniformMatrix4fv(unif['proj'], false, projection);


        gl.uniform3fv(unif["u_light_pos"], ObjectLoader.getInstance().getLights()[0].getPosVec3());
        gl.uniform3fv(unif["u_view_dir"], player.get_camera_position());

        ObjectLoader.getInstance().draw_map(gl, shader_texture, unif);
        
        // Multi light shader
        shader_multi_light.use();
        var unif = shader_multi_light.get_uniforms();
        gl.uniformMatrix4fv(unif['view'], false, view);
        gl.uniformMatrix4fv(unif['proj'], false, projection);
        gl.uniform3fv(unif["u_view_dir"], player.get_camera_position());

        for(var i = 0; i < ObjectLoader.getInstance().getLights().length; i++){
            gl.uniform4fv(gl.getUniformLocation(shader_multi_light.program, `u_light_pos${i}`), ObjectLoader.getInstance().getLights()[i].getPosVec4());
            gl.uniform3fv(gl.getUniformLocation(shader_multi_light.program, `u_light_color${i}`), ObjectLoader.getInstance().getLights()[i].getCurrentColor());
        }

        ObjectLoader.getInstance().draw_map(gl, shader_multi_light, unif);

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

        // Print Infos
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