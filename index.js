const key = "e56581764b06baf1e8d2ec882f669384";
const baseURL = `https://api.openweathermap.org/data/2.5/weather?appid=${key}&units=imperial`;
const DateTime = luxon.DateTime;

const getWeather = searchLocation => {
	const url = `${baseURL}&q=${searchLocation}`;

	$.ajax({
		url,
		method: "GET",
	}).then(response => {
		$("#location").empty();
		$("#weather-info").empty();

		const latitude = response.coord.lat;
		const longitude = response.coord.lon;

		const forecastURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&appid=${key}&units=imperial`;

		$.ajax({
			url: forecastURL,
			method: "GET",
		}).then(forecastResponse => {
			console.log(forecastResponse);

			const currentWeatherIcon = forecastResponse.current.weather[0].icon;
			const currentTemp = forecastResponse.current.temp;
			const currentHumidity = forecastResponse.current.humidity;
			const currentTimestamp = forecastResponse.current.dt;
			const currentTimezone = forecastResponse.timezone;
			const currentWindspeed = forecastResponse.current.wind_speed;
			const uvIndex = forecastResponse.current.uvi;

			const now = DateTime.fromSeconds(currentTimestamp, {
				zone: currentTimezone,
			}).toFormat("f");

			const city = $("<h2>").text(searchLocation).css("display", "inline");
			const date = $("<span>").text(` (${now})`);
			city.append(date);
			const icon = $("<img>")
				.attr(
					"src",
					`http://openweathermap.org/img/wn/${currentWeatherIcon}@2x.png`
				)
				.css("height", "2.5rem");
			const temperature = $("<p>").html(
				`Temperature: ${parseFloat(currentTemp).toFixed(1)} &deg;F`
			);
			const humidity = $("<p>").text(`Humidity ${currentHumidity}%`);
			const windSpeed = $("<p>").text(
				`Wind Speed: ${parseFloat(currentWindspeed).toFixed(1)} MPH`
			);
			const uvIndexLabel = $("<p>").text("UV Index: ");
			const uvIndexSpan = $("<span>").attr("id", "uvIndex").text(uvIndex);
			uvIndexLabel.append(uvIndexSpan);

			if (0 < uvIndex && uvIndex < 3) {
				uvIndexSpan.css("background", "green");
			} else if (3 < uvIndex && uvIndex < 6) {
				uvIndexSpan.css("background", "yellow").css("color", "#4A4A4A");
			} else if (6 < uvIndex && uvIndex < 8) {
				uvIndexSpan.css("background", "orange");
			} else {
				uvIndexSpan.css("background", "red");
			}

			$("#location")
				.css("display", "flex")
				.css("align-items", "center")
				.append(city)
				.append(icon);

			$("#weather-info")
				.append(temperature)
				.append(humidity)
				.append(windSpeed)
				.append(uvIndexLabel);

			// forecastResponse.daily.forEach(day => {
			// 	console.log(day);
			// });
		});
	});
};

$("#search-button").click(e => {
	e.preventDefault();
	const searchLocation = $("#search-input").val();
	getWeather(searchLocation);
});

$("#city-buttons").click(e => {
	const searchLocation = e.target.getAttribute("data-city");
	getWeather(searchLocation);
});
