---
title: jQuery Instagram Plugin Redesign
layout: post
---

[issue_33]: https://github.com/potomak/jquery-instagram/issues/33
[grunt-init]: http://gruntjs.com/project-scaffolding

The plugin utilizes the Instagram API to retrieve a list of photos using the JSONP format. The original idea is credited to Daniel Pavitt.

In versions up to 0.2, you could populate an element with a list of `<div>` elements containing Instagram photos by making a call like this:

```javascript
$(".selector").instagram({
  hash: "boat",
  clientId: "YOUR-CLIENT-ID",
});
```

However, you couldn't modify the generated code except by using the `onComplete` callback. For more details, see [issue #33][issue_33].

Starting with version 0.3, I removed code generation and callbacks. Now, code generation is the user's responsibility, and `willLoadInstagram` and `didLoadInstagram` events are triggered instead of using callbacks.

The `didLoadInstagram` event is triggered when the Instagram API responds. The associated handler can then access the entire response. For example:

```javascript
$(".selector").on("didLoadInstagram", function (event, response) {
  console.log(response);
});

$(".selector").instagram({
  hash: "boat",
  clientId: "YOUR-CLIENT-ID",
});
```

You can find more examples at [potomak.github.io/jquery-instagram](http://potomak.github.io/jquery-instagram/).

Additionally, the plugin has been generated using [grunt-init][grunt-init]. It uses Grunt as a build system and includes tests made using the QUnit framework.

You can fork the project at [github.com/potomak/jquery-instagram](http://github.com/potomak/jquery-instagram).
