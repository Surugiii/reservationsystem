import { supabase } from "./supabasecon.js";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const closeBtn = document.getElementById("closeBtn");

// Close button → go back to home
closeBtn.addEventListener("click", () => {
  window.location.href = "home.html";
});

// Handle login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // Query admins table
  const { data, error } = await supabase
    .from("admins")
    .select("role")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (error || !data) {
    loginMessage.textContent = "❌ Invalid username or password";
    loginMessage.className = "message error";
    loginMessage.style.display = "block";
    return;
  }

  // Redirect based on role
  if (data.role === "HeadAdmin") {
    window.location.href = "admin.html";
  } else if (data.role === "Admin") {
    window.location.href = "adminsched.html";
  }
});