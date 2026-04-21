// HTML Elemente holen
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const registerRole = document.getElementById("registerRole");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const authMessage = document.getElementById("authMessage");

// Event Listener für Login Button
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
        // Token, Benutzername und Rolle im localStorage speichern
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);
        // Weiterleitung zur index.html bzw. Startseite
        window.location.href = "index.html";
    } else {
        // Fehlermeldung anzeigen
        authMessage.textContent = data.message;
    }
});
// Event Listener für Registrieren Button
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
    // Fehlermeldung oder Erfolgsmeldung anzeigen
    authMessage.textContent = data.message;
});