# NeoPixel Tutorial

```package
neopixel=github:PasAlt/pxt-neopixel-matrix-extension
```

## Initialize NeoPixel Driver

Initialize the NeoPixels. Select Pin 0, a strip of 8 Neopixels and RGB-Mode.

```blocks
let strip = neopixel.create(DigitalPin.P0, 8, NeoPixelMode.RGB)
```

## Set Colors for the NeoPixels

Add block setColor() and choose a color you like by clicking on the color element. 

This part will not let the NeoPixels glow immediately but store what color was set.

See the next step to let the NeoPixels glow.

```blocks
let strip = neopixel.create(DigitalPin.P0, 8, NeoPixelMode.RGB)
strip.setColor(0xff0000)
```

## Show 

Add 

```blocks
let strip = neopixel.create(DigitalPin.P0, 8, NeoPixelMode.RGB)
strip.setColor(0xff0000)
```