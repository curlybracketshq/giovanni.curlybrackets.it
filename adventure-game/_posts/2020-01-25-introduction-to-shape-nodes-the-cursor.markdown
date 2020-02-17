---
title: Introduction to shape nodes - The cursor
layout: post
discussion:
  url: https://www.reddit.com/r/iOSProgramming/comments/etukc4/adventure_game_development_using_spritekit/
  name: r/iOSProgramming
---

In the world of adventure games, one of the main innovations introduced by
Maniac Mansion, was replacing the text parser with a cursor and clickable
elements such as verbs, inventory items, and objects in the scene. This
innovation revolutionized the user interaction and usability of adventure games.

A cursor doesn't make almost any sense on touch screen devices (iOS), but it
still does for tvOS and macOS, so let's create one by using a `SKShapeNode`.

## `SKShapeNode`

An `SKShapeNode` is a subclass of `SKNode` that can display shapes. You can
initialize a new shape node with simple shapes like a rectangle or a circle, or
you can assign a custom `CGPath`.

## The `Cursor` node

`Cursor` extends `SKShapeNode`. For now this class just overrides the default
`SKShapeNode` constructor, but in the future I will implement a couple of more
methods, for instance one for moving the shape as a result of touch events.

```swift
class Cursor: SKShapeNode {

    init(_ size: CGFloat) {
        super.init()

        let spacer: CGFloat = 0.2
        let half = size / 2
        let path = CGMutablePath()
        path.move(to: CGPoint(x: 0, y: half))
        path.addLine(to: CGPoint(x: 0, y: half * spacer))
        path.move(to: CGPoint(x: 0, y: -half * spacer))
        path.addLine(to: CGPoint(x: 0, y: -half))
        path.move(to: CGPoint(x: -half, y: 0))
        path.addLine(to: CGPoint(x: -half * spacer, y: 0))
        path.move(to: CGPoint(x: half * spacer, y: 0))
        path.addLine(to: CGPoint(x: half, y: 0))
        self.path = path

        name = String(describing: self)
        lineWidth = 5
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

}
```

The custom shape is a path that draws a cross of size `size` (120 points in the
`GameScene` implementation) with a small hole in the middle of size `size / 2 *
spacer` (12 points). `lineWidth` is set to 5 points to resemble a pixelated
design. See below for more details about the size and aspect ratio of the scene
and its nodes.

## Place a node in the scene

I've updated `GameScene` like this:

```swift
class GameScene: SKScene {

    static func build() -> GameScene {
        let scene = GameScene(size: CGSize(width: 1920, height: 1080))
        scene.scaleMode = .aspectFit

        return scene
    }

    func setUpScene() {
        let cursor = Cursor(120);
        cursor.position = CGPoint(x: frame.midX, y: frame.midY)
        addChild(cursor)

        backgroundColor = .darkGray
    }

    override func didMove(to view: SKView) {
        self.setUpScene()
    }

}
```

`build` is a static constructor that is used to create new `GameScene`
instances. It is used in each target's view controller like this:

```swift
let scene = GameScene.build()

// Present the scene
let skView = self.view as! SKView
skView.presentScene(scene)
```

The `setUpScene` method is invoked on `didMove`, that is executed when the scene
is presented by a view.

This method is responsible for:

1. Creating a new `Cursor` instance
2. Placing the cursor at the center of the screen, that is `(frame.midX,
  frame.midY)`
3. Adding the cursor to the list of children in the scene nodes hierarchy
4. Setting the scene background color to `darkGray`

Note: a node is displayed only if it's part of the nodes hierarchy of the scene
that's being presented.

Note: the origin, in this scene coordinates system, is located at the bottom
left corner of the screen.

## Design note: low res (pixel art) VS high res

This is mainly a stylistic choice, but in either case it will have repercussions
on the way we draw objects on the scene.

For instance rescaling pixelated textures must be done by choosing the `nearest`
`filteringMode` in order to keep pixels *crispy*.

Another issue with pixel art is that it is easy to mix pixel sizes in a high res
environment. For instance the cross path, as we've designed it, has a 5 points
line width, but the hole inside the cross measures 12 points, that's not a
multiple of 5. A better approach would be to keep the scene size small and
rescale its contents to fit the screen, but when I tried this approach, rescaled
shapes' edges didn't look crispy, and I didn't find a way to apply a different
filtering mode to the whole scene. Maybe an easy fix would be to use textures
for all game elements, but I don't want to add this constraint right at the
beginning of the development process.

For now I'd just like to say that personally I really like pixel art, but I'm
still not sure if I'm going choose it for this game.

Two more reasons I can think in favor of choosing a pixelated design are:

* Retro style, that is in line with the classic adventure games style
* Easier to draw art (not so sure actually)

## Scene size, coordinates system, resolution, and aspect ratio

These are all topics that I would like to discuss more in depth in a later post.
For now let's just say that I'm going to take a shortcut. I'm fixing the scene
size to 1920x1080 points and set its `scaleMode` to `aspectFit`.

This setup will allow me use a static coordinates system. For instance a node
positioned at (100, 100) will be visible at the bottom left corner of the scene
on every device.

The selected scale mode tells SpriteKit to fit the scene into the device screen
size. This means that screens that don't have a 16:9 aspect ratio, will display
black bands, either vertically or horizontally, depending on the screen size.

For instance iPhone X Pro devices will display vertical borders (landscape
orientation):

![iPhone]({{ '/adventure-game/assets/2020-01-25-iphone.png' | relative_url }})

while iPad devices will display horizontal borders (landscape
orientation):

![iPad]({{ '/adventure-game/assets/2020-01-25-ipad.png' | relative_url }})

## Conclusion

I've just drawn the first shape in the game and it's beautiful, but I've already
found two issues:

* Scene size and if it should be device dependent or independent
* Design style: low or high res. If I choose low res, how to keep the pixel size
  coherent without messing with the rescaling of textures and shapes

I would say that both of these issues are not blockers and I will just ignore
them for now. I'll figure out a way to manage rescaling issues later.

In the next post I'll talk about touch events.

## Resources

- [`SKShapeNode`](https://developer.apple.com/documentation/spritekit/skshapenode)
- [`SKScene.didMove(to:)`](https://developer.apple.com/documentation/spritekit/skscene/1519607-didmove)
- [`SKTexture.filteringMode`](https://developer.apple.com/documentation/spritekit/sktexture/1519659-filteringmode)
- [iOS Displays](https://developer.apple.com/library/archive/documentation/DeviceInformation/Reference/iOSDeviceCompatibility/Displays/Displays.html)
