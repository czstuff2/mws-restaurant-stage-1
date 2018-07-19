let restaurant;
var newMap;
let reviews;
let pendingReviews;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.srcset = lazyImage.dataset.srcset;
          lazyImage.classList.remove("lazy");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function(lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Possibly fall back to a more compatible method here
  } 
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiZ2V0c29tZWdyIiwiYSI6ImNqaW16NGFsZDA0czczcW1mMXlpbHA5YXoifQ.bj0AybxFIbSQafOvx8iDvA',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 
/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fetchIfFavorite(id);
      // get Reviews
      fetchReviews();
      fetchPendingReviews();
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Fetch if restaurant is a favorite or not and update toggle switch
 */
fetchIfFavorite = (id) => {
  DBHelper.fetchFavoriteById(id, (error, restaurant) => {
    let favorite = restaurant;
    if (!favorite) {
      console.log(`Not Favorited`);
      return;
    } else {
      // This means the target restaurant is favorited and we need to update the toggle
      fillFavoriteToggle();
    }
  })
}

/**
 * Fetch any reviews on this restaurant
 */
fetchReviews = () => {
  let oldReviews;
  DBHelper.fetchRestaurantReviews(self.restaurant, (error, reviews) => {
    if (!reviews) {
      console.log('No reviews found');
      return;
    } else {
      self.reviews = reviews;
      fillReviewsHTML();
    }
  })
}
fetchPendingReviews = () => {
  DBHelper.fetchPendingReviews(self.restaurant, (error, review) => {
    if(!review) {
      console.log("No pending reviews found");
      return;
    } else if (review) {
      const container = document.getElementById('reviews-container');
      const ul = document.getElementById('reviews-list');
      ul.appendChild(createReviewHTML(review));
      container.appendChild(ul);
    } else {
      const container = document.getElementById('reviews-container');
      const ul = document.getElementById('reviews-list');
      ul.appendChild(createReviewHTML(error));
      container.appendChild(ul);
    }
  })
}

/**
 * Restaurant favorite toggle needs to be updated here to visual show it is favorited
 */
fillFavoriteToggle = () => {
  let checkbox = document.getElementById('isFavorited');
  checkbox.checked = true;
  checkbox.setAttribute("checked", "true");
  checkbox.setAttribute("aria-checked", "true");
  let header = document.getElementById('favoriteHeader');
  header.innerHTML = "Favorited";

}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img lazyload'
  const imageUrlForRestaurant = DBHelper.imageUrlForRestaurant(restaurant);
  image.src = `/dist/img/fa-image.png`;
  image.setAttribute("data-src", `${imageUrlForRestaurant}-200px.jpg`);
  image.setAttribute("data-srcset", `${imageUrlForRestaurant}-original.jpg`);
  image.setAttribute("alt", "Image of " + restaurant.name + " Restaurant.  ");

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  // fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  /*const date = document.createElement('p');
  let timeStamp = review.createdAt;
  let newDate = new Date(timeStamp * 1000);
  date.innerHTML = `${newDate.getMonth()}/${newDate.getDate()}/${newDate.getYear()}`;
  li.appendChild(date);*/

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.setAttribute('aria-current', 'page');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/// onclick listeneer for favoriting

let checkbox = document.getElementById('isFavorited');
checkbox.addEventListener("click", function() {
  if (checkbox.checked === true) {
    // add to favorites dbhelper
    DBHelper.favoriteRestaurantById(self.restaurant, (error, restaurant) => {
      let favorite = restaurant;
      if (!favorite) {
        console.log('Did not favorite successfully')
        return;
      } else {
        let checkbox = document.getElementById('isFavorited');
        checkbox.checked = true;
        checkbox.setAttribute("checked", "true");
        checkbox.setAttribute("aria-checked", "true");
        let header = document.getElementById('favoriteHeader');
        header.innerHTML = "Favorited";
      }
    })
  } else {
    DBHelper.unfavoriteRestaurantById(self.restaurant, (error, restaurant) => {
      let favorite = restaurant;
      if (!favorite) {
        console.log('Did not unfavorite successfully')
        return;
      } else {
        let checkbox = document.getElementById('isFavorited');
        checkbox.checked = false;
        checkbox.setAttribute("checked", "false");
        checkbox.setAttribute("aria-checked", "false");
        let header = document.getElementById('favoriteHeader');
        header.innerHTML = "Add to Favorites";
      }
    })
  }
})
let formReview = document.getElementById('reviewForm');
formReview.addEventListener('submit', function(e) {
  e.preventDefault();
})

let submitReview = document.getElementById('reviewSubmitBtn');
submitReview.addEventListener('click', function(event) {
  let userName = document.getElementById('reviewUserName').value;
  let rating = document.getElementById('reviewRating').value;
  let comments = document.getElementById('restaurantComments').value;
  let oldReview = {
    name:  `${userName}`,
    restaurant_id: `${self.restaurant.id}`,
    rating: `${rating}`,
    comments: `${comments}`
  }
  DBHelper.submitReview(oldReview, (error, review) => {
      let newReview = review;
      if (!newReview) {
        console.warn('No Connectivity')
        let formReview = document.getElementById('reviewForm');
        formReview.reset();
        const container = document.getElementById('reviews-container');
        const ul = document.getElementById('reviews-list');
        ul.appendChild(createReviewHTML(oldReview));
        container.appendChild(ul);
      } else {
        let formReview = document.getElementById('reviewForm');
        formReview.reset();
        const container = document.getElementById('reviews-container');
        const ul = document.getElementById('reviews-list');
        ul.appendChild(createReviewHTML(review));
        container.appendChild(ul);
      }
    })

})