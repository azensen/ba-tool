/**
 * Created by André Zensen on 21.06.2016.
 */
var ProjectBrowser = function(htmlDiv, dataUrl) {
    this.htmlDiv = htmlDiv;

    $(htmlDiv).jstree({
        'core' : {
            'multiple' : false,
            'data' : {
                "url" : dataUrl,
                "dataType" : "json" // needed only if you do not supply JSON headers
            }
        }
    });

    this.jsTree = $(htmlDiv).jstree;

    $(htmlDiv).bind('activate_node.jstree', function(e) {
        this.currentNode = this.jsTree('get_selected');
     /*   // gather ids of selected nodes
        var selectedID = $('#jstree').jstree('get_selected');
        var selectedNode = $('#jstree').jstree(true).get_node(selectedID);
        $('#outputText').text("selected text: " + selectedNode.text);
        $('#outputId').text("selected id: " + selectedNode.id);
        $('#outputType').text("selected type: " + selectedNode.data.nodetype);
        $('#outputPath').text("selected path: " + selectedNode.data.path);

        $('#objKeys').text("keys of selected node: " + Object.keys(selectedNode));
        $('#parent').text("parent of selected node: " + selectedNode.parent);
        */
    });
};
ProjectBrowser.prototype.currentNode = {};
ProjectBrowser.prototype.jsTreeNode = {};
ProjectBrowser.prototype.refreshTree = function () {};
ProjectBrowser.prototype.getCurrentNode = function () {
    return this.currentNode;
};