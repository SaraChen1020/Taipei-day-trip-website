const email = document.querySelector(".normal-email");
const userNameSection = document.querySelector(".member-name");
const userNameInput = document.querySelector(".mb-name");
const userName = document.querySelector(".normal-name");
const userPasswordSection = document.querySelectorAll(".member-password");
const userPasswordOld = document.querySelector(".mb-password");
const userPasswordNew = document.querySelector(".mb-password-new");
const memberNameReviseBtn = document.querySelector(".membername-revise");
const memberNameSubmitBtn = document.querySelector(".membername-submit");
const passwordReviseBtn = document.querySelector(".password-revise");
const passwordSubmitBtn = document.querySelector(".password-submit");
const orderSection = document.querySelector(".order");
const popUp = document.querySelector(".popup");
const messageBox = document.querySelector(".message-box");
const errorImage = document.querySelector(".error-image");
const errorMessage = document.querySelector(".error-message");
const normalMessage = document.querySelector(".normal-message");
const closePop = document.querySelector(".close-pop");
const loadingIcon = document.querySelector(".loading");
const container = document.querySelector(".container");

window.onload = async () => {
  await checkSigninStatus();
  if (signinStatus) {
    await loadData();
    loadingIcon.classList.add("none");
    container.classList.remove("none");
  } else {
    document.location.href = "/";
    console.log("未登入");
  }
};

async function loadData() {
  const response = await fetch("/api/user/information");
  const data = await response.json();
  const result = data.data;

  email.textContent = result.email;
  userNameInput.value = result.name;
  userName.textContent = result.name;

  if (result.order.length !== 0) {
    loadOrder(result.order);
  } else {
    orderSection.innerHTML = "";
    const orderDiv = document.createElement("div");
    orderDiv.classList.add("order-number");
    orderDiv.textContent = "查無歷史訂單";
    orderDiv.style.color = "#fa5252";
    orderSection.appendChild(orderDiv);
  }
}

function loadOrder(orders) {
  orderSection.innerHTML = "";
  orders.forEach((item) => {
    const orderDiv = document.createElement("div");
    orderDiv.classList.add("order-number");
    orderDiv.innerHTML = `<a class="atag" href="/order/${item}">${item}</a>`;
    orderSection.appendChild(orderDiv);
  });
}

// 重置會員資訊顯示欄位
function reset() {
  userNameSection.classList.remove("none");
  userNameInput.classList.add("none");
  userName.classList.remove("none");
  memberNameSubmitBtn.classList.add("none");
  passwordReviseBtn.classList.remove("none");
  memberNameReviseBtn.classList.remove("none");
  passwordSubmitBtn.classList.add("none");
  userPasswordSection.forEach((item) => {
    item.classList.add("none");
  });
}

// 點擊修改姓名按鈕
memberNameReviseBtn.addEventListener("click", () => {
  userNameInput.classList.remove("none");
  userName.classList.add("none");
  memberNameReviseBtn.classList.add("none");
  passwordReviseBtn.classList.add("none");
  memberNameSubmitBtn.classList.remove("none");
});

// 點擊修改完成(姓名)
memberNameSubmitBtn.addEventListener("click", async () => {
  const newMemberName = userNameInput.value;

  try {
    const response = await fetch("/api/user/information", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: newMemberName }),
    });
    const data = await response.json();
    if (data.ok) {
      loadData();
      reset();
      normalMessage.textContent = "姓名修改成功！";
      normalMessage.classList.remove("none");
      popUp.classList.remove("none");
    } else {
      errorImage.classList.remove("none");
      errorMessage.textContent = data.message;
      errorMessage.classList.remove("none");
      popUp.classList.remove("none");
    }
  } catch (error) {
    console.log("error", error);
  }
});

// 點擊修改密碼按鈕
passwordReviseBtn.addEventListener("click", () => {
  userNameSection.classList.add("none");
  memberNameReviseBtn.classList.add("none");
  passwordReviseBtn.classList.add("none");
  passwordSubmitBtn.classList.remove("none");
  userPasswordSection.forEach((item) => {
    item.classList.remove("none");
  });
});

// 點擊確認(密碼修改)
passwordSubmitBtn.addEventListener("click", async () => {
  const oldPassword = userPasswordOld.value;
  const newPassword = userPasswordNew.value;
  try {
    const response = await fetch("/api/user/information", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        "password-old": oldPassword,
        "password-new": newPassword,
      }),
    });
    const data = await response.json();
    if (data.ok) {
      reset();
      popUp.classList.remove("none");
      normalMessage.textContent = "密碼修改成功！";
      normalMessage.classList.remove("none");
    } else {
      popUp.classList.remove("none");
      errorImage.classList.remove("none");
      errorMessage.textContent = data.message;
      errorMessage.classList.remove("none");
    }
  } catch (error) {
    console.log("error", error);
  }
});

// 關閉彈跳視窗
closePop.addEventListener("click", () => {
  popUp.classList.add("none");
  errorImage.classList.add("none");
  errorMessage.textContent = "";
  errorMessage.classList.add("none");
  normalMessage.textContent = "";
  normalMessage.classList.add("none");
});
