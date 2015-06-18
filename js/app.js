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
    .factory('UserService', UserService);

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

function UserService() {
    var defaults = {
        location: 'autoip'
    };
    var service = {
        user: {},
        save: function() {
            sessionStorage.presenty = angular.toJson(service.user);
        },
        restore: function() {
            //从sessionStorage中拉取配置
            service.user = !isEmpty(angular.fromJson(sessionStorage.presenty)) || defaults;
            return service.user;
        }
    };
    service.restore();
    return service;
}

function MainController($scope, $timeout, Weather, UserService) {
    var self = this;
    this.date = {};
    this.weather = {};
    this.user = UserService.user;

    var updateTime = function() {
        self.date.raw = new Date();
        $timeout(updateTime, 1000);
    };

    updateTime();


    Weather.getWeatherForecast(self.user.location)
        .then(function(data) {
            self.weather.forecast = data;
        });
}

function SettingsController($scope, UserService) {
    this.user = UserService.user;
    this.save = Save;

    function Save() {
        UserService.save();
    }
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}