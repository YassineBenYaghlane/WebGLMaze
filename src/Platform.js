class Platform extends GameObject{

    constructor(x=0.0, y=0.0, z=0.0, texture="floor"){
        super("cube", x, y, z, "key", texture); //offset since the cube object is centered on itself
    }

    isObstacle(){
        return false;
    }

    async make(gl){
        this.mesh = await ObjectLoader.getInstance().make_object(gl, this.objectData);
        this.mesh.model = glMatrix.mat4.translate(this.mesh.model,this.mesh.model,
                    glMatrix.vec3.fromValues(this.x, this.y, this.z));

        this.mesh.model = glMatrix.mat4.scale(this.mesh.model,this.mesh.model, glMatrix.vec3.fromValues(1, 0.01, 1));
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