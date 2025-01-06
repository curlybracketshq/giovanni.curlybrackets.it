---
title: Restart Gnome on Ubuntu 12 (Precise Pangolin)
layout: post
---

I use Ubuntu on a Lenovo Thinkpad X1 laptop, and sometimes *Gnome becomes unresponsive after sleep mode*. The system is functioning, but all I see on the screen is a cursor against a black background.

In this situation, the only solution I initially found was to access `tty1` by pressing `Ctrl+Alt+F1` and restart the system by running `sudo shutdown -r now`.

A better approach, when Gnome crashes, is to restart only the window manager instead of the entire system.

You can achieve this by using the shortcut `Alt+SysRq+K` to restart Gnome and resolve the issue.
