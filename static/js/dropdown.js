/**
 * 下拉菜单功能
 * 为带有二级菜单的菜单项添加下拉列表式交互
 */
$(document).ready(function() {
    // 为下拉菜单项添加箭头
    $('.dropdown-menu-item > a').each(function() {
        if (!$(this).find('.dropdown-arrow').length) {
            $(this).append('<span class="dropdown-arrow"></span>');
        }
    });

    // 下拉菜单交互
    $('.dropdown-menu-item > a').click(function(e) {
        var $parent = $(this).parent();
        if($parent.hasClass('open')) {
            $parent.removeClass('open');
            $parent.find('.dropdown-menu').slideUp(300);
        } else {
            // 关闭其他打开的下拉菜单
            $('.dropdown-menu-item.open').removeClass('open');
            $('.dropdown-menu-item.open .dropdown-menu').slideUp(300);
            
            // 打开当前下拉菜单
            $parent.addClass('open');
            $parent.find('.dropdown-menu').slideDown(300);
        }
        e.stopPropagation();
    });
    
    // 点击其他地方关闭下拉菜单
    $(document).click(function() {
        $('.dropdown-menu-item.open').removeClass('open');
        $('.dropdown-menu-item .dropdown-menu').slideUp(300);
    });
    
    // 阻止下拉菜单内部点击事件冒泡
    $('.dropdown-menu').click(function(e) {
        e.stopPropagation();
    });
    
    // 折叠菜单状态下的下拉菜单处理
    $('.sidebar-menu.collapsed .dropdown-menu-item > a').hover(function() {
        var $parent = $(this).parent();
        $parent.addClass('hover');
    }, function() {
        var $parent = $(this).parent();
        $parent.removeClass('hover');
    });
}); 