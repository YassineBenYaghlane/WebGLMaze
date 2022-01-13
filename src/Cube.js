class Cube extends GameObject{
    constructor(x, y, z){
        super("cube.obj", x, y, z);
        
    };

    isObstacle(){
        return true;
    };
};
