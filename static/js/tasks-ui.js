$(function() {
    // New task dialog
    $('#new-task-dialog').dialog({
        autoOpen : false,
        modal : true,
        width : 350,
        buttons : {
            "Ok" : function() {
                if (validateNewForm()) {
                    $.ajax({
                        url : 'task?description='
                            + $('#new-task-description').val()
                            + '&ends=' + $('#new-task-ends').val(),
                        type : 'POST',
                        success : function() {
                            redrawVisualization();
                        }
                    });
                    $(this).dialog("close");
                    resetForm('new-task-form');
                }
            },
            "Cancel" : function() {
                resetForm('new-task-form');
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
                        redrawVisualization();
                    }
                });
                $(this).dialog("close");
            },
            "Cancel" : function() {
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
    $("#new-task-date").datepicker();
    // Set the date and time to 1 hour from now.
    var curTime = new Date().getTime(), oneHour = new Date(
            curTime + 60 * 60 * 1000);
    oneHour.setMinutes(0);
    oneHour.setSeconds(0);
    oneHour.setMilliseconds(0);
    var dateString = (oneHour.getMonth() + 1) + "/" + oneHour.getDate() + "/"
            + oneHour.getFullYear(), timeString = oneHour.getHours() + ":00";
    $("#new-task-date").attr("value", dateString);
    $("#new-task-time").attr("value", timeString);
});

function resetForm(id) {
    $('#' + id).each(function() {
        this.reset();
    });
}

function validateNewForm() {
    var description = $("#new-task-description").val();
    var date_string = $("#new-task-date").val();
    var time_string = $("#new-task-time").val();
    var d = Date.parse(date_string + " " + time_string);
    var now = new Date();
    if (isNaN(d) || (d < now)) {
        return false;
    }

    if (description.length == 0) {
        return false;
    }

    $("#new-task-ends").attr("value", d);

    return true;
};

function completeTask(id) {
    $('#complete-task-id').attr("value", id);
    $('#complete-task-dialog').dialog('open');
    return false;
};
