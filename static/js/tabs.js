// 标签式二级菜单交互
$(document).ready(function() {
  console.log('标签页初始化...');

  // 初始化所有标签容器
  $('.tab-container').each(function() {
    var $container = $(this);
    var $tabs = $container.find('.tab-menu .tab-item');
    var $contents = $container.find('.tab-content .tab-pane');
    
    // 如果没有标签被激活，默认激活第一个
    if ($tabs.filter('.active').length === 0 && $tabs.length > 0) {
      $tabs.first().addClass('active');
      $contents.first().addClass('active');
    }
    
    // 为每个标签添加点击事件 - 使用off().on()重新绑定事件，避免多次绑定
    $tabs.off('click').on('click', function(e) {
      e.preventDefault();
      var $tab = $(this);
      
      // 无论标签是否已经激活，都重新处理以确保正确切换
      console.log('标签点击:', $tab.text().trim());
      
      // 获取标签索引
      var index = $tab.index();
      
      // 移除其他标签的激活状态，并激活当前标签
      $tabs.removeClass('active');
      $tab.addClass('active');
      
      // 切换内容区域
      $contents.removeClass('active');
      $contents.eq(index).addClass('active');

      // 将当前激活的标签滚动到可视区域
      if ($tab[0].scrollIntoView) {
        $tab[0].scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
      }
    });
  });
  
  // URL参数处理
  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
  
  // 获取taxonomy和term参数
  var taxonomyParam = getParameterByName('taxonomy');
  var termParam = getParameterByName('term');
  
  if (taxonomyParam && termParam) {
    console.log('URL参数:', taxonomyParam, termParam);
    
    // 延迟执行以确保DOM已完全加载
    setTimeout(function() {
      // 查找分类ID
      var taxonomyId = '#' + taxonomyParam.toLowerCase().replace(/\s+/g, '-');
      var $taxonomySection = $(taxonomyId);
      
      if ($taxonomySection.length) {
        // 滚动到分类
        $('html, body').animate({
          scrollTop: $taxonomySection.offset().top - 80
        }, 300, function() {
          // 查找最近的标签容器
          var $tabContainer = $taxonomySection.closest('h4').next('.tab-container');
          if ($tabContainer.length === 0) {
            $tabContainer = $taxonomySection.closest('h4').nextAll('.tab-container').first();
          }
          
          // 激活匹配的标签
          if ($tabContainer.length > 0) {
            activateTabByText($tabContainer, termParam);
          } else {
            // 全局搜索
            activateTabByText(null, termParam);
          }
        });
      }
    }, 300);
  }

  // 为每个tab-menu下的tab-item添加图标
  $('.tab-menu .tab-item').each(function() {
    var tabName = $(this).text().trim();
    var iconClass = getIconClassForTab(tabName);
    if (iconClass) {
      $(this).prepend('<i class="fa ' + iconClass + '"></i>');
    }
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

  // 添加选择器通用函数
  function sanitizeText(text) {
    if(!text) return '';
    return text.toString().trim();
  }

  // 激活标签页（新版本）
  function activateTabByText(tabContainer, tabText) {
    console.log('尝试通过文本激活标签:', tabText);
    
    // 标准化输入参数
    tabText = sanitizeText(tabText);
    if(!tabText) return false;
    
    // 查找所有标签页
    var $allTabContainers = [];
    if(tabContainer && $(tabContainer).length > 0) {
      // 如果提供了特定的标签容器
      $allTabContainers = [$(tabContainer)];
    } else {
      // 否则搜索所有标签容器
      $allTabContainers = $('.tab-container').map(function() {
        return $(this);
      }).get();
    }
    
    console.log('查找标签容器数量:', $allTabContainers.length);
    
    // 尝试在所有容器中查找匹配的标签
    var found = false;
    $.each($allTabContainers, function(i, $container) {
      var $tabs = $container.find('.tab-menu .tab-item');
      console.log('容器中标签数:', $tabs.length);
      
      // 首先尝试精确匹配
      $tabs.each(function() {
        var $tab = $(this);
        // 移除任何子元素后获取文本
        var currentText = $tab.clone().children().remove().end().text().trim();
        console.log('比较:', currentText, tabText);
        
        if(currentText === tabText) {
          console.log('找到精确匹配');
          // 激活标签
          $tabs.removeClass('active');
          $tab.addClass('active');
          
          // 激活对应内容
          var tabIndex = $tab.index();
          var $contents = $container.find('.tab-content .tab-pane');
          $contents.removeClass('active');
          $contents.eq(tabIndex).addClass('active');
          
          found = true;
          return false; // 跳出 each 循环
        }
      });
      
      if(!found) {
        // 如果没有精确匹配，尝试部分匹配
        $tabs.each(function() {
          var $tab = $(this);
          var currentText = $tab.clone().children().remove().end().text().trim();
          
          if(currentText.indexOf(tabText) >= 0 || tabText.indexOf(currentText) >= 0) {
            console.log('找到部分匹配');
            // 激活标签
            $tabs.removeClass('active');
            $tab.addClass('active');
            
            // 激活对应内容
            var tabIndex = $tab.index();
            var $contents = $container.find('.tab-content .tab-pane');
            $contents.removeClass('active');
            $contents.eq(tabIndex).addClass('active');
            
            found = true;
            return false; // 跳出 each 循环
          }
        });
      }
      
      if(found) {
        return false; // 跳出外层 each 循环
      }
    });
    
    return found;
  }

  // 设置全局函数以便其他脚本调用
  window.activateTabByName = activateTabByText;

  // 检查URL hash值，如果有则尝试激活对应的标签
  // 获取hash值（不包括#号）
  var hash = window.location.hash.substring(1);
  if(hash) {
    // 尝试查找对应的元素
    var $target = $('#' + hash);
    if($target.length) {
      // 滚动到元素位置
      $('html, body').animate({
        scrollTop: $target.offset().top - 80
      }, 500, function() {
        // 查找附近的标签容器
        var $tabContainer = $target.closest('.tab-container');
        if(!$tabContainer.length) {
          // 如果元素不在标签容器内，则查找最近的标签容器
          $tabContainer = $target.closest('h4').next('.tab-container');
          if(!$tabContainer.length) {
            $tabContainer = $target.closest('h4').nextAll('.tab-container').first();
          }
        }
        
        // 如果找到标签容器，查找数据属性中包含hash值的标签
        if($tabContainer.length) {
          var $tabs = $tabContainer.find('.tab-menu .tab-item');
          var $matchingTab = null;
          
          // 如果hash值包含"-"，可能是我们的组合hash
          if(hash.indexOf('-') !== -1) {
            // 尝试从URL中提取taxonomy和term参数
            var params = new URLSearchParams(window.location.search);
            var termParam = params.get('term');
            
            if(termParam) {
              // 根据term参数查找标签
              $matchingTab = $tabs.filter(function() {
                return $(this).data('term') === termParam;
              });
            }
          }
          
          // 如果找到匹配的标签，激活它
          if($matchingTab && $matchingTab.length) {
            $matchingTab.click();
          } else {
            // 如果没有找到匹配的标签，默认激活第一个
            $tabs.first().click();
          }
        }
      });
    }
  }
});

// 提取为单独函数，以便在点击事件和全局方法中复用
function activateTab($tabContainer, tabIndex) {
  if (!$tabContainer || !$tabContainer.length) return false;
  
  var $tabs = $tabContainer.find('.tab-menu .tab-item');
  
  // 确保索引有效
  if (tabIndex < 0 || tabIndex >= $tabs.length) {
    tabIndex = 0;
  }
  
  // 获取目标标签和内容
  var $targetTab = $tabs.eq(tabIndex);
  
  // 如果标签已经是激活状态，不需要再次激活
  if ($targetTab.hasClass('active')) {
    return true;
  }
  
  // 激活标签
  $tabs.removeClass('active');
  $targetTab.addClass('active');
  
  // 激活对应的内容
  var $contents = $tabContainer.find('.tab-content .tab-pane');
  $contents.removeClass('active');
  $contents.eq(tabIndex).addClass('active');
  
  // 滚动到当前标签位置
  scrollToTab($targetTab);
  
  // 添加动画效果
  animateTabTransition($contents.eq(tabIndex));
  
  return true;
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

// 检查URL参数中是否指定了标签
function getParameterByName(name) {
  var url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  var results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// 获取指定的标签和分类
var termParam = getParameterByName('term');
var taxonomyParam = getParameterByName('taxonomy');

// 如果URL中指定了标签参数，尝试激活它
if (termParam) {
  console.log('URL中指定了标签:', termParam);
  
  // 如果同时指定了分类，先滚动到该分类
  if (taxonomyParam) {
    var targetElement = $('#' + taxonomyParam.replace(/\s+/g, '-').toLowerCase());
    if (targetElement.length) {
      $('html, body').animate({
        scrollTop: targetElement.offset().top - 80
      }, 500, function() {
        // 滚动完成后激活标签
        setTimeout(function() {
          activateTabByName(null, termParam);
        }, 300);
      });
    } else {
      // 如果找不到分类，直接尝试激活标签
      activateTabByName(null, termParam);
    }
  } else {
    // 没有指定分类，直接尝试激活标签
    activateTabByName(null, termParam);
  }
} 