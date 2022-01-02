# WebGLMaze

<!-- ABOUT THE CONTROLS -->
## About The Controls

https://user-images.githubusercontent.com/74192786/147875007-6d77830b-daea-4029-9cc1-1c9b2d8df6e1.mov

As you can see the player is for the moment ( and might remain with all the energy I have put in it) a cube. 

With the player.js the cube and the camera are managed. Therefore, camera.js is now completely useless. The camera is following the player and its movements dictate the orientation of the camera (View matrix).

The controls allowed are:
- **ArrowUp**: it moves the cube in the direction of the rolling_front vector which always points in front of the cube;
- **ArrowDown**: it is the opposite of ArrowUp;
- **ArrowRight**: it rotates clockwise the cube around the rollin_up vector which always points in the direction of the y-axis;
- **ArrowLeft**: it rotates anti-clockwise the cube along the same axis as ArrowRight;
- **d**: it moves the cube in the direction of the rolling_right vector which always points orthogonally to the right of rolling_front;
- **q**: it is the opposite of ArrowRight;
- **Combination of the first four controls** (which are not opposed movements) **are possible**.
