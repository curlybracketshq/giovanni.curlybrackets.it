---
title: Platform independent asset references
layout: post
---

When I first ported the project to iOS I got a build error caused by the fact that I had image files with the same name, even if stored under different directories, and then I got a runtime error because I was referencing assets in code specifying their relative path. I initially worked around the issue by updating all the assets references to only include the file name, but this change caused a runtime error in the macOS build, which required to reference assets using their relative path.

One simple approach to fix these issues would be to store all asset files at the project root level. This would have been a pragmatic solution, but I decided instead to keep asset files in directories and to add an abstraction layer which allows for the project to build correctly across platforms.

## Cross platform assets

I added an `Asset` struct that is used to abstract an asset reference which can be used in both iOS and macOS:

```c
typedef struct asset {
  const char *filename;
  const char *directory;
} Asset;
```

The new type, in conjunction with the `asset_path` function, can be used to build an asset path string that on iOS contains only the asset filename and on macOS contains the concatenation of directory and filename:

```c
const char *asset_path(Asset asset) {
#if defined(__IPHONEOS__) || defined(__TVOS__)
  // On iOS, return the asset name directly (no directories)
  return asset.filename;
#else
  // Else (macOS) build the asset path as directory + "/" + filename
  static char resolved_path[1024];
  snprintf(resolved_path, sizeof(resolved_path), "%s/%s", asset.directory,
           asset.filename);
  return resolved_path;
#endif
}
```

I'm still not sure this is a good solution, because it's a bit more complex than just moving all the assets under the same directory and it doesn't prevent iOS build errors that happen when you use the same filename for the same asset.
