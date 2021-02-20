---
title: Notify Sucker Punch background exceptions using Exception Notification
layout: post
tags: error_handling celluloid sucker_punch exception_notification
---

**[Sucker Punch](https://github.com/brandonhilkert/sucker_punch)** is a Ruby
asynchronous processing library using Celluloid, heavily influenced by Sidekiq
and girl_friday.

The **[Exception
Notification](https://github.com/smartinez87/exception_notification)** gem
provides a set of notifiers for sending notifications when errors occur in a
Rack/Rails application.

To notify Sucker Punch actors exceptions add a new initializer
`config/sucker_punch_exception_notification.rb`:

```ruby
Celluloid.exception_handler { |ex| ExceptionNotifier.notify_exception(ex) }
```

See also [Celluloid FAQ: How can I use a custom exception notifier like
Airbrake?](https://github.com/celluloid/celluloid/wiki/Frequently-Asked-Questions#q-how-can-i-use-a-custom-exception-notifier-like-airbrake).
