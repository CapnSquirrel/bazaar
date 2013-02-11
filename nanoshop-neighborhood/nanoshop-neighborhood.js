/*
 * This is a very simple module that demonstrates rudimentary,
 * pixel-level image processing using a pixel's "neighborhood."
 */
var NanoshopNeighborhood = {
    /*
     * A basic "darkener"---this one does not even use the entire pixel neighborhood;
     * just the exact current pixel like the original Nanoshop.
     */
    darkener: function (rgbaNeighborhood) {
        return [
            rgbaNeighborhood[4].r / 2,
            rgbaNeighborhood[4].g / 2,
            rgbaNeighborhood[4].b / 2,
            rgbaNeighborhood[4].a
        ];
    },

    /*
     * A basic "averager"---this one returns the average of all the pixels in the
     * given neighborhood.
     */
    averager: function (rgbaNeighborhood) {
        var rTotal = 0,
            gTotal = 0,
            bTotal = 0,
            aTotal = 0,
            i;

        for (i = 0; i < 9; i += 1) {
            rTotal += rgbaNeighborhood[i].r;
            gTotal += rgbaNeighborhood[i].g;
            bTotal += rgbaNeighborhood[i].b;
            aTotal += rgbaNeighborhood[i].a;
        }

        return [ rTotal / 9, gTotal / 9, bTotal / 9, aTotal / 9 ];
    },

    /*
     * Applies the given filter to the given ImageData object,
     * then modifies its pixels according to the given filter.
     *
     * A filter is a function ({r, g, b, a}[9]) that returns another
     * color as a 4-element array representing the new RGBA value
     * that should go in the center pixel.
     */
    applyFilter: function (renderingContext, imageData, filter) {
        // For every pixel, replace with something determined by the filter.
        var result = renderingContext.createImageData(imageData.width, imageData.height),
            i,
            j,
            max,
            iAbove,
            iBelow,
            pixel,
            pixelColumn,
            rowWidth = imageData.width * 4,
            sourceArray = imageData.data
            destinationArray = result.data,

            // A convenience function for creating an rgba object.
            rgba = function (startIndex) {
                return {
                    r: sourceArray[startIndex],
                    g: sourceArray[startIndex + 1],
                    b: sourceArray[startIndex + 2],
                    a: sourceArray[startIndex + 3]
                };
            };

        for (i = 0, max = imageData.width * imageData.height * 4; i < max; i += 4) {
            // The 9-color array that we build must factor in image boundaries.
            // If a particular location is out of range, the color supplied is that
            // of the extant pixel that is adjacent to it.
            iAbove = i - rowWidth;
            iBelow = i + rowWidth;
            pixelColumn = i % rowWidth;

            pixel = filter([
                // The row of pixels above the current one.
                sourceArray[iAbove] ?
                    // Current pixel is at row > 0.
                    (pixelColumn ? rgba(iAbove - 4) : rgba(iAbove)) :
                    // Current pixel is at row === 0.
                    (pixelColumn ? rgba(i - 4) : rgba(i)),

                sourceArray[iAbove] ? rgba(iAbove) : rgba(i),

                sourceArray[iAbove] ?
                    // Current pixel is at row > 0.
                    ((pixelColumn < rowWidth - 4) ? rgba(iAbove + 4) : rgba(iAbove)) :
                    // Current pixel is at row === 0.
                    ((pixelColumn < rowWidth - 4) ? rgba(i + 4) : rgba(i)),

                // The current row of pixels.
                pixelColumn ? rgba(i - 4) : rgba(i),

                // The center pixel: the filter's returned color goes here
                // (based on the loop, we are at least sure to have this).
                rgba(i),

                (pixelColumn < rowWidth - 4) ? rgba(i + 4) : rgba(i),

                // The row of pixels below the current one.
                sourceArray[iBelow] ?
                    // Current pixel is not on the last row.
                    (pixelColumn ? rgba(iBelow - 4) : rgba(iBelow)) :
                    // Current pixel is on the last row.
                    (pixelColumn ? rgba(i - 4) : rgba(i)),

                sourceArray[iBelow] ? rgba(iBelow) : rgba(i),

                sourceArray[iBelow] ?
                    // Current pixel is not on the last row.
                    ((pixelColumn < rowWidth - 4) ? rgba(iBelow + 4) : rgba(iBelow)) :
                    // Current pixel is on the last row.
                    ((pixelColumn < rowWidth - 4) ? rgba(i + 4) : rgba(i))
            ]);

            // Apply the color that is returned by the filter.
            for (j = 0; j < 4; j += 1) {
                destinationArray[i + j] = pixel[j];
            }
        }

        return result;
    }
};
