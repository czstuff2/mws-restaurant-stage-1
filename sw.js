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
	event.respondWith(
		caches.match(event.request).then(function(response) {
			if (response) {
				console.log("Found something in the cache.")
				return response;
			};
			return fetch(event.request);
		})
	);
});