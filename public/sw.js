// Service Worker - Bible Alive PWA
const CACHE_NAME = 'bible-alive-v1';
const urlsToCache = [
    '/',
    '/css/styles.css',
    '/js/app.js',
    '/js/bible-reader.js',
    '/js/audio-player.js',
    '/js/storage.js',
    '/js/sw-register.js',
    '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cacheando archivos');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Instalación completa');
                self.skipWaiting();
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activando...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Eliminando cache antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activación completa');
            self.clients.claim();
        })
    );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Devolver desde cache si está disponible
                if (response) {
                    return response;
                }

                // Si no está en cache, hacer fetch
                return fetch(event.request).then((response) => {
                    // Verificar si la respuesta es válida
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Cachear la respuesta para requests GET
                    if (event.request.method === 'GET') {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                    }

                    return response;
                }).catch((error) => {
                    console.log('Fetch failed for:', event.request.url, error);
                    // Si falla el fetch y no está en cache, devolver página offline o error apropiado
                    if (event.request.destination === 'document') {
                        return caches.match('/').then(cachedPage => {
                            return cachedPage || new Response('Page offline', {
                                status: 503,
                                statusText: 'Service Unavailable',
                                headers: { 'Content-Type': 'text/html' }
                            });
                        });
                    }
                    // Para otros recursos, devolver error apropiado
                    return new Response('Resource unavailable', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'text/plain' }
                    });
                });
            })
    );
});

// Manejo de mensajes desde la aplicación
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Sync en background (para futuras funcionalidades)
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    console.log('Service Worker: Realizando sincronización en background');
    // Aquí se implementaría la sincronización de datos
}

// Push notifications (para futuras funcionalidades)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Mensaje de Bible Alive',
        icon: '/assets/icon-192.png',
        badge: '/assets/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('Bible Alive', options)
    );
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
    console.log('Notificación clickeada:', event.notification.tag);
    event.notification.close();

    event.waitUntil(
        clients.openWindow('/')
    );
});