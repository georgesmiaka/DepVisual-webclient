const routes = {
    getData: function getData() {
        return "http://localhost:1337/data";
    },
    getDataBykeyword: function getDataByKeyword(keyword) {
        return "http://localhost:1337/data?keyword="+keyword;
    },
    getDepentComponent: function getDepentComponent() {
        return "http://localhost:1337/dependency";
    },
    startAnalysis: function startAnalysis() {
        return "http://localhost:1337/analyze";
    },
    getProgress: function getProgress () {
        return "http://localhost:1337/progress";
    }
};

module.exports = routes;

