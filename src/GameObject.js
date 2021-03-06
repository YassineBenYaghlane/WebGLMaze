class GameObject {
    objectData = null;
    mesh = null;

    constructor(name = 'cube', x=0.0, y=0.0, z=0.0, shader="normal", texture="brick2", animation=false){
        this.name = name;
        this.x = x;
        this.y = y;
        this.z = z;
        this.shader = shader;
        this.objectData = ObjectLoader.getInstance().getObjectData(name);
        this.texture = texture;
        this.textureNormalMap = texture + "NormalMap";
        this.animation = animation;
    }

    isObstacle(){
        return true;
    }

    async make(gl){
        this.mesh = await ObjectLoader.getInstance().make_object_texture(gl, this.objectData);
        this.mesh.model = glMatrix.mat4.translate(this.mesh.model,this.mesh.model,
                    glMatrix.vec3.fromValues(this.x, this.y, this.z));
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

    getMesh(){
        return this.mesh;
    }

    getShader(){
        return this.shader;
    }

    getAnimation(){
        return this.animation
    }

    getPosition(){
        return [this.x, this.y, this.z];
    }

    setPosition(position){
        this.x = position[0];
        this.y = position[1];
        this.z = position[2];
    }

    animate(t){}

    setAnimation(b) {
        this.animation = b;
    };
}