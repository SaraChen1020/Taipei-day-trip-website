const dark = document.querySelector(".dark");
const sign = document.querySelector(".sign");
const signout = document.querySelector(".signout");
const signin = document.querySelector(".signin");
const signup = document.querySelector(".signup");
const exits = document.querySelectorAll(".exit");
const signinButton = document.querySelector(".signin-button");
const signupButton = document.querySelector(".signup-button");
const signoutButton = document.querySelector(".signout");

checkSigninStatus();

function signInOpen() {
  dark.classList.remove("none");
  signin.classList.remove("none");
  signup.classList.add("none");
}

function signUpOpen() {
  signin.classList.add("none");
  signup.classList.remove("none");
}

for (let exit of exits) {
  exit.addEventListener("click", function () {
    signin.classList.add("none");
    signup.classList.add("none");
    dark.classList.toggle("none");
  });
}

function checkSigninStatus() {
  fetch("/api/user/auth")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      let result = data.data;
      if (result != null) {
        sign.classList.add("none");
        signout.classList.remove("none");
      } else {
        sign.classList.remove("none");
        signout.classList.add("none");
      }
    });
}

signinButton.addEventListener("click", function () {
  const email = document.querySelector("#signin-email").value;
  const password = document.querySelector("#signin-password").value;

  fetch("/api/user/auth", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: email, password: password }),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data["ok"]) {
        console.log("登入成功");
        sign.classList.add("none");
        signout.classList.remove("none");
        signin.classList.add("none");
        dark.classList.add("none");
      } else if (data["error"]) {
        console.log(data["message"]); //印出對應的錯誤訊息
      }
    })
    .catch(function (error) {
      console.log("error", error);
    });
});

signupButton.addEventListener("click", function () {
  const name = document.querySelector("#signup-name").value;
  const email = document.querySelector("#signup-email").value;
  const password = document.querySelector("#signup-password").value;

  fetch("/api/user", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: name, email: email, password: password }),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data["ok"]) {
        console.log("註冊成功");
        signup.classList.add("none");
        dark.classList.add("none");
      } else if (data["error"]) {
        console.log(data["message"]);
      }
    })
    .catch(function (error) {
      console.log("error", error);
    });
});

signoutButton.addEventListener("click", function () {
  fetch("/api/user/auth", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data["ok"]) {
        checkSigninStatus();
      }
    });
});
