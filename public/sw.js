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
          // Use toJSON to serialize the subscription
          let subscriptionData = newSubscription ? newSubscription.toJSON() : null;
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
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      // Fallback for plain text payloads
      data = { title: 'Notification', body: event.data.text() };
    }
  }
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
