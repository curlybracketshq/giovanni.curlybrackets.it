---
title: SQLite3 Readable Output
layout: post
tags: rails sqlite development output table sqlite3
---

To make the SQLite3 console output more readable, execute the following command:

```bash
(echo ".header ON" && echo ".mode column") > ~/.sqliterc
```

This will create a file named `.sqliterc` in your home directory, configuring it to enable table headers and set the output mode to `column`.

**Before:**

```
sqlite> SELECT users.first_name, users.last_name FROM users;
John|Doe
Richard|Roe
```

**After:**

```
sqlite> SELECT users.first_name, users.last_name FROM users;
first_name  last_name
----------  ----------
John        Doe
Richard     Roe
```
