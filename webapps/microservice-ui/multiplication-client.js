function updateResults(userAlias) {
	var userId = -1;
	$.ajax({
		async: false,
		url: "http://localhost:8000/api/results?alias=" + userAlias,
		success: function(data) {
			$('#results-div').show();
			$('#results-body').empty();
			data.forEach(function(row) {
				$('#results-body').append(
					'<tr>' +
						'<td>' + row.id + '</td>' +
						'<td>' + row.multiplication.factorA + ' x ' + row.multiplication.factorB + '</td>' +
						'<td>' + row.resultAttempt + '</td>' +
						'<td>' + (row.correct ? 'YES' : 'NO') + '</td>' +
					'</tr>'
				);
			});
			userId = data[0].user.id;
		}
	});
	return userId;
}

function updateMultiplication() {
	$.ajax({
		url: "http://localhost:8000/api/multiplications/random"
	}).then(function(data) {
		// clean the form
		$("#attempt-form").find("input[name='result-attempt']").val("");
		$("#attempt-form").find("input[name='user-alias']").val("");
		
		// get random challenge from API and load data in HTML
		$(".multiplication-a").empty().append(data.factorA);
		$(".multiplication-b").empty().append(data.factorB);
	});
}

$(document).ready(function() {
	updateMultiplication();
	
	$("#attempt-form").submit(function(event) {
		// don't submit the form normally.
		event.preventDefault();
		
		// Get values from HTML elements
		var a = $(".multiplication-a").text();
		var b = $(".multiplication-b").text();
		var $form = $(this),
			attempt = $form.find("input[name='result-attempt']").val(),
			userAlias = $form.find("input[name='user-alias']").val();
		
		// compose the data in a format the API is expecting
		var data = {
				user: {
					alias: userAlias
				},
				multiplication: {
					factorA: a,
					factorB: b
				},
				resultAttempt: attempt
		};
		
		// send data using post
		$.ajax({
			url: "http://localhost:8000/api/results",
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
			success: function(result) {
				if(result.correct) {
					$(".result-message").empty().append("The result is correct! Congratulations!");
				} else {
					$(".result-message").empty().append("Oops that's not correct! But keep trying!");
				}
			}
		});
		
		updateMultiplication();
		
		setTimeout(function() {
			var userId = updateResults(userAlias);
			updateStats(userId);
			updateLeaderBoard();
		}, 300);
	});
});
