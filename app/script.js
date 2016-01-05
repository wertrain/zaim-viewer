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
        title: {
            text: 'Monthly Average Temperature',
            x: -20 //center
        },
        subtitle: {
            text: 'Source: WorldClimate.com',
            x: -20
        },
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
            title: {
                text: 'Temperature (°C)'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: '°C'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'Tokyo',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        }, {
            name: 'New York',
            data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
        }, {
            name: 'Berlin',
            data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
        }, {
            name: 'London',
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
        }]
    });
}();