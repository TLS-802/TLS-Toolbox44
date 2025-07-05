/*
 * 菜单下拉箭头处理
 */
(function($) {
    $(document).ready(function() {
        // 确保所有带有子菜单的项目都有 has-sub 类
        $('.sidebar-menu .main-menu li:has(> ul)').addClass('has-sub');
        
        // 为带有子菜单的项目添加点击事件
        $('.sidebar-menu .main-menu li.has-sub > a').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // 阻止事件冒泡
            
            var $li = $(this).parent();
            
            if ($li.hasClass('expanded')) {
                // 收起子菜单
                $li.removeClass('expanded');
                $li.children('ul').slideUp(200);
            } else {
                // 展开子菜单
                $li.addClass('expanded');
                $li.children('ul').slideDown(200);
                
                // 可选：关闭同级其他菜单
                $li.siblings('.has-sub.expanded').removeClass('expanded').children('ul').slideUp(200);
            }
        });
        
        // 初始化：展开当前活动菜单
        $('.sidebar-menu .main-menu li.active.has-sub').addClass('expanded').children('ul').show();
    });
})(jQuery); 