/**
 * SPARQL query form controller
 */
neonionApp.controller('QueryCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";

    $scope.form = {
        prefixes: "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
        query: "SELECT * {\n" +
        "\t?uri rdf:type <http://neonion.org/concept/person> .\n" +
        "\t?uri rdfs:label ?name\n" +
        "}\nLIMIT 50",
        composer : {}
    };

    $scope.endpoint = "endpoint/query";
    $scope.queries = {
        distinctSubjects : "SELECT DISTINCT ?subject ?label { ?subject rdfs:label ?label }",
        distinctPredicates : "SELECT DISTINCT ?predicate { ?s ?predicate ?o }",
        distinctObjects : "SELECT DISTINCT ?object { ?s rdf:type ?object }"
    }

    // get subjets
    $http.get($scope.endpoint + "?query=" + $scope.queries.distinctSubjects + "&output=json")
        .success(function (data) {
            console.log(data.results.bindings);
            $scope.form.subjects = data.results.bindings;
        });

    // get predicates
    $http.get($scope.endpoint + "?query=" + $scope.queries.distinctPredicates + "&output=json")
        .success(function (data) {
            $scope.form.predicates = data.results.bindings;
        });

    // get objets
    $http.get($scope.endpoint + "?query=" + $scope.queries.distinctObjects + "&output=json")
        .success(function (data) {
            $scope.form.objects = data.results.bindings;
        });

    $scope.assembleQuery = function() {
        var query = "SELECT * {\n\t";
        query += ($scope.form.selectedSubject) ? "<" + $scope.form.selectedSubject.subject.value + ">" : "?s ";
        query += ($scope.form.selectedPredicate) ? "<" + $scope.form.selectedPredicate.predicate.value + ">" : "?p ";
        query += ($scope.form.selectedObject) ? "<" + $scope.form.selectedObject.object.value + ">" : "?o ";
        if (!$scope.form.selectedSubject) {
            query += ".\n\t?s rdfs:label ?name"
        }

        query += "\n}\nLIMIT 50";

        $scope.form.query = query;
    }

    $scope.executeQuery = function () {
        var q = new sgvizler.Query();
        q.query($scope.form.query).
            endpointURL($scope.endpoint).
            endpointOutputFormat("json").
            chartFunction("google.visualization.Table").
            draw("query-result");
    };

}]);