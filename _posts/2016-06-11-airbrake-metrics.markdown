---
title: Collect and Display Airbrake Error Metrics with Ruby
layout: post
---

Yesterday, I wrote a small Ruby script to fetch Airbrake's error groups. The main goal was to identify the most common errors.

The script started as a single file *blob of code*. After some refactoring, I created two main classes: `AirbrakeFetcher` and `BarChart`.

## `AirbrakeFetcher`

Use this class to retrieve error groups. See more at the [Airbrake API Reference - Groups v4](https://airbrake.io/docs/#groups-v4). Create a new instance by providing your Airbrake API key and project ID.

```ruby
require 'json'
require 'open-uri'

class AirbrakeFetcher
  BASE_URL = 'https://airbrake.io'
  DEFAULT_LIMIT = 100

  def initialize(api_key, project_id)
    @api_key = api_key
    @project_id = project_id
  end

  def fetch_all_groups
    page = 1
    loop do
      response = fetch_groups(page, DEFAULT_LIMIT)
      yield response
      page += 1
      break if page > total_pages(response['count'], DEFAULT_LIMIT)
    end
  end

  # Airbrake API docs: https://airbrake.io/docs/#groups-v4
  def fetch_groups(page, limit)
    response_body = open(groups_url(page, limit)).read
    JSON.parse(response_body)
  rescue => err
    puts "Error trying to fetch page #{page}: #{err}"
  end

  private

  def groups_url(page, limit)
    url = "#{BASE_URL}/api/v4/projects/#{@project_id}/groups"
    params = { key: @api_key, page: page, limit: limit }
    "#{url}?#{query_string(params)}"
  end

  def query_string(params)
    URI.encode_www_form(params)
  end

  def total_pages(count, limit)
    (count / limit.to_f).ceil
  end
end
```

`AirbrakeFetcher` has two public methods:

1. `fetch_groups(page, limit)`: Fetches a single page of error groups.
2. `fetch_all_groups`: Fetches all error groups.

`fetch_all_groups` doesn't return anything directly but yields the objects returned by `fetch_groups` for each page.

I used `fetch_all_groups` to collect data about error groups.

## `BarChart`

Use this class to build a textual bar chart from a list of pairs `[label, value]`.

```ruby
class BarChart
  MAX_BAR_WIDTH = 60
  MAX_LABEL_WIDTH = 40
  BAR_CHAR = '*'

  # Initialize the bar chart with a list of pairs: [label, value]
  def initialize(data)
    @data = data
  end

  def draw
    w = label_width
    t = total_value
    m = max_value
    s = scale_factor(m)
    lines = @data.map do |l, v|
      "#{draw_label(l, w)} (#{draw_value(v, t, m)}) #{draw_bar(v, s)}"
    end
    lines.join("\n")
  end

  private

  def max_value
    _, max = @data.max_by { |_, v| v }
    max
  end

  def scale_factor(max)
    MAX_BAR_WIDTH / max.to_f
  end

  def longest_label
    label, _ = @data.max_by { |l, _| l.to_s.size }
    label
  end

  def label_width
    [longest_label.to_s.size, MAX_LABEL_WIDTH].min
  end

  def total_value
    @data.reduce(0) { |s, (_, v)| s + v }
  end

  def draw_value(value, total, max)
    "#{value}/#{total}".rjust(total.to_s.size + max.to_s.size + 1)
  end

  def draw_label(label, width)
    label.ljust(width).slice(0, width)
  end

  def draw_bar(value, scale)
    BAR_CHAR * (value * scale).round
  end
end
```

`BarChart` has one public method:

1. `draw`: Returns a string representing a bar chart associated with the instance's data.

I used `draw` to display the data I collected in the previous step with `AirbrakeFetcher`.

Note: perhaps `draw` is not the best name for this method. I could have called it `to_s`, as it doesn't have any side effects.

## Example Usage

Below is an example usage of both classes to show a bar chart of errors grouped by error type.

```ruby
require './airbrake_fetcher'
require './bar_chart'

api_key = 'xxx'
project_id = 123
errors_by_type_acc = {}
airbrake_fetcher = AirbrakeFetcher.new(api_key, project_id)

airbrake_fetcher.fetch_all_groups do |response|
  # Select error objects
  errors = response['groups'].flat_map { |g| g['errors'] }
  # Remove errors without a type
  errors = errors.reject { |e| e['type'].nil? }
  # Group errors by type
  errors_by_type = errors.group_by { |e| e['type'] }
  # Accumulate error counts by type
  errors_by_type_acc = errors_by_type.each_with_object(errors_by_type_acc) do |(type, errors), acc|
    acc[type] ||= 0
    acc[type] += errors.size
  end
end

# Sort by descending number of errors
errors_by_type_acc = errors_by_type_acc.sort_by { |_, count| count }.reverse

puts '---------------------------------'
puts 'Errors by type'
puts
puts BarChart.new(errors_by_type_acc).draw
puts
```

From an example execution on a Rails app, the most common error I found was `NoMethodError`, which typically occurs when trying to call a method on a `nil` object.

```
---------------------------------
Errors by type

NoMethodError                            (334/1108) ************************************************************
RuntimeError                             ( 94/1108) *****************
NameError                                ( 81/1108) ***************
ActiveRecord::RecordInvalid              ( 50/1108) *********
ArgumentError                            ( 43/1108) ********
ActiveRecord::StatementInvalid           ( 42/1108) ********
StandardError                            ( 38/1108) *******
ActionController::RoutingError           ( 32/1108) ******
...
```

What is your most common error?
