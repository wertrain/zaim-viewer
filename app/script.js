var parseCsv = function(csvText) {
    var csvArray = csvText.split('\n');
    var i = 0;
    var labels = csvArray[i++].split(',');
    var data = [];
    for (; i < csvArray.length - 1; ++i) {
        data.push(csvArray[i].split(','));
    }
    
    // 日付,方法,カテゴリ,ジャンル,支払元,入金先,商品,メモ,場所,通貨,収入,支出,振替,残高調整,通貨変換前の金額,集計の設定
    var labelIndex = 0;
    var LABEL_DATE = labelIndex++;
    var LABEL_METHOD = labelIndex++;
    var LABEL_CATEGORY = labelIndex++;
    var LABEL_GENRE = labelIndex++;
    var LABEL_FROM = labelIndex++;
    var LABEL_TO = labelIndex++;
    var LABEL_COMMODITY = labelIndex++;
    var LABEL_MEMO = labelIndex++;
    var LABEL_PLACE = labelIndex++;
    var LABEL_CURRENCY = labelIndex++;
    var LABEL_INCOME = labelIndex++;
    var LABEL_SPENDING = labelIndex++;
    var LABEL_EXCHANGE = labelIndex++;
    var LABEL_ADJUSTMENT = labelIndex++;
    var LABEL_BEFORE_CONVERSION = labelIndex++;
    var LABEL_AGGREGATE = labelIndex++;
    
    var amountCategories = [];
    var amountMonths = [];
    var amountMonthCategories = [];
    for (i = 0; i < data.length; ++i) {
        var spending = parseInt(data[i][LABEL_SPENDING], 10);
        spending = isNaN(spending) ? 0 : spending;
        // 月ごとの集計
        var date = data[i][LABEL_DATE].split('-');
        if (date.length === 3) {
            // 0 origin に変更
            var month = parseInt(date[1], 10) - 1;
            if (typeof amountMonths[month] === 'undefined') {
                amountMonths[month] = 0;
            }
            amountMonths[month] += spending;
            
            if (typeof amountMonthCategories[data[i][LABEL_CATEGORY]] === 'undefined') {
                amountMonthCategories[data[i][LABEL_CATEGORY]] = [];
            }
            
            if (typeof amountMonthCategories[data[i][LABEL_CATEGORY]][month] === 'undefined') {
                amountMonthCategories[data[i][LABEL_CATEGORY]][month] = 0;
            }
            amountMonthCategories[data[i][LABEL_CATEGORY]][month] += spending;
        }
        // ジャンルごとの集計
        if (typeof amountCategories[data[i][LABEL_CATEGORY]] === 'undefined') {
            amountCategories[data[i][LABEL_CATEGORY]] = 0;
        }
        amountCategories[data[i][LABEL_CATEGORY]] += spending;
    }
    //for (var category in amountMonthCategories) {
    //   for (var month in amountMonthCategories[category]) {
    //       console.log(month + '月' + ' ' + category + ' ' + amountMonthCategories[category][month]);
    //   }
    //}
    var amountAll = 0;
    for (var key in amountCategories) {
        amountAll += amountCategories[key];
    }
    return {
        amount: amountAll,
        amountCategories: amountCategories,
        amountMonths: amountMonths,
        amountMonthCategories: amountMonthCategories
    };
};

var zaimData = null;

var init = function() {
    var ID_DROP_AREA = '#csv-input-area';
    var ID_TEXT_AREA = '#csv-text';
    var ID_HIGHCHARTS_AREA = '#highcharts-area';
    var ID_ERROR_CSV = '#error-csv';
    var ID_CLEAR_CSV_BUTTON = '#clear-csv-button';
    var ID_CONVERT_CSV_BUTTON = '#convert-csv-button';
    
    var droparea = $(ID_DROP_AREA);
    var cancelEvent = function(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    droparea.bind('dragenter', cancelEvent);
    droparea.bind('dragover', cancelEvent);
    droparea.bind('drop', function(e) {
        var file = e.originalEvent.dataTransfer.files[0];
        var fileReader = new FileReader();
        fileReader.onload = function(fe) {
            var extention = '.csv';
            if (file.name.indexOf(extention) === (file.name.length - extention.length)) {
                $(ID_TEXT_AREA).val(fe.target.result);
                $(ID_ERROR_CSV).hide();
            } else {
                $(ID_ERROR_CSV).fadeIn(500);
            }
        }
        fileReader.readAsText(file);
        
        cancelEvent(e);
        return false;
    });
    $(ID_CLEAR_CSV_BUTTON).on('click', function (e) {
        $(ID_ERROR_CSV).hide();
        $(ID_TEXT_AREA).val('');
    });
    $(ID_CONVERT_CSV_BUTTON).on('click', function (e) {
        $(ID_ERROR_CSV).hide();
        var csvText = $(ID_TEXT_AREA).val();
        if (csvText.length === 0) {
            return;
        }
        zaimData = parseCsv(csvText);
        if (zaimData !== null) {
            $(ID_DROP_AREA).hide();
            $(ID_HIGHCHARTS_AREA).show();
            pressTab(0);
        }
    });
}();

var pressTab = function(menuIndex) {
    if (zaimData === null) {
        return;
    }
    switch (menuIndex) {
        case 0:
            var categoriesData = [];
            for (var key in zaimData.amountCategories) {
                categoriesData.push({
                    name: key,
                    y: zaimData.amountCategories[key] / zaimData.amount,
                    value: zaimData.amountCategories[key]
                });
            }
            $('#highcharts-container').highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: 'ジャンルごとの総計'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.value} 円 ({point.percentage:.1f} %)',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    }
                },
                series: [{
                    name: 'カテゴリ',
                    colorByPoint: true,
                    data: categoriesData
                }]
            });
        break;
        
        case 1:
            var monthsData = [];
            for (var key in zaimData.amountMonths) {
                monthsData.push({
                    name: (parseInt(key, 10) + 1)  + '月',
                    id: (parseInt(key, 10) + 1)  + '月',
                    y: zaimData.amountMonths[key],
                    amount: zaimData.amountMonths[key],
                    percentage: (zaimData.amountMonths[key] / zaimData.amount) * 100.0
                });
            }
            $('#highcharts-container').highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: '月ごとの総計'
                },
                xAxis: {
                    type: 'category'
                },
                yAxis: {
                    title: {
                        text: '金額（円）'
                    }
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            format: '{point.amount}円<br/>（{point.percentage:.1f}%）'
                        }
                    }
                },

                tooltip: {
                    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.amount}円</b>（{point.percentage:.1f}%）<br/>'
                },

                series: [{
                    name: '月総計',
                    colorByPoint: true,
                    data: monthsData
                }]
            });
        break;
        
        case 2:
            var monthsData = [];
            var seriesData = [];
            
            var allCategories = [];
            for (var category in zaimData.amountMonthCategories) {
                if (-1 === allCategories.indexOf(category)) {
                    allCategories.push(category);
                }
            }
            for (var i in allCategories) {
                var category = allCategories[i];

                var data = [];
                for (var j = 0; j < zaimData.amountMonthCategories[category].length; ++j) {
                    if (typeof zaimData.amountMonthCategories[category][j] === 'undefined') {
                        data.push(0);
                    } else {
                        data.push(zaimData.amountMonthCategories[category][j]);
                    }
                }
                seriesData.push({
                    name: category,
                    data: data
                });
            }
            for (i = 0; i < 12; ++i) {
                monthsData.push((i + 1) + '月');
            }
            $('#highcharts-container').highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: '月ごとの総計内訳'
                },
                xAxis: {
                    categories: monthsData
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: '金額（円）'
                    },
                    stackLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold',
                            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                        }
                    }
                },
                legend: {
                    align: 'right',
                    x: -30,
                    verticalAlign: 'top',
                    y: 25,
                    floating: true,
                    backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false
                },
                tooltip: {
                    headerFormat: '<b>{point.x}</b><br/>',
                    pointFormat: '{series.name}: {point.y}<br/>総額: {point.stackTotal}'
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true,
                            color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                            style: {
                                textShadow: '0 0 3px black'
                            }
                        }
                    }
                },
                series: seriesData
            });
        break;
    }
}
