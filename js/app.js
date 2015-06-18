/**
 * Created by alex on 6/18/15.
 */

angular.module('myApp', ['ngRoute']);

//angular 风格 by https://github.com/johnpapa/angular-styleguide/blob/master/i18n/zh-CN.md

//config函数只声明一次，若多次声明，则后者覆盖前者
angular.module('myApp')
    .config(function($routeProvider, WeatherProvider) {
        WeatherProvider.setApiKey('Your key');
        $routeProvider
            .when('/', {
                templateUrl: 'templates/home.html',
                controller: 'MainController',
                controllerAs: 'mainController'
            })
            .when('/settings', {
                templateUrl: 'templates/settings.html',
                controller: 'SettingsController',
                controllerAs: 'settingsController'
            })
            .otherwise({redirectTo: '/'});
    });

//使用provider注册服务，因为这是注入到config函数服务中的唯一方法
angular.module('myApp')
    .provider('Weather', Weather);

angular.module('myApp')
    .controller('MainController', MainController);

angular.module('myApp')
    .controller('SettingsController', SettingsController);

function Weather() {
    var apiKey = '';
    this.setApiKey = setApiKey;
    this.$get = $get;
    this.getUrl = getUrl;

    function setApiKey(apiKey) {
        //this 这里用到了原型链
        apiKey && (this.apiKey = apiKey)
    }

    function $get($q, $http) {
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
    }

    function getUrl(type, ext) {
        return "http://api.wunderground.com/api/" + this.apiKey + "/" + type + "/q/" + ext + '.json';
    }
}

function MainController($scope, $timeout, Weather) {
    var self = this;
    this.date = {};
    this.weather = {};

    var updateTime = function() {
        self.date.raw = new Date();
        $timeout(updateTime, 1000);
    };

    updateTime();

    //暂时硬编码
    Weather.getWeatherForecast('CA/San_Francisco')
        .then(function(data) {
            self.weather.forecast = data;
        });
}

function SettingsController() {}