/**
 * vl-tab="id_of_next"
 * vl-del="id_of_prev"
 *
 * vl-params="concatinated_validators"
 * vl-parent="id_of_form" 
 * NOTE: Attach vl-parent to anchor or button
 * The form will be crawled with all DOM with vl-params attribute
 */
function Validate()
{
    
    this.initialize = function()
    {
        //call all initial functions here
        this.tabs();
        this.deletes();
        this.checkers();

        $('body').delegate('.vl-close-button', 'click', function()
        {   
            var parent = $(this).parent().parent().parent();
            parent.append($(this).parent().parent().find('input'));
            parent.append($(this).parent().parent().find('textarea'));
            
            $(this).parent().parent().remove();
        });
    }

    //find all controls with vl-tab attribute
    //then delegate an event
    this.tabs = function()
    {
        $('[vl-tab]').each(function(index){
            $('body').delegate('#' + $(this).attr('id'), 'keydown', function(e)
            {
                code = e.keyCode || e.which;
                if(code === 13 || code === 9) {
                    $('#' + $(this).attr('vl-tab')).focus();
                    e.preventDefault();
                }
            });
        });
    }

    //If user pressed the delete button (8)
    this.deletes = function()
    {
        $('[vl-del]').each(function(index){
            $('body').delegate('#' + $(this).attr('id'), 'keydown', function(e)
            {
                code = e.keyCode || e.which;
                if (code === 8) {
                    if ($(this).val().length === 0) {

                        $('#' + $(this).attr('vl-del')).focus();
                        e.preventDefault();
                    }
                }
            });
        });
    }

    //Check if input has anything in it
    this.isRequired = function(object)
    {
        if (object.val().length === 0) {
            this.showAlert(object, object.attr('vl-caption') + " is required");
            object.focus();
            return false;
        }
        return true;
    }

    //Check for minimum length required
    this.isMin = function(object, min)
    {
        if (object.val().length < min) {
            this.showAlert(object, object.attr('vl-caption') + " must be atleast " + min + " characters");
            object.focus();
            return false;
        }
        return true;
    }

    //Check for max length 
    this.isMax = function(object, max)
    {
        if (object.val().length > max) {
            this.showAlert(object, object.attr('vl-caption') + " cannot exceed " + max + " characters");
            object.val(object.val().substr(0, max));
            object.focus();
            return false;
        }
        return true;
    }

    //Values of the first and second parameters must be equal to each other
    this.isRepeat = function(object, check)
    {
        if (object.val() !== check.val()) {
            this.showAlert(object, object.attr('vl-caption') + " and " + check.attr('vl-caption') + " fields must be equal");
            this.showAlert(check, object.attr('vl-caption') + " and " + check.attr('vl-caption') + " fields must be equal");
            object.focus();
            return false;
        }
        return true;
    }

    //during form submission
    //check all fields that needs to be checked
    this.checkField = function(object, parameter)
    {
        if (parameter == 'required') {
            if (this.isRequired(object) === false) {
                return false;
            }
        }

        if (parameter.substring(0,3) === 'min') {
            var params = parameter.split(':');
            if (this.isMin(object, params[1]) === false) {
                return false;
            }
        }

        if (parameter.substring(0,3) === 'max') {
            var params = parameter.split(':');
            if (this.isMax(object, params[1]) === false) {
                return false;
            }
        }

        if (parameter.substring(0,6) === 'repeat') {
            var params = parameter.split(':');
            if (this.isRepeat(object, $('#' + params[1])) === false) {
                return false;
            }
        }
    }

    //Create an alert DIV and wrap the input in it
    this.showAlert = function (object, message)
    {
        var div = document.createElement('div');
        $(div).addClass('vl-container');

        var msg = document.createElement('p');

        var xButton = document.createElement('span');
        var button = document.createElement('button');

        $(button).text('x');
        $(button).addClass('vl-close-button');
        $(button).attr('type', 'button');

        $(xButton).addClass('vl-close-container');
        $(xButton).append(button);

        $(msg).text(message);
        $(object).parent().append(div);
        $(div).append(object);
        $(div).append(xButton);
        $(div).append(msg);

    }

    //remove all existing alerts to replace with new ones
    this.removeAlerts = function (object)
    {
        //loop on all .vl-close-button then click
        var buttons = $('.vl-close-button');
        $.each(buttons, function(key, value){
            $(this).trigger('click');
        });
    }

    //For checkers that can be checked before submits
    //Attach a keypress event for redundancy
    this.setField = function(object, parameter)
    {
        var parent = this;
        if (parameter.substring(0,3) === 'max') {
    
            var params = parameter.split(':');
            object.attr('max-length', params[1]);

            $('body').delegate('#' + object.attr('id'), 'keydown', function(e)
            {
                parent.removeAlerts();
                if (parent.isMax(object, params[1]) === false) {
                    e.preventDefault();
                }
            });
            
            
        }
    }

    //look for DOMs that uses the library
    this.checkers = function()
    {
        var parent = this;
        $('[vl-parent]').each(function(index){

            //on load
            $('#' + $(this).attr('vl-parent') + ' [vl-param]').each(function(index){
                var object = $(this);
                var str = $(this).attr('vl-param').split('/');
                $.each(str, function(key, value){
                    parent.setField(object, value);
                });
            });

            //form submit
            $('body').delegate('#' + $(this).attr('id'), 'click', function(e)
            {
                parent.removeAlerts();
                var isSubmit = true;
                $('#' + $(this).attr('vl-parent') + ' [vl-param]').each(function(index){
                    var object = $(this);
                    var str = $(this).attr('vl-param').split('/');
                    $.each(str, function(key, value){
                        if (parent.checkField(object, value) === false) {
                            isSubmit = false;
                            return false;
                        }
                    });

                    if (isSubmit === false) {
                        return false;
                    }
                });

                if (isSubmit === true) {
                    $('#' + $(this).attr('vl-parent')).submit();
                    console.log($('#' + $(this).attr('vl-parent')));
                    return true;
                }
                e.preventDefault();
            });

        });
    }

}

//activate validator upon load of document
$(document).ready(function(){
    var validator = new Validate();
    validator.initialize();
});