// Resources:
//
// * https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Gradients
// * https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
// * https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text

var TEXT_GRADIENT_ID = 0;
var TEXT_GRADIENT = function(container, options) {
  'use strict';

  // Configuration values
  var C = {
    debug: false,
    ns: 'http://www.w3.org/2000/svg',
    frameTimeMs: 1 / 60 * 1000,
    gradientId: 'gradient_' + TEXT_GRADIENT_ID,
    angularVelocity: Math.PI / 100, // radians / frame (@ 60 Hz)
  };

  // Elements
  var E = {
    main: null,
    gradient: null,
  };

  // Global state
  var G = {
    isMouseOver: false,
    prevTimestamp: null,
    angle: 0,
  };

  // Initialization
  TEXT_GRADIENT_ID++;
  initGradient();

  // Attach animation callback
  window.requestAnimationFrame(animationStep);

  //
  // Functions
  //

  function initGradientDef(id, colors) {
    var linearGradient = document.createElementNS(C.ns, 'linearGradient');
    linearGradient.setAttribute('id', id);

    colors.map(function(color, index) {
      var percentage = (index / (colors.length - 1)) * 100;
      return {offset: percentage + '%', color: color};
    }).map(function(stop) {
      var stopElement = document.createElementNS(C.ns, 'stop');
      stopElement.setAttribute('offset', stop.offset);
      stopElement.setAttribute('stop-color', stop.color);
      return stopElement;
    }).forEach(function(stopElement) {
      linearGradient.append(stopElement);
    });

    return linearGradient;
  }

  function initGradient() {
    E.main = document.createElementNS(C.ns, 'svg');
    E.main.setAttribute('width', options.width);
    E.main.setAttribute('height', options.height);
    E.main.setAttribute('version', '1.1');

    // Add gradient defs
    E.gradient = initGradientDef(C.gradientId, options.colors);
    var defs = document.createElementNS(C.ns, 'defs');
    defs.append(E.gradient);
    E.main.append(defs);

    // Text element
    var text = document.createElementNS(C.ns, 'text');
    text.textContent = options.content;
    text.setAttribute('fill', idRef(C.gradientId));
    text.setAttribute('x', 0);
    text.setAttribute('y', options.height / 2);
    text.setAttribute('font-size', options.fontSize);
    text.addEventListener('mouseover', function() {
      G.isMouseOver = true;
    });
    text.addEventListener('mouseout', function() {
      G.isMouseOver = false;
    });
    E.main.append(text);

    container.appendChild(E.main);
  }

  function idRef(id) {
    return 'url(#' + id + ')';
  }

  function animationStep(timestamp) {
    window.requestAnimationFrame(animationStep);

    if (G.prevTimestamp == null) {
      G.prevTimestamp = timestamp;
    }
    var delta = timestamp - G.prevTimestamp;
    var ratio = delta / C.frameTimeMs;
    G.prevTimestamp = timestamp;

    if (E.gradient == null || !G.isMouseOver) {
      return;
    }

    var angle1 = G.angle - Math.PI;
    var angle2 = G.angle;
    var x1 = (Math.cos(angle1) + 1) / 2;
    var y1 = (Math.sin(angle1) + 1) / 2;
    var x2 = (Math.cos(angle2) + 1) / 2;
    var y2 = (Math.sin(angle2) + 1) / 2;

    E.gradient.setAttribute('x1', x1);
    E.gradient.setAttribute('y1', y1);
    E.gradient.setAttribute('x2', x2);
    E.gradient.setAttribute('y2', y2);

    G.angle += C.angularVelocity * ratio;
  }
};
