const posts = [
  {
    title: "一次把旧项目整理清楚的重构清单",
    category: "工程实践",
    date: "2026.06.01",
    datetime: "2026-06-01",
    excerpt: "从目录结构、边界命名、测试补位到发布流程，记录一次让老项目重新变得可维护的过程。",
    tags: ["重构", "测试", "项目维护"],
    url: "posts/refactor-checklist.html",
    featured: true,
  },
  {
    title: "好工具为什么总是让人少想一步",
    category: "产品观察",
    date: "2026.05.24",
    datetime: "2026-05-24",
    excerpt: "界面、默认值和反馈如何替用户减轻认知负担。",
    tags: ["产品", "体验", "效率"],
    url: "posts/tool-thinking.html",
  },
  {
    title: "读《纳瓦尔宝典》：复利不是口号",
    category: "阅读笔记",
    date: "2026.05.12",
    datetime: "2026-05-12",
    excerpt: "把长期主义拆成每天能执行的小动作。",
    tags: ["阅读", "长期主义", "成长"],
    url: "posts/naval-compound-interest.html",
  },
  {
    title: "给个人知识库做一次减法",
    category: "AI 与生产力",
    date: "2026.04.30",
    datetime: "2026-04-30",
    excerpt: "比起收集更多工具，先让笔记、任务和复盘回到一个能坚持的节奏。",
    tags: ["知识库", "AI", "工作流"],
    url: "posts/knowledge-base-pruning.html",
  },
  {
    title: "周末城市漫游：把路线留给直觉",
    category: "生活记录",
    date: "2026.04.12",
    datetime: "2026-04-12",
    excerpt: "一次没有计划的散步，以及那些被慢下来之后才看见的小细节。",
    tags: ["生活", "城市", "记录"],
    url: "posts/city-walk.html",
  },
];

const tracks = [
  { name: "8-bit 《稻香》", src: "assets/audio/daoxiang-8bit.wav" },
  { name: "8-bit 《七里香》", src: "assets/audio/qilixiang-8bit.wav" },
  { name: "8-bit 《晴天》", src: "assets/audio/qingtian-8bit.wav" },
  { name: "8-bit 《Super Star》", src: "assets/audio/super-star-8bit.wav" },
  { name: "8-bit 《宝可梦-未白镇》", src: "assets/audio/pokemon-weibai-town-8bit.wav" },
  { name: "8-bit 《海阔天空》", src: "assets/audio/haikuotiankong-8bit.wav" },
  { name: "8-bit 《开心超人》", src: "assets/audio/kaixinchaoren-8bit.wav" },
  { name: "8-bit 《突然的自我》", src: "assets/audio/turandezhiwo-8bit.wav" },
];

const themeToggle = document.querySelector(".theme-toggle");
const playerStatus = document.querySelector("#playerStatus");
const trackName = document.querySelector("#trackName");
const volumeControl = document.querySelector("#volumeControl");
const toggleButton = document.querySelector("[data-action='toggle']");
const prevButton = document.querySelector("[data-action='prev']");
const nextButton = document.querySelector("[data-action='next']");

let trackIndex = 0;
let isPlaying = false;
let audioElement;
const shufflePlayback = true;
let autoplayRequested = true;

function applyTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("light-theme", isLight);

  if (!themeToggle) return;

  const icon = themeToggle.querySelector("img");
  if (icon) {
    icon.src = isLight ? "assets/icons/theme-moon.png" : "assets/icons/theme-star.png";
  }
  themeToggle.setAttribute("aria-label", `切换到${isLight ? "夜间" : "日间"}主题`);
}

function renderPosts(query = "") {
  const articleGrid = document.querySelector("#articleGrid");
  const articleCount = document.querySelector("#articleCount");
  const resultCount = document.querySelector("#resultCount");
  const emptyState = document.querySelector("#emptyState");
  if (!articleGrid || !articleCount || !resultCount || !emptyState) return;

  const normalizedQuery = query.trim().toLowerCase();
  const filteredPosts = posts.filter((post) => {
    const searchable = [post.title, post.category, post.excerpt, ...post.tags].join(" ").toLowerCase();
    return searchable.includes(normalizedQuery);
  });

  articleGrid.innerHTML = filteredPosts
    .map(
      (post) => `
        <article class="post-card${post.featured ? " featured" : ""}">
          <div class="post-meta">
            <span>${post.category}</span>
            <time datetime="${post.datetime}">${post.date}</time>
          </div>
          <h3>${post.title}</h3>
          <p>${post.excerpt}</p>
          <div class="post-tags">
            ${post.tags.map((tag) => `<span>#${tag}</span>`).join("")}
          </div>
          <a href="${post.url}" aria-label="阅读：${post.title}">继续阅读 ▸</a>
        </article>
      `
    )
    .join("");

  articleCount.textContent = String(posts.length).padStart(2, "0");
  resultCount.textContent = normalizedQuery
    ? `找到 ${filteredPosts.length} / ${posts.length} 篇文章`
    : `共 ${posts.length} 篇文章`;
  emptyState.hidden = filteredPosts.length > 0;
}

function renderLatestPostsMarquee() {
  const latestPostsMarquee = document.querySelector("#latestPostsMarquee");
  if (!latestPostsMarquee) return;

  const latestPosts = posts.slice(0, 5);
  const marqueeItems = latestPosts
    .map(
      (post) => `
        <a class="marquee-item" href="${post.url}" aria-label="阅读：${post.title}">
          <span class="marquee-category">${post.category}</span>
          <span class="marquee-title">${post.title}</span>
          <time class="marquee-date" datetime="${post.datetime}">${post.date}</time>
        </a>
      `
    )
    .join("");

  latestPostsMarquee.innerHTML = marqueeItems + marqueeItems;
}

function ensureAudio() {
  if (!volumeControl) return null;
  if (audioElement) return audioElement;

  audioElement = new Audio(tracks[trackIndex].src);
  audioElement.preload = "metadata";
  audioElement.volume = Number(volumeControl.value) / 100;
  audioElement.addEventListener("ended", () => changeTrack(1, true));
  return audioElement;
}

function loadTrack() {
  const audio = ensureAudio();
  if (!audio) return;

  audio.src = tracks[trackIndex].src;
  audio.load();
  if (trackName) trackName.textContent = tracks[trackIndex].name;
}

function getRandomTrackIndex() {
  if (tracks.length <= 1) return trackIndex;

  let nextIndex = trackIndex;
  while (nextIndex === trackIndex) {
    nextIndex = Math.floor(Math.random() * tracks.length);
  }
  return nextIndex;
}

function getNextTrackIndex(direction) {
  if (shufflePlayback && direction > 0) return getRandomTrackIndex();
  return (trackIndex + direction + tracks.length) % tracks.length;
}

function startPlayer() {
  if (!toggleButton || !playerStatus) return;
  const audio = ensureAudio();
  if (!audio) return;

  if (isPlaying) return;

  isPlaying = true;
  toggleButton.textContent = "▮▮";
  playerStatus.textContent = "LOADING";

  audio
    .play()
    .then(() => {
      playerStatus.textContent = "PLAYING";
    })
    .catch(() => {
      isPlaying = false;
      toggleButton.textContent = "▶";
      playerStatus.textContent = autoplayRequested ? "CLICK PLAY" : "READY";
    });
}

function stopPlayer() {
  isPlaying = false;
  if (toggleButton) toggleButton.textContent = "▶";
  if (playerStatus) playerStatus.textContent = "PAUSED";
  if (audioElement) audioElement.pause();
}

function changeTrack(direction, shouldAutoplay = false) {
  if (!trackName || !playerStatus) return;
  const wasPlaying = isPlaying || shouldAutoplay;
  if (audioElement) audioElement.pause();
  isPlaying = false;
  if (toggleButton) toggleButton.textContent = "▶";
  trackIndex = getNextTrackIndex(direction);
  playerStatus.textContent = "READY";
  loadTrack();

  if (wasPlaying) startPlayer();
}

function hydratePage() {
  const searchInput = document.querySelector("#postSearch");
  const topicLinks = document.querySelectorAll("[data-topic]");
  const subscribeForm = document.querySelector(".subscribe-form");

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      renderPosts(event.target.value);
    });
  }

  topicLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (!searchInput) return;
      searchInput.value = link.dataset.topic;
      renderPosts(link.dataset.topic);
    });
  });

  if (subscribeForm) {
    subscribeForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = new FormData(subscribeForm).get("email");
      const button = subscribeForm.querySelector("button");

      if (!email) {
        button.textContent = "请输入邮箱";
        return;
      }

      button.textContent = "已发送";
      subscribeForm.reset();

      window.setTimeout(() => {
        button.textContent = "发送";
      }, 1800);
    });
  }

  renderLatestPostsMarquee();
  renderPosts();
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
    localStorage.setItem("blog-theme", nextTheme);
    applyTheme(nextTheme);
  });
}

if (toggleButton) {
  toggleButton.addEventListener("click", () => {
    autoplayRequested = false;
    removeAutoplayUnlockListeners();
    if (isPlaying) {
      stopPlayer();
    } else {
      startPlayer();
    }
  });
}

if (prevButton) prevButton.addEventListener("click", () => changeTrack(-1));
if (nextButton) nextButton.addEventListener("click", () => changeTrack(1));

if (volumeControl) {
  volumeControl.addEventListener("input", () => {
    if (audioElement) {
      audioElement.volume = Number(volumeControl.value) / 100;
    }
  });
}

function isSameSitePage(url) {
  if (url.origin !== window.location.origin) return false;
  const path = url.pathname.toLowerCase();
  return path.endsWith("/") || path.endsWith(".html");
}

function normalizeInternalUrl(url) {
  if (url.pathname.endsWith("/")) {
    return new URL(`index.html${url.hash}`, url);
  }
  return url;
}

function syncPageShell(doc) {
  const themeClass = document.body.classList.contains("light-theme") ? "light-theme" : "";
  document.body.className = doc.body.className;
  if (themeClass) document.body.classList.add(themeClass);

  const player = document.querySelector(".music-player");
  if (player) {
    player.hidden = !doc.querySelector(".music-player");
  }
}

async function visitPage(url, shouldPushState = true) {
  const targetUrl = normalizeInternalUrl(url);
  const response = await fetch(targetUrl.href);
  if (!response.ok) throw new Error("Page request failed");

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const nextMain = doc.querySelector("main");
  const nextFooter = doc.querySelector(".site-footer");
  const routeBase = doc.querySelector("base")
    ? new URL(doc.querySelector("base").getAttribute("href"), targetUrl.href)
    : targetUrl;
  const currentMain = document.querySelector("main");
  const currentFooter = document.querySelector(".site-footer");

  if (!nextMain || !currentMain) {
    window.location.href = targetUrl.href;
    return;
  }

  document.title = doc.title;
  syncPageShell(doc);
  nextMain.querySelectorAll("a[href]").forEach((link) => {
    link.href = new URL(link.getAttribute("href"), routeBase).href;
  });
  currentMain.replaceWith(nextMain);
  if (nextFooter && currentFooter) currentFooter.replaceWith(nextFooter);

  hydratePage();

  if (shouldPushState) {
    history.pushState({ path: targetUrl.href }, "", targetUrl.href);
  }

  if (targetUrl.hash) {
    document.querySelector(targetUrl.hash)?.scrollIntoView();
  } else {
    window.scrollTo({ top: 0 });
  }
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link || link.target || link.hasAttribute("download")) return;

  const url = new URL(link.getAttribute("href"), window.location.href);
  if (!isSameSitePage(url)) return;
  if (normalizeInternalUrl(url).pathname === normalizeInternalUrl(new URL(window.location.href)).pathname && url.hash) return;

  event.preventDefault();
  visitPage(url).catch(() => {
    window.location.href = url.href;
  });
});

window.addEventListener("popstate", () => {
  visitPage(new URL(window.location.href), false).catch(() => {
    window.location.reload();
  });
});

function removeAutoplayUnlockListeners() {
  for (const eventName of ["pointerdown", "keydown", "touchstart"]) {
    document.removeEventListener(eventName, unlockAutoplayOnFirstInteraction);
  }
}

function unlockAutoplayOnFirstInteraction(event) {
  if (!autoplayRequested || isPlaying) return;
  if (event.target.closest?.(".music-player")) return;
  startPlayer();
  removeAutoplayUnlockListeners();
}

for (const eventName of ["pointerdown", "keydown", "touchstart"]) {
  document.addEventListener(eventName, unlockAutoplayOnFirstInteraction, { passive: true });
}

applyTheme(localStorage.getItem("blog-theme") || "dark");
if (trackName) trackName.textContent = tracks[trackIndex].name;
loadTrack();
startPlayer();
hydratePage();
