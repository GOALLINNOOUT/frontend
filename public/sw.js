// Listen for pushsubscriptionchange to help users resubscribe if needed
self.addEventListener('pushsubscriptionchange', function(event) {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BAnXpkSuLZLZcgOO0ibI-Z3grRNhkuszV8R7ZyGsRuPMUaAFnIhEtVyvdi8aqGxGVr5PCeG57DPnTt7iOgFgfdU'
    }).then(function(newSubscription) {
      // Notify the client(s) to update the subscription on the server
      return self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(function(clients) {
        clients.forEach(function(client) {
          // Serialize the subscription before sending
          let serializableSub = null;
          if (newSubscription) {
            try {
              serializableSub = JSON.parse(JSON.stringify(newSubscription));
            } catch (e) {
              serializableSub = newSubscription.toJSON ? newSubscription.toJSON() : null;
            }
          }
          client.postMessage({
            type: 'pushResubscribe',
            subscription: serializableSub
          });
        });
      });
    })
  );
});
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'JC Closet';
  const options = {
    body: data.body || '',
    icon: '/android-icon-192x192.png',
    badge: '/android-icon-192x192.png',
    data: data.url || '/',
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.notification.data) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data)
    );
  }
});
