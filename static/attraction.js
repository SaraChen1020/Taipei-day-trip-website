const title = document.querySelector("title");
const attractionName = document.querySelector(".attraction-name");
const categoryMRT = document.querySelector(".category-mrt");
const description = document.querySelector(".description");
const address = document.querySelector(".address");
const transport = document.querySelector(".transport");
const morning = document.querySelector("#morning");
const afternoon = document.querySelector("#afternoon");
const price = document.querySelector(".price-1");
const slidesPictures = document.querySelector(".slides-pictures");
const dotPosition = document.querySelector(".dot-position");

let slideIndex = 0;
let path = location.pathname;

window.onload = getData();

function getData() {
  fetch(`/api${path}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      let result = data.data;
      title.textContent = result.name;
      attractionName.textContent = result.name;
      categoryMRT.textContent = `${result.category} at ${result.mrt}`;
      description.textContent = result.description;
      address.textContent = result.address;
      transport.textContent = result.transport;

      for (let i = 0; i < result.images.length; i++) {
        let slideDiv = document.createElement("div");
        slideDiv.className = "slide";

        let img = document.createElement("img");
        img.setAttribute("src", `${result.images[i]}`);

        slideDiv.appendChild(img);
        slidesPictures.appendChild(slideDiv);

        let dotDiv = document.createElement("div");
        dotDiv.className = "dot";
        dotDiv.setAttribute("onclick", `currentSlide(${i})`);
        dotPosition.appendChild(dotDiv);
      }
      showSlides(slideIndex);
    })
    .catch(function (error) {
      console.log("error", error);
    });
}

//下一張
function changeSlides(n) {
  showSlides((slideIndex += n));
}

//圖片圓點
function currentSlide(n) {
  showSlides((slideIndex = n));
}

//顯示圖片
function showSlides(n) {
  let slides = document.querySelectorAll(".slide");
  let dots = document.querySelectorAll(".dot");

  //超過輪播圖片的數量，回到第一張
  if (n >= slides.length) {
    slideIndex = 0;
  }
  //小於第一張，回到最後一張
  if (n < 0) {
    slideIndex = slides.length - 1;
  }

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  for (let i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }

  slides[slideIndex].style.display = "block";
  dots[slideIndex].className += " active"; //使用+=才不會覆蓋掉原本的class
}

morning.addEventListener("click", function () {
  price.textContent = "新台幣 2000 元";
});

afternoon.addEventListener("click", function () {
  price.textContent = "新台幣 2500 元";
});
