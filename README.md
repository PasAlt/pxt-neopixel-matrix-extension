```package
neopixel=github:PasAlt/pxt-neopixel-matrix-extension
```

# NeoPixel driver

This is a rework of the [Microsoft Neopixel Extension](https://github.com/microsoft/pxt-neopixel). It provides a driver for various NeoPixel LED strips, see https://www.adafruit.com/category/168.

It provides mostly the same interface but 
1. introduces a large color picker with 64 colors (instead of an enum selector),
2. rearranges blocks and introducing groups to make them (hopefully) more intutive to use, and
3. adds support for 5x5 and 8x8 neopixel matrices

Unfortunately many translations got lost during this rework. Help to reinstate the translations or fix english errors (my native language is german...) is very welcome!

NeoPixels consist of programmable RGB LEDs (WS2812B), every one of them controlled
separately.  

## ~ hint

See [Microsoft/pxt-ws2812b](https://makecode.microbit.org/pkg/microsoft/pxt-ws2812b) for basic WS2812B led support. 

See [Microsoft/pxt-neopixel](https://makecode.microbit.org/pkg/microsoft/pxt-neopixel) for the original extension

## ~

## Basic usage

```blocks
// Create a NeoPixel driver - specify the pin, number of NeoPixels, and the type of 
// the NeoPixel strip, either standard RGB (with GRB or RGB format) or RGB+White.
let strip = neopixel.create(DigitalPin.P0, 24, NeoPixelMode.RGB);

// set pixel colors
strip.setPixelColor(0, 0xffffff); // white
strip.setPixelColor(1, 0xff0000);     // red
strip.setPixelColor(2, 0x00ff00);     // green
strip.setPixelColor(3, 0x0000ff);    // blue

// send the data to the strip
strip.show()
```

Use ``||shift||`` or ``||rotate||`` to shift the lights around.

Always use ``||show||`` to make your changes visible.

## Use matrix

This little programm flashes "o" and "k" on a NeoPixel strip arranged as a 5x5 matrix.

```blocks
// Create a NeoPixel driver - specify the pin, number of LEDs, and the type of 
// the NeoPixel strip, either standard RGB (with GRB or RGB format) or RGB+White.
// For a 5x5 matrix you will need to set it to 25 NeoPixel
let strip = neopixel.create(DigitalPin.P0, 25, NeoPixelMode.RGB);

// set loop to set the pixel colors
basic.forever(function () {
    // set colors for "o"
    strip.setMatrix25(
    neopixel.rowOf5(0xff0000, 0xFFD700, 0xFFD700, 0xFFD700, 0xFFD700),
    neopixel.rowOf5(0xff0000, 0xFFD700, 0xff0000, 0xff0000, 0xFFD700),
    neopixel.rowOf5(0xff0000, 0xFFD700, 0xff0000, 0xff0000, 0xFFD700),
    neopixel.rowOf5(0xff0000, 0xFFD700, 0xff0000, 0xff0000, 0xFFD700),
    neopixel.rowOf5(0xff0000, 0xFFD700, 0xFFD700, 0xFFD700, 0xFFD700)
    )
    // send data to the NeoPixel strip
    strip.show()
    // wait for one second
    basic.pause(1000)
    // set colors for "k"
    strip.setMatrix25(
    neopixel.rowOf5(0xff0000, 0xFFD700, 0xff0000, 0xff0000, 0xFFD700),
    neopixel.rowOf5(0xff0000, 0xFFD700, 0xff0000, 0xFFD700, 0xff0000),
    neopixel.rowOf5(0xff0000, 0xFFD700, 0xFFD700, 0xff0000, 0xff0000),
    neopixel.rowOf5(0xff0000, 0xFFD700, 0xff0000, 0xFFD700, 0xff0000),
    neopixel.rowOf5(0xff0000, 0xFFD700, 0xff0000, 0xff0000, 0xFFD700)
    )
    // send data to the NeoPixel strip
    strip.show()
    // wait for one second
    basic.pause(1000)
})
```

Use ``||setWiringDirection||`` to adjust for different wiring of the NeoPixel matrix.

Use ``||setMatrixColor||`` to set single pixels in the matrix.

## Supported targets

* for PXT/microbit

## License

MIT
