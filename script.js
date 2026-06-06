const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const subscribeForm = document.querySelector(".subscribe-form");
const savedTheme = localStorage.getItem("blog-theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeIcon.textContent = "☀";
}

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("blog-theme", isDark ? "dark" : "light");
  themeIcon.textContent = isDark ? "☀" : "☾";
});

subscribeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = new FormData(subscribeForm).get("email");
  const button = subscribeForm.querySelector("button");

  if (!email) {
    button.textContent = "请输入邮箱";
    return;
  }

  button.textContent = "已收到";
  subscribeForm.reset();

  window.setTimeout(() => {
    button.textContent = "订阅";
  }, 1800);
});
