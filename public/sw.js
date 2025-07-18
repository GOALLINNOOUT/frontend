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
          let subscriptionData = null;
          if (newSubscription) {
            subscriptionData = {
              endpoint: newSubscription.endpoint,
              keys: {
                p256dh: newSubscription.getKey('p256dh') ? btoa(String.fromCharCode.apply(null, new Uint8Array(newSubscription.getKey('p256dh')))) : null,
                auth: newSubscription.getKey('auth') ? btoa(String.fromCharCode.apply(null, new Uint8Array(newSubscription.getKey('auth')))) : null
              }
            };
          }
          client.postMessage({
            type: 'pushResubscribe',
            subscription: subscriptionData
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
