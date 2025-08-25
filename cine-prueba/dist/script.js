// api/subscribe.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Falta email" });

  const response = await fetch(
    `https://us21.api.mailchimp.com/3.0/lists/${process.env.MC_LIST_ID}/members`,
    {
      method: "POST",
      headers: {
        "Authorization": `apikey ${process.env.MC_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email_address: email, status: "subscribed" })
    }
  );

  if (response.ok) {
    res.status(200).json({ success: true });
  } else {
    const err = await response.json();
    res.status(400).json(err);
  }
}
// ==========================
// Escena Secreta JS
// ==========================

// Variables globales
const grid = document.getElementById("grid");
const empty = document.getElementById("empty");
const sectionTitle = document.getElementById("sectionTitle");
const sentinel = document.getElementById("sentinel");
const sentinelSpinner = document.getElementById("sentinelSpinner");

let currentPage = 1;
let currentTab = "trending";
let currentQuery = "";
let isLoading = false;
let watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");

// Internet Archive API
const ARCHIVE_BASE = "https://archive.org/advancedsearch.php";
const ARCHIVE_FIELDS = ["identifier", "title", "description", "date", "mediatype"];

// ==========================
// Funciones de API
// ==========================
async function fetchResults(page = 1) {
  isLoading = true;
  sentinelSpinner.hidden = false;

  let query = currentQuery || "movie";
  if (currentTab === "series") query = "tv OR television";
  if (currentTab === "trending") query = "classic movies";
  if (currentTab === "watchlist") {
    renderWatchlist();
    isLoading = false;
    sentinelSpinner.hidden = true;
    return;
  }

  const url = `${ARCHIVE_BASE}?q=${encodeURIComponent(query)}&fl[]=${ARCHIVE_FIELDS.join("&fl[]=")}&rows=20&page=${page}&output=json`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (page === 1) grid.innerHTML = "";

    if (!data.response.docs.length) {
      empty.hidden = false;
    } else {
      empty.hidden = true;
      data.response.docs.forEach(renderCard);
    }
  } catch (err) {
    console.error("Error cargando datos:", err);
  }

  isLoading = false;
  sentinelSpinner.hidden = true;
}

// ==========================
// Renderizado de tarjetas
// ==========================
function renderCard(item) {
  const card = document.createElement("div");
  card.className = "card";

  const poster = `https://archive.org/services/img/${item.identifier}`;
  card.innerHTML = `
    <img class="poster" src="${poster}" alt="${item.title}">
    <div class="meta">
      <h3 class="title">${item.title}</h3>
      <p class="muted">${item.date || "Sin fecha"}</p>
      <div class="actions">
        <button class="btn play" data-id="${item.identifier}">Ver</button>
        <button class="btn save" data-id="${item.identifier}">+ Mi lista</button>
      </div>
    </div>
  `;

  grid.appendChild(card);
}

// ==========================
// Watchlist (Mi lista)
// ==========================
function renderWatchlist() {
  grid.innerHTML = "";
  sectionTitle.textContent = "Mi lista";

  if (!watchlist.length) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  watchlist.forEach(id => {
    renderCard({ identifier: id, title: id, date: "—" });
  });
}

// ==========================
// Reproductor modal
// ==========================
const player = document.getElementById("player");
const video = document.getElementById("video");
const playerMetaTitle = document.getElementById("playerMetaTitle");
const playerMetaDesc = document.getElementById("playerMetaDesc");
const playerDate = document.getElementById("playerDate");
const sourceChooser = document.getElementById("sourceChooser");
const openOnArchive = document.getElementById("openOnArchive");

async function openPlayer(id) {
  const url = `https://archive.org/metadata/${id}`;
  const res = await fetch(url);
  const data = await res.json();

  playerMetaTitle.textContent = data.metadata.title || id;
  playerMetaDesc.textContent = data.metadata.description || "";
  playerDate.textContent = data.metadata.date || "—";
  openOnArchive.onclick = () => window.open(`https://archive.org/details/${id}`, "_blank");

  // Archivos de video disponibles
  sourceChooser.innerHTML = "";
  let file = data.files.find(f => f.format.includes("MP4") || f.format.includes("Ogg"));
  if (file) {
    video.src = `https://archive.org/download/${id}/${file.name}`;
  }

  data.files.filter(f => f.format.includes("MP4") || f.format.includes("Ogg"))
    .forEach(f => {
      const btn = document.createElement("button");
      btn.className = "chip";
      btn.textContent = f.format;
      btn.onclick = () => video.src = `https://archive.org/download/${id}/${f.name}`;
      sourceChooser.appendChild(btn);
    });

  player.showModal();
}

// ==========================
// Eventos
// ==========================

// Tabs
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-selected", "false"));
    tab.setAttribute("aria-selected", "true");
    currentTab = tab.dataset.tab;
    currentPage = 1;
    fetchResults();
  });
});

// Buscar
document.getElementById("searchForm").addEventListener("submit", e => {
  e.preventDefault();
  currentQuery = document.getElementById("q").value;
  currentPage = 1;
  fetchResults();
});

// Click en tarjetas
grid.addEventListener("click", e => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains("play")) {
    openPlayer(id);
  } else if (e.target.classList.contains("save")) {
    if (!watchlist.includes(id)) {
      watchlist.push(id);
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
      alert("Añadido a tu lista");
    }
  }
});

// Cerrar player
document.getElementById("closePlayer").onclick = () => player.close();

// ==========================
// Scroll infinito
// ==========================
const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !isLoading && currentTab !== "watchlist") {
    currentPage++;
    fetchResults(currentPage);
  }
});
observer.observe(sentinel);

// ==========================
// Suscripción (emails fake)
// ==========================
const subscribe = document.getElementById("subscribe");
const openSubscribe = document.getElementById("openSubscribe");
const closeSubscribe = document.getElementById("closeSubscribe");
const bannerSubscribeBtn = document.getElementById("bannerSubscribeBtn");
const bannerCloseBtn = document.getElementById("bannerCloseBtn");
const subscribeBanner = document.getElementById("subscribeBanner");
let subscribers = [];

openSubscribe.onclick = () => subscribe.showModal();
closeSubscribe.onclick = () => subscribe.close();
bannerSubscribeBtn.onclick = () => subscribe.showModal();
bannerCloseBtn.onclick = () => subscribeBanner.style.display = "none";

document.getElementById("subscribeForm").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("emailInput").value;
  subscribers.push(email);
  alert("¡Gracias por suscribirte!");
  subscribe.close();
  subscribeBanner.style.display = "none";
});

// Exportar emails CSV
document.getElementById("exportCSV").onclick = () => {
  const csv = "emails\n" + subscribers.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "subscribers.csv";
  a.click();
};

// ==========================
// Inicial
// ==========================
fetchResults();
setTimeout(() => subscribeBanner.style.display = "block", 6000);
// ========== CONFIG ==========
const API_KEY = "e4257a3d883f9627bd489d59ebe42883";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

let currentPage = 1;
let currentQuery = "";
let isLoading = false;

// DOM
const grid = document.getElementById("grid");
const sentinel = document.getElementById("sentinel");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const tabs = document.querySelectorAll(".tab");

// ========== FETCH ==========
async function fetchMovies(page = 1, query = "") {
  let url;
  if (query) {
    url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}&page=${page}`;
  } else {
    url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=es-ES&page=${page}`;
  }

  try {
    isLoading = true;
    showLoading(true);
    const res = await fetch(url);
    const data = await res.json();
    showLoading(false);
    isLoading = false;
    return data.results || [];
  } catch (err) {
    console.error("Error al obtener datos:", err);
    showLoading(false);
    isLoading = false;
    return [];
  }
}

// ========== RENDER ==========
function renderMovies(movies, reset = false) {
  if (reset) grid.innerHTML = "";

  if (!movies.length && reset) {
    grid.innerHTML = `<p class="empty">No se encontraron resultados</p>`;
    return;
  }

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img class="poster" src="${movie.poster_path ? IMG_URL + movie.poster_path : 'https://via.placeholder.com/300x450?text=Sin+Imagen'}" alt="${movie.title}">
      <div class="meta">
        <h3 class="title">${movie.title}</h3>
        <p class="muted">${(movie.release_date || "").slice(0,4) || "----"}</p>
        <div class="actions">
          <button class="btn play">▶ Ver</button>
          <button class="btn save">＋ Lista</button>
        </div>
      </div>
    `;
    card.querySelector(".play").addEventListener("click", () => openPlayer(movie));
    grid.appendChild(card);
  });
}

// ========== INFINITE SCROLL ==========
const observer = new IntersectionObserver(async (entries) => {
  if (entries[0].isIntersecting && !isLoading) {
    currentPage++;
    const movies = await fetchMovies(currentPage, currentQuery);
    renderMovies(movies);
  }
});
observer.observe(sentinel);

// ========== PLAYER ==========
const playerDialog = document.getElementById("player");
const playerTitle = document.getElementById("playerTitle");
const playerVideo = document.getElementById("playerVideo");
const playerDesc = document.getElementById("playerDesc");

function openPlayer(movie) {
  playerTitle.textContent = movie.title;
  playerDesc.textContent = movie.overview || "Sin descripción.";
  playerVideo.src = "https://www.w3schools.com/html/mov_bbb.mp4"; // DEMO
  playerDialog.showModal();
}
document.getElementById("closePlayer").onclick = () => {
  playerDialog.close();
  playerVideo.pause();
};

// ========== SEARCH ==========
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  currentQuery = searchInput.value.trim();
  currentPage = 1;
  const movies = await fetchMovies(currentPage, currentQuery);
  renderMovies(movies, true);
});

// ========== LOADING BAR ==========
function showLoading(show) {
  const bar = document.getElementById("loadingBar");
  bar.style.width = show ? "70%" : "100%";
  if (!show) setTimeout(() => bar.style.width = "0%", 400);
}

// ========== SUBSCRIBE ==========
const subscribeDialog = document.getElementById("subscribe");
const subscribeForm = document.getElementById("subscribeForm");
const subscribeBanner = document.getElementById("subscribeBanner");
const subClose = document.getElementById("closeSubscribe");
const subLater = document.getElementById("later");

subscribeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = subscribeForm.email.value.trim();
  if (!email) return;
  localStorage.setItem("subscriber", email);
  alert("¡Gracias por suscribirte! 🎉");
  subscribeDialog.close();
  subscribeBanner.style.display = "none";
});

subClose.onclick = () => subscribeDialog.close();
subLater.onclick = () => subscribeBanner.style.display = "none";

// Mostrar banner si no está suscrito
setTimeout(() => {
  if (!localStorage.getItem("subscriber")) {
    subscribeBanner.style.display = "block";
  }
}, 10000);

// ========== INIT ==========
(async function init() {
  const movies = await fetchMovies();
  renderMovies(movies, true);
})();
// ========== CONFIG ==========
const API_KEY = "e4257a3d883f9627bd489d59ebe42883";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

let currentPage = 1;
let currentQuery = "";
let isLoading = false;

// DOM
const grid = document.getElementById("grid");
const sentinel = document.getElementById("sentinel");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

// ========== FETCH MOVIES ==========
async function fetchMovies(page = 1, query = "") {
  let url;
  if (query) {
    url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}&page=${page}`;
  } else {
    url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=es-ES&page=${page}`;
  }

  try {
    isLoading = true;
    showLoading(true);
    const res = await fetch(url);
    const data = await res.json();
    showLoading(false);
    isLoading = false;
    return data.results || [];
  } catch (err) {
    console.error("Error al obtener datos:", err);
    showLoading(false);
    isLoading = false;
    return [];
  }
}

// ========== FETCH VIDEOS ==========
async function fetchVideo(movieId) {
  const url = `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=es-ES`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");
      if (trailer) {
        return `https://www.youtube.com/embed/${trailer.key}`;
      }
    }
  } catch (err) {
    console.error("Error obteniendo video:", err);
  }
  // fallback: dominio público de Internet Archive
  return "https://archive.org/download/BigBuckBunny_328/BigBuckBunny_512kb.mp4";
}

// ========== RENDER ==========
function renderMovies(movies, reset = false) {
  if (reset) grid.innerHTML = "";

  if (!movies.length && reset) {
    grid.innerHTML = `<p class="empty">No se encontraron resultados</p>`;
    return;
  }

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img class="poster" src="${movie.poster_path ? IMG_URL + movie.poster_path : 'https://via.placeholder.com/300x450?text=Sin+Imagen'}" alt="${movie.title}">
      <div class="meta">
        <h3 class="title">${movie.title}</h3>
        <p class="muted">${(movie.release_date || "").slice(0,4) || "----"}</p>
        <div class="actions">
          <button class="btn play">▶ Ver</button>
          <button class="btn save">＋ Lista</button>
        </div>
      </div>
    `;
    card.querySelector(".play").addEventListener("click", () => openPlayer(movie));
    grid.appendChild(card);
  });
}

// ========== INFINITE SCROLL ==========
const observer = new IntersectionObserver(async (entries) => {
  if (entries[0].isIntersecting && !isLoading) {
    currentPage++;
    const movies = await fetchMovies(currentPage, currentQuery);
    renderMovies(movies);
  }
});
observer.observe(sentinel);

// ========== PLAYER ==========
const playerDialog = document.getElementById("player");
const playerTitle = document.getElementById("playerTitle");
const playerVideo = document.getElementById("playerVideo");
const playerDesc = document.getElementById("playerDesc");

async function openPlayer(movie) {
  playerTitle.textContent = movie.title;
  playerDesc.textContent = movie.overview || "Sin descripción.";
  
  // Obtener trailer o video público
  const videoUrl = await fetchVideo(movie.id);

  if (videoUrl.includes("youtube")) {
    playerVideo.outerHTML = `<iframe id="playerVideo" width="100%" height="400" src="${videoUrl}" frameborder="0" allowfullscreen></iframe>`;
  } else {
    playerVideo.outerHTML = `<video id="playerVideo" controls autoplay width="100%"><source src="${videoUrl}" type="video/mp4"></video>`;
  }

  playerDialog.showModal();
}

document.getElementById("closePlayer").onclick = () => {
  playerDialog.close();
  const videoEl = document.getElementById("playerVideo");
  if (videoEl.tagName === "VIDEO") videoEl.pause();
};

// ========== SEARCH ==========
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  currentQuery = searchInput.value.trim();
  currentPage = 1;
  const movies = await fetchMovies(currentPage, currentQuery);
  renderMovies(movies, true);
});

// ========== LOADING BAR ==========
function showLoading(show) {
  const bar = document.getElementById("loadingBar");
  bar.style.width = show ? "70%" : "100%";
  if (!show) setTimeout(() => bar.style.width = "0%", 400);
}

// ========== INIT ==========
(async function init() {
  const movies = await fetchMovies();
  renderMovies(movies, true);
})();
// Config
const API_KEY = "e4257a3d883f9627bd489d59ebe42883";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

let currentPage = 1, currentTab = "trending", currentQuery = "", isLoading = false;
const grid = document.getElementById("grid");
const sentinel = document.getElementById("sentinel");

// TMDb fetch
async function fetchTMDb(type="trending", page=1, query="") {
  let url;
  if (type === "trending") url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=es-ES&page=${page}`;
  else if (type === "movies") url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&page=${page}`;
  else if (type === "series") url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=es-ES&page=${page}`;
  else if (query) url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}&page=${page}`;
  const res = await fetch(url);
  return (await res.json()).results || [];
}

// Archive.org fetch (clásicos)
async function fetchArchive(page=1) {
  const url = `https://archive.org/advancedsearch.php?q=collection%3Afeature_films&fl[]=identifier,title,description,creator&sort[]=downloads+desc&rows=20&page=${page}&output=json`;
  const res = await fetch(url);
  const data = await res.json();
  return data.response.docs.map(item => ({
    id: item.identifier,
    title: item.title,
    description: item.description || "Película clásica en dominio público.",
    poster: `https://archive.org/services/img/${item.identifier}`,
    archive: true
  }));
}

// Render
function render(items, reset=false) {
  if (reset) grid.innerHTML = "";
  items.forEach(it => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img class="poster" src="${it.poster_path ? IMG_URL+it.poster_path : it.poster}" alt="${it.title}">
      <div class="meta">
        <h3 class="title">${it.title || it.name}</h3>
        <p class="muted">${it.release_date ? it.release_date.slice(0,4) : ""}</p>
        <button class="btn play">▶ Ver</button>
      </div>
    `;
    card.querySelector(".play").onclick = () => openPlayer(it);
    grid.appendChild(card);
  });
}

// Player
const dialog = document.getElementById("player"), videoEl = document.getElementById("playerVideo"),
      playerTitle = document.getElementById("playerTitle"), playerDesc = document.getElementById("playerDesc");

async function openPlayer(item) {
  playerTitle.textContent = item.title || item.name;
  playerDesc.textContent = item.description || item.overview || "";
  if (item.archive) {
    videoEl.outerHTML = `<video id="playerVideo" controls autoplay><source src="https://archive.org/download/${item.id}/${item.id}.mp4" type="video/mp4"></video>`;
  } else {
    const url = `${BASE_URL}/movie/${item.id}/videos?api_key=${API_KEY}&language=es-ES`;
    const res = await fetch(url);
    const vids = (await res.json()).results;
    const trailer = vids.find(v => v.site==="YouTube");
    if (trailer) {
      videoEl.outerHTML = `<iframe id="playerVideo" width="100%" height="400" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>`;
    } else {
      videoEl.outerHTML = `<video id="playerVideo" controls autoplay><source src="https://archive.org/download/BigBuckBunny_328/BigBuckBunny_512kb.mp4" type="video/mp4"></video>`;
    }
  }
  dialog.showModal();
}
document.getElementById("closePlayer").onclick = () => dialog.close();

// Tabs
document.querySelectorAll(".tab").forEach(btn=>{
  btn.onclick=async()=>{
    document.querySelectorAll(".tab").forEach(t=>t.setAttribute("aria-selected","false"));
    btn.setAttribute("aria-selected","true");
    currentTab = btn.dataset.tab; currentPage=1;
    let data=[];
    if(currentTab==="archive") data=await fetchArchive();
    else data=await fetchTMDb(currentTab,1);
    render(data,true);
  };
});

// Search
document.getElementById("searchForm").onsubmit=async(e)=>{
  e.preventDefault();
  currentQuery=document.getElementById("searchInput").value;
  currentPage=1;
  const movies=await fetchTMDb("search",1,currentQuery);
  render(movies,true);
};

// Infinite scroll
const observer=new IntersectionObserver(async(entries)=>{
  if(entries[0].isIntersecting && !isLoading){
    isLoading=true; currentPage++;
    let more=[];
    if(currentTab==="archive") more=await fetchArchive(currentPage);
    else more=await fetchTMDb(currentTab,currentPage,currentQuery);
    render(more); isLoading=false;
  }
});
observer.observe(sentinel);

// Init
(async()=>{ render(await fetchTMDb("trending",1),true) })();