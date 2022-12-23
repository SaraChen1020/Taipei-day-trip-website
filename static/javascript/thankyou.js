const path = location.href;
const orderNumber = path.split("=")[1];
const orderMessage = document.querySelector(".order-message");
const orderNumberText = document.querySelector(".order-number");
const orderPage = document.querySelector(".order-page");

window.onload = async () => {
  await checkSigninStatus();
  if (signinStatus) {
    loadData();
  } else {
    document.location.href = "/";
  }
};

async function loadData() {
  try {
    const response = await fetch(`/api/order/${orderNumber}`);
    const data = await response.json();
    const result = data.data;
    if (result) {
      orderNumberText.textContent = orderNumber;
      orderPage.href = `/order/${orderNumber}`;
    } else {
      document.location.href = "/";
    }
    if (result.status == "付款成功") {
      orderMessage.textContent = "行程預定成功(≧▽≦)";
    } else {
      orderMessage.textContent = "行程預定失敗(｡ŏ_ŏ)";
    }
  } catch (error) {
    console.log("error", error);
  }
}
