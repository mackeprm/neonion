neonionApp.controller('ConceptSetListCtrl', ['$scope', '$sce', 'CommonService', 'ConceptSetService', 'ConceptService',
        function ($scope, $sce, CommonService, ConceptSetService, ConceptService) {
            "use strict";

            CommonService.enabled = true;
            $scope.search = CommonService;

            $scope.style = {
                compact: false
            }
            $scope.locales = {
                // TODO localize
                create: "New Concept Set"
            };

            $scope.queryConceptSets = function () {
                return ConceptSetService.query(function (data) {
                    $scope.resources = data;
                }).$promise;
            };

            $scope.queryConcepts = function () {
                return ConceptService.query(function (data) {
                    $scope.concepts = data;
                }).$promise;
            };

            $scope.getItemHeader = function (resource) {
                return $sce.trustAsHtml(resource.label);
            };

            $scope.getItemSubHeader = function (resource) {
                return "";
            };

            $scope.getItemDescription = function (resource) {
                return $sce.trustAsHtml(resource.comment);
            };

            $scope.getItemFooter = function (resource) {
                if ($scope.concepts) {
                    var conceptNames = $scope.concepts.filter(
                        function (item) {
                            return resource.concepts.indexOf(item.id) != -1;
                        }
                    ).map(
                        function (item) {
                            return item.label;
                        }
                    );

                    return $sce.trustAsHtml(conceptNames.join(" | "));
                }
                return "";
            };

            $scope.filterResources = function (resource) {
                if ($scope.search.query.length > 0) {
                    return resource.label.toLowerCase().indexOf($scope.search.query.toLowerCase()) != -1;
                    ;
                }
                return true;
            }

            // execute promise chain
            $scope.queryConceptSets()
                .then($scope.queryConcepts);

        }]
);