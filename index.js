const key = "e56581764b06baf1e8d2ec882f669384";

const baseURL = `https://api.openweathermap.org/data/2.5/weather?appid=${key}&units=imperial`;

const getWeather = url => {
	const DateTime = luxon.DateTime;
	const now = DateTime.local().toLocaleString();

	$.ajax({
		url,
		method: "GET",
	}).then(response => {
		console.log(response);
		$("#location").empty();

		const city = $("<h2>").text(response.name).css("display", "inline");

		const date = $("<span>").text(` (${now})`);
		const icon = $("<img>")
			.attr(
				"src",
				`http://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`
			)
			.css("height", "2.5rem");

		city.append(date);
		$("#location")
			.css("display", "flex")
			.css("align-items", "center")
			.append(city)
			.append(icon);

		const latitude = response.coord.lat;
		const longitude = response.coord.lon;
		const uvURL = `http://api.openweathermap.org/data/2.5/uvi?lat=${latitude}&lon=${longitude}&appid=${key}`;
		$.ajax({
			url: uvURL,
			method: "GET",
		}).then(uvResponse => {
			$("#weather-info").empty();
			const uvIndex = $("<span>")
				.attr("id", "uvIndex")
				.text(`UV Index: ${uvResponse.value}`);

			if (0 < uvResponse.value && uvResponse.value < 3) {
				uvIndex.css("background", "green");
			} else if (3 < uvResponse.value && uvResponse.value < 6) {
				uvIndex.css("background", "yellow").css("color", "#4A4A4A");
			} else if (6 < uvResponse.value && uvResponse.value < 8) {
				uvIndex.css("background", "orange");
			} else {
				uvIndex.css("background", "red");
			}

			$("#weather-info").append(uvIndex);
		});
	});
};

$("#search-button").click(e => {
	e.preventDefault();

	const searchLocation = $("#search-input").val();
	const url = `${baseURL}&q=${searchLocation}`;

	getWeather(url);
});

$("#city-buttons").click(e => {
	const searchLocation = e.target.getAttribute("data-city");
	const url = `${baseURL}&q=${searchLocation}`;

	getWeather(url);
});
