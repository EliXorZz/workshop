const API = "http://localhost:3001/api";

if (sessionStorage.getItem("tatina_token")) {
  location.href = "dashboard.html";
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn  = e.target.querySelector("button[type='submit']");
  const note = document.getElementById("loginNote");
  const orig = btn.innerHTML;

  btn.innerHTML = "Connexion…";
  btn.disabled  = true;

  try {
    const res  = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: document.getElementById("user").value.trim(),
        password: document.getElementById("pass").value,
      }),
    });
    const json = await res.json();

    if (res.ok) {
      sessionStorage.setItem("tatina_token", json.token);
      note.textContent = "Container déverrouillé…";
      note.classList.add("is-ok");
      setTimeout(() => location.href = "dashboard.html", 500);
    } else {
      note.textContent = json.error || "Identifiants incorrects.";
      note.classList.remove("is-ok");
      note.classList.add("is-err");
      btn.innerHTML = orig;
      btn.disabled  = false;
    }
  } catch {
    note.textContent = "Serveur inaccessible. Vérifie que l'API tourne sur le port 3001.";
    note.classList.add("is-err");
    btn.innerHTML = orig;
    btn.disabled  = false;
  }
});
