# Verlet Ball Physics Demo  (TESTING ONLY) - V.3.01
Converting Demo to three.js renderer!

VERY EARLY TESTING










Original Readme:

JavaScript Ball Physics 2D Simulation using Verlet Integration. Project goal is to learn JavaScript along with physics collision simulaton. This demo is a work in progress and not intended to be a robust application for every device / Web browser, but should work on most devices. Please submit an Issue if it is not working and include info on the device and browser version. Tested on iOS iPhone, iPAD, and Google Android Pixel 11.

By Jeff Miller. Released under MIT License. 

**Features:**
- Touching near a ball will pull it to the mouse or touch location. Spring force will hold it in place when dragged.
- General sloped wall collision detection
- Stable stacked balls
- Balls move based on gravity vector when tilted on a mobile device after pressing the "Enable Tilt" button is pressed. If mobile device is in landscape, the simulation is paused and user is prompted to rotate to Portrait. Recommend turning orientation lock on in portrait mode. On iOS devices, you will be prompted for permission to use the gyro. 
- Desktop users without an accelerometer have the option to turn "Gravity" on and off which creates some interesting effects
  
[Click here to run the Demo!](https://jmogl.github.io/VerletBallPhysicsDemoTesting/)	

**References:**
- [Verlet Collision with Impulse Preservation](https://web.archive.org/web/20180118011218/http://codeflow.org/entries/2010/nov/29/verlet-collision-with-impulse-preservation/), an excellent physics tutorial by Florian Boesch. Approach to solving instability when objects are at rest.

- [Physics for Games, Animations, and Simulations with HTML5 by Dev Ramtel and Adrian Dobre, ISBN-13: 978-1-4302-6338-8](https://github.com/devramtal/Physics-for-JavaScript-Games-Animation-Simulations). A great reference for starting out with physics simulations in JavaScript. Made modifications to angled wall collision algorithm for multiple ball stability.

**Dependencies:**
- verletBallSim.js: JavaScript physics simulation code
- [Hammer.js](http://hammerjs.github.io/): Touch library
- [Mainloop.js](https://github.com/IceCreamYou/MainLoop.js): Managing main loop & FPS
- Vector2D.js:  Vector methods
- index.html: Web page to launch the app
- style.css: Cascading style sheet for web page formatting

**To Do:**
- May add an option to dynamically change the interior wall obstructions, but need to fix an issue where the ball sticks if the wall is shallow or slow velocity.
- Every once in a while, the collision detection adds energy and balls explode due to a singularity probably from the wall edge collision detection.  
- Replace the Enable Tilt button with a proper pop up UI menu
- Switch from Canvas to webgl using three.js
