const username = document.querySelector(".username");
const scheduleContent = document.querySelector(".schedule-content");
const information = document.querySelector(".information");
const contactForm = document.querySelector(".contact-form");
const contactName = document.querySelector(".contact-name");
const contactEmail = document.querySelector(".contact-email");
const contactPhone = document.querySelector(".contact-phone");
const paymentForm = document.querySelector(".payment-form");
const confirmForm = document.querySelector(".confirm-form");
const totalPrice = document.querySelector(".total-price");
const submitButton = document.querySelector(".submit-button");

let sumOfPrice = 0;
let primeNumber;
const trips = [];

window.onload = async () => {
  await checkSigninStatus();
  if (signinStatus) {
    username.textContent = memberName;
    contactName.value = memberName;
    contactEmail.value = memberEmail;
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
    information.classList.remove("none");
  } else {
    noData();
  }
}

// 待預定行程畫面呈現
function loadDataToDom(result) {
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
    bookingAddress.innerHTML = `<b>地點：</b><p>${result[i].attraction.address}</p>`;
    rightInformation.appendChild(bookingAddress);

    if (oderDate < todayDate) {
      overdueNotice(rightInformation);
    }
    if (oderDate == todayDate && nowTime >= orderTime) {
      overdueNotice(rightInformation);
    }

    sectionDiv.appendChild(rightInformation);

    const lineDiv = document.createElement("div");
    lineDiv.className = "line";

    scheduleContent.appendChild(sectionDiv);
    scheduleContent.appendChild(lineDiv);

    sumOfPrice += result[i].price;

    const attraction = {
      attraction: result[i].attraction,
      date: result[i].date,
      time: result[i].time,
    };
    trips.push(attraction);
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

//預約行程按鈕
submitButton.addEventListener("click", (event) => {
  event.preventDefault();

  // 取得 TapPay Fields 的 status
  const tappayStatus = TPDirect.card.getTappayFieldsStatus();
  // 確認是否可以 getPrime
  if (tappayStatus.canGetPrime === false) {
    alert("can not get prime");
    return;
  }

  // Get prime
  TPDirect.card.getPrime((result) => {
    if (result.status !== 0) {
      console.log("get prime error " + result.msg);
      return;
    }
    console.log("get prime 成功，prime: " + result.card.prime);
    primeNumber = result.card.prime;
    // send prime to your server, to pay with Pay by Prime API .
    // Pay By Prime Docs: https://docs.tappaysdk.com/tutorial/zh/back.html#pay-by-prime-api
    submitOrder(primeNumber);
  });
});

async function submitOrder(prime) {
  const tripData = {
    prime: prime,
    order: {
      price: sumOfPrice,
      trip: trips,
    },
    contact: {
      name: contactName.value,
      email: contactEmail.value,
      phone: contactPhone.value,
    },
  };
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(tripData),
    });
    const data = await response.json();
    const result = data.data;
    if (result) {
      // 下訂成功~~這邊可以做些顯示再跳轉
      document.location.href = `/thankyou?number=${result.number}`;
    } else {
      // 下訂失敗~可能是聯絡資訊沒填好
      console.log(data.message);
    }
  } catch (error) {
    console.log("error", error);
  }
}

// 無待預訂的行程
function noData() {
  const noSchedule = document.createElement("div");
  noSchedule.className = "no-schedule";
  noSchedule.textContent = "目前沒有任何待預訂的行程。";
  scheduleContent.appendChild(noSchedule);
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

// // 信用卡數字自動分隔及驗證
// paymentNumber.addEventListener("keyup", function () {
//   this.value = this.value.replace(/\s/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
//   let regexOfCard = new RegExp(/^\d{16}$/);
//   if (regexOfCard.test(this.value.replace(/\s*/g, ""))) {
//     this.style.color = "black";
//   } else {
//     this.style.color = "red";
//   }
// });

// // 月份自動加上/，驗證功能待研究
// paymentDueDate.addEventListener("keyup", function () {
//   this.value = this.value.replace(/^[0-9]{2}$/, "$& / "); //有成功補上 /
//   // /^(0?[1-9]|1[0-2]){2}$/  驗證前兩個數字是月份

//   const today = new Date();
//   const todayDate = today.toLocaleDateString().replace(/\//g, "");
//   const nowMonth = Number(todayDate.substring(4, 6)); //當前月份MM
//   const nowYear = Number(todayDate.substring(2, 4)); //當前年YY

//   //輸入的月份不可大於12，月份與年不可超過現在
//   if (Number(this.value.substring(0, 2)) > 12) {
//     this.style.color = "red";
//   } else if (
//     Number(this.value.substring(0, 2)) < nowMonth &&
//     Number(this.value.substring(5, 7)) <= nowYear
//   ) {
//     this.style.color = "red";
//   } else {
//     this.style.color = "black";
//   }
// });

// paymentPassword.addEventListener("keyup", function () {
//   this.value = this.value.replace(/[^\d]/g, "");
// });

TPDirect.setupSDK(
  126835,
  "app_SvbSbEqMZ5UenvDQM0Ef0zqc00eKp7khygHKMpt4inHEh3amDVQqahmT29D5",
  "sandbox"
);

let fields = {
  number: {
    // css selector
    element: "#card-number",
    placeholder: "**** **** **** ****",
  },
  expirationDate: {
    // DOM object
    element: document.getElementById("card-expiration-date"),
    placeholder: "MM / YY",
  },
  ccv: {
    element: "#card-ccv",
    placeholder: "CCV",
  },
};

TPDirect.card.setup({
  fields: fields,
  styles: {
    // Style all elements
    input: {
      color: "gray",
    },
    // Styling ccv field
    "input.ccv": {
      // 'font-size': '16px'
    },
    // Styling expiration-date field
    "input.expiration-date": {
      // 'font-size': '16px'
    },
    // Styling card-number field
    "input.card-number": {
      // 'font-size': '16px'
    },
    // style focus state
    ":focus": {
      // color: "black",
    },
    // style valid state
    ".valid": {
      color: "green",
    },
    // style invalid state
    ".invalid": {
      color: "red",
    },
    // Media queries
    // Note that these apply to the iframe, not the root window.
    "@media screen and (max-width: 400px)": {
      input: {
        color: "red",
      },
    },
  },
  // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
  isMaskCreditCardNumber: true,
  maskCreditCardNumberRange: {
    beginIndex: 6,
    endIndex: 11,
  },
});

TPDirect.card.onUpdate(function (update) {
  // update.canGetPrime === true
  // --> you can call TPDirect.card.getPrime()
  if (update.canGetPrime) {
    // Enable submit Button to get prime.
    // submitButton.removeAttribute('disabled')
  } else {
    // Disable submit Button to get prime.
    // submitButton.setAttribute('disabled', true)
  }

  // cardTypes = ['mastercard', 'visa', 'jcb', 'amex', 'unknown']
  if (update.cardType === "visa") {
    // Handle card type visa.
  }

  // number 欄位是錯誤的
  if (update.status.number === 2) {
    // setNumberFormGroupToError()
  } else if (update.status.number === 0) {
    // setNumberFormGroupToSuccess()
  } else {
    // setNumberFormGroupToNormal()
  }

  if (update.status.expiry === 2) {
    // setNumberFormGroupToError()
  } else if (update.status.expiry === 0) {
    // setNumberFormGroupToSuccess()
  } else {
    // setNumberFormGroupToNormal()
  }

  if (update.status.ccv === 2) {
    // setNumberFormGroupToError()
  } else if (update.status.ccv === 0) {
    // setNumberFormGroupToSuccess()
  } else {
    // setNumberFormGroupToNormal()
  }
});
