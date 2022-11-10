---
title: ASCII art API, birdie at EuRuKo Golf
layout: post
---

[euruko_golf]: http://www.wooga.com/2012/05/euruko/ "EuRuKo Golf"
[euruko_golf_repo]: https://github.com/wooga/euruko-golf "EuRuKo Golf repo"
[ascii_art_api]: http://artii.herokuapp.com "ASCII art API"
[goliath]: http://postrank-labs.github.com/goliath/

Wooga started a little contest called *EuRuKo Golf* where you can win a ticket
to EuRuKo 2012.

The goal of this contest is to write a tweetable (140 characters or less) ruby
program that outputs EuRoKo ASCII art.

One of the smartest solutions was Matteo's (see pull request
[https://github.com/wooga/euruko-golf/pull/2](https://github.com/wooga/euruko-golf/pull/2))
which uses the `artii` gem to create ASCII art.

A drawback of this solution is that you should have the `artii` gem installed on
your system to run it without errors. A workaround is to call a web service that
can generate ASCII art from a string.

This solution is now available thanks to [ASCII art API][ascii_art_api].

It's a simple [Goliath][goliath] app that lets you generate ASCII art from any
text.

Try
[http://artii.herokuapp.com/make?text=I+love+ASCII+art](http://artii.herokuapp.com/make?text=I+love+ASCII+art),
you should see something like this as a response from the API:

     _____   _                            _____  _____ _____ _____              _   
    |_   _| | |                    /\    / ____|/ ____|_   _|_   _|            | |  
      | |   | | _____   _____     /  \  | (___ | |      | |   | |     __ _ _ __| |_
      | |   | |/ _ \ \ / / _ \   / /\ \  \___ \| |      | |   | |    / _` | '__| __|
     _| |_  | | (_) \ V /  __/  / ____ \ ____) | |____ _| |_ _| |_  | (_| | |  | |_
    |_____| |_|\___/ \_/ \___| /_/    \_\_____/ \_____|_____|_____|  \__,_|_|   \__|

With this API you should be able to build a solution to the contest like this:

    require 'open-uri'
    puts open('http://j.mp/IRG0u1').read

You can find the app's source code at
[http://github.com/potomak/artii-api](http://github.com/potomak/artii-api).

Resources:

* [EuRuKo Golf by Wooga][euruko_golf]
* [EuRuKo Golf repo][euruko_golf_repo]
