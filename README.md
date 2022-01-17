# WebGLMaze

In order to get out of the maze, the player has to open a door. The door will only open if one has
gathered all the necessary keys and has to be found by the player.
The player can move in all directions, and jump. The controls allowed are:

All the movements can be combined.
The game is structured with the Object Oriented Paradigm. Each object in the game is a GameObject
and all the relevant classes inherit from this class

<!-- ABOUT THE CONTROLS -->
## About The Controls

https://user-images.githubusercontent.com/74192786/147875007-6d77830b-daea-4029-9cc1-1c9b2d8df6e1.mov

- **ArrowUp**: it moves the cube forward, in the direction of the rolling front vector which always
points in front of the cube
- **ArrowDown**: it is the opposite of ArrowUp
- **ArrowRight**: it rotates clockwise the cube around the rolling up vector which always points
in the direction of the y-axis;
- **ArrowLeft**: it rotates anti-clockwise the cube along the same axis as ArrowRight
- **D**: it moves the cube in the direction of the rolling right vector which always points orthog-
onally to the right of rolling front;
- **Q**: it is the opposite of ArrowRight; Combination of the first four controls (which are not
opposed movements) are possible.
- **R**: it allows the player to reset and be placed at the starting position if he/she is lost.
- **Space bar**: it allows to jump in the Y-axis
- **Combination of the first four controls** (which are not opposed movements) **are possible**.
