/**
 * Functions to operate NeoPixel strips.
 */
//% weight=1000 color=#3E7103 icon="\uf110"
namespace neopixelExtended {
    /**
    * Different formats for RGB or RGB+W NeoPixel strips
    */
    export enum Format {
        //% block="RGB (GRB format)"
        RGB = 1,
        //% block="RGB+W"
        RGBW = 2,
        //% block="RGB (RGB format)"
        RGB_RGB = 3
    }

    /**
     * Creates a new NeoPixel driver for `numNeoPixels` NeoPixels with
     * brightness set to 128 (~50%).
     * @param pin the pin where the neopixel is connected.
     * @param numNeoPixels number of NeoPixels in the strip
     * @param format data format used to sent data to the NeoPixels
     */
    //% blockId="neopixelextended_create"
    //% block="NeoPixel strip at pin %pin|with %numNeoPixels| Neopixel as %format"
    //% weight=1000
    //% parts="neopixel"
    //% numNeoPixels.defl=1
    //% trackArgs=0,2
    //% blockSetVariable=strip
    //% group="Initialization"
    export function create(pin: DigitalPin, numNeoPixels: number, format: neopixelExtended.Format): Strip {
        let strip = new Strip();
        strip._stride = format === neopixelExtended.Format.RGBW ? 4 : 3;
        strip.buf = pins.createBuffer(numNeoPixels * strip._stride);
        strip.start = 0;
        strip._length = numNeoPixels;
        strip._matrixDirection = neopixelExtended.MatrixDirection.LeftTopToTheRight
        strip._format = format || neopixelExtended.Format.RGB;
        strip._matrixWidth = 0;
        strip.setBrightness(128)
        strip.setPin(pin)
        return strip;
    }

    /*
    * Different matrix wiring directions
    */
    export enum MatrixDirection {
        //% block="top left to the right"
        LeftTopToTheRight = 0,
        //% block="top right to the bottom"
        RightTopToTheBottom,
        //% block="bottom right to the left"
        RightBottomToTheLeft,
        //% block="bottom left to the top"
        LeftBottomToTheTop,

        //% block="top left to the bottom"
        LeftTopToTheBottom,
        //% block="bottom left to the right"
        LeftBottomToTheRight,
        //% block="bottom right to the top"
        RightBottomToTheTop,
        //% block="top right to the left"
        RightTopToTheLeft
    }

    /*
    * Different matrix wiring directions
    */
    export enum MoveDirection {
        //% block="left to right"
        LeftToRight,
        //% block="top to bottom"
        TopToBottom,
        //% block="right to left"
        RightToLeft,
        //% block="bottom to top"
        BottomToTop
    }

    /**
     * A NeoPixel strip
     */
    export class Strip {
        buf: Buffer;
        pin: DigitalPin;
        brightness: number;
        start: number; // start offset in NeoPixel strip
        _length: number; // number of Neopixels
        _stride: number; // length of stride. Depends on _format.
        _format: neopixelExtended.Format;
        _matrixWidth: number; // number of Neopixels in a row of the matrix - if any
        _matrixHeight: number; // number of Neopixels in a column of the matrix - if any
        _matrixDirection: neopixelExtended.MatrixDirection

        /**
         * Sends all the changes to the NeoPixel strip.
         */
        //% blockId="neopixelextended_show"
        //% block="%strip|show changes"
        //% group="Show changes"
        //% weight=10
        //% strip.defl=strip
        show() {
            ws2812b.sendBuffer(this.buf, this.pin);
        }

        /**
         * Creates a range of NeoPixels.
         * @param start offset in the NeoPixel strip to start the range
         * @param length number of NeoPixels in the range
         */
        //% blockId="neopixelextended_range"
        //% block="%strip|range from %start|with %length| NeoPixels"
        //% blockSetVariable=range
        //% group="Initialization"
        //% advanced=true
        //% weight=89
        //% strip.defl=strip
        range(start: number, length: number): Strip {
            start = start >> 0;
            length = length >> 0;
            let strip = new Strip();
            strip.buf = this.buf;
            strip.pin = this.pin;
            strip.brightness = this.brightness;
            strip.start = this.start + Math.clamp(0, this._length - 1, start);
            strip._length = Math.clamp(0, this._length - (strip.start - this.start), length);
            strip._matrixWidth = 0;
            strip._matrixHeight = 0;
            strip._format = this._format;
            return strip;
        }

        /**
         * Sets all NeoPixel to a given color in the buffer.
         * Call ``show()`` to make the changes visible.
         * @param rgb RGB color of the NeoPixels
         */
        //% blockId="neopixelextended_set_strip_color_real"
        //% block="%strip|set color %rgb"
        //% group="Set colors in buffer"
        //% weight=85
        //% strip.defl=strip
        //% rgb.shadow="neopixelextended_colornumberpickerlarge"
        setColor(rgb: number) {
            rgb = rgb >> 0; // ensure rgb to be a (signed) integer
            this.setAllRGB(rgb);
        }

        /**
         * Sets NeoPixel at the given position to a given color in the buffer.
         * Does leave all the other NeoPixels as they were.
         * Call ``show()`` to make the changes visible.
         * @param position position of the NeoPixel in the strip
         * @param rgb RGB color of the NeoPixel
         */
        //% blockId="neopixelextended_set_pixel_color"
        //% block="%strip|set pixel color at %position|to %rgb"
        //% strip.defl=strip
        //% weight=80
        //% rgb.shadow="neopixelextended_colornumberpickerlarge"
        //% group="Set colors in buffer"
        setPixelColor(position: number, rgb: number): void {
            this.setPixelRGB(position >> 0, rgb >> 0);
        }

        /**
         * Sets the vertical number of pixels (width) in a matrix shaped strip
         * This is used in ``setMatrixColor()`` to calculate the correct position.
         * Matrix is assumed to be squared if height is no set with ``setMatrixHeigth()``
         * @param width number of pixels in a row
         */
        //% blockId=neopixelextended_set_matrix_width
        //% block="%strip|set matrix width %width"
        //% strip.defl=strip
        //% width.defl=5
        //% weight=5
        //% advanced=true
        //% group="Set and manipulate NeoPixels as matrix"
        setMatrixWidth(width: number) {
            this._matrixWidth = Math.min(this._length, width >> 0);
        }

        /**
         * Sets the horizontal number of pixels (height) in a matrix shaped strip
         * This is used in ``setMatrixColor()`` to calculate the correct position.
         * @param height number of pixels in a column
         */
        //% blockId=neopixelextended_set_matrix_height
        //% block="%strip|set matrix height %height"
        //% strip.defl=strip
        //% height.defl=5
        //% weight=5
        //% advanced=true
        //% group="Set and manipulate NeoPixels as matrix"
        setMatrixHeight(height: number) {
            this._matrixHeight = Math.min(this._length, height >> 0);
        }

        private matrixWidth() {
            return this._matrixWidth
        }

        private matrixHeight() {
            return this._matrixHeight > 0 ? this._matrixHeight : this._matrixWidth
        }

        /**
         * Sets NeoPixel to a given color in a matrix shaped strip
         * Make sure you have set the right width with ``setMatrixWidth()``
         * Call ``show`` to make the changes visible.
         * @param x vertical position (column number) from 0 to matrix width minus 1
         * @param y horizontal position (row number) from 0 to matrix height minus 1
         * @param rgb RGB color of the NeoPixel
         */
        //% blockId="neopixelextended_set_matrix_color"
        //% block="%strip|set matrix color at x %x|y %y|to %rgb"
        //% strip.defl=strip
        //% weight=4
        //% rgb.shadow="neopixelextended_colornumberpickerlarge"
        //% advanced=true
        //% group="Set and manipulate NeoPixels as matrix"
        setMatrixColor(x: number, y: number, rgb: number) {
            if (this.matrixWidth() <= 0) {
                throw "NeoPixel is not set as matrix. Please set width and height of matrix!"
            }

            x = x >> 0;
            y = y >> 0;
            rgb = rgb >> 0;

            if (x < 0 || x >= this.matrixWidth() || y < 0 || y >= this.matrixHeight()) {
                throw "Given position " + x + "," + y + "is outside matrix."
            }

            let adjustedMatrixWidth = this.matrixWidth()
            let adjustedMatrixHeight = this.matrixHeight()
            // rotate
            if(this.shouldRotateClockwise()) {
                let tempX = this.matrixHeight()-1-y
                y = x
                x = tempX
                adjustedMatrixWidth = this.matrixHeight()
                adjustedMatrixHeight = this.matrixWidth()
            }
            else if(this.shouldRotateCounterClockwise()) {
                let tempY = this.matrixWidth()-1- x
                x = y
                y = tempY
                adjustedMatrixWidth = this.matrixHeight()
                adjustedMatrixHeight = this.matrixWidth()
            }

            // reverse columns (rc)
            if (this.shouldReverseColumns()) {
                y = adjustedMatrixHeight-y-1
            }

            // reverse odd rows (ror)
            if(y%2 == 1 && this.shouldReverseOddRows()) {
                x = adjustedMatrixWidth-x-1
            }
            // reverse even rows (rer)
            else if(y%2 != 1 && this.shouldReverseEvenRows()) {
                x = adjustedMatrixWidth-x-1
            }

            let i = x + y * adjustedMatrixWidth;
            this.setPixelColor(i, rgb);
        }

        /**
         * For NeoPixels with RGB+W LEDs, sets the white LED brightness. This only works for RGB+W NeoPixels.
         * @param position position of the NeoPixel in the strip
         * @param white brightness of the white LED
         */
        //% blockId="neopixelextended_set_pixel_white"
        //% block="%strip|set pixel white LED at %position|to %white"
        //% strip.defl=strip
        //% weight=80
        //% advanced=true
        //% group="Set colors in buffer"
        setPixelWhiteLED(position: number, white: number): void {
            if (this._format === neopixelExtended.Format.RGBW) {
                this.setPixelW(position >> 0, white >> 0);
            }
        }

        /**
         * Clears all NeoPixel colors in the buffer.
         * Call ``show`` to make the changes visible.
         */
        //% blockId="neopixelextended_clear"
        //% block="%strip|clear all colors"
        //% strip.defl=strip
        //% weight=76
        //% group="Set colors in buffer"
        clear(): void {
            this.buf.fill(0, this.start * this._stride, this._length * this._stride);
        }

        /**
         * Gets the number of NeoPixels declared for the strip
         */
        //% blockId="neopixelextended_length"
        //% block="%strip|length"
        //% strip.defl=strip
        //% weight=60
        //% advanced=true
        //% group="Values"
        length() {
            return this._length;
        }

        /**
         * Sets the brightness of the strip. This only applies to future operations.
         * @param brightness a measure of NeoPixel brightness in 0-255.
         */
        //% blockId="neopixelextended_set_brightness"
        //% block="%strip|set brightness %brightness"
        //% strip.defl=strip
        //% brightness.defl=128
        //% weight=59
        //% advanced=true
        //% group="Set colors in buffer"
        setBrightness(brightness: number): void {
            this.brightness = brightness & 0xff;
        }

        /**
         * Applies the given brightness to current colors in buffer using a quadratic easing function.
         **/
        //% blockId="neopixelextended_each_brightness"
        //% block="%strip|ease brightness"
        //% strip.defl=strip
        //% weight=58
        //% advanced=true
        //% group="Set colors in buffer"
        easeBrightness(): void {
            const br = this.brightness;
            const buf = this.buf;
            const end = this.start + this._length;
            const mid = Math.idiv(this._length, 2);
            for (let i = this.start; i < end; ++i) {
                const k = i - this.start;
                const ledoffset = i * this._stride;
                const br = k > mid
                    ? Math.idiv(255 * (this._length - 1 - k) * (this._length - 1 - k), (mid * mid))
                    : Math.idiv(255 * k * k, (mid * mid));
                const r = (buf[ledoffset + 0] * br) >> 8; buf[ledoffset + 0] = r;
                const g = (buf[ledoffset + 1] * br) >> 8; buf[ledoffset + 1] = g;
                const b = (buf[ledoffset + 2] * br) >> 8; buf[ledoffset + 2] = b;
                if (this._stride == 4) {
                    const w = (buf[ledoffset + 3] * br) >> 8; buf[ledoffset + 3] = w;
                }
            }
        }

        /**
         * Shifts NeoPixel colors stored in buffer forward. Clear with zeros.
         * Call ``show`` to make the changes visible.
         * @param offset number of NeoPixel to shift forward
         */
        //% blockId="neopixelextended_shift"
        //% block="%strip|shift pixels by %offset"
        //% strip.defl=strip
        //% offset.defl=1
        //% weight=40
        //% group="Manipulate colors in buffer"
        shift(offset: number = 1): void {
            offset = offset >> 0;
            this.buf.shift(-offset * this._stride, this.start * this._stride, this._length * this._stride)
        }

        shiftMatrix(offset: number = 1, moveDirection? : neopixelExtended.MoveDirection): void {
            if(! moveDirection) {
                moveDirection = neopixelExtended.MoveDirection.LeftToRight
            }

            let direction : number = this._matrixDirection as number
            let moveDirectionIndex : NumberFormat = moveDirection as number
            let isCcw : boolean = direction > 3
            console.log("---")
            console.log("d: " + direction)
            console.log("md: " + moveDirectionIndex)

            let adjustedDirectionIndex = (direction+moveDirectionIndex)%4
            if(isCcw) {
                adjustedDirectionIndex += 4
            }

            console.log("adj:" + adjustedDirectionIndex)

            let adjustedDirection = adjustedDirectionIndex as neopixelExtended.MatrixDirection //dirs[adjustedDirectionIndex]

            if (adjustedDirection == neopixelExtended.MatrixDirection.RightTopToTheLeft
                || adjustedDirection == neopixelExtended.MatrixDirection.LeftBottomToTheRight) {
                offset = offset * -1
            }

            if(adjustedDirection == neopixelExtended.MatrixDirection.LeftTopToTheRight 
              || adjustedDirection == neopixelExtended.MatrixDirection.RightBottomToTheLeft
              || adjustedDirection == neopixelExtended.MatrixDirection.RightTopToTheLeft
              || adjustedDirection == neopixelExtended.MatrixDirection.LeftBottomToTheRight ) {
                for (let row = 0; row < this.matrixHeight(); row++) {
                    let tempBuf = this.buf.slice(row * this.matrixWidth() * this._stride, this.matrixWidth() * this._stride)
                    offset = offset * -1 
                    tempBuf.shift(offset * this._stride)
                    this.buf.write(row * this.matrixWidth() * this._stride, tempBuf)
                }
            }

            if (adjustedDirection == neopixelExtended.MatrixDirection.LeftTopToTheBottom
                || adjustedDirection == neopixelExtended.MatrixDirection.LeftBottomToTheTop) {
                this.buf.shift(-this._stride*this.matrixHeight(), 0)
            }
        }

        /**
         * Rotates NeoPixel colors stored in buffer forward.
         * Call ``show`` to make the changes visible.
         * @param offset number of pixels to rotate forward
         */
        //% blockId="neopixelextended_rotate"
        //% block="%strip|rotate pixels by %offset"
        //% strip.defl=strip
        //% offset.defl=1
        //% weight=39
        //% group="Manipulate colors in buffer"
        rotate(offset: number = 1): void {
            offset = offset >> 0;
            this.buf.rotate(-offset * this._stride, this.start * this._stride, this._length * this._stride)
        }

        /**
         * Sets the pin where the neopixel is connected, defaults to P0.
         * @param pin pin to connect to
         */
        //% weight=10
        //% pin.defl=DigitalPin.P0
        //% advanced=true
        //% group="Initialization"
        setPin(pin: DigitalPin): void {
            this.pin = pin;
            pins.digitalWritePin(this.pin, 0);
            // don't yield to avoid races on initialization
        }

        /**
         * Estimates the electrical current (mA) consumed by the current light configuration.
         */
        //% weight=9
        //% blockId=neopixelextended_power
        //% block="%strip|power (mA)"
        //% strip.defl=strip
        //% advanced=true
        //% group="Values"
        power(): number {
            const end = this.start + this._length;
            let p = 0;
            for (let i = this.start; i < end; ++i) {
                const ledoffset = i * this._stride;
                for (let j = 0; j < this._stride; ++j) {
                    p += this.buf[i + j];
                }
            }
            return Math.idiv(this.length() * 7, 10) /* 0.7mA per neopixel */
                + Math.idiv(p * 480, 10000); /* rought approximation */
        }

        /**
         * Shows all NeoPixel in a given color.
         * @param rgb RGB color of the NeoPixels
         */
        //% blockId="neopixelextended_set_strip_color"
        //% block="%strip|show color %rgb"
        //% strip.defl=strip
        //% weight=85
        //% rgb.shadow="neopixelextended_colornumberpickerlarge"
        //% advanced=true
        //% group="Show changes" changes"
        showColor(rgb: number) {
            rgb = rgb >> 0; // ensure rgb to be a (signed) integer
            this.setAllRGB(rgb);
            this.show();
        }

        /**
         * Shows a rainbow pattern on all NeoPixels.
         * @param startHue the start hue value for the rainbow from 0 to 360.
         * @param endHue the end hue value for the rainbow from 0 to 360.
         */
        //% blockId="neopixelextended_set_strip_rainbow"
        //% block="%strip|show rainbow from %startHue|to %endHue"
        //% strip.defl=strip
        //% startHue.defl=1
        //% endHue.defl=360
        //% weight=85
        //% advanced=true
        //% group="Show changes" changes"
        showRainbow(startHue: number = 1, endHue: number = 360) {
            if (this._length <= 0) return;

            startHue = startHue >> 0;
            endHue = endHue >> 0;
            const saturation = 100;
            const luminance = 50;
            const steps = this._length;

            //hue
            const hDist = ((endHue + 360) - startHue) % 360;
            let hStep = Math.idiv((hDist * 100), steps);

            const h1_100 = startHue * 100; //we multiply by 100 so we keep more accurate results while doing interpolation

            //interpolate
            if (steps === 1) {
                this.setPixelColor(0, hsl(startHue + hStep, saturation, luminance))
            } else {
                this.setPixelColor(0, hsl(startHue, saturation, luminance));
                for (let i = 1; i < steps - 1; i++) {
                    const h = Math.idiv((h1_100 + i * hStep), 100) + 360;
                    this.setPixelColor(i, hsl(h, saturation, luminance));
                }
                this.setPixelColor(steps - 1, hsl(endHue, saturation, luminance));
            }
            this.show();
        }

        /**
         * Displays a vertical bar graph based on the `value` and `high` value.
         * If `high` is 0, the chart gets adjusted automatically.
         * @param value current value to plot.
         * @param high maximum value. Default is 10.
         */
        //% weight=84
        //% blockId=neopixelextended_show_bar_graph
        //% block="%strip|show bar graph of %value|up to %high"
        //% strip.defl=strip
        //% value.defl=5
        //% high.defl=10
        //% advanced=true
        //% group="Show changes"
        showBarGraph(value: number, high: number = 10): void {
            if (high <= 0) {
                this.clear();
                this.setPixelColor(0, 0xFFFF00);
                this.show();
                return;
            }

            value = Math.abs(value);
            const n = this._length;
            const n1 = n - 1;
            let v = Math.idiv((value * n), high);
            if (v == 0) {
                this.setPixelColor(0, 0x666600);
                for (let i = 1; i < n; ++i)
                    this.setPixelColor(i, 0);
            } else {
                for (let i = 0; i < n; ++i) {
                    if (i <= v) {
                        const b = Math.idiv(i * 255, n1);
                        this.setPixelColor(i, rgb(b, 0, 255 - b));
                    }
                    else this.setPixelColor(i, 0);
                }
            }
            this.show();
        }

        /**
         * Sets the NeoPixel colors in the buffer
         * of a strip of 25 NeoPixels.
         * Expecting strip to be arranged in a 5x5 matrix.
         * Call ``show`` to make the changes visible.
         * @param v1 first matrix row as array of rgb colors
         * @param v2 second matrix row as array of rgb colors
         * @param v3 third matrix row as array of rgb colors
         * @param v4 fourth matrix row as array of rgb colors
         * @param v5 fifth matrix row as array of rgb colors
         *
         */
        //% block="set NeoPixel 5x5 %strip | %v1 %v2 %v3 %v4 %v5"
        //% v1.shadow="neopixelextended_rowof5"
        //% v2.shadow="neopixelextended_rowof5"
        //% v3.shadow="neopixelextended_rowof5"
        //% v4.shadow="neopixelextended_rowof5"
        //% v5.shadow="neopixelextended_rowof5"
        //% inlineInputMode=external
        //% strip.defl=strip
        //% weight=5
        //% group="Set and manipulate NeoPixels as matrix"
        setMatrix25(v1: number[],
            v2: number[],
            v3: number[],
            v4: number[],
            v5: number[]): void {
            if (this.length() != 25) {
                throw "Matrix is not 5x5. You need to set matrix to 25 NeoPixels. Please check your initialization!"
            }
            this.setMatrixWidth(5)

            let rows: number[][] = [v1, v2, v3, v4, v5]
            rows = this.adjustMatrixForDirection(rows)
            this.setBufferWithMatrix(rows)
        }

        /**
         * Sets the NeoPixel colors in the buffer
         * of a strip of 64 NeoPixels.
         * Expecting strip to be arranged in a 8x8 matrix.
         * Call ``show`` to make the changes visible.
         * @param v1 first matrix row as array of rgb colors
         * @param v2 second matrix row as array of rgb colors
         * @param v3 third matrix row as array of rgb colors
         * @param v4 fourth matrix row as array of rgb colors
      shiftMatrix   * @param v5 fifth matrix row as array of rgb colors
         * @param v6 sixth matrix row as array of rgb colors
         * @param v7 seventh matrix row as array of rgb colors
         * @param v8 eighth matrix row as array of rgb colors
         */
        //% block="set NeoPixel 8x8 %strip | %v1 %v2 %v3 %v4 %v5 %v6 %v7 %v8"
        //% v1.shadow="neopixelextended_rowof8"
        //% v2.shadow="neopixelextended_rowof8"
        //% v3.shadow="neopixelextended_rowof8"
        //% v4.shadow="neopixelextended_rowof8"
        //% v5.shadow="neopixelextended_rowof8"
        //% v6.shadow="neopixelextended_rowof8"
        //% v7.shadow="neopixelextended_rowof8"
        //% v8.shadow="neopixelextended_rowof8"
        //% inlineInputMode=external
        //% strip.defl=strip
        //% group="Set and manipulate NeoPixels as matrix"
        //% weight=1
        setMatrix64(v1: number[],
            v2: number[],
            v3: number[],
            v4: number[],
            v5: number[],
            v6: number[],
            v7: number[],
            v8: number[]) {
            if (this.length() != 64) {
                throw "Matrix is not 8x8. You need to set matrix to 64 NeoPixels. Please check your initialization!"
            }
            this.setMatrixWidth(8)
            let rows = [v1, v2, v3, v4, v5, v6, v7, v8]
            rows = this.adjustMatrixForDirection(rows)
            this.setBufferWithMatrix(rows)
        }

        /**
        * Sets the direction how the matrix is wired on the
        * board.
        * This only applies to future operations. You will have to reset the colors of the matrix to see its effect.
        * It always expects the wiring to be
        * arranged in "snake" format e.g.
        * ---->
        * <---'
        * '--->
        * @param dir direction of matrix wiring looking from the first NeoPixel to the second
        */
        //% block="%strip set NeoPixel matrix wiring to %dir"
        //% strip.defl=strip
        //% dir.defl=neopixelExtended.MatrixDirection.LeftTopToTheRight
        //% weight=0
        //% group="Set and manipulate NeoPixels as matrix"
        // direction.shadow="neopixelextended_matrix_direction_selector"
        setMatrixWiring(dir: neopixelExtended.MatrixDirection) {
            this._matrixDirection = dir
        }

        private setBufferWithMatrix(rows: number[][]) {
            let index = 0
            rows.forEach((row: number[]) => {
                row.forEach((color: number) => {
                    this.setPixelColor(index++, color)
                })
            })
        }

        private adjustMatrixForDirection(rows: number[][]): number[][] {
            // cw = clockwise, ccw = counterclokwise, 
            // rc = reverse columns, 
            // rer = reverse even rows (0,2,4,...)
            // ror = reverse odd rows (1,3,5,...)
            // rbt: cw, rc, ror
            // lbt: ccw, rc, rer
            // ltb: cw, rer
            // rtb: ccw, ror
            // lbr: rc, ror
            // rbl: rc, rer
            // ltr: ror
            // rtl: rer 

            if (this.shouldRotateClockwise()) {
                rows = this.rotateMatrixClockwise(rows)
            }
            else if (this.shouldRotateCounterClockwise()) {
                rows = this.rotateMatrixCounterClockwise(rows)
            }

            if (this.shouldReverseColumns()) {
                rows.reverse()
            }

            if (this.shouldReverseOddRows()) {
                this.reverseOddRows(rows)
            }
            else if (this.shouldReverseEvenRows()) {
                this.reverseEvenRows(rows)
            }

            return rows
        }

        private shouldRotateClockwise(): boolean {
            return this._matrixDirection == neopixelExtended.MatrixDirection.LeftTopToTheBottom
                || this._matrixDirection == neopixelExtended.MatrixDirection.RightBottomToTheTop
        }

        private shouldRotateCounterClockwise(): boolean {
            return this._matrixDirection == neopixelExtended.MatrixDirection.RightTopToTheBottom
                || this._matrixDirection == neopixelExtended.MatrixDirection.LeftBottomToTheTop
        }

        private shouldReverseColumns() : boolean {
            return this._matrixDirection == neopixelExtended.MatrixDirection.LeftBottomToTheRight
                || this._matrixDirection == neopixelExtended.MatrixDirection.RightBottomToTheLeft
                || this._matrixDirection == neopixelExtended.MatrixDirection.LeftBottomToTheTop
                || this._matrixDirection == neopixelExtended.MatrixDirection.RightBottomToTheTop
        }

        private shouldReverseOddRows() : boolean {
            return this._matrixDirection == neopixelExtended.MatrixDirection.LeftTopToTheRight
                || this._matrixDirection == neopixelExtended.MatrixDirection.LeftBottomToTheRight
                || this._matrixDirection == neopixelExtended.MatrixDirection.RightTopToTheBottom
                || this._matrixDirection == neopixelExtended.MatrixDirection.RightBottomToTheTop
        }

        private shouldReverseEvenRows() : boolean {
            return this._matrixDirection == neopixelExtended.MatrixDirection.RightTopToTheLeft
                || this._matrixDirection == neopixelExtended.MatrixDirection.RightBottomToTheLeft
                || this._matrixDirection == neopixelExtended.MatrixDirection.LeftTopToTheBottom
                || this._matrixDirection == neopixelExtended.MatrixDirection.LeftBottomToTheTop
        }

        private rotateMatrixClockwise(rows: number[][]): number[][] {
            // from https://stackoverflow.com/a/58668351
            // Nitin Jadhav under CC-BY-SA 4.0
            return rows[0].map((_, index) => { // traverse over each element of first column
                let row = rows.map(row => row[index]) // get elements at column given by index
                row.reverse() // reverse order of elements in column
                return row
            })
        }

        private rotateMatrixCounterClockwise(rows: number[][]): number[][] {
            // from https://stackoverflow.com/a/58668351 (see comments)
            // Karan Ratan under CC-BY-SA 4.0
            return rows[0].map((_, index) => {
                return rows.map(row => row[row.length - 1 - index])
            })
        }

        private reverseOddRows(rows: number[][]) {
            rows.forEach((row, index) => {
                if (index % 2 == 1) {
                    row.reverse()
                }
            })
        }

        private reverseEvenRows(rows: number[][]) {
            rows.forEach((row, index) => {
                if (index % 2 == 0) {
                    row.reverse()
                }
            })
        }

        private setBufferRGB(offset: number, red: number, green: number, blue: number): void {
            if (this._format === neopixelExtended.Format.RGB_RGB) {
                this.buf[offset + 0] = red;
                this.buf[offset + 1] = green;
            } else {
                this.buf[offset + 0] = green;
                this.buf[offset + 1] = red;
            }
            this.buf[offset + 2] = blue;
        }

        private setAllRGB(rgb: number) {
            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            const br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            const end = this.start + this._length;
            for (let i = this.start; i < end; ++i) {
                this.setBufferRGB(i * this._stride, red, green, blue)
            }
        }

        private setAllW(white: number) {
            if (this._format !== neopixelExtended.Format.RGBW)
                return;

            let br = this.brightness;
            if (br < 255) {
                white = (white * br) >> 8;
            }
            let buf = this.buf;
            let end = this.start + this._length;
            for (let i = this.start; i < end; ++i) {
                let ledoffset = i * 4;
                buf[ledoffset + 3] = white;
            }
        }

        private setPixelRGB(pixeloffset: number, rgb: number): void {
            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            pixeloffset = (pixeloffset + this.start) * this._stride;

            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            let br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            this.setBufferRGB(pixeloffset, red, green, blue)
        }

        private setPixelW(pixeloffset: number, white: number): void {
            if (this._format !== neopixelExtended.Format.RGBW)
                return;

            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            pixeloffset = (pixeloffset + this.start) * 4;

            let br = this.brightness;
            if (br < 255) {
                white = (white * br) >> 8;
            }
            let buf = this.buf;
            buf[pixeloffset + 3] = white;
        }
    }

    // ---- END OF STRIP ---- //

    /**
     * RGB Color selection from a range
     * of 64 colors.
     * @param color color
     */
    //% blockId="neopixelextended_colornumberpickerlarge"
    //% block="%value"
    //% group="Set colors in buffer"
    //% weight=1
    //% shim=TD_ID colorSecondary="#FFFFFF"
    //% value.fieldEditor="colornumber" value.fieldOptions.decompileLiterals=true
    //% value.defl='0x888888'
    //% value.fieldOptions.colours='["#FFFFFF", "#FFF1E6", "#FFE4B5", "#FFD700", "#FFA500", "#FF8C00", "#FF4500", "#E60026", "#FFB6C1", "#FF69C1", "#FF1493", "#DA70D6", "#BA55D3", "#8A2BE2", "#4B0082", "#2E0854", "#E6E6FA", "#B0C4DE", "#87CEEB", "#00BFFF", "#1E90FF", "#0000CD", "#191970", "#000080", "#E0FFFF", "#AFEEEE", "#40E0D0", "#00CED1", "#008B8B", "#2E8B57", "#006400", "#003300", "#F0FFF0", "#ADFF2F", "#7FFF00", "#32CD32", "#228B22", "#9ACD32", "#6B8E23", "#556B2F", "#FFFFE0", "#FFFACD", "#FFEFD5", "#FFDAB9", "#D2B48C", "#A0522D", "#8B4513", "#1A1A1A", "#FAFAFA", "#E0E0E0", "#B8B8B8", "#909090", "#686868", "#404040", "#202020", "#000000", "#000000", "#0000FF", "#00FF00", "#00FFFF", "#FF0000", "#FF00FF", "#FFFF00", "#FFFFFF"]'
    //% value.fieldOptions.columns=8 value.fieldOptions.className='rgbColorPicker'
    export function colorNumberPicker(value: number) {
        return value;
    }

    /**
     * Converts red, green, blue channels into a RGB color
     * @param red value of the red channel between 0 and 255
     * @param green value of the green channel between 0 and 255
     * @param blue value of the blue channel between 0 and 255
     */
    //% weight=1
    //% blockId="neopixelextended_rgb"
    //% block="red %red|green %green|blue %blue"
    //% red.defl=0
    //% green.defl=255
    //% blue.defl=255
    //% group="Set colors in buffer"
    export function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }

    /**
     * Converts a hue saturation luminosity value into a RGB color
     * @param hue hue from 0 to 360
     * @param saturation saturation from 0 to 99
     * @param luminosity luminosity from 0 to 99
     */
    //% blockId="neopixelextended_hsl"
    //% block="hue %h|saturation %s|luminosity %l"
    //% hue.defl=180
    //% saturation.defl=99
    //% luminosity.defl=50
    //% advanced=true
    //% group="Set colors in buffer"
    export function hsl(hue: number, saturation: number, luminosity: number): number {
        let h = Math.round(hue);
        let s = Math.round(saturation);
        let l = Math.round(luminosity);

        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;
        return packRGB(r, g, b);
    }

    /**
     * Creates an array for a row of 8 colors
     * @param rgb1 first RGB color of the NeoPixel row
     * @param rgb2 second RGB color of the NeoPixel row
     * @param rgb3 third RGB color of the NeoPixel row
     * @param rgb4 fourth RGB color of the NeoPixel row
     * @param rgb5 fifth RGB color of the NeoPixel row
     * @param rgb6 sixth RGB color of the NeoPixel row
     * @param rgb7 seventh RGB color of the NeoPixel row
     * @param rgb8 eighth RGB color of the NeoPixel row
     */
    //% block="%rgb1 %rgb2 %rgb3 %rgb4 %rgb5 %rgb6 %rgb7 %rgb8"
    //% blockId="neopixelextended_rowof8"
    //% rgb1.shadow="neopixelextended_colornumberpickerlarge"
    //% rgb2.shadow="neopixelextended_colornumberpickerlarge"
    //% rgb3.shadow="neopixelextended_colornumberpickerlarge"
    //% rgb4.shadow="neopixelextended_colornumberpickerlarge"
    //% rgb5.shadow="neopixelextended_colornumberpickerlarge"
    //% rgb6.shadow="neopixelextended_colornumberpickerlarge"
    //% rgb7.shadow="neopixelextended_colornumberpickerlarge"
    //% rgb8.shadow="neopixelextended_colornumberpickerlarge"
    //% inlineInputMode=inline
    //% group="Set and manipulate NeoPixels as matrix"
    //% weight=1
    export function rowOf8(rgb1: number,
        rgb2: number,
        rgb3: number,
        rgb4: number,
        rgb5: number,
        rgb6: number,
        rgb7: number,
        rgb8: number): number[] {
        return [rgb1, rgb2, rgb3, rgb4, rgb5, rgb6, rgb7, rgb8]
    }

    /**
     * Creates an array for a row of 5 colors
     * @param rgb1 first RGB color of the NeoPixel row
     * @param rgb2 second RGB color of the NeoPixel row
     * @param rgb3 third RGB color of the NeoPixel row
     * @param rgb4 fourth RGB color of the NeoPixel row
     * @param rgb5 fifth RGB color of the NeoPixel row
     */
    //% block="%rgb1 %rgb2 %rgb3 %rgb4 %rgb5"
    //% blockId="neopixelextended_rowof5"
    //% rgb1.shadow="neopixelextended_colornumberpickerlarge"
    //% rgb2.shadow="neopixelextended_colornumberpickerlarge"
    //% rgb3.shadow="neopixelextended_colornumberpickerlarge"
    //% rgb4.shadow="neopixelextended_colornumberpickerlarge"
    //% rgb5.shadow="neopixelextended_colornumberpickerlarge"
    //% inlineInputMode=inline
    //% group="Set and manipulate NeoPixels as matrix"
    //% weight=4
    export function rowOf5(rgb1: number,
        rgb2: number,
        rgb3: number,
        rgb4: number,
        rgb5: number): number[] {
        return [rgb1, rgb2, rgb3, rgb4, rgb5]
    }

    /**
     * Combines/packs three numbers into one 24 bit RGB number.
     * First 8 bit are red,
     * second 8 bits are green, and
     * third 8 bits are blue
     * @param r red part (0-255)
     * @param g green part (0-255)
     * @param b blue part (0-255)
     */
    function packRGB(r: number, g: number, b: number): number {
        return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF);
    }

    /**
     * Extracts/unpacks the red part from
     * a number representing an rgb number.
     * @param rgb rgb number
     */
    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }

    /**
     * Extracts/unpacks the green part from
     * a number representing an rgb number.
     * @param rgb rgb number
     */
    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }

    /**
     * Extracts/unpacks the blue part from
     * a number representing an rgb number.
     * @param rgb rgb number
     */
    function unpackB(rgb: number): number {
        let b = (rgb) & 0xFF;
        return b;
    }
}
