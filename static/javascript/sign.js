const dark = document.querySelector(".dark");
const sign = document.querySelector(".sign");
const memberIcon = document.querySelector(".member-icon");
const memberList = document.querySelector(".member-list");
const memberInfoSite = document.querySelector(".member-info-site");
const signout = document.querySelector(".signout");
const signin = document.querySelector(".signin");
const signup = document.querySelector(".signup");
const exits = document.querySelectorAll(".exit");
const signinButton = document.querySelector(".signin-button");
const signupButton = document.querySelector(".signup-button");
const signoutButton = document.querySelector(".signout");
const ruleTexts = document.querySelectorAll(".rule-text");
const signinError = document.querySelector("#signin-error");
const signupSuccess = document.querySelector(".success");
const signupError = document.querySelector("#signup-error");
const schedule = document.querySelector(".schedule");
const currentPath = location.pathname;
let memberName;
let memberEmail;
let signinStatus = false;

// 會員登入狀態確認
async function checkSigninStatus() {
  try {
    const response = await fetch("/api/user/auth");
    const data = await response.json();
    const result = data.data;
    if (result != null) {
      memberName = result.name;
      memberEmail = result.email;
      memberIcon.classList.remove("none");
      sign.classList.add("none");
      signinStatus = true;
    } else {
      sign.classList.remove("none");
      memberIcon.classList.add("none");
    }
  } catch (error) {
    console.log("error", error);
  }
}

function signInOpen() {
  dark.classList.remove("none");
  signin.classList.remove("none");
  signup.classList.add("none");
}

function signUpOpen() {
  signup.classList.remove("none");
}

for (let exit of exits) {
  exit.addEventListener("click", function () {
    signin.classList.add("none");
    signup.classList.add("none");
    dark.classList.add("none");
  });
}

signinButton.addEventListener("click", async () => {
  const email = document.querySelector("#signin-email").value;
  const password = document.querySelector("#signin-password").value;
  try {
    const response = await fetch("/api/user/auth", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: email, password: password }),
    });
    const data = await response.json();
    if (data.ok) {
      document.location.href = currentPath;
    } else if (data.error) {
      signinError.classList.remove("none");
      signinError.textContent = data.message;
    }
  } catch (error) {
    console.log("error", error);
  }
});

signupButton.addEventListener("click", async () => {
  const name = document.querySelector("#signup-name").value;
  const email = document.querySelector("#signup-email").value;
  const password = document.querySelector("#signup-password").value;

  try {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name, email: email, password: password }),
    });
    const data = await response.json();
    if (data.ok) {
      signupSuccess.classList.remove("none");
      signupError.classList.add("none");
    } else if (data.error) {
      signupSuccess.classList.add("none");
      signupError.classList.remove("none");
      signupError.textContent = data.message;
    }
  } catch (error) {
    console.log("error", error);
  }
});

signoutButton.addEventListener("click", async () => {
  try {
    const response = await fetch("/api/user/auth", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
    });
    const data = await response.json();
    if (data.ok) {
      signinStatus = false;
      document.location.href = currentPath;
    }
  } catch (error) {
    console.log("error", error);
  }
});

function showMemberList() {
  memberList.classList.remove("none");
}

function closeMemberList() {
  memberList.classList.add("none");
}

memberIcon.onmousemove = showMemberList;
memberInfoSite.onmousemove = showMemberList;
memberInfoSite.onmouseout = closeMemberList;
signout.onmousemove = showMemberList;
signout.onmouseout = closeMemberList;

// 驗證資料格式
function checkValid(element) {
  let checkRule = element.name;
  if (checkRule == "email") {
    checkRule =
      /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
  } else if (checkRule == "password") {
    checkRule = /^[A-Za-z\d]{6,12}$/;
    for (let ruleText of ruleTexts) {
      ruleText.classList.remove("none");
      ruleText.textContent = "密碼長度需為6-12個字元或數字";
    }
  } else if (checkRule == "name") {
    checkRule = /^[\u4e00-\u9fa5_a-zA-Z0-9_]{2,20}$/;
  } else if (checkRule == "phone") {
    checkRule = /^09\d{8}$/;
  }

  let regex = new RegExp(checkRule);
  if (!regex.test(element.value)) {
    element.style.backgroundImage = "url(/static/images/error.png)";
  } else {
    element.style.backgroundImage = "url(/static/images/check.png)";
    for (let ruleText of ruleTexts) {
      ruleText.classList.add("none");
    }
  }
}

schedule.addEventListener("click", () => {
  checkSigninStatus();
  if (signinStatus) {
    document.location.href = "/booking";
  } else {
    signInOpen();
  }
});
