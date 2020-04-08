$(document).ready(function() {
  var output = $('#output');
  var spinner = $('#spinner');

  spinner.hide();

  $('#submit-url').click(function() {
    output.empty();
    spinner.show();

    var input = {};
    input['url'] = $('#durable-function-url').val();
    input['invocationCount'] = $('#durable-function-count').val();

    $.ajax({
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(input),
      dataType: 'json',
      url: '/ajax/callout',
      cache: false,
      success: function(initialResponse) {
        spinner.hide();
        output.html(initialResponse.response);
      },
      error: function(error) {
        spinner.hide();
        alert(JSON.stringify(error));
      }
    });
  });
});