---
title: "FBSE: costructive failure"
layout: post
---

[ftartaggia]: http://twitter.com/ftartaggia "Francesco"
[llanziani]: http://twitter.com/_Nss_ "Luca"
[mcentenaro]: http://twitter.com/bugant "Matteo"
[nbrisotto]: http://twitter.com/breezeight "Nicola"
[fbse]: http://fbse.no.de "FBSE"
[express]: http://expressjs.com/ "express.js"
[mongoose]: http://mongoosejs.com/ "Mongoose ORM"
[everyauth]: https://github.com/bnoguchi/everyauth "EveryAuth"
[mongooseauth]: https://github.com/bnoguchi/mongoose-auth "mongoose auth"
[redis]: http://redis.io/ "Redis"
[socket]: http://socket.io/ "socket.io"

Yesterday the Node.js Kockout ended.

Two crazy days - and nights - of coding, brainstorming, having fun, drinking
and eating with [Francesco][ftartaggia], [Luca][llanziani], [Matteo][mcentenaro]
and [Nicola][nbrisotto]. Luca travelled directly from Viterbo to attend the
programming competition.

The product we made is called [**FBSE**][fbse] and it's **a stock exchange
simulation game**.

Well, FBSE is one of the ugliest apps I've ever see but I love it anyway.

The coolest part of the idea is to make stocks gain or lose value following
people social interaction level, but you should also be able to buy and sell
stocks and to manage your portfolio.

We worked hard to set it up and running, but it didn't change our final result:
*a total failure*. The app was too big and our knowledge of node.js too small.

We used [express.js][express] as web framework, [mongoose ORM][mongoose],
[everyauth][everyauth] and [mongoose-auth][mongooseauth] to handle
authentication and a lot of [redis][redis] data structures to store trading
data.

Stocks prices and price variations are updated in realtime using the Facebook
realtime API and [socket.io][socket].

I'd like also to thank my girlfriend Giorgia for the delicious *pasta fredda*,
Massimo for the prototype idea and for your support, and Guglielmo for the
beautiful logo we didn't have the chance to use.
