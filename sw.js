self.addEventListener('fetch', function(event) {
	console.log(event.request);
});


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
	caches.open('mytest').then(function(cache) {

	});
});