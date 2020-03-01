'use strict';

// Reference:
//
// * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
// * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images

(function () {
  // Configuration
  var scaleFactor = 20;
  var samples = Math.ceil(scaleFactor * scaleFactor / 100);

  // Transparent color
  var tr = [0, 0, 0, 0];
  var smileyColor = randColor();
  var smileys = [
    '003C5A7E7E240000',
    '0000247E7E3C1800',
    '00002400423C0000',
    '00002400003C0000',
    '00002400003C4200',
    '0042241818244200'
  ];

  var smiley = (function () {
    var paramName = 'overlay=';
    var overlayIndex = document.location.search.indexOf(paramName);
    if (overlayIndex > -1) {
      var overlayData = document.location.search.slice(
        overlayIndex + paramName.length
      ).split('&')[0];
      try {
        return decodeOverlay(overlayData);
      } catch (err) {
        console.error('Overlay data decoding failed :( -', err);
      }
    }
    return decodeOverlay(smileys[randInt(smileys.length)]);
  })();

  // Decode a 16 digits long hexadecimal number into 64 bits (stored as 8 arrays
  // of 8 chars long strings of 0s and 1s).
  function decodeOverlay(data) {
    if (!/^[a-f0-9]{16}$/i.test(data)) {
      throw new Error('Wrong data format');
    }
    var i, j, d, overlay = [];
    for (i = 0; i < 16; i++) {
      d = (16 + parseInt(data[i], 16)).toString(2).slice(1);
      j = Math.floor(i / 2);
      overlay[j] = overlay[j] == null ? d : overlay[j] + d;
    }
    return overlay;
  }

  // Encode 64 bits of data (stored as 8 arrays of 8 chars long strings of 0s
  // and 1s) as a hexadecimal number.
  function encodeOverlay(data) {
    return data.reduce(function (acc, n) {
      return acc + (256 + parseInt(n, 2)).toString(16).slice(1);
    }, '');
  }

  // Returns a pseudo random color.
  //
  // These colors have at most one or two high components. That means there
  // should be at most 3 + 3 possible color classes.
  //
  // "High component" means a component that has a value between 255 - 32 and
  // 255. In contrast, "low component", is a component that has a value between
  // 0 and 31.
  //
  // The alpha is a value between 0.25 and 0.75.
  function randColor() {
    var comp = 32;
    var highComponents = 1 << randInt(3) | 1 << randInt(3);
    return [
      randInt(comp) + (highComponents & 1 << 2 ? 256 - comp : 0),
      randInt(comp) + (highComponents & 1 << 1 ? 256 - comp : 0),
      randInt(comp) + (highComponents & 1 << 0 ? 256 - comp : 0),
      0.25 + Math.random() / 2
    ];
  };

  // Returns a CSS string representation of a color composed by 4 components:
  // red, green, blue, and alpha.
  function colorToString(c) {
    return 'rgba(' + c[0] + ', ' + c[1] + ', ' + c[2] + ', ' + c[3] + ')';
  }

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
        ctx.fillStyle = colorToString(data[y][x]);
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
