var ObjectLoader = (function() {
	var constructor = function() {

        this.objects = [];

        this.getObjectData = function(name = 'cube') {
            if (Object.keys(meshes).includes(name)){
                console.log(`creating ${name}`);
                return meshes[name];
            }
            else{
                console.log(`object name not found : ${name}`);
            }
		}

        this.addObject = function(obj) {
            this.objects.push(obj);
		}

        this.getObjects = function(){
            return this.objects;
        }
        
        this.isCollision = function(nextPos){
            console.log(`next pos : ${nextPos}`);
            for(var i = 0; i < this.objects.length; i++){
                console.log(`object : ${this.objects[i].isObstacle()}`);
                if(this.objects[i].isObstacle() && this.objects[i].isIn(nextPos)){
                  return true;
                }
                //if(this.collide(nextPos, ))
            }
            return false;
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
                        // f = vertex/texture/normal vertex/texture/normal vertex/texture/normal
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
		
        this.draw_map = function(gl, shader_show_object, unif){
            for(var i = 0; i < this.objects.length; i++){
                this.objects[i].getMesh().activate(shader_show_object);
                gl.uniformMatrix4fv(unif['model'], false, this.objects[i].getMesh().model);
                let itM = glMatrix.mat4.create();
                itM = glMatrix.mat4.invert(itM, this.objects[i].getMesh().model);
                itM = glMatrix.mat4.transpose(itM, itM);
                gl.uniformMatrix4fv(gl.getUniformLocation(shader_show_object.program, 'itM'), false, itM);
                this.objects[i].getMesh().draw();
            };
        };

		this.make_object = async function(gl, obj) {
            // We need the object to be ready to proceed:
        obj = await obj;
        
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, obj.buffer, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
        var Model = glMatrix.mat4.create();
        // Model = glMatrix.mat4.scale(Model, Model, glMatrix.vec3.fromValues(0.2, 0.2, 0.2));
        // Model = glMatrix.mat4.translate(Model, Model, glMatrix.vec3.fromValues(0.5, -0.5, -1.0));
    
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

    var meshes = {
        "cube": this.load_obj("../obj/cube.obj"),
        "sphere": this.load_obj("../obj/sphere_smooth.obj")
    };

    

    console.log(`meshes : ${Object.keys(meshes)}`);
	
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
