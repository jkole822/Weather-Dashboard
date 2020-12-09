const key = "e56581764b06baf1e8d2ec882f669384";
const baseURL = `https://api.openweathermap.org/data/2.5/weather?appid=${key}&units=imperial`;
const DateTime = luxon.DateTime;

// Helper function to capitalize first letter of `word`.
const capitalize = word => {
	const wordArr = word.split('');
	wordArr[0] = word[0].toUpperCase();
	return wordArr.join('')
}

// Use OpenWeatherMap's GeoCoding Feature via Current Weather Data route
// to retrieve latitude, longitude, and city name based on a location
// provided from the #search-form or #city-buttons to be passed onto
// renderWeather.
const getCoords = location => {
	const url = `${baseURL}&q=${location}`;

	$.ajax({
		url,
		method: "GET",
	}).then(response => {
		const latitude = response.coord.lat;
		const longitude = response.coord.lon;
		const locationName = response.name;
		renderWeather(locationName, latitude, longitude);
	});
};

const addToHistory = location => {
	const historyButton = $("<button>")
		.addClass("button is-fullwidth is-dark mb-1")
		.attr("data-city", location)
		.text(location);

	$("#city-buttons").prepend(historyButton);
};

// Renders weather information to the display column based
// on the provided location, latitude, and longitude.
const renderWeather = (location, latitude, longitude) => {
	// Empty out display column on a new search.
	$("#location").empty();
	$("#weather-info").empty();
	$("#five-day-forecast").empty();

	// Use OpenWeatherMap's One Call API to retrieve data.
	const forecastURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&appid=${key}&units=imperial`;

	$.ajax({
		url: forecastURL,
		method: "GET",
	}).then(forecastResponse => {
		// ---------------- CURRENT WEATHER -----------------------
		// Data Variables
		// ========================================================
		const {
			weather,
			temp: currentTemp,
			humidity: currentHumidity,
			dt: currentTimestamp,
			wind_speed: currentWindspeed,
			uvi: currentUvIndex,
		} = forecastResponse.current;

		const currentWeatherIcon = weather[0].icon;
		const currentTimezone = forecastResponse.timezone;
		const timeDate = DateTime.fromSeconds(currentTimestamp, {
			zone: currentTimezone,
		}).toFormat("f");

		// Elements
		// ========================================================
		const locationHeader = $("<h2>").addClass(
			"is-size-5 has-text-weight-semibold"
		);

		// If rendering using response from navigator.geolocation,
		// pass in generic title for location heading, else pass in
		// the provided location argument.
		if (location) {
			locationHeader.text(location);
		} else {
			locationHeader.text("Current Location");
		}

		const dateSpan = $("<span>").text(` (${timeDate})`);
		locationHeader.append(dateSpan);
		const iconImage = $("<img>")
			.attr(
				"src",
				`https://openweathermap.org/img/wn/${currentWeatherIcon}@2x.png`
			)
			.css("height", "2.5rem");
		const temperatureEl = $("<p>").html(
			`Temperature: ${parseFloat(currentTemp).toFixed(1)} &deg;F`
		);
		const humidityEl = $("<p>").text(`Humidity ${currentHumidity}%`);
		const windSpeedEl = $("<p>").text(
			`Wind Speed: ${parseFloat(currentWindspeed).toFixed(1)} MPH`
		);
		const uvIndexEl = $("<p>").text("UV Index: ");
		const uvIndexSpan = $("<span>").attr("id", "uvIndex").text(currentUvIndex);
		uvIndexEl.append(uvIndexSpan);

		// Conditionally render the background color of the uv index span
		// based on the value of the response uv index
		if (0 < currentUvIndex && currentUvIndex < 3) {
			uvIndexSpan.css("background", "hsl(141, 71%, 48%)");
		} else if (3 < currentUvIndex && currentUvIndex < 6) {
			uvIndexSpan
				.css("background", "hsl(48, 100%, 67%)")
				.css("color", "#4A4A4A");
		} else if (6 < currentUvIndex && currentUvIndex < 8) {
			uvIndexSpan.css("background", "orange");
		} else {
			uvIndexSpan.css("background", "hsl(348, 100%, 61%)");
		}

		// Append Elements to HTML document
		// ========================================================
		$("#location").append(locationHeader).append(iconImage);

		$("#weather-info")
			.append(temperatureEl)
			.append(humidityEl)
			.append(windSpeedEl)
			.append(uvIndexEl);

		// ---------------- FIVE DAY FORECAST ---------------------
		// Render heading only when other data is loaded
		$("#forecast-heading").text("Five Day Forecast");

		// Render data for five days after the current day
		for (let i = 1; i < 6; i++) {
			// Data Variables
			// ========================================================
			const {
				temp,
				humidity: forecastHumidity,
				weather,
				dt: forecastTimestamp,
			} = forecastResponse.daily[i];

			const forecastDate = DateTime.fromSeconds(forecastTimestamp, {
				zone: currentTimezone,
			}).toFormat("DD");
			const forecastHighTemperature = temp.max;
			const forecastLowTemperature = temp.min;
			const forecastWeatherIcon = weather[0].icon;

			// Elements
			// ========================================================
			const dateEl = $("<p>").text(forecastDate);
			const dailyIconImage = $("<img>").attr(
				"src",
				`https://openweathermap.org/img/wn/${forecastWeatherIcon}@2x.png`
			);
			const hiTempEl = $("<p>").html(`High: ${forecastHighTemperature} &deg;F`);
			const loTempEl = $("<p>").html(`Low: ${forecastLowTemperature} &deg;F`);
			const dailyHumidityEl = $("<p>").text(`Humidity: ${forecastHumidity}%`);

			// Append Elements to HTML document
			// ========================================================
			const forecastEl = $("<div>")
				.addClass("column")
				.addClass(
					"has-background-grey has-text-centered has-text-white-ter daily-forecast"
				)
				.append(dateEl)
				.append(dailyIconImage)
				.append(hiTempEl)
				.append(loTempEl)
				.append(dailyHumidityEl);

			$("#five-day-forecast").append(forecastEl);
		}
	});
};

// Event Listeners
// ========================================================
// Search Form
$("#search-form").submit(e => {
	e.preventDefault();
	const location = $("#search-input").val().trim();
	if (location) {
		const formatLocation = capitalize(location);
		const localStorageLocations = JSON.parse(localStorage.getItem("locations"));
		if (!localStorageLocations) {
			localStorage.setItem("locations", JSON.stringify([formatLocation]));
			const clearBtn = $('<button>').attr('id', 'clear-history').addClass('button is-fullwidth is-dark mb-1').text('Clear');
			$('#city-buttons').append(clearBtn);
		} else {
			localStorageLocations.push(formatLocation);
			localStorage.setItem("locations", JSON.stringify(localStorageLocations));
		}

		addToHistory(location);
		getCoords(location);
	} else {
		navigator.geolocation.getCurrentPosition(response => {
		const latitude = response.coords.latitude;
		const longitude = response.coords.longitude;
		renderWeather(null, latitude, longitude);
	});
	}
});

// Quick Search
$("#city-buttons").click(e => {
	const location = e.target.getAttribute("data-city");

	getCoords(location);
});

// Auto-render Current Location Information
$("document").ready(() => {
	const localStorageLocations = JSON.parse(localStorage.getItem("locations"));
	localStorageLocations.forEach(location => {
		addToHistory(location);
	});
	navigator.geolocation.getCurrentPosition(response => {
		const latitude = response.coords.latitude;
		const longitude = response.coords.longitude;
		renderWeather(null, latitude, longitude);
	});
});

// Clear History
$('#clear-history').click(() => {
	localStorage.setItem('locations', JSON.stringify([]));
	$('#city-buttons').empty();
})

// Media Query
// ========================================================
// Center current forecast text on small screens
const mediaQuery = window.matchMedia("(min-width: 768px)");

function handleWindowChange(e) {
	if (e.matches) {
		$("#current-forecast").removeClass("has-text-centered");
	} else {
		$("#current-forecast").addClass("has-text-centered");
	}
}

mediaQuery.addListener(handleWindowChange);
