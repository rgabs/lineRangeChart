/*jshint multistr: true */
(function($, window) {
  'use strict';
  var DriverChartModule = {
    getRangeWidth: function() {
      return $('.range-chart').actual('width');
    }, //total width of the range container
    getBlockWidth: function() {
      return $('.scale').actual('width');
    },
    setRangeChart: function(min, max, chartDom) {
      $(chartDom).css('left', (min * this.getBlockWidth()) - 1);
      $(chartDom).css('width', (max - min) * this.getBlockWidth());
    },
    driverCheckboxStates: {
      company: true,
      industry: true,
      range: true,
      quartile: true,
      top10: true
    },
    setdriverCheckboxStatesToDom: function() {
      localStorage.setItem('driverCheckboxStates', JSON.stringify(this.driverCheckboxStates));
    },
    alignMarkers: function(valuesArray) { // company,industry,quartile
      var arrayLength = valuesArray.length;
      for (var i = 0; i < arrayLength; i++) { // -1 because dom redering starts from 0 and range starts from 1
        $($('.company-marker')[i]).css('left', ((valuesArray[i].company - 1) * this.getBlockWidth()) - 9);
        $($('.industry-marker')[i]).css('left', ((valuesArray[i].industry - 1) * this.getBlockWidth()) - 9);
        $($('.quartile-marker')[i]).css('left', ((valuesArray[i].quartile - 1) * this.getBlockWidth()) - 9);
        $($('.top10-marker')[i]).css('left', ((valuesArray[i].top10 - 1) * this.getBlockWidth()) - 9);
      }
    },
    alignDescMarkers: function(descArray) {
      var arrayLength = descArray.length;
      for (var i = 0; i < arrayLength - 1; i++) { //starting with 1 because the 0th element is messed up
        $($('.company-desc-marker')[i]).css('left', ((descArray[i + 1].company - 1) * this.getBlockWidth()) - 4.5);
        $($('.industry-desc-marker')[i]).css('left', ((descArray[i + 1].industry - 1) * this.getBlockWidth()) - 4.5);
        $($('.quartile-desc-marker')[i]).css('left', ((descArray[i + 1].quartile - 1) * this.getBlockWidth()) - 4.5);
        $($('.top10-desc-marker')[i]).css('left', ((descArray[i + 1].top10 - 1) * this.getBlockWidth()) - 4.5);
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
      console.log('DriverChartModule.driverData', DriverChartModule.driverData);
      return $.map(DriverChartModule.driverData, function(val, i) {
        return {
          driverName: val.driverName,
          drillDown: goupedDesc[val.driverCode]
        };
      });
    },
    connectTheDots: function(jQueryDotsContainer) {
      var markers = {
          industry: $(jQueryDotsContainer).find('.industry-desc-marker'),
          company: $(jQueryDotsContainer).find('.company-desc-marker'),
          quartile: $(jQueryDotsContainer).find('.quartile-desc-marker'),
          top10: $(jQueryDotsContainer).find('.top10-desc-marker')
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
    }
  };

  function init() {
    drawRangeChart(DriverChartModule.driverData, $('.driver-range'));
    drawRangeChart(DriverChartModule.descData, $('.driver-desc-range'));
    DriverChartModule.alignMarkers(DriverChartModule.driverData);
    DriverChartModule.alignDescMarkers(DriverChartModule.descData);
  }

  function drawRangeChart(data, dom) {
    $.map(data, function(val, i) {
      DriverChartModule.setRangeChart(val.min - 1, val.max - 1, dom[i]);
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
    console.log('DriverChartModule.getDomMapper()', DriverChartModule.getDomMapper());
    $.map(DriverChartModule.getDomMapper(), function(val) {
      chartDom.append('<div class="driver-row clearfix">\
      <div class="clearfix driver-wrapper"><div class="driver-name pull-left">' + val.driverName +
        '</div><div class="range-chart pull-left"><div class="scales"><div class="scale pull-left"><div class="scale-border"></div>\
      </div><div class="scale pull-left"><div class="scale-border"></div></div><div class="scale pull-left">\
      <div class="scale-border"></div></div><div class="scale pull-left"><div class="scale-border"></div>\
      </div></div><div class="range-bar driver-range"></div><span class="company-marker marker"></span>\
      <span class="industry-marker marker"></span><span class="quartile-marker marker"></span><span class="top10-marker marker"></span>\
      </div>\
      <div class="driver-right-text pull-left"><div class="text-center best-practices">BEST PRACTICES</div></div>\
      <div class="arrow-bottom pull-right arrow"></div></div><div class="driver-desc clearfix"></div></div>');
      $.map(val.drillDown, function(drillDown, j) {
        $('.driver-desc').last().append('<div class="description-wrapper"><div class="driver-name pull-left"><div class="driver-text">' +
          drillDown.leftText +
          '</div></div><div class="range-chart pull-left"> <div class="scales"> <div class="scale pull-left">\
        <div class="scale-border"></div> </div> <div class="scale pull-left"><div class="scale-border"></div>\
        </div><div class="scale pull-left"> <div class="scale-border"></div> </div> <div class="scale pull-left">\
        <div class="scale-border"></div> </div> </div> <div class="range-bar driver-desc-range"> </div>\
        <span class="company-desc-marker marker"></span> <span class="industry-desc-marker marker"></span>\
        <span class="quartile-desc-marker marker"></span><span class="top10-desc-marker marker"></span> </div>\
        <div class="desc-right-container pull-left"><div class="desc-text"> ' + drillDown.rightText + '</div></div></div>');
      });
    });
  }

  function initStaticDom(chartDom) {
    chartDom.append('<div class=checkbox-form><ul><li class=blue-checkbox><input checked id=your-company-da type=checkbox><label for=your-company-da>Your company</label><li class=red-checkbox><input checked id=industry-average-da type=checkbox><label for=industry-average-da>Industry Average<div class=label-desc><span class=selected-industry></span> <span class=selected-industry-value></span></div></label><li class=green-checkbox><input checked id=range-companies-da type=checkbox><label for=range-companies-da>Range of 80% companies<div class=label-desc>in the industry</div></label><li class=yellow-checkbox><input checked id=top-quartile-da type=checkbox><label for=top-quartile-da>Top Quartile</label><li class=black-checkbox><input checked id=top-10%-da type=checkbox><label for=top-10%-da>Top 10%</label></ul></div><div class=driver-analysis-heading><div class="pull-left driver-heading">DRIVER</div><div class="pull-left survey-heading">SURVEY SCORE</div></div><div><div class="pull-left space-fill-40"></div><div class="pull-left chart-heading"><span>BASIC</span> <span class=chart-heading-advanced>ADVANCED</span></div></div><div><div class="pull-left space-fill-40"></div><div class="pull-left chart-triangle"><div class="pull-left triangle-box"><div class="triangle triangle-left"></div></div><div class="pull-left triangle-box"><div class="triangle triangle-left"></div></div><div class="pull-left triangle-box"><div class="triangle triangle-left"></div></div><div class="pull-left triangle-box"><div class="pull-left triangle triangle-left"></div><div class="triangle pull-right triangle-right"></div></div></div></div>');
  }

  function checkboxWatcher() {
    var checkboxMapper = [{
        labelClass: 'blue',
        type: 'company'
      }, {
        labelClass: 'red',
        type: 'industry'
      },
      {
        labelClass: 'yellow',
        type: 'quartile'
      },
      {
        labelClass: 'black',
        type: 'top10'
      }];
    $.map(checkboxMapper, function(val, i) {
      $('#driver-chart-container .' + val.labelClass + '-checkbox input').click(function() {
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
        this.driverCheckboxStates[val.type] = checkboxVal;
        this.setdriverCheckboxStatesToDom();
      });
    });
    $('#driver-chart-container .green-checkbox input').click(function() {
      var checkboxVal = $(this).prop('checked');
      if ($(this).prop('checked')) {
        $('.range-bar').fadeIn(200);
      } else {
        $('.range-bar').fadeOut(200);
      }
      this.driverCheckboxStates.range = $(this).prop('checked');
      this.setdriverCheckboxStatesToDom();
    });
  }

  function initCheckboxPersistant() {
    var checkboxdata = JSON.parse(localStorage.getItem('driverCheckboxStates'));
    var checkboxMapper = [{
        labelClass: 'blue',
        type: 'company'
        }, {
        labelClass: 'red',
        type: 'industry'
        }, {
        labelClass: 'green',
        type: 'range'
        },
      {
        labelClass: 'yellow',
        type: 'quartile'
        },
      {
        labelClass: 'black',
        type: 'top10'
        }];
    $.map(checkboxMapper, function(val, i) {
      if (!checkboxdata[val.type]) {
        $('#driver-chart-container .' + val.labelClass + '-checkbox input').click();
      }
    });
  }


  $.fn.lineRangeChart = function(descData, driverData) {
    console.log('descData, driverData', descData, driverData);
    if (!descData || !driverData) {
      console.error('Error in data format. Please go to https://github.com/rahulgaba16/lineRangeChart to understand the data format that this chart expects.');
      return false;
    }
    var chartDom = this;
    console.log('initStaticDom');
    initStaticDom(chartDom);
    DriverChartModule.descData = descData;
    DriverChartModule.driverData = driverData;
    console.log('initDom');
    initDom(chartDom);
    console.log('initAccordians');
    initAccordians();
    console.log('init');
    init();
    checkboxWatcher();
    // initCheckboxPersistant();
    $(window).resize(function() {
      var connectTheDotsContainer = chartDom.find('.active');
      init();
      if (connectTheDotsContainer.length > 1) {
        DriverChartModule.connectTheDots(connectTheDotsContainer);
      }
    });
  }
})(jQuery, window);
