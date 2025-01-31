---
title: Platform-Independent Asset References
layout: post
---

When I first ported the project to iOS, I encountered a build error due to having image files with the same name, even if stored in different directories. This was followed by a runtime error because I was referencing assets in code by specifying their relative paths. Initially, I worked around the issue by updating all the asset references to include only the file name. However, this change resulted in a runtime error in the macOS build, which required referencing assets using their relative paths.

A simple solution to these issues would be to store all asset files in the project root level. While this would have been a pragmatic solution, I instead decided to keep asset files in directories and add an abstraction layer to ensure the project builds correctly across platforms.

## Cross-Platform Assets

I added an `Asset` struct to abstract an asset reference, which can be used in both iOS and macOS:

```c
typedef struct asset {
  const char *filename;
  const char *directory;
} Asset;
```

This new type, along with the `asset_path` function, can construct an asset path string where on iOS it contains only the asset filename, and on macOS, it concatenates the directory and filename:

```c
const char *asset_path(Asset asset) {
#if defined(__IPHONEOS__) || defined(__TVOS__)
  // On iOS, return the asset name directly (no directories)
  return asset.filename;
#else
  // Else (macOS), build the asset path as directory + "/" + filename
  static char resolved_path[1024];
  snprintf(resolved_path, sizeof(resolved_path), "%s/%s", asset.directory,
           asset.filename);
  return resolved_path;
#endif
}
```

I'm still unsure if this is the best solution, as it is slightly more complex than moving all assets under the same directory, and it doesn't prevent iOS build errors when using the same filename for different assets.
