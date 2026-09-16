const CACHE = 'fretnote-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './fret-favicon-32.png',
  './fret-icon-180.png',
  './fret-icon-192.png',
  './fret-icon-512.png'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  // Firebase나 외부 API 요청은 항상 네트워크로 (캐시하면 데이터가 안 갱신됨)
  if(url.origin !== location.origin){
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=>c.put(e.request, copy)).catch(()=>{});
        return res;
      })
      .catch(()=>caches.match(e.request).then(r=>r || caches.match('./index.html')))
  );
});
