class Platform extends GameObject{
    width = 0.0;
    depth = 0.0;

    constructor(y=0.0, width, depth){
        super("cube", 1.0-width/2.0, y, 1.0 + depth/2.0, "normal"); //offset since the cube object is centered on itself
        this.width = width;
        this.depth = depth;
    }

    isObstacle(){
        return false;
    }

    async make(gl){
        this.mesh = await ObjectLoader.getInstance().make_object(gl, this.objectData);
        this.mesh.model = glMatrix.mat4.translate(this.mesh.model,this.mesh.model,
                    glMatrix.vec3.fromValues(this.x, this.y, this.z));

        this.mesh.model = glMatrix.mat4.scale(this.mesh.model,this.mesh.model, glMatrix.vec3.fromValues(this.width/2.0, 0.01, this.depth/2.0));
        console.log("Platform");
        console.log(this.mesh.model);
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