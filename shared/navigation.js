const navigation = {
  /*************************************/
  //navigation functions
  /*************************************/

  currentPage: null,
  startTimeStamp: null,
  processedUnload: false,
  reachedEnd: false,

  doStart: function () {
    //get the iFrame sized correctly and set up
    iframe.SetupIFrame();

    //record the time that the learner started the SCO so that we can report the total time
    this.startTimeStamp = new Date();

    //initialize communication with the LMS
    scorm.ScormProcessInitialize();

    //it's a best practice to set the completion status to incomplete when
    //first launching the course (if the course is not already completed)
    var completionStatus = scorm.ScormProcessGetValue("cmi.completion_status", true);
    if (completionStatus == "unknown") {
      scorm.ScormProcessSetValue("cmi.completion_status", "incomplete");
    }

    //see if the user stored a bookmark previously (don't check for errors
    //because cmi.location may not be initialized
    var bookmark = scorm.ScormProcessGetValue("cmi.location", false);

    //if there isn't a stored bookmark, start the user at the first page
    if (!bookmark) {
      this.currentPage = 0;
    } else {
      //if there is a stored bookmark, prompt the user to resume from the previous location
      if (
        confirm("Would you like to resume from where you previously left off?")
      ) {
        this.currentPage = parseInt(bookmark, 10);
      } else {
        this.currentPage = 0;
      }
    }

    this.goToPage();
  },

  goToPage: function () {
    var theIframe = document.getElementById("contentFrame");
    var prevButton = document.getElementById("butPrevious");
    var nextButton = document.getElementById("butNext");

    //navigate the iFrame to the content
    theIframe.src = "../" + content.pageArray[this.currentPage];

    //disable the prev/next buttons if we are on the first or last page.
    if (this.currentPage == 0) {
      nextButton.disabled = false;
      prevButton.disabled = true;
    } else if (this.currentPage == content.pageArray.length - 1) {
      nextButton.disabled = true;
      prevButton.disabled = false;
    } else {
      nextButton.disabled = false;
      prevButton.disabled = false;
    }

    if (content.pageArray.length == 1) {
      nextButton.disabled = true;
      prevButton.disabled = true;
    }

    //save the current location as the bookmark
    scorm.ScormProcessSetValue("cmi.location", this.currentPage);

    //in this sample course, the course is considered complete when the last page is reached
    if (this.currentPage == content.pageArray.length - 1) {
      this.reachedEnd = true;
      scorm.ScormProcessSetValue("cmi.completion_status", "completed");

      //For simplicity's sake, mark the course as passed when it is completed
      //and doesn't have a test. This will make our sequencing based on global
      //objectives simpler.
      if (content.hasAssessment == false) {
        scorm.ScormProcessSetValue("cmi.success_status", "passed");
      }

      //invoke Commit because sometimes that will trigger the sequencer to
      //update the available navigational controls
      scorm.ScormProcessCommit();
    }
  },

  doUnload: function (pressedExit) {
    //don't call this function twice
    if (this.processedUnload == true) {
      return;
    }

    this.processedUnload = true;

    //record the session time
    var endTimeStamp = new Date();
    var totalMilliseconds = endTimeStamp.getTime() - this.startTimeStamp.getTime();
    var scormTime = this.ConvertMilliSecondsIntoSCORM2004Time(totalMilliseconds);

    scorm.ScormProcessSetValue("cmi.session_time", scormTime);

    //always default to saving the runtime data in this example
    scorm.ScormProcessSetValue("cmi.exit", "suspend");

    scorm.ScormProcessTerminate();
  },

  doPrevious: function () {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
    this.goToPage();
  },

  doNext: function () {
    if (this.currentPage < content.pageArray.length - 1) {
      this.currentPage++;
    }
    this.goToPage();
  },

  doExit: function () {
    //note use of short-circuit AND. If the user reached the end, don't prompt.
    //just exit normally and submit the results.
    if (
      this.reachedEnd == false &&
      confirm("Would you like to save your progress to resume later?")
    ) {
      //set exit to suspend
      scorm.ScormProcessSetValue("cmi.exit", "suspend");

      //issue a suspendAll navigation request
      scorm.ScormProcessSetValue("adl.nav.request", "suspendAll");
    } else {
      //set exit to normal
      scorm.ScormProcessSetValue("cmi.exit", "");

      //issue an exitAll navigation request
      scorm.ScormProcessSetValue("adl.nav.request", "exitAll");
    }

    //process the unload handler to close out the session.
    //the presense of an adl.nav.request will cause the LMS to
    //take the content away from the user.
    this.doUnload(true);
  },

  //called from the assessmenttemplate.html page to record the results of a test
  //passes in score as a percentage
  RecordTest: function (score) {
    scorm.ScormProcessSetValue("cmi.score.raw", score);
    scorm.ScormProcessSetValue("cmi.score.min", "0");
    scorm.ScormProcessSetValue("cmi.score.max", "100");

    var scaledScore = score / 100;
    scorm.ScormProcessSetValue("cmi.score.scaled", scaledScore);

    //consider 70% to be passing
    if (score >= 70) {
      scorm.ScormProcessSetValue("cmi.success_status", "passed");
    } else {
      scorm.ScormProcessSetValue("cmi.success_status", "failed");
    }
  },

  //SCORM requires time to be formatted in a specific way
  ConvertMilliSecondsIntoSCORM2004Time: function (intTotalMilliseconds) {
    var ScormTime = "";

    var HundredthsOfASecond; //decrementing counter - work at the hundreths of a second level because that is all the precision that is required

    var Seconds; // 100 hundreths of a seconds
    var Minutes; // 60 seconds
    var Hours; // 60 minutes
    var Days; // 24 hours
    var Months; // assumed to be an "average" month (figures a leap year every 4 years) = ((365*4) + 1) / 48 days - 30.4375 days per month
    var Years; // assumed to be 12 "average" months

    var HUNDREDTHS_PER_SECOND = 100;
    var HUNDREDTHS_PER_MINUTE = HUNDREDTHS_PER_SECOND * 60;
    var HUNDREDTHS_PER_HOUR = HUNDREDTHS_PER_MINUTE * 60;
    var HUNDREDTHS_PER_DAY = HUNDREDTHS_PER_HOUR * 24;
    var HUNDREDTHS_PER_MONTH = HUNDREDTHS_PER_DAY * ((365 * 4 + 1) / 48);
    var HUNDREDTHS_PER_YEAR = HUNDREDTHS_PER_MONTH * 12;

    HundredthsOfASecond = Math.floor(intTotalMilliseconds / 10);

    Years = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_YEAR);
    HundredthsOfASecond -= Years * HUNDREDTHS_PER_YEAR;

    Months = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_MONTH);
    HundredthsOfASecond -= Months * HUNDREDTHS_PER_MONTH;

    Days = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_DAY);
    HundredthsOfASecond -= Days * HUNDREDTHS_PER_DAY;

    Hours = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_HOUR);
    HundredthsOfASecond -= Hours * HUNDREDTHS_PER_HOUR;

    Minutes = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_MINUTE);
    HundredthsOfASecond -= Minutes * HUNDREDTHS_PER_MINUTE;

    Seconds = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_SECOND);
    HundredthsOfASecond -= Seconds * HUNDREDTHS_PER_SECOND;

    if (Years > 0) {
      ScormTime += Years + "Y";
    }
    if (Months > 0) {
      ScormTime += Months + "M";
    }
    if (Days > 0) {
      ScormTime += Days + "D";
    }

    //check to see if we have any time before adding the "T"
    if (HundredthsOfASecond + Seconds + Minutes + Hours > 0) {
      ScormTime += "T";

      if (Hours > 0) {
        ScormTime += Hours + "H";
      }

      if (Minutes > 0) {
        ScormTime += Minutes + "M";
      }

      if (HundredthsOfASecond + Seconds > 0) {
        ScormTime += Seconds;

        if (HundredthsOfASecond > 0) {
          ScormTime += "." + HundredthsOfASecond;
        }

        ScormTime += "S";
      }
    }

    if (ScormTime == "") {
      ScormTime = "0S";
    }

    ScormTime = "P" + ScormTime;

    return ScormTime;
  },
};
