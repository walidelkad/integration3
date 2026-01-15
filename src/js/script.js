gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  let svg = document.querySelector("svg");
  let path = svg?.querySelector("path");

  if (!svg || !path) {
    console.error("SVG or path element not found");
    return;
  }

  const pathLength = path.getTotalLength();

  gsap.set(path, { strokeDasharray: pathLength });

  gsap.fromTo(
    path,
    {
      strokeDashoffset: pathLength,
    },
    {
      strokeDashoffset: 0,
      duration: 10,
      scrollTrigger: {
        trigger: ".svg-container",
        start: "top top",
        end: "bottom bottom",
      },
    }
  );
});
