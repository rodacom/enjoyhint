var EnjoyHint = function (_options) {
    var that = this;
    // Some options
    var defaults = {
        onStart: function () {

        },
        onEnd: function () {

        },
        nextButtonLabel: "Next",
        skipButtonLabel: "Skip"
    };
    var options = $.extend(defaults, _options);


    var data = [];
    var current_step = 0;

    $body = $('body');

    /********************* PRIVAT METHODS ***************************************/
    var init = function () {
        if ($('.enjoyhint'))
            $('.enjoyhint').remove();
        $('body').css({'overflow': 'hidden'});
        $(document).on("touchmove", lockTouch);

        $body.enjoyhint({
            onNextClick: function () {
                nextStep();
            },
            onSkipClick: function () {
                skipAll();
            }
        });
    };

    var lockTouch = function (e) {
        e.preventDefault();
    };

    var destroyEnjoy = function () {
        options.onEnd();
        $body = $('body');
        $('.enjoyhint').remove();
        $("body").css({'overflow': 'auto'});
        $(document).off("touchmove", lockTouch);

    };

    that.clear = function () {
        //(Remove userClass and set default text)
        $(".enjoyhint_next_btn").removeClass(that.nextUserClass);
        $(".enjoyhint_next_btn").text(options.nextButtonLabel);
        $(".enjoyhint_skip_btn").removeClass(that.skipUserClass);
        $(".enjoyhint_skip_btn").text(options.skipButtonLabel);
    };

    var $body = $('body');


    var callAfterEnd = function(step_data){
        if (step_data.onAfterEnd && typeof step_data.onAfterEnd === 'function') {
            step_data.onAfterEnd();
        }
    };

    var nextStep = function () {
        callAfterEnd(data[current_step]);
        current_step++;
        stepAction();
    };

    var skipAll = function () {
        var step_data = data[current_step];
        callAfterEnd(data[current_step]);
        var $element = $(step_data.selector);
        off(step_data.event);
        $element.off(makeEventName(step_data.event));
        destroyEnjoy();
    };

    var stepAction = function () {
        if (data && data[current_step]) {
            $(".enjoyhint").removeClass("enjoyhint-step-" + current_step);
            $(".enjoyhint").addClass("enjoyhint-step-" + (current_step + 1));
            var step_data = data[current_step];
            if (step_data.onBeforeStart && typeof step_data.onBeforeStart === 'function') {
                step_data.onBeforeStart();
            }
            var timeout = step_data.timeout || 0;
            setTimeout(function () {
                if (!step_data.selector) {
                    for (var prop in step_data) {
                        if (step_data.hasOwnProperty(prop) && prop.split(" ")[1]) {
                            var space_index = prop.indexOf(" ");
                            step_data.event = prop.slice(0, space_index);
                            step_data.selector = prop.slice(space_index + 1);
                            if (step_data.event == 'next' || step_data.event == 'auto' || step_data.event == 'custom') {
                                step_data.event_type = step_data.event;
                            }
                            step_data.description = step_data[prop];
                        }
                    }
                }
                setTimeout(function () {
                    that.clear();
                }, 250);
                var $element = $(step_data.selector);
                if ($element.length > 0 && $element.is(':visible')) {

                    $('html, body').animate({
                        scrollTop: $(step_data.selector).offset().top + (!isNaN(parseInt(step_data.scrollOffset)) ? step_data.scrollOffset : -100)
                    }, step_data.scrollAnimationSpeed || 250);

                    setTimeout(function () {
                        var event = makeEventName(step_data.event);

                        $body.enjoyhint('show');
                        $body.enjoyhint('hide_next');
                        var $event_element = $element;
                        if (step_data.event_selector) {
                            $event_element = $(step_data.event_selector);
                        }
                        if (!step_data.event_type && step_data.event == "key") {
                            $element.keydown(function (event) {
                                if (event.which == step_data.keyCode) {
                                    current_step++;
                                    stepAction();
                                }
                            });
                        }
                        if (step_data.showNext == true) {
                            $body.enjoyhint('show_next');
                        }
                        if (step_data.showSkip == false) {
                            $body.enjoyhint('hide_skip');
                        } else {
                            $body.enjoyhint('show_skip');
                        }
                        if (step_data.showSkip == true) {

                        }


                        if (step_data.nextButton) {
                            $(".enjoyhint_next_btn").addClass(step_data.nextButton.className || "");
                            $(".enjoyhint_next_btn").text(step_data.nextButton.text || options.nextButtonLabel);
                            that.nextUserClass = step_data.nextButton.className
                        }

                        if (step_data.skipButton) {
                            $(".enjoyhint_skip_btn").addClass(step_data.skipButton.className || "");
                            $(".enjoyhint_skip_btn").text(step_data.skipButton.text || options.skipButtonLabel);
                            that.skipUserClass = step_data.skipButton.className
                        }

                        if (step_data.event_type) {
                            switch (step_data.event_type) {
                                case 'auto':
                                    $element[step_data.event]();
                                    switch (step_data.event) {
                                        case 'click':
                                            break;
                                    }
                                    nextStep();
                                    return;
                                    break;
                                case 'custom':
                                    on(step_data.event, function () {
                                        off(step_data.event);
                                        nextStep();
                                    });
                                    break;
                                case 'next':
                                    $body.enjoyhint('show_next');
                                    break;

                            }

                        } else {
                            $event_element.on(event, function (e) {
                                if (step_data.keyCode && e.keyCode != step_data.keyCode) {
                                    return;
                                }
                                $event_element.off(event);
                                nextStep();
                            });

                        }
                        var max_habarites = Math.max($element.outerWidth(), $element.outerHeight());
                        var radius = step_data.radius || Math.round(max_habarites / 2) + 5;
                        var offset = $element.offset();
                        var w = $element.outerWidth();
                        var h = $element.outerHeight();

                        var shape_margin = (step_data.margin !== undefined) ? step_data.margin : 10;

                        var shape_margin_x = (step_data.margin_x !== undefined) ? step_data.margin_x : shape_margin;
                        var shape_margin_y = (step_data.margin_y !== undefined) ? step_data.margin_y : shape_margin;

                        var shape_shift_x = (step_data.shift_x !== undefined) ? step_data.shift_x : 0;
                        var shape_shift_y = (step_data.shift_y !== undefined) ? step_data.shift_y : 0;

                        var coords = {
                            x: offset.left + Math.round(w / 2),
                            y: offset.top + Math.round(h / 2) - $(document).scrollTop()
                        };
                        var shape_data = {
                            center_x: coords.x,
                            center_y: coords.y,
                            text: step_data.description,
                            top: step_data.top,
                            bottom: step_data.bottom,
                            left: step_data.left,
                            right: step_data.right,
                            margin: shape_margin,
                            scroll: step_data.scroll,
                            arrow: step_data.showArrow === undefined ? true : step_data.showArrow === true
                        };

                        if (step_data.shape && step_data.shape == 'circle') {
                            shape_data.shape = 'circle';
                            shape_data.radius = radius;
                        } else {
                            shape_data.radius = 0;
                            shape_data.width = w + shape_margin;
                            shape_data.height = h + shape_margin;
                        }

                        shape_data.center_x += shape_shift_x;
                        shape_data.center_y += shape_shift_y;

                        $body.enjoyhint('render_label_with_shape', shape_data);

                    }, step_data.scrollAnimationSpeed + 20 || 270);
                } else {
                    nextStep();
                }
            }, timeout);
        } else {
            $body.enjoyhint('hide');
            destroyEnjoy();
        }

    };

    var makeEventName = function (name, is_custom) {
        return name + (is_custom ? 'custom' : '') + '.enjoy_hint';
    };

    var on = function (event_name, callback) {
        $body.on(makeEventName(event_name, true), callback);
    };
    var off = function (event_name) {
        $body.off(makeEventName(event_name, true));
    };

    /********************* PUBLIC METHODS ***************************************/
    that.runScript = function () {
        current_step = 0;
        options.onStart();
        stepAction();
    };

    that.resumeScript = function () {
        stepAction();
    };

    that.getCurrentStep = function () {
        return current_step;
    };

    that.trigger = function (event_name) {
        switch (event_name) {
            case 'next':
                nextStep();
                break;
            case 'skip':
                skipAll();
                break;
            default:
                $body.trigger(makeEventName(event_name, true));
                break;
        }
    };

    that.setScript = function (_data) {
        if (_data) {
            data = _data;
        }
    };

    //support deprecated API methods
    that.set = function (_data) {
        that.setScript(_data);
    };

    that.setSteps = function (_data) {
        that.setScript(_data);
    };

    that.run = function () {
        that.runScript();
    };

    that.resume = function () {
        that.resumeScript();
    };


    init();
};
