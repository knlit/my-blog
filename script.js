const posts = [
  {
    title: "一次把旧项目整理清楚的重构清单",
    category: "工程实践",
    date: "2026.06.01",
    datetime: "2026-06-01",
    excerpt: "从目录结构、边界命名、测试补位到发布流程，记录一次让老项目重新变得可维护的过程。",
    tags: ["重构", "测试", "项目维护"],
    url: "#",
    featured: true,
  },
  {
    title: "好工具为什么总是让人少想一步",
    category: "产品观察",
    date: "2026.05.24",
    datetime: "2026-05-24",
    excerpt: "界面、默认值和反馈如何替用户减轻认知负担。",
    tags: ["产品", "体验", "效率"],
    url: "#",
  },
  {
    title: "读《纳瓦尔宝典》：复利不是口号",
    category: "阅读笔记",
    date: "2026.05.12",
    datetime: "2026-05-12",
    excerpt: "把长期主义拆成每天能执行的小动作。",
    tags: ["阅读", "长期主义", "成长"],
    url: "#",
  },
  {
    title: "给个人知识库做一次减法",
    category: "AI 与生产力",
    date: "2026.04.30",
    datetime: "2026-04-30",
    excerpt: "比起收集更多工具，先让笔记、任务和复盘回到一个能坚持的节奏。",
    tags: ["知识库", "AI", "工作流"],
    url: "#",
  },
  {
    title: "周末城市漫游：把路线留给直觉",
    category: "生活记录",
    date: "2026.04.12",
    datetime: "2026-04-12",
    excerpt: "一次没有计划的散步，以及那些被慢下来之后才看见的小细节。",
    tags: ["生活", "城市", "记录"],
    url: "#",
  },
];

const tracks = [
  { name: "8-bit midnight loop", notes: [392, 494, 587, 494, 440, 392, 330, 392] },
  { name: "coffee save point", notes: [262, 330, 392, 523, 392, 330, 294, 330] },
  { name: "tiny boss theme", notes: [196, 247, 294, 349, 294, 247, 220, 247] },
];

const articleGrid = document.querySelector("#articleGrid");
const articleCount = document.querySelector("#articleCount");
const resultCount = document.querySelector("#resultCount");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#postSearch");
const topicLinks = document.querySelectorAll("[data-topic]");
const subscribeForm = document.querySelector(".subscribe-form");
const heroPlay = document.querySelector(".hero-play");
const playerStatus = document.querySelector("#playerStatus");
const trackName = document.querySelector("#trackName");
const volumeControl = document.querySelector("#volumeControl");
const toggleButton = document.querySelector("[data-action='toggle']");
const prevButton = document.querySelector("[data-action='prev']");
const nextButton = document.querySelector("[data-action='next']");

let audioContext;
let gainNode;
let timerId;
let noteIndex = 0;
let trackIndex = 0;
let isPlaying = false;

function renderPosts(query = "") {
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

function ensureAudio() {
  if (audioContext) return;

  audioContext = new AudioContext();
  gainNode = audioContext.createGain();
  gainNode.gain.value = Number(volumeControl.value) / 100;
  gainNode.connect(audioContext.destination);
}

function playNote(frequency, duration = 0.16) {
  const oscillator = audioContext.createOscillator();
  const noteGain = audioContext.createGain();
  const now = audioContext.currentTime;

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(frequency, now);
  noteGain.gain.setValueAtTime(0.0001, now);
  noteGain.gain.exponentialRampToValueAtTime(0.24, now + 0.01);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(noteGain).connect(gainNode);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

function tickTrack() {
  const track = tracks[trackIndex];
  playNote(track.notes[noteIndex % track.notes.length]);
  noteIndex += 1;
}

function startPlayer() {
  ensureAudio();

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  if (isPlaying) return;

  isPlaying = true;
  toggleButton.textContent = "▮▮";
  playerStatus.textContent = "PLAYING";
  tickTrack();
  timerId = window.setInterval(tickTrack, 220);
}

function stopPlayer() {
  isPlaying = false;
  toggleButton.textContent = "▶";
  playerStatus.textContent = "PAUSED";
  window.clearInterval(timerId);
}

function changeTrack(direction) {
  stopPlayer();
  noteIndex = 0;
  trackIndex = (trackIndex + direction + tracks.length) % tracks.length;
  trackName.textContent = tracks[trackIndex].name;
  playerStatus.textContent = "READY";
}

searchInput.addEventListener("input", (event) => {
  renderPosts(event.target.value);
});

topicLinks.forEach((link) => {
  link.addEventListener("click", () => {
    searchInput.value = link.dataset.topic;
    renderPosts(link.dataset.topic);
  });
});

toggleButton.addEventListener("click", () => {
  if (isPlaying) {
    stopPlayer();
  } else {
    startPlayer();
  }
});

heroPlay.addEventListener("click", startPlayer);
prevButton.addEventListener("click", () => changeTrack(-1));
nextButton.addEventListener("click", () => changeTrack(1));

volumeControl.addEventListener("input", () => {
  if (gainNode) {
    gainNode.gain.value = Number(volumeControl.value) / 100;
  }
});

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

trackName.textContent = tracks[trackIndex].name;
renderPosts();
