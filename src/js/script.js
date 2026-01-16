import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let svg = document.querySelector("svg");
let path = svg.querySelector("path");

const pathLength = path.getTotalLength();

console.log(pathLength);

gsap.set(path, { strokeDasharray: pathLength });
console.log(gsap, ScrollTrigger);

gsap.fromTo(
  path,
  {
    strokeDashoffset: pathLength,
  },
  {
    strokeDashoffset: 0,
    duration:10,
    scrollTrigger: {
      trigger: ".svg-container",
      start: "top top",
      end: "bottom bottom",
    },
  }
);
