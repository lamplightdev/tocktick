(function () {
  "use strict";
  /* global importScripts */
  /* global self */
  /* global caches */
  /* global fetch */
  /* global URL */
  /* global Response */

  ///

  // Include SW cache polyfill
  importScripts("/js/serviceworker-cache-polyfill.js");


  // Cache name definitions
  var cacheNameStatic = "tocktick-static-v1";

  var currentCacheNames = [
    cacheNameStatic,
  ];


  // A new ServiceWorker has been registered
  self.addEventListener("install", function (event) {
    event.waitUntil(
      caches.open(cacheNameStatic)
        .then(function (cache) {
          return cache.addAll([
            "/",
            "/js/dist/0.0.1.tocktick.min.js",
            "/css/app.css",
            "/images/add.svg",
            "/images/timer.svg",
          ]);
        })
    );
  });


  // A new ServiceWorker is now active
  self.addEventListener("activate", function (event) {
    event.waitUntil(
      caches.keys()
        .then(function (cacheNames) {
          return Promise.all(
            cacheNames.map(function (cacheName) {
              if (currentCacheNames.indexOf(cacheName) === -1) {
                // TODO: if wikipedia cache changed, remove localStorage history
                return caches.delete(cacheName);
              }
            })
          );
        })
    );
  });


  self.addEventListener('fetch', function(event) {
    console.log('Handling fetch event for', event.request.url);
    var requestUrl = new URL(event.request.url);

    if (/^\/api\//.test(requestUrl.pathname)) {
      var responseBody = {
        _id: "Qkcym8Nu",
        _members: {
          description: "",
          jobID: "7yqF0kV_",
          start: "1425152687983",
          stop: "1425152748113"
        }
      };

      responseBody = {
        test: 'oki'
      };

      var responseInit = {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
        }
      };

      localStorage.setItem('offline-request-responses', 'this');

      var mockResponse = new Response(JSON.stringify(responseBody), responseInit);

      console.log('handle with:', responseBody);
      event.respondWith(mockResponse);
    } else {
      console.log('unhandled');
    }

    // If event.respondWith() isn't called because this wasn't a request that we want to mock,
    // then the default request/response behavior will automatically be used.
  });

  /*
  // The page has made a request
  self.addEventListener("fetch", function (event) {
    var requestURL = new URL(event.request.url);

    event.respondWith(
      caches.match(event.request)
        .then(function (response) {

          if (response) {
            return response;
          }

          var fetchRequest = event.request.clone();

          return fetch(fetchRequest).then(
            function (response) {

              var shouldCache = false;

              if (response.type === "basic" && response.status === 200) {
                shouldCache = cacheNameStatic;
              } else if (response.type === "opaque") { // if response isn"t from our origin / doesn"t support CORS
                if (requestURL.hostname.indexOf(".wikipedia.org") > -1) {
                  shouldCache = cacheNameWikipedia;
                } else if (requestURL.hostname.indexOf(".typekit.net") > -1) {
                  shouldCache = cacheNameTypekit;
                } else {
                  // just let response pass through, don"t cache
                }

              }

              if (shouldCache) {
                var responseToCache = response.clone();

                caches.open(shouldCache)
                  .then(function (cache) {
                    var cacheRequest = event.request.clone();
                    cache.put(cacheRequest, responseToCache);
                  });
              }

              return response;
            }
          );
        })
    );
  });
  */

})();