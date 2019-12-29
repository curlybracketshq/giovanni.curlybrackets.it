---
title: jQuery Instagram plugin redesign
layout: post
---

[origin]: https://forrst.com/posts/Using_the_Instagram_API-ti5#comment-271830
[dpvitt]: https://twitter.com/dpvitt
[issue_33]: https://github.com/potomak/jquery-instagram/issues/33
[jquery-instagram-page]: http://potomak.github.io/jquery-instagram/
[grunt-init]: http://gruntjs.com/project-scaffolding
[jquery-instagram]: http://github.com/potomak/jquery-instagram

The plugin uses the Instagram API to get a list of photos using the JSONP
format, the [original idea][origin] is by [Daniel Pavitt][dpvitt].

Up to version 0.2 you could just make a call to

    $('.selector').instagram({
      hash: 'boat',
      clientId: 'YOUR-CLIENT-ID'
    });

to populate `.selector` element with a list of `<div>` elements containing
photos from Instagram.

You couldn't modify the generated code except using the `onComplete` callback,
see [issue #33][issue_33].

Since version 0.3 I removed code generation and callbacks. Now code generation
is up to the user and `willLoadInstagram` and `didLoadInstagram` events are
triggered instead of using callbacks.

The `didLoadInstagram` event is triggered when Instagram API responds, the
associated handler can access the whole response. Example:

    $('.selector').on('didLoadInstagram', function(event, response) {
      console.log(response);
    });

    $('.selector').instagram({
      hash: 'boat',
      clientId: 'YOUR-CLIENT-ID'
    });

You can find more examples at
[http://potomak.github.io/jquery-instagram/][jquery-instagram-page].

Moreover the plugin has been generated using [grunt-init][grunt-init], it uses
grunt as build system and includes tests made using the QUnit framework.

You can fork the project at
[http://github.com/potomak/jquery-instagram][jquery-instagram].
