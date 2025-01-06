---
title: "Node.js Knockout - FBSE: Facebook Stock Exchange"
layout: post
---

[express]: http://expressjs.com/ "express.js"
[mongoose]: http://mongoosejs.com/ "Mongoose ORM"
[everyauth]: https://github.com/bnoguchi/everyauth "EveryAuth"
[mongooseauth]: https://github.com/bnoguchi/mongoose-auth "mongoose auth"
[redis]: http://redis.io/ "Redis"
[socket]: http://socket.io/ "socket.io"

Yesterday marked the end of Node.js Knockout.

It was two days, and nights, of coding with Francesco, Luca, Matteo, and Nicola. Luca traveled from Viterbo to Treviso to participate in the programming competition.

Our project, **FBSE**, is a **stock exchange simulation game**.

The main idea is to trade *social stocks* that gain and lose value according to people's social interactions.

We worked hard to set it up and running, but we didn't succeed. The project was a bit too ambitious given our limited knowledge of Node.js.

We used [express.js][express] as the web framework, [mongoose ORM][mongoose], [everyauth][everyauth], [mongoose-auth][mongooseauth] to handle authentication, and [redis][redis] to store trading data.

Stock prices and variations are updated in real-time using the Facebook Realtime API and [socket.io][socket].

Thanks to [Giorgia](https://giorgia.curlybrackets.it) for supporting us and for cooking *pasta fredda*, Massimo for the prototype idea, and Guglielmo for the logo design.
