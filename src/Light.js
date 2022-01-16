class Light {
    constructor(id, x, y, z, color = glMatrix.vec3.fromValues(1.0, 0.0, 0.0), animation=true){
        this.id = id;
        this.x = x;
        this.y = y;
        this.z = z;
        this.color = color;
        this.currentColor = color;
        this.animation = animation;
        this.on = 1.0;
    };

    getColor(){
        return this.color;
    }

    getCurrentColor(){
        return this.currentColor;
    }

    getOn(){
        return this.on;
    }

    setOn(b){
        this.on = b;
    }


    getId(){
        return this.id;
    }

    getPosition(){
        return [this.x, this.y, this.z];
    }

    setPosition(position){
        this.x = position[0];
        this.y = position[1];
        this.z = position[2];
    }

    getPosVec4(){
        return glMatrix.vec4.fromValues(this.x, this.y, this.z, this.on)
    }

    getPosVec3(){
        return glMatrix.vec4.fromValues(this.x, this.y, this.z)
    }

    animate(t){
        if(this.animation){
            var factor = (0.5 + 0.5 * Math.sin(0.002 * t));
            this.currentColor = glMatrix.vec3.fromValues(factor * this.color[0], factor * this.color[1], factor * this.color[2]);
        }
    }
}