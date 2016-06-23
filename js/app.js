$(document).ready( function() {
	$('.unanswered-getter').submit( function(e){
		e.preventDefault();
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
	});
	//zero out the results and get value of tags submitted by user//
	$('.inspiration-getter').submit(function(event) {
		event.preventDefault();
		$('.results').html('');
		var query = $(this).find("input[name='answerers']").val();
		console.log(query);
		getTopAnswerers(query);
	});
});

// this function takes the question object returned by the StackOverflow request
// and returns new result to be appended to DOM
var showQuestion = function(question) {
	
	// clone our result template code
	var result = $('.templates .question').clone();
	
	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the .viewed for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" '+
		'href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
		question.owner.display_name +
		'</a></p>' +
		'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};

// this function takes the results object from StackOverflow
// and returns the number of results and tags to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query + '</strong>';
	return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function(tags) {
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = { 
		tagged: tags,
		site: 'stackoverflow',
		order: 'desc',
		sort: 'creation'
	};
	
	$.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",//use jsonp to avoid cross origin issues
		type: "GET",
	})
	.done(function(result){ //this waits for the ajax to return with a succesful promise object
		console.log(result.items);
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);
		//$.each is a higher order function. It takes an array and a function as an argument.
		//The function is executed once for each item in the array.
		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};

function showAnswerer(answerer) {
	
	//clone output template//
	var output = $('.templates .output').clone();
	
	//show user name and link to user//
	var answererElem = output.find('.user-name a');
	answererElem.attr('href', answerer.user.link);
	answererElem.text(answerer.user.display_name);

	//show user score//
	var scoreElem = output.find('.score');
	scoreElem.text(answerer.score);

	//show user post count//
	var countElem = output.find('.count');
	countElem.text(answerer.post_count);

	//show user accept rate//
	var acceptElem = output.find('.accept');
	acceptElem.text(answerer.user.accept_rate);
	
	return output
};

function showAnswererResults(term, total) {
	var totalNumber = total + ' results for <strong>' + term + '</strong>';
	return totalNumber;
};

showFail = function(error){
	var failElem = $('.templates .error').clone();
	var failText = '<p>' + error + '</p>';
	failElem.append(failText);
};

//get answerer data from api//
function getTopAnswerers(query) {
	var params = {
		tag: query,
		site: 'stackoverflow'
	};

	$.ajax({
		url: "http://api.stackexchange.com/2.2/tags/" + query + "/top-answerers/all_time",
		data: params,
		dataType: "jsonp",
		type: "GET",
	})

	.done(function(results) {
		console.log(results.items);
		var answererResults = showAnswererResults(params.tag, results.items.length);

		$('.search-results').html(answererResults);
		$.each(results.items, function(index, score) {
			var answerer = showAnswerer(score);
			$('.results').append(answerer);
		});
	})
	.fail(function(fail) {
		var failElem = showFail(fail);
		$('.search-results').append(failElem);
	});
};


