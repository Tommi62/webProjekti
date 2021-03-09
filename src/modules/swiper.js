let x = '';
let y = '';
let swipe = '';

/**
 * Gets touch events
 *
 * @param {event} evt
 * @returns touch event
 */
function getTouches(evt) {
  return evt.touches;
}

/**
 * Logs the starting point of the touch.
 *
 * @param {event} evt
 */
function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    x = firstTouch.clientX;
    y = firstTouch.clientY;
};

/**
 * Returns swipe direction calculated from the starting position to the ending position of the swipe.
 *
 * @param {event} evt
 * @returns swipe direction in string
 */
function handleTouchMove(evt) {
    if ( ! x || ! y ) {
        return;
    }
    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;

    let offsetX = x - xUp;
    let yOffset = y - yUp;

    if ( Math.abs( offsetX ) > Math.abs( yOffset ) ) {
        if ( offsetX > 0 ) {
            swipe = 'left';
        } else {
            swipe = 'right';
        }
    } else {
        swipe = 'up or down';
    }
    x = '';
    y = '';
    return swipe;
};

export {handleTouchStart, handleTouchMove, swipe};
