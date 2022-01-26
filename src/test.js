async function main() {
    // Boilerplate
    const canvas = document.getElementById('webgl_canvas');
    c_width = canvas.width
    c_height = canvas.height
    const gl = canvas.getContext('webgl');

    gl.enable(gl.DEPTH_TEST);

    var prev = 0
    const fpsElem = document.querySelector("#fps");

    // WebGL adaptation
    
    var shader_shadow = make_shader(gl, "shadow");
    var shader_shadow_objects = make_shader(gl, "shadow_objects");
    
    ObjectLoader.getInstance().init(gl)

    var player = await make_player(gl, obj_path="../obj/sphere_smooth.obj");
    player.place_player();
    player.setStartPosition(glMatrix.vec3.fromValues(0.0, -0.9, -30))

    var projection = player.get_projection(45.0, c_width / c_height, 0.01, 100.0);

    var light = new Light(0, 0, 20, -5, glMatrix.vec3.fromValues(1.0, 1.0, 1.0), false);
    ObjectLoader.getInstance().addLight(light);

    var s = 3;
    var lightProjectionMatrix = glMatrix.mat4.ortho(
        [], -10 * s, 10 * s, -10 * s, 10 * s, -10 , 80 
      )
    var lightViewMatrix = glMatrix.mat4.lookAt(
        [], 
        ObjectLoader.getInstance().getLights()[0].getPosVec3(),
        [0, 0, 30],
        [0, 1, 0])
    
    var shadow = shadow_manager(gl);
    shadow.init(gl);


    // Ammojs variables
    let physicsWorld;
    var rigidBodies = []
    var rigidBodiesPhysics = []
    var tmpTrans;

    Ammo().then( start )
                
    async function start(){
        tmpTrans = new Ammo.btTransform();
        setupPhysicsWorld()
        await createBlock()
        await createBall()
        animate(0)
        

    }

    function setupPhysicsWorld(){

        let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
            dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
            overlappingPairCache    = new Ammo.btDbvtBroadphase(),
            solver                  = new Ammo.btSequentialImpulseConstraintSolver();

        physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

    }

    async function createBlock(){

        let pos = {x: 0, y: -8, z: 5};
        let quat = {x: 0, y: 0, z: 0, w: 1};
        let scale = {x: 2, y: 2, z: 2};
        let mass = 0;

        var go = new GameObject("cube", pos.x, pos.y, pos.z, "shadow_objects", "brick2");
        await go.make(gl);
        ObjectLoader.getInstance().addObject(go);

    
        //Ammojs Section
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( go.x, go.y, go.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        let motionState = new Ammo.btDefaultMotionState( transform );
    
        let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
        colShape.setMargin( 0.05 );
    
        let localInertia = new Ammo.btVector3( 0, 0, 0 );
        colShape.calculateLocalInertia( mass, localInertia );
    
        let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
        let body = new Ammo.btRigidBody( rbInfo );
    
    
        physicsWorld.addRigidBody( body );
        
    }

    async function createBall(){
    
        let pos = {x: 0, y: 10, z: 5};
        let scale = {x: 2, y: 2, z: 2};
        let quat = {x: 0, y: 0, z: 0, w: 1};
        let mass = 1;
    
        //threeJS Section
        var go = new GameObject("sphere", pos.x, pos.y, pos.z, "shadow_objects", "brick2");
        await go.make(gl);
        ObjectLoader.getInstance().addObject(go);
    

        //Ammojs Section
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( go.x, go.y, go.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        let motionState = new Ammo.btDefaultMotionState( transform );
    
        let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
        colShape.setMargin( 0.05 );
    
        let localInertia = new Ammo.btVector3( 0, 0, 0 );
        colShape.calculateLocalInertia( mass, localInertia );
    
        let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
        let body = new Ammo.btRigidBody( rbInfo );
    
    
        physicsWorld.addRigidBody( body );
        
        rigidBodies.push(go);
        rigidBodiesPhysics.push(body);
    }

    function updatePhysics( deltaTime ){
        if(physicsWorld != undefined){

            // Step world
            physicsWorld.stepSimulation( deltaTime, 10 );

            // Update rigid bodies
            for ( let i = 0; i < rigidBodies.length; i++ ) {
                let objThree = rigidBodies[ i ]; // game object
                let objAmmo = rigidBodiesPhysics[ i ]; // ammo object (rigid body)
                let ms = objAmmo.getMotionState();
                if ( ms ) {
        
                    ms.getWorldTransform( tmpTrans );
                    let p = tmpTrans.getOrigin();
                    let q = tmpTrans.getRotation();
                    // objThree.position.set( p.x(), p.y(), p.z() );
                    // objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );
                    objThree.setPosition(glMatrix.vec3.fromValues(p.x(), p.y(), p.z()))
        
                }
            }
        }
    }



    function animate(time) {
        //Draw loop
        gl.clearColor(0.75, 0.82, 0.9, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        var deltaTime = (time - prev)/1000.0;
        player.animate(time)
        updatePhysics( deltaTime );

        view = player.get_view_matrix();


        //// Shader for shadow map
        // shader_shadow.use();
        // var unif = shader_shadow.get_uniforms();

        // var shadowPMatrix = gl.getUniformLocation(shader_shadow.program,'uPMatrix')
        // var shadowMVMatrix = gl.getUniformLocation(shader_shadow.program,'uMVMatrix')

        // gl.uniformMatrix4fv(shadowPMatrix, false, lightProjectionMatrix)
        // gl.uniformMatrix4fv(shadowMVMatrix, false, lightViewMatrix)

        // shadow.draw(gl, shader_shadow, unif, player);

        // Shader shadow objects
        shader_shadow_objects.use();
        var unif = shader_shadow_objects.get_uniforms();
        
        gl.uniformMatrix4fv(unif['view'], false, view);
        gl.uniformMatrix4fv(unif['proj'], false, projection);
        var shadowPMatrix = gl.getUniformLocation(shader_shadow_objects.program,'lightProjectionMatrix')
        var shadowMVMatrix = gl.getUniformLocation(shader_shadow_objects.program,'lightMViewMatrix')
        gl.uniformMatrix4fv(shadowPMatrix, false, lightProjectionMatrix)
        gl.uniformMatrix4fv(shadowMVMatrix, false, lightViewMatrix)
        gl.uniform3fv(unif["u_light_pos"], ObjectLoader.getInstance().getLights()[0].getPosVec3());
        gl.uniform3fv(unif["u_view_dir"], player.get_camera_position());
        
        for(var i = 0; i < ObjectLoader.getInstance().getLights().length; i++){
            gl.uniform4fv(gl.getUniformLocation(shader_shadow_objects.program, `u_light_pos${i}`), ObjectLoader.getInstance().getLights()[i].getPosVec4());
            gl.uniform3fv(gl.getUniformLocation(shader_shadow_objects.program, `u_light_color${i}`), ObjectLoader.getInstance().getLights()[i].getCurrentColor());
        }

        var samplerUniform = gl.getUniformLocation(shader_shadow_objects.program,
            'depthColorTexture')
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, shadow.shadowDepthTexture)
        gl.uniform1i(samplerUniform, 0)
  
        ObjectLoader.getInstance().draw_map(gl, shader_shadow_objects, unif);

        fps(time)
        window.requestAnimationFrame(animate);
    }

    function fps(now) {
        now *= 0.001;
        const deltaTime = now - prev;
        prev = now;
        const fps = 1 / deltaTime;
        fpsElem.textContent = 'FPS: ' + fps.toFixed(1);
        return fps;
    }       
        animate(0);
}


main();












