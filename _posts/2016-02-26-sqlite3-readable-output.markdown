---
title: Sqlite3 readable output
layout: post
tags: rails sqlite development output table sqlite3
---

To make the sqlite3 console output more readable run:

    $ (echo ".header ON" && echo ".mode column") > ~/.sqliterc

This will create a file named `.sqliterc` in your home directory with a minimal
configuration enabling table headers and setting output mode to `column`.

Before:

    sqlite> SELECT users.first_name, users.last_name FROM users;
    John|Doe
    Richard|Roe

After:

    sqlite> SELECT users.first_name, users.last_name FROM users;
    first_name  last_name
    ----------  ----------
    John        Doe
    Richard     Roe
