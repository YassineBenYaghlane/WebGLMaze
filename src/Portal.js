class Portal extends GameObject{

    constructor(x=0.0, y=0.0, z=0.0, texture="portal"){
        super("cube_texture", x, y, z, "portal", texture);
        this.depthTextureSize = 512
        
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

    initFrameBufferTexture(gl){
        this.test_texture = make_texture(gl, "../textures/brick.jpg")
        this.frameBuffer = gl.createFramebuffer()
        this.renderBuffer = gl.createRenderbuffer()
        this.texture = gl.createTexture()

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer)

        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512,
            0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 512, 512);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);

        if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE){
            console.log("fb incomplete")
            return error();
        }

        gl.bindTexture(gl.TEXTURE_2D, null)
        gl.bindRenderbuffer(gl.RENDERBUFFER, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    draw(gl, shader, unif, player, width, height){

        ObjectLoader.getInstance().draw_map(gl, shader, unif);
        player.draw_player(gl, shader, unif);

        
    }

    getTexture(){
        return this.texture;
    }

    getRenderBuffer(){
        return this.renderBuffer;
    }

    getFrameBuffer(){
        return this.frameBuffer;
    }
}