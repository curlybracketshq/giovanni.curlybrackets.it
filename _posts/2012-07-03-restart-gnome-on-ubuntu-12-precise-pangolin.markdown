---
title: Restart Gnome on Ubuntu 12 (Precise Pangolin)
layout: post
---

I use Ubuntu on a Lenovo Thinkpad X1 laptop and sometimes *Gnome becomes
unresponsive after sleep mode*. The system is working, but I can't see anything
except for the cursor on the black screen.

In these cases the only solution I found was to access `tty1` by pressing
`ctrl+alt+f1` and restart the system by running `sudo shutdown -r now`.

A better solution when Gnome crashes is to restart only the window manager, not
the whole system. To do so you can use the shortcut `alt+stamp+k` to restart
Gnome and the problem is solved, unfortunately any unsaved file will be lost.
