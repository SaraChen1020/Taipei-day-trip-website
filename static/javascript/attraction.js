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
const dateInput = document.querySelector(".date-input");
const bookingButton = document.querySelector(".booking-button");
const bookingText = document.querySelector(".booking-text");

let slideIndex = 0;
let path = location.pathname;

const today = new Date();
const todayDate = today.toLocaleDateString().replace(/\//g, "-");

window.onload = () => {
  checkSigninStatus();
  getData();
  dateInput.min = todayDate;
};

async function getData() {
  try {
    const response = await fetch(`/api${path}`);
    const data = await response.json();
    const result = data.data;

    title.textContent = result.name;
    attractionName.textContent = result.name;
    categoryMRT.textContent = `${result.category} at ${result.mrt}`;
    description.textContent = result.description;
    address.textContent = result.address;
    transport.textContent = result.transport;

    for (let i = 0; i < result.images.length; i++) {
      const slideDiv = document.createElement("div");
      slideDiv.className = "slide";

      const img = document.createElement("img");
      img.setAttribute("src", `${result.images[i]}`);

      slideDiv.appendChild(img);
      slidesPictures.appendChild(slideDiv);

      const dotDiv = document.createElement("div");
      dotDiv.className = "dot";
      dotDiv.setAttribute("onclick", `currentSlide(${i})`);
      dotPosition.appendChild(dotDiv);
    }
    showSlides(slideIndex);
  } catch (error) {
    console.log("error", error);
  }
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
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

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
  morning.setAttribute("checked", "checked");
  afternoon.removeAttribute("checked");
  price.textContent = "新台幣 2000 元";
});

afternoon.addEventListener("click", function () {
  morning.removeAttribute("checked");
  afternoon.setAttribute("checked", "checked");
  price.textContent = "新台幣 2500 元";
});

bookingButton.addEventListener("click", function () {
  const attractionId = location.pathname.replace("/attraction/", "");
  const date = dateInput.value;
  const dayTime = document.querySelector("[name=day-time]:checked").id;
  const price = dayTime == "morning" ? 2000 : 2500;

  bookingSchedule(attractionId, date, dayTime, price);
});

async function bookingSchedule(id, date, time, price) {
  try {
    const response = await fetch("/api/booking", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        attractionId: id,
        date: date,
        time: time,
        price: price,
      }),
    });
    if (response.status == 403) {
      signInOpen();
    }
    const data = await response.json();
    if (data.ok) {
      document.location.href = "/booking";
    } else if (data.error) {
      bookingText.classList.remove("none");
      bookingText.textContent = data.message;
    }
  } catch (error) {
    console.log("error", error);
  }
}
