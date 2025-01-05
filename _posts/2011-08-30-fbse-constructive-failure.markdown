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

Yesterday marked the end of Node.js Kockout.

Two days - and nights - of coding with Francesco, Luca, Matteo and Nicola. Luca came to Treviso from Viterbo to attend the programming competition.

The project we created is called **FBSE** and it's **a stock exchange simulation game**.

The main idea is to trade *social stocks* tha gain and lose value according to people social interactions.

We worked hard to set it up and running, but we didn't succeed. The project was a bit too ambitious compared to our little knowledge of node.js.

We used [express.js][express] as web framework, [mongoose ORM][mongoose], [everyauth][everyauth] and [mongoose-auth][mongooseauth] to handle authentication, and [redis][redis] to store trading data.

Stock prices and price variations are updated in realtime using the Facebook realtime API and [socket.io][socket].

Thanks [Giorgia](https://giorgia.curlybrackets.it) for supporting us and for cooking *pasta fredda*, Massimo for the prototype idea, Guglielmo for the logo design.
