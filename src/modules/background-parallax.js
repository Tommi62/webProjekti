const background = document.querySelector(".banner");
let x = window.matchMedia("(max-width: 800px)");

const addBackgroundParallax = () => {
  document.addEventListener("scroll", (evt) => {
    let scrollArea = 1000 - window.innerHeight;
    let scrollTop = window.pageYOffset || window.scrollTop;
    let scrollPercent = scrollTop / scrollArea || 0;
    let backgroundY = - (scrollPercent * window.innerHeight) / 800;
    if (x.matches) {
      backgroundY = - (scrollPercent * window.innerHeight) / 550;
      let backgroundX = - (scrollPercent * window.innerHeight) / 1500;
      background.style.transform =
      "translateY(" + backgroundY + "%) " + "translateX(" + backgroundX + "%) " + "scale(" + 1.3 + ")";
    } else {
      background.style.transform =
      "translateY(" + backgroundY + "%) " + "scale(" + 1.20 + ")";
    }
  });
};

export { addBackgroundParallax };
