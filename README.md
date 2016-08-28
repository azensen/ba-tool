# ba-tool!
A tool for a simple vertical consistency check of two BPMN models as part of my BA thesis on vertical consistency of business process models. The models on different abstraction levels are displayed on top of each other and the consistency check is done by colored highlighting and meta information of business relevant elements in the source view. A simple project browser makes management of models to compare easier to handle.

###project folder structure
The projects managed are in ba-tool/projects. All web related files such as HTML or JavaScript are in its folders, such as ba-tool/web/HTML or ba-tool/web/JS.

###Known bugs
- Loading the current BPMN files might require refreshing the browser cache.
- Loading associations and correspondences is only possible via the source model used as a clone.
- Some functions of the project browser require you to go back to the page you were sent off from.

###How to use
Just clone the project or download project and run it on a webserver to use the AJAX and PHP functionalities used.
