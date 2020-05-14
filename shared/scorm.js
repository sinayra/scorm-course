/*
Source code created by Rustici Software, LLC is licensed under a 
Creative Commons Attribution 3.0 United States License
(http://creativecommons.org/licenses/by/3.0/us/)

Want to make SCORM easy? See our solutions at http://www.scorm.com.

This example demonstrates the use of basic runtime calls in a multi-page SCO. It
includes a demonstration of bookmarking, status reporting (completion and success), 
score and time. It also includes the addition of a basic "controller" for providing
intra-SCO navigation.
*/

const scorm = {
  //Constants
  SCORM_TRUE: "true",
  SCORM_FALSE: "false",
  SCORM_NO_ERROR: "0",

  //Since the Unload handler will be called twice, from both the onunload
  //and onbeforeunload events, ensure that we only call Terminate once.
  terminateCalled: false,
  //Track whether or not we successfully initialized.
  initialized: false,

  nFindAPITries: 0,
  API: null,
  maxTries: 500,

  displayError: function () {
    const errorNumber = this.API.GetLastError();
    const errorString = this.API.GetErrorString(errorNumber);
    const diagnostic = this.API.GetDiagnostic(errorNumber);

    const errorDescription = `Number ${errorNumber}\nDescription: ${errorString}\nDiagnostic: ${diagnostic}`;

    alert(
      "Error - Could not initialize communication with the LMS.\n\nYour results may not be recorded.\n\n" +
        errorDescription
    );
  },

  ScormProcessInitialize: function () {
    var result;

    this.GetAPI(window);

    if (this.API == null) {
      alert(
        "ERROR - Could not establish a connection with the LMS.\n\nYour results may not be recorded."
      );
      return;
    }

    result = this.API.Initialize();

    if (result == this.SCORM_FALSE) {
      this.displayError();
      return;
    }

    this.initialized = true;
  },

  ScormProcessTerminate: function () {
    var result;

    //Don't terminate if we haven't initialized or if we've already terminated
    if (this.initialized == false || this.terminateCalled == true) {
      return;
    }

    result = this.API.Terminate();

    this.terminateCalled = true;

    if (result == this.SCORM_FALSE) {
      this.displayError();
      return;
    }
  },

  /*
The onload and onunload event handlers are assigned in launchpage.html because more processing needs to 
occur at these times in this example.
*/
  //window.onload = ScormProcessInitialize;
  //window.onunload = ScormProcessTerminate;
  //window.onbeforeunload = ScormProcessTerminate;

  //There are situations where a GetValue call is expected to have an error
  //and should not alert the user.
  ScormProcessGetValue: function (element, checkError) {
    var result;

    if (this.initialized == false || this.terminateCalled == true) {
      return;
    }

    result = this.API.GetValue(element);

    if (checkError == true && result == "") {
      this.displayError();
      return "";
    }

    return result;
  },

  ScormProcessSetValue: function (element, value) {
    var result;

    if (this.initialized == false || this.terminateCalled == true) {
      return;
    }

    result = this.API.SetValue(element, value);

    if (result == this.SCORM_FALSE) {
      this.displayError();
      return;
    }
  },
  ScormProcessCommit: function () {
    var result;

    result = this.API.Commit("");

    if (result == this.SCORM_FALSE) {
      this.displayError();
      return;
    }
  },

  // The ScanForAPI() function searches for an object named API_1484_11
  // in the window that is passed into the function.  If the object is
  // found a reference to the object is returned to the calling function.
  // If the instance is found the SCO now has a handle to the LMS
  // provided API Instance.  The function searches a maximum number
  // of parents of the current window.  If no object is found the
  // function returns a null reference.  This function also reassigns a
  // value to the win parameter passed in, based on the number of
  // parents.  At the end of the function call, the win variable will be
  // set to the upper most parent in the chain of parents.
  ScanForAPI: function (win) {
    while (win.API_1484_11 == null && win.parent != null && win.parent != win) {
      nFindAPITries++;
      if (nFindAPITries > maxTries) {
        return null;
      }
      win = win.parent;
    }
    return win.API_1484_11;
  },

  // The GetAPI() function begins the process of searching for the LMS
  // provided API Instance.  The function takes in a parameter that
  // represents the current window.  The function is built to search in a
  // specific order and stop when the LMS provided API Instance is found.
  // The function begins by searching the current window�s parent, if the
  // current window has a parent.  If the API Instance is not found, the
  // function then checks to see if there are any opener windows.  If
  // the window has an opener, the function begins to look for the
  // API Instance in the opener window.
  GetAPI: function (win) {
    if (win.parent != null && win.parent != win) {
      this.API = this.ScanForAPI(win.parent);
    }
    if (this.API == null && win.opener != null) {
      this.API = this.ScanForAPI(win.opener);
    }
  },
};
