/**
 * Used as a namespace and for initialising the main components in function Tool
 */
function Tool (projectBrowser, correspondenceManager, viewManager) {
    this.projectBrowser = projectBrowser;
    this.correspondenceManager = correspondenceManager;
    this.viewManager = viewManager;
    console.log("Created Tool");
    $('#correspondenceMenu').hide();
    $('#correspondenceTable').hide();
};

/**
 * basically an event handler for making correspondences consistent with existing elements
 */
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
/**
 * basically an event handler for highlighting elements by first deselecting elements, then removing all overlays and then adding highlights
 */
Tool.prototype.highlighter = function () {
    tool.viewManager.deselectAll();
    tool.viewManager.removeAllHighlights();
    //tool.viewManager.highlightMatchedSourceElements();
    //tool.viewManager.highlightUnmatchedSourceElements();
    tool.viewManager.highlightElements();
};
/**
 * basically an event handler to save correspondences to first make the correspondences consistent with existing elements in the views and its models
 * takes the sourceFile information of the model's association to save a .corr with the .bpmn file name
 */
Tool.prototype.saveCorrespondences = function () {
    this.makeCorrespondencesConsistent();
    var corrJSON = tool.correspondenceManager.getCorrespondencesAsJSON();
    var modelPath = tool.correspondenceManager.association.sourceFile;
    var corrFilePath = modelPath.replace(".bpmn", ".corr");
    tool.correspondenceManager.saveCorrespondenceFile(corrJSON, corrFilePath);
};