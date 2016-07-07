/*jshint multistr: true */
(function($, window) {
  'use strict';
  var DriverChartModule = {
    getfilter2Width: function() {
      return $('.filter2-chart').actual('width');
    }, //total width of the filter2 container
    getBlockWidth: function() {
      return $('.scale').actual('width');
    },
    setfilter2Chart: function(min, max, chartDom) {
      $(chartDom).css('left', (min * this.getBlockWidth()) - 1);
      $(chartDom).css('width', (max - min) * this.getBlockWidth());
    },
    driverCheckboxStates: {
      filter1: true,
      filter2: true,
      filter2: true,
      filter3: true,
      filter4: true
    },
    setdriverCheckboxStatesToDom: function() {
      localStorage.setItem('driverCheckboxStates', JSON.stringify(this.driverCheckboxStates));
    },
    alignMarkers: function(valuesArray) { // filter1,filter2,filter3
      var arrayLength = valuesArray.length;
      for (var i = 0; i < arrayLength; i++) { // -1 because dom redering starts from 0 and filter2 starts from 1
        $($('.filter1-marker')[i]).css('left', ((valuesArray[i].filter1 - 1) * this.getBlockWidth()) - 9);
        $($('.filter2-marker')[i]).css('left', ((valuesArray[i].filter2 - 1) * this.getBlockWidth()) - 9);
        $($('.filter3-marker')[i]).css('left', ((valuesArray[i].filter3 - 1) * this.getBlockWidth()) - 9);
        $($('.filter4-marker')[i]).css('left', ((valuesArray[i].filter4 - 1) * this.getBlockWidth()) - 9);
      }
    },
    alignDescMarkers: function(descArray) {
      var arrayLength = descArray.length;
      for (var i = 0; i < arrayLength - 1; i++) { //starting with 1 because the 0th element is messed up
        $($('.filter1-desc-marker')[i]).css('left', ((descArray[i + 1].filter1 - 1) * this.getBlockWidth()) - 4.5);
        $($('.filter2-desc-marker')[i]).css('left', ((descArray[i + 1].filter2 - 1) * this.getBlockWidth()) - 4.5);
        $($('.filter3-desc-marker')[i]).css('left', ((descArray[i + 1].filter3 - 1) * this.getBlockWidth()) - 4.5);
        $($('.filter4-desc-marker')[i]).css('left', ((descArray[i + 1].filter4 - 1) * this.getBlockWidth()) - 4.5);
      }
    },
    getDomMapper: function(driverData, descData) {
      var goupedDesc = DriverChartModule.descData.reduce(function(result, current) {
        var Drivercode = current.driverCode.split('_')[0];
        result[Drivercode] = result[Drivercode] || [];
        result[Drivercode].push({
          leftText: current.driverName,
          rightText: current.rightText
        });
        return result;
      });
      return $.map(DriverChartModule.driverData, function(val, i) {
        return {
          driverName: val.driverName,
          drillDown: goupedDesc[val.driverCode]
        };
      });
    },
    connectTheDots: function(jQueryDotsContainer) {
      var markers = {
          filter2: $(jQueryDotsContainer).find('.filter2-desc-marker'),
          filter1: $(jQueryDotsContainer).find('.filter1-desc-marker'),
          filter3: $(jQueryDotsContainer).find('.filter3-desc-marker'),
          filter4: $(jQueryDotsContainer).find('.filter4-desc-marker')
        },
        lineDom, i, Dy, Dx, length, angle, transform;
      Object.keys(markers).forEach(function(key) {
        for (i = 0; i < markers[key].length - 1; i++) {
          if ($(markers[key][i]).children().length === 0) {
            lineDom = '<div class="line-container line-box' + i + '"><div class="line line' + i + '"></div>';
            $(markers[key][i]).append(lineDom);
          } else {
            lineDom = $(markers[key][i]).find('.line-box');
          }
          Dy = 80;
          Dx = $(markers[key][i + 1]).position().left - $(markers[key][i]).position().left;
          length = Math.sqrt(Dy * Dy + Dx * Dx);
          angle = Math.atan2(Dy, Dx);
          transform = 'rotate(' + angle + 'rad)';
          $(markers[key][i]).find('.line-container .line').css({
            'transform': transform
          });
          $(markers[key][i]).find('.line-container').css({
            'width': length + 'px'
          });
        }
      });
    },
    descData: [],
    driverData: [],
    chartDom: {}
  };

  function init() {
    drawfilter2Chart(DriverChartModule.driverData, $('.driver-filter2'));
    drawfilter2Chart(DriverChartModule.descData, $('.driver-desc-filter2'));
    DriverChartModule.alignMarkers(DriverChartModule.driverData);
    DriverChartModule.alignDescMarkers(DriverChartModule.descData);
  }

  function checkLocalStorage() {
    if (!localStorage.getItem('driverCheckboxStates')) {
      DriverChartModule.setdriverCheckboxStatesToDom();
    }
  }

  function drawfilter2Chart(data, dom) {
    $.map(data, function(val, i) {
      DriverChartModule.setfilter2Chart(val.min - 1, val.max - 1, dom[i]);
    });
  }

  function initAccordians() {
    var allPanels = $('.driver-desc').hide();
    $('.driver-wrapper').click(function() {
      var $target = $(this).next(),
        driverWrapper = $('.driver-wrapper');
      if ($target.hasClass('active')) { // closing
        $target.removeClass('active').slideUp();
        $(this).find('.arrow').removeClass('invert');
        $(this).find('.driver-right-text').fadeOut();
      } else { //opening
        allPanels.removeClass('active').slideUp();
        $target.addClass('active').slideDown();
        driverWrapper.find('.arrow').removeClass('invert');
        driverWrapper.find('.driver-right-text').fadeOut();
        $(this).find('.driver-right-text').fadeIn();
        $(this).find('.arrow').addClass('invert');
        DriverChartModule.connectTheDots($(this).next());
      }
      return false;
    });
  }

  function initDom(chartDom) {
    $.map(DriverChartModule.getDomMapper(), function(val) {
      chartDom.append('<div class="driver-row clearfix">\
      <div class="clearfix driver-wrapper"><div class="driver-name pull-left">' + val.driverName +
        '</div><div class="filter2-chart pull-left"><div class="scales"><div class="scale pull-left"><div class="scale-border"></div>\
      </div><div class="scale pull-left"><div class="scale-border"></div></div><div class="scale pull-left">\
      <div class="scale-border"></div></div><div class="scale pull-left"><div class="scale-border"></div>\
      </div></div><div class="filter2-bar driver-filter2"></div><span class="filter1-marker marker"></span>\
      <span class="filter2-marker marker"></span><span class="filter3-marker marker"></span><span class="filter4-marker marker"></span>\
      </div>\
      <div class="driver-right-text pull-left"><div class="text-center best-practices">DETAILED INFO</div></div>\
      <div class="arrow-bottom pull-right arrow"></div></div><div class="driver-desc clearfix"></div></div>');
      $.map(val.drillDown, function(drillDown, j) {
        $('.driver-desc').last().append('<div class="description-wrapper"><div class="driver-name pull-left"><div class="driver-text">' +
          drillDown.leftText +
          '</div></div><div class="filter2-chart pull-left"> <div class="scales"> <div class="scale pull-left">\
        <div class="scale-border"></div> </div> <div class="scale pull-left"><div class="scale-border"></div>\
        </div><div class="scale pull-left"> <div class="scale-border"></div> </div> <div class="scale pull-left">\
        <div class="scale-border"></div> </div> </div> <div class="filter2-bar driver-desc-filter2"> </div>\
        <span class="filter1-desc-marker marker"></span> <span class="filter2-desc-marker marker"></span>\
        <span class="filter3-desc-marker marker"></span><span class="filter4-desc-marker marker"></span> </div>\
        <div class="desc-right-container pull-left"><div class="desc-text"> ' + drillDown.rightText + '</div></div></div>');
      });
    });
  }

  function appendStaticDom(chartDom) {
    chartDom.append('<div class=checkbox-form><ul><li class=blue-checkbox><input checked id=your-filter1-da type=checkbox><label for=your-filter1-da>filter1</label><li class=red-checkbox><input checked id=filter2-average-da type=checkbox><label for=filter2-average-da>filter2<div class=label-desc><span class=selected-filter2></span> <span class=selected-filter2-value></span></div></label><li class=green-checkbox><input checked id=filter2-companies-da type=checkbox><label for=filter2-companies-da>Range<div class=label-desc></div></label><li class=yellow-checkbox><input checked id=top-filter3-da type=checkbox><label for=top-filter3-da>filter3</label><li class=black-checkbox><input checked id=top-10%-da type=checkbox><label for=top-10%-da>filter4</label></ul></div><div class=driver-analysis-heading><div class="pull-left driver-heading">DRIVER</div><div class="pull-left survey-heading">SCORE</div></div><div><div class="pull-left space-fill-40"></div><div class="pull-left chart-heading"><span>BASIC</span> <span class=chart-heading-advanced>ADVANCED</span></div></div><div><div class="pull-left space-fill-40"></div><div class="pull-left chart-triangle"><div class="pull-left triangle-box"><div class="triangle triangle-left"></div></div><div class="pull-left triangle-box"><div class="triangle triangle-left"></div></div><div class="pull-left triangle-box"><div class="triangle triangle-left"></div></div><div class="pull-left triangle-box"><div class="pull-left triangle triangle-left"></div><div class="triangle pull-right triangle-right"></div></div></div></div>');
  }

  function checkboxWatcher() {
    var checkboxMapper = [{
        labelClass: 'blue',
        type: 'filter1'
      }, {
        labelClass: 'red',
        type: 'filter2'
      },
      {
        labelClass: 'yellow',
        type: 'filter3'
      },
      {
        labelClass: 'black',
        type: 'filter4'
      }];
    $.map(checkboxMapper, function(val, i) {
      DriverChartModule.chartDom.find('.' + val.labelClass + '-checkbox input').click(function() {
        var checkboxVal = $(this).prop('checked'),
          targetDom = $('.' + val.type + '-marker, .' + val.type + '-desc-marker');
        if (checkboxVal) {
          targetDom.animate({
            opacity: 1
          }, 200);
        } else {
          targetDom.animate({
            opacity: 0
          }, 200);
        }
        DriverChartModule.driverCheckboxStates[val.type] = checkboxVal;
        DriverChartModule.setdriverCheckboxStatesToDom();
      });
    });
    DriverChartModule.chartDom.find('.green-checkbox input').click(function() {
      var checkboxVal = $(this).prop('checked');
      if ($(this).prop('checked')) {
        $('.filter2-bar').fadeIn(200);
      } else {
        $('.filter2-bar').fadeOut(200);
      }
      DriverChartModule.driverCheckboxStates.filter2 = $(this).prop('checked');
      DriverChartModule.setdriverCheckboxStatesToDom();
    });
  }

  function initCheckboxPersistant() {
    var localState = localStorage.getItem('driverCheckboxStates');
    var checkboxdata = JSON.parse(localStorage.getItem('driverCheckboxStates'));
    var checkboxMapper = [{
        labelClass: 'blue',
        type: 'filter1'
        }, {
        labelClass: 'red',
        type: 'filter2'
        }, {
        labelClass: 'green',
        type: 'filter2'
        },
      {
        labelClass: 'yellow',
        type: 'filter3'
        },
      {
        labelClass: 'black',
        type: 'filter4'
        }];
    $.map(checkboxMapper, function(val, i) {
      if (!checkboxdata[val.type]) {
        DriverChartModule.chartDom.find('.' + val.labelClass + '-checkbox input').click();
      }
    });
  }

  $.fn.lineRangeChart = function(descData, driverData) {
    if (!descData || !driverData) {
      console.error('Error in data format. Please go to https://github.com/rahulgaba16/linefilter2Chart to understand the data format that this chart expects.');
      return false;
    }
    var chartDom = this;
    chartDom.addClass('line-range-container');
    appendStaticDom(chartDom);
    checkLocalStorage();
    DriverChartModule.descData = descData;
    DriverChartModule.driverData = driverData;
    DriverChartModule.chartDom = chartDom;
    initDom(chartDom);
    initAccordians();
    init();
    checkboxWatcher();
    initCheckboxPersistant();
    chartDom.find('.driver-wrapper').first().click();
    $(window).resize(function() {
      var connectTheDotsContainer = chartDom.find('.active');
      init();
      if (connectTheDotsContainer.length > 1) {
        DriverChartModule.connectTheDots(connectTheDotsContainer);
      }
    });
  }
})(jQuery, window);
