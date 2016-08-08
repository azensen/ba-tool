/**
 * Created by André Zensen on 21.06.2016.
 */
/**
 * Creates a new instance of ProjectBrowser and binds a function to be called for every click on an item or node in the project browser
 *
 * @param treeDiv  Id of the div element the project browser is to be displayed in
 * @param submenuDiv Id of the div element the submenu pages are to be displayed in
 * @param dataUrl The URL to the tree data in JSON format (here: a php with a JSON return)
 * @constructor
 */
function ProjectBrowser (treeDiv, submenuDiv, dataUrl) {
    this.treeDiv = treeDiv;
    this.submenuDiv = submenuDiv;
    $(treeDiv).jstree({
        'core' : {
            'multiple' : false,
            'data' : {
                "url" : dataUrl,
                "dataType" : "json" // needed only if you do not supply JSON headers
            }
        }
    });
    $(treeDiv).bind('activate_node.jstree', function(e) {

        var selectedID = $(treeDiv).jstree('get_selected');
        var selectedNode = $(treeDiv).jstree(true).get_node(selectedID);

        console.log("selected: " + selectedNode.text);
        console.log("id: " + selectedNode.id);
        console.log("type: " + selectedNode.data.nodetype);
        console.log("path: " + selectedNode.data.path);
        console.log("keys of selected node: " + Object.keys(selectedNode));
        console.log("parent of selected node: " + selectedNode.parent);
        tool.projectBrowser.clearSubmenu();
        tool.projectBrowser.checkButton(selectedID);
    });
};

/**
 * Refresh the project browser's data (calls the data URL again)
 */
ProjectBrowser.prototype.refreshTree = function () {
    var tree = $(this.treeDiv).jstree(true);
    tree.refresh();
};

/**
 * Returns the currently selected node in the project browser
 *
 * @returns currentNode
 */
ProjectBrowser.prototype.getCurrentNode = function () {
    var currentSelection = $(this.treeDiv).jstree('get_selected');
    var currentNode = $(this.treeDiv).jstree(true).get_node(currentSelection);
    return currentNode;
};

/**
 * Clears the content of the submenu div element
 */
ProjectBrowser.prototype.clearSubmenu = function () {
    $(this.submenuDiv).empty();
};

/**
 * Clears the submenu div element, then adds the newProject HTML content page to it
 */
ProjectBrowser.prototype.newProjectMenu = function() {
    this.clearSubmenu();
    //TODO injections of div ids
    $('#submenu').show();
    $(this.submenuDiv).load("../html/newProjectAjax.html");
};

/**
 * Clears the submenu div element, then adds the addProcess HTML content page to it
 */
ProjectBrowser.prototype.addProcessMenu = function () {
    this.clearSubmenu();
    //TODO injections of div ids
    $('#submenu').show();
    $(this.submenuDiv).load("../html/addProcessAjax.html");
};

/**
 * Clears the submenu div element, then adds the addModel HTML content page to it
 */
ProjectBrowser.prototype.addModelMenu = function () {
    this.clearSubmenu();
    //TODO injections of div ids
    $('#submenu').show();
    var nodeType = this.getCurrentNode().data.nodetype;
    if(nodeType == 'process') {
        $(this.submenuDiv).load("../html/addModelFromProcess.html");
    } else if ($nodeType == 'level')
        $(this.submenuDiv).load("../html/addModelFromLevel.html");
};

/**
 * Clears the submenu div element, then adds the newClone HTML content page to it
 */
ProjectBrowser.prototype.cloneModelMenu = function () {
    this.clearSubmenu();
    //TODO injections of div ids
    $('#submenu').show();
    $(this.submenuDiv).load("../html/cloneModel.html");
};

/**
 * Enables or disables the project browser's buttons according to the selected node's type
 *
 * @param {object} selectedID The selected node object from the project browser tree
 */
ProjectBrowser.prototype.checkButton = function(selectedID) {
    //$('#btnNewProject').attr("disabled","disabled");

    //TODO injections of div ids
    $('#submenu').hide();
    
    $('#btnAddProcess').attr("disabled","disabled");
    $('#btnAddModel').attr("disabled","disabled");
    $('#btnCloneModel').attr("disabled","disabled");
    $('#btnDownloadModel').attr("disabled","disabled");
    $('#loadModel').attr("disabled", "disabled");
    $('#saveModel').attr("disabled", "disabled");

    //var selectedNode = $(this.treeDiv).jstree(true).get_node(selectedID);
    var selectedNode = this.getCurrentNode();
    /*if(selectedNode.data.nodetype == 'project') {
     $('#btnAddProcess').removeAttr("disabled");
     } else if (selectedNode.data.nodetype == 'level') {
     $('#btnAddModel').removeAttr("disabled");
     }*/
    //TODO injections of div ids
    switch (selectedNode.data.nodetype) {
        case "project":
            //$('#btnAddProcess').removeAttr("disabled");
            break;
        case "process":
            $('#btnAddModel').removeAttr("disabled");
            break;
        case "level":
            $('#btnAddProcess').removeAttr("disabled");
            break;
        case "bpmn":
            //btnDownloadFile();
            $('#downloadLink').attr("href", this.getCurrentNode().data.path);
            this.btnDownloadFile();
            $('#btnDownloadModel').removeAttr("disabled");
            $('#btnCloneModel').removeAttr("disabled");
            var targetModelPath = tool.projectBrowser.getCurrentNode().data.path;
            tool.correspondenceManager.loadAssociation(targetModelPath);
            tool.correspondenceManager.loadCorrespondences(targetModelPath);
            $('#loadModel').removeAttr("disabled");
            $('#saveModel').removeAttr("disabled");
            $('#correspondenceMenu').show();
            break;
    }

};

//download BPMN file

/**
 * Sets the download button's reference to the model's path as specified in the model node
 */
ProjectBrowser.prototype.btnDownloadFile = function() {
    var windowRef = "window.location.href='";

    var pathRef = this.getCurrentNode().data.path;
    //$('#btnDownloadForm').attr("action", pathRef);

    var onClickRef = windowRef + pathRef + "'";
    //TODO injection of div id
    $('#btnDownloadModel').attr('onclick', onClickRef)
};
/**
 * Loads the models. Association file and correspondence files should be present for this.
 */
ProjectBrowser.prototype.loadModels = function() {
    //TODO injection of viewManager
    tool.viewManager.loadModels();
    $('#correspondenceMenu').show();
};

ProjectBrowser.prototype.saveModels = function () {
    var association = tool.correspondenceManager.association;
    tool.viewManager.saveModels(association);
    tool.saveCorrespondences();
};