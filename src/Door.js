class Door extends GameObject{

    constructor(x=0.0, y=0.0, z=0.0){
        super("cube_texture", x, y, z, "texture", "brick2", false);
    }

    isObstacle(){
        return true;
    }

    async make(gl){
        this.mesh = await ObjectLoader.getInstance().make_object_texture(gl, this.objectData);
        this.mesh.model = glMatrix.mat4.translate(this.mesh.model,this.mesh.model,
                    glMatrix.vec3.fromValues(this.x, this.y, this.z));
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

    animate(t){
        if ( this.y > -3.1 ) {
            this.mesh.model = glMatrix.mat4.translate(this.mesh.model, this.mesh.model, glMatrix.vec3.fromValues(0.0, -0.01, 0.0));
            this.y -= 0.01;
            console.log('down');
        }
        else {
            ObjectLoader.getInstance().remove(ObjectLoader.getInstance().getObjects(), this);
            ObjectLoader.getInstance().remove(ObjectLoader.getInstance().getDoors(), this);
        }
    }

    setShader(shader) {
        this.shader = shader;
    }

    getPosition() {
        return glMatrix.vec3.fromValues(this.x, this.y, this.z);
    }

    isIn(position){
        let player_size = 0.05;
        if(position[0] >= this.x-1 - player_size && position[0] <= this.x+1 + player_size
            && position[1] >= this.y-1 - player_size && position[1] <= this.y+1 + player_size
            && position[2] >= this.z-1 - player_size && position[2] <= this.z+1 + player_size){
            return true;
        }
        return false;
    }

    checkStartAnimation(position){
        let player_size = 0.05;
        if(position[0] >= this.x-2 - player_size && position[0] <= this.x+2 + player_size
            && position[1] >= this.y-2 - player_size && position[1] <= this.y+2 + player_size
            && position[2] >= this.z-2 - player_size && position[2] <= this.z+2 + player_size){
            return true;
        }
        return false;
    }
}