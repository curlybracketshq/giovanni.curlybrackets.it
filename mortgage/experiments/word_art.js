// Resources:
//
// * https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text
// * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform

var WORD_ART = function(container, options) {
  'use strict';

  // Configuration values
  var C = {
    debug: false,
    ns: 'http://www.w3.org/2000/svg',
  };

  // Elements
  var E = {
    main: null,
  };

  // Initialization
  init();

  //
  // Functions
  //

  function init() {
    E.main = document.createElementNS(C.ns, 'svg');
    E.main.setAttribute('width', options.width);
    E.main.setAttribute('height', options.height);
    E.main.setAttribute('version', '1.1');

    // Text element
    var text = document.createElementNS(C.ns, 'text');
    text.textContent = options.content;
    text.setAttribute('fill', options.fill);
    text.setAttribute('stroke', options.stroke);
    text.setAttribute('font-family', 'serif');
    text.setAttribute('textLength', options.width);
    text.setAttribute('transform', 'scale(1 1.75)');
    text.setAttribute('x', 0);
    text.setAttribute('y', options.height / 2.5);
    text.setAttribute('font-size', options.fontSize);
    E.main.append(text);

    container.appendChild(E.main);
  }
};
