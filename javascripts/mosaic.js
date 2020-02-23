'use strict';

// Reference:
//
// * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
// * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images

(function () {
  // Configuration
  var scaleFactor = 20;
  var samples = Math.ceil(scaleFactor * scaleFactor / 100);

  var tr = [0, 0, 0, 0];
  var smileyColor = randColor();
  var smileys = [
    [
      '00000000',
      '00111100',
      '01011010',
      '01111110',
      '01111110',
      '00100100',
      '00000000',
      '00000000',
    ],
    [
      '00000000',
      '00000000',
      '00100100',
      '01111110',
      '01111110',
      '00111100',
      '00011000',
      '00000000',
    ],
    [
      '00000000',
      '00000000',
      '00100100',
      '00000000',
      '01000010',
      '00111100',
      '00000000',
      '00000000',
    ],
    [
      '00000000',
      '00000000',
      '00100100',
      '00000000',
      '00000000',
      '00111100',
      '00000000',
      '00000000',
    ],
    [
      '00000000',
      '00000000',
      '00100100',
      '00000000',
      '00000000',
      '00111100',
      '01000010',
      '00000000',
    ],
    [
      '00000000',
      '01000010',
      '00100100',
      '00011000',
      '00011000',
      '00100100',
      '01000010',
      '00000000',
    ]
  ];
  var smiley = (function () {
    var overlayIndex = document.location.search.indexOf('overlay=');
    if (overlayIndex > -1) {
      var overlay = document.location.search.slice(overlayIndex);
      overlay = overlay.split('&')[0];
      var overlayData = overlay.split('=')[1];
      try {
        return decodeOverlay(overlayData);
      } catch(err) {
        console.error('Overlay data decoding failed :( -', err);
      }
    }
    return smileys[randInt(smileys.length)];
  })();

  function decodeOverlay(data) {
    if (data.length != 64) {
      throw new Error('Wrong data length');
    }
    var i, overlay = [];
    for (i = 0; i < 8; i++) {
      overlay.push(data.slice(i * 8, i * 8 + 8));
    }
    return overlay;
  }

  function randColor() {
    var comp = 32;
    var highComponent1 = randInt(3);
    var highComponent2 = randInt(3);
    var color = [
      randInt(comp),
      randInt(comp),
      randInt(comp),
      0.25 + Math.random() / 2
    ];
    color[highComponent1] += 255 - comp;
    if (highComponent1 != highComponent2) {
      color[highComponent2] += 255 - comp;
    }
    return color;
  };

  function getColorAtCoord(x, y, imageData) {
    var redIndex = y * (imageData.width * 4) + x * 4;
    var greenIndex = redIndex + 1;
    var blueIndex = redIndex + 2;
    var alphaIndex = redIndex + 3;

    return [
      imageData.data[redIndex],
      imageData.data[greenIndex],
      imageData.data[blueIndex],
      imageData.data[alphaIndex]
    ];
  }

  function randInt(max) {
    return Math.floor(Math.random() * max);
  }

  function shuffle(length) {
    var i, ri, t, res = [];
    for (i = 0; i < length; i++) {
      res.push(i);
    }
    for (i = length - 1; i >= 0; i--) {
      ri = randInt(i + 1);
      t = res[i];
      res[i] = res[ri];
      res[ri] = t;
    }
    return res;
  }

  function overlay(bitmap, sampledData) {
    var x, y, sx, sy, overlayData = [];
    var dw = Math.ceil(sampledData[0].length / bitmap[0].length);
    var dh = Math.ceil(sampledData.length / bitmap.length);

    for (y = 0; y < sampledData.length; y++) {
      overlayData.push([]);
      sy = Math.floor(y / dh);
      for (x = 0; x < sampledData[y].length; x++) {
        sx = Math.floor(x / dw);
        overlayData[y].push(bitmap[sy][sx] == '1' ? smileyColor : tr);
      }
    }

    return overlayData;
  }

  function sample(imageData, scaleFactor, samples) {
    var x, y, i, ri, colorSample, averageColor, sampledData = [];

    var scaledWidth = Math.floor(imageData.width / scaleFactor);
    var scaledHeight = Math.floor(imageData.height / scaleFactor);

    for (y = 0; y < scaledHeight; y++) {
      sampledData.push([]);
      for (x = 0; x < scaledWidth; x++) {
        averageColor = [0, 0, 0, 0];
        for (i = 0; i < samples; i++) {
          ri = randInt(scaleFactor * scaleFactor);
          colorSample = getColorAtCoord(
            x * scaleFactor + (ri % scaleFactor),
            y * scaleFactor + Math.floor(ri / scaleFactor),
            imageData
          );
          averageColor[0] += colorSample[0];
          averageColor[1] += colorSample[1];
          averageColor[2] += colorSample[2];
          averageColor[3] += colorSample[3];
        }
        averageColor[0] = Math.round(averageColor[0] / samples);
        averageColor[1] = Math.round(averageColor[1] / samples);
        averageColor[2] = Math.round(averageColor[2] / samples);
        averageColor[3] = Math.round(averageColor[3] / samples);

        sampledData[y].push(averageColor);
      }
    }

    return sampledData;
  }

  function draw(ctx, data, scaleFactor) {
    var x, y;
    for (y = 0; y < data.length; y++) {
      for (x = 0; x < data[y].length; x++) {
        ctx.fillStyle = 'rgba(' + data[y][x][0] + ', ' + data[y][x][1] + ', ' + data[y][x][2] + ', ' + data[y][x][3] + ')'
        ctx.fillRect(x * scaleFactor, y * scaleFactor, scaleFactor, scaleFactor);
      }
    }
  }

  var target = document.getElementById('mosaic');
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  target.appendChild(canvas);
  var img = new Image();
  img.onload = function() {
    canvas.width = Math.floor(img.naturalWidth / scaleFactor) * scaleFactor;
    canvas.height = Math.floor(img.naturalHeight / scaleFactor) * scaleFactor;
    ctx.drawImage(img, 0, 0);
    var imageData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
    var sampledData = sample(imageData, scaleFactor, samples)
    draw(ctx, sampledData, scaleFactor);
    var overlayData = overlay(smiley, sampledData);
    draw(ctx, overlayData, scaleFactor);
  };
  img.src = target.dataset.src;
}());
