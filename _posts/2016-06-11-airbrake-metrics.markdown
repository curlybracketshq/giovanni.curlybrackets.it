---
title: Collect and show Airbrake errors metrics with Ruby
layout: post
---

Yesterday I wrote a little Ruby script to fetch Airbrake's error groups. The
main goal was to identify the most common errors.

The script started as a single file *blob of code*. After some refactoring I
created two main classes: `AirbrakeFetcher` and `BarChart`.

### `AirbrakeFetcher`

Use this class to retrieve error groups, see more at [Airbrake API Reference -
Groups v4](https://airbrake.io/docs/#groups-v4). Create a new instance by
providing your Airbrake API key and project id.

<script src="https://gist.github.com/potomak/485a3fcb46f854845cffa0c8a8f95ba9.js?file=airbrake_fetcher.rb"></script>

`AirbrakeFetcher` has two public methods:

1. `fetch_groups(page, limit)` to fetch a single page of error groups
1. `fetch_all_groups` to fetch all error groups

`fetch_all_groups` doesn't return anything, but yields objects returned by
`fetch_groups` for each page.

I used `fetch_all_groups` to collect data about error groups.

### `BarChart`

Use this class to build a textual bar chart from a list of couples `[label,
value]`.

<script src="https://gist.github.com/potomak/485a3fcb46f854845cffa0c8a8f95ba9.js?file=bar_chart.rb"></script>

`BarChart` has one public method:

1. `draw` returns a string representing a bar chart associated to instance's
   data

I used `draw` to show the data I collected in the previous step with
`AirbrakeFetcher`.

Note: maybe `draw` is not the best name I could have chosen for this method. I
guess I could have called it `to_s`, since it doesn't have any *drawing* side
effect.

### Example usage

Below an example usage of both classes to show a bar chart of errors grouped by
error type.

<script src="https://gist.github.com/potomak/485a3fcb46f854845cffa0c8a8f95ba9.js?file=example.rb"></script>

From an example execution on a Rails app, the most common error I found was
`NoMethodError`, that happens most of the time when you try to call a method on
a `nil` object.

<script src="https://gist.github.com/potomak/485a3fcb46f854845cffa0c8a8f95ba9.js?file=example_output.txt"></script>

What is your most common error?

