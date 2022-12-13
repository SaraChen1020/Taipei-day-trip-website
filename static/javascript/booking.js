const username = document.querySelector(".username");
const scheduleContent = document.querySelector(".schedule-content");
const lines = document.querySelectorAll(".line");
const contactForm = document.querySelector(".contact-form");
const paymentForm = document.querySelector(".payment-form");
const confirmForm = document.querySelector(".confirm-form");
const totalPrice = document.querySelector(".total-price");

window.onload = async () => {
  await checkSigninStatus();
  if (signinStatus) {
    username.textContent = memberName;
    getData();
  } else {
    document.location.href = "/";
    console.log("未登入");
  }
};

async function getData() {
  const response = await fetch("/api/booking");
  const data = await response.json();
  const result = data.data;
  if (result != null) {
    loadDataToDom(result);
  } else {
    noData();
  }
}

// 待預定行程畫面呈現
function loadDataToDom(result) {
  let sumOfPrice = 0;
  const today = new Date();
  const todayDate = Number(today.toLocaleDateString().replace(/\//g, ""));
  const nowTime = Number(today.getHours());

  for (let i = 0; i < result.length; i++) {
    let time =
      result[i].time == "morning"
        ? "早上 9 點到下午 1 點"
        : "下午 2 點到晚上 6 點";
    const oderDate = Number(result[i].date.replace(/-/g, ""));
    let orderTime = result[i].time == "morning" ? 9 : 14;

    const sectionDiv = document.createElement("div");
    sectionDiv.className = "schedule-section";

    const aTag = document.createElement("a");
    aTag.href = `/attraction/${result[i].attraction.id}`;
    const photoDiv = document.createElement("div");
    photoDiv.className = "photo";
    const image = document.createElement("img");
    image.src = `${result[i].attraction.image}`;
    photoDiv.appendChild(image);
    aTag.appendChild(photoDiv);
    sectionDiv.appendChild(aTag);

    const scheduleDelete = document.createElement("div");
    scheduleDelete.className = "schedule-delete";
    sectionDiv.appendChild(scheduleDelete);

    const rightInformation = document.createElement("div");
    rightInformation.className = "attraction-information";

    const attractionTitle = document.createElement("div");
    attractionTitle.className = "attraction-title";
    attractionTitle.textContent = `台北一日遊：${result[i].attraction.name}`;
    rightInformation.appendChild(attractionTitle);

    const bookingDate = document.createElement("div");
    bookingDate.className = "booking-date";
    bookingDate.innerHTML = `日期：<p>${result[i].date}</p>`;
    rightInformation.appendChild(bookingDate);

    const bookingTime = document.createElement("div");
    bookingTime.className = "booking-time";
    bookingTime.innerHTML = `時間：<p>${time}</p>`;
    rightInformation.appendChild(bookingTime);

    const bookingPrice = document.createElement("div");
    bookingPrice.className = "booking-price";
    bookingPrice.innerHTML = `費用：<p>新台幣 ${result[i].price} 元</p>`;
    rightInformation.appendChild(bookingPrice);

    const bookingAddress = document.createElement("div");
    bookingAddress.className = "booking-address";
    bookingAddress.innerHTML = `地點：<p>${result[i].attraction.address}</p>`;
    rightInformation.appendChild(bookingAddress);

    if (oderDate < todayDate) {
      overdueNotice(rightInformation);
    }
    if (oderDate == todayDate && nowTime > orderTime) {
      overdueNotice(rightInformation);
    }

    sectionDiv.appendChild(rightInformation);
    scheduleContent.appendChild(sectionDiv);

    sumOfPrice += result[i].price;
  }
  totalPrice.textContent = `總價：新台幣 ${sumOfPrice} 元`;

  const deleteButtons = document.querySelectorAll(".schedule-delete");
  deleteButtons.forEach((item, index) => {
    item.addEventListener("click", () => {
      const attractionId = result[index].attraction.id;
      const date = result[index].date;
      const bookTime = result[index].time;
      deleteSchedule(attractionId, date, bookTime);
    });
  });
}

// 無待預訂的行程
function noData() {
  const noSchedule = document.createElement("div");
  noSchedule.className = "no-schedule";
  noSchedule.textContent = "目前沒有任何待預訂的行程。";
  scheduleContent.appendChild(noSchedule);
  for (let line of lines) {
    line.classList.add("none");
  }
  contactForm.classList.add("none");
  paymentForm.classList.add("none");
  confirmForm.classList.add("none");
}

// 刪除行程
async function deleteSchedule(id, date, time) {
  try {
    const response = await fetch("/api/booking", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        attractionId: id,
        date: date,
        time: time,
      }),
    });
    const data = await response.json();
    if (data.ok) {
      document.location.href = "/booking";
    }
  } catch (error) {
    console.log("error", error);
  }
}

// 待預定行程的過期提醒
function overdueNotice(rightInformation) {
  const passTimeDiv = document.createElement("div");
  passTimeDiv.className = "passtime-text";
  passTimeDiv.textContent = "此筆預定的日期或時間已過期";
  rightInformation.appendChild(passTimeDiv);
}
