/**
 * Created by André Zensen on 21.06.2016.
 */
function Tool (projectBrowser, correspondenceManager, viewManager) {
    this.projectBrowser = projectBrowser;
    this.correspondenceManager = correspondenceManager;
    this.viewManager = viewManager;
    console.log("Created Tool");
};

Tool.prototype.addModel = function (text) {
    console.log(text);
}

Tool.prototype.makeCorrespondencesConsistent = function () {
    var sourceView = tool.viewManager.sourceView;
    var targetView = tool.viewManager.targetView;
    var corrList = tool.correspondenceManager.correspondenceList;

    if(sourceView && targetView) {
        if(corrList) {
            tool.viewManager.makeCorrespondencesConsistentWithViews(sourceView, targetView, corrList);
        } else {
            console.log("Tool: Correspondence list not loaded?");
        }
    } else {
        console.log("Tool: Source and target view models not loaded?");
    }



};

Tool.prototype.highlighter = function () {
    tool.viewManager.deselectAll();
    tool.viewManager.removeAllHighlights();
    tool.viewManager.highlightMatchedSourceElements();
    tool.viewManager.highlightUnmatchedSourceElements();
};

Tool.prototype.saveCorrespondences = function () {
    this.makeCorrespondencesConsistent();
    var corrJSON = tool.correspondenceManager.getCorrespondencesAsJSON();
    var modelPath = tool.correspondenceManager.association.sourceFile;
    var corrFilePath = modelPath.replace(".bpmn", ".corr");
    tool.correspondenceManager.saveCorrespondenceFile(corrJSON, corrFilePath);
};