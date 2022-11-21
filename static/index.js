window.onload = getData();

function getData() {
  fetch("http://35.175.100.203:3000/api/attractions")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      let result = data.data;
      for (let i = 0; i < result.length; i++) {
        //console.log(result[i].name); //每個name
        //console.log(result[i].mrt); //每個mrt
        //console.log(result[i].category); //每個category
        //console.log(result[i].images[0]); //每張圖
        let picDiv = document.createElement("div");
        picDiv.className = "pic";

        let img = document.createElement("img");
        img.setAttribute("src", `${result[i].images[0]}`);

        let attractionNameDiv = document.createElement("div");
        attractionNameDiv.className = "attraction-name";
        attractionNameDiv.textContent = `${result[i].name}`;

        let picTitleDiv = document.createElement("div");
        picTitleDiv.className = "pic-title";

        let mrtDiv = document.createElement("div");
        mrtDiv.className = "mrt";
        mrtDiv.textContent = `${result[i].mrt}`;

        let categoryDiv = document.createElement("div");
        categoryDiv.className = "category";
        categoryDiv.textContent = `${result[i].category}`;

        picTitleDiv.appendChild(mrtDiv);
        picTitleDiv.appendChild(categoryDiv);

        picDiv.appendChild(img);
        picDiv.appendChild(attractionNameDiv);
        picDiv.appendChild(picTitleDiv);

        document.querySelector(".gallery").appendChild(picDiv);
      }
    });
}

//==========================================================================

const search = document.querySelector(".search");
const categories = document.querySelector(".categories");

function categoriesList() {
  fetch("http://35.175.100.203:3000/api/categories")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      let result = data.data;
      categories.innerHTML = "";
      for (let i = 0; i < result.length; i++) {
        let itemDiv = document.createElement("div");
        // itemDiv.className = "item";
        itemDiv.setAttribute("onclick", "value(this.innerHTML)");
        itemDiv.textContent = result[i];
        categories.appendChild(itemDiv);
      }
    });
}

categoriesList();

search.addEventListener("click", function () {
  categories.style.display = "flex";
});

document.addEventListener(
  "click",
  function () {
    categories.style.display = "none";
  },
  true
);

function value(e) {
  search.setAttribute("value", e);
}
