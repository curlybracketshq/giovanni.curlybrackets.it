---
title: "ASCII Art API: Birdie at EuRuKo Golf"
layout: post
---

[ascii_art_api]: http://artii.herokuapp.com "ASCII Art API"
[goliath]: http://postrank-labs.github.com/goliath/

Wooga organized a contest called *EuRuKo Golf*, where you can win a ticket to EuRuKo 2012.

The goal is to write a tweetable (140 characters or fewer) Ruby program that outputs EuRoKo ASCII art.

One of the most innovative solutions was by Matteo (see pull request [here](https://github.com/wooga/euruko-golf/pull/2)), which uses the `artii` gem to create ASCII art.

A downside to this solution is the requirement to have the `artii` gem installed on your system to run it without errors. A workaround is to call a web service that can generate ASCII art from a string.

This solution is now available thanks to the [ASCII Art API][ascii_art_api].

It's a simple [Goliath][goliath] app that allows you to generate ASCII art from any text.

Try [artii.herokuapp.com/make?text=I+love+ASCII+art](http://artii.herokuapp.com/make?text=I+love+ASCII+art), and you should see a response similar to:

     _____   _                            _____  _____ _____ _____              _
    |_   _| | |                    /\    / ____|/ ____|_   _|_   _|            | |
      | |   | | _____   _____     /  \  | (___ | |      | |   | |     __ _ _ __| |_
      | |   | |/ _ \ \ / / _ \   / /\ \  \___ \| |      | |   | |    / _` | '__| __|
     _| |_  | | (_) \ V /  __/  / ____ \ ____) | |____ _| |_ _| |_  | (_| | |  | |_
    |_____| |_|\___/ \_/ \___| /_/    \_\_____/ \_____|_____|_____|  \__,_|_|   \__|

With this API, you should be able to create a contest solution like this:

```ruby
require 'open-uri'
puts open('http://j.mp/IRG0u1').read
```

You can find the app's source code at [github.com/potomak/artii-api](https://github.com/potomak/artii-api).
