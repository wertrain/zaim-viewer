var csv2json = function(csvText) {
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
    for (i = 0; i < data.length; ++i) {
        if (typeof amountCategories[data[i][LABEL_CATEGORY]] === 'undefined') {
            amountCategories[data[i][LABEL_CATEGORY]] = parseInt(data[i][LABEL_SPENDING], 10);
        }
        console.log();
    }
};

var init = function() {
    var ID_DROP_AREA = '#csv-input-area';
    var ID_TEXT_AREA = '#csv-text';
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
        csv2json(csvText);
    });
    
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
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            name: 'Brands',
            colorByPoint: true,
            data: [{
                name: 'Microsoft Internet Explorer',
                y: 56.33
            }, {
                name: 'Chrome',
                y: 24.03,
                sliced: true,
                selected: true
            }, {
                name: 'Firefox',
                y: 10.38
            }, {
                name: 'Safari',
                y: 4.77
            }, {
                name: 'Opera',
                y: 0.91
            }, {
                name: 'Proprietary or Undetectable',
                y: 0.2
            }]
        }]
    });
}();
