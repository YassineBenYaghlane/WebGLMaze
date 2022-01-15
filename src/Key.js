class Key extends GameObject{

    constructor(x=0.0, y=0.0, z=0.0){
        super("key", x, y, z, "normal");
    }

    isObstacle(){
        return false;
    }

    async make(gl){
        this.mesh = await ObjectLoader.getInstance().make_object(gl, this.objectData);
        this.mesh.model = glMatrix.mat4.translate(this.mesh.model,this.mesh.model,
                    glMatrix.vec3.fromValues(this.x, this.y, this.z));
        this.mesh.model = glMatrix.mat4.rotate(this.mesh.model, this.mesh.model,
                    -Math.PI/2.0, glMatrix.vec3.fromValues(0.0, 0.0, 1.0));
        this.mesh.model = glMatrix.mat4.scale(this.mesh.model, this.mesh.model,
                    glMatrix.vec3.fromValues(0.5, 0.5, 0.5));
    }

    isIn(position){
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