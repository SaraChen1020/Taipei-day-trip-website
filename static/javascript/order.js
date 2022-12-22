const username = document.querySelector(".username");
const textNote = document.querySelector(".text-note");
const path = location.pathname;
const orderNumber = path.replace("/order/", "");
const scheduleContent = document.querySelector(".schedule-content");
const orderForm = document.querySelector(".order-form");
const orderStatus = document.querySelector(".order-status");
const orderPayment = document.querySelector(".order-payment");
const contactForm = document.querySelector(".contact-form");
const contactName = document.querySelector(".contact-name");
const contactEmail = document.querySelector(".contact-email");
const contactPhone = document.querySelector(".contact-phone");
const line = document.querySelector(".line");

window.onload = async () => {
  await checkSigninStatus();
  if (signinStatus) {
    username.textContent = `${memberName} 您好 (ﾉ>ω<)ﾉ `;
    textNote.textContent = `訂單號碼：${orderNumber}的行程內容如下：`;
    getData();
  } else {
    document.location.href = "/";
  }
};

async function getData() {
  try {
    const response = await fetch(`/api/order/${orderNumber}`);
    const data = await response.json();
    const result = data.data;
    if (result != null) {
      loadOrderToDom(result);
    } else {
      noOrder();
    }
  } catch (error) {
    console.log("error", error);
  }
}

function loadOrderToDom(result) {
  const trips = result.trip;
  trips.forEach((item) => {
    let time =
      item.time == "morning" ? "早上 9 點到下午 1 點" : "下午 2 點到晚上 6 點";

    const sectionDiv = document.createElement("div");
    sectionDiv.className = "schedule-section";

    const aTag = document.createElement("a");
    aTag.href = `/attraction/${item.attraction.id}`;
    const photoDiv = document.createElement("div");
    photoDiv.className = "photo";
    const image = document.createElement("img");
    image.src = `${item.attraction.image}`;
    photoDiv.appendChild(image);
    aTag.appendChild(photoDiv);
    sectionDiv.appendChild(aTag);

    const rightInformation = document.createElement("div");
    rightInformation.className = "attraction-information";

    const attractionTitle = document.createElement("div");
    attractionTitle.className = "attraction-title";
    attractionTitle.textContent = `台北一日遊：${item.attraction.name}`;
    rightInformation.appendChild(attractionTitle);

    const bookingDate = document.createElement("div");
    bookingDate.className = "booking-date";
    bookingDate.innerHTML = `日期：<p>${item.date}</p>`;
    rightInformation.appendChild(bookingDate);

    const bookingTime = document.createElement("div");
    bookingTime.className = "booking-time";
    bookingTime.innerHTML = `時間：<p>${time}</p>`;
    rightInformation.appendChild(bookingTime);

    const bookingPrice = document.createElement("div");
    bookingPrice.className = "booking-price";
    bookingPrice.innerHTML = `費用：<p>新台幣 ${item.price} 元</p>`;
    rightInformation.appendChild(bookingPrice);

    const bookingAddress = document.createElement("div");
    bookingAddress.className = "booking-address";
    bookingAddress.innerHTML = `<b>地點：</b><p>${item.attraction.address}</p>`;
    rightInformation.appendChild(bookingAddress);

    sectionDiv.appendChild(rightInformation);

    const lineDiv = document.createElement("div");
    lineDiv.className = "line";

    scheduleContent.appendChild(sectionDiv);
    scheduleContent.appendChild(lineDiv);
  });
  const orderStatusText = document.createElement("p");
  orderStatusText.className = "order-status-text";
  orderStatusText.textContent = result.status;
  orderStatus.appendChild(orderStatusText);

  //   orderStatus.textContent = `付款狀態：${result.status}`;
  orderPayment.textContent = `總金額：新台幣 ${result.price} 元`;
  contactName.textContent = `聯絡姓名：${result.contact.name}`;
  contactEmail.textContent = `聯絡信箱：${result.contact.email}`;
  contactPhone.textContent = `手機號碼：${result.contact.phone}`;

  if (!result.status) {
    orderStatusText.textContent = "付款失敗";
    orderStatusText.style.color = "#fa5252";
  }
}

function noOrder() {
  orderForm.classList.add("none");
  line.classList.add("none");
  contactForm.classList.add("none");
  username.textContent = `${memberName} 您好 (☉д⊙) `;
  textNote.textContent = `您的歷史訂單中查無此訂單編號。`;
}
