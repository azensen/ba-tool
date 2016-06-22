/**
 * Created by André Zensen on 21.06.2016.
 */
var tool = new Tool(
    new ProjectBrowser("#jsTree", "#submenu", "../php/readProjects.php"),
    new CorrespondenceManager(),
    new ViewManager("#sourceView", "#targetView"));

//$("#submenu").load("../html/AddModel.html");