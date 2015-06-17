/**
 * Created by alex on 6/18/15.
 */

angular.module('myApp', []);

//angular 风格 by https://github.com/johnpapa/angular-styleguide/blob/master/i18n/zh-CN.md

angular.module('myApp')
    .config(function(WeatherProvider) {
        WeatherProvider.setApiKey('a44dc8250645d5ff');
    });

//使用provider注册服务，因为这是注入到config函数服务中的唯一方法
angular.module('myApp')
    .provider('Weather', Weather);

angular.module('myApp')
    .controller('MainController', MainController);

function Weather() {
    var apiKey = '';

    this.setApiKey = function(apiKey) {
        //this 这里用到了原型链
        apiKey && (this.apiKey = apiKey)
    };

    this.$get = function($q, $http) {
        var self = this;
        return {
            getWeatherForecast: function(city) {
                var d = $q.defer();
                $http({
                    method: 'GET',
                    url: self.getUrl('forecast', city),
                    cache: true
                }).success(function(data) {
                    d.resolve(data.forecast.simpleforecast);
                }).error(function(err) {
                    d.reject(err);
                });
                return d.promise;
            }
        };
    };

    this.getUrl = function(type, ext) {
        return "http://api.wunderground.com/api/" + this.apiKey + "/" + type + "/q/" + ext + '.json';
    };
}

function MainController($scope, $timeout, Weather) {
    var self = this;
    this.date = {};

    var updateTime = function() {
        self.date.raw = new Date();
        $timeout(updateTime, 1000);
    };

    updateTime();

    this.weather = {};
    //暂时硬编码
    Weather.getWeatherForecast('CA/San_Francisco')
        .then(function(data) {
            self.weather.forecast = data;
        });
}