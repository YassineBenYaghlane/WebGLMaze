class Door extends GameObject{

    constructor(x=0.0, y=0.0, z=0.0, texture="brick2", animationNumber=1){
        super("cube_texture", x, y, z, "shadow_objects", texture, false);
        this.animationNumber = animationNumber;
        this.stepCount = 0;
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

    getAnimationNumber(){
        return this.animationNumber;
    }

    setAnimationNumber(a){
        this.animationNumber = a;
    }

    getWidth(){
        return this.width;
    }

    getDepth(){
        return this.depth;
    }

    animateTranslate(t, x, y, z, speed=0.01){
        if ( this.stepCount < 1.0/speed) {
            this.mesh.model = glMatrix.mat4.translate(this.mesh.model, this.mesh.model, glMatrix.vec3.fromValues(speed*x, speed*y, speed*z));
            this.x += speed * x;
            this.y += speed * y;
            this.z += speed * z;
            this.stepCount++;
        }
        else {
            this.stepCount = 0;
            this.setAnimation(false);
        }
    }

    animate(t){
        if(this.animation){
            switch(this.animationNumber){
                case 1:
                    this.animateTranslate(t, 0.0, -1.0, 0.0);
                    break;
                case 2:
                    this.animateTranslate(t, 0.0, 3.0, 0.0, 0.003);
                    break;
                case 3:
                    this.animateTranslate(t, 0.0, -2.0, 0.0);
                    break;
                default:
                    console.log(`Wrong animation number : ${this.animationNumber}`);
            }
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