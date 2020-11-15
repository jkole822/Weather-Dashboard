const key = "e56581764b06baf1e8d2ec882f669384";
const baseURL = `https://api.openweathermap.org/data/2.5/weather?appid=${key}&units=imperial`;
const DateTime = luxon.DateTime;

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

const renderWeather = (location, latitude, longitude) => {
	$("#location").empty();
	$("#weather-info").empty();
	$("#five-day-forecast").empty();

	const forecastURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&appid=${key}&units=imperial`;

	$.ajax({
		url: forecastURL,
		method: "GET",
	}).then(forecastResponse => {
		console.log(forecastResponse);

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

		const locationHeader = $("<h2>").css("display", "inline");

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
				`http://openweathermap.org/img/wn/${currentWeatherIcon}@2x.png`
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

		if (0 < currentUvIndex && currentUvIndex < 3) {
			uvIndexSpan.css("background", "green");
		} else if (3 < currentUvIndex && currentUvIndex < 6) {
			uvIndexSpan.css("background", "yellow").css("color", "#4A4A4A");
		} else if (6 < currentUvIndex && currentUvIndex < 8) {
			uvIndexSpan.css("background", "orange");
		} else {
			uvIndexSpan.css("background", "red");
		}

		$("#location")
			.css("display", "flex")
			.css("align-items", "center")
			.append(locationHeader)
			.append(iconImage);

		$("#weather-info")
			.append(temperatureEl)
			.append(humidityEl)
			.append(windSpeedEl)
			.append(uvIndexEl);

		$("#forecast-heading").text("Five Day Forecast");

		for (let i = 1; i < 6; i++) {
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

			const dateEl = $("<p>").text(forecastDate);
			const dailyIconImage = $("<img>").attr(
				"src",
				`http://openweathermap.org/img/wn/${forecastWeatherIcon}@2x.png`
			);
			const hiTempEl = $("<p>").html(`High: ${forecastHighTemperature} &deg;F`);
			const loTempEl = $("<p>").html(`Low: ${forecastLowTemperature} &deg;F`);
			const dailyHumidityEl = $("<p>").text(`Humidity: ${forecastHumidity}%`);

			const forecastEl = $("<div>")
				.addClass("column")
				.append(dateEl)
				.append(dailyIconImage)
				.append(hiTempEl)
				.append(loTempEl)
				.append(dailyHumidityEl);

			$("#five-day-forecast").append(forecastEl);
		}
	});
};

$("#search-form").submit(e => {
	e.preventDefault();
	const location = $("#search-input").val();
	getCoords(location);
});

$("#city-buttons").click(e => {
	const location = e.target.getAttribute("data-city");
	getCoords(location);
});

$("document").ready(() => {
	navigator.geolocation.getCurrentPosition(response => {
		const latitude = response.coords.latitude;
		const longitude = response.coords.longitude;
		renderWeather(null, latitude, longitude);
	});
});
