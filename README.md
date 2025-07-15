# Verlet Ball Physics Demo  (TESTING ONLY)
WORKING ON GYRO ACCESS PERMISSION


JavaScript Ball Physics 2D Simulation using Verlet Integration. Project goal is to learn JavaScript along with physics collision simulaton. This demo is a work in progress and not intended to be a robust application for every device / Web browser. Tested on iPhone & iPad (Chrome and Safari), Android Nexus 6P, Windows 10, Mac OSX.

By Jeff Miller. Released under MIT License. Last Update: 9/1/17

**Features:**
- Touching near a ball will pull it to the mouse or touch location. Spring force will hold it in place when dragged, but the ball can get dropped.
- General sloped wall collision detection
- Stable stacked balls
- Balls move based on gravity vector when tilted on a mobile device. If mobile device is in landscape, tilt mode is turned off and user is prompted to rotate to Portrait with Orientation lock turned on. A small check box at the lower right can toggle on and off, which works best on a tablet for now due to font size.

[Click here to run the Demo!](https://jmogl.github.io/VerletBallPhysicsDemoTesting/)	

**References:**
- [Verlet Collision with Impulse Preservation]([http://codeflow.org/entries/2010/nov/29/verlet-collision-with-impulse-preservation/](https://web.archive.org/web/20180118011218/http://codeflow.org/entries/2010/nov/29/verlet-collision-with-impulse-preservation/), an excellent physics tutorial by Florian Boesch. Approach to solving instability when objects are at rest.

- [Physics for Games, Animations, and Simulations with HTML5 by Dev Ramtel and Adrian Dobre, ISBN-13: 978-1-4302-6338-8](https://github.com/devramtal/Physics-for-JavaScript-Games-Animation-Simulations). A great reference for starting out with physics simulations in JavaScript. Made modifications to angled wall collision algorithm for multiple ball stability.

**Dependencies:**
- verletBallSim.js: JavaScript physics simulation code
- [Hammer.js](http://hammerjs.github.io/): Touch library
- [Mainloop.js](https://github.com/IceCreamYou/MainLoop.js): Managing main loop & FPS
- Vector2D.js:  Vector methods
- index.html: Web page to launch the app
- style.css: Cascading style sheet for web page formatting

**To Do:**
- Add a GUI for phones. The small checkbox on the lower right is hard to see on small devices.
- Add simple scoring for the funnel
- Incorporate Three.js library for 3D
