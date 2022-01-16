var make_player = async function(gl, obj_path="../obj/cube.obj", canvas) {

    const PlayerMovement = {
        FORWARD: 1,
        BACKWARD: 2,
        LEFT: 3,
        RIGHT: 4
    }
    var canvas = canvas;
    var position = glMatrix.vec3.fromValues(0.0, -0.8, -4.0);
    var front = glMatrix.vec3.fromValues(0, 0, 1.0);
    var up = glMatrix.vec3.fromValues(0.0, 1.0, 0.0);
    var right = glMatrix.vec3.fromValues(-1.0, 0.0, 0.0);
    var world_up = up;
    var start_position = glMatrix.vec3.fromValues(0.0, -0.8, -4.0);
    var end_position = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);

    var camera_position = glMatrix.vec3.create();
    
    var yaw = 90.0;
    var pitch = 0.0;
    var movement_speed = 0.2;
    var mouse_sensitivity = 4.0;
    
    var object = await load_obj(obj_path);
    var playerMesh = await make_object(gl, object);

    var rolling_front = glMatrix.vec3.create();
    rolling_front = glMatrix.vec3.copy(rolling_front, front);
    var rolling_right = glMatrix.vec3.create();
    rolling_right = glMatrix.vec3.copy(rolling_right, right);
    var rolling_up = glMatrix.vec3.create();
    rolling_up = glMatrix.vec3.copy(rolling_up, up);

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
         
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.view.event.preventDefault();
            }
            
            if (event.key === 'ArrowDown') {
                process_keyboard(PlayerMovement.BACKWARD);
            } else if (event.key === 'ArrowUp') {
                process_keyboard(PlayerMovement.FORWARD);
            } else if (event.key === 'q') {
                process_keyboard(PlayerMovement.LEFT);
            } else if (event.key === 'd') {
                process_keyboard(PlayerMovement.RIGHT);
            } else if (event.key === 'r') {
                teleport(start_position);
            }


            else if (event.key === 'ArrowLeft') {
                process_rotation_movement(-1.0, 0.0);
            } else if (event.key === 'ArrowRight') {
                process_rotation_movement(1.0, 0);
            }
    
            if ((keysPressed['ArrowUp'] && event.key == 'ArrowLeft') || (keysPressed['ArrowLeft'] && event.key == 'ArrowUp')) {
                process_keyboard(PlayerMovement.FORWARD);
                process_rotation_movement(-1.0, 0.0);
            }
            else if ((keysPressed['ArrowUp'] && event.key == 'ArrowRight') || (keysPressed['ArrowRight'] && event.key == 'ArrowUp')) {
                process_keyboard(PlayerMovement.FORWARD);
                process_rotation_movement(1.0, 0);
            }
            else if ((keysPressed['ArrowDown'] && event.key == 'ArrowLeft') || (keysPressed['ArrowLeft'] && event.key == 'ArrowDown')) {
                process_keyboard(PlayerMovement.BACKWARD);
                process_rotation_movement(-1.0, 0.0);
            }
            else if ((keysPressed['ArrowDown'] && event.key == 'ArrowRight') || (keysPressed['ArrowRight'] && event.key == 'ArrowDown')) {
                process_keyboard(PlayerMovement.BACKWARD);
                process_rotation_movement(1.0, 0);
            }
        });
         
        document.addEventListener('keyup', (event) => {
            delete keysPressed[event.key];
        });
    }

    // function update_rolling_axis(angle, right=true) {
    //     if ( right ) {
    //         tmp_right_r = glMatrix.vec3.create();
    //         tmp_right_r = glMatrix.vec3.scale(tmp_right_r, rolling_right, Math.cos(angle));
    //         tmp_right_u = glMatrix.vec3.create();
    //         tmp_right_u = glMatrix.vec3.scale(tmp_right_u, rolling_up, Math.sin(angle));

    //         tmp_up_r = glMatrix.vec3.create();
    //         tmp_up_r = glMatrix.vec3.scale(tmp_up_r, rolling_right, -Math.sin(angle));
    //         tmp_up_u = glMatrix.vec3.create();
    //         tmp_up_u = glMatrix.vec3.scale(tmp_up_u, rolling_up, Math.cos(angle));

    //         rolling_right = glMatrix.vec3.add(rolling_right, tmp_right_r, tmp_right_u);
    //         rolling_up = glMatrix.vec3.add(rolling_up, tmp_up_r, tmp_up_u);
    //         //rolling_front = glMatrix.vec3.cross(rolling_front, rolling_up, rolling_right);
    //     }
    //     else {
    //         tmp_front_f = glMatrix.vec3.create();
    //         tmp_front_f = glMatrix.vec3.scale(tmp_front_f, rolling_front, Math.cos(-angle));
    //         tmp_front_u = glMatrix.vec3.create();
    //         tmp_front_u = glMatrix.vec3.scale(tmp_front_u, rolling_up, Math.sin(-angle));

    //         tmp_up_f = glMatrix.vec3.create();
    //         tmp_up_f = glMatrix.vec3.scale(tmp_up_f, rolling_front, -Math.sin(-angle));
    //         tmp_up_u = glMatrix.vec3.create();
    //         tmp_up_u = glMatrix.vec3.scale(tmp_up_u, rolling_up, Math.cos(-angle));

    //         rolling_front = glMatrix.vec3.add(rolling_front, tmp_front_f, tmp_front_u);
    //         rolling_up = glMatrix.vec3.add(rolling_up, tmp_up_f, tmp_up_u);
    //         //rolling_right = glMatrix.vec3.cross(rolling_right, rolling_front, rolling_up);
    //         console.log(rolling_front);
    //         console.log(rolling_up);
    //     }
    // };

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
    
    function process_keyboard(direction) {
        tmp = glMatrix.vec3.create();
        nextPos = glMatrix.vec3.clone(position);
        rad = Math.PI/4.0;
        if (direction == PlayerMovement.FORWARD) {
            tmp = glMatrix.vec3.scale(tmp, front, movement_speed);
            nextPos = glMatrix.vec3.add(nextPos, nextPos, tmp);
            if(!ObjectLoader.getInstance().isCollision(nextPos)){
                position = glMatrix.vec3.add(position, position, tmp);
                update_model_position(-rad, rolling_right);
                update_rolling_axis(rad, rolling_front);
            }
        }
        if (direction == PlayerMovement.BACKWARD) {
            tmp = glMatrix.vec3.scale(tmp, front, -movement_speed);
            nextPos = glMatrix.vec3.add(nextPos, nextPos, tmp);
            if(!ObjectLoader.getInstance().isCollision(nextPos)){
                position = glMatrix.vec3.add(position, position, tmp);
                update_model_position(rad, rolling_right);
                update_rolling_axis(-rad, rolling_front);
            }
        }
        if (direction == PlayerMovement.LEFT) {
            tmp = glMatrix.vec3.scale(tmp, right, -movement_speed);
            nextPos = glMatrix.vec3.add(nextPos, nextPos, tmp);
            if(!ObjectLoader.getInstance().isCollision(nextPos)){
                position = glMatrix.vec3.add(position, position, tmp);
                update_model_position(-rad, rolling_front);
                update_rolling_axis(-rad, rolling_right);
            }
        }
        if (direction == PlayerMovement.RIGHT) {
            tmp = glMatrix.vec3.scale(tmp, right, movement_speed);
            nextPos = glMatrix.vec3.add(nextPos, nextPos, tmp);
            if(!ObjectLoader.getInstance().isCollision(nextPos)){
                position = glMatrix.vec3.add(position, position, tmp);
                update_model_position(rad, rolling_front);
                update_rolling_axis(rad, rolling_right);
            }
        }

        ObjectLoader.getInstance().getLights()[1].setPosition(position);

        checkKey(position);
        checkDoor(position);
        
        if(isAt(position, glMatrix.vec3.fromValues(-8.0, 0.0, 22.0))){
            console.log("CHANGE MAZE");
            ObjectLoader.getInstance().changeMaze();
        }

        if(isAt(position, end_position)){
            console.log("FINISHED");
            
            teleport(glMatrix.vec3.fromValues(0.0, -0.8, -4.0));
        }
    }

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
        for ( var i = 0; i < ObjectLoader.getInstance().getDoors().length; i++ ) {
            if ( ObjectLoader.getInstance().getPlayerItemList().keysCount() == 3 && ObjectLoader.getInstance().getDoors()[i].checkStartAnimation(position) ) {
                ObjectLoader.getInstance().getDoors()[i].setAnimation(true);
                ObjectLoader.getInstance().getPlayerItemList().removeKeys();
            }
        }
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

        // camera_position = glMatrix.vec3.create();
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
