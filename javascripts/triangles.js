'use strict';

(function () {
  var DEBUG = false;

  var randInt = function (upper) {
    return Math.floor(Math.random() * upper);
  };

  var randComponent = function () {
    return randInt(256);
  };

  var randOpacity = function () {
    return Math.random();
  };

  var randColor = function () {
    return 'rgba(' + randComponent() + ', ' + randComponent() + ', ' + randComponent() + ', ' + randOpacity() + ')';
  };

  var SOUTH = 0;
  var NORTH = 180;
  var TRANSPARENT = 'rgba(0, 0, 0, 0)';
  var COLORS = [TRANSPARENT, randColor(), randColor()];
  var WIDTH = 64;
  var PRINT_OFFSET = WIDTH / 32;
  var HEIGHT = Math.sqrt(Math.pow(WIDTH, 2) - Math.pow(WIDTH / 2, 2));
  var ROWS = 4;
  var COLUMNS = 18;
  var SVG = document.getElementById('triangles');

  SVG.setAttribute('width', COLUMNS * WIDTH / 2 + WIDTH);
  SVG.setAttribute('height', ROWS * HEIGHT);

  var triangle = function (x, y, width, height, color, orientation) {
    var polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('fill', color);
    polygon.setAttribute('stroke', DEBUG ? '#000000' : 'none');
    polygon.setAttribute('points', width / 2 + ',0 0,' + height + ' ' + width + ',' + height);
    var transformations = [
      'translate(' + x + ', ' + y + ')',
      'rotate(' + orientation + ', ' + width / 2 + ', ' + height / 2 + ')'
    ];
    polygon.setAttribute('transform', transformations.join(' '));
    return polygon;
  };

  var randColorIndex = function (prevRand) {
    return randInt(2) == 0 ? prevRand : randInt(COLORS.length);
  };

  var colorIndex = 0;
  var printOffset = 0;
  var x, y, rowOffset;
  for (y = 0; y < ROWS; y++) {
    for (x = 0; x < COLUMNS; x++) {
      colorIndex = randColorIndex(colorIndex);
      rowOffset = WIDTH / 2 * (y % 2);
      printOffset = PRINT_OFFSET * (colorIndex - 1);
      SVG.append(
        triangle(
          x * (WIDTH / 2) + rowOffset + printOffset,
          y * HEIGHT + printOffset,
          WIDTH,
          HEIGHT,
          COLORS[colorIndex],
          x % 2 == 0 ? SOUTH : NORTH
        )
      );
    }
  }
}());
