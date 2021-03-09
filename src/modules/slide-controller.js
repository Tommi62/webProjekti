import { handleTouchStart, handleTouchMove } from '../modules/swiper';
import { parseImgs} from "../modules/info-data";
const infoContainer = document.querySelector(".info");
const carouselRight = document.querySelector(".carouselRight");
const carouselLeft = document.querySelector(".carouselLeft");
let slides = [];
let carouselPosition = 0;


/**
 * Creates slides to an array depending on the language in use.
 *
 * @param {string} language - language 'fi' or 'en'
 */
const makeSlides = (language) => {
  slides.splice(0, slides.length);
  infoContainer.innerHTML = "";
  const imgs = parseImgs(language);
  for (const img of imgs) {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.style.backgroundImage = "url(" + img + ")";
    slide.addEventListener('touchstart', handleTouchStart);
    slide.addEventListener('touchmove', swipeChangeSlide);
    slides.push(slide);
  }
};

/* TEXT SLIDES
const makeSlides = () => {
  slides.splice(0, slides.length);
  infoContainer.innerHTML = "";
  const data = parseInfo(language);
  for (const set of data) {
    const slide = document.createElement('div');
    slide.className = 'slide';
    const h3 = document.createElement('h3');

    h3.innerHTML = set.title;
    slide.appendChild(h3);

    if (set.text !== "") {
      const ul = document.createElement('ul');
      for (const textNode of set.text) {
        const li = document.createElement('li');
        li.innerHTML = textNode;
        ul.appendChild(li);
      }
      slide.appendChild(ul);
    }
    slides.push(slide);
  }
};
*/

/**
 * Changes slides on swipe event.
 *
 * @param {event} evt
 */
const swipeChangeSlide = (evt) => {
  let touch = handleTouchMove(evt);
  if (touch === 'right') {
    infoCarouselLeft();
  }
  if (touch === 'left') {
    infoCarouselRight();
  }
};

/**
 * Changes the slide with an transition depending on the direction.
 *
 * @param {string} direction - 'right' or 'left'
 */
const changeSlide = (direction) => {
  let slide = document.querySelector(".slide");
  slide.style.opacity = "0";
  if (direction === "right") {
    slide.style.transform = " scale(0.9) translate(-20%, 0%)";
  }
  if (direction === "left") {
    slide.style.transform = " scale(0.9) translate(20%, 0%)";
  }
  setTimeout(function () {
    slide.style.transform = "none";
    infoContainer.innerHTML = "";
    infoContainer.appendChild(slides[carouselPosition]);
    slide = slides[carouselPosition];
    if (direction === "right") {
      slide.style.transform = " scale(0.9) translate(20%, 0%)";
    }
    if (direction === "left") {
      slide.style.transform = " scale(0.9) translate(-20%, 0%)";
    }
    setTimeout(function () {
      slide = document.querySelector(".slide");
      slide.style.opacity = "1";
      slide.style.transform = "rotate(0turn) scale(1) translate(0%, 0%)";
    }, 10);
  }, 500);
};

/**
 * Makes the carousel go smoothly around right
 */
const infoCarouselRight = () => {
  if (carouselPosition < slides.length - 1) {
    carouselPosition++;
    changeSlide("right");
  } else {
    carouselPosition = 0;
    changeSlide("right");
  }
};

/**
 * Makes the carousel go smoothly around left
 */
const infoCarouselLeft = () => {
  if (carouselPosition > 0) {
    carouselPosition--;
    changeSlide("left");
  } else {
    carouselPosition = slides.length;
    carouselPosition--;
    changeSlide("left");
  }
};

/**
 * Refreshes the slides. Used for changing language.
 */
const infoCarouselRefresh = () => {
  infoContainer.innerHTML = "";
  infoContainer.appendChild(slides[carouselPosition]);
  setTimeout(function () {
    const slide = document.querySelector(".slide");
    slide.style.opacity = "1";
  }, 500);
};

/**
 * Clears the timer that is used to auto-rotate slides. Used when the user controls the carousel.
 */
const clearCarouselTimer = () => {
  console.log("clearTimer");
  clearTimeout(carouselTimer);
  carouselTimer = setInterval(infoCarouselRight, 13000);
};

let carouselTimer;
carouselTimer = setInterval(infoCarouselRight, 13000);

carouselRight.addEventListener("click", infoCarouselRight);
carouselLeft.addEventListener("click", infoCarouselLeft);
carouselLeft.addEventListener("click", clearCarouselTimer);
carouselRight.addEventListener("click", clearCarouselTimer);

export { makeSlides, infoCarouselRefresh, clearCarouselTimer };
