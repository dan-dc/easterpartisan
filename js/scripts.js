
$(document).ready(function() {
	
	//	set global vars
	var $window = $(window),
		scrollPageEasing = 'easeInOutExpo'

/**********************************************************************************************
  *
  *		Parallax background image effect
  *
***********************************************************************************************/

	$.parallax({
		
		  // Set scrolling to be in either one or both directions
		  horizontalScrolling: false,
		  verticalScrolling: true,
		
		  // Set the global alignment offsets
		  horizontalOffset: 0,
		  verticalOffset: 100,
		
		  // Refreshes parallax content on window load and resize
		  responsive: true,
		
		  // Select which property is used to calculate scroll.
		  // Choose 'scroll', 'position', 'margin' or 'transform',
		  // or write your own 'scrollProperty' plugin.
		  scrollProperty: 'scroll',
		
		  // Select which property is used to position elements.
		  // Choose between 'position' or 'transform',
		  // or write your own 'positionProperty' plugin.
		  positionProperty: 'position',
		
		  // Enable or disable the two types of parallax
		  parallaxBackgrounds: true,
		  parallaxElements: true,
		
		  // Hide parallax elements that move outside the viewport
		  hideDistantElements: true,
		
		  // Customise how elements are shown and hidden
		  hideElement: function($elem) { $elem.hide(); },
		  showElement: function($elem) { $elem.show(); }
	  
	});

/**********************************************************************************************
  *
  *		Animate articles dependant on whether or not they are in the viewport
  *
***********************************************************************************************/

	$slideArticles = function() {

		var $slidescroll	= (function() {
				
				// the row elements
			var $rows = $('#container > .row'),
			
				// we will cache the inviewport rows and the outside viewport rows
				$rowsViewport, $rowsOutViewport,
				
				// navigation menu links
				$links = $('#links > li > a, h1 > a, p > a'),
				
				// the window element
				$win = $(window),
				
				// we will store the window sizes here
				winSize = {},
				
				// used in the scroll setTimeout function
				anim = false,
				
				// page scroll speed
				scrollPageSpeed	= 1500,
				
				init = function() {
					
					// get window sizes
					getWinSize();
					
					// initialize events
					initEvents();
					
					// define the inviewport selector
					defineViewport();

					// gets the elements that match the previous selector
					setViewportRows();

					// set positions for each row
					placeRows();
					
				},
				// defines a selector that gathers the row elems that are initially visible.
				// the element is visible if its top is less than the window's height.
				// these elements will not be affected when scrolling the page.
				defineViewport	= function() {
				
					$.extend( $.expr[':'], {
					
						inviewport	: function ( el ) {
							if ( $(el).offset().top < winSize.height ) {
								return true;
							}
							return false;
						}
					
					});
				
				},
				
				// checks which rows are initially visible 
				setViewportRows	= function() {
					
					$rowsViewport 		= $rows.filter(':inviewport');
					$rowsOutViewport	= $rows.not( $rowsViewport )

				},
				
				// get window sizes
				getWinSize		= function() {
				
					winSize.width	= $win.width();
					winSize.height	= $win.height();
				
				},
				
				// initialize some events
				initEvents		= function() {
					
					// navigation menu links.
					// scroll to the respective section.
					$links.on( 'click.Scrolling', function( event ) {
						
						// scroll to the element that has id = menu's href
						$('html, body').stop().animate({ scrollTop: $( $(this).attr('href') ).offset().top }, scrollPageSpeed, scrollPageEasing );
						
						return false;
					
					});
					
					// set current waypoint class
					$('.row').waypoint(function(direction) {

							if (direction === 'down') {
								$('.row').removeClass('current');
								$(this).addClass('current');
							}
							
							// test if #gallery is in view to start the slideshow
							if ( $('#gallery').hasClass('current') ) {
								$('.gallery').cycle('resume');
							} else {
								// otherwise it stays paused
								$('.gallery').cycle('pause');
							}

						}, {
							offset: '75' }).waypoint(function(direction) {
							if (direction === 'up') {
								$('.row').removeClass('current');
								$(this).addClass('current');
							}
							
							// test if #gallery is in view to start the slideshow
							if ( $('#gallery').hasClass('current') ) {
								$('.gallery').cycle('resume');
							} else {
								// otherwise it stays paused
								$('.gallery').cycle('pause');
							}

						}, { offset: '-75' });
						
						
					// set next and previous buttons	
					$('.next').click(function () {
						// if current section is not the bottom
						if ( $('.current').attr('id') != "contact") {
							$('html, body').animate({ scrollTop: $('.current').next().offset().top }, scrollPageSpeed, scrollPageEasing);
						}

						return false;
					});

					$('.prev').click(function () {
						// if current section is not the top
						if ( $('.current').attr('id') != "home") {
							$('html, body').animate({ scrollTop: $('.current').prev().offset().top }, scrollPageSpeed, scrollPageEasing);
						}
						return false;
					});

					$(window).on({
						// on window resize we need to redefine which rows are initially visible (this ones we will not animate).
						'resize.Scrolling' : function( event ) {
							
							// get the window sizes again
							getWinSize();
							// redefine which rows are initially visible (:inviewport)
							setViewportRows();
							// show inviewport rows and respective pointers
							$rowsViewport.each( function() {
								$(this).find('article')
									   .css({ left   : '0%' })
									   .end()
							});

						},
						
						// when scrolling the page change the position of each row	
						'scroll.Scrolling' : function( event ) {
							
							// set a timeout to avoid that the 
							// placeRows function gets called on every scroll trigger
							if( anim ) return false;
							anim = true;
							setTimeout( function() {
								
								placeRows();
								anim = false;
								
							}, 10 );
						
						}
					});
				
				},
				// sets the position of the rows (left and right row elements).
				// Both of these elements will start with -50% for the left/right (not visible)
				// and this value should be 0% (final position) when the element is on the
				// center of the window.
				placeRows = function() {

						// how much we scrolled so far
					var winscroll	= $win.scrollTop(),
					
						// the y value for the center of the screen
						winCenter	= winSize.height / 2 + winscroll;
					
					// for every row that is not inviewport
					$rowsOutViewport.each( function(i) {
						
						var $row = $(this),
						
						// the left side element
						$rowL = $row.find('article'),
						
						// top value
						rowT = $row.offset().top;
						
					  	// hide the row if it is under the viewport :
					  
						// row's height
						var rowH = $row.height(),
						  
						// the value on each scrolling step will be proporcional to the distance from the center of the screen to its height
						  factor = ( ( (rowT + rowH / 2) - winCenter ) / ( winSize.height / 2 + rowH / 2 ) ),
						  
						  // value for the left / right of each side of the row.
						  // 0% is the limit
						  val = Math.max( factor * 50, 0 );
						  
						  var o = Math.min( Math.abs( factor - 1 ), 1 );
						  
						  $rowL.css({
							  left 	: - val + '%',
							  'opacity'			: o
						  });

					});
				
				};
			
			return { init : init };
		
		})();
		
		$slidescroll.init();
		
	};
	
	$slideArticles();
	
/**********************************************************************************************
  *
  *		Add Debounce / Smart Resize functions
  *
***********************************************************************************************/
	
	/* 
	 * calls the function once the resize action has completed
	 * instead of the out of the box .resize() jquery function
	 * which calls the function repeatedly from resize init
	 *
	 */
	
	(function($,sr){
	
	  // debouncing function from John Hann
	  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
	  var debounce = function (func, threshold, execAsap) {
		  var timeout;
	
		  return function debounced () {
			  var obj = this, args = arguments;
			  function delayed () {
				  if (!execAsap)
					  func.apply(obj, args);
				  timeout = null;
			  };
	
			  if (timeout)
				  clearTimeout(timeout);
			  else if (execAsap)
				  func.apply(obj, args);
	
			  timeout = setTimeout(delayed, threshold || 100);
		  };
	  }
	  
	  // smartresize 
	  jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
	
	})(jQuery,'smartresize'); // debounce()


	/* 
	 * call on resize – if not mobile
	 * 
	 */	
	
	$(window).smartresize( function() {
		/*
		if(! /iPhone|iPad|iPod|Android|webOS|BlackBerry/i.test(navigator.userAgent) ) {		
			$('html, body').animate({ scrollTop: $('.current').offset().top }, 300, scrollPageEasing);
		}
		*/
//		alert('yep')
	});

/**********************************************************************************************
  *
  *		Add scroll snapping
  *
***********************************************************************************************/
	

	if(! /iPhone|iPad|iPod|Android|webOS|BlackBerry/i.test(navigator.userAgent) ) {		

		var $windows = $('.row');
	
		$windows.windows({
			snapping: true,
			snapSpeed: 1000,
			snapInterval: 1000,
			onScroll: function(s){},
			onSnapComplete: function($el){},
			onWindowEnter: function($el){}
		});
	}
	
/**********************************************************************************************
  *
  *		Add news carousel
  *
***********************************************************************************************/

	$('.carousel').bxSlider({
		minSlides: 2,
		maxSlides: 4,
		slideWidth: 400,
		slideMargin: 20,
		speed : 1500,
		moveSlides: 1,
		//infiniteLoop:false,
		easing:scrollPageEasing,
		responsive:true,
		nextSelector: '.next-carousel',
		//prevSelector: '.prev-carousel',
		nextText: '&laquo;',
		//prevText: '&laquo;',
		hideControlOnEnd: true,
		pager:false
	});

/**********************************************************************************************
  *
  *		Add gallery
  *
***********************************************************************************************/

	$('.gallery div').height( $(window).height() )
	
	/*
	 * Note: start/stop function triggered if #gallery
	 * is in view (see waypoint function line 148 )
	 *
	 */
	
	$('.gallery').cycle({
		pager	:	'#control',
		prev	:	'.prev-gallery',
		next	:	'.next-gallery',
		before	:	function(){ $('#caption').fadeOut(); },		
		after	:	function(){ $('#caption').html( $('.gallery div:visible').data('caption') ).fadeIn(); }		
	});	


}); // doc ready
