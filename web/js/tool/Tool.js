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