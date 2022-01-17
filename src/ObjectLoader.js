var ObjectLoader = (function() {
	var constructor = function() {

        this.objects = [];
        this.gl = null;
        this.textures = {};
        this.meshes = {};
        this.keys = [];
        this.playerItemList = new Items();
        this.doors = [];
        this.lights = [];
        this.maze = 1;
        this.currentDoor = 0;

        this.getObjectData = function(name = 'cube') {
            if (Object.keys(this.meshes).includes(name)){
                return this.meshes[name];
            }
            else{
                console.log(`object name not found : ${name}`);
            }
		}

        this.init = function(gl){
          this.gl = gl;
          this.textures = {
            "brick": make_texture(this.gl, "../textures/brick.jpg"),
            "brickNormalMap": make_texture(this.gl, "../textures/brickNormalMap.png"),
            "brick2": make_texture(this.gl, "../textures/brick2.jpg"),
            "brick2NormalMap": make_texture(this.gl, "../textures/brick2NormalMap.png"),
            "floor": make_texture(this.gl, "../textures/floor.jpg"),
            "floorNormalMap": make_texture(this.gl, "../textures/floorNormalMap.png"),
            "floor2": make_texture(this.gl, "../textures/floor2.jpg"),
            "floorNormalMap2": make_texture(this.gl, "../textures/floorNormalMap2.png"),
            "gold": make_texture(this.gl, "../textures/gold.jpg"),
            "goldNormalMap": make_texture(this.gl, "../textures/goldNormalMap.png"),
            "metal": make_texture(this.gl, "../textures/metal.jpg"),
            "metalNormalMap": make_texture(this.gl, "../textures/metalNormalMap.png"),
            "player": make_texture(this.gl, "../textures/player.png"),
            "playerNormalMap": make_texture(this.gl, "../textures/playerNormalMap.png")
          };
          this.meshes = {
              "cube": this.load_obj("../obj/cube.obj"),
              "sphere": this.load_obj("../obj/sphere_smooth.obj"),
              "cube_texture": this.load_obj_texture("../obj/cube_texture.obj"),
              "key": this.load_obj_texture("../obj/key.obj"),
          };
        }

        this.addObject = function(obj) {
            this.objects.push(obj);
		}

        this.getObjects = function(){
            return this.objects;
        }

        this.addLight = function(light) {
          this.lights.push(light);
        }

        this.getLights = function(){
          return this.lights;
        }
        this.getMaze = function(){
          return this.maze;
        }

        this.getTextures = function(){
          return this.textures;
        }

        this.getCurrentDoor = function(){
          return this.currentDoor;
        }
  
        this.setCurrentDoor = function(a){
            this.currentDoor = a;
        }

        this.getKeys = function(){
          return this.keys;
        }

        this.addKey = function(k) {
          this.keys.push(k);
        }

        this.getPlayerItemList = function() {
          return this.playerItemList;
        }

        this.getDoors = function() {
          return this.doors;
        }

        this.addDoor = function(d) {
          this.doors.push(d);
        }

        this.changeMaze = function(){
          if(this.maze == 1){
            this.maze = 2;
            this.doors[this.currentDoor].setAnimation(true);
            this.doors[this.currentDoor].setAnimationNumber(2);
            this.currentDoor++;
            this.lights[0].setOn(0.0);
            this.lights[1].setOn(1.0);
          }
          else{
            this.maze = 1
            this.lights[0].setOn(1.0);
            this.lights[1].setOn(0.0);
          }
        };
        
        this.isCollision = function(nextPos){
            for(var i = 0; i < this.objects.length; i++){
                if(this.objects[i].isObstacle() && this.objects[i].isIn(nextPos)){
                  return true;
                }
            }
            return false;
        }

        this.generateLightStringInit = function(){
          out = ``;
          for(var i = 0; i < this.lights.length; i++){
            out += `
            uniform vec4 u_light_pos${i};
            uniform vec3 u_light_color${i};`
          }
          return out;
        }

        this.generateLightStringBoolParse = function(){
          out = ``;
          for(var i = 0; i < this.lights.length; i++){
            out += `
            vec3 light_pos${i} = u_light_pos${i}.xyz;
            float bool${i} = u_light_pos${i}.w;`
          }
          return out;
        }

        this.generateLightStringComputation = function(){
          out = ``;
          for(var i = 0; i < this.lights.length; i++){
            out += `
            if(bool${i} == 1.0){
              L = normalize(light_pos${i} - v_frag_coord);
              diffusion = max(0.0, dot(normal, L));
              view_dir = normalize(u_view_dir - v_frag_coord);
              reflect_dir = reflect(-L, normal);
              spec = pow(max(dot(view_dir, reflect_dir), 0.0), 32.0);
              specular = spec_strength * spec;
              `;
            if(i==0){
              out += `att = 1.0;`;
            } 
            else if(i==1) {
              out += `att = 0.5/(0.8*(pow(distance(light_pos${i}, v_frag_coord), 1.0)));`;
            }
            else {
              out += `att = 0.5/(0.8*(pow(distance(light_pos${i}, v_frag_coord), 2.0)));`;
            }
            if(i==1){
              out += `
              color += (ambient + specular + 2.0*diffusion) * u_light_color${i} * att * 0.4;
            }`;
            } 
            else {
              out += `
              color += (ambient + specular + diffusion) * u_light_color${i} * att * 0.7;
            }`;
            }
          }
          return out;
        }

		this.load_obj = async function(name = '../obj/cube.obj') {
            async function load_mesh(string) {
                var lines = string.split("\n");
                var positions = [];
                var normals = [];
                var textures = [];
                var vertices = [];
               
                for ( var i = 0 ; i < lines.length ; i++ ) {
                  var parts = lines[i].trimRight().split(' ');
                  if ( parts.length > 0 ) {
                    switch(parts[0]) {
                      case 'v':  positions.push(
                        glMatrix.vec3.fromValues(
                          parseFloat(parts[1]),
                          parseFloat(parts[2]),
                          parseFloat(parts[3])
                        ));
                        break;
                      case 'vn':
                        normals.push(
                          glMatrix.vec3.fromValues(
                            parseFloat(parts[1]),
                            parseFloat(parts[2]),
                            parseFloat(parts[3])
                        ));
                        break;
                      case 'vt':
                        textures.push(
                          glMatrix.vec2.fromValues(
                            parseFloat(parts[1]),
                            parseFloat(parts[2])
                        ));
                        break;
                      case 'f': {
                        var f1 = parts[1].split('/');
                        var f2 = parts[2].split('/');
                        var f3 = parts[3].split('/');
                        // Push vertex 1 of the face
                        Array.prototype.push.apply(
                          vertices, positions[parseInt(f1[0]) - 1]
                        );
                        Array.prototype.push.apply(
                          vertices, textures[parseInt(f1[1]) - 1]
                        );
                        Array.prototype.push.apply(
                          vertices, normals[parseInt(f1[2]) - 1]
                        );
                        // Push vertex 2 of the face
                        Array.prototype.push.apply(
                          vertices, positions[parseInt(f2[0]) - 1]
                        );
                        Array.prototype.push.apply(
                          vertices, textures[parseInt(f2[1]) - 1]
                        );
                        Array.prototype.push.apply(
                          vertices, normals[parseInt(f2[2]) - 1]
                        );
                        // Push vertex 3 of the face
                        Array.prototype.push.apply(
                          vertices, positions[parseInt(f3[0]) - 1]
                        );
                        Array.prototype.push.apply(
                          vertices, textures[parseInt(f3[1]) - 1]
                        );
                        Array.prototype.push.apply(
                          vertices, normals[parseInt(f3[2]) - 1]
                        );
                        break;
                      }
                    }
                  }
                }
                var vertexCount = vertices.length / 8;
                return {
                  buffer: new Float32Array(vertices),
                  num_triangles: vertexCount
                };
              }
              
              const response = await fetch(name);
              const text = await response.text();
              
              const ret = await load_mesh(text);
          
              return ret;
		}

    this.load_obj_texture = async function(name = '../obj/cube_texture.obj') {
      async function load_mesh(string) {
          var lines = string.split("\n");
          var positions = [];
          var normals = [];
          var textures = [];
          var vertices = [];
         
          for ( var i = 0 ; i < lines.length ; i++ ) {
            var parts = lines[i].trimRight().split(' ');
            if ( parts.length > 0 ) {
              switch(parts[0]) {
                case 'v':  positions.push(
                  glMatrix.vec3.fromValues(
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                  ));
                  break;
                case 'vn':
                  normals.push(
                    glMatrix.vec3.fromValues(
                      parseFloat(parts[1]),
                      parseFloat(parts[2]),
                      parseFloat(parts[3])
                  ));
                  break;
                case 'vt':
                  textures.push(
                    glMatrix.vec2.fromValues(
                      parseFloat(parts[1]),
                      parseFloat(parts[2])
                  ));
                  break;
                case 'f': {
                  var f1 = parts[1].split('/');
                  var f2 = parts[2].split('/');
                  var f3 = parts[3].split('/');

                  var edge1 = glMatrix.vec3.create();
                  edge1 = glMatrix.vec3.subtract(edge1, positions[parseInt(f2[0]) - 1], positions[parseInt(f1[0]) - 1]);
                  var edge2 = glMatrix.vec3.create();
                  edge2 = glMatrix.vec3.subtract(edge2, positions[parseInt(f3[0]) - 1], positions[parseInt(f1[0]) - 1]);
                  var deltaUV1 = glMatrix.vec3.create();
                  deltaUV1 = glMatrix.vec3.subtract(deltaUV1, textures[parseInt(f2[1]) - 1], textures[parseInt(f1[1]) - 1]);
                  var deltaUV2 = glMatrix.vec3.create();
                  deltaUV2 = glMatrix.vec3.subtract(deltaUV2, textures[parseInt(f3[1]) - 1], textures[parseInt(f1[1]) - 1]);

                  var f = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV2[0] * deltaUV1[1]);
                  var tangent = glMatrix.vec3.create();
                  tangent[0] = f * (deltaUV2[1] * edge1[0] - deltaUV1[1] * edge2[0]);
                  tangent[1] = f * (deltaUV2[1] * edge1[1] - deltaUV1[1] * edge2[1]);
                  tangent[2] = f * (deltaUV2[1] * edge1[2] - deltaUV1[1] * edge2[2]);

                  tangent = glMatrix.vec3.normalize(tangent, tangent);
                  var bitangent = glMatrix.vec3.create();
                  bitangent = glMatrix.vec3.cross(bitangent, normals[parseInt(f1[2]) - 1], tangent);

                  // Push vertex 1 of the face
                  Array.prototype.push.apply(
                    vertices, positions[parseInt(f1[0]) - 1]
                  );
                  Array.prototype.push.apply(
                    vertices, textures[parseInt(f1[1]) - 1]
                  );
                  Array.prototype.push.apply(
                    vertices, normals[parseInt(f1[2]) - 1]
                  );
                  Array.prototype.push.apply(
                    vertices, tangent
                  );
                  Array.prototype.push.apply(
                    vertices, bitangent
                  );
                  // Push vertex 2 of the face
                  Array.prototype.push.apply(
                    vertices, positions[parseInt(f2[0]) - 1]
                  );
                  Array.prototype.push.apply(
                    vertices, textures[parseInt(f2[1]) - 1]
                  );
                  Array.prototype.push.apply(
                    vertices, normals[parseInt(f2[2]) - 1]
                  );
                  Array.prototype.push.apply(
                    vertices, tangent
                  );
                  Array.prototype.push.apply(
                    vertices, bitangent
                  );
                  // Push vertex 3 of the face
                  Array.prototype.push.apply(
                    vertices, positions[parseInt(f3[0]) - 1]
                  );
                  Array.prototype.push.apply(
                    vertices, textures[parseInt(f3[1]) - 1]
                  );
                  Array.prototype.push.apply(
                    vertices, normals[parseInt(f3[2]) - 1]
                  );
                  Array.prototype.push.apply(
                    vertices, tangent
                  );
                  Array.prototype.push.apply(
                    vertices, bitangent
                  );
                  break;
                }
              }
            }
          }
          var vertexCount = vertices.length / 14;
          return {
            buffer: new Float32Array(vertices),
            num_triangles: vertexCount
          };
        }
        
        const response = await fetch(name);
        const text = await response.text();
        
        const ret = await load_mesh(text);
    
        return ret;
    }
		
        this.draw_map = function(gl, shader, unif){
            for(var i = 0; i < this.objects.length; i++){
              if(this.objects[i].getShader() == shader.name){
                  this.objects[i].getMesh().activate(shader);
                  gl.uniformMatrix4fv(unif['model'], false, this.objects[i].getMesh().model);
                  let itM = glMatrix.mat4.create();
                  itM = glMatrix.mat4.invert(itM, this.objects[i].getMesh().model);
                  itM = glMatrix.mat4.transpose(itM, itM);
                  gl.uniformMatrix4fv(gl.getUniformLocation(shader.program, 'itM'), false, itM);
                  gl.activeTexture(gl.TEXTURE0 + 0);
                  gl.bindTexture(gl.TEXTURE_2D, this.textures[this.objects[i].texture]);
                  gl.uniform1i(unif["u_texture"], 0);
                  gl.activeTexture(gl.TEXTURE0 + 1);
                  gl.bindTexture(gl.TEXTURE_2D, this.textures[this.objects[i].textureNormalMap]);
                  gl.uniform1i(unif["u_normalMap"], 1);
                  this.objects[i].getMesh().draw();
              }
            };
        };

		this.make_object = async function(gl, obj) {
        obj = await obj;
        
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, obj.buffer, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
        var Model = glMatrix.mat4.create();
    
        function activate(shader) {
            // these object have all 3 positions + 2 textures + 3 normals
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            const sizeofFloat = Float32Array.BYTES_PER_ELEMENT;
            const att_pos = gl.getAttribLocation(shader.program, 'position');
            gl.enableVertexAttribArray(att_pos);
            gl.vertexAttribPointer(att_pos, 3, gl.FLOAT, false, 8 * sizeofFloat, 0 * sizeofFloat);
    
            const att_textcoord = gl.getAttribLocation(shader.program, "texcoord");
            gl.enableVertexAttribArray(att_textcoord);
            gl.vertexAttribPointer(att_textcoord, 2, gl.FLOAT, false, 8 * sizeofFloat, 3 * sizeofFloat);
        
            const att_nor = gl.getAttribLocation(shader.program, 'normal');
            gl.enableVertexAttribArray(att_nor);
            gl.vertexAttribPointer(att_nor, 3, gl.FLOAT, false, 8 * sizeofFloat, 5 * sizeofFloat);
            
        }
    
        function draw() {
            gl.drawArrays(gl.TRIANGLES, 0, obj.num_triangles);
        }
    
        return {
            buffer: buffer,
            model: Model,
            activate: activate,
            draw: draw,
        }
	}

  this.make_object_texture = async function(gl, obj) {
    obj = await obj;
    
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, obj.buffer, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var Model = glMatrix.mat4.create();

    function activate(shader) {
        // these object have all 3 positions + 2 textures + 3 normals + 3 tangents + 3 bitangents
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        const sizeofFloat = Float32Array.BYTES_PER_ELEMENT;
        const att_pos = gl.getAttribLocation(shader.program, 'position');
        gl.enableVertexAttribArray(att_pos);
        gl.vertexAttribPointer(att_pos, 3, gl.FLOAT, false, 14 * sizeofFloat, 0 * sizeofFloat);

        const att_textcoord = gl.getAttribLocation(shader.program, "texcoord");
        gl.enableVertexAttribArray(att_textcoord);
        gl.vertexAttribPointer(att_textcoord, 2, gl.FLOAT, false, 14 * sizeofFloat, 3 * sizeofFloat);
    
        const att_nor = gl.getAttribLocation(shader.program, 'normal');
        gl.enableVertexAttribArray(att_nor);
        gl.vertexAttribPointer(att_nor, 3, gl.FLOAT, false, 14 * sizeofFloat, 5 * sizeofFloat);

        const att_tan = gl.getAttribLocation(shader.program, 'tangent');
        gl.enableVertexAttribArray(att_tan);
        gl.vertexAttribPointer(att_tan, 3, gl.FLOAT, false, 14 * sizeofFloat, 8 * sizeofFloat);

        const att_bitan = gl.getAttribLocation(shader.program, 'bitangent');
        gl.enableVertexAttribArray(att_bitan);
        gl.vertexAttribPointer(att_bitan, 3, gl.FLOAT, false, 14 * sizeofFloat, 11 * sizeofFloat);
        
    }

    function draw() {
        gl.drawArrays(gl.TRIANGLES, 0, obj.num_triangles);
    }

    return {
        buffer: buffer,
        model: Model,
        activate: activate,
        draw: draw,
    }

  }

    this.animate = function(t) {
      for ( var i = 0; i < this.objects.length; i++ ) {
        if ( this.objects[i].getAnimation() ){
          this.objects[i].animate(t);
        }
      }
      for ( var i = 0; i < this.lights.length; i++ ) {
        if ( this.lights[i].getOn() == 1.0 ){
          this.lights[i].animate(t);
        }
      }
    };

    this.remove = function(array, o) {
      array.splice(array.indexOf(o), 1);
    };
	
	}
	
	var instance = null;
	return new function() {
		this.getInstance = function() {
			if (instance == null) {
				instance = new constructor();
				instance.constructor = null;
			}
			
			return instance;
		}
	}
})();
