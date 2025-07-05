// 侧边栏标签式二级菜单交互
$(document).ready(function() {
  // 侧边栏标签点击事件
  $('.sidebar-tab-link').click(function(e) {
    e.preventDefault();
    
    // 获取标签ID和分类ID
    var tabId = $(this).data('tab');
    var taxonomyId = $(this).data('taxonomy');
    
    // 滚动到对应的分类位置
    $('html, body').animate({
      scrollTop: $('#' + taxonomyId).offset().top - 70
    }, 500);
    
    // 延迟一下，确保滚动完成后再点击标签
    setTimeout(function() {
      // 找到对应的标签并点击
      $('.tab-container').each(function() {
        var $container = $(this);
        if ($container.closest('h4').attr('id') === taxonomyId || 
            $container.prev('h4').attr('id') === taxonomyId) {
          // 使用全局的activateTab函数
          if (window.activateTab) {
            window.activateTab($container.find('.tab-item[data-tab="' + tabId + '"]'));
          } else {
            // 兼容处理，直接点击
            $container.find('.tab-item[data-tab="' + tabId + '"]').click();
          }
        }
      });
    }, 600);
    
    // 如果是移动端，关闭侧边栏
    if ($(window).width() < 768) {
      $('body').removeClass('sidebar-mobile-open');
    }
  });
}); 