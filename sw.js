self.addEventListener('install', function(event) {
	const urlsToCache = [
		'/',
		'css/styles.css',
		'css/responsive.css',
		'js/dbhelper.js',
		'js/main.js',
		'js/mainController.js',
		'data/restaurants.json',
		'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
		'https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2',
		'https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmEU9fBBc4.woff2'
	];

	event.waitUntil(
		caches.open('mytest').then(function(cache){
			return cache.addAll(urlsToCache);
		})
	);
});

self.addEventListener('fetch', function(event) {
	let urlsToCache = [];
	event.respondWith(
		caches.match(event.request).then(function(response) {
			/* If a cached asset is found, return it */
			if (response) {
				return response;
			/* If the uncached asset is an img cache it for next time */
			} else if (event.request.url.startsWith("http://localhost:3000/img")) {
				urlsToCache.push(event.request.url);
				console.log("Cached an Image");
				caches.open('mytest').then(function(cache) {
					cache.addAll(urlsToCache);
				})
			}
			/* If uncached asset is not an img, fetch it normally and return it */
			console.log("NetWork Pull");
			return fetch(event.request);
		})
	);
});
