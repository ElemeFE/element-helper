'use strict';

$(document.body).css('display', 'none');
$(window).on('load', () => {
  $(document.body).css('display', 'block');
  const container = $('.page-container.page-component');
  container.find('.el-row .el-col:nth-child(2)').first().attr('class', "page-container-right").css('margin-left', '20px');
  let menu = container.find('.el-row .el-col:nth-child(1)').first();
  menu.attr('class', 'page-container-left').find('.nav-dropdown').remove();
  menu.append('<div class="menu-button">>></div>');

  $('.headerWrapper, .footer, .footer-nav, .page-component-up, .header-anchor, .description button').remove();
  container.css({padding: 0, margin: 0}).children().attr('class', 'hide-menu');

  container.on('click', '.show-menu .menu-button, .page-container-right', function () {
    container.children().attr('class', 'hide-menu');
    container.find('.menu-button').text('>>');
  });
  container.on('click', '.hide-menu .menu-button', function () {
    container.children().attr('class', 'show-menu');
    container.find('.menu-button').text('<<');
  });
});
