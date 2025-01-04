---
title: Label nodes and debugging cursor's position
layout: post
discussion:
  url: https://www.reddit.com/r/iOSProgramming/comments/fncgaj/adventure_game_development_using_spritekit_label/
  name: r/iOSProgramming
---

## Introduction

In the conclusion of the last post in this series, I anticipated that I was going to talk about how to render sprites, but I need to delay that topic a little bit because I still don't have a clear game design idea. I like to think of this as an application of the "Give the player options" rule in [Gilbert's Rules of Thumb](https://grumpygamer.com/why_adventure_games_suck) for adventure games that don't suck. I'm stuck at the "game design" puzzle, but that shouldn't prevent me from posting regular updates on the project :)

In this post I'll describe how to display text using SpriteKit's label nodes. More specifically how to add a small label to the cursor node to display its position for debugging purpose.

## `SKLabelNode`

I can use [`SKLabelNode`](https://developer.apple.com/documentation/spritekit/sklabelnode) for displaying text in a SpriteKit game scene.

Using an `SKLabelNode` is straightforward: create a new `SKLabelNode` instance and add it to the list of a node's children (note that `SKScene` is a `SKNode`, that's the reason why you can add `SKNode`s directly to the game scene).

If the hierarchy containing the `SKLabelNode` instance is in the current game scene, SpriteKit will render the content of the node's `text` property.

## Cursor's position

I start by adding a new lazy stored property to the `Cursor` node class:

```swift
// TODO: Display cursor position only during development
private lazy var posLabel = SKLabelNode()
```

Note: ideally the cursor's position should be visible only in development builds, but for now let's just add a TODO comment.

Next I update the `Cursor` class initializer to set `posLabel`'s `position` and add it to the children list:

```swift
posLabel.position = CGPoint(
    x: 0,
    y: half + Cursor.positionLabelTopMargin
)
addChild(posLabel)
```

The label's position is relative to the `Cursor` node, that means that the label will be horizontally centered (`x: 0`) and vertically at top (`y: half + Cursor.positionLabelTopMargin`).

Note: `y` computation includes `Cursor.positionLabelTopMargin` static constant, that I use as the reference for the numeric value used as the top margin between cursor path and label node.

```swift
// Margin between position label and cursor path
static let positionLabelTopMargin: CGFloat = 10
```

To update the label's text I define an observer on the `Cursor`'s `position` property that updates `posLabel.text` with a string with the format `(x, y)`, that represents the position of the cursor.

```swift
override var position: CGPoint {
    didSet {
        posLabel.text = formatPos()
    }
}
```

Each time the `position` property changes, this observer will update the `text` property of the label node.

Note: `formatPos` is a helper function that returns the node position as a formatted string.

```swift
private func formatPos() -> String {
    return "(\(formatCoord(position.x)), \(formatCoord(position.y)))"
}

private func formatCoord(_ n: CGFloat) -> String {
    return String(format: "%.0f", n)
}
```

This is the final result:

{% include video.html src='/adventure-game/assets/2020-03-22-label-node-macos.mp4' %}

## Conclusion

This was kind of a *placeholder post*, but it served as a good opportunity to introduce a new node type and I think it's useful to get feedback on the cursor's position for debugging purpose.

In the next post, as soon as I have the design prototype of the first game scene ready, I'll create a sprite node for displaying the scene's background.

## Resources

* [`SKLabelNode`](https://developer.apple.com/documentation/spritekit/sklabelnode)
* [Swift - Properties](https://docs.swift.org/swift-book/LanguageGuide/Properties.html)
