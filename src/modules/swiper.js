let x = '';
let y = '';
let swipe = '';

function getTouches(evt) {
  return evt.touches;
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    x = firstTouch.clientX;
    y = firstTouch.clientY;
};

function handleTouchMove(evt) {
    if ( ! x || ! y ) {
        return;
    }
    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;

    let offsetX = x - xUp;
    let yDiff = y - yUp;

    if ( Math.abs( offsetX ) > Math.abs( yDiff ) ) {
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
