Crafty.c('Actor', {
  init: function() {
    this.requires('2D, Canvas');
  },

  at: function(x, y) {
    this.x = x;
    this.y = y;

    return this;
  }
});
Crafty.c('ColorTween', {
  init: function() {
    this.requires('Color, Tween')
      .attr({
        _bg: {
          dayColor: {r: 0, g: 0, b: 0},
          nightColor: {r: 0, g: 0, b: 0}
        },
        _bgR: 0,
        _bgG: 0,
        _bgB: 0,
      })
      .bind('Day', function() {
        this.tween({
          _bgR: this._bg.dayColor.r,
          _bgG: this._bg.dayColor.g,
          _bgB: this._bg.dayColor.b
        }, 4000);
      })
      .bind('Night', function() {
        this.tween({
          _bgR: this._bg.nightColor.r,
          _bgG: this._bg.nightColor.g,
          _bgB: this._bg.nightColor.b
        }, 4000);
      })
      .bind('EnterFrame', function() {
        this.color(Game.rgbToString({ r: this._bgR, g: this._bgG, b: this._bgB }));
      });
  }
});

Crafty.c('Sky', {
  init: function() {
    this.requires('Actor, ColorTween')
      .attr({
        z: -11,
        w: Game.width,
        h: Game.height - Game.floorHeight,
        _bg: {
          dayColor: Game.daySkyColor,
          nightColor: Game.nightSkyColor
        },
        _bgR: Game.daySkyColor.r,
        _bgG: Game.daySkyColor.g,
        _bgB: Game.daySkyColor.b,
      })
      .color(Game.rgbToString(Game.daySkyColor));
  }
});

Crafty.c('Floor', {
  init: function() {
    this.requires('Actor, ColorTween')
      .attr({
        y: Game.height - Game.floorHeight,
        z: -8,
        w: Game.width,
        h: Game.floorHeight,
        _bg: {
          dayColor: Game.dayFloorColor,
          nightColor: Game.nightFloorColor
        },
        _bgR: Game.dayFloorColor.r,
        _bgG: Game.dayFloorColor.g,
        _bgB: Game.dayFloorColor.b,
      })
      .color(Game.rgbToString(Game.dayFloorColor));
  }
});

Crafty.c('FloorDark', {
  init: function() {
    this.requires('Actor, ColorTween')
      .attr({
        z: -8,
        w: Game.width,
        _bg: {
          dayColor: Game.dayFloorDarkColor,
          nightColor: Game.nightFloorDarkColor
        },
        _bgR: Game.dayFloorDarkColor.r,
        _bgG: Game.dayFloorDarkColor.g,
        _bgB: Game.dayFloorDarkColor.b,
      })
      .color(Game.rgbToString(Game.dayFloorDarkColor));
  }
});
Crafty.c('Bottle', {
  init: function() {
    this.requires('Item, BottleSprite, Collision')
      .reel('Bottle', 1000, 0, 0, 1)
      .animate('Bottle', -1)
      .onHit('Player', this._onHit);

    this.z = 0;
    this._item.planeDeepness = 1;
  },

  _onHit: function() {
    Crafty.trigger('BottleHit');
    this.destroy();
  }
});
Crafty.c('Cactus', {
  init: function() {
    this.requires('Item, CactusSprite')
      .attr({ z: 1 })
      .reel('Cactus', 1000, 0, 0, 1)
      .animate('Cactus', -1);

    this._item.planeDeepness = 0.5;
  }
});
Crafty.c('City', {
  init: function() {
    this.requires('Item')
      .bind('Day', function() {
        this.animate('CityDay', -1);
      })
      .bind('Night', function() {
        this.animate('CityNight', -1);
      });
  }
});

Crafty.c('City1', {
  init: function() {
    this.requires('City, City1Sprite')
      .reel('CityDay',   1000, 0, 0, 1)
      .reel('CityNight', 1000, 0, 1, 1)
      .animate('CityDay', -1);

    this.z = -1;
    this._item.planeDeepness = 1;
  }
});

Crafty.c('City2', {
  init: function() {
    this.requires('City, City2Sprite')
      .reel('CityDay',   1000, 0, 0, 1)
      .reel('CityNight', 1000, 0, 1, 1)
      .animate('CityDay', -1);

    this.z = -2;
    this._item.planeDeepness = 2;
  }
});
Crafty.c('Item', {
  init: function() {
    this.requires('Actor, SpriteAnimation')
      .attr({
        _item: {
          planeDeepness: 1,
          speed: 2,         // pixels/frame at planeDeepness == 1
          direction: 0      // 1 = west, -1 = east, 0 = stand
        }
      })
      .bind('EnterFrame', this._itemEnterFrame)
      .bind('PlayerWalkWest', this._itemPlayerWalkWest)
      .bind('PlayerWalkEast', this._itemPlayerWalkEast)
      .bind('PlayerStand', this._itemPlayerStand)
      .bind('Death', this._onGameEnd)
      .bind('Win', this._onGameEnd);
  },

  _itemEnterFrame: function(data) {
    this.x += this._item.direction * this._item.speed/this._item.planeDeepness;
  },

  _itemPlayerWalkEast: function() {
    this._item.direction = -1;
  },

  _itemPlayerWalkWest: function() {
    this._item.direction = 1;
  },

  _itemPlayerStand: function() {
    this._item.direction = 0;
  },

  _onGameEnd: function() {
    this.unbind('EnterFrame', this._itemEnterFrame);
  }
});
Crafty.c('Moon', {
  init: function() {
    this.requires('Planet, MoonSprite')
      .reel('Shining', 1000, 0, 0, 1)
      .animate('Shining', -1);

    this._planet.angle = Math.PI;
  }
});
Crafty.c('Planet', {
  init: function() {
    this.requires('Actor, SpriteAnimation')
      .attr({
        z: -9,
        _planet: {
          // speeds in radians/frame
          standSpeed: Math.PI/Game.hydrationLevel, // a complete revolution in 72 seconds (a frame is 20 ms)
          offsetX: Game.width/2,
          offsetY: Game.height - Game.floorHeight,
          angle: 0,
          radius: 350
        }
      })
      .bind('EnterFrame', this._planetEnterFrame)
      .bind('PlayerStand', function() {
        this._planet.angularSpeed = this._planet.standSpeed;
      })
      .bind('PlayerWalkEast', function() {
        this._planet.angularSpeed = this._planet.walkEastSpeed;
      })
      .bind('PlayerWalkWest', function() {
        this._planet.angularSpeed = this._planet.walkWestSpeed;
      });

    this._planet.walkEastSpeed = this._planet.standSpeed * 2;
    this._planet.walkWestSpeed = this._planet.standSpeed / 2;
    this._planet.angularSpeed = this._planet.standSpeed;
  },

  _planetEnterFrame: function(data) {
    this._planet.angle += this._planet.angularSpeed;
    if (this._planet.angle > Math.PI*2) {
      this._planet.angle = 0;
    }
    this.x = Math.cos(this._planet.angle) * this._planet.radius + this._planet.offsetX - this.w/2;
    this.y = -1 * Math.sin(this._planet.angle) * this._planet.radius + this._planet.offsetY - this.h/2;
  }
});
Crafty.c('Player', {
  init: function() {
    this.requires('Actor, SpriteAnimation, PlayerSprite')
      .attr({
        walking: false,
        hydration: Game.hydrationLevel,
        alive: true,
        direction: 1, // 1 = west, -1 = east
        distance: 0,
        choke: false
      })
      .reel('StandingEast', 1000, 0, 0, 1)
      .reel('StandingWest', 1000, 0, 1, 1)
      .reel('WalkingEast',  1000, 0, 2, 7)
      .reel('WalkingWest',  1000, 0, 3, 7)
      .reel('DyingEast',    1000, 0, 4, 5)
      .reel('DyingWest',    1000, 0, 5, 5)
      .reel('Winning',      1000, 0, 6, 4)
      .animate('StandingEast', -1)
      .bind('KeyDown', this._onKeyDown)
      .bind('KeyUp', this._onKeyUp)
      .bind('EnterFrame', this._onEnterFrame)
      .bind('Death', this._onDeath)
      .bind('Win', this._onWin)
      .bind('BottleHit', this._onBoottleHit);
  },

  _onKeyDown: function(e) {
    if (!this.walking) {
      if (e.key == Crafty.keys.LEFT_ARROW || e.key == Crafty.keys.RIGHT_ARROW) {
        this.walking = true;
        Crafty.audio.play('walk', -1, Game.effectsVolume);
      }

      if (e.key == Crafty.keys.LEFT_ARROW) {
        this.direction = 1;
        this.animate('WalkingWest', -1);
        Crafty.trigger('PlayerWalkWest');
      } else if (e.key == Crafty.keys.RIGHT_ARROW) {
        this.direction = -1;
        this.animate('WalkingEast', -1);
        Crafty.trigger('PlayerWalkEast');
      }
    }
  },

  _onKeyUp: function(e) {
    if (this.walking) {
      if (e.key == Crafty.keys.LEFT_ARROW || e.key == Crafty.keys.RIGHT_ARROW) {
        this.walking = false;
        Crafty.audio.stop('walk');
        Crafty.trigger('PlayerStand');
      }

      if (e.key == Crafty.keys.LEFT_ARROW) {
        this.animate('StandingWest', -1);
      } else if (e.key == Crafty.keys.RIGHT_ARROW) {
        this.animate('StandingEast', -1);
      }
    }
  },

  _onEnterFrame: function(data) {
    if (this.alive) {
      if (Game.dayStatus == 'day') {
        this.hydration -= 1;
        Crafty.trigger('HydrationLevel', Game.hydrationWidth*this.hydration/Game.hydrationLevel);
      }

      if (this.hydration <= 0) {
        Crafty.trigger('Death');
      }

      if (!this.choke && this.hydration <= 415) {
        this.choke = true;
        Crafty.audio.play('choke', 1, Game.effectsVolume);
      }

      if (this.walking) {
        this.distance += this.direction;

        if (this.distance >= 4500) {
          Crafty.trigger('Win');
        }
      }
    }
  },

  _onDeath: function() {
    this.alive = false;
    this.walking = false;
    Crafty.audio.stop('walk');
    Crafty.audio.play('death_breath', 1, Game.effectsVolume);

    this._removeListeners();

    Game.log(this.distance);

    if (this.direction == 1) {
      this.animate('DyingWest', 1);
    } else {
      this.animate('DyingEast', 1);
    }
  },

  _onWin: function() {
    this.walking = false;
    Crafty.audio.stop('walk');
    Crafty.audio.stop('choke');
    Crafty.audio.play('wohoo', 1, Game.effectsVolume);

    this._removeListeners();

    Game.log(this.distance);

    this.animate('Winning', -1);
  },

  _removeListeners: function() {
    this.unbind('KeyDown', this._onKeyDown);
    this.unbind('KeyUp', this._onKeyUp);
    this.unbind('EnterFrame', this._onEnterFrame);
    this.unbind('Death', this._onDeath);
    this.unbind('Win', this._onWin);
  },

  _onBoottleHit: function() {
    this.choke = false;
    Crafty.audio.stop('choke');
    Crafty.audio.play('drink', 1, Game.effectsVolume);
    this.hydration = Game.hydrationLevel;
    Crafty.trigger('HydrationLevel', Game.hydrationWidth*this.hydration/Game.hydrationLevel);
  }
});
Crafty.c('Rock', {
  init: function() {
    this.requires('Item')
      .bind('Day', function() {
        this.animate('RockDay', -1);
      })
      .bind('Night', function() {
        this.animate('RockNight', -1);
      });
  }
});

Crafty.c('Rock1', {
  init: function() {
    this.requires('Item, Rock1Sprite')
      .reel('RockDay',   1000, 0, 0, 1)
      .reel('RockNight', 1000, 0, 1, 1)
      .animate('RockDay', -1);

    this.z = -1;
  }
});

Crafty.c('Rock2', {
  init: function() {
    this.requires('Item, Rock2Sprite')
      .reel('RockDay',   1000, 0, 0, 1)
      .reel('RockNight', 1000, 0, 1, 1)
      .animate('RockDay', -1);

    this.z = -2;
    this._item.planeDeepness = 2;
  }
});

Crafty.c('Rock3', {
  init: function() {
    this.requires('Item, Rock3Sprite')
      .reel('RockDay',   1000, 0, 0, 1)
      .reel('RockNight', 1000, 0, 1, 1)
      .animate('RockDay', -1);

    this.z = -2;
    this._item.planeDeepness = 2;
  }
});

Crafty.c('Rock4', {
  init: function() {
    this.requires('Item, Rock4Sprite')
      .reel('RockDay',   1000, 0, 0, 1)
      .reel('RockNight', 1000, 0, 1, 1)
      .animate('RockDay', -1);

    this.z = -2;
    this._item.planeDeepness = 2;
  }
});
Crafty.c('Star', {
  init: function() {
    this.requires('Actor, Color, Tween')
      .attr({ z: -10, w: 4, h: 4, alpha: 0.0 })
      .color('#dedede')
      .bind('Day', function() {
        this.tween({ alpha: 0.0 }, Game.tweenTime);
      })
      .bind('Night', function() {
        this.tween({ alpha: 1.0 }, Game.tweenTime);
      });
  }
});
Crafty.c('Sun', {
  init: function() {
    this.requires('Planet, SunSprite')
      .reel('Shining', 1000, 0, 0, 2)
      .animate('Shining', -1)
      .bind('EnterFrame', this._sunEnterFrame);

    this._planet.angle = 0;
  },

  _sunEnterFrame: function(data) {
    if (this._planet.angle > 0 && this._planet.angle <= Math.PI) {
      if (Game.dayStatus != 'day') {
        Crafty.trigger('Day');
        Game.dayStatus = 'day';
      }
    } else {
      if (Game.dayStatus != 'night') {
        Crafty.trigger('Night');
        Game.dayStatus = 'night';
      }
    }
  }
});
Crafty.c('TitleText', {
  init: function() {
    this.requires('2D, DOM, Text')
      .attr({ w: Game.width, y: 200 })
      .textFont(Game.titleFont)
      .css({ 'text-align': 'center' })
      .unselectable()
      .bind('Day', function() {
        this.textColor('#333333');
      })
      .bind('Night', function() {
        this.textColor('#dedede');
      });

    if (Game.dayStatus == 'day') {
      this.textColor('#333333');
    } else {
      this.textColor('#dedede');
    }
  }
});
Crafty.scene('Game', function() {
  // play theme if not already playing
  if (Crafty.audio.sounds.theme.played === 0) {
    Crafty.audio.play('theme', -1, Game.musicVolume);
  }

  // sky
  this.sky = Crafty.e('Sky');
  // sun
  this.sun = Crafty.e('Sun');
  // moon
  this.moon = Crafty.e('Moon');
  // dark floors
  this.darkFloor = [];
  this.darkFloor.push(Crafty.e('FloorDark').attr({ y: Game.height - Game.floorHeight, h: 20 }));
  this.darkFloor.push(Crafty.e('FloorDark').attr({ y: (Game.height - Game.floorHeight) + 30, h: 5 }));
  // floor
  this.floor = Crafty.e('Floor');

  // stars
  this.stars = [];
  this.stars.push(Crafty.e('Star').at(161, 102));
  this.stars.push(Crafty.e('Star').at(279, 207));
  this.stars.push(Crafty.e('Star').at(374, 61));
  this.stars.push(Crafty.e('Star').at(597, 133));
  this.stars.push(Crafty.e('Star').at(782, 243));
  this.stars.push(Crafty.e('Star').at(613, 348));
  this.stars.push(Crafty.e('Star').at(409, 397));
  this.stars.push(Crafty.e('Star').at(310, 323));
  this.stars.push(Crafty.e('Star').at(155, 341));
  this.stars.push(Crafty.e('Star').at(237, 452));
  this.stars.push(Crafty.e('Star').at(817, 90));
  this.stars.push(Crafty.e('Star').at(109, 269));
  this.stars.push(Crafty.e('Star').at(557, 273));

  // items
  this.items = [];
  this.items.push(Crafty.e('Rock4').at(200, 445));
  this.items.push(Crafty.e('Rock4').at(1200, 445));
  this.items.push(Crafty.e('Rock4').at(2200, 445));
  this.items.push(Crafty.e('Rock4').at(-1200, 445));
  this.items.push(Crafty.e('Rock3').at(750, 420));
  this.items.push(Crafty.e('Rock3').at(1550, 420));
  this.items.push(Crafty.e('Rock3').at(-750, 420));
  this.items.push(Crafty.e('Rock3').at(-1650, 420));
  this.items.push(Crafty.e('Rock2').at(-200, 450));
  this.items.push(Crafty.e('Rock2').at(-1900, 450));
  this.items.push(Crafty.e('Rock2').at(-3200, 450));
  this.items.push(Crafty.e('Rock2').at(-3800, 450));
  this.items.push(Crafty.e('Rock1').at(500, 410));
  this.items.push(Crafty.e('Rock1').at(2500, 410));
  this.items.push(Crafty.e('Rock1').at(4500, 410));
  this.items.push(Crafty.e('Rock1').at(-2500, 410));
  this.items.push(Crafty.e('Rock1').at(-5500, 410));
  this.items.push(Crafty.e('Rock1').at(-7500, 410));
  this.items.push(Crafty.e('Cactus').at(200, 380));
  this.items.push(Crafty.e('Cactus').at(4200, 380));
  this.items.push(Crafty.e('Cactus').at(10000, 380));
  this.items.push(Crafty.e('Cactus').at(-4200, 380));
  this.items.push(Crafty.e('Cactus').at(-8200, 380));
  this.items.push(Crafty.e('Cactus').at(-10200, 380));
  this.items.push(Crafty.e('Cactus').at(-12200, 380));
  this.items.push(Crafty.e('Cactus').at(-16200, 380));

  // bottles
  this.bottles = [];
  this.bottles.push(Crafty.e('Bottle').at(6000, 500));
  this.bottles.push(Crafty.e('Bottle').at(-3400, 500));

  // city
  this.city = [];
  this.city.push(Crafty.e('City1').at(-9200, 140));
  this.city.push(Crafty.e('City2').at(-4750, 130));

  // player
  this.player = Crafty.e('Player').at(Game.width/2 - 64, 400);

  // heart
  this.heart = Crafty.e('Actor, Image')
    .image('assets/heart.png')
    .at(10, 10);
  // hydration
  this.hydrationLevel = Crafty.e('2D, ProgressBar')
    .attr({ x: 52, y: 12, w: Game.hydrationWidth, h: 32 })
    .progressBar('HydrationLevel', Game.hydrationWidth, Game.hydrationWidth, false, '#ecf0f1', '#e74c3c', 'Canvas');

  this.playing = true;

  this.removeOSD = function() {
    this.heart.destroy();
    this.hydrationLevel.y = -100;
  };

  this.onPlayerDeath = function() {
    this.removeOSD();
    this.playing = false;

    Crafty.e('TitleText').text('Press R to restart');
  };

  this.onPlayerWin = function() {
    this.removeOSD();
    this.playing = false;

    Crafty.e('TitleText')
      .attr({ y: 160 })
      .textFont({ 'size': '128px' })
      .text('Loop Desert');

    Crafty.e('TitleText')
      .attr({ y: 260 })
      .text('by Giovanni Cappellotto');
  };

  this.onKeyDown = function(e) {
    if (!this.playing && e.keyCode == Crafty.keys.R) {
      Crafty.scene('Game');
    }
  };

  this.bind('Death', this.onPlayerDeath);
  this.bind('Win', this.onPlayerWin);
  Crafty.addEvent(this, 'keydown', this.onKeyDown);
}, function() {
  this.unbind('Death', this.onPlayerDeath);
  this.unbind('Win', this.onPlayerWin);
  Crafty.removeEvent(this, 'keydown', this.onKeyDown);
});

Crafty.scene('Loading', function() {
  var assets = [
    'assets/sounds/theme.mp3',
    'assets/sounds/theme.m4a',
    'assets/sounds/theme.ogg',
    'assets/sounds/walk.mp3',
    'assets/sounds/walk.m4a',
    'assets/sounds/walk.ogg',
    'assets/sounds/death_breath.mp3',
    'assets/sounds/death_breath.m4a',
    'assets/sounds/death_breath.ogg',
    'assets/sounds/drink.mp3',
    'assets/sounds/drink.m4a',
    'assets/sounds/drink.ogg',
    'assets/sounds/choke.mp3',
    'assets/sounds/choke.m4a',
    'assets/sounds/choke.ogg',
    'assets/sounds/wohoo.mp3',
    'assets/sounds/wohoo.m4a',
    'assets/sounds/wohoo.ogg',
    'assets/player.png',
    'assets/sun.png',
    'assets/moon.png',
    'assets/city_1.png',
    'assets/city_2.png',
    'assets/rock_1.png',
    'assets/rock_2.png',
    'assets/rock_3.png',
    'assets/rock_4.png',
    'assets/cactus.png',
    'assets/heart.png',
    'assets/bottle.png'
  ];

  this.progressLoading = Crafty.e('2D, ProgressBar')
    .attr({ w: Game.width, h: 30, y: Game.height / 2 })
    .progressBar('LoadingProgress', 10, 100, false, '#fff', '#000', 'DOM');

  Crafty.load(assets, function() {
    Crafty.sprite(128, 128, 'assets/player.png', {
      PlayerSprite: [0, 0],
    });

    Crafty.sprite(128, 128, 'assets/sun.png', {
      SunSprite: [0, 0],
    });

    Crafty.sprite(128, 128, 'assets/moon.png', {
      MoonSprite: [0, 0],
    });

    Crafty.sprite(133, 84, 'assets/rock_1.png', {
      Rock1Sprite: [0, 0],
    });

    Crafty.sprite(22, 36, 'assets/rock_2.png', {
      Rock2Sprite: [0, 0],
    });

    Crafty.sprite(80, 53, 'assets/rock_3.png', {
      Rock3Sprite: [0, 0],
    });

    Crafty.sprite(46, 34, 'assets/rock_4.png', {
      Rock4Sprite: [0, 0],
    });

    Crafty.sprite(88, 184, 'assets/cactus.png', {
      CactusSprite: [0, 0],
    });

    Crafty.sprite(32, 32, 'assets/bottle.png', {
      BottleSprite: [0, 0],
    });

    Crafty.sprite(800, 367, 'assets/city_1.png', {
      City1Sprite: [0, 0],
    });

    Crafty.sprite(800, 343, 'assets/city_2.png', {
      City2Sprite: [0, 0],
    });

    // audio samples
    Crafty.audio.add({
      theme: [
        'assets/sounds/theme.mp3',
        'assets/sounds/theme.m4a',
        'assets/sounds/theme.ogg'
      ],
      walk: [
        'assets/sounds/walk.mp3',
        'assets/sounds/walk.m4a',
        'assets/sounds/walk.ogg'
      ],
      death_breath: [
        'assets/sounds/death_breath.mp3',
        'assets/sounds/death_breath.m4a',
        'assets/sounds/death_breath.ogg'
      ],
      drink: [
        'assets/sounds/drink.mp3',
        'assets/sounds/drink.m4a',
        'assets/sounds/drink.ogg'
      ],
      choke: [
        'assets/sounds/choke.mp3',
        'assets/sounds/choke.m4a',
        'assets/sounds/choke.ogg'
      ],
      wohoo: [
        'assets/sounds/wohoo.mp3',
        'assets/sounds/wohoo.m4a',
        'assets/sounds/wohoo.ogg'
      ]
    });

    Crafty.scene('Game');
  }, function (e) {
    Crafty.trigger('LoadingProgress', e.percent);
  });
});
