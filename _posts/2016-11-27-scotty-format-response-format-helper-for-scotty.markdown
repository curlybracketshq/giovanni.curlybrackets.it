---
title: "scotty-format: A Response Format Helper for the Scotty Web Framework"
layout: post
---

[scotty-format](https://github.com/potomak/scotty-format) is a helper for the Scotty web framework that assists in defining different response formats based on the request's `Accept` header value.

The inspiration for this helper stems from how Rails handles different response formats. In Rails, you can implement actions to respond with various formats based on the `Accept` header value.

For example, a client might accept only responses with `application/json` content. If the server does not support that format, it should respond with a `406 Not Acceptable` status code.

If the client accepts multiple content types, the response content type will be the best available from the list of all supported types.

If the client does not include any acceptable format, the first defined response format will be used.

Rules for selecting the most appropriate response type are defined in [RFC-2616](https://www.ietf.org/rfc/rfc2616.txt) and are enforced by the [http-media](https://github.com/zmthy/http-media) library.

The implementation of this helper is inspired by [scotty-resource](https://github.com/taphu/scotty-resource), another helper for Scotty that facilitates the definition of REST resources by strictly following HTTP standards. Scotty-resource defines a `WebResource` monad to accumulate callbacks (`ActionT`) for each HTTP method you want to support for the resource you are defining. Similarly, scotty-format accumulates callbacks in a `ResponseFormat` monad for each format supported by the current action. The `respondTo` function then selects the appropriate callback according to the client's preferences.

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

This function defines a Scotty app with one action (`GET /hello`) that responds with three different formats based on the `Accept` header value sent by the client.

`curl http://localhost:8080/hello` will return a JSON response. Because there is no `Accept` header value, the first defined content type will be used by default.

`curl -H 'Accept: text/plain' http://localhost:8080/hello` will return a text response.

`curl -H 'Accept: image/png' http://localhost:8080/hello` will return a `406 Not Acceptable` error code because there are no callbacks defined to respond with the requested media type.

You can use `formatJson`, `formatText`, or `formatHtml` to accept `application/json`, `text/plain`, or `text/html` media types respectively. To accept a different media type, use the `format` function, which accepts a `Text` parameter that specifies the media type.

To use this helper, add `scotty-format` to your project's build dependencies list and include the `respondTo` and `format*` functions.

The source code is available at [github.com/potomak/scotty-format](https://github.com/potomak/scotty-format) under the Apache 2 license.
