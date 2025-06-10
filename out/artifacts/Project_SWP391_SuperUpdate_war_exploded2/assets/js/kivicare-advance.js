/*
* Version: 1.4.0
* Template: kivicare - Medical Clinic & Patient Management Html Template
* Author: iqonic.design
* Design and Developed by: iqonic.design
* NOTE: This file contains the script for initialize & listener Template.
*/

/*----------------------------------------------
Index Of Script
------------------------------------------------

:: Font size change script
:: header toggle
:: Popup Action
:: Before After Image
:: progress-bar
:: Vertical Slider
:: Appointment Tab
:: Active Menu

------------------------------------------------
Index Of Script
----------------------------------------------*/

"use strict";

/*---------------------------------------------------------------------
            Font size change script
-----------------------------------------------------------------------*/

const sizes = document.querySelectorAll('[data-change="fs"]');
sizes.forEach(size => size.addEventListener('click', () => changeSize(size)));
function changeSize(params) {
  const size = params.dataset.size;
  sizes.forEach(params => params.classList.remove('btn-primary'));
  if (document.querySelector('html').style.fontSize !== size) {
    document.querySelector('html').style.fontSize = size;
    params.classList.add('btn-primary');
  } else {
    document.querySelector('html').style.removeProperty('font-size');
  }
  window.dispatchEvent(new Event('resize'));
  hideTooltip();
}

function hideTooltip() {
  const tooltipElms = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  tooltipElms.forEach(tooltipElm => {
    const tooltip = bootstrap.Tooltip.getInstance(tooltipElm)
    tooltip.hide();
  });

}

/*---------------------------------------------------------------------
            header toggle
-----------------------------------------------------------------------*/
const toggleelem = document.getElementById('navbarSupportedContent');
const offcanvasheader = document.getElementById('offcanvasBottom')
if (offcanvasheader !== null && offcanvasheader !== undefined) {
  const bsOffcanvas = new bootstrap.Offcanvas(offcanvasheader);
  toggleelem.addEventListener('show.bs.collapse', function () {
    bsOffcanvas.show()
    document.querySelector('.offcanvas-backdrop').addEventListener('click', function () {
      const toggleInstace = bootstrap.Collapse.getInstance(toggleelem)
      toggleInstace.hide()
    })
  })
  toggleelem.addEventListener('hide.bs.collapse', function () {
    bsOffcanvas.hide()
  })
}

const toggleelem1 = document.getElementById('navbarSupportedContent1');
const offcanvas = document.getElementById('offcanvasBottom1')
if (offcanvas !== null && toggleelem1 !== null) {
  const offcanvas = new bootstrap.Offcanvas();
  toggleelem1.addEventListener('show.bs.collapse', function () {
    offcanvas.show()
    document.querySelector('.offcanvas-backdrop').addEventListener('click', function () {
      const toggleInstace = bootstrap.Collapse.getInstance(toggleelem1)
      toggleInstace.hide()
    })
  })
  toggleelem1.addEventListener('hide.bs.collapse', function () {
    offcanvas.hide()
  })
}


/*---------------------------------------------------------------------
            Popup Action
-----------------------------------------------------------------------*/
$(".delete-btn").on("click", function () {
  const __this = $(this)
  Swal.fire({
    title: 'Are you sure?',
    text: "You want to delete this item",
    icon: 'error',
    showCancelButton: true,
    backdrop: `rgba(60,60,60,0.8)`,
    confirmButtonText: 'Yes, delete it!',
    confirmButtonColor: "#c03221"
  }).then((result) => {
    if (result.isConfirmed) {
      $(__this).closest('[data-item="list"]').remove();
      Swal.fire(
        'Deleted!',
        'Your item has been deleted.',
        'success'
      )
    }
  })
})

$(".wishlist-btn").on("click", function () {
  Swal.fire(
    'Added!',
    'Your item has been Added to the wishlist.',
    'success'
  )
})

$(".cart-btn").on("click", function () {
  Swal.fire(
    'Added!',
    'Your item has been Added to the cart.',
    'success'
  )
})

/*---------------------------------------------------------------------
            Before After Image
-----------------------------------------------------------------------*/
jQuery(document).ready(function() {
  const container = jQuery('.before-after-container');
  jQuery('.before-after-slider').on('input', function(e) {
    container.css('--position', e.target.value + '%');
  });
});

/*===================
 circle progress-bar
===========================*/
jQuery(function () {
  var circularProgress = jQuery(".iq-circle-progressbar");

  function checkVisibility() {
    var windowTop = jQuery(window).scrollTop();
    var windowBottom = windowTop + jQuery(window).height();

    circularProgress.each(function () {
      var elementTop = jQuery(this).offset().top;

      if (elementTop <= windowBottom && elementTop >= windowTop) {
        jQuery(this).addClass("active");
      }
    });
  }

  jQuery(document).scroll(function () {
    checkVisibility();
  });

  jQuery(window).resize(function () {
    checkVisibility();
  });

  checkVisibility(); // Check visibility on page load
});

/*---------------------------------------------------------------------
    Vertical Slider
-----------------------------------------------------------------------*/

if (document.querySelectorAll(".slider__thumbs .swiper-container").length) {
  const sliderThumbsOptions = {
    direction: "vertical",
    slidesPerView: 3,
    spaceBetween: 24,
    slideToClickedSlide: true,
    loop: true,
    loopedSlides: 5,
    navigation: {
      nextEl: ".slider__next",
      prevEl: ".slider__prev",
    },
    breakpoints: {
      0: {
        direction: "horizontal",
        slidesPerView: 3,
      },
      768: {
        direction: "vertical",
      },
    },
  };
  const sliderImagesOptions = {
    direction: "vertical",
    slidesPerView: 1,
    spaceBetween: 32,
    loop: true,
    loopedSlides: 5,
    mousewheel: true,
    navigation: {
      nextEl: ".slider__next",
      prevEl: ".slider__prev",
    },
    grabCursor: true,
    breakpoints: {
      0: {
        direction: "horizontal",
      },
      768: {
        direction: "vertical",
      },
    },
  };
  let sliderThumbs = new Swiper(
    ".slider__thumbs .swiper-container",
    sliderThumbsOptions
  );
  let sliderImages = new Swiper(
    ".slider__images .swiper-container",
    sliderImagesOptions
  );
  sliderThumbs.controller.control = sliderImages;
  sliderImages.controller.control = sliderThumbs;
  document.addEventListener("theme_scheme_direction", (e) => {
    sliderImages.destroy(true, true);
    setTimeout(() => {
      sliderThumbs = new Swiper(
        ".slider__thumbs .swiper-container",
        sliderThumbsOptions
      );
      sliderImages = new Swiper(
        ".slider__images .swiper-container",
        sliderImagesOptions
      );
      sliderThumbs.controller.control = sliderImages;
      sliderImages.controller.control = sliderThumbs;
    }, 500);
  });
}

const valuesNode = [
  document.getElementById("lower-value"), // 0
  document.getElementById("upper-value"), // 1
];
window.addEventListener("load", function () {
  if (window["product-price-range"]) {
    window["product-price-range"].on(
      "update",
      function (values, handle, unencoded, isTap, positions) {
        valuesNode[handle].innerHTML =
          "$" + Number(values[handle]).toFixed(0);
      }
    );
  }
  const pageType = IQUtils.getQueryString("type");
  switch (pageType) {
    case "product-grid":
      $(".breadcrumb-title small").text("Product Grid View");
      $(".sidebar .product-grid")
        .addClass("active")
        .parent()
        .addClass("active");
      $(".sidebar .product-grid")
        .closest(".collapse")
        .addClass("show")
        .prev()
        .attr("aria-expanded", true)
        .parent()
        .addClass("active");
      $("#grid-view-tab").tab("show");
      break;
    case "product-list":
      $(".breadcrumb-title small").text("Product List View");
      $(".sidebar .product-list")
        .addClass("active")
        .parent()
        .addClass("active");
      $(".sidebar .product-list")
        .closest(".collapse")
        .addClass("show")
        .prev()
        .attr("aria-expanded", true)
        .parent()
        .addClass("active");
      $("#list-view-tab").tab("show");
      break;
    default:
      break;
  }
});

/*---------------------------------------------------------------------
  Appointment Tab
-----------------------------------------------------------------------*/
jQuery(document).ready(function () {
  // hidden things
  jQuery(".appointment-tab-content").hide();
  jQuery("#successMessage").hide();
  // next button
  jQuery(".next").on({
    click: function () {
      jQuery("#appointment-tab-list").find(".active").next().addClass("active");
      jQuery("#appointment-tab-list").find(".active").prev().addClass("done");
      jQuery(this).parents(".appointment-content-active").fadeOut("slow", function () {
        jQuery(this).next(".appointment-content-active").fadeIn("slow");
      });
    }
  });

  // back button
  jQuery(".back").on({
    click: function () {
      jQuery("#appointment-tab-list").find(".active").last().removeClass("active");
      jQuery("#appointment-tab-list").find(".done").last().removeClass("done");
      jQuery(this).parents(".appointment-content-active").fadeOut("slow", function () {
        jQuery(this).prev(".appointment-content-active").fadeIn("slow");
      });
    }
  });

  // Confirm button
  jQuery(".confirm-button").on({
    click: function () {
      jQuery("#appointment-tab-list").find(".active").addClass("done");
      jQuery(this).parents(".appointment-content-active").fadeOut("slow", function () {
        jQuery(this).next(".appointment-content-active").fadeIn("slow");
      });
    }
  });
});

/*--------------------------------------
Active Menu
------------------------------------------*/
jQuery(document).ready(function() {
  addActiveClassToParentLinks();
});

function addActiveClassToParentLinks() {
  jQuery('header .iq-nav-menu ul li a.active').each(function() {
      jQuery(this).addClass('active');

      const parentLiWithUl = jQuery(this).closest('li:has(ul)');
      if (parentLiWithUl) {
          parentLiWithUl.find('> a').addClass('active');

          const parentUl = parentLiWithUl.closest('ul');
          if (parentUl) {
              parentUl.prev('a').addClass('active');
          }
      }
  });
}