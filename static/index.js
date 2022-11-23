const categories = document.querySelector(".categories");
const search = document.querySelector(".search");
const btn = document.querySelector(".btn");

window.onload = observe(0, "");

function observe(page, keyword) {
  const configs = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        url = `http://35.175.100.203:3000/api/attractions?page=${page}&keyword=${keyword}`;
        fetch(url)
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            let result = data.data;
            for (let i = 0; i < result.length; i++) {
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
            if (data.nextPage != null) {
              page = data.nextPage;
            } else {
              observer.unobserve(footer);
            }
          });
      }
    });
  }, configs);

  // 指定觀察對象
  const footer = document.querySelector(".footer");
  observer.observe(footer);

  // 當點擊查詢時暫停原本的觀察
  btn.addEventListener("click", function () {
    observer.unobserve(footer);
  });
}

//==========================================================================

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
  search.value = e;
  // search.setAttribute("value", e);
}

btn.addEventListener("click", function () {
  let keyword = search.value;
  document.querySelector(".gallery").innerHTML = "";
  search.value = "";
  // search.setAttribute("value", keyword);
  observe(0, keyword);
});
