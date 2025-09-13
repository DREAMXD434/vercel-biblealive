// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registrado exitosamente:', registration.scope);
            
            // Verificar actualizaciones
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Nueva versión disponible
                        showUpdateAvailable();
                    }
                });
            });
            
        } catch (error) {
            console.log('Error registrando Service Worker:', error);
        }
    });
}

function showUpdateAvailable() {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background-color: #4A90E2;
            color: white;
            padding: 1rem;
            text-align: center;
            z-index: 10000;
        ">
            <p>Nueva versión disponible. <button onclick="updateApp()" style="background: white; color: #4A90E2; border: none; padding: 0.5rem 1rem; border-radius: 4px; margin-left: 1rem;">Actualizar</button></p>
        </div>
    `;
    document.body.appendChild(notification);
}

function updateApp() {
    window.location.reload();
}