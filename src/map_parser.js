var map_loader = async function() {
    var objects = [];
    
    async function parse_map(gl, path="../maps/map.txt", obj_path="../obj/cube.obj", obj_width=2, obj_height=2, obj_depth=2) {
        const response = await fetch(path);
        const text = await response.text();
        
        var lines = text.split("\n");
        const width = lines[0].length;
        const height = lines.length;

        var object = await load_obj(obj_path);

        
        for(var i = 0; i < height; i++){
            var line = lines[i];
            for(var j = 0; j < width; j++){
                var char = line[j];
                switch(char){
                    case 'W':
                        var mesh = await make_object(gl, object);
                        mesh.model = glMatrix.mat4.translate(mesh.model,mesh.model,
                            glMatrix.vec3.fromValues((-j)*obj_width, 0.0, (height-i)*obj_depth));
                        objects.push(mesh);
                        break;
                    case ' ':
                        break;
                    default :
                        console.log("Wrong character");
                }
            }
        }
        return objects;
    };

    function draw_map(gl, shader_show_object, unif){
        for(var i = 0; i < objects.length; i++){
            objects[i].activate(shader_show_object);
            gl.uniformMatrix4fv(unif['model'], false, objects[i].model);
            objects[i].draw();
        };
    };

    return {
        parse_map: parse_map,
        draw_map: draw_map
    }
}