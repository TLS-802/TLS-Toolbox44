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
    
    // 处理URL哈希值
    this.handleUrlHash();
    
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
    $('.main-menu a[data-taxonomy][data-term]').off('click').on('click', function(e) {
      e.preventDefault();
      
      var $link = $(this);
      var taxonomyName = $link.data('taxonomy');
      var termName = $link.data('term');
      var targetId = $link.attr('href');
      
      console.log('点击侧边栏菜单项:', taxonomyName, termName, targetId);
      
      // 查找并激活对应的标签
      TabManager.findAndActivateTab(taxonomyName, termName);
    });
  },
  
  // 查找并激活对应的标签
  findAndActivateTab: function(taxonomyName, termName) {
    // 1. 找到对应的一级分类区域
    var taxonomyHash = $.simpleHash(taxonomyName);
    var $taxonomySection = $('#' + taxonomyHash);
    
    if (!$taxonomySection.length) {
      console.error('未找到分类区域:', taxonomyName, taxonomyHash);
      return false;
    }
    
    // 2. 滚动到分类区域
    $('html, body').animate({
      scrollTop: $taxonomySection.offset().top - 80
    }, 300, function() {
      // 3. 查找并激活对应的标签
      var $tabContainer = $taxonomySection.closest('h4').nextAll('.tab-container').first();
      
      if (!$tabContainer.length) {
        console.error('未找到标签容器');
        return;
      }
      
      console.log('找到标签容器');
      
      // 在标签容器中查找匹配term的标签
      var $matchingTab = null;
      
      // 方法1：通过data-term属性精确匹配
      $matchingTab = $tabContainer.find('.tab-item').filter(function() {
        var tabTerm = $(this).data('term');
        return tabTerm === termName;
      });
      
      // 方法2：通过文本内容匹配
      if (!$matchingTab.length) {
        $matchingTab = $tabContainer.find('.tab-item').filter(function() {
          var tabText = $(this).clone().children().remove().end().text().trim();
          return tabText === termName;
        });
      }
      
      // 方法3：部分匹配
      if (!$matchingTab.length) {
        $tabContainer.find('.tab-item').each(function() {
          var $tab = $(this);
          var tabText = $tab.clone().children().remove().end().text().trim();
          
          if (tabText.indexOf(termName) >= 0 || termName.indexOf(tabText) >= 0) {
            $matchingTab = $tab;
            return false; // 跳出循环
          }
        });
      }
      
      // 如果找到匹配的标签，激活它
      if ($matchingTab && $matchingTab.length) {
        console.log('找到匹配的标签:', $matchingTab.text().trim());
        TabManager.activateTab($matchingTab);
      } else {
        console.error('未找到匹配的标签:', termName);
      }
    });
    
    return true;
  },
  
  // 处理URL哈希值
  handleUrlHash: function() {
    var hash = window.location.hash.substring(1);
    if (!hash) return;
    
    console.log('处理URL哈希值:', hash);
    
    // 如果哈希值包含分隔符，可能是"taxonomy-term"格式
    if (hash.indexOf('-') !== -1) {
      var parts = hash.split('-');
      var taxonomyHash = parts[0];
      var termPart = parts.slice(1).join('-');
      
      // 查找对应的分类区域
      var $taxonomySection = $('#' + taxonomyHash);
      if ($taxonomySection.length) {
        // 提取分类名称
        var taxonomyName = '';
        $('.main-menu > li > a').each(function() {
          var $link = $(this);
          var linkTaxonomy = $link.text().trim();
          if ($.simpleHash(linkTaxonomy) === taxonomyHash) {
            taxonomyName = linkTaxonomy;
            return false;
          }
        });
        
        if (taxonomyName) {
          // 查找并激活对应的标签
          this.findAndActivateTab(taxonomyName, termPart);
        }
      }
    }
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