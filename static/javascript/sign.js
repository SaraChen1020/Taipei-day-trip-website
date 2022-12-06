const dark = document.querySelector(".dark");
const sign = document.querySelector(".sign");
const signout = document.querySelector(".signout");
const signin = document.querySelector(".signin");
const signup = document.querySelector(".signup");
const exits = document.querySelectorAll(".exit");
const signinButton = document.querySelector(".signin-button");
const signupButton = document.querySelector(".signup-button");
const signoutButton = document.querySelector(".signout");
const signinError = document.querySelector("#signin-error");
const signupSuccess = document.querySelector(".success");
const signupError = document.querySelector("#signup-error");
const currentPath = location.pathname;

checkSigninStatus();

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

function checkSigninStatus() {
  fetch("/api/user/auth")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      let result = data.data;
      if (result != null) {
        signout.classList.remove("none");
        sign.classList.add("none");
      } else {
        sign.classList.remove("none");
        signout.classList.add("none");
      }
    });
}

signinButton.addEventListener("click", function () {
  let email = document.querySelector("#signin-email").value;
  let password = document.querySelector("#signin-password").value;

  fetch("/api/user/auth", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: email, password: password }),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.ok) {
        document.location.href = currentPath;
      } else if (data.error) {
        signinError.classList.remove("none");
        signinError.textContent = data.message;
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
      if (data.ok) {
        signupSuccess.classList.remove("none");
        signupError.classList.add("none");
      } else if (data.error) {
        signupSuccess.classList.add("none");
        signupError.classList.remove("none");
        signupError.textContent = data.message;
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
      if (data.ok) {
        document.location.href = currentPath;
      }
    });
});

function checkValid(element, checkRule) {
  if (checkRule == "email") {
    checkRule =
      /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
  } else if (checkRule == "password") {
    checkRule = /^[A-Za-z\d]{6,12}$/;
  } else if (checkRule == "name") {
    checkRule = /^[\u4e00-\u9fa5_a-zA-Z0-9_]{2,20}$/;
  }

  let regex = new RegExp(checkRule);
  if (!regex.test(element.value)) {
    element.style.backgroundImage = "url(/images/error.png)";
  } else {
    element.style.backgroundImage = "url(/images/check.png)";
  }
}
