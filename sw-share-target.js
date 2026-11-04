// Loaded into the Workbox service worker with importScripts (see nuxt.config.ts).
// Handles the Web Share Target POST: keeps the shared files (images or PDFs)
// in a local cache and redirects to the app, which picks them up
// (utils/sharedImage.ts).
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'POST' || !url.pathname.endsWith('/share-target')) return
  event.respondWith(
    (async () => {
      const base = new URL(self.registration.scope).pathname
      try {
        const form = await event.request.formData()
        const files = form.getAll('image').filter((f) => f && typeof f !== 'string')
        const cache = await caches.open('ocr-share-target')
        for (let i = 0; i < files.length; i++) {
          await cache.put(
            base + 'shared-image-' + i,
            new Response(files[i], { headers: { 'Content-Type': files[i].type || 'application/octet-stream' } }),
          )
        }
        await cache.put(base + 'shared-count', new Response(String(files.length)))
      } catch (e) {
        // A malformed share still opens the app.
      }
      return Response.redirect(base + '?shared=1', 303)
    })(),
  )
})
