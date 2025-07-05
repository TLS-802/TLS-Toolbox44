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
      
      // 添加调试信息
      console.log('================ 标签点击 ================');
      console.log('标签点击:', $tab.text().trim(), '索引:', $tab.data('tab'));
      console.log('标签属性:', '分类=', $tab.data('taxonomy'), '术语=', $tab.data('term'));
      
      // 移除其他标签的激活状态
      $tabs.removeClass('active');
      $tab.addClass('active');
      
      // 获取标签索引
      var tabIndex = $tab.data('tab');
      
      // 查找对应的tab-content
      var $tabContents = $container.find('.tab-content');
      
      console.log('找到内容区域数量:', $tabContents.length);
      
      // 遍历所有内容区域，输出它们的data-tab属性
      console.log('所有内容区域的data-tab属性:');
      $tabContents.each(function(i) {
        console.log(i, ':', $(this).data('tab'));
      });
      
      // 首先移除所有内容区域的激活状态
      $container.find('.tab-content').removeClass('active');
      
      // 查找匹配索引的内容
      var $matchingContent = $tabContents.filter(function() {
        var contentTabIndex = $(this).data('tab');
        console.log('比较内容区域:', contentTabIndex, '与', tabIndex);
        return contentTabIndex == tabIndex;
      });
      
      if ($matchingContent.length) {
        console.log('激活内容区域:', tabIndex);
        $matchingContent.addClass('active');
        
        // 添加过渡动画
        $matchingContent.hide().fadeIn(300);
      } else {
        console.error('未找到匹配的内容区域:', tabIndex);
        
        // 尝试按索引顺序查找内容区域
        var $fallbackContent = $container.find('.tab-content').eq(tabIndex);
        if ($fallbackContent.length) {
          console.log('使用索引匹配内容区域:', tabIndex);
          $fallbackContent.addClass('active');
          $fallbackContent.hide().fadeIn(300);
        } else {
          console.error('使用索引也未找到内容区域');
        }
      }

      // 将当前激活的标签滚动到可视区域
      scrollToTab($tab);
      
      // 触发窗口大小变化事件，确保内容正确显示
      $(window).trigger('resize');
      
      // 更新URL哈希值
      var term = $tab.data('term');
      var taxonomy = $tab.data('taxonomy');
      if (term && taxonomy) {
        var hashId = $.simpleHash ? $.simpleHash(taxonomy + "-" + term) : window.simpleHash(taxonomy + "-" + term);
        if (history.pushState) {
          // 生成唯一的URL，确保每次点击都会产生不同的哈希值
          var now = new Date().getTime();
          history.pushState(null, null, "#" + hashId + "?" + now);
          // 立即更改回原始哈希值，但保留状态
          setTimeout(function() {
            history.pushState(null, null, "#" + hashId);
          }, 10);
        }
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
      
      // 首先尝试通过data-term属性匹配
      var $matchingTab = $tabs.filter(function() {
        return sanitizeText($(this).data('term')) === tabText;
      });
      
      if($matchingTab.length === 0) {
        // 如果没找到，尝试通过文本内容匹配
        $tabs.each(function() {
          var $tab = $(this);
          // 移除任何子元素后获取文本
          var currentText = sanitizeText($tab.clone().children().remove().end().text());
          
          if(currentText === tabText) {
            $matchingTab = $tab;
            return false; // 跳出循环
          }
        });
      }
      
      // 如果仍未找到，尝试部分匹配
      if($matchingTab.length === 0) {
        $tabs.each(function() {
          var $tab = $(this);
          var currentText = sanitizeText($tab.clone().children().remove().end().text());
          
          if(currentText.indexOf(tabText) >= 0 || tabText.indexOf(currentText) >= 0) {
            $matchingTab = $tab;
            return false; // 跳出循环
          }
        });
      }
      
      // 如果找到匹配的标签，激活它
      if($matchingTab && $matchingTab.length > 0) {
        console.log('找到匹配的标签:', sanitizeText($matchingTab.text()));
        
        // 获取标签索引和数据
        var tabIndex = $matchingTab.data('tab');
        
        // 移除其他标签的激活状态，激活当前标签
        $tabs.removeClass('active');
        $matchingTab.addClass('active');
        
        // 查找并激活对应的内容
        var $allContents = $container.find('.tab-content');
        $allContents.removeClass('active');
        
        // 根据data-tab属性查找对应内容
        var $matchingContent = $allContents.filter(function() {
          return $(this).data('tab') == tabIndex;
        });
        
        if($matchingContent.length > 0) {
          $matchingContent.addClass('active');
        } else {
          $allContents.eq(tabIndex).addClass('active');
        }
        
        // 滚动到当前标签
        if($matchingTab[0].scrollIntoView) {
          $matchingTab[0].scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
        }
        
        found = true;
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
    console.log("处理URL hash:", hash);
    
    // 尝试查找对应的元素
    var $target = $('#' + hash);
    if($target.length) {
      // 滚动到元素位置
      $('html, body').animate({
        scrollTop: $target.offset().top - 80
      }, 500, function() {
        console.log("滚动到元素位置完成");
        
        // 提取term信息
        var termInfo = null;
        
        // 查找对应的菜单项，获取数据属性
        $('.main-menu a[href="#' + hash + '"]').each(function() {
          var $menuLink = $(this);
          termInfo = {
            taxonomy: $menuLink.data('taxonomy'),
            term: $menuLink.data('term')
          };
          console.log("从菜单项提取到数据:", termInfo);
        });
        
        if (!termInfo || !termInfo.term) {
          console.log("未找到菜单项数据，尝试从URL搜索参数获取");
          // 从URL参数获取数据
          var urlParams = new URLSearchParams(window.location.search);
          if (urlParams.has('taxonomy') && urlParams.has('term')) {
            termInfo = {
              taxonomy: urlParams.get('taxonomy'),
              term: urlParams.get('term')
            };
          }
        }
        
        if (termInfo && termInfo.term) {
          console.log("尝试根据termInfo激活标签:", termInfo);
          
          // 查找最近的标签容器
          var $tabContainer = $target.closest('.tab-container');
          if(!$tabContainer.length) {
            $tabContainer = $target.closest('h4').next('.tab-container');
            if(!$tabContainer.length) {
              $tabContainer = $target.closest('h4').nextAll('.tab-container').first();
            }
          }
          
          // 如果找到标签容器，尝试激活匹配的标签
          if($tabContainer.length) {
            console.log("找到标签容器，标签数:", $tabContainer.find('.tab-menu .tab-item').length);
            
            var $tabs = $tabContainer.find('.tab-menu .tab-item');
            var $matchingTab = null;
            
            // 查找匹配的标签
            $tabs.each(function() {
              var $tab = $(this);
              var tabText = $tab.clone().children().remove().end().text().trim();
              var dataTerm = $tab.data('term') || '';
              
              console.log("比较标签:", tabText, "与", termInfo.term);
              
              if (tabText === termInfo.term || dataTerm === termInfo.term) {
                console.log("找到匹配标签");
                $matchingTab = $tab;
                return false; // 跳出循环
              }
            });
            
            // 如果没找到精确匹配，尝试部分匹配
            if (!$matchingTab) {
              $tabs.each(function() {
                var $tab = $(this);
                var tabText = $tab.clone().children().remove().end().text().trim();
                
                if(tabText.indexOf(termInfo.term) >= 0 || termInfo.term.indexOf(tabText) >= 0) {
                  console.log("找到部分匹配标签");
                  $matchingTab = $tab;
                  return false; // 跳出循环
                }
              });
            }
            
            // 如果找到匹配的标签，激活它
            if($matchingTab && $matchingTab.length) {
              console.log("激活匹配的标签");
              $matchingTab.click();
            } else {
              console.log("未找到匹配标签，激活第一个标签");
              $tabs.first().click();
            }
          } else {
            console.log("未找到标签容器");
          }
        } else {
          console.log("未能提取到term信息");
        }
      });
    } else {
      console.log("未找到目标元素:", hash);
    }
  }

  // 处理URL中的哈希值
  function handleUrlHash() {
    // 获取哈希值（不包括#号和可能的查询字符串）
    var hash = window.location.hash.substring(1).split('?')[0];
    if (!hash) return;
    
    console.log('处理URL哈希值:', hash);
    
    // 强制销毁和重建所有激活的标签内容
    $('.tab-menu .tab-item.active').removeClass('active');
    $('.tab-content.active').removeClass('active');
    
    // 查找对应的元素
    var $target = $('#' + hash);
    if (!$target.length) {
      console.log('未找到目标元素:', hash);
      return;
    }
    
    // 查找匹配的菜单项
    var $menuItem = $('.main-menu a[href="#' + hash + '"]');
    
    // 如果hash包含分隔符，可能是"taxonomy-term"格式
    if (hash.indexOf('-') !== -1) {
      var parts = hash.split('-');
      var taxonomyHash = parts[0];
      var termPart = parts.slice(1).join('-'); // 处理term名称中可能含有'-'的情况
      
      console.log('哈希值可能包含taxonomy和term:', taxonomyHash, termPart);
      
      // 查找对应的分类区域
      var $taxonomySection = $('[id="' + taxonomyHash + '"]');
      if (!$taxonomySection.length) {
        // 尝试查找包含ID的元素
        $('*[id]').each(function() {
          if ($(this).attr('id').indexOf(taxonomyHash) >= 0) {
            $taxonomySection = $(this);
            return false;
          }
        });
      }
      
      if ($taxonomySection.length) {
        console.log('找到分类区域:', $taxonomySection.attr('id'));
        
        // 滚动到分类区域
        $('html, body').animate({
          scrollTop: $taxonomySection.offset().top - 80
        }, 300, function() {
          // 查找附近的标签容器
          var $tabContainer = $taxonomySection.closest('h4').next('.tab-container');
          if($tabContainer.length === 0) {
            $tabContainer = $taxonomySection.closest('h4').nextAll('.tab-container').first();
          }
          
          if (!$tabContainer.length) {
            // 在整个页面中查找标签容器
            $tabContainer = $('.tab-container').first();
          }
          
          if ($tabContainer.length) {
            console.log('找到标签容器');
            
            // 在标签容器中查找匹配term的标签
            var $matchingTab = findMatchingTab($tabContainer, termPart);
            
            // 如果找到匹配的标签，点击它
            if ($matchingTab && $matchingTab.length) {
              console.log('点击匹配的标签');
              setTimeout(function() {
                forceActivateTab($matchingTab);
              }, 200);
            } else {
              // 如果没找到匹配的标签，默认激活第一个标签
              console.log('未找到匹配的标签，激活第一个标签');
              forceActivateTab($tabContainer.find('.tab-item').first());
            }
          }
        });
        
        return;
      }
    }
    
    console.log('常规哈希处理完成');
  }
  
  // 辅助函数：查找匹配的标签
  function findMatchingTab($container, termText) {
    var $matchingTab = null;
    
    // 方法1：通过data-term属性查找
    $container.find('.tab-item').each(function() {
      var $tab = $(this);
      var tabTerm = $tab.data('term');
      
      if (tabTerm && (tabTerm === termText || $.simpleHash(tabTerm) === termText)) {
        console.log('通过data-term找到匹配标签:', tabTerm);
        $matchingTab = $tab;
        return false; // 跳出循环
      }
    });
    
    // 方法2：通过文本内容查找
    if (!$matchingTab || !$matchingTab.length) {
      $container.find('.tab-item').each(function() {
        var $tab = $(this);
        var tabText = $tab.clone().children().remove().end().text().trim();
        
        if (tabText === termText || $.simpleHash(tabText) === termText) {
          console.log('通过文本内容找到匹配标签:', tabText);
          $matchingTab = $tab;
          return false; // 跳出循环
        }
      });
    }
    
    // 方法3：部分匹配
    if (!$matchingTab || !$matchingTab.length) {
      $container.find('.tab-item').each(function() {
        var $tab = $(this);
        var tabText = $tab.clone().children().remove().end().text().trim();
        
        if (tabText.indexOf(termText) >= 0 || termText.indexOf(tabText) >= 0) {
          console.log('通过部分匹配找到标签:', tabText);
          $matchingTab = $tab;
          return false; // 跳出循环
        }
      });
    }
    
    return $matchingTab;
  }
  
  // 辅助函数：强制激活标签
  function forceActivateTab($tab) {
    if (!$tab || !$tab.length) return;
    
    // 先触发点击事件
    $tab.click();
    
    // 然后直接激活匹配的内容
    var tabIndex = $tab.data('tab');
    var $tabContainer = $tab.closest('.tab-container');
    
    if (tabIndex !== undefined && $tabContainer.length) {
      // 移除所有激活状态
      $tabContainer.find('.tab-item').removeClass('active');
      $tab.addClass('active');
      
      // 查找并激活对应内容
      var $content = $tabContainer.find('.tab-content[data-tab="' + tabIndex + '"]');
      if (!$content.length) {
        $content = $tabContainer.find('.tab-content').eq(tabIndex);
      }
      
      if ($content.length) {
        console.log('直接激活内容区域:', tabIndex);
        $tabContainer.find('.tab-content').removeClass('active');
        $content.addClass('active').show();
      }
    }
  }

  // 页面加载完成后处理URL哈希值
  $(window).on('load', function() {
    handleUrlHash();
  });

  // 当哈希值变化时重新处理
  $(window).on('hashchange', function() {
    console.log('检测到URL哈希值变化:', window.location.hash);
    // 清除所有现有的超时操作
    for (var i = 1; i < 1000; i++) {
      window.clearTimeout(i);
    }
    
    setTimeout(function() {
      handleUrlHash();
    }, 100);
  });

  // 创建一个函数，模拟触发hash变化
  function simulateHashChange(hash) {
    var oldURL = window.location.href;
    window.location.hash = hash;
    var newURL = window.location.href;
    
    // 创建一个自定义事件
    var hashChangeEvent = new HashChangeEvent('hashchange', {
      oldURL: oldURL,
      newURL: newURL
    });
    
    // 触发自定义事件
    window.dispatchEvent(hashChangeEvent);
  }

  // 全局函数，强制重新绑定所有标签事件
  window.rebindAllTabs = function() {
    console.log('重新绑定所有标签事件');
    
    // 遍历所有标签容器
    $('.tab-container').each(function() {
      var $container = $(this);
      var $tabs = $container.find('.tab-menu .tab-item');
      var $contents = $container.find('.tab-content');
      
      // 为每个标签重新绑定点击事件
      $tabs.off('click').on('click', function(e) {
        e.preventDefault();
        var $tab = $(this);
        var tabIndex = $tab.data('tab');
        
        console.log('标签点击:', $tab.text().trim(), '索引:', tabIndex);
        
        // 移除其他标签的激活状态
        $tabs.removeClass('active');
        $tab.addClass('active');
        
        // 移除所有内容区域的激活状态
        $contents.removeClass('active');
        
        // 查找匹配索引的内容
        var $matchingContent = $contents.filter(function() {
          return $(this).data('tab') == tabIndex;
        });
        
        if ($matchingContent.length) {
          $matchingContent.addClass('active').show();
        } else {
          // 使用索引查找内容区域
          var $fallbackContent = $contents.eq(tabIndex);
          if ($fallbackContent.length) {
            $fallbackContent.addClass('active').show();
          }
        }
      });
      
      // 确保有一个标签被激活
      if ($tabs.filter('.active').length === 0 && $tabs.length > 0) {
        $tabs.first().addClass('active');
        $contents.first().addClass('active');
      }
    });
    
    return '重新绑定完成';
  };
});

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