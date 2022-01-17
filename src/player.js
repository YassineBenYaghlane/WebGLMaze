var make_player = async function(gl, obj_path="../obj/cube.obj", canvas) {

    const PlayerMovement = {
        FORWARD: 1,
        BACKWARD: 2,
        LEFT: 3,
        RIGHT: 4
    }
    var canvas = canvas;
    var position = glMatrix.vec3.fromValues(0.0,  -0.90, -4.0);
    var front = glMatrix.vec3.fromValues(0, 0, 1.0);
    var up = glMatrix.vec3.fromValues(0.0, 1.0, 0.0);
    var right = glMatrix.vec3.fromValues(-1.0, 0.0, 0.0);
    var world_up = up;
    var start_position = glMatrix.vec3.fromValues(0.0,  -0.90, -4.0);
    var end_position = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);

    var camera_position = glMatrix.vec3.create();
    
    var delta = -1.0;

    var direction =  glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
    var rotationSpeed = 0.0;
    var angle = Math.PI/64.0;
    var rollAngle = Math.PI/64.0;

    var jumping = false;
    var startJumpTime = 0.0;
    var startJumpPos = -0.90;
    
    var yaw = 90.0;
    var pitch = 0.0;
    var movement_speed = 0.05;
    var mouse_sensitivity = 1.0;
    
    var object = await ObjectLoader.getInstance().load_obj(obj_path);
    var playerMesh = await ObjectLoader.getInstance().make_object(gl, object);

    var rolling_front = glMatrix.vec3.create();
    rolling_front = glMatrix.vec3.copy(rolling_front, front);
    var rolling_right = glMatrix.vec3.create();
    rolling_right = glMatrix.vec3.copy(rolling_right, right);
    var rolling_up = glMatrix.vec3.create();
    rolling_up = glMatrix.vec3.copy(rolling_up, up);

    var rotAxis = glMatrix.vec3.clone(front);
    var rollAxis = glMatrix.vec3.clone(rolling_right);

    move_player();
    update_camera_vectors();

    function update_model_position(angle=0.0, axis=up) {
        playerMesh.model[12] = position[0];
        playerMesh.model[13] = position[1];
        playerMesh.model[14] = position[2];
        playerMesh.model = glMatrix.mat4.rotate(playerMesh.model, playerMesh.model, angle, axis);
    }
    
    function place_player() {
        teleport(start_position);
        playerMesh.model = glMatrix.mat4.scale(playerMesh.model, playerMesh.model, glMatrix.vec3.fromValues(0.05, 0.05, 0.05));
    };

    function teleport(pos){
        position = glMatrix.vec3.fromValues(pos[0], pos[1], pos[2]);
        update_model_position();
    }

    function setStartPosition(pos){
        start_position = glMatrix.vec3.fromValues(pos[0], pos[1], pos[2]);
    }

    function setEndPosition(pos){
        end_position = glMatrix.vec3.fromValues(pos[0], pos[1], pos[2]);
    }

    function draw_player(gl, shader, unif) {
        
        gl.uniformMatrix4fv(unif['model'], false, playerMesh.model);
        let itM = glMatrix.mat4.create();
        itM = glMatrix.mat4.invert(itM, playerMesh.model);
        itM = glMatrix.mat4.transpose(itM, itM);
        itM = glMatrix.mat4.scale(itM, itM, glMatrix.vec3.fromValues(0.05, 0.05, 0.05));
        gl.uniformMatrix4fv(unif['itM'], false, itM);
        gl.uniform3fv(unif['u_view_dir'], get_camera_position());
        playerMesh.activate(shader);
        playerMesh.draw();
    };

    function move_player() {
        let keysPressed = {};
        document.addEventListener('keydown', (event) => {
            keysPressed[event.key] = true;
         
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === ' ') {
                event.view.event.preventDefault();
            }

            direction = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
            rotAxis = glMatrix.vec3.copy(rotAxis, rolling_front);
            rollAxis = glMatrix.vec3.copy(rollAxis, rolling_right);
            angle = Math.PI/64.0;
            rollAngle = Math.PI/64.0;
            
            if (event.key === 'ArrowDown') {
                direction = glMatrix.vec3.scale(direction, front, -1);
                rollAxis = glMatrix.vec3.copy(rollAxis, rolling_front);
                rotAxis = glMatrix.vec3.copy(rotAxis, rolling_right);
                rollAngle *= -1;
            } else if (event.key === 'ArrowUp') {
                direction = glMatrix.vec3.scale(direction, front, 1);
                rollAxis = glMatrix.vec3.copy(rollAxis, rolling_front);
                rotAxis = glMatrix.vec3.copy(rotAxis, rolling_right);
                angle *= -1;
            } else if (event.key === 'q') {
                direction = glMatrix.vec3.scale(direction, right, -1);
                angle *= -1;
                rollAngle *= -1;
                rollAxis = glMatrix.vec3.copy(rollAxis, rolling_right);
                rotAxis = glMatrix.vec3.copy(rotAxis, rolling_front);
            } else if (event.key === 'd') {
                direction = glMatrix.vec3.scale(direction, right, 1);
                rollAxis = glMatrix.vec3.copy(rollAxis, rolling_right);
                rotAxis = glMatrix.vec3.copy(rotAxis, rolling_front);
            } else if (event.key === 'r') {
                teleport(start_position);
            } else if (event.key === ' ') {
                if(!jumping){
                    jumping = true;
                }
            }


            else if (event.key === 'ArrowLeft') {
                rotationSpeed = -mouse_sensitivity;
            } else if (event.key === 'ArrowRight') {
                rotationSpeed = +mouse_sensitivity;
            }
    
            if ((keysPressed['ArrowUp'] && event.key == 'ArrowLeft') || (keysPressed['ArrowLeft'] && event.key == 'ArrowUp')) {
                rotationSpeed = -mouse_sensitivity;
                direction = glMatrix.vec3.scale(direction, front, 1);
            }
            else if ((keysPressed['ArrowUp'] && event.key == 'ArrowRight') || (keysPressed['ArrowRight'] && event.key == 'ArrowUp')) {
                rotationSpeed = +mouse_sensitivity;
                direction = glMatrix.vec3.scale(direction, front, 1);
            }
            else if ((keysPressed['ArrowDown'] && event.key == 'ArrowLeft') || (keysPressed['ArrowLeft'] && event.key == 'ArrowDown')) {
                rotationSpeed = -mouse_sensitivity;
                direction = glMatrix.vec3.scale(direction, front, -1);
            }
            else if ((keysPressed['ArrowDown'] && event.key == 'ArrowRight') || (keysPressed['ArrowRight'] && event.key == 'ArrowDown')) {
                rotationSpeed = +mouse_sensitivity;
                direction = glMatrix.vec3.scale(direction, front, -1);
            }
            else if ((keysPressed['ArrowUp'] && event.key == ' ') || (keysPressed[' '] && event.key == 'ArrowUp')) {
                jumping = true;
                direction = glMatrix.vec3.scale(direction, front, 1);
            }
            else if ((keysPressed['ArrowDown'] && event.key == ' ') || (keysPressed[' '] && event.key == 'ArrowDown')) {
                jumping = true;
                direction = glMatrix.vec3.scale(direction, front, -1);
            }
            else if ((keysPressed['q'] && event.key == ' ') || (keysPressed[' '] && event.key == 'q')) {
                jumping = true;
                direction = glMatrix.vec3.scale(direction, right, -1);
            }
            else if ((keysPressed['d'] && event.key == ' ') || (keysPressed[' '] && event.key == 'd')) {
                jumping = true;
                direction = glMatrix.vec3.scale(direction, right, 1);
            }
            
            direction = glMatrix.vec3.scale(direction, direction, movement_speed);
        });
         
        document.addEventListener('keyup', (event) => {
            delete keysPressed[event.key];
            if (event.key === 'ArrowDown') {
                direction = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
            } else if (event.key === 'ArrowUp') {
                direction = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);;
            } else if (event.key === 'q') {
                direction = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
            } else if (event.key === 'd') {
                direction = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);;
            }

            if (event.key === 'ArrowLeft') {
                rotationSpeed = 0.0;
            } else if (event.key === 'ArrowRight') {
                rotationSpeed = 0.0;
            }

        });
    }

    function update_rolling_axis(angle, axis) {
        tmp_up_a = glMatrix.vec3.create();
        tmp_up_a = glMatrix.vec3.scale(tmp_up_a, axis, -Math.sin(angle));
        tmp_up_u = glMatrix.vec3.create();
        tmp_up_u = glMatrix.vec3.scale(tmp_up_u, rolling_up, Math.cos(angle));

        tmp_axis_a = glMatrix.vec3.create();
        tmp_axis_a = glMatrix.vec3.scale(tmp_axis_a, axis, Math.cos(angle));
        tmp_axis_u = glMatrix.vec3.create();
        tmp_axis_u = glMatrix.vec3.scale(tmp_axis_u, rolling_up, Math.sin(angle));

        axis = glMatrix.vec3.add(axis, tmp_axis_a, tmp_axis_u);
        rolling_up = glMatrix.vec3.add(rolling_up, tmp_up_a, tmp_up_u); 
    };

    function isAt(position, ref_position) {
        return (position[0] >= ref_position[0] - 1.0 && position[0] <= ref_position[0] + 1.0 &&
        position[1] >= ref_position[1] - 1.0 && position[1] <= ref_position[1] + 1.0 &&
        position[2] >= ref_position[2] - 1.0 && position[2] <= ref_position[2] + 1.0);
    }

    function checkKey(position) {
        for ( var i = 0; i < ObjectLoader.getInstance().getKeys().length; i++ ) {
            if ( ObjectLoader.getInstance().getKeys()[i].isIn(position) ) {
                ObjectLoader.getInstance().remove(ObjectLoader.getInstance().getObjects(), ObjectLoader.getInstance().getKeys()[i]);
                ObjectLoader.getInstance().getKeys()[i].getLight().setOn(0.0);
                ObjectLoader.getInstance().remove(ObjectLoader.getInstance().getKeys(), ObjectLoader.getInstance().getKeys()[i]);
                ObjectLoader.getInstance().getPlayerItemList().addKey(ObjectLoader.getInstance().getKeys()[i]);
            }
        }
    }

    function checkDoor(position) {
        if ( ObjectLoader.getInstance().getPlayerItemList().keysCount() == 3 && 
        ObjectLoader.getInstance().getDoors()[ObjectLoader.getInstance().getCurrentDoor()].checkStartAnimation(position) ) {
            ObjectLoader.getInstance().getDoors()[ObjectLoader.getInstance().getCurrentDoor()].setAnimation(true);
            ObjectLoader.getInstance().getPlayerItemList().removeKeys();
        }
    }

    function animate(t){
        if(jumping){
            jump(t);
        }

        nextPos =  glMatrix.vec3.clone(position);
        nextPos = glMatrix.vec3.add(nextPos, nextPos, direction);
        if(!ObjectLoader.getInstance().isCollision(nextPos)){
            position = glMatrix.vec3.add(position, position, direction);
        }

        if(direction[0] == 0.0 &&
            direction[1] == 0.0 &&
            direction[2] == 0.0){
            angle = 0.0;
        }

        update_model_position();
        process_rotation_movement(rotationSpeed, 0);

        ObjectLoader.getInstance().getLights()[1].setPosition(position);

        checkKey(position);
        checkDoor(position);
        
        if(ObjectLoader.getInstance().getMaze() == 1 && isAt(position, glMatrix.vec3.fromValues(-8.0, 2.0, 22.0))){
            ObjectLoader.getInstance().changeMaze();
        }

        if(isAt(position, end_position)){
            teleport(glMatrix.vec3.fromValues(0.0, -0.8, -4.0));
        }
        
    }

    function jump(t){
        var nextPos = null;
        if(Math.abs(position[1] - startJumpPos) < 0.01 ){ //if starting the jump
            startJumpTime = t;
            startJumpPos = position[1];
            position[1] = position[1] + 0.02; 
        } else {
            delta = (t - startJumpTime)/1000.0;
            
            nextPos = [position[0], startJumpPos + 5.0 * delta + (-9.81 * (delta)**2) / 2.0, position[2]]; // y0 + v0*(t-t0) + (a * (t-t0)**2)/2
            if(!ObjectLoader.getInstance().isCollision(nextPos)){
                position[1] = nextPos[1];
            } else {
                jumping = false;
                startJumpPos = position[1];
            }
            
        }
        
        update_model_position(0.0, rolling_right);
    }

    function deg2rad(deg) {
        var PI = Math.PI;
        var rad = deg * (PI / 180.0);
        return rad;
    }
    
    function process_rotation_movement(xoffset, yoffset, constrain_pitch = true) {
        xoffset *= mouse_sensitivity;
        yoffset *= mouse_sensitivity;
    
        yaw += xoffset;
        xoffset = deg2rad(xoffset);
        playerMesh.model = glMatrix.mat4.rotate(playerMesh.model, playerMesh.model, -xoffset, rolling_up);

        pitch += yoffset;
        if (constrain_pitch) {
            if (pitch > 89.0) {
                pitch = 89.0
            }
            if (pitch < -89.0) {
                pitch = -89.0
            }
        }
        yoffset = deg2rad(yoffset);
        playerMesh.model = glMatrix.mat4.rotate(playerMesh.model, playerMesh.model, yoffset, rolling_right);
        
        update_camera_vectors();
    }
    
    function update_camera_vectors() {
        yawr = deg2rad(yaw)
        pitchr = deg2rad(pitch)
    
        fx = Math.cos(yawr) * Math.cos(pitchr);
        fy = Math.sin(pitchr);
        fz = Math.sin(yawr) * Math.cos(pitchr);

        front = glMatrix.vec3.fromValues(fx, fy, fz);
        front = glMatrix.vec3.normalize(front, front);
    
        right = glMatrix.vec3.cross(right, front, world_up);
        right = glMatrix.vec3.normalize(right, right);
    
        up = glMatrix.vec3.cross(up, right, front);
        up = glMatrix.vec3.normalize(up, up);
    }

    function get_view_matrix() {
        tmp = glMatrix.vec3.create();
        tmp = glMatrix.vec3.scale(tmp, up, 0.2);

        camera_front = glMatrix.vec3.create();
        camera_front =  glMatrix.vec3.subtract(camera_front, front, tmp);
        camera_front = glMatrix.vec3.normalize(camera_front, camera_front);

        tmp = glMatrix.vec3.scale(tmp, camera_front, 0.5);

        camera_position = glMatrix.vec3.subtract(camera_position, position, tmp);

        camera_up = glMatrix.vec3.create();
        camera_up = glMatrix.vec3.cross(camera_up, right, camera_front);

        View = glMatrix.mat4.create();
        View = glMatrix.mat4.lookAt(View, camera_position, position, camera_up);
        
        return View;
    }
    
    function get_projection(fov = 45.0, ratio = 1.0, near = 0.01, far = 100.0) {
        var projection = glMatrix.mat4.create();
        projection = glMatrix.mat4.perspective(projection, fov, ratio, near, far);
        return projection;
    }

    function get_position() {
        return position;
    }

    function get_camera_position() {
        return camera_position;
    }

    function show_view_html(tag, view) {
        show_mat(tag, 'View', view);
    }

    function show_model_html(tag) {
        show_mat(tag, 'Model', playerMesh.model);
    };

    function fl(x) {
        return Number.parseFloat(x).toFixed(3);
      }

    function show_mat(tag, name, m) {
        var txt = name + ':<br />'
        txt += fl(m[0]) + ' ' + fl(m[4]) + ' ' + fl(m[ 8]) + ' ' + fl(m[12]) + '<br />'
        txt += fl(m[1]) + ' ' + fl(m[5]) + ' ' + fl(m[ 9]) + ' ' + fl(m[13]) + '<br />'
        txt += fl(m[2]) + ' ' + fl(m[6]) + ' ' + fl(m[10]) + ' ' + fl(m[14]) + '<br />'
        txt += fl(m[3]) + ' ' + fl(m[7]) + ' ' + fl(m[11]) + ' ' + fl(m[15]) + '<br />'
        tag.innerHTML = txt;
      };

    return {
        playerMesh: playerMesh,
        animate: animate,
        place_player: place_player,
        setStartPosition: setStartPosition,
        setEndPosition: setEndPosition,
        draw_player: draw_player,
        get_view_matrix: get_view_matrix,
        get_projection: get_projection,
        get_position: get_position,
        get_camera_position: get_camera_position,
        show_model_html: show_model_html,
        show_view_html: show_view_html
    }
}
