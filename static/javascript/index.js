const categories = document.querySelector(".categories");
const search = document.querySelector(".search");
const searchBtn = document.querySelector(".search-btn");
const noResult = document.querySelector(".no-result");
const footer = document.querySelector(".footer");
let pageLoading = false;

window.onload = () => {
  checkSigninStatus();
  getData();
};

//初始畫面
async function getData(page = 0, keyword = "") {
  pageLoading = true;
  url = `/api/attractions?page=${page}&keyword=${keyword}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    noResult.style.display = "none";
    const result = data.data;
    if (result != "") {
      const length = result.length;
      addDataToDom(result, length);
    } else {
      noResult.style.display = "block";
    }
    if (data.nextPage != null) {
      observe(data.nextPage, keyword);
    }
    pageLoading = false;
  } catch (error) {
    console.log("error", error);
  }
}

//設定觀察者
function observe(page, keyword) {
  const configs = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };
  const observer = new IntersectionObserver(async (entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting && !pageLoading) {
        pageLoading = true;
        url = `/api/attractions?page=${page}&keyword=${keyword}`;
        try {
          const response = await fetch(url);
          const data = await response.json();
          const result = data.data;
          const length = result.length;
          addDataToDom(result, length);

          if (data.nextPage != null) {
            page = data.nextPage;
          } else {
            observer.unobserve(footer);
          }
          pageLoading = false;
        } catch (error) {
          console.log("error", error);
        }
      }
    });
  }, configs);

  observer.observe(footer); //指定觀察對象

  // 當點擊查詢時先暫停原本的觀察
  searchBtn.addEventListener("click", function () {
    observer.unobserve(footer);
  });
}

//圖文版面
function addDataToDom(result, length) {
  for (let i = 0; i < length; i++) {
    let tag_a = document.createElement("a");
    tag_a.setAttribute("href", `/attraction/${result[i].id}`);

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

    tag_a.appendChild(picDiv);

    document.querySelector(".gallery").appendChild(tag_a);
  }
}

// 分類選單載入
async function categoriesList() {
  const response = await fetch("/api/categories");
  const data = await response.json();
  const result = data.data;
  categories.innerHTML = "";
  for (let i = 0; i < result.length; i++) {
    let itemDiv = document.createElement("div");
    itemDiv.setAttribute("onclick", "value(this)");
    itemDiv.textContent = result[i];
    categories.appendChild(itemDiv);
  }
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
function value(element) {
  search.value = element.innerHTML;
}

// 送出查詢
searchBtn.addEventListener("click", function () {
  let keyword = search.value;
  document.querySelector(".gallery").innerHTML = "";
  search.value = "";
  getData(0, keyword);
});
