'use strict';

// Reference:
//
// * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
// * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images

(function () {
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

  function sample(imageData, scaleFactor, samples) {
    var x, y, i, ri, colorSample, averageColor, sampled = [];

    var scaledWidth = Math.floor(imageData.width / scaleFactor);
    var scaledHeight = Math.floor(imageData.height / scaleFactor);

    for (y = 0; y < scaledHeight; y++) {
      sampled[y] = [];
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

        sampled[y].push(averageColor);
      }
    }

    return sampled;
  }

  // Configuration
  var scaleFactor = 30;
  var samples = Math.ceil(scaleFactor * scaleFactor / 100);

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
    var sampled = sample(imageData, scaleFactor, samples);
    var x, y;
    for (y = 0; y < sampled.length; y++) {
      for (x = 0; x < sampled[y].length; x++) {
        ctx.fillStyle = 'rgba(' + sampled[y][x][0] + ', ' + sampled[y][x][1] + ', ' + sampled[y][x][2] + ', ' + sampled[y][x][3] + ')'
        ctx.fillRect(x * scaleFactor, y * scaleFactor, scaleFactor, scaleFactor);
      }
    }
  };
  img.src = target.dataset.src;
}());
