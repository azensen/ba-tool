/**
 * Created by André Zensen on 21.06.2016.
 */
var tool = new Tool();
tool.projectBrowser = new ProjectBrowser("#jsTree", "../php/readProjects.php");
tool.correspondenceManager = new CorrespondenceManager();
tool.viewManager = new ViewManager("#sourceView", "#targetView");