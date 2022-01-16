class Platform extends GameObject{

    constructor(x=0.0, y=0.0, z=0.0, texture="floor2"){
        super("cube", x, y, z, "multi_light", texture); //offset since the cube object is centered on itself
    }

    isObstacle(){
        return true;
    }

    async make(gl){
        this.mesh = await ObjectLoader.getInstance().make_object(gl, this.objectData);
        this.mesh.model = glMatrix.mat4.translate(this.mesh.model,this.mesh.model,
                    glMatrix.vec3.fromValues(this.x, this.y, this.z));

        this.mesh.model = glMatrix.mat4.scale(this.mesh.model,this.mesh.model, glMatrix.vec3.fromValues(1, 0.01, 1));
    }

    isIn(position){
        let player_size = 0.05;
        if(position[0] >= this.x-1 - player_size && position[0] <= this.x+1 + player_size &&
            position[1] >= this.y-0.03 - player_size && position[1] <= this.y+0.01 + player_size &&
            position[2] >= this.z-1 - player_size && position[2] <= this.z+1 + player_size){
            return true;
        }
        return false;
    }

    getMesh(){
        return this.mesh;
    }

    getWidth(){
        return this.width;
    }

    getDepth(){
        return this.depth;
    }

}