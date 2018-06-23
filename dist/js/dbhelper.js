/**
 * Common database helper functions.
 */
let dbPromise = idb.open('restaurants', 1, upgradeDB => {
    let keyValStore = upgradeDB.createObjectStore('restaurants');
  });

class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    /*dbPromise.then( (db) => {
      let tx = db.transaction('restaurants', 'readwrite');
      let restaurantValStore = tx.objectStore('restaurants');
      return restaurantValStore.getAll();
      }).then(val => {
        if (val.length === 0) {
          console.log("No values, add them")
          fetch(DBHelper.DATABASE_URL)
            .then(function(response) {
              return response.json();
            })
            .then(function (restaurants) {
              dbPromise.then( (db) => {
                let restaurantValStore = db.transaction('restaurants', 'readwrite').objectStore('restaurants')
                for (const restaurant of restaurants) {
                  restaurantValStore.put(restaurant, restaurant.id)
                }
              
              })
              callback(null, restaurants);
          })
            .catch(function (err) {
              console.log(err);
              callback(null, err);
          })
        } else {
          console.log(`Found values: ${val}`)
          callback(null, val)
        }
      }); */
    // if fetch fails, we want to pull from cache
    // if fetch is successful we want to cache json
    fetch(DBHelper.DATABASE_URL) 
      .then(function(response) {
        return response.json();
    }).then(function(restaurants) {
      console.log('successfully pulled restaurants json data')
      // now cache it
        dbPromise.then( (db) => {
          let restaurantValStore = db.transaction('restaurants', 'readwrite').objectStore('restaurants')
            for (const restaurant of restaurants) {
              restaurantValStore.put(restaurant, restaurant.id)
            }
              
        })
      // now return it
        callback(null, restaurants);
    }).catch(function (err) {
      console.log("Failed to fetch restaurant json, attempting to pull from cache")
      dbPromise.then( (db) => {
        let restaurantValStore = db.transaction('restaurants').objectStore('restaurants')
        return restaurantValStore.getAll();
      }).then(val => {
        callback(null, val)
      })
    })

    
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if (restaurant.id === 10) {
      return (`/dist/img/10`);
    }
    return (`/dist/img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

} 
