var map_loader = async function() {

    var start_position = [0.0, -0.0, 0.0];
    var end_position = [0.0, 0.0, 0.0];
    
    async function parse_map(gl, path="../maps/map.txt", obj_type="cube", obj_width=2, obj_height=2, obj_depth=2) {
        const response = await fetch(path);
        const text = await response.text();
        
        var lines = text.split("\n");
        const width = lines[0].length;
        const height = lines.length;
        var light_counter = 0;
        
        var light = new Light(light_counter, 0, 20, -5, glMatrix.vec3.fromValues(1.0, 1.0, 1.0), false);
        light_counter++;
        ObjectLoader.getInstance().addLight(light);
        light = new Light(light_counter, start_position[0], start_position[1], start_position[2], glMatrix.vec3.fromValues(0.5, 0.5, 0.5), true);
        light.setOn(0.0);
        light_counter++;
        ObjectLoader.getInstance().addLight(light);

        for(var i = 0; i < height; i++){
            var line = lines[i];
            for(var j = 0; j < width; j++){
                var char = line[j];
                switch(char){
                    case 'W':
                        var go = new GameObject(obj_type, (-j) * obj_width, 0.0, (height - i) * obj_depth, "shadow_objects", "brick2");
                        await go.make(gl);
                        ObjectLoader.getInstance().addObject(go);
                        break;
                    case 'T':
                        var go = new GameObject(obj_type, (-j) * obj_width, 0.0, (height - i) * obj_depth, "shadow_objects", "brick2");
                        await go.make(gl);
                        ObjectLoader.getInstance().addObject(go);
                        var go = new GameObject(obj_type, (-j) * obj_width, 2.0, (height - i) * obj_depth, "shadow_objects", "brick2");
                        await go.make(gl);
                        ObjectLoader.getInstance().addObject(go);
                        break;
                    case 'S':
                        start_position = [(-j) * obj_width, -0.90, (height - i) * obj_depth];
                        var floor = new Platform(x=(-j) * obj_width, -1.0, (height - i) * obj_depth);
                        await floor.make(gl);
                        ObjectLoader.getInstance().addObject(floor);
                        ObjectLoader.getInstance().getLights()[1].setPosition(start_position);
                        break;
                    case 'F':
                        end_position = [(-j) * obj_width, 0.0, (height - i) * obj_depth];
                        var floor = new Platform(x=(-j) * obj_width, 1.0, (height - i) * obj_depth);
                        await floor.make(gl);
                        ObjectLoader.getInstance().addObject(floor);
                        var roof = new Platform(x=(-j) * obj_width, 3.0, (height - i) * obj_depth);
                        await roof.make(gl);
                        ObjectLoader.getInstance().addObject(roof);
                        break;
                    case ' ':
                        var floor = new Platform(x=(-j) * obj_width, -1.0, (height - i) * obj_depth);
                        await floor.make(gl);
                        ObjectLoader.getInstance().addObject(floor);
                        break;
                    case 'C':
                        var go = new GameObject(obj_type, 0.0, 0.0, 0.0, "texture");
                        await go.make(gl);
                        ObjectLoader.getInstance().addObject(go);
                        break;
                    case 'K':
                        var floor = new Platform(x=(-j) * obj_width, -1.0, (height - i) * obj_depth);
                        await floor.make(gl);
                        ObjectLoader.getInstance().addObject(floor); 
                        var key = new Key((-j) * obj_width, -0.85, (height - i) * obj_depth);
                        await key.make(gl);
                        var light = new Light(light_counter, (-j) * obj_width, -0.85, (height - i) * obj_depth, glMatrix.vec3.fromValues(1.0, 0.84, 0.0));
                        light_counter++;
                        key.setLight(light);
                        ObjectLoader.getInstance().addObject(key);
                        ObjectLoader.getInstance().addKey(key);
                        ObjectLoader.getInstance().addLight(light);
                        break;
                    case 'P':
                        var go = new Portal((-j) * obj_width, 0.0, (height - i) * obj_depth);
                        await go.make(gl);
                        ObjectLoader.getInstance().addObject(go);
                        break;
                    case 'Z':
                        var go = new Portal((-j) * obj_width, 0.0, (height - i) * obj_depth, texture="brick2", eye=[-17, 1, 26], center=[-18, 0.4, 26], teleport=true);
                        await go.make(gl);
                        ObjectLoader.getInstance().addObject(go);
                    case 'A':
                        var go = new Portal((-j) * obj_width, 0.0, (height - i) * obj_depth, texture="brick2", eye=[-3, 1, 34], center=[-4, 0.4, 34], teleport=true);
                        await go.make(gl);
                        ObjectLoader.getInstance().addObject(go);
                        break;
                    case 'M':
                        var go = new Portal((-j) * obj_width, 0.0, (height - i) * obj_depth, texture="brick2", eye=[-24, 1, 27], center=[-24, 0.4, 28], teleport=true);
                        await go.make(gl);
                        ObjectLoader.getInstance().addObject(go);
                        break;
                    case 'k':
                        var floor = new Platform(x=(-j) * obj_width, 1.0, (height - i) * obj_depth);
                        await floor.make(gl);
                        ObjectLoader.getInstance().addObject(floor); 
                        var key = new Key((-j) * obj_width, 1.90, (height - i) * obj_depth);
                        await key.make(gl);
                        var light = new Light(light_counter, (-j) * obj_width, 1.9, (height - i) * obj_depth, glMatrix.vec3.fromValues(1.0, 0.84, 0.0));
                        light_counter++;
                        key.setLight(light);
                        var roof = new Platform(x=(-j) * obj_width, 3.0, (height - i) * obj_depth);
                        await roof.make(gl);
                        ObjectLoader.getInstance().addObject(roof);
                        ObjectLoader.getInstance().addObject(key);
                        ObjectLoader.getInstance().addKey(key);
                        ObjectLoader.getInstance().addLight(light);
                        break;
                    case 'D':
                        var go = new Door((-j) * obj_width, 0.0, (height - i) * obj_depth);
                        await go.make(gl);
                        ObjectLoader.getInstance().addObject(go);
                        ObjectLoader.getInstance().addDoor(go);
                        var floor = new Platform(x=(-j) * obj_width, -1.0, (height - i) * obj_depth);
                        await floor.make(gl);
                        ObjectLoader.getInstance().addObject(floor);
                        break;
                    case 'd':
                        var go = new Door((-j) * obj_width, 2.0, (height - i) * obj_depth, "metal", 3);
                        await go.make(gl);
                        ObjectLoader.getInstance().addObject(go);
                        ObjectLoader.getInstance().addDoor(go);
                        var floor = new Platform(x=(-j) * obj_width, 1.0, (height - i) * obj_depth);
                        await floor.make(gl);
                        ObjectLoader.getInstance().addObject(floor);
                        var roof = new Platform(x=(-j) * obj_width, 3.0, (height - i) * obj_depth);
                        await roof.make(gl);
                        ObjectLoader.getInstance().addObject(roof);
                        break;
                    case 'w':
                        var go = new GameObject(obj_type, (-j) * obj_width, 2.0, (height - i) * obj_depth, "shadow_objects", "metal");
                        await go.make(gl);
                        ObjectLoader.getInstance().addObject(go);
                        break;
                    case '^':
                        var roof = new Platform(x=(-j) * obj_width, 3.0, (height - i) * obj_depth);
                        await roof.make(gl);
                        ObjectLoader.getInstance().addObject(roof);
                        var floor = new Platform(x=(-j) * obj_width, 1.0, (height - i) * obj_depth);
                        await floor.make(gl);
                        ObjectLoader.getInstance().addObject(floor);
                        break;
                    case 't':
                        var go = new GameObject(obj_type, (-j) * obj_width, 0.0, (height - i) * obj_depth, "shadow_objects", "floor");
                        await go.make(gl);
                        ObjectLoader.getInstance().addObject(go);
                        var roof = new Platform(x=(-j) * obj_width, 3.0, (height - i) * obj_depth);
                        await roof.make(gl);
                        ObjectLoader.getInstance().addObject(roof);
                        break;
                    case 'm':
                        var go = new GameObject(obj_type, (-j) * obj_width, 0.0, (height - i) * obj_depth, "shadow_objects", "brick2");
                        await go.make(gl);
                        ObjectLoader.getInstance().addObject(go);
                        // var go = new GameObject(obj_type, (-j) * obj_width, 2.0, (height - i) * obj_depth, "shadow_objects", "brick2");
                        // await go.make(gl);
                        // ObjectLoader.getInstance().addObject(go);
                        // var go = new GameObject(obj_type, (-j) * obj_width, 4.0, (height - i) * obj_depth, "shadow_objects", "brick2");
                        // await go.make(gl);
                        // ObjectLoader.getInstance().addObject(go);
                        break;
                    case 'p':
                        var floor = new Platform(x=(-j) * obj_width, -1.0, (height - i) * obj_depth);
                        await floor.make(gl);
                        ObjectLoader.getInstance().addObject(floor);
                        break;
                    default :
                        console.log("Wrong character");
                }
            }
        }
    };

    function getStartPosition(){
        return start_position;
    }

    function getEndPosition(){
        return end_position;
    }

    return {
        getStartPosition: getStartPosition,
        getEndPosition: getEndPosition,
        parse_map: parse_map
    }
}