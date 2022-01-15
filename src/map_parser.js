var map_loader = async function() {

    var start_position = [0.0, 0.0, 0.0];
    var end_position = [0.0, 0.0, 0.0];
    
    async function parse_map(gl, path="../maps/map.txt", obj_type="cube", obj_width=2, obj_height=2, obj_depth=2) {
        const response = await fetch(path);
        const text = await response.text();
        
        var lines = text.split("\n");
        const width = lines[0].length;
        const height = lines.length;

        

        // var ceiling = new Plan(y=1.0, width*2.0, height*2.0);
        // await ceiling.make(gl);
        // ObjectLoader.getInstance().addObject(ceiling);

        for(var i = 0; i < height; i++){
            var line = lines[i];
            for(var j = 0; j < width; j++){
                var char = line[j];
                switch(char){
                    case 'W':
                        var go = new GameObject(obj_type, (-j) * obj_width, 0.0, (height - i) * obj_depth, "texture", "brick2");
                        await go.make(gl);
                        ObjectLoader.getInstance().addObject(go);
                        var plan = new Platform(x=(-j) * obj_width, -1.0, (height - i) * obj_depth);
                        await plan.make(gl);
                        ObjectLoader.getInstance().addObject(plan);
                        break;
                    case 'S':
                        start_position = [(-j) * obj_width, -0.8, (height - i) * obj_depth];
                        var plan = new Platform(x=(-j) * obj_width, -1.0, (height - i) * obj_depth);
                        await plan.make(gl);
                        ObjectLoader.getInstance().addObject(plan);
                        break;
                    case 'F':
                        end_position = [(-j) * obj_width, 0.0, (height - i) * obj_depth];
                        var plan = new Platform(x=(-j) * obj_width, -1.0, (height - i) * obj_depth);
                        await plan.make(gl);
                        ObjectLoader.getInstance().addObject(plan);
                        break;
                    case ' ':
                        var plan = new Platform(x=(-j) * obj_width, -1.0, (height - i) * obj_depth);
                        await plan.make(gl);
                        ObjectLoader.getInstance().addObject(plan);
                        break;
                    case 'C':
                        var go = new GameObject(obj_type, 0.0, 0.0, 0.0, "texture");
                        await go.make(gl);
                        ObjectLoader.getInstance().addObject(go);
                        break;
                    case 'K':
                        console.log('K');
                        var plan = new Platform(x=(-j) * obj_width, -1.0, (height - i) * obj_depth);
                        await plan.make(gl);
                        ObjectLoader.getInstance().addObject(plan); 
                        var key = new Key((-j) * obj_width, -0.8, (height - i) * obj_depth);
                        await key.make(gl);
                        ObjectLoader.getInstance().addObject(key); 
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