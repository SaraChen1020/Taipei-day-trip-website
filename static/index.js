const categories = document.querySelector(".categories");
const search = document.querySelector(".search");
const searchBtn = document.querySelector(".search-btn");
const noResult = document.querySelector(".no-result");

window.onload = observe(0, "");

//觀察者及初始畫面函式
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

            if (result != "") {
              noResult.style.display = "none";
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
            } else {
              noResult.style.display = "block";
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

  // 當點擊查詢時先暫停原本的觀察
  searchBtn.addEventListener("click", function () {
    observer.unobserve(footer);
  });
}

// 分類選單載入
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

// 點擊時打開分類選單
search.addEventListener("click", function () {
  categories.style.display = "flex";
});

// 點擊其他處關閉選單
document.addEventListener(
  "click",
  function () {
    categories.style.display = "none";
  },
  true
);

// 點擊分類文字，接收回傳值並放到搜尋列
function value(e) {
  search.value = e;
}

// 送出查詢
searchBtn.addEventListener("click", function () {
  let keyword = search.value;
  document.querySelector(".gallery").innerHTML = "";
  search.value = "";
  observe(0, keyword);
});
