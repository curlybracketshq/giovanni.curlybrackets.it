---
title: "scotty-format: A response format helper for the Scotty web framework"
layout: post
---

[scotty-format](https://github.com/potomak/scotty-format) is a helper for the
Scotty web framework that helps you defining different response formats based
on the request's `Accept` header value.

The functional inspiration for this helper comes from how Rails handles
different response formats. In Rails you can implement any action to respond
with different formats based on a request `Accept` header value.

For instance a client could accept only responses that contain an
`application/json` content, in that case if the server doesn't support that
format it should respond with a 406, not acceptable, status code.

If the client accepts more than one content types the response content type
will be the best available from the list of all types supported.

If the client doesn't include any acceptable format the first response format
defined will be used.

Those rules are defined in [RFC-2616](https://www.ietf.org/rfc/rfc2616.txt) and
are enforced by the [http-media](https://github.com/zmthy/http-media) library.

Inspiration for the implementation of this helper comes from scotty-resource,
another helper for Scotty that lets you define REST resources easily by
following HTTP strictly. scotty-resource defines a `WebResource` monad that is
used to accumulate callbacks (`ActionT`) for each HTTP method that you want to
support for the resource that you're defining. In a similar way scotty-format
accumulates callbacks in a `ResponseFormat` monad for each format supported by
the current action.  The `respondTo` function will then select the appropriate
callback according to the client's preferences.

Example usage:

```haskell
main :: IO ()
main = scotty 8080 $ do
  get "/hello" $ do
    let content = "Hello world!"
    respondTo $ do
      formatJson $
        json $ object ["content" .= content]
      formatText $
        text content
      format "application/vnd.chess-pgn" $ do
        setHeader "Content-Type" "application/vnd.chess-pgn; charset=utf-8"
        raw $ encodeUtf8 "1. e4"
```

This function will define a Scotty app with one action only (`GET /hello`) that
will respond with three different formats based on the `Accept` header value
sent by the client.

`curl http://localhost:8080/hello` will return a JSON response, because there's
no `Accept` header value, the first content defined will be used by default.

`curl -H 'Accept: text/plain http://localhost:8080/hello` will return a text
response.

`curl -H 'Accept: image/png' http://localhost:8080/hello` will return a `406
Not Acceptable` error code because there are no callback defined to respond
with the requested media type.

You can use `formatJson`, `formatText` or `formatHtml`, to accept respectively
`application/json`, `text/plain`, or `text/html` media types. If you need to
accept a different media type you can use the `format` function that accepts a
`Text` parameter that is the media type.

To use this helper add `scotty-format` to your project's build dependencies
list and include `respondTo` and `format*` functions.

Source code is available at https://github.com/potomak/scotty-format under the
Apache 2 license.
