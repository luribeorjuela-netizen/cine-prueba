<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Escena Secreta — Cine Clásico Gratis</title>
  <meta name="description" content="Escena Secreta: cine y TV clásica de dominio público. Gratis y legal.">
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div id="loadingBar"></div>

  <header>
    <div class="wrap nav">
      <a class="brand" href="#">
        <span class="logo"></span>
        <span>Escena Secreta</span>
      </a>
      <form id="searchForm" class="search">
        <input id="q" name="q" type="search" placeholder="Buscar películas o TV…" autocomplete="off">
        <button class="btn" type="submit">Buscar</button>
      </form>
      <nav class="tabs">
        <button class="tab" data-tab="trending" aria-selected="true">Tendencias</button>
        <button class="tab" data-tab="movies">Películas</button>
        <button class="tab" data-tab="series">Series / TV</button>
        <button class="tab" data-tab="watchlist">Mi lista</button>
      </nav>
      <div class="cta">
        <button id="openSubscribe" class="btn">Suscríbete</button>
      </div>
    </div>
  </header>

  <main class="wrap">
    <section id="results">
      <div class="section">
        <h2 id="sectionTitle">Tendencias</h2>
        <div class="muted">Contenido de dominio público desde <span class="pill">Internet Archive</span> y posters de TMDb</div>
      </div>
      <div id="grid" class="grid"></div>
      <div id="empty" class="empty" hidden>Sin resultados 🤔</div>
      <div id="sentinel"><div id="sentinelSpinner" class="spinner" hidden></div></div>
    </section>
  </main>

  <footer>
    Hecho con ❤️ para lo clásico. Solo contenido de <strong>dominio público</strong>.
  </footer>

  <dialog id="player">
    <div class="player-head">
      <strong id="playerTitle">Reproductor</strong>
      <div>
        <button class="btn" id="openOnArchive">Abrir en Archive</button>
        <button class="btn" id="closePlayer">Cerrar</button>
      </div>
    </div>
    <div class="player-body">
      <video id="video" controls playsinline></video>
      <p id="playerMetaDesc" class="muted"></p>
    </div>
  </dialog>

  <script src="app.js"></script>
</body>
</html>
