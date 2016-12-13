'use strict';

(function () {
  var DEBUG = false;

  var SOUTH = 0;
  var NORTH = 180;
  var TRANSPARENT = 'rgba(0, 0, 0, 0)';
  var ORANGE = 'rgba(255, 102, 0, 0.6)';
  var BLUE = 'rgba(0, 0, 255, 0.6)';
  var COLORS = [TRANSPARENT, ORANGE, BLUE];
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
    polygon.setAttribute('transform', 'translate(' + x + ', ' + y + ') rotate(' + orientation + ', ' + width / 2 + ', ' + height / 2 + ')');
    return polygon;
  };

  var randomColorIndex = function (prevRand) {
    if (Math.floor(Math.random() * 2) == 0) {
      return prevRand;
    } else {
      return Math.floor(Math.random() * COLORS.length);
    }
  };

  var colorIndex = 0;
  var printOffset = 0;
  var x, y, rowOffset, orientation, color;
  for (y = 0; y < ROWS; y++) {
    for (x = 0; x < COLUMNS; x++) {
      colorIndex = randomColorIndex(colorIndex);
      orientation = x % 2 == 0 ? SOUTH : NORTH;
      rowOffset = WIDTH / 2 * (y % 2);
      printOffset = PRINT_OFFSET * (COLORS[colorIndex] == ORANGE ? 1 : 0);
      SVG.append(triangle(x * (WIDTH / 2) + rowOffset + printOffset, y * HEIGHT + printOffset, WIDTH, HEIGHT, COLORS[colorIndex], orientation));
    }
  }
}());
