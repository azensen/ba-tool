/**
 * Created by André Zensen on 21.06.2016.
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

ProjectBrowser.prototype.refreshTree = function () {
    var tree = $(this.treeDiv).jstree(true);
    tree.refresh();
};
ProjectBrowser.prototype.getCurrentNode = function () {
    var currentSelection = $(this.treeDiv).jstree('get_selected');
    var currentNode = $(this.treeDiv).jstree(true).get_node(currentSelection);
    return currentNode;
};

//clear content of div id=submenu
ProjectBrowser.prototype.clearSubmenu = function () {
    $(this.submenuDiv).empty();
}

//add newProject submenu to div id=submenu
ProjectBrowser.prototype.newProjectMenu = function() {
    this.clearSubmenu();
    $(this.submenuDiv).load("../html/newProjectAjax.html");
}

//add newProcess submenu to div id=submenu
ProjectBrowser.prototype.addProcessMenu = function () {
    this.clearSubmenu();
    $(this.submenuDiv).load("../html/addProcessAjax.html");
}

//add addModel submenu to div id=submenu
ProjectBrowser.prototype.addModelMenu = function () {
    this.clearSubmenu();
    var nodeType = this.getCurrentNode().data.nodetype;
    if(nodeType == 'process') {
        $(this.submenuDiv).load("../html/addModelFromProcess.html");
    } else if ($nodeType == 'level')
        $(this.submenuDiv).load("../html/addModelFromLevel.html");
}

//add newClone submenu to div id=submenu
ProjectBrowser.prototype.cloneModelMenu = function () {
    this.clearSubmenu();
    $(this.submenuDiv).load("../html/cloneModel.html");
}

//enable and disable menu buttons according to node selection in tree
ProjectBrowser.prototype.checkButton = function(selectedID) {
    //$('#btnNewProject').attr("disabled","disabled");
    $('#btnAddProcess').attr("disabled","disabled");
    $('#btnAddModel').attr("disabled","disabled");
    $('#btnCloneModel').attr("disabled","disabled");
    $('#btnDownloadModel').attr("disabled","disabled");

    //var selectedNode = $(this.treeDiv).jstree(true).get_node(selectedID);
    var selectedNode = this.getCurrentNode();
    /*if(selectedNode.data.nodetype == 'project') {
     $('#btnAddProcess').removeAttr("disabled");
     } else if (selectedNode.data.nodetype == 'level') {
     $('#btnAddModel').removeAttr("disabled");
     }*/

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
            $('#downloadLink').attr("href", this.getCurrentNode().data.path + this.getCurrentNode().text);
            $('#btnDownloadModel').removeAttr("disabled");
            $('#btnCloneModel').removeAttr("disabled");
            break;
    }

}

//download BPMN file

ProjectBrowser.prototype.btnDownloadFile = function() {
    var windowRef = "window.location.href='";

    var pathRef = this.getCurrentNode().data.path + this.getCurrentNode().text;
    //$('#btnDownloadForm').attr("action", pathRef);

    var onClickRef = windowRef + pathRef + "'";
    $('#btnDownloadModel').attr('onclick', onClickRef)
}
