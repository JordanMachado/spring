import WebGL from './WebGL';
import deviceType from 'ua-device-type';
import LOL from './LOL';
import domReady from 'domready';
import raf from 'raf';
import dat from 'dat-gui';
import 'gsap';

// Vars
window.DEBUG = false;
let device;
let webGL;

console.warn = () => {};

function animate() {
  raf(animate);
  webGL.render();
}

// Events
function resize() {
  webGL.resize(window.innerWidth, window.innerHeight);
}
// KeyBoard
function keyPress(e) {
  webGL.keyPress(e);
}
function keyDown(e) {
  webGL.keyDown(e);
}
function keyUp(e) {
  webGL.keyUp(e);
}
// Mouse
function click(e) {
  webGL.click(e.clientX, e.clientY, e.timeStamp);
}
function mouseMove(e) {
  webGL.mouseMove(e.clientX, e.clientY, e.timeStamp);
}
// Touch
function touchStart(e) {
  webGL.touchStart(e.touches);
}
function touchEnd(e) {
  webGL.touchEnd(e.touches);
}
function touchMove(e) {
  webGL.touchMove(e.touches);
}

domReady(() => {
  // if (!window.VIPMODE && !window.DEBUG) return;

  device = deviceType(navigator.userAgent);
  document.querySelector('html').classList.add(device);

  if (window.DEBUG || window.DEVMODE) {
    window.gui = new dat.GUI();
  }
  // WebGL
  webGL = new WebGL({
    device,
    name: 'SPRING',
    postProcessing: true,
    size: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    keyboard: false,
    mouse: (device === 'desktop') ? true : false,
    touch: (device === 'desktop') ? false : true,
  });
  document.body.appendChild(webGL.renderer.domElement);

  TweenMax.to(document.querySelector('canvas'), 3.5, {
    autoAlpha: 1,
    ease: Quad.easeOut,
  });

  // Events
  window.addEventListener('resize', resize);
  // KeyBoard
  window.addEventListener('keypress', keyPress);
  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  // Mouse
  window.addEventListener('click', click);
  window.addEventListener('mousemove', mouseMove);
  // Touch
  window.addEventListener('touchstart', touchStart);
  window.addEventListener('touchend', touchEnd);
  window.addEventListener('touchmove', touchMove);

  // let's start
  animate();
});
