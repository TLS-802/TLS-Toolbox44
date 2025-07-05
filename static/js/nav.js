/*! Hugo版WebStack主题
* https://github.com/oulh/hugo-webstack */
console.log("\n %c Hugo版WebStack主题 %c https://github.com/oulh/hugo-webstack \n", "color: #ffffff; background: #f44336; padding:5px 0;", "background: #030303; padding:5px 0;");
var public_vars = public_vars || {};
jQuery.extend(public_vars, {
	breakpoints: {
		largescreen: 	[991, -1],
		tabletscreen: 	[768, 990],
		devicescreen: 	[420, 767],
		sdevicescreen:	[0, 419]
	},
	lastBreakpoint: null
});
/* Main Function that will be called each time when the screen breakpoint changes */
function resizable(breakpoint)
{
	var sb_with_animation;
	// Large Screen Specific Script
	if(is('largescreen'))
	{
	}
	// Tablet or larger screen
	if(ismdxl())
	{
	}
	// Tablet Screen Specific Script
	if(is('tabletscreen'))
	{
	}
	// Tablet device screen
	if(is('tabletscreen'))
	{
		public_vars.$sidebarMenu.addClass('collapsed');
		ps_destroy();
	}
	// Tablet Screen Specific Script
	if(isxs())
	{
	}
	// Trigger Event
	jQuery(window).trigger('xenon.resize');
}
// Get current breakpoint
function get_current_breakpoint()
{
	var width = jQuery(window).width(),
		breakpoints = public_vars.breakpoints;
	for(var breakpont_label in breakpoints)
	{
		var bp_arr = breakpoints[breakpont_label],
			min = bp_arr[0],
			max = bp_arr[1];
		if(max == -1)
			max = width;
		if(min <= width && max >= width)
		{
			return breakpont_label;
		}
	}
	return null;
}
// Check current screen breakpoint
function is(screen_label)
{
	return get_current_breakpoint() == screen_label;
}
// Is xs device
function isxs()
{
	return is('devicescreen') || is('sdevicescreen');
}
// Is md or xl
function ismdxl()
{
	return is('tabletscreen') || is('largescreen');
}
// Trigger Resizable Function
function trigger_resizable()
{
	if(public_vars.lastBreakpoint != get_current_breakpoint())
	{
		public_vars.lastBreakpoint = get_current_breakpoint();
		resizable(public_vars.lastBreakpoint);
	}
	// Trigger Event (Repeated)
	jQuery(window).trigger('xenon.resized');
}

;(function($, window, undefined)
{
	"use strict";
	$(document).ready(function()
	{
		// 初始化公共变量
		public_vars.$body = $("body");
		public_vars.$pageContainer = public_vars.$body.find(".page-container");
		public_vars.$chat = public_vars.$pageContainer.find("#chat");
		public_vars.$sidebarMenu = public_vars.$pageContainer.find('.sidebar-menu');
		public_vars.$sidebarProfile = public_vars.$sidebarMenu.find('.sidebar-user-info');
		public_vars.$mainMenu = public_vars.$sidebarMenu.find('.main-menu');
		public_vars.$horizontalNavbar = public_vars.$body.find('.navbar.horizontal-menu');
		public_vars.$horizontalMenu = public_vars.$horizontalNavbar.find('.navbar-nav');
		public_vars.$mainContent = public_vars.$pageContainer.find('.main-content');
		public_vars.$mainFooter = public_vars.$body.find('footer.main-footer');
		public_vars.$userInfoMenuHor = public_vars.$body.find('.navbar.horizontal-menu');
		public_vars.$userInfoMenu = public_vars.$body.find('nav.navbar.user-info-navbar');
		public_vars.$settingsPane = public_vars.$body.find('.settings-pane');
		public_vars.$settingsPaneIn = public_vars.$settingsPane.find('.settings-pane-inner');
		public_vars.wheelPropagation = true;
		public_vars.defaultColorsPalette = ['#68b828','#7c38bc','#0e62c7','#fcd036','#4fcdfc','#00b19d','#ff6264','#f7aa47'];
		
		// 设置默认动画持续时间
		var sm_animation_duration = 0.3; // 秒
		if(public_vars.$mainMenu.length)
		{
			var sm_duration = sm_animation_duration;
			sm_transition_delay = 0.1; // 秒
		}
		
		// 设置自动大小调整
		$(window).on('resize', function()
		{
			trigger_resizable();
		});
		
		// 初始化菜单
		setup_sidebar_menu();
		setup_horizontal_menu();
		
		// 确保所有带有子菜单的项目都有 has-sub 类
		public_vars.$sidebarMenu.find('li:has(> ul)').addClass('has-sub');
		
		// 粘性页脚
		stickFooterToBottom();
		$(window).on('resize', stickFooterToBottom);
		
		// 滚动条
		if($.isFunction($.fn.perfectScrollbar))
		{
			if(public_vars.$sidebarMenu.hasClass('fixed'))
				ps_init();
			$(".ps-scrollbar").each(function(i, el)
			{
				var $el = $(el);
				if($el.hasClass('ps-scroll-down'))
				{
					$el.scrollTop($el.prop('scrollHeight'));
				}
				$el.perfectScrollbar({
					wheelPropagation: false
				});
			});
			
			// Chat Scrollbar
			var $chat_inner = public_vars.$pageContainer.find('#chat .chat-inner');
			if($chat_inner.parent().hasClass('fixed'))
				$chat_inner.css({maxHeight: $(window).height()}).perfectScrollbar();
			
			
			// User info opening dropdown trigger PS update
			$(".dropdown:has(.ps-scrollbar)").each(function(i, el)
			{
				var $scrollbar = $(this).find('.ps-scrollbar');
				$(this).on('click', '[data-toggle="dropdown"]', function(ev)
				{
					ev.preventDefault();
					setTimeout(function()
					{
						$scrollbar.perfectScrollbar('update');
					}, 1);
				});
			});
			
			
			// Scrollable
			$("div.scrollable").each(function(i, el)
			{
				var $this = $(el),
					max_height = parseInt(attrDefault($this, 'max-height', 200), 10);
				max_height = max_height < 0 ? 200 : max_height;
				$this.css({maxHeight: max_height}).perfectScrollbar({
					wheelPropagation: true
				});
			});
		}
		
		// 移动设备的菜单切换
		$('a[data-toggle="sidebar"]').each(function(i, el)
		{
			$(el).on('click', function(ev)
			{
				ev.preventDefault();
				
				if(public_vars.$mainMenu.hasClass('mobile-is-visible'))
				{
					public_vars.$mainMenu.removeClass('mobile-is-visible');
					public_vars.$sidebarMenu.removeClass('mobile-is-visible');
				}
				else
				{
					public_vars.$mainMenu.addClass('mobile-is-visible');
					public_vars.$sidebarMenu.addClass('mobile-is-visible');
					
					setTimeout(function()
					{
						public_vars.$sidebarMenu.addClass('mobile-is-visible');
					}, 200);
				}
			});
		});
		
		// Mobile Menu Trigger
		$('a[data-toggle="mobile-menu"]').on('click', function(ev)
		{
			ev.preventDefault();
			public_vars.$mainMenu.add(public_vars.$sidebarProfile).toggleClass('mobile-is-visible');
			if($("#main-menu").hasClass('mobile-is-visible') === true){
				public_vars.$sidebarMenu.removeClass('collapsed');
				$(".sidebar-menu-inner").css("max-height",window.innerHeight);
				ps_init();
			}
		});
		
		// Mobile User Info Menu Trigger
		$('a[data-toggle="user-info-menu"]').on('click', function(ev)
		{
			ev.preventDefault();
			public_vars.$userInfoMenu.toggleClass('mobile-is-visible');
		});
		
		// Panel Close
		$('body').on('click', '.panel a[data-toggle="remove"]', function(ev)
		{
			ev.preventDefault();
			
			var $panel = $(this).closest('.panel'),
				$panel_parent = $panel.parent();
			
			$panel.remove();
			
			if($panel_parent.children().length == 0)
			{
				$panel_parent.remove();
			}
		});
		
		// Panel Reload
		$('body').on('click', '.panel a[data-toggle="reload"]', function(ev)
		{
			ev.preventDefault();
			
			var $panel = $(this).closest('.panel');
			
			// This is just a simulation, nothing is going to be reloaded
			$panel.append('<div class="panel-disabled"><div class="loader-1"></div></div>');
			
			var $pd = $panel.find('.panel-disabled');
			
			setTimeout(function()
			{
				$pd.fadeOut('fast', function()
				{
					$pd.remove();
				});
				
			}, 500 + 300 * (Math.random() * 5));
		});
		
		// Panel Expand/Collapse Toggle
		$('body').on('click', '.panel a[data-toggle="panel"]', function(ev)
		{
			ev.preventDefault();
			
			var $panel = $(this).closest('.panel');
			
			$panel.toggleClass('collapsed');
		});
		
		// 返回顶部按钮
		$('a[rel="go-top"]').on('click', function(ev)
		{
			ev.preventDefault();
			
			var obj = {pos: $(window).scrollTop()};
			
			TweenLite.to(obj, .3, {pos: 0, ease:Power4.easeOut, onUpdate: function()
			{
				$(window).scrollTop(obj.pos);
			}});
		});
	});
})(jQuery, window);

/**
 *	Xenon Main
 *
 **/
var public_vars = public_vars || {};
;(function($, window, undefined){
	"use strict";
	$(document).ready(function()
	{
		// Main Vars
		public_vars.$body                 = $("body");
		public_vars.$pageContainer        = public_vars.$body.find(".page-container");
		public_vars.$chat                 = public_vars.$pageContainer.find("#chat");
		public_vars.$sidebarMenu          = public_vars.$pageContainer.find('.sidebar-menu');
		public_vars.$sidebarProfile       = public_vars.$sidebarMenu.find('.sidebar-user-info');
		public_vars.$mainMenu             = public_vars.$sidebarMenu.find('.main-menu');
		public_vars.$horizontalNavbar     = public_vars.$body.find('.navbar.horizontal-menu');
		public_vars.$horizontalMenu       = public_vars.$horizontalNavbar.find('.navbar-nav');
		public_vars.$mainContent          = public_vars.$pageContainer.find('.main-content');
		public_vars.$mainFooter           = public_vars.$body.find('footer.main-footer');
		public_vars.$userInfoMenuHor      = public_vars.$body.find('.navbar.horizontal-menu');
		public_vars.$userInfoMenu         = public_vars.$body.find('nav.navbar.user-info-navbar');
		public_vars.$settingsPane         = public_vars.$body.find('.settings-pane');
		public_vars.$settingsPaneIn       = public_vars.$settingsPane.find('.settings-pane-inner');
		public_vars.wheelPropagation      = true; // used in Main menu (sidebar)
		public_vars.$pageLoadingOverlay   = public_vars.$body.find('.page-loading-overlay');
		public_vars.defaultColorsPalette = ['#68b828','#7c38bc','#0e62c7','#fcd036','#4fcdfc','#00b19d','#ff6264','#f7aa47'];
		// Setup Sidebar Menu
		setup_sidebar_menu();
		// Setup Horizontal Menu
		setup_horizontal_menu();
		// Sticky Footer
		if(public_vars.$mainFooter.hasClass('sticky'))
		{
			stickFooterToBottom();
			$(window).on('xenon.resized', stickFooterToBottom);
		}
		// Perfect Scrollbar
		if($.isFunction($.fn.perfectScrollbar))
		{
			if(public_vars.$sidebarMenu.hasClass('fixed'))
				ps_init();
			$(".ps-scrollbar").each(function(i, el)
			{
				var $el = $(el);
				if($el.hasClass('ps-scroll-down'))
				{
					$el.scrollTop($el.prop('scrollHeight'));
				}
				$el.perfectScrollbar({
					wheelPropagation: false
				});
			});
			// Chat Scrollbar
			var $chat_inner = public_vars.$pageContainer.find('#chat .chat-inner');
			if($chat_inner.parent().hasClass('fixed'))
				$chat_inner.css({maxHeight: $(window).height()}).perfectScrollbar();
			// User info opening dropdown trigger PS update
			$(".dropdown:has(.ps-scrollbar)").each(function(i, el)
			{
				var $scrollbar = $(this).find('.ps-scrollbar');
				$(this).on('click', '[data-toggle="dropdown"]', function(ev)
				{
					ev.preventDefault();
					setTimeout(function()
					{
						$scrollbar.perfectScrollbar('update');
					}, 1);
				});
			});
			// Scrollable
			$("div.scrollable").each(function(i, el)
			{
				var $this = $(el),
					max_height = parseInt(attrDefault($this, 'max-height', 200), 10);
				max_height = max_height < 0 ? 200 : max_height;
				$this.css({maxHeight: max_height}).perfectScrollbar({
					wheelPropagation: true
				});
			});
		}
		// Go to top links
		$('body').on('click', 'a[rel="go-top"]', function(ev)
		{
			ev.preventDefault();
			var obj = {pos: $(window).scrollTop()};
			TweenLite.to(obj, .3, {pos: 0, ease:Power4.easeOut, onUpdate: function()
			{
				$(window).scrollTop(obj.pos);
			}});
		});
		// Auto hidden breadcrumbs
		$(".breadcrumb.auto-hidden").each(function(i, el)
		{
			var $bc = $(el),
				$as = $bc.find('li a'),
				collapsed_width = $as.width(),
				expanded_width = 0;
			$as.each(function(i, el)
			{
				var $a = $(el);
				expanded_width = $a.outerWidth(true) + 5;
				$a.addClass('collapsed').width(expanded_width);
				$a.hover(function()
				{
					$a.removeClass('collapsed');
				},
				function()
				{
					$a.addClass('collapsed');
				});
			});
		});
	});
	// Enable/Disable Resizable Event
	var wid = 0;
	$(window).resize(function() {
		clearTimeout(wid);
		wid = setTimeout(trigger_resizable, 200);
	});
})(jQuery, window);
// Sideber Menu Setup function
var sm_duration = .2,
	sm_transition_delay = 150;
function setup_sidebar_menu()
{
	if(public_vars.$sidebarMenu.length)
	{
		var $items_with_subs = public_vars.$sidebarMenu.find('li:has(> ul)'),
			toggle_others = public_vars.$sidebarMenu.hasClass('toggle-others');
		
		// 确保所有带有子菜单的项都有 has-sub 类
		$items_with_subs.addClass('has-sub');
		
		// 已激活的项添加 expanded 类
		$items_with_subs.filter('.active').addClass('expanded');
		
		// On larger screens collapse sidebar when the window is tablet screen
		if(is('largescreen') && public_vars.$sidebarMenu.hasClass('collapsed') == false)
		{
			$(window).on('resize', function()
			{
				if(is('tabletscreen'))
				{
					public_vars.$sidebarMenu.addClass('collapsed');
					ps_destroy();
				}
				else
				if(is('largescreen'))
				{
					public_vars.$sidebarMenu.removeClass('collapsed');
					ps_init();
				}
			});
		}
		
		$items_with_subs.each(function(i, el)
		{
			var $li = jQuery(el),
				$a = $li.children('a'),
				$sub = $li.children('ul');
			
			$a.on('click', function(ev)
			{
				ev.preventDefault();
				
				if(toggle_others)
				{
					sidebar_menu_close_items_siblings($li);
				}
				
				if($li.hasClass('expanded') || $li.hasClass('opened'))
					sidebar_menu_item_collapse($li, $sub);
				else
					sidebar_menu_item_expand($li, $sub);
			});
		});
	}
}
function sidebar_menu_item_expand($li, $sub)
{
	if($li.data('is-busy') || ($li.parent('.main-menu').length && public_vars.$sidebarMenu.hasClass('collapsed')))
		return;
	
	$li.addClass('expanded').data('is-busy', true);
	$sub.show();
	
	var $sub_items 	  = $sub.children(),
		sub_height	= $sub.outerHeight(),
		win_y			 = jQuery(window).height(),
		total_height	  = $li.outerHeight(),
		current_y		 = public_vars.$sidebarMenu.scrollTop(),
		item_max_y		= $li.position().top + current_y,
		fit_to_viewpport  = public_vars.$sidebarMenu.hasClass('fit-in-viewport');
	
	$sub_items.addClass('is-hidden');
	$sub.height(0);
	
	TweenMax.to($sub, sm_duration, {css: {height: sub_height}, onUpdate: ps_update, onComplete: function(){
		$sub.height('');
	}});
	
	var interval_1 = $li.data('sub_i_1'),
		interval_2 = $li.data('sub_i_2');
	
	window.clearTimeout(interval_1);
	
	interval_1 = setTimeout(function()
	{
		$sub_items.each(function(i, el)
		{
			var $sub_item = jQuery(el);
			$sub_item.addClass('is-shown');
		});
		
		var finish_on = sm_transition_delay * $sub_items.length,
			t_duration = parseFloat($sub_items.eq(0).css('transition-duration')),
			t_delay = parseFloat($sub_items.last().css('transition-delay'));
		
		if(t_duration && t_delay)
		{
			finish_on = (t_duration + t_delay) * 1000;
		}
		
		// In the end
		window.clearTimeout(interval_2);
		interval_2 = setTimeout(function()
		{
			$sub_items.removeClass('is-hidden is-shown');
		}, finish_on);
		
		$li.data('is-busy', false);
	}, 0);
	
	$li.data('sub_i_1', interval_1),
	$li.data('sub_i_2', interval_2);
}
function sidebar_menu_item_collapse($li, $sub)
{
	if($li.data('is-busy'))
		return;
	
	var $sub_items = $sub.children();
	
	$li.removeClass('expanded').data('is-busy', true);
	$sub_items.addClass('hidden-item');
	
	TweenMax.to($sub, sm_duration, {css: {height: 0}, onUpdate: ps_update, onComplete: function()
	{
		$li.data('is-busy', false).removeClass('opened');
		$sub.attr('style', '').hide();
		$sub_items.removeClass('hidden-item');
		$li.find('li.expanded ul').attr('style', '').hide().parent().removeClass('expanded');
		ps_update(true);
	}});
}
function sidebar_menu_close_items_siblings($li)
{
	$li.siblings().not($li).filter('.expanded, .opened').each(function(i, el)
	{
		var $_li = jQuery(el),
			$_sub = $_li.children('ul');
		sidebar_menu_item_collapse($_li, $_sub);
	});
}
// Horizontal Menu
function setup_horizontal_menu()
{
	if(public_vars.$horizontalMenu.length)
	{
		var $items_with_subs = public_vars.$horizontalMenu.find('li:has(> ul)'),
			click_to_expand = public_vars.$horizontalMenu.hasClass('click-to-expand');
		if(click_to_expand)
		{
			public_vars.$mainContent.add( public_vars.$sidebarMenu ).on('click', function(ev)
			{
				$items_with_subs.removeClass('hover');
			});
		}
		$items_with_subs.each(function(i, el)
		{
			var $li = jQuery(el),
				$a = $li.children('a'),
				$sub = $li.children('ul'),
				is_root_element = $li.parent().is('.navbar-nav');
			$li.addClass('has-sub');
			// Mobile Only
			$a.on('click', function(ev)
			{
				if(isxs())
				{
					ev.preventDefault();
					// Automatically will toggle other menu items in mobile view
					if(true)
					{
						sidebar_menu_close_items_siblings($li);
					}
					if($li.hasClass('expanded') || $li.hasClass('opened'))
						sidebar_menu_item_collapse($li, $sub);
					else
						sidebar_menu_item_expand($li, $sub);
				}
			});
			// Click To Expand
			if(click_to_expand)
			{
				$a.on('click', function(ev)
				{
					ev.preventDefault();
					if(isxs())
						return;
					// For parents only
					if(is_root_element)
					{
						$items_with_subs.filter(function(i, el){ return jQuery(el).parent().is('.navbar-nav'); }).not($li).removeClass('hover');
						$li.toggleClass('hover');
					}
					// Sub menus
					else
					{
						var sub_height;
						// To Expand
						if($li.hasClass('expanded') == false)
						{
							$li.addClass('expanded');
							$sub.addClass('is-visible');
							sub_height = $sub.outerHeight();
							$sub.height(0);
							TweenLite.to($sub, .15, {css: {height: sub_height}, ease: Sine.easeInOut, onComplete: function(){ $sub.attr('style', ''); }});
							// Hide Existing in the list
							$li.siblings().find('> ul.is-visible').not($sub).each(function(i, el)
							{
								var $el = jQuery(el);
								sub_height = $el.outerHeight();
								$el.removeClass('is-visible').height(sub_height);
								$el.parent().removeClass('expanded');
								TweenLite.to($el, .15, {css: {height: 0}, onComplete: function(){ $el.attr('style', ''); }});
							});
						}
						// To Collapse
						else
						{
							sub_height = $sub.outerHeight();
							$li.removeClass('expanded');
							$sub.removeClass('is-visible').height(sub_height);
							TweenLite.to($sub, .15, {css: {height: 0}, onComplete: function(){ $sub.attr('style', ''); }});
						}
					}
				});
			}
			// Hover To Expand
			else
			{
				$li.hoverIntent({
					over: function()
					{
						if(isxs())
							return;
						if(is_root_element)
						{
							$li.addClass('hover');
						}
						else
						{
							$sub.addClass('is-visible');
							sub_height = $sub.outerHeight();
							$sub.height(0);
							TweenLite.to($sub, .25, {css: {height: sub_height}, ease: Sine.easeInOut, onComplete: function(){ $sub.attr('style', ''); }});
						}
					},
					out: function()
					{
						if(isxs())
							return;
						if(is_root_element)
						{
							$li.removeClass('hover');
						}
						else
						{
							sub_height = $sub.outerHeight();
							$li.removeClass('expanded');
							$sub.removeClass('is-visible').height(sub_height);
							TweenLite.to($sub, .25, {css: {height: 0}, onComplete: function(){ $sub.attr('style', ''); }});
						}
					},
					timeout: 200,
					interval: is_root_element ? 10 : 100
				});
			}
		});
	}
}
function stickFooterToBottom()
{
	public_vars.$mainFooter.add( public_vars.$mainContent ).add( public_vars.$sidebarMenu ).attr('style', '');
	if(isxs())
		return false;
	if(public_vars.$mainFooter.hasClass('sticky'))
	{
		var win_height				 = jQuery(window).height(),
			footer_height			= public_vars.$mainFooter.outerHeight(true),
			main_content_height	  = public_vars.$mainFooter.position().top + footer_height,
			main_content_height_only = main_content_height - footer_height,
			extra_height			 = public_vars.$horizontalNavbar.outerHeight();
		if(win_height > main_content_height - parseInt(public_vars.$mainFooter.css('marginTop'), 10))
		{
			public_vars.$mainFooter.css({
				marginTop: win_height - main_content_height - extra_height
			});
		}
	}
}
// Perfect scroll bar functions by Arlind Nushi
function ps_update(destroy_init)
{
	//if(isxs())
	//	return;
	if(jQuery.isFunction(jQuery.fn.perfectScrollbar))
	{
		if(public_vars.$sidebarMenu.hasClass('collapsed'))
		{
			return;
		}
		public_vars.$sidebarMenu.find('.sidebar-menu-inner').perfectScrollbar('update');
		if(destroy_init)
		{
			ps_destroy();
			ps_init();
		}
	}
}
function ps_init()
{
	//if(isxs())
	//	return;
	if(jQuery.isFunction(jQuery.fn.perfectScrollbar))
	{
		if(public_vars.$sidebarMenu.hasClass('collapsed') || ! public_vars.$sidebarMenu.hasClass('fixed'))
		{
			return;
		}
		public_vars.$sidebarMenu.find('.sidebar-menu-inner').perfectScrollbar({
			wheelSpeed: 1,
			wheelPropagation: public_vars.wheelPropagation
		});
	}
}
function ps_destroy()
{
	if(jQuery.isFunction(jQuery.fn.perfectScrollbar))
	{
		public_vars.$sidebarMenu.find('.sidebar-menu-inner').perfectScrollbar('destroy');
	}
}
// Element Attribute Helper
function attrDefault($el, data_var, default_val)
{
	if(typeof $el.data(data_var) != 'undefined')
	{
		return $el.data(data_var);
	}
	return default_val;
}

// 添加二级菜单下拉列表式交互
$(document).ready(function() {
  // 使用原有的交互逻辑，只添加expanded类用于控制箭头旋转
  $(document).on('click', '.has-sub > a', function(e) {
    var _this = $(this).parent();
    
    // 切换expanded类
    if(_this.hasClass('expanded')) {
      _this.removeClass('expanded');
    } else {
      _this.addClass('expanded');
    }
    
    // 阻止事件冒泡，避免触发两次
    e.stopPropagation();
  });
});