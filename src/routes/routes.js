const routes = {
    getData: function getData() {
        return "http://localhost:1337/data";
    },
    getDataBykeyword: function getDataByKeyword(keyword) {
        return "http://localhost:1337/data?keyword="+keyword;
    },
    getComponentinfo: function getComponentinfo() {
        return "http://localhost:1337/componentinfo";
    },
    getDepentComponent: function getDepentComponent() {
        return "http://localhost:1337/graph/basedir";
    },
};

module.exports = routes;

