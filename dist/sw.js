self.addEventListener('install', function(event) {
	/* const dbPromise = idb.open('keyval-store', 1, upgradeDB => {
  	upgradeDB.createObjectStore('keyval');
	}); */
	const urlsToCache = [
		'/dist/',
		'css/styles.css',
		'css/responsive.css',
		'js/dbhelper.js',
		'js/main.js',
		'js/mainController.js',
		'js/restaurant_info.js',
		'js/idb.js',
		'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
		'https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2',
		'https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmEU9fBBc4.woff2',
		'restaurant.html?id=1',
		'restaurant.html?id=2',
		'restaurant.html?id=3',
		'restaurant.html?id=4',
		'restaurant.html?id=5',
		'restaurant.html?id=6',
		'restaurant.html?id=7',
		'restaurant.html?id=8',
		'restaurant.html?id=9',
		'restaurant.html?id=10' 
	];

	event.waitUntil(
		caches.open('mytest').then(function(cache){
			return cache.addAll(urlsToCache);
		}))
});

self.addEventListener('fetch', function(event) {
	let urlsToCache = [];
	event.respondWith(
		caches.match(event.request).then(function(response) {
			/* If a cached asset is found, return it */
			if (response) {
				return response;
			/* If the uncached asset is an img cache it for next time */
			} else if (event.request.url.startsWith("http://localhost:8000/img")) {
				urlsToCache.push(event.request.url);
				caches.open('mytest').then(function(cache) {
					cache.addAll(urlsToCache);
				})	
			} else if (event.request.url.startsWith('http://localhost:1337')) {
				console.log(event.request);
			}
			/* If uncached asset is not an img, fetch it normally and return it */
			return fetch(event.request);
		})
	);
});
