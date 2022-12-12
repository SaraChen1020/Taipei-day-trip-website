const username = document.querySelector(".username");
const scheduleContent = document.querySelector(".schedule-content");
const lines = document.querySelectorAll(".line");
const contactForm = document.querySelector(".contact-form");
const paymentForm = document.querySelector(".payment-form");
const confirmForm = document.querySelector(".confirm-form");

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

// function checkMemberName() {
//   if (signinStatus) {
//     username.textContent = memberName;
//   }
//   fetch("/api/user/auth")
//     .then(function (response) {
//       return response.json();
//     })
//     .then(function (data) {
//       const result = data.data;
//       if (result != null) {
//         username.textContent = result.name;
//       }
//     });
// }

function getData() {
  fetch("/api/booking")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      const result = data.data;
      if (result != null) {
        for (let i = 0; i < result.length; i++) {
          let time =
            result[i].time == "morning"
              ? "早上 9 點到下午 1 點"
              : "下午 2 點到晚上 6 點";

          let sectionString = `
          <div class="schedule-section">
            <a href="/attraction/${result[i].attraction.id}">
            <div class="photo"><img src=${result[i].attraction.image} /></div>
            </a>
            <div class="schedule-delete"></div>
            <div class="attraction-information">
              <a href="/attraction/${result[i].attraction.id}">
              <div class="attraction-title">台北一日遊：${result[i].attraction.name}</div>
              </a>
              <div class="frame">
              日期：
                <div>${result[i].date}</div>
              </div>
              <div class="frame">
              時間：
                <div class="booking-time">${time}</div>
              </div>
              <div class="frame">
              費用：
                <div class="booking-price">新台幣 ${result[i].price} 元</div>
              </div>
              <div class="frame">
              地點：
                <div class="booking-address">${result[i].attraction.address}</div>
              </div>
            </div>
          </div>
          `;
          scheduleContent.innerHTML += sectionString;
        }
        const deleteButtons = document.querySelectorAll(".schedule-delete");

        for (let i = 0; i < deleteButtons.length; i++) {
          deleteButtons[i].addEventListener("click", function () {
            console.log(i);
          });
        }
      } else {
        sectionString = `
        <div class="no-schedule">目前沒有任何待預訂的行程。</div>
        `;
        scheduleContent.innerHTML = sectionString;
        for (let line of lines) {
          line.classList.add("none");
        }
        contactForm.classList.add("none");
        paymentForm.classList.add("none");
        confirmForm.classList.add("none");
      }
    });
}

// for (let i of deleteButton) {
//   i.addEventListener("click", function () {
//     console.log(i);
//   });
// }

// function deleteSchedule(index) {
//   console.log(index);
// }
