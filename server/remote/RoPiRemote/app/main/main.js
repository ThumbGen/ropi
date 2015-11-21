(function () {
    'use strict';

    angular
        .module('app')
        .controller('MainController', main);

    function main() {
        var vm = this;
        vm.food = 'pizza';
    }

})();