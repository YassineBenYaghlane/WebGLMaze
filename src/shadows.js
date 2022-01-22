var shadow_manager = function(gl){
    var shadowDepthTextureSize = 512
    var shadowFramebuffer = gl.createFramebuffer()
    var shadowDepthTexture = gl.createTexture()
    var renderBuffer = gl.createRenderbuffer()


    function init(gl){
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer)

        gl.bindTexture(gl.TEXTURE_2D, shadowDepthTexture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, shadowDepthTextureSize,
        shadowDepthTextureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

        gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer)
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
        shadowDepthTextureSize, shadowDepthTextureSize)

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D, shadowDepthTexture, 0)
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER, renderBuffer)

        gl.bindTexture(gl.TEXTURE_2D, null)
        gl.bindRenderbuffer(gl.RENDERBUFFER, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    function draw(gl, shader, unif, player){
        gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer)
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer)
        gl.bindTexture(gl.TEXTURE_2D, shadowDepthTexture)

        gl.enable(gl.DEPTH_TEST);
        gl.viewport(0, 0, shadowDepthTextureSize, shadowDepthTextureSize)
        gl.clearDepth(1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        ObjectLoader.getInstance().draw_map(gl, shader, unif);
        player.draw_player(gl, shader, unif);

        gl.bindTexture(gl.TEXTURE_2D, null)
        gl.bindRenderbuffer(gl.RENDERBUFFER, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    return {
        shadowDepthTextureSize, shadowDepthTextureSize,
        shadowDepthTexture, shadowDepthTexture,
        init:init,
        draw:draw
    }
}