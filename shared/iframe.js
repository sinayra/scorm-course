const iframe = {
  setIframeHeight: function (id, navWidth) {
    if (document.getElementById) {
      var theIframe = document.getElementById(id);
      if (theIframe) {
        var height = this.getWindowHeight();
        theIframe.style.height = Math.round(height) - navWidth + "px";
        theIframe.style.marginTop =
          Math.round(
            (height - navWidth - parseInt(theIframe.style.height)) / 2
          ) + "px";
      }
    }
  },

  getWindowHeight: function () {
    var height = 0;
    if (window.innerHeight) {
      height = window.innerHeight - 18;
    } else if (
      document.documentElement &&
      document.documentElement.clientHeight
    ) {
      height = document.documentElement.clientHeight;
    } else if (document.body && document.body.clientHeight) {
      height = document.body.clientHeight;
    }
    return height;
  },

  SetupIFrame: function () {
    //set our iFrame for the content to take up the full screen except for our navigation
    var navWidth = 40;
    this.setIframeHeight("contentFrame", navWidth);
    //need this in a setTimeout to avoid a timing error in IE6
    window.setTimeout(
      'window.onresize = function() { setIframeHeight("contentFrame", ' +
        navWidth +
        "); }",
      1000
    );
  },
};
