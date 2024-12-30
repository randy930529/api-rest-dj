'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "fce25dc22ff350c87f701effaa713bc3",
"assets/AssetManifest.json": "b200a2ecfcd7ad229805fe0d60724083",
"assets/assets/icons/apklis_logo.svg": "47c17c9b5d582cf14c644e54bf0517d1",
"assets/assets/icons/edit_role.svg": "2d295082e01487542d0cff24bc1cf409",
"assets/assets/icons/menu_about.svg": "431606d60da0191b3dbd5e20c51b1d86",
"assets/assets/icons/menu_bill.svg": "83a103bd3689a8eac57f0010b2c269b7",
"assets/assets/icons/menu_company.svg": "24b340cc354490cb0b62ace7ed4bfe0f",
"assets/assets/icons/menu_contract.svg": "462c4633820232f187434623333aa72e",
"assets/assets/icons/menu_dashboard.svg": "b2cdf62e9ce9ca35f3fc72f1c1fcc7d4",
"assets/assets/icons/menu_doc.svg": "09673c2879de2db9646345011dbaa7bb",
"assets/assets/icons/menu_home.svg": "37c06f34190368085687d070bd12246f",
"assets/assets/icons/menu_log_out.svg": "0496778c692f55020a8e9b8e4171052a",
"assets/assets/icons/menu_notification.svg": "460268d6e4bdeab56538d7020cc4b326",
"assets/assets/icons/menu_profile.svg": "161701652015be04ddd50d056aeb960e",
"assets/assets/icons/menu_setting.svg": "7841bd20c7f1bbc2861be7cc86d75614",
"assets/assets/icons/menu_user.svg": "8cf337a38abb3b0a3bffbbe662414d8c",
"assets/assets/icons/user_generic.svg": "326f82100d1daeed8cddeba6f9d6bca7",
"assets/assets/images/apklis-play-store-cubana.png": "87aec468754af6db5bcafba3cb010906",
"assets/assets/images/logo.png": "4edd19050f0bce77a9b813ce82cc3dae",
"assets/assets/images/logo2x.png": "4edd19050f0bce77a9b813ce82cc3dae",
"assets/assets/images/logoca.jpg": "6c80b9f73cc8b768a2ffd5fd6832f469",
"assets/assets/images/telegram-logo.png": "a322704c12ea729f0702ac11456442d0",
"assets/assets/images/tm.webp": "cbd351761383029cbca02602b03fbadd",
"assets/assets/images/User%2520Icon.svg": "950d2f1652bdb59675231707a9124535",
"assets/FontManifest.json": "c7c530122981123e0493892c2938a922",
"assets/fonts/MaterialIcons-Regular.otf": "0a0f92cc950734c2abfee2d3ac1ecf33",
"assets/NOTICES": "f072df36be95d9350806be1b548e99c8",
"assets/packages/awesome_dialog/assets/flare/error.flr": "e3b124665e57682dab45f4ee8a16b3c9",
"assets/packages/awesome_dialog/assets/flare/info.flr": "bc654ba9a96055d7309f0922746fe7a7",
"assets/packages/awesome_dialog/assets/flare/info2.flr": "21af33cb65751b76639d98e106835cfb",
"assets/packages/awesome_dialog/assets/flare/info_without_loop.flr": "cf106e19d7dee9846bbc1ac29296a43f",
"assets/packages/awesome_dialog/assets/flare/question.flr": "1c31ec57688a19de5899338f898290f0",
"assets/packages/awesome_dialog/assets/flare/succes.flr": "ebae20460b624d738bb48269fb492edf",
"assets/packages/awesome_dialog/assets/flare/succes_without_loop.flr": "3d8b3b3552370677bf3fb55d0d56a152",
"assets/packages/awesome_dialog/assets/flare/warning.flr": "68898234dacef62093ae95ff4772509b",
"assets/packages/awesome_dialog/assets/flare/warning_without_loop.flr": "c84f528c7e7afe91a929898988012291",
"assets/packages/bootstrap_icons/fonts/BootstrapIcons.ttf": "b2ba1585f0ec2d2725ec1c7f43d8d00e",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "10b47199fbe38e2f762d4664c13857ed",
"assets/packages/font_awesome_flutter/lib/fonts/fa-brands-400.ttf": "4769f3245a24c1fa9965f113ea85ec2a",
"assets/packages/font_awesome_flutter/lib/fonts/fa-regular-400.ttf": "3ca5dc7621921b901d513cc1ce23788c",
"assets/packages/font_awesome_flutter/lib/fonts/fa-solid-900.ttf": "18aa19918687acf55845bf4db4a7361e",
"assets/shaders/ink_sparkle.frag": "f8b80e740d33eb157090be4e995febdf",
"canvaskit/canvaskit.js": "76f7d822f42397160c5dfc69cbc9b2de",
"canvaskit/canvaskit.wasm": "f48eaf57cada79163ec6dec7929486ea",
"canvaskit/chromium/canvaskit.js": "8c8392ce4a4364cbb240aa09b5652e05",
"canvaskit/chromium/canvaskit.wasm": "fc18c3010856029414b70cae1afc5cd9",
"canvaskit/skwasm.js": "1df4d741f441fa1a4d10530ced463ef8",
"canvaskit/skwasm.wasm": "6711032e17bf49924b2b001cef0d3ea3",
"canvaskit/skwasm.worker.js": "19659053a277272607529ef87acf9d8a",
"favicon.png": "233931323597ef1bf44ff83621441348",
"flutter.js": "6b515e434cea20006b3ef1726d2c8894",
"icons/Icon-192.png": "233931323597ef1bf44ff83621441348",
"icons/Icon-512.png": "233931323597ef1bf44ff83621441348",
"icons/Icon-maskable-192.png": "233931323597ef1bf44ff83621441348",
"icons/Icon-maskable-512.png": "233931323597ef1bf44ff83621441348",
"index.html": "7f3798e3d08538144a0dfb6314c9d6f4",
"/": "7f3798e3d08538144a0dfb6314c9d6f4",
"main.dart.js": "6194875e6582fa9b1d1e1cf5b330f2b0",
"manifest.json": "d77398c309bdc7587fd39411550b3e57",
"splash/img/dark-1x.png": "233931323597ef1bf44ff83621441348",
"splash/img/dark-2x.png": "233931323597ef1bf44ff83621441348",
"splash/img/dark-3x.png": "496955e032e61c1af84e58f423dd0b39",
"splash/img/dark-4x.png": "f3fa0459e740fc733a27abbe32b0a045",
"splash/img/light-1x.png": "233931323597ef1bf44ff83621441348",
"splash/img/light-2x.png": "c8902974337d3010db29e7ad064885d2",
"splash/img/light-3x.png": "496955e032e61c1af84e58f423dd0b39",
"splash/img/light-4x.png": "f3fa0459e740fc733a27abbe32b0a045",
"version.json": "14f8262a4970693be14e4e509de935ae"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
