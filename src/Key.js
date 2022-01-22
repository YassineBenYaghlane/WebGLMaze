class Key extends GameObject{

    constructor(x=0.0, y=0.0, z=0.0){
        super("key", x, y, z, "shadow_objects", "gold", true);
        this.light = undefined;
    }

    isObstacle(){
        return false;
    }

    async make(gl){
        this.mesh = await ObjectLoader.getInstance().make_object_texture(gl, this.objectData);
        this.mesh.model = glMatrix.mat4.translate(this.mesh.model,this.mesh.model,
                    glMatrix.vec3.fromValues(this.x, this.y, this.z));
        this.mesh.model = glMatrix.mat4.rotate(this.mesh.model, this.mesh.model,
                    -Math.PI/2.0, glMatrix.vec3.fromValues(0.0, 0.0, 1.0));
        this.mesh.model = glMatrix.mat4.scale(this.mesh.model, this.mesh.model,
                    glMatrix.vec3.fromValues(0.5, 0.5, 0.5));
    }

    getMesh(){
        return this.mesh;
    }

    getLight(){
        return this.light;
    }

    setLight(light){
        this.light = light;
    }

    getWidth(){
        return this.width;
    }

    getDepth(){
        return this.depth;
    }

    animate(t){
        this.mesh.model = glMatrix.mat4.rotate(this.mesh.model, this.mesh.model, 0.03, glMatrix.vec3.fromValues(1.0, 0.0, 0.0));
    }

    setShader(shader) {
        this.shader = shader;
    }

    isIn(position){
        let player_size = 0.05;
        if(position[0] >= this.x-0.1 - player_size && position[0] <= this.x+0.1 + player_size
            && position[1] >= this.y-0.4 - player_size && position[1] <= this.y+0.4 + player_size
            && position[2] >= this.z-0.1 - player_size && position[2] <= this.z+0.1 + player_size){
            return true;
        }
        return false;
    }
}