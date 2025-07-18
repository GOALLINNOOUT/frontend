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
    icon: data.icon || '/android-icon-192x192.png',
    badge: data.badge || '/android-icon-192x192.png',
    image: data.image || '/WhatsApp Image 2025-06-30 at 14.59.32_f1f86020.jpg', // Large image
    vibrate: [200, 100, 200], // Vibration pattern
    actions: [
      {
        action: 'open',
        title: 'View',
        icon: '/android-icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/android-icon-36x36.png'
      }
    ],
    data: {
      url: data.url || '/',
      ...data
    },
    requireInteraction: true // Stays until user interacts
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
  if (event.action === 'open') {
    event.waitUntil(self.clients.openWindow(url));
  } else if (!event.action) {
    // Default click (not on action button)
    event.waitUntil(self.clients.openWindow(url));
  }
  // 'dismiss' action does nothing (just closes)
});
