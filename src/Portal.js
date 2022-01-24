class Portal extends GameObject{

    constructor(x=0.0, y=0.0, z=0.0, texture="brick2", eye=[-14, 17, 32], center=[-14, 0, 32.001], teleport=false){
        super("cube_texture", x, y, z, "shadow_objects", texture);
        this.center = center;
        this.eye = eye
        this.depthTextureSize = 512
        this.viewMatrix = this.buildViewMatrix(eye, center);
        this.teleport = teleport;
    }

    buildViewMatrix(eye, center){
        var v = glMatrix.mat4.create()
        v = glMatrix.mat4.lookAt(
            [], 
            eye, //camera pos
            center, // looking at
            [0, 1, 0])
        return v
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
        this.textureFrameBuffer = gl.createTexture()

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer)

        gl.bindTexture(gl.TEXTURE_2D, this.textureFrameBuffer)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512,
            0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 512, 512);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureFrameBuffer, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);

        if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE){
            console.log("fb incomplete")
            return error();
        }

        gl.bindTexture(gl.TEXTURE_2D, null)
        gl.bindRenderbuffer(gl.RENDERBUFFER, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    draw(gl, shader, unif){
        var textureBind = gl.getUniformLocation(shader.program,
            'frameTexture')
        gl.activeTexture(gl.TEXTURE0 )
        gl.bindTexture(gl.TEXTURE_2D, this.textureFrameBuffer)
        gl.uniform1i(textureBind,0)
  
        this.mesh.activate(shader);
        gl.uniformMatrix4fv(unif['model'], false, this.mesh.model);
        let itM = glMatrix.mat4.create();
        itM = glMatrix.mat4.invert(itM, this.mesh.model);
        itM = glMatrix.mat4.transpose(itM, itM);
        gl.uniformMatrix4fv(gl.getUniformLocation(shader.program, 'itM'), false, itM);
        gl.activeTexture(gl.TEXTURE0 + 1);
        gl.bindTexture(gl.TEXTURE_2D, ObjectLoader.getInstance().getTextures()[this.texture]);
        gl.uniform1i(unif["u_texture"], 1);
        gl.activeTexture(gl.TEXTURE0 + 2);
        gl.bindTexture(gl.TEXTURE_2D, ObjectLoader.getInstance().getTextures()[this.textureNormalMap]);
        gl.uniform1i(unif["u_normalMap"], 2);
        this.mesh.draw();
        
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