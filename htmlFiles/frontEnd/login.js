const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const registerRole = document.getElementById("registerRole");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const authMessage = document.getElementById("authMessage");

loginBtn.addEventListener("click", async function () {
    const response = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        username: loginUsername.value,
        password: loginPassword.value
    })
    });

    const data = await response.json();

    if (response.ok) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    localStorage.setItem("role", data.role);
    window.location.href = "index.html";
    } else {
    authMessage.textContent = data.message;
    }
});

registerBtn.addEventListener("click", async function () {
    const response = await fetch("http://localhost:3000/api/register", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        username: loginUsername.value,
        password: loginPassword.value,
        role: registerRole.value
    })
    });

    const data = await response.json();
    authMessage.textContent = data.message;
});