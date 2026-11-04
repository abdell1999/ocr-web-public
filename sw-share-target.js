// Loaded into the Workbox service worker with importScripts (see nuxt.config.ts).
// Handles the Web Share Target POST: keeps the shared image in a local cache
// and redirects to the app, which picks it up (utils/sharedImage.ts).
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'POST' || !url.pathname.endsWith('/share-target')) return
  event.respondWith(
    (async () => {
      const base = new URL(self.registration.scope).pathname
      try {
        const form = await event.request.formData()
        const file = form.get('image')
        if (file && typeof file !== 'string') {
          const cache = await caches.open('ocr-share-target')
          await cache.put(
            base + 'shared-image',
            new Response(file, { headers: { 'Content-Type': file.type || 'application/octet-stream' } }),
          )
        }
      } catch (e) {
        // A malformed share still opens the app.
      }
      return Response.redirect(base + '?shared=1', 303)
    })(),
  )
})
