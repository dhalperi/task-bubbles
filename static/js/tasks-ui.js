$(function() {
	// New task dialog
	$('#new-task-dialog').dialog({
		autoOpen : false,
		modal : true,
		width : 350,
		buttons : {
			"Ok" : function() {
				if (validateNewForm()) {
					$('#new_task_form').submit();
					$(this).dialog("close");
				}
			},
			"Cancel" : function() {
				resetForm('new_task_form');
				$(this).dialog("close");
			}
		}
	});

	// Complete task dialog
	$('#complete-task-dialog').dialog({
		autoOpen : false,
		modal : true,
		width : 350,
		buttons : {
			"Yes" : function() {
				var id = $('#complete-task-id').val();
				$.ajax({
					url : 'task/' + id,
					type : 'DELETE',
					success : function() {
						redrawVisualization(id);
					}
				});

				$(this).dialog("close");
			},
			"Cancel" : function() {
				resetForm('complete_task_form');
				$(this).dialog("close");
			}
		}
	});

	// Dialog Link
	$('#dialog_link').click(function() {
		$('#new-task-dialog').dialog('open');
		return false;
	});

	// hover states on the static widgets
	$('#dialog_link').hover(function() {
		$(this).addClass('ui-state-hover');
	}, function() {
		$(this).removeClass('ui-state-hover');
	});

	$("#new-task").button({
		icons : {
			primary : "ui-icon-plus",
		},
		text : false
	}).click(function() {
		$("#new-task-dialog").dialog("open");
	});

	// The date picker inside the dialog
	$("#task-date").datepicker();
	// Set the date and time to 1 hour from now.
	var curTime = new Date().getTime(), oneHour = new Date(
			curTime + 60 * 60 * 1000);
	oneHour.setMinutes(0);
	oneHour.setSeconds(0);
	oneHour.setMilliseconds(0);
	var dateString = (oneHour.getMonth() + 1) + "/" + oneHour.getDate() + "/"
			+ oneHour.getFullYear(), timeString = oneHour.getHours() + ":00";
	$("#task-date").attr("value", dateString);
	$("#task-time").attr("value", timeString);
});

function resetForm(id) {
	$('#' + id).each(function() {
		this.reset();
	});
}

function validateNewForm() {
	var description = $("#description").val();
	var date_string = $("#task-date").val();
	var time_string = $("#task-time").val();
	var d = Date.parse(date_string + " " + time_string);
	var now = new Date();
	if (isNaN(d) || (d < now)) {
		return false;
	}

	if (description.length == 0) {
		return false;
	}

	$("#ends").attr("value", d);

	return true;
};

function completeTask(id) {
	$('#complete-task-id').attr("value", id);
	$('#complete-task-dialog').dialog('open');
	return false;
};
