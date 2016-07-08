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
                /*		  'element.hover',
                 'element.out',*/
                'element.click',
                /*		  'element.dblclick',
                 'element.mousedown',
                 'element.mouseup'*/
            ];

            events.forEach(function (event) {

                eventBusSource.on(event, function (e) {
                    // e.element = the model element
                    // e.gfx = the graphical element
                    //document.getElementById("element-info-top").innerHTML = "Top-Element: " + e.element.id + " " + e.element.label;
                    console.log("e: " + Object.keys(e));
                    console.log("e.element: " + Object.keys(e.element));
                    console.log("SourceModeller: " + Object.keys(sourceView));
                    //Get element via elementRegistry
                    var elementRegistry = sourceView.get('elementRegistry');
                    var shape = elementRegistry.get(e.element.id);
                    var businessObject = shape.businessObject;
                    console.log("shape: " + Object.keys(shape));

                    console.log("businessObject: " + Object.keys(businessObject));
                    console.log("businessObject Type: " + businessObject.$type);

                    var selectedElements = sourceView.get('selection').get();
                    console.log("Selected Source Elements: ");
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

                        if(selectedElements.length > 0)
                            tool.viewManager.highlightCorrespondenceBySource(e.element.id);
                    }
                });
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

            events.forEach(function (event) {

                eventBusTarget.on(event, function (e) {
                    // e.element = the model element
                    // e.gfx = the graphical element
                    //document.getElementById("element-info-top").innerHTML = "Top-Element: " + e.element.id + " " + e.element.label;
                    console.log("e: " + Object.keys(e));
                    console.log("e.element: " + Object.keys(e.element));
                    console.log("TargetModeller: " + Object.keys(targetView));
                    //Get element via elementRegistry
                    var elementRegistry = targetView.get('elementRegistry');
                    var shape = elementRegistry.get(e.element.id);
                    var businessObject = shape.businessObject;
                    console.log("shape: " + Object.keys(shape));

                    console.log("businessObject: " + Object.keys(businessObject));
                    console.log("businessObject Type: " + businessObject.$type);

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

                        if(selectedElements.length > 0)
                            tool.viewManager.highlightCorrespondenceByTarget(e.element.id);
                    }
                });
            });
        });
    };
};

ViewManager.prototype.saveSource = function(filePath) {

    // save diagram on button click
    var saveButton = document.querySelector('#save-button');

    saveButton.addEventListener('click', function() {

        // get the diagram contents
        bpmnModelerTop.saveXML({ format: true }, function(err, xml) {

            if (err) {
                console.error('diagram save failed', err);
            } else {
                console.info('diagram saved');
                console.info(xml);
            }

            alert('diagram saved (see console (F12))');
        });
    });
};
ViewManager.prototype.saveTarget = function(filePath) {};

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

    for(var i = 0; i < correspondenceList.length; i++) {
        //in the process of removing an element a corr might get spliced to null, therefore a check
        if(correspondenceList[i] != null) {

            var corr = correspondenceList[i];
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
                        tool.correspondenceManager.removeSourceElementFromCorrespondence(corr, elementId);
                        console.log("Could not find element in source with id " + elementId + ", removed element from correspondence.")
                    }
                }
            //if one- type
            } else if (typeof corrSource === "string") {
                var elementId = corrSource;
                existingSource = sourceElementRegistry.get(elementId);
                if(existingSource == undefined) {
                    tool.correspondenceManager.removeSourceElementFromCorrespondence(corr, elementId);
                    console.log("Could not find element in source with id " + elementId + ", removed element from correspondence.");
                }
            }

            //cycle through targets and remove elements which do not exist in the target view (model) from the correspondence
            //if many- type
            if(corrTarget instanceof Array) {
                for(var k = 0; k < corrTarget.length; k++) {
                    var elementId = corrTarget[k];
                    existingTarget = targetElementRegistry.get(elementId);
                    if(existingTarget == undefined) {
                        tool.correspondenceManager.removeTargetElementFromCorrespondence(corr, elementId);
                        console.log("Could not find element in target with id " + elementId + ", removed element from correspondence.")
                    }
                }
                //if one- type
            } else if (typeof corrTarget === "string") {
                var elementId = corrTarget;
                existingTarget = targetElementRegistry.get(elementId);
                if(existingTarget == undefined) {
                    tool.correspondenceManager.removeTargetElementFromCorrespondence(corr, elementId);
                    console.log("Could not find element in target with id " + elementId + ", removed element from correspondence.");
                }
            }
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

        var sourceCanvas = this.sourceView.get('canvas');
        var targetCanvas = this.targetView.get('canvas');

        if(correspondence.corrType == "oneone") {
            // highlight via CSS class
            sourceCanvas.addMarker(sourceIds, 'highlight-green');
            targetCanvas.addMarker(targetIds, 'highlight-green');
        } else if (correspondence.corrType == "onemany") {
            sourceCanvas.addMarker(sourceIds, 'highlight-green');
            for(var i = 0; i < targetIds.length ; i++) {
                targetCanvas.addMarker(targetIds[i], 'highlight-green');
            }
        } else if (correspondence.corrType == "manyone") {
            for(var j = 0; j < sourceIds.length; j++) {
               sourceCanvas.addMarker(sourceIds[j], 'highlight-green');
            }
            targetCanvas.addMarker(targetIds, 'highlight-green');
        /*} else if (correspondence.corrType == "zeroone") {
            targetCanvas.addMarker(targetIds, 'highlight-green');*/
        } else if (correspondence.corrType == "onezero") {
            sourceCanvas.addMarker(sourceIds, 'highlight-blue');
        }
        // highlight via canvas prep

        //select all correspondence elements on canvas
        this.selectElementsInCorr(correspondence);
    } else if (correspondence == null) {
        console.log("No correspondence found for element id " + sourceElementId);
    } else if (correspondence != null && existingElement == undefined) {
        console.log("Correspondence found for element id " + sourceElementId + " but element does not exist in source model.");
    }
};

ViewManager.prototype.highlightCorrespondenceByTarget = function (targetElementId) {
    var correspondence = tool.correspondenceManager.getCorrByTarget(targetElementId);

    //get source view element registry and get element via targetElementId
    //existingElement will be undefined if no such element exists
    var elementRegistry = this.targetView.get('elementRegistry');
    var existingElement = elementRegistry.get(targetElementId);

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

        var sourceCanvas = this.sourceView.get('canvas');
        var targetCanvas = this.targetView.get('canvas');

        if(correspondence.corrType == "oneone") {
            // highlight via CSS class
            sourceCanvas.addMarker(sourceIds, 'highlight-green');
            targetCanvas.addMarker(targetIds, 'highlight-green');
        } else if (correspondence.corrType == "onemany") {
            sourceCanvas.addMarker(sourceIds, 'highlight-green');
            for(var i = 0; i < targetIds.length ; i++) {
                targetCanvas.addMarker(targetIds[i], 'highlight-green');
            }
        } else if (correspondence.corrType == "manyone") {
            for(var j = 0; j < sourceIds.length; j++) {
                sourceCanvas.addMarker(sourceIds[j], 'highlight-green');
            }
            targetCanvas.addMarker(targetIds, 'highlight-green');
        } else if (correspondence.corrType == "zeroone") {
            targetCanvas.addMarker(targetIds, 'highlight-blue');
        }
        // highlight via canvas prep

        //select all correspondence elements on canvas
        this.selectElementsInCorr(correspondence);
    } else if (correspondence == null) {
        console.log("No correspondence found for element id " + targetElementId);
    } else if (correspondence != null && existingElement == undefined) {
        console.log("Correspondence found for element id " + targetElementId + " but element does not exist in target model.");
    }
};

ViewManager.prototype.removeAllHighlights = function() {
    var sourceCanvas = this.sourceView.get('canvas');
    var targetCanvas = this.targetView.get('canvas');

    var elementRegistrySource = this.sourceView.get('elementRegistry');
    var elementRegistryTarget = this.targetView.get('elementRegistry');

    var allSourceElements = elementRegistrySource.getAll();
    var allTargetElements = elementRegistryTarget.getAll();
    console.log(allSourceElements);
    console.log(Object.keys(allSourceElements));
    console.log(allTargetElements);
    console.log(Object.keys(allTargetElements));

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
    var keepSelection = $('#keepSelection').prop('checked');
    //selection service takes either string or array of strings of IDs as param for selection
    sourceSelectionService.select(correspondence.source, keepSelection);
    targetSelectionService.select(correspondence.target, keepSelection);
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

    //create the correspondence
    var newCorrespondenceFromSelections = tool.correspondenceManager.createCorrespondence(selectedSource, selectedTarget);
    //add the newly created correspondence
    if(newCorrespondenceFromSelections != null && newCorrespondenceFromSelections != undefined) {
        tool.correspondenceManager.addCorrespondence(newCorrespondenceFromSelections);
    }
};

ViewManager.prototype.verticalConsistency = function () {
    var allShapes = tool.viewManager.sourceView.get('elementRegistry').getAll();
    var matches = 0;
    var relevantMatches = 0;
    var unmatched = [];
    var bpmnPrefix = "bpmn:";
    //TODO cover all task types / options as param an then iterate through relevant types
    for(var i = 0; i < allShapes.length; i++) {
        if(allShapes[i].type == bpmnPrefix + "Task") {
            var shapeId = allShapes[i].id;
            relevantMatches = relevantMatches + 1;
            if(tool.correspondenceManager.getCorrBySource(shapeId) != null) {
                matches = matches + 1;
            } else if (tool.correspondenceManager.getCorrBySource(shapeId) == null) {
                unmatched.push(shapeId);
            }
        }
    }
    var ratio = Math.round(parseFloat(matches) / parseFloat(relevantMatches) * 100, 2);
    console.log("Vertical consistency matches for relevant element types based on source: " + ratio + "%");
};