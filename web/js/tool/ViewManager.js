/**
 * Created by André Zensen on 21.06.2016.
 */

/**
 * @param {String} htmlDivSource Id of the div element the source model is to be displayed in
 * @param {String} htmlDivTarget Id of the div element the target model is to be displayed in
 * @constructor
 */
function ViewManager(htmlDivSource, htmlDivTarget) {
    this.htmlDivSource = htmlDivSource;
    this.htmlDivTarget = htmlDivTarget;

    this.sourceView = null;
    this.targetView = null;

};

/*
load source and target via filepath of selected model
then load association and correspondence files
with association data load source and target models into respective modellers
 */

ViewManager.prototype.loadModels = function() {
    if(tool.correspondenceManager.association != undefined && tool.correspondenceManager.association != null) {
        var association = tool.correspondenceManager.association;

        if(this.sourceView != null) {
            this.sourceView.destroy();
            delete this.sourceView;
            $(this.htmlDivSource).text("Source View");
        }

        if(this.targetView != null) {
            this.targetView.destroy();
            delete this.sourceView;
            $(this.htmlDivTarget).text("Target View");
        }

        var sourceModelName = association.sourceModel;
        $(this.htmlDivSource).text(sourceModelName);
        var targetModelName = association.targetModel;
        $(this.htmlDivTarget).text(targetModelName);

        //create bpmn-js in respective div containers
        this.sourceView =  new BpmnJS({
            container: this.htmlDivSource
        });

        this.targetView =  new BpmnJS({
            container: this.htmlDivTarget
        });

        var sourceFilePath = association.sourceFile;
        var targetFilePath = association.targetFile;
        //load models into modelers
        console.log("Loading Source Model via " + sourceFilePath);
        this.loadSource(sourceFilePath);
        console.log("Loading Target Model via " + targetFilePath);
        this.loadTarget(targetFilePath);
    } else {
        alert("Cannot load models. No association file loaded!");
    }
};

ViewManager.prototype.loadSource = function(filePath) {

    $.get(filePath, importXML, 'text');
    var sourceView = this.sourceView;
    // import function
    function importXML(xml) {

        // import diagram
        sourceView.importXML(xml, function (err) {

            if (err) {
                return console.error('could not import BPMN 2.0 diagram', err);
            }

            var canvas = sourceView.get('canvas');

            // zoom to fit full viewport
            canvas.zoom('fit-viewport');

            var eventBusSource = sourceView.get('eventBus');

            // you may hook into any of the following events
            var events = [
                /*'element.hover',
                 'element.out',*/
                'element.click',
                /*		  'element.dblclick',
                 'element.mousedown',
                 'element.mouseup'*/
            ];
            //hook ins in source eventBus
            events.forEach(function (event) {

                eventBusSource.on(event, function (e) {

                    var selectedElements = sourceView.get('selection').get();
                    console.log("Selected Source Elements: ");
                    console.log(selectedElements);

                    var editMode = $('#editMode').prop('checked');
                    //var keepHighlights = $('#keepHighlights').prop('checked');
                    //var keepSelection = $('#keepSelection').prop('checked');

                    if(!editMode) {
                        tool.viewManager.removeAllHighlights();
                        tool.viewManager.deselectAll();

                        if(selectedElements.length > 0) {
                            var excludedTypes = ["bpmn:Process", "label", "bpmn:SequenceFlow"];
                            var exclude = false;
                            for(var k = 0; k < excludedTypes.length; k++) {
                                if(e.element.type == excludedTypes[k]) {
                                    exclude = true;
                                    break;
                                }
                            }
                            if(!exclude) {
                                var correspondence = tool.viewManager.highlightCorrespondenceBySource(e.element.id);
                                if(correspondence != null) {
                                    tool.viewManager.focusCorrespondenceElements(correspondence);
                                    tool.viewManager.displayCorrespondenceTable('correspondenceTable', correspondence);
                                } else {
                                    tool.viewManager.focusOnElement(sourceView, e.element, 'single');
                                    $('#correspondenceTable').empty();
                                    var textNoCorr = document.createTextNode("No correspondence found for the element. Select at least one element in a view and click on 'Turn selection into correspondence' to create a new correspondence. Existing correspondences will be modified or deleted.");
                                    var tableDiv = document.getElementById("correspondenceTable");
                                    tableDiv.appendChild(textNoCorr);
                                }

                            }
                        }
                    }
                });
            });
            //on shape deletion remove the deleted source id from any corr source
            eventBusSource.on('shape.remove', function (e) {

                var elementId = e.element.id;
                var shapeType = e.element.type;
                var correspondenceManager = tool.correspondenceManager;

                //only do check for shapes, not labels nor connections
                if(shapeType != 'label' || shapeType != 'connection') {
                    console.log("ViewManager: Deleted element " + elementId + " with type " + shapeType);
                    var foundCorr = correspondenceManager.getCorrBySource(elementId);
                    if(foundCorr != null && foundCorr != undefined) {
                        console.log("ViewManager: Removing source id " + elementId + " from correspondence.");
                        correspondenceManager.removeSourceElementFromCorrespondence(foundCorr, elementId);
                        var corrList = tool.correspondenceManager.correspondenceList;
                        var sourceView = tool.viewManager.sourceView;
                        var targetView = tool.viewManager.targetView;
                        tool.viewManager.makeCorrespondencesConsistentWithViews(sourceView, targetView, corrList);
                    }
                }

                //console.log("Shape Remove e:");
                //console.log(e);
            });
        });
    };
};

ViewManager.prototype.loadTarget = function(filePath) {

    $.get(filePath, importXML, 'text');
    var targetView = this.targetView;
    // import function
    function importXML(xml) {

        // import diagram
        targetView.importXML(xml, function (err) {

            if (err) {
                return console.error('could not import BPMN 2.0 diagram', err);
            }

            var canvas = targetView.get('canvas');

            // zoom to fit full viewport
            canvas.zoom('fit-viewport');

            var eventBusTarget = targetView.get('eventBus');

            // you may hook into any of the following events
            var events = [
                /*		  'element.hover',
                 'element.out',*/
                'element.click',
                /*		  'element.dblclick',
                 'element.mousedown',
                 'element.mouseup'*/
            ];
            //hook ins in target eventBus
            events.forEach(function (event) {

                eventBusTarget.on(event, function (e) {
                    // e.element = the model element
                    // e.gfx = the graphical element
                    //document.getElementById("element-info-top").innerHTML = "Top-Element: " + e.element.id + " " + e.element.label;
                    /*console.log("e: " + Object.keys(e));
                    console.log("e.element: " + Object.keys(e.element));
                    console.log("TargetModeller: " + Object.keys(targetView));
                    //Get element via elementRegistry
                    var elementRegistry = targetView.get('elementRegistry');
                    var shape = elementRegistry.get(e.element.id);
                    var businessObject = shape.businessObject;
                    console.log("shape: " + Object.keys(shape));

                    console.log("businessObject: " + Object.keys(businessObject));
                    console.log("businessObject Type: " + businessObject.$type);
*/
                    var selectedElements = targetView.get('selection').get();
                    console.log("Selected Target Elements: ");
                    console.log(selectedElements);
                    /*
                     var extElements = businessObject.extensionElements;
                     console.log("extElements Type: " + extElements.$type);
                     console.log("extElements: " + Object.keys(extElements));
                     var extElemValues = extElements.values;
                     console.log("extElem values var: " + extElemValues);
                     console.log("extElems Values: " + Object.keys(extElemValues));


                     var extElem0 = extElemValues[0];
                     console.log("extElem 0: " + extElem0);
                     console.log("extElem 0 keys: " + Object.keys(extElem0));
                     console.log("extElem 0 keys $type: " + extElem0.$type);
                     console.log("extElem 0 keys $children: " + Object.keys(extElem0.$children));
                     console.log("extElem 0 keys $children[0] $type: " + extElem0.$children[0].$type);
                     console.log("extElem 0 keys $children[0] name: " + extElem0.$children[0].name);
                     console.log("extElem 0 keys $children[0] value: " + extElem0.$children[0].value);

                     console.log("extElem 0 keys $children[1] $type: " + extElem0.$children[1].$type);
                     console.log("extElem 0 keys $children[1] name: " + extElem0.$children[1].name);
                     console.log("extElem 0 keys $children[1] value: " + extElem0.$children[1].value);*/
                    /*
                     var consistencyElem = extElemValues[1];
                     var consisElemType = extElemValues[1].$type;
                     console.log(consisElemType);
                     var consistencyProp = consistencyElem.$children[0];

                     console.log("Prop $type: " + consistencyProp.$type);
                     console.log("Prop Name: " + consistencyProp.name);
                     console.log("Prop Value: " + consistencyProp.value);
                     //consistencyProp.value = 'XXXXX';
                     */
                    //extElem0.$children[1].value = 'YXXXXsuperIT';

                    //log(event, 'on', e.element.id);
                    var editMode = $('#editMode').prop('checked');
                    var keepHighlights = $('#keepHighlights').prop('checked');
                    var keepSelection = $('#keepSelection').prop('checked');

                    if(!editMode) {
                        tool.viewManager.removeAllHighlights();
                        tool.viewManager.deselectAll();

                        if(selectedElements.length > 0) {
                            var excludedTypes = ["bpmn:Process", "label", "bpmn:SequenceFlow"];
                            var exclude = false;
                            for(var k = 0; k < excludedTypes.length; k++) {
                                if(e.element.type == excludedTypes[k]) {
                                    exclude = true;
                                    break;
                                }
                            }
                            if(!exclude) {
                                var correspondence = tool.viewManager.highlightCorrespondenceByTarget(e.element.id);
                                if(correspondence != null) {
                                    tool.viewManager.focusCorrespondenceElements(correspondence);
                                    tool.viewManager.displayCorrespondenceTable('correspondenceTable', correspondence);
                                } else {
                                    tool.viewManager.focusOnElement(targetView, e.element, 'single');
                                    $('#correspondenceTable').empty();
                                    var textNoCorr = document.createTextNode("No correspondence found for the element. " +
                                        "Select at least one element in a view and click on 'Turn selection into correspondence' " +
                                        "to create a new correspondence. Existing correspondences will be modified or deleted.");
                                    var tableDiv = document.getElementById("correspondenceTable");
                                    tableDiv.appendChild(textNoCorr);
                                }
                            }
                        }
                    }
                });
            });
        });
    };
};

ViewManager.prototype.saveModels = function (association) {
    if(association) {
        if(this.sourceView && this.targetView) {
            var sourceFilePath = association.sourceFile;
            var sourceName = association.sourceModel;
            var targetFilePath = association.targetFile;
            var targetName = association.targetModel;

            this.saveSource(sourceFilePath, sourceName);
            this.saveTarget(targetFilePath, targetName);
        } else {
            console.log("Could not access source and target views. Models not loaded?");
        }
    } else {
        console.log("Could not access association data. Association file not loaded?");
    }
    
};

ViewManager.prototype.saveSource = function(filePath, name) {
        // get the diagram contents
        this.sourceView.saveXML({ format: true }, function(err, xml) {

            if (err) {
                console.error('ViewManager: Source diagram XML fetch of ' + name + ' failed: ', err);
            } else {
                //console.info('ViewManager: Source diagram saved.');
               //return xml;
                tool.viewManager.saveXML(xml, filePath, name);
            }
    });
};

ViewManager.prototype.saveTarget = function(filePath, name) {
    
        this.targetView.saveXML({ format: true }, function(err, xml) {

            if (err) {
                console.error('ViewManager: Target diagram XML fetch of ' + name + ' failed: ', err);
            } else {
                //console.info('ViewManager: Target diagram saved.');
                //return xml;
                tool.viewManager.saveXML(xml, filePath, name);
            }
        });
};

ViewManager.prototype.saveXML = function (xml, filePath, name) {
    $.ajax({
        type     : "POST",
        url      : "../php/saveXML.php",
        data     : { xml : xml, filePath : filePath},
        success  : function(msg){ console.log('Successfully saved XML of ' + name + ' to' + filePath + '.'); } ,
        error    : function(msg) { console.error('Failed saving XML of ' + name + ' to' + filePath + '. Error: ' + msg); }
    });
};

ViewManager.prototype.deselectAll = function() {
    var sourceSelectionService = this.sourceView.get('selection');
    var targetSelectionService = this.targetView.get('selection');

    //deselect via passing null
    sourceSelectionService.select(null);
    targetSelectionService.select(null);
};

ViewManager.prototype.elementExists = function(view, elementId) {
    var elementRegistry = view.get('elementRegistry');
    var existingElement = elementRegistry.get(elementId);
    if(existingElement != undefined)
        return true;
    else
        return false;
};

ViewManager.prototype.makeCorrespondencesConsistentWithViews = function (sourceView, targetView, correspondenceList) {
    var sourceElementRegistry = sourceView.get('elementRegistry');
    var targetElementRegistry = targetView.get('elementRegistry');

    var sourcesToDelete = [];
    var targetsToDelete = [];

    for(var i = 0; i < correspondenceList.length; i++) {
        //in the process of removing an element a corr might get spliced to null, therefore a check
        if(correspondenceList[i] != null) {

            var corr = correspondenceList[i];
            var corrType = corr.corrType;
            var corrSource = corr.source;
            var corrTarget = corr.target;

            var existingSource = undefined;
            var existingTarget = undefined;

            //cycle through sources and remove elements which do not exist in the source view (model) from the correspondence
            //if many- type
            if(corrSource instanceof Array) {
                for(var j = 0; j < corrSource.length; j++) {
                    var elementId = corrSource[j];
                    existingSource = sourceElementRegistry.get(elementId);
                    if(existingSource == undefined) {
                        //tool.correspondenceManager.removeSourceElementFromCorrespondence(corr, elementId);
                        sourcesToDelete.push(elementId);
                        //console.log("Could not find element in source with id " + elementId + ", removed element from correspondence.")
                    }
                }
            //if one- type
            } else if (typeof corrSource === "string") {
                var elementId = corrSource;
                existingSource = sourceElementRegistry.get(elementId);
                if(existingSource == undefined) {
                    sourcesToDelete.push(elementId);
                    //tool.correspondenceManager.removeSourceElementFromCorrespondence(corr, elementId);
                    //console.log("Could not find element in source with id " + elementId + ", removed element from correspondence.");
                }
            }

            //cycle through targets and remove elements which do not exist in the target view (model) from the correspondence
            //if many- type
            if(corrTarget instanceof Array) {
                for(var k = 0; k < corrTarget.length; k++) {
                    var elementId = corrTarget[k];
                    existingTarget = targetElementRegistry.get(elementId);
                    if(existingTarget == undefined) {
                        targetsToDelete.push(elementId);
                        //tool.correspondenceManager.removeTargetElementFromCorrespondence(corr, elementId);
                        //console.log("Could not find element in target with id " + elementId + ", removed element from correspondence.")
                    }
                }
                //if one- type
            } else if (typeof corrTarget === "string") {
                var elementId = corrTarget;
                existingTarget = targetElementRegistry.get(elementId);
                if(existingTarget == undefined) {
                    targetsToDelete.push(elementId);
                    //tool.correspondenceManager.removeTargetElementFromCorrespondence(corr, elementId);
                    //console.log("Could not find element in target with id " + elementId + ", removed element from correspondence.");
                }
            }


        }
    }

    for(var s = 0; s < sourcesToDelete.length; s++) {
        var elementId = sourcesToDelete[s];
        var foundCorr = tool.correspondenceManager.getCorrBySource(elementId);
        if(foundCorr != null) {
            console.log("Could not find element in source with id " + elementId + ", removed element from correspondence.")
            tool.correspondenceManager.removeSourceElementFromCorrespondence(foundCorr, elementId);
        }
    }
    for(var t = 0; t < targetsToDelete.length; t++) {
        var elementId = targetsToDelete[t];
        var foundCorr = tool.correspondenceManager.getCorrByTarget(elementId);
        if(foundCorr != null) {
            console.log("Could not find target element with id " + elementId + ", removed element from correspondence.");
            tool.correspondenceManager.removeTargetElementFromCorrespondence(foundCorr, elementId);
        }
    }
};

//highlight and select all elements in a correspondence
ViewManager.prototype.highlightCorrespondenceBySource = function (sourceElementId) {
    //find existing correspondence via sourceElementId
    var correspondence = tool.correspondenceManager.getCorrBySource(sourceElementId);
    //get source view element registry and get element via sourceElementId
    //existingElement will be undefined if no such element exists
    var elementRegistry = this.sourceView.get('elementRegistry');
    var existingElement = elementRegistry.get(sourceElementId);
    //TODO handle all corrTypes

    var sourceCanvas = this.sourceView.get('canvas');
    var targetCanvas = this.targetView.get('canvas');

    if(correspondence != null && existingElement != undefined) {
        console.log("Corr found by Source for elementId " + sourceElementId + ":");
        console.log(correspondence);
        /*var elementRegistrySource = this.sourceView.get('elementRegistry');
        var elementRegistryTarget = this.targetView.get('elementRegistry');

        var overlaysSource = this.sourceView.get('overlays');
        var overlaysSource = this.targetView.get('overlays');
        */

        var sourceIds = correspondence.source;
        var targetIds = correspondence.target;



        if(correspondence.corrType == "oneone") {
            // highlight via CSS class
            sourceCanvas.addMarker(sourceIds, 'highlight-green');
            targetCanvas.addMarker(targetIds, 'highlight-green');
        } else if (correspondence.corrType == "onemany") {
            sourceCanvas.addMarker(sourceIds, 'highlight-yellow');
            for(var i = 0; i < targetIds.length ; i++) {
                targetCanvas.addMarker(targetIds[i], 'highlight-yellow');
            }
        } else if (correspondence.corrType == "manyone") {
            for(var j = 0; j < sourceIds.length; j++) {
               sourceCanvas.addMarker(sourceIds[j], 'highlight-yellow');
            }
            targetCanvas.addMarker(targetIds, 'highlight-yellow');
        /*} else if (correspondence.corrType == "zeroone") {
            targetCanvas.addMarker(targetIds, 'highlight-green');*/
        } else if (correspondence.corrType == "onezero") {
            sourceCanvas.addMarker(sourceIds, 'highlight-blue');
        }
        // highlight via canvas prep

        //select all correspondence elements on canvas
        this.selectElementsInCorr(correspondence);
        return correspondence;
    } else if (correspondence == null) {
        console.log("No correspondence found for element id " + sourceElementId);
        sourceCanvas.addMarker(sourceElementId, 'highlight-red');
        return null;
    } else if (correspondence != null && existingElement == undefined) {
        console.log("Correspondence found for element id " + sourceElementId + " but element does not exist in source model.");
        return null;
    }
};

ViewManager.prototype.highlightCorrespondenceByTarget = function (targetElementId) {
    var correspondence = tool.correspondenceManager.getCorrByTarget(targetElementId);

    //get source view element registry and get element via targetElementId
    //existingElement will be undefined if no such element exists
    var elementRegistry = this.targetView.get('elementRegistry');
    var existingElement = elementRegistry.get(targetElementId);

    var sourceCanvas = this.sourceView.get('canvas');
    var targetCanvas = this.targetView.get('canvas');

    if(correspondence != null && existingElement != undefined) {
        console.log("Corr found by Target for elementId " + targetElementId + ":");
        console.log(correspondence);

        /*var elementRegistrySource = this.sourceView.get('elementRegistry');
         var elementRegistryTarget = this.targetView.get('elementRegistry');

         var overlaysSource = this.sourceView.get('overlays');
         var overlaysSource = this.targetView.get('overlays');
         */
        var sourceIds = correspondence.source;
        var targetIds = correspondence.target;


        if(correspondence.corrType == "oneone") {
            // highlight via CSS class
            sourceCanvas.addMarker(sourceIds, 'highlight-green');
            targetCanvas.addMarker(targetIds, 'highlight-green');
        } else if (correspondence.corrType == "onemany") {
            sourceCanvas.addMarker(sourceIds, 'highlight-yellow');
            for(var i = 0; i < targetIds.length ; i++) {
                targetCanvas.addMarker(targetIds[i], 'highlight-yellow');
            }
        } else if (correspondence.corrType == "manyone") {
            for(var j = 0; j < sourceIds.length; j++) {
                sourceCanvas.addMarker(sourceIds[j], 'highlight-yellow');
            }
            targetCanvas.addMarker(targetIds, 'highlight-yellow');
        } else if (correspondence.corrType == "zeroone") {
            targetCanvas.addMarker(targetIds, 'highlight-blue');
        }
        // highlight via canvas prep

        //select all correspondence elements on canvas
        this.selectElementsInCorr(correspondence);
        return correspondence;
    } else if (correspondence == null) {
        console.log("No correspondence found for element id " + targetElementId);
        targetCanvas.addMarker(targetElementId, 'highlight-red');
        return null;
    } else if (correspondence != null && existingElement == undefined) {
        console.log("Correspondence found for element id " + targetElementId + " but element does not exist in target model.");
        return null;
    }
};

ViewManager.prototype.removeAllHighlights = function() {
    var sourceCanvas = this.sourceView.get('canvas');
    var targetCanvas = this.targetView.get('canvas');

    var elementRegistrySource = this.sourceView.get('elementRegistry');
    var elementRegistryTarget = this.targetView.get('elementRegistry');

    var allSourceElements = elementRegistrySource.getAll();
    var allTargetElements = elementRegistryTarget.getAll();
    /*
    console.log(allSourceElements);
    console.log(Object.keys(allSourceElements));
    console.log(allTargetElements);
    console.log(Object.keys(allTargetElements));
    */
    for (var i = 0; i < allSourceElements.length; i++) {
        this.removeHighlight(allSourceElements[i], sourceCanvas);
    };

    for (var j = 0; j < allTargetElements.length; j++) {
        this.removeHighlight(allTargetElements[j], targetCanvas);
    };
};

ViewManager.prototype.removeHighlight = function removeHighlight(elementId, canvas) {
    canvas.removeMarker(elementId, 'highlight-green');
    canvas.removeMarker(elementId, 'highlight-blue');
    canvas.removeMarker(elementId, 'highlight-red');
    canvas.removeMarker(elementId, 'highlight-yellow');
};

ViewManager.prototype.highlightMatchedSourceElements = function() {

    var sourceElementsToHighlightGreen = [];
    var sourceElementsToHighlightBlue = [];
    var sourceElementsToHighlightYellow = [];

    var sourceElements = this.sourceView.get('elementRegistry').getAll();
    var excludedTypes = ["bpmn:Process", "label", "bpmn:SequenceFlow"];
    //TODO exclude types such as process, sequenceflow via shape.type
    //Shapes.id
    for(var i = 0; i < sourceElements.length; i++) {
        var foundCorr = tool.correspondenceManager.getCorrBySource(sourceElements[i].id);
        if(foundCorr != null) {
            var exclude = false;
            for(var k = 0; k < excludedTypes.length; k++) {
                if(sourceElements[i].type == excludedTypes[k]) {
                    exclude = true;
                    break;
                }
            }
            if(!exclude && foundCorr.corrType == "oneone") {
                sourceElementsToHighlightGreen.push(sourceElements[i].id);
            } else if (!exclude && foundCorr.corrType == "onezero") {
                sourceElementsToHighlightBlue.push(sourceElements[i].id);
            } else if (!exclude && (foundCorr.corrType == "manyone" || foundCorr.corrType == "onemany")) {
                sourceElementsToHighlightYellow.push(sourceElements[i].id);
            }
        }
    }

    var green = 'highlight-green';
    var blue = "highlight-blue";
    var yellow = "highlight-yellow";
    var canvas = this.sourceView.get('canvas');

    for(var j = 0; j < sourceElementsToHighlightGreen.length; j++) {
        this.highlightElement(sourceElementsToHighlightGreen[j], canvas, green);
    }
    for(var k = 0; k < sourceElementsToHighlightBlue.length; k++) {
        this.highlightElement(sourceElementsToHighlightBlue[k], canvas, blue);
    }
    for(var l = 0; l < sourceElementsToHighlightYellow.length; l++) {
        this.highlightElement(sourceElementsToHighlightYellow[l], canvas, yellow);
    }
};

ViewManager.prototype.highlightUnmatchedSourceElements = function() {
    var color = 'highlight-red';
    var canvas = this.sourceView.get('canvas');
    var sourceElementsToHighlight = [];
    var sourceElements = this.sourceView.get('elementRegistry').getAll();
    var excludedTypes = ["bpmn:Process", "label", "bpmn:SequenceFlow"];
    //TODO exclude types such as process, sequenceflow via shape.type
    //Shapes.id
    for(var i = 0; i < sourceElements.length; i++) {
        var foundCorr = tool.correspondenceManager.getCorrBySource(sourceElements[i].id);
        if(foundCorr == null) {
            var exclude = false;
            for(var k = 0; k < excludedTypes.length; k++) {
                if(sourceElements[i].type == excludedTypes[k]) {
                    exclude = true;
                }
            }
            if(!exclude) {
                sourceElementsToHighlight.push(sourceElements[i].id);
            }
        }
    }
    for(var j = 0; j < sourceElementsToHighlight.length; j++) {
        this.highlightElement(sourceElementsToHighlight[j], canvas, color);
    }

};

ViewManager.prototype.highlightElement = function(elementId, canvas, color) {
    canvas.addMarker(elementId, color);
};

ViewManager.prototype.selectElementsInCorr = function (correspondence, add) {
    var sourceSelectionService = this.sourceView.get('selection');
    var targetSelectionService = this.targetView.get('selection');
    //flag to whether keep selection or not
    //var keepSelection = $('#keepSelection').prop('checked');
    //selection service takes either string or array of strings of IDs as param for selection
    //sourceSelectionService.select(correspondence.source, keepSelection);
    //targetSelectionService.select(correspondence.target, keepSelection);
    sourceSelectionService.select(correspondence.source);
    targetSelectionService.select(correspondence.target);
};

ViewManager.prototype.getSelectedSource = function () {
    var selectedElements = this.sourceView.get('selection').get();
    var transformedElements = this.transformSelectionsIntoId(selectedElements);
    return transformedElements;
};

ViewManager.prototype.getSelectedTarget = function () {
    var selectedElements = this.targetView.get('selection').get();
    var transformedElements = this.transformSelectionsIntoId(selectedElements);
    return transformedElements;
};

//transform input from getSelected...(), could be ["string", Shape, ..], turn Shape objects into id strings
ViewManager.prototype.transformSelectionsIntoId = function (selection) {
    var selectionIds = [];
    for(var i = 0; i < selection.length; i++) {
        if (typeof selection[i] === "string") {
            selectionIds.push(selection[i]);
        } else {
            selectionIds.push(selection[i].id);
        }
    }
    return selectionIds;
};

ViewManager.prototype.createCorrespondenceFromSelection = function () {
    var selectedSource = this.getSelectedSource();
    var selectedTarget = this.getSelectedTarget();
    //TODO check for allowed types
    var allowed = true;
    var excludedTypes = ["bpmn:Process", "label", "bpmn:SequenceFlow"];
    for(var i = 0; i < selectedSource.length; i++) {
        var elementType = this.sourceView.get('elementRegistry').get(selectedSource[i]).type;

        for(var ex = 0; ex < excludedTypes.length; ex++) {
            if(elementType == excludedTypes[ex]) {
                allowed = false;
                console.log("ViewManager: Source selection for new correspondence contains an element type which is not allowed: " + elementType);
            }
        }
    }

    for(var j = 0; j < selectedTarget.length; j++) {
        var elementType = this.targetView.get('elementRegistry').get(selectedTarget[j]).type;

        for(var ex2 = 0; ex2 < excludedTypes.length; ex2++) {
            if(elementType == excludedTypes[ex2]) {
                allowed = false;
                console.log("ViewManager: Target selection for new correspondence contains an element type which is not allowed: " + elementType);
            }
        }
    }

    if(allowed) {
        //create the correspondence
        var newCorrespondenceFromSelections = tool.correspondenceManager.createCorrespondence(selectedSource, selectedTarget);
        //add the newly created correspondence
        if(newCorrespondenceFromSelections != null && newCorrespondenceFromSelections != undefined) {
            tool.correspondenceManager.addCorrespondence(newCorrespondenceFromSelections);
        }
    }
};

ViewManager.prototype.deleteSelectedElementFromCorrespondence = function () {
    var selectedSource = this.getSelectedSource();
    var selectedTarget = this.getSelectedTarget();

        for (var k = 0; k < selectedSource.length; k++) {
            var elementId = selectedSource[k];
            var foundCorr = tool.correspondenceManager.getCorrBySource(elementId);
            if (foundCorr != null) {
                tool.correspondenceManager.removeSourceElementFromCorrespondence(foundCorr, elementId);
            }
        }
        for(var l = 0; l < selectedTarget.length; l++) {
            var elementId = selectedTarget[l];
            var foundCorr = tool.correspondenceManager.getCorrByTarget(elementId);
            if (foundCorr != null) {
                tool.correspondenceManager.removeTargetElementFromCorrespondence(foundCorr, elementId);
            }
        }
};

ViewManager.prototype.verticalConsistency = function () {
    var allShapes = tool.viewManager.sourceView.get('elementRegistry').getAll();
    var matches = 0;
    var relevantMatches = 0;
    var unmatched = [];
    var bpmnPrefix = "bpmn:";
    //all elements except for labels, connections, sequenceFlows and the process element itself are deemed relevant here
    for(var i = 0; i < allShapes.length; i++) {
        if(allShapes[i].type != 'label' && allShapes[i].type != 'connection' && allShapes[i].type != bpmnPrefix + "Process" && allShapes[i].type != bpmnPrefix + "SequenceFlow") {
            var shapeId = allShapes[i].id;
            var shape = allShapes[i];
            relevantMatches = relevantMatches + 1;
            if(tool.correspondenceManager.getCorrBySource(shapeId) != null) {
                matches = matches + 1;
            } else if (tool.correspondenceManager.getCorrBySource(shapeId) == null) {
                unmatched.push(shape);
            }
        }
    }
    var ratio = Math.round(parseFloat(matches) / parseFloat(relevantMatches) * 100, 2);
    console.log("Vertical consistency matches for relevant element types based on source: " + ratio + "%");

    var divId = 'correspondenceTable';
    $('#' + divId).empty();

    var tableDiv = document.getElementById(divId);
    var titleNode = document.createElement("h2");
    titleNode.appendChild(document.createTextNode("Basic Vertical Consistency Check"));
    tableDiv.appendChild(titleNode);
    tableDiv.appendChild(document.createElement("br"));
    tableDiv.appendChild(document.createElement("br"));
    titleNode = document.createElement("h3");
    titleNode.appendChild(document.createTextNode("Vertical consistency matches for relevant element types based on source: " + ratio + "%"));
    tableDiv.appendChild(titleNode);
    tableDiv.appendChild(document.createElement("br"));
    tableDiv.appendChild(document.createElement("br"));


    var table = document.createElement("table");

    //table headers
    var tr = document.createElement("tr");
    var headerTexts = ["Overall Elements", "Relevant Elements", "Matched Elements", "Unmatched Elements"];
    for(var i = 0; i < headerTexts.length; i++) {
        var th = document.createElement("th");
        th.appendChild(document.createTextNode(headerTexts[i]));
        tr.appendChild(th);
    }
    table.appendChild(tr);
    //table data
    tr = document.createElement("tr");
    var headerContent = [allShapes.length, relevantMatches, matches, unmatched.length];
    for(var j = 0; j < headerContent.length; j++) {
        var th = document.createElement("th");
        th.appendChild(document.createTextNode(headerContent[j]));
        tr.appendChild(th);
    }
    table.appendChild(tr);
    tableDiv.appendChild(table);

    //unmatched elements table
    if(unmatched.length > 0) {
        var titleNode = document.createTextNode("List of unmatched elements which are not in a correspondence:");
        tableDiv.appendChild(document.createElement("h2").appendChild(titleNode));
        tableDiv.appendChild(document.createElement("br"));
        tableDiv.appendChild(document.createElement("br"));

        table = document.createElement("table");
        tr = document.createElement("tr");

        tr = document.createElement("tr");
        headerTexts = ["Element Id", "Element Name", "Element Type", "Focus"];
        for(var i = 0; i < headerTexts.length; i++) {
            var th = document.createElement("th");
            th.appendChild(document.createTextNode(headerTexts[i]));
            tr.appendChild(th);
        }
        table.appendChild(tr);

        for(var k = 0; k < unmatched.length; k++) {
            //if(unmatched[k].type != 'label' && allShapes[i].type != 'connection') {
                tr = document.createElement("tr");
                var idTextNode = document.createTextNode(unmatched[k].id);
                var td = document.createElement("td");
                td.appendChild(idTextNode);
                tr.appendChild(td);

                var nameTextNode = document.createTextNode(unmatched[k].businessObject.name);
                td = document.createElement("td");
                td.appendChild(nameTextNode);
                tr.appendChild(td);

                var typeTextNode = document.createTextNode(unmatched[k].type.replace("bpmn:", ""));
                td = document.createElement("td");
                td.appendChild(typeTextNode);
                tr.appendChild(td);

                //view = source in this setup
                var view = "source";
                var id = unmatched[k].id;
                var button = document.createElement("button");
                //button.type = "button";
                //button.name = "Focus";
                var btnTextNode = document.createTextNode("Focus View");
                button.appendChild(btnTextNode);
                //button.onclick = function() { tool.viewManager.focusOnElementByTableEntry(view, id) };
                button.setAttribute('onClick', "tool.viewManager.focusOnElementByTableEntry('" + view + "','" + id + "')");
                td = document.createElement("td");
                td.appendChild(button);
                tr.appendChild(td);

                table.appendChild(tr);
            //}

        }
        tableDiv.appendChild(table);
    }

    $('#' + divId).show();

};

ViewManager.prototype.focusCorrespondenceElements = function (correspondence) {

    if(correspondence) {
        var sourceView = this.sourceView;
        var targetView = this.targetView;
        var sourceElementRegistry = sourceView.get('elementRegistry');
        var targetElementRegistry = targetView.get('elementRegistry');

        var corrType = correspondence.corrType;

        switch(corrType) {
            case "onezero":
                var element = sourceElementRegistry.get(correspondence.source);
                this.focusOnElement(sourceView, element, 'single');
                break;
            case "zeroone":
                var element = targetElementRegistry.get(correspondence.target);
                this.focusOnElement(targetView, element, 'single');
                break;
            case "oneone":
                var sElement = sourceElementRegistry.get(correspondence.source);
                var tElement = targetElementRegistry.get(correspondence.target);
                this.focusOnElement(sourceView, sElement, 'single');
                this.focusOnElement(targetView, tElement, 'single');
                break;
            case "onemany":
                var sElement = sourceElementRegistry.get(correspondence.source);
                this.focusOnElement(sourceView, sElement, 'single');
                var targetElements = [];
                for(var j = 0; j < correspondence.target.length; j++) {
                    var element = targetElementRegistry.get(correspondence.target[j]);
                    targetElements.push(element);
                }
                this.focusOnElement(targetView, targetElements, 'fit');
                break;
            case "manyone":
                var sourceElements = [];
                for(var i = 0; i < correspondence.source.length; i++) {
                    var element = sourceElementRegistry.get(correspondence.source[i]);
                    sourceElements.push(element);
                }
                console.log(sourceElements);
                this.focusOnElement(sourceView, sourceElements, 'fit');
                var tElement = targetElementRegistry.get(correspondence.target);
                console.log(tElement);
                this.focusOnElement(targetView, tElement, 'single');
                break;
            default:
                console.log("Correspondence type not recognized: " + corrType);
                break;
        }
    }

};

/**
 *
 * @param view Source or Target View
 * @param element Only accepts non-connection shape elements such as tasks
 * @param scalingMode 'fit', 'single', 'keep'
 */
ViewManager.prototype.focusOnElement = function (view, element, scalingMode) {
    var view = view;
    if(view) {
        if(view == 'source') {
            view = this.sourceView;
        } else if (view == 'target') {
            view = this.targetView;
        }
        var canvas = view.get('canvas');
        centerViewbox(canvas, element, scalingMode);
    } else {
        console.out("ViewManager: No view specified or found for focus on element!");
    }



    function getBoundingBox(elements) {

        if (!(elements instanceof Array)) {
            elements = [elements];
        }

        var minX,
            minY,
            maxX,
            maxY;

        for(var i = 0; i < elements.length; i++) {
            var bbox = elements[i];
            var x = bbox.x,
                y = bbox.y,
                height = bbox.height || 0,
                width  = bbox.width  || 0;

            if (x < minX || minX === undefined) {
                minX = x;
            }
            if (y < minY || minY === undefined) {
                minY = y;
            }

            if ((x + width) > maxX || maxX === undefined) {
                maxX = x + width;
            }
            if ((y + height) > maxY || maxY === undefined) {
                maxY = y + height;
            }
        }

        return {
            x: minX,
            y: minY,
            height: maxY - minY,
            width: maxX - minX
        };
    }

    function centerViewbox (canvas, element, scalingMode) {
        var viewbox = canvas.viewbox();

        var box = getBoundingBox(element);

        var newViewbox = {
            x: (box.x + box.width/2) - viewbox.outer.width/2,
            y: (box.y + box.height/2) - viewbox.outer.height/2,
            width: viewbox.outer.width,
            height: viewbox.outer.height
        };

        canvas.viewbox(newViewbox);

        var center = {  x: box.x,
                        y: box.y};
        if(scalingMode == 'fit')
            canvas.zoom('fit-viewport', center);
        else if (scalingMode == 'single')
            canvas.zoom(1.0, center);
        else
            canvas.zoom(viewbox.scale);
    };

};

ViewManager.prototype.displayCorrespondenceTableAll = function (divId, correspondenceList) {
    var divId = 'correspondenceTable';
    $('#' + divId).empty();

    var tableDiv = document.getElementById(divId);


    var sourceView = this.sourceView;
    var targetView = this.targetView;
    var sourceElementRegistry = sourceView.get('elementRegistry');
    var targetElementRegistry = targetView.get('elementRegistry');

    for(var c = 0; c < correspondenceList.length; c++) {
        var table = document.createElement("table");

        var corr = correspondenceList[c];
        var corrType = corr.corrType;
        var corrSource = corr.source;
        var corrTarget = corr.target;

        var h3 = document.createElement("h3");
        var corrTypeText = "";

        switch(corrType) {
            case "onezero":
                corrTypeText = "1-0";
                break;
            case "zeroone":
                corrTypeText = "0-1";
                break;
            case "oneone":
                corrTypeText ="1-1";
                break;
            case "onemany":
                corrTypeText = "1-n";
                break;
            case "manyone":
                corrTypeText = "n-1";
                break;
            default:
                corrTypeText = "Error: Correspondence type not recognized.";
                break;
        }

        var typeHeader = document.createTextNode("Correspondence Type: " + corrTypeText);
        h3.appendChild(typeHeader);
        tableDiv.appendChild(h3);

        var sHeaderRow = createSourceHeader();
        var tHeaderRow = createTargetHeader();

        switch(corrType) {
            case "onezero":
                var tableRow = createTableRow(corrSource, sourceElementRegistry, 'source');
                table.appendChild(sHeaderRow);
                table.appendChild(tableRow[0]);
                break;
            case "zeroone":
                var tableRow = createTableRow(corrTarget, targetElementRegistry, 'target');
                table.appendChild(tHeaderRow);
                table.appendChild(tableRow[0]);
                break;
            case "oneone":
                var sTableRow = createTableRow(corrSource, sourceElementRegistry, 'source');
                var tTableRow = createTableRow(corrTarget, targetElementRegistry, 'target');

                table.appendChild(sHeaderRow);
                table.appendChild(sTableRow[0]);
                table.appendChild(tHeaderRow);
                table.appendChild(tTableRow[0]);
                break;
            case "onemany":
                var sTableRow = createTableRow(corrSource, sourceElementRegistry, 'source');
                var tTableRow = createTableRow(corrTarget, targetElementRegistry, 'target');

                table.appendChild(sHeaderRow);
                table.appendChild(sTableRow[0]);
                table.appendChild(tHeaderRow);
                for(var i = 0; i < tTableRow.length; i++) {
                    table.appendChild(tTableRow[i]);
                }
                break;
            case "manyone":
                var sTableRow = createTableRow(corrSource, sourceElementRegistry, 'source');
                var tTableRow = createTableRow(corrTarget, targetElementRegistry, 'target');

                table.appendChild(sHeaderRow);
                for(var i = 0; i < sTableRow.length; i++) {
                    table.appendChild(sTableRow[i]);
                }
                table.appendChild(tHeaderRow);
                table.appendChild(tTableRow[0]);
                break;
            default:
                console.log("Correspondence type not recognized: " + corrType);
                break;
        }
        tableDiv.appendChild(table);
    }



    $('#' + divId).show();

    function createTableRow (elementIds, registry, view) {

        if (!(elementIds instanceof Array)) {
            elementIds = [elementIds];
        }

        var tableRows = [];

        for(var i = 0; i < elementIds.length; i++) {
            var tr = document.createElement("tr");
            var texts = [];
            var element = registry.get(elementIds[i]);
            var id = element.id;
            texts.push(id);
            var name = element.businessObject.name;
            texts.push(name);
            var bpmnType = element.type.replace("bpmn:", "");
            texts.push(bpmnType);
            var button = document.createElement("button");
            texts.push("");
            //button.type = "button";
            //button.name = "Focus";
            var btnTextNode = document.createTextNode("Focus View");
            button.appendChild(btnTextNode);
            //button.onclick = function() { tool.viewManager.focusOnElementByTableEntry(view, id) };
            button.setAttribute('onClick', "tool.viewManager.focusOnElementByTableEntry('" + view + "','" + id + "')");

            for(var t = 0; t < texts.length; t++) {
                var td = document.createElement("td");
                var textNode = document.createTextNode(texts[t]);
                td.appendChild(textNode);
                if(t == texts.length - 1)
                    td.appendChild(button);
                tr.appendChild(td);
            }
            tableRows.push(tr);
        }
        return tableRows;
    }

    function createSourceHeader () {
        var sHeaders = ["Source Id(s)", "Name", "BPMN-Type"];

        var tableHeaderRow = document.createElement("tr");
        for(var i = 0; i < sHeaders.length; i++) {
            var tableHead = document.createElement("th");
            var headerTextNode = document.createTextNode(sHeaders[i]);
            tableHead.appendChild(headerTextNode);
            tableHeaderRow.appendChild(tableHead);
        }
        var endTh = document.createElement("th");
        tableHeaderRow.appendChild(endTh);
        return tableHeaderRow;
    }

    function createTargetHeader () {
        var tHeaders = ["Target Id(s)", "Name", "BPMN-Type"];

        var tableHeaderRow = document.createElement("tr");
        for(var i = 0; i < tHeaders.length; i++) {
            var tableHead = document.createElement("th");
            var headerTextNode = document.createTextNode(tHeaders[i]);
            tableHead.appendChild(headerTextNode);
            tableHeaderRow.appendChild(tableHead);
        }
        var endTh = document.createElement("th");
        tableHeaderRow.appendChild(endTh);
        return tableHeaderRow;
    }
};

ViewManager.prototype.displayCorrespondenceTable = function (divId, correspondence) {
    var divId = 'correspondenceTable';
    $('#' + divId).empty();

    var tableDiv = document.getElementById(divId);
    var table = document.createElement("table");


    var corr = correspondence;
    var corrType = corr.corrType;
    var corrSource = corr.source;
    var corrTarget = corr.target;

    var sourceView = this.sourceView;
    var targetView = this.targetView;
    var sourceElementRegistry = sourceView.get('elementRegistry');
    var targetElementRegistry = targetView.get('elementRegistry');

    var h3 = document.createElement("h3");
    var corrTypeText = "";

    switch(corrType) {
        case "onezero":
            corrTypeText = "1-0";
            break;
        case "zeroone":
            corrTypeText = "0-1";
            break;
        case "oneone":
            corrTypeText ="1-1";
            break;
        case "onemany":
            corrTypeText = "1-n";
            break;
        case "manyone":
            corrTypeText = "n-1";
            break;
        default:
            corrTypeText = "Error: Correspondence type not recognized.";
            break;
    }

    var typeHeader = document.createTextNode("Correspondence Type: " + corrTypeText);
    h3.appendChild(typeHeader);
    tableDiv.appendChild(h3);

    tableDiv.appendChild(table);

    var sHeaderRow = createSourceHeader();
    var tHeaderRow = createTargetHeader();

    switch(corrType) {
        case "onezero":
            var tableRow = createTableRow(corrSource, sourceElementRegistry, 'source');
            table.appendChild(sHeaderRow);
            table.appendChild(tableRow[0]);
            break;
        case "zeroone":
            var tableRow = createTableRow(corrTarget, targetElementRegistry, 'target');
            table.appendChild(tHeaderRow);
            table.appendChild(tableRow[0]);
            break;
        case "oneone":
            var sTableRow = createTableRow(corrSource, sourceElementRegistry, 'source');
            var tTableRow = createTableRow(corrTarget, targetElementRegistry, 'target');

            table.appendChild(sHeaderRow);
            table.appendChild(sTableRow[0]);
            table.appendChild(tHeaderRow);
            table.appendChild(tTableRow[0]);
            break;
        case "onemany":
            var sTableRow = createTableRow(corrSource, sourceElementRegistry, 'source');
            var tTableRow = createTableRow(corrTarget, targetElementRegistry, 'target');

            table.appendChild(sHeaderRow);
            table.appendChild(sTableRow[0]);
            table.appendChild(tHeaderRow);
            for(var i = 0; i < tTableRow.length; i++) {
                table.appendChild(tTableRow[i]);
            }
            break;
        case "manyone":
            var sTableRow = createTableRow(corrSource, sourceElementRegistry, 'source');
            var tTableRow = createTableRow(corrTarget, targetElementRegistry, 'target');

            table.appendChild(sHeaderRow);
            for(var i = 0; i < sTableRow.length; i++) {
                table.appendChild(sTableRow[i]);
            }
            table.appendChild(tHeaderRow);
            table.appendChild(tTableRow[0]);
            break;
        default:
            console.log("Correspondence type not recognized: " + corrType);
            break;
    }

    $('#' + divId).show();

    function createTableRow (elementIds, registry, view) {

        if (!(elementIds instanceof Array)) {
            elementIds = [elementIds];
        }

        var tableRows = [];

        for(var i = 0; i < elementIds.length; i++) {
            var tr = document.createElement("tr");
            var texts = [];
            var element = registry.get(elementIds[i]);
            var id = element.id;
            texts.push(id);
            var name = element.businessObject.name;
            texts.push(name);
            var bpmnType = element.type.replace("bpmn:", "");
            texts.push(bpmnType);
            var button = document.createElement("button");
            texts.push("");
            //button.type = "button";
            //button.name = "Focus";
            var btnTextNode = document.createTextNode("Focus View");
            button.appendChild(btnTextNode);
            //button.onclick = function() { tool.viewManager.focusOnElementByTableEntry(view, id) };
            button.setAttribute('onClick', "tool.viewManager.focusOnElementByTableEntry('" + view + "','" + id + "')");

            for(var t = 0; t < texts.length; t++) {
                var td = document.createElement("td");
                var textNode = document.createTextNode(texts[t]);
                td.appendChild(textNode);
                if(t == texts.length - 1)
                    td.appendChild(button);
                tr.appendChild(td);
            }
            tableRows.push(tr);
        }
        return tableRows;
    }

    function createSourceHeader () {
        var sHeaders = ["Source Id(s)", "Name", "BPMN-Type"];

        var tableHeaderRow = document.createElement("tr");
        for(var i = 0; i < sHeaders.length; i++) {
            var tableHead = document.createElement("th");
            var headerTextNode = document.createTextNode(sHeaders[i]);
            tableHead.appendChild(headerTextNode);
            tableHeaderRow.appendChild(tableHead);
        }
        var endTh = document.createElement("th");
        tableHeaderRow.appendChild(endTh);
        return tableHeaderRow;
    }

    function createTargetHeader () {
        var tHeaders = ["Target Id(s)", "Name", "BPMN-Type"];

        var tableHeaderRow = document.createElement("tr");
        for(var i = 0; i < tHeaders.length; i++) {
            var tableHead = document.createElement("th");
            var headerTextNode = document.createTextNode(tHeaders[i]);
            tableHead.appendChild(headerTextNode);
            tableHeaderRow.appendChild(tableHead);
        }
        var endTh = document.createElement("th");
        tableHeaderRow.appendChild(endTh);
        return tableHeaderRow;
    }
};

ViewManager.prototype.focusOnElementByTableEntry = function (view, id) {
    var view = view;
    if(view == 'source') {
        view = this.sourceView;
    } else if (view == 'target') {
        view = this.targetView;
    }
    var element = view.get('elementRegistry').get(id);
    var scalingMode = 'single';
    this.focusOnElement(view, element, scalingMode);
};