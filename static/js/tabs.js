// 简单的哈希函数
$.simpleHash = function(str) {
  if (!str) return '';
  
  // 使用一个简单的哈希算法将字符串转换为短哈希值
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  // 将哈希值转换为十六进制字符串
  var hashStr = (hash >>> 0).toString(16);
  return hashStr;
};

// 全局标签页管理器
var TabManager = {
  // 初始化所有标签容器
  init: function() {
    console.log('初始化标签页管理器...');
    
    // 初始化所有标签容器
    $('.tab-container').each(function() {
      var $container = $(this);
      var $tabs = $container.find('.tab-menu .tab-item');
      var $contents = $container.find('.tab-content');
      
      // 为每个标签添加唯一ID
      $tabs.each(function(index) {
        var $tab = $(this);
        if (!$tab.attr('id')) {
          var taxonomy = $tab.data('taxonomy') || '';
          var term = $tab.data('term') || '';
          var uniqueId = 'tab-' + $.simpleHash(taxonomy + '-' + term) + '-' + index;
          $tab.attr('id', uniqueId);
        }
      });
      
      // 如果没有标签被激活，默认激活第一个
      if ($tabs.filter('.active').length === 0 && $tabs.length > 0) {
        $tabs.first().addClass('active');
        $contents.first().addClass('active');
      }
      
      // 为每个标签添加点击事件
      $tabs.off('click').on('click', function(e) {
        e.preventDefault();
        var $tab = $(this);
        TabManager.activateTab($tab);
      });
    });
    
    // 初始化侧边栏菜单
    this.initSidebarMenu();
    
    // 等待页面完全加载后处理URL哈希值
    $(window).on('load', function() {
      TabManager.handleUrlHash();
    });
    
    // 监听哈希值变化
    $(window).on('hashchange', function() {
      TabManager.handleUrlHash();
    });
  },
  
  // 激活指定的标签
  activateTab: function($tab) {
    if (!$tab || !$tab.length) return false;
    
    var $container = $tab.closest('.tab-container');
    if (!$container.length) return false;
    
    var $tabs = $container.find('.tab-menu .tab-item');
    var $contents = $container.find('.tab-content');
    var tabIndex = $tab.data('tab');
    
    console.log('激活标签:', $tab.text().trim(), '索引:', tabIndex);
    
    // 移除其他标签的激活状态
    $tabs.removeClass('active');
    $tab.addClass('active');
    
    // 移除所有内容区域的激活状态
    $contents.removeClass('active');
    
    // 查找对应的内容区域并激活
    var $content = $contents.filter('[data-tab="' + tabIndex + '"]');
    if ($content.length) {
      console.log('找到匹配的内容区域');
      $content.addClass('active').show();
    } else {
      // 备用方案：按索引查找
      console.log('使用索引查找内容区域:', tabIndex);
      var $fallbackContent = $contents.eq(tabIndex);
      if ($fallbackContent.length) {
        $fallbackContent.addClass('active').show();
      } else {
        console.error('未找到匹配的内容区域');
        return false;
      }
    }
    
    // 将当前激活的标签滚动到可视区域
    this.scrollToTab($tab);
    
    return true;
  },
  
  // 初始化侧边栏菜单
  initSidebarMenu: function() {
    console.log('初始化侧边栏菜单...');
    
    // 为侧边栏菜单项添加点击事件
    $('.main-menu .sub-menu li a').off('click').on('click', function(e) {
      // 注意：不要在这里阻止默认行为，让nav.js处理点击事件
      // 这里只添加额外的功能
      
      var $link = $(this);
      var taxonomyName = $link.data('taxonomy');
      var termName = $link.data('term');
      var targetId = $link.attr('href');
      
      console.log('标签管理器检测到侧边栏菜单项点击:', taxonomyName, termName, targetId);
    });
  },
  
  // 通过名称查找并激活标签
  activateTabByName: function(taxonomyName, termName) {
    return this.findAndActivateTab(taxonomyName, termName);
  },
  
  // 查找并激活对应的标签
  findAndActivateTab: function(taxonomyName, termName) {
    if (!taxonomyName || !termName) {
        console.error('taxonomyName 或 termName 为空');
        return false;
    }

    console.log('查找标签:', taxonomyName, termName);

    // 1. 找到对应的分类区域
    var taxonomyHash = $.simpleHash(taxonomyName);
    var $taxonomySection = $('#' + taxonomyHash);
    
    if (!$taxonomySection.length) {
        console.error('未找到分类区域:', taxonomyName, taxonomyHash);
        return false;
    }

    // 2. 查找标签容器
    var $tabContainer = $taxonomySection.closest('h4').nextAll('.tab-container').first();
    
    if (!$tabContainer.length) {
        console.error('未找到标签容器');
        return false;
    }

    console.log('找到标签容器');
    
    // 3. 在标签容器中查找匹配term的标签
    var $matchingTab = null;
    var $tabs = $tabContainer.find('.tab-item');
    
    // 方法1：通过data-term属性精确匹配
    $matchingTab = $tabs.filter(function() {
        return $(this).data('term') === termName;
    });
    
    // 方法2：通过文本内容精确匹配
    if (!$matchingTab.length) {
        $matchingTab = $tabs.filter(function() {
            return $(this).text().trim() === termName;
        });
    }
    
    // 方法3：通过文本内容包含匹配
    if (!$matchingTab.length) {
        $matchingTab = $tabs.filter(function() {
            var tabText = $(this).text().trim();
            return tabText.indexOf(termName) >= 0 || termName.indexOf(tabText) >= 0;
        }).first(); // 只取第一个匹配的
    }
    
    // 4. 如果找到匹配的标签，激活它
    if ($matchingTab && $matchingTab.length) {
        console.log('找到匹配的标签:', $matchingTab.text().trim());
        
        // 获取标签索引
        var tabIndex = $matchingTab.data('tab');
        var $contents = $tabContainer.find('.tab-content');
        
        // 移除其他标签的激活状态
        $tabs.removeClass('active');
        $matchingTab.addClass('active');
        
        // 移除所有内容区域的激活状态
        $contents.removeClass('active');
        
        // 查找并激活对应的内容区域
        var $content = $contents.filter('[data-tab="' + tabIndex + '"]');
        if (!$content.length) {
            $content = $contents.eq(tabIndex);
        }
        
        if ($content.length) {
            $content.addClass('active').show();
            
            // 将当前激活的标签滚动到可视区域
            this.scrollToTab($matchingTab);
            return true;
        }
    }
    
    console.error('未找到匹配的标签:', termName);
    return false;
  },
  
  // 处理URL哈希值
  handleUrlHash: function() {
    var hash = window.location.hash;
    if (!hash) return;
    
    hash = hash.substring(1); // 移除开头的#
    console.log('处理URL哈希值:', hash);
    
    // 尝试从哈希值中提取taxonomy和term
    var parts = hash.split('-');
    if (parts.length < 2) return;
    
    // 反向查找taxonomy和term
    $('.main-menu .sub-menu li a').each(function() {
        var $link = $(this);
        var taxonomyName = $link.data('taxonomy');
        var termName = $link.data('term');
        
        if (taxonomyName && termName) {
            var expectedHash = $.simpleHash(taxonomyName + '-' + termName);
            if (expectedHash === hash) {
                console.log('找到匹配的菜单项:', taxonomyName, termName);
                
                // 延迟执行以确保DOM已完全加载
                setTimeout(function() {
                    // 滚动到目标位置
                    var $target = $('#' + hash);
                    if ($target.length) {
                        $('html, body').animate({
                            scrollTop: $target.offset().top - 80
                        }, 300);
                    }
                    
                    // 激活对应的标签
                    TabManager.activateTabByName(taxonomyName, termName);
                }, 100);
                
                return false; // 跳出循环
            }
        }
    });
  },
  
  // 为指定元素查找并激活相关的标签
  activateTabForElement: function($element) {
    if (!$element || !$element.length) return false;
    
    // 查找最近的标签容器
    var $tabContainer = $element.closest('.tab-container');
    if (!$tabContainer.length) {
      // 如果元素不在标签容器内，查找它前面最近的h4元素，然后查找该h4后面的第一个标签容器
      var $h4 = $element.prevAll('h4').first();
      if ($h4.length) {
        $tabContainer = $h4.nextAll('.tab-container').first();
      }
    }
    
    if (!$tabContainer.length) return false;
    
    // 查找标签和内容
    var $tabs = $tabContainer.find('.tab-menu .tab-item');
    var $contents = $tabContainer.find('.tab-content');
    
    // 尝试查找包含元素的内容区域
    var $content = null;
    var contentIndex = -1;
    
    $contents.each(function(index) {
      if ($.contains(this, $element[0]) || this === $element[0]) {
        $content = $(this);
        contentIndex = index;
        return false; // 跳出循环
      }
    });
    
    // 如果找到了内容区域，激活对应的标签
    if ($content && contentIndex !== -1) {
      // 查找对应的标签
      var $tab = $tabs.filter('[data-tab="' + contentIndex + '"]');
      if (!$tab.length) {
        $tab = $tabs.eq(contentIndex);
      }
      
      if ($tab.length) {
        this.activateTab($tab);
        return true;
      }
    }
    
    return false;
  },
  
  // 滚动到当前标签位置
  scrollToTab: function($tab) {
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
};

// 全局函数：通过名称激活标签
window.activateTabByName = function($container, termName) {
  if (!$container || !$container.length) return false;
  
  var $tabs = $container.find('.tab-menu .tab-item');
  var $contents = $container.find('.tab-content');
  var found = false;
  
  // 遍历所有标签，查找匹配的
  $tabs.each(function(index) {
    var $tab = $(this);
    var tabTerm = $tab.data('term');
    var tabText = $tab.text().trim();
    
    // 如果找到匹配的标签
    if (tabTerm === termName || tabText.indexOf(termName) >= 0 || termName.indexOf(tabText) >= 0) {
      // 1. 取消所有标签的激活状态
      $tabs.removeClass('active');
      
      // 2. 激活当前标签
      $tab.addClass('active');
      
      // 3. 取消所有内容区域的激活状态
      $contents.removeClass('active');
      
      // 4. 激活对应的内容区域
      var tabIndex = $tab.data('tab');
      var $content = $contents.filter('[data-tab="' + tabIndex + '"]');
      if (!$content.length) {
        $content = $contents.eq(index);
      }
      
      if ($content.length) {
        $content.addClass('active');
      }
      
      found = true;
      return false; // 跳出循环
    }
  });
  
  return found;
};

// 页面加载完成后初始化标签页管理器
$(document).ready(function() {
  TabManager.init();
  
  // 为每个tab-menu下的tab-item添加图标
  $('.tab-menu .tab-item').each(function() {
    var tabName = $(this).text().trim();
    var iconClass = getIconClassForTab(tabName);
    if (iconClass) {
      $(this).prepend('<i class="fa ' + iconClass + '"></i>');
    }
  });
  
  // 初始化：添加滚动指示器
  $('.tab-container').each(function() {
    var $container = $(this);
    
    // 添加滚动指示器
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

// 根据标签名称获取图标类名
function getIconClassForTab(tabName) {
  var iconMap = {
    '常用': 'fa-star',
    '热门': 'fa-fire',
    '推荐': 'fa-thumbs-up',
    '工具': 'fa-wrench',
    '资源': 'fa-cubes',
    '文档': 'fa-book',
    '教程': 'fa-graduation-cap',
    '社区': 'fa-users',
    '博客': 'fa-rss',
    '论坛': 'fa-comments',
    '设计': 'fa-paint-brush',
    '开发': 'fa-code',
    '运维': 'fa-server',
    '安全': 'fa-shield',
    '数据': 'fa-database',
    '云服务': 'fa-cloud',
    '人工智能': 'fa-robot',
    '区块链': 'fa-link',
    '编程': 'fa-terminal',
    '前端': 'fa-desktop',
    '后端': 'fa-cogs',
    '移动': 'fa-mobile-alt',
    '游戏': 'fa-gamepad',
    '其他': 'fa-ellipsis-h'
  };
  
  return iconMap[tabName] || 'fa-bookmark';
} 