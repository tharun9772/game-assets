const CACHE_NAME = 'newtab-complete-cache-v1';
const NEWTAB_PATH = '/newtab';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.add(NEWTAB_PATH);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    const isMainNewTabRequest = requestUrl.pathname === NEWTAB_PATH;
    const isAssetFromNewTabPage = event.request.referrer && event.request.referrer.includes(NEWTAB_PATH);

    if (isMainNewTabRequest || isAssetFromNewTabPage) {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse.status === 200 || networkResponse.type === 'opaque') {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    return caches.match(event.request).then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        if (event.request.mode === 'navigate') {
                            return caches.match(NEWTAB_PATH);
                        }
                    });
                })
        );
    }
});

