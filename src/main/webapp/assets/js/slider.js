(function (jQuery) {
    "use strict";

    callGeneralSwiper();
    Servicesliderslider();

})(jQuery);

function callGeneralSwiper() {
    jQuery(document).find('.swiper.swiper-general').each(function () {
        let slider = jQuery(this);

        var sliderAutoplay = slider.data('autoplay');

        var breakpoint = {
            // when window width is >= 0px
            0: {
                slidesPerView: slider.data('mobile-sm'),
                spaceBetween: 30,
            },
            576: {
                slidesPerView: slider.data('mobile'),
                spaceBetween: 30,
            },
            // when window width is >= 768px
            768: {
                slidesPerView: slider.data('tab'),
                spaceBetween: 30,
            },
            // when window width is >= 1025px
            1025: {
                slidesPerView: slider.data('laptop'),
                spaceBetween: 30,
            },
            // when window width is >= 1500px
            1500: {
                slidesPerView: slider.data('slide'),
                spaceBetween: 30,
            },
        }

        if (slider.data('navigation')) {
            var navigationVal = {
                nextEl: slider.find('.swiper-button-next')[0],
                prevEl: slider.find('.swiper-button-prev')[0],
            };
        } else {
            var navigationVal = false;
        }

        if (slider.data('pagination')) {
            var paginationVal = {
                el: slider.find(".swiper-pagination")[0],
                clickable: true,
            };
        } else {
            var paginationVal = false;
        }
        var sw_config = {
            loop: slider.data('loop'),
            speed: 1000,
            spaceBetween: 30,
            slidesPerView: slider.data('slide'),
            centeredSlides: slider.data('center'),
            mousewheel: slider.data('mousewheel'),
            autoplay: sliderAutoplay,
            effect: slider.data('effect'),
            navigation: navigationVal,
            pagination: paginationVal,
            breakpoints: breakpoint,
        };
        var swiper = new Swiper(slider[0], sw_config);

        document.addEventListener("theme_scheme_direction", (e) => {
            swiper.destroy(true, true);
            setTimeout(() => {
                swiper = new Swiper(slider[0], sw_config);
            }, 500);
        });
    });
}

// Service Slider
function Servicesliderslider() {
    var $sliders = jQuery(document).find('.iq-service-slider');
    if ($sliders.length > 0) {

        $sliders.each(function (e) {

            let slider = jQuery(this);
            var swSpace = {
                1200: 30,
                1500: 30
            };

            var breakpoint = {
                0: {
                    slidesPerView: 1,
                    centeredSlides: false,
                    virtualTranslate: false
                },
                576: {
                    slidesPerView: 1,
                    centeredSlides: false,
                    virtualTranslate: false
                },
                768: {
                    slidesPerView: 2,
                    centeredSlides: false,
                    virtualTranslate: false
                },
                1200: {
                    slidesPerView: 2.3,
                    spaceBetween: swSpace["1200"],
                },
                1500: {
                    slidesPerView: 2.3,
                    spaceBetween: swSpace["1500"],
                },
            }

            var sw_config = {
                loop: true,
                speed: 1000,
                loopedSlides: 3,
                spaceBetween: 30,
                slidesPerView: 2.3,
                centeredSlides: true,
                autoplay: true,
                virtualTranslate: true,
                on: {
                    slideChangeTransitionStart: function () {
                        var currentElement = jQuery(this.el);
                        if (jQuery(window).width() > 1199) {

                            var innerTranslate = -(327 + swSpace[this.currentBreakpoint]) * (this.activeIndex) + 357;
                            currentElement.find(".swiper-wrapper").css({
                                "transform": "translate3d(" + innerTranslate + "px, 0, 0)"
                            });

                            currentElement.find('.swiper-slide:not(.swiper-slide-active)').css({
                                width: "327px"
                            });

                            currentElement.find('.swiper-slide.swiper-slide-active').css({
                                width: "685px"
                            });
                        }
                    },
                    resize: function () {
                        var currentElement = jQuery(this.el);
                        if (jQuery(window).width() > 1199) {
                            if (currentElement.data("loop")) {
                                var innerTranslate = -(327 + swSpace[this.currentBreakpoint]) * this.loopedSlides + 357;

                                currentElement.find(".swiper-wrapper").css({
                                   "transform": "translate3d(" + innerTranslate + "px, 0, 0)"
                                });
                            }
                            currentElement.find('.swiper-slide:not(.swiper-slide-active)').css({
                                width: "327px"
                            });
                            currentElement.find('.swiper-slide.swiper-slide-active').css({
                                width: "685px"
                            });
                        }
                    },
                    init: function () {
                        var currentElement = jQuery(this.el);
                        currentElement.find('.swiper-slide').css({
                            'max-width': 685
                        });
                    }
                },
                breakpoints: breakpoint,
            };
            var swiper = new Swiper(slider[0], sw_config);
        });

    }

}