// Bump this version whenever the application or a bundled resource changes.
const CACHE_PREFIX = 'allarmo-core-';
const CACHE_NAME = CACHE_PREFIX + '2026-10-23-v1';
const LEGACY_CACHE = 'allarmo-2026-core';
const INDEX_URL = new URL('./index.html', self.registration.scope).href;
const CORE_FILES = [
    './index.html', './manifest.json', './icona.png',
    './vendor/cropper.min.css', './vendor/cropper.min.js', './vendor/fonts.css',
    './vendor/inter-cyrillic-ext.woff2',
    './vendor/inter-cyrillic.woff2',
    './vendor/inter-greek-ext.woff2',
    './vendor/inter-greek.woff2',
    './vendor/inter-vietnamese.woff2',
    './vendor/inter-latin-ext.woff2',
    './vendor/inter-latin.woff2',
    './vendor/jetbrains-mono-cyrillic-ext.woff2',
    './vendor/jetbrains-mono-cyrillic.woff2',
    './vendor/jetbrains-mono-greek.woff2',
    './vendor/jetbrains-mono-vietnamese.woff2',
    './vendor/jetbrains-mono-latin-ext.woff2',
    './vendor/jetbrains-mono-latin.woff2'
];
const CORE_URLS = new Set(CORE_FILES.map(path => new URL(path, self.registration.scope).href));

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        // A failed download leaves the previously installed worker available.
        await cache.addAll(CORE_FILES.map(path => new Request(new URL(path, self.registration.scope), { cache: 'reload' })));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(names.filter(name => name !== CACHE_NAME &&
            (name.startsWith(CACHE_PREFIX) || name === LEGACY_CACHE)).map(name => caches.delete(name)));
        await self.clients.claim();
    })());
});

async function navigation(request) {
    const cache = await caches.open(CACHE_NAME);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    try {
        const response = await fetch(request, { cache: 'no-cache', signal: controller.signal });
        if (!response.ok) throw new Error('Navigation failed');
        // Both /allarmo/ and /allarmo/index.html (including queries) use this fallback.
        try { await cache.put(INDEX_URL, response.clone()); } catch (err) { /* Serve the network response if storage is full. */ }
        return response;
    } catch (err) {
        const cached = await cache.match(INDEX_URL);
        if (cached) return cached;
        throw err;
    } finally { clearTimeout(timeout); }
}

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url), scope = new URL(self.registration.scope);
    if (url.origin !== scope.origin) return;
    if (event.request.mode === 'navigate' && (url.pathname === scope.pathname || url.pathname === new URL(INDEX_URL).pathname)) {
        event.respondWith(navigation(event.request));
    } else if (CORE_URLS.has(url.href)) {
        event.respondWith((async () => {
            const cache = await caches.open(CACHE_NAME);
            return (await cache.match(event.request)) || fetch(event.request);
        })());
    }
});
