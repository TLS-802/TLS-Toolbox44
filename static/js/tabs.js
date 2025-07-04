// 标签式二级菜单交互
$(document).ready(function() {
  // 为每个tab-menu下的tab-item添加点击事件
  $('.tab-menu .tab-item').click(function() {
    // 获取当前点击的标签
    var tabId = $(this).data('tab');
    
    // 移除同级标签的active类
    $(this).siblings().removeClass('active');
    
    // 为当前点击的标签添加active类
    $(this).addClass('active');
    
    // 隐藏所有相关的内容
    var tabContainer = $(this).closest('.tab-container');
    tabContainer.find('.tab-content').removeClass('active');
    
    // 显示对应的内容
    tabContainer.find('.tab-content[data-tab="' + tabId + '"]').addClass('active');

    // 滚动到当前标签位置
    scrollToTab($(this));
  });
  
  // 初始化：激活每个标签组的第一个标签
  $('.tab-container').each(function() {
    $(this).find('.tab-menu .tab-item:first').click();
    
    // 添加滚动指示器
    var $container = $(this);
    $container.append('<div class="scroll-indicator left"><i class="fa fa-angle-left"></i></div>');
    $container.append('<div class="scroll-indicator right"><i class="fa fa-angle-right"></i></div>');
    
    // 检查是否需要显示滚动指示器
    checkScrollIndicators($container);
    
    // 监听滚动事件
    $container.find('.tab-menu').on('scroll', function() {
      checkScrollIndicators($container);
    });
    
    // 滚动指示器点击事件
    $container.find('.scroll-indicator.left').click(function() {
      var $tabMenu = $container.find('.tab-menu');
      $tabMenu.animate({
        scrollLeft: $tabMenu.scrollLeft() - 200
      }, 300);
    });
    
    $container.find('.scroll-indicator.right').click(function() {
      var $tabMenu = $container.find('.tab-menu');
      $tabMenu.animate({
        scrollLeft: $tabMenu.scrollLeft() + 200
      }, 300);
    });
  });
  
  // 窗口大小改变时重新检查滚动指示器
  $(window).resize(function() {
    $('.tab-container').each(function() {
      checkScrollIndicators($(this));
    });
  });
  
  // 检查是否需要显示滚动指示器
  function checkScrollIndicators($container) {
    var $tabMenu = $container.find('.tab-menu');
    var scrollLeft = $tabMenu.scrollLeft();
    var scrollWidth = $tabMenu[0].scrollWidth;
    var clientWidth = $tabMenu[0].clientWidth;
    
    // 如果内容宽度大于容器宽度，则显示滚动指示器
    if (scrollWidth > clientWidth) {
      // 左侧滚动指示器
      if (scrollLeft > 0) {
        $container.addClass('scroll-left');
        $container.find('.scroll-indicator.left').show();
      } else {
        $container.removeClass('scroll-left');
        $container.find('.scroll-indicator.left').hide();
      }
      
      // 右侧滚动指示器
      if (scrollLeft + clientWidth < scrollWidth) {
        $container.addClass('scroll-right');
        $container.find('.scroll-indicator.right').show();
      } else {
        $container.removeClass('scroll-right');
        $container.find('.scroll-indicator.right').hide();
      }
    } else {
      // 如果内容宽度小于等于容器宽度，则隐藏滚动指示器
      $container.removeClass('scroll-left scroll-right');
      $container.find('.scroll-indicator').hide();
    }
  }
  
  // 滚动到当前标签位置
  function scrollToTab($tab) {
    var $tabMenu = $tab.closest('.tab-menu');
    var tabOffset = $tab.offset().left;
    var tabMenuOffset = $tabMenu.offset().left;
    var scrollLeft = $tabMenu.scrollLeft();
    
    // 计算需要滚动的距离，使当前标签居中
    var scrollTo = scrollLeft + tabOffset - tabMenuOffset - ($tabMenu.width() / 2) + ($tab.width() / 2);
    
    // 平滑滚动到目标位置
    $tabMenu.animate({
      scrollLeft: scrollTo
    }, 300);
  }

  // 添加触摸滑动支持
  $('.tab-menu').each(function() {
    var startX, startScrollLeft;
    var $menu = $(this);
    
    $menu.on('touchstart', function(e) {
      startX = e.originalEvent.touches[0].pageX;
      startScrollLeft = $menu.scrollLeft();
    });
    
    $menu.on('touchmove', function(e) {
      if (!startX) return;
      
      var x = e.originalEvent.touches[0].pageX;
      var walk = startX - x;
      
      $menu.scrollLeft(startScrollLeft + walk);
      e.preventDefault();
    });
    
    $menu.on('touchend', function() {
      startX = null;
    });
  });
}); 