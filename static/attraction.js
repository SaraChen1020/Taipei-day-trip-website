const attractionName = document.querySelector(".attraction-name");
const categoryMRT = document.querySelector(".category-mrt");
const description = document.querySelector(".description");
const address = document.querySelector(".address");
const transport = document.querySelector(".transport");
const morning = document.querySelector(".morning");
const afternoon = document.querySelector(".afternoon");
const price = document.querySelector(".price-1");

let path = location.pathname;
// console.log(path); //印出/attraction/1

window.onload = getData();
function getData() {
  fetch(`/api${path}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      let result = data.data;
      attractionName.textContent = result.name;
      categoryMRT.textContent = `${result.category} at ${result.mrt}`;
      description.textContent = result.description;
      address.textContent = result.address;
      transport.textContent = result.transport;
    });
}

morning.addEventListener("click", function () {
  price.textContent = "新台幣 2000 元";
});

afternoon.addEventListener("click", function () {
  price.textContent = "新台幣 2500 元";
});
