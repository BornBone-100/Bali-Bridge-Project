import { signInWithGoogle } from "./supabase-google-auth.js";

function init() {
  document.querySelectorAll("[data-google-signin]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      void signInWithGoogle();
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
