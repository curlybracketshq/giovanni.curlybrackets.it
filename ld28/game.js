var Game = {
  version: '0.0.0',
  debug: true,
  log: function() {
    if (this.debug) {
      console.log.apply(console, arguments);
    }
  },

  width: 800,
  height: 600,
  floorHeight: 130,
  hydrationWidth: 736,
  hydrationLevel: 1800,
  tweenTime: 4000,

  daySkyColor:       { r: 194, g: 217, b: 237 },
  dayFloorColor:     { r: 219, g: 96,  b: 48  },
  dayFloorDarkColor: { r: 166, g: 54,  b: 37  },

  nightSkyColor:       { r: 41,  g: 64,  b: 98  },
  nightFloorColor:     { r: 135, g: 113, b: 178 },
  nightFloorDarkColor: { r: 93,  g: 71,  b: 137 },

  effectsVolume: 0.3,
  musicVolume: 1.0,

  titleFont: {
    'size': '64px',
    'family': 'munroregular'
  },

  start: function() {
    Game.tileOffset = Game.tileSize * 2;

    Crafty.init(Game.width, Game.height);
    Crafty.scene('Loading');
  },

  rgbToString: function(rgb) {
    return "rgb(" + Math.round(rgb.r) + ", " + Math.round(rgb.g) + ", " + Math.round(rgb.b) + ")";
  }
};
