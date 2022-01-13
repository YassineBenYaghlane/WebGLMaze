var map_loader = async function() {
    
    async function parse_map(gl, path="../maps/map.txt", obj_type="cube", obj_width=2, obj_height=2, obj_depth=2) {
        const response = await fetch(path);
        const text = await response.text();
        
        var lines = text.split("\n");
        const width = lines[0].length;
        const height = lines.length;

        
        for(var i = 0; i < height; i++){
            var line = lines[i];
            for(var j = 0; j < width; j++){
                var char = line[j];
                switch(char){
                    case 'W':
                        var go = new GameObject(obj_type, (-j) * obj_width, 0.0, (height - i) * obj_depth);
                        await go.make(gl);
                        ObjectLoader.getInstance().addObject(go);
                        break;
                    case ' ':
                        break;
                    case 'C':
                        var go = new GameObject(obj_type, 0.0, 0.0, 0.0);
                        await go.make(gl);
                        ObjectLoader.getInstance().addObject(go);
                        break;
                    default :
                        console.log("Wrong character");
                }
            }
        }
    };

    return {
        parse_map: parse_map
    }
}