const content = {
  /*************************************/
  //content definition
  /*************************************/
  hasAssessment: false,
  pageArray: [],
  init: function () {
    var queryString = new String(document.location.search);
    queryString = queryString.replace("?content=", "");
    queryString = queryString.toLowerCase();

    switch (queryString) {
      case "page":
        this.hasAssessment = false;
        this.pageArray = new Array(3);
        this.pageArray[0] = "content/page1.html";
        this.pageArray[1] = "content/page2.html";
        this.pageArray[2] = "content/page3.html";
        break;
      case "final":
        this.hasAssessment = false;
        this.pageArray = new Array(1);
        this.pageArray[0] = "content/final.html";
        break;
    }
  },
};
