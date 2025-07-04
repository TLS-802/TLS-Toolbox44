// 标签式二级菜单交互
$(document).ready(function() {
  // 为每个tab-menu下的tab-item添加图标
  $('.tab-menu .tab-item').each(function() {
    var tabName = $(this).text().trim();
    var iconClass = getIconClassForTab(tabName);
    if (iconClass) {
      $(this).prepend('<i class="fa ' + iconClass + '"></i>');
    }
  });
  
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
    var $targetContent = tabContainer.find('.tab-content[data-tab="' + tabId + '"]');
    $targetContent.addClass('active');

    // 滚动到当前标签位置
    scrollToTab($(this));
    
    // 添加动画效果
    animateTabTransition($targetContent);
  });
  
  // 初始化：激活每个标签组的第一个标签
  $('.tab-container').each(function() {
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
    $container.find('.scroll-indicator.left').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      var $tabMenu = $container.find('.tab-menu');
      $tabMenu.animate({
        scrollLeft: $tabMenu.scrollLeft() - 300
      }, 300);
    });
    
    $container.find('.scroll-indicator.right').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      var $tabMenu = $container.find('.tab-menu');
      $tabMenu.animate({
        scrollLeft: $tabMenu.scrollLeft() + 300
      }, 300);
    });
    
    // 激活第一个标签
    $(this).find('.tab-menu .tab-item:first').click();
    
    // 添加链接数量徽章
    $(this).find('.tab-content').each(function(index) {
      var linkCount = $(this).find('.xe-card').length;
      if (linkCount > 0) {
        $container.find('.tab-menu .tab-item[data-tab="' + index + '"]').append('<span class="badge">' + linkCount + '</span>');
      }
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
      if (scrollLeft > 10) {
        $container.find('.scroll-indicator.left').fadeIn(200);
      } else {
        $container.find('.scroll-indicator.left').fadeOut(200);
      }
      
      // 右侧滚动指示器
      if (scrollLeft + clientWidth < scrollWidth - 10) {
        $container.find('.scroll-indicator.right').fadeIn(200);
      } else {
        $container.find('.scroll-indicator.right').fadeOut(200);
      }
    } else {
      // 如果内容宽度小于等于容器宽度，则隐藏滚动指示器
      $container.find('.scroll-indicator').fadeOut(200);
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
  
  // 添加标签内容切换动画
  function animateTabTransition($content) {
    $content.css('opacity', 0).css('transform', 'translateY(15px)');
    setTimeout(function() {
      $content.css('transition', 'opacity 0.5s ease, transform 0.5s ease');
      $content.css('opacity', 1).css('transform', 'translateY(0)');
      setTimeout(function() {
        $content.css('transition', '');
      }, 500);
    }, 50);
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
      var walk = (startX - x) * 1.5; // 滚动速度加快
      
      $menu.scrollLeft(startScrollLeft + walk);
      e.preventDefault();
    });
    
    $menu.on('touchend', function() {
      startX = null;
    });
  });
  
  // 根据标签名称获取对应的图标类
  function getIconClassForTab(tabName) {
    var iconMap = {
      '淘宝': 'fa-shopping-cart',
      '抖店': 'fa-video-camera',
      '京东': 'fa-shopping-bag',
      '快手': 'fa-play-circle',
      '小红书': 'fa-book',
      '视频号': 'fa-video-camera',
      '拼多多': 'fa-shopping-basket',
      'Tiktok': 'fa-music',
      '1688': 'fa-truck',
      '其他平台': 'fa-globe'
    };
    
    return iconMap[tabName] || '';
  }
}); 