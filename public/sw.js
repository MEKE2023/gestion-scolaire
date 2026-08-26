// Service worker volontairement minimal — AUCUNE mise en cache du code ni des données.
// Son seul rôle est de satisfaire les critères techniques d'installation (PWA) de certains navigateurs.
// Chaque requête est transmise directement au réseau, sans jamais être interceptée ni stockée.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Passthrough pur : toujours aller chercher la version la plus récente sur le réseau.
  event.respondWith(fetch(event.request));
});
