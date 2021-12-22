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
attribute vec2 texcoord;
attribute vec3 normal;
varying vec2 v_texcoord;
varying vec3 v_color;

uniform mat4 M;
uniform mat4 V;
uniform mat4 P;

void main() {
gl_Position = P*V*M*vec4(position, 1);
v_texcoord = texcoord;
// We will display the normals as a color
v_color = (normal+1.0)/2.0;
}
`;

    const sourceF = `
precision mediump float;
varying vec2 v_texcoord;
varying vec3 v_color;

uniform sampler2D u_texture;

void main() {
//gl_FragColor = texture2D(u_texture, vec2(v_texcoord.x, 1.0-v_texcoord.y));
gl_FragColor = vec4(normalize(v_color), 1.0);
}
`;

    var shader_show_object = make_shader(gl, sourceV, sourceF);
    
    // loading the object from a file
    var cube = await load_obj('../obj/bunny_big.obj');
    // Asynchronous call, we waited till the object was ready
    // Make the buffer and the functions to draw the object:
    var cube_mesh = await make_object(gl, cube)

    position = glMatrix.vec3.fromValues(0, 0, -4.0)
    up = glMatrix.vec3.fromValues(0.0, 1.0, 0.0)
    yaw = -90.0
    pitch = 0.0
    var camera = make_camera(canvas, position, up, yaw, pitch)
    var projection = camera.get_projection(45.0, c_width / c_height, 0.01, 100.0)

    const camMatElem = document.querySelector("#camera_mat");
    const projMatElem = document.querySelector("#proj_mat");
    camera.show_projection_html(projMatElem, projection);


    var deltaTime = 0;

    function animate(time) {
        deltaTime += 0.005;
        camera.update(deltaTime);
        //Draw loop
        gl.clearColor(0.2, 0.2, 0.2, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        shader_show_object.use();
        cube_mesh.activate(shader_show_object);

        var unif = shader_show_object.get_uniforms();

        view = camera.get_view_matrix();
        gl.uniformMatrix4fv(unif['model'], false, cube_mesh.model);
        gl.uniformMatrix4fv(unif['view'], false, view);
        gl.uniformMatrix4fv(unif['proj'], false, projection);

        cube_mesh.draw();

        camera.show_view_html(camMatElem, camera.get_view_matrix())
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