const CACHE_NAME = 'newtab-offline-cache-v1';
const OFFLINE_URL = '/newtab';


self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
       
            return cache.add(OFFLINE_URL);
        }).then(() => self.skipWaiting())
    );
});


self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});


self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);


    if (url.pathname === '/newtab') {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
            
                    if (networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                  
                    return caches.match(OFFLINE_URL);
                })
        );
    }
});
