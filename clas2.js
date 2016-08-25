"use strict";
var fs = require('fs'),
    system = require('system');


/*
 *
 * Customize these varriables
 *
 */

var pageList = [
  "people",
  "about",
  "why",
  "home",
  "student-life/undergraduate-experience",
  "research",
  "about/news-and-events",
  "about/events"
];
var liveBase = "https://math.asu.edu/";
var testBase = "https://test-math2.ws.asu.edu/";
var saveFolder = "mathtest/";
var viewportSize = { width: 1024, height: 768 };





var currentPage = 0;
var pageListSafe = pageList.slice(0);
var htmlContent = '';
var htmlTop = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"><title>Resemble.js : Image analysis</title><meta name="description" content=""><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="diff.css"></head><body><div id="images">';
var htmlBottom = '</div></body></html>';


for ( var index1= 0; index1 < pageListSafe.length; ++index1 ) {
  pageListSafe[index1] = pageListSafe[index1].replace("/", "--");
}

console.log("creating resembler page");
var pageTestD = require("webpage").create();
pageTestD.viewportSize = viewportSize;
buildResembler();


function processPageLive() {

  var pageLive = require("webpage").create();
  pageLive.viewportSize = viewportSize;

  pageLive.open(liveBase+pageList[currentPage], function() {
    console.log("opened live page - "+pageList[currentPage]);
    pageLive.render(saveFolder+pageListSafe[currentPage]+'-live.png');
    console.log("rendered live page - "+pageList[currentPage]);

    processPageTest();

  });

}

function processPageTest() {

  var pageTest = require("webpage").create();
  pageTest.viewportSize = viewportSize;

  pageTest.open(testBase+pageList[currentPage], function() {
    console.log("opened test page - "+pageList[currentPage]);
    pageTest.render(saveFolder+pageListSafe[currentPage]+'-test.png');
    console.log("rendered test page - "+pageList[currentPage]);

    processPageDiff();

  });

}

function processPageDiff() {


  pageTestD.open(saveFolder+"resembler.html", function() {

  });

}


/*

after processing live/test pages, open resembler page, pass file path args and get result,
then go on to next page set

*/
//pageListSafe[currentPage]+'-live.png', pageListSafe[currentPage]+'-test.png'

pageTestD.onLoadFinished = function() {
  console.log("opened resembler");
  pageTestD.evaluate(function(p1, p2) {
    //console.log("evaluating diffs");
    //runDiffs(pageListSafe[currentPage]+'-live.png', pageListSafe[currentPage]+'-test.png');
    resemble(p1).compareTo(p2).onComplete(function(data){
      //console.log(data);

      var diffImage = new Image();
        diffImage.src = data.getImageDataUrl();
        $("#images").append("<img src='"+diffImage.src+"' />");

        setTimeout(function(){
          window.console.log("Done rendering diff");
        }, 400);

    });

  }, pageListSafe[currentPage]+'-live.png', pageListSafe[currentPage]+'-test.png');
};


pageTestD.onConsoleMessage = function() {
  console.log("pageTestD.onConsoleMessage");

  var images = pageTestD.evaluate(function() {

    var images = [];
    function getImgDimensions($i) {
        return {
            top : $i.offset().top,
            left : $i.offset().left,
            width : $i.width(),
            height : $i.height()
        }
    }

    $('#images img').each(function() {
        var img = getImgDimensions($(this));
        images.push(img);
    });
    return images;


  });

  console.log("between image dimensions and render save");

  images.forEach(function(imageObj, index, array){
    console.log("Rendering this photo: index-"+index+" "+imageObj.width);
    pageTestD.clipRect = imageObj;
    pageTestD.render(saveFolder+pageListSafe[currentPage]+'-diff.png')
  });




  if(currentPage == pageList.length-1) {
    allDone();
  }
  else {
    currentPage += 1;
    console.log("moving to next page set...");
    setTimeout(function(){
      processPageLive();
    }, 500);
  }

  //phantom.exit();

};

processPageLive();




function buildResembler() {

  var htmlContent2 = '';

  console.log("building resembler page");

  htmlContent2 += htmlTop;
  htmlContent2 += '<script>var pageList = ["'+pageListSafe.join('","')+'"];</script>';
  htmlContent2 += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>';
  htmlContent2 += '<script src="resemble.js"></script>';
  //htmlContent2 += '<script src="diff.js"></script>';
  //htmlContent2 += '<script>runDiffs();</script>';
  htmlContent2 += htmlBottom;
  fs.write(saveFolder+"resembler.html", htmlContent2, 'w');

  console.log("copying scripts");

  fs.copy("resemble.js", saveFolder+"resemble.js");
  //fs.copy("diff.js", saveFolder+"diff.js");
  fs.copy("diff.css", saveFolder+"diff.css");

  console.log("done");


}




function allDone() {



  console.log("building index page");

  htmlContent += htmlTop;
  htmlContent += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>';
  //htmlContent += '<script>var pageList = ["'+pageListSafe.join('","')+'"];</script>';
  //htmlContent += '<script src="resemble.js"></script>';
  //htmlContent += '<script src="diff.js"></script>';

  for ( var index1= 0; index1 < pageListSafe.length; ++index1 ) {
    htmlContent += '<div class="heading">'+pageList[index1]+'</div>';
    htmlContent += '<div class="image-set">';
    htmlContent += '<div class="diff-wrapper"><img class="img-diff image-name-diff-'+pageListSafe[index1]+'" src="'+pageListSafe[index1]+'-diff.png" /></div>';
    htmlContent += '<div class="live-wrapper"><img class="img-live image-name-live-'+pageListSafe[index1]+'" src="'+pageListSafe[index1]+'-live.png" /></div>';
    htmlContent += '<div class="test-wrapper"><img class="img-test image-name-test-'+pageListSafe[index1]+'" src="'+pageListSafe[index1]+'-test.png" /></div>';
    htmlContent += '</div>';
  }
  //htmlContent += '<script>runDiffs();</script>';
  htmlContent += htmlBottom;

  fs.write(saveFolder+"index.html", htmlContent, 'w');

  console.log("done");

  //fs.copy("resemble.js", saveFolder+"resemble.js");
  //fs.copy("diff.js", saveFolder+"diff.js");
  //fs.copy("diff.css", saveFolder+"diff.css");

  //console.log("copying scripts to saveFolder");


  phantom.exit();


}
