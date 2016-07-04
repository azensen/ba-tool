/**
 * Created by André Zensen on 21.06.2016.
 */
var ViewManager = function(htmlDivSource, htmlDivTarget) {
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
}

//highlight and select all elements in a correspondence
ViewManager.prototype.highlightCorrespondenceBySource = function (sourceElementId) {
    var correspondence = tool.correspondenceManager.getCorrBySource(sourceElementId);
    //TODO handle all corrTypes
    if(correspondence != null) {
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
            for(var j = 0; j < targetIds; j++) {
                targetCanvas.addMarker(targetIds[j], 'highlight-green');
            }
            sourceCanvas.addMarker(sourceIds, 'highlight-green');
        } else if (correspondence.corrType == "zeroone") {
            targetCanvas.addMarker(targetIds, 'highlight-green');
        }
        // highlight via canvas prep

        //select all correspondence elements on canvas
        this.selectElementsInCorr(correspondence);
    } else {
        console.log("No correspondence found for element id " + sourceElementId);
    }
};

ViewManager.prototype.highlightCorrespondenceByTarget = function (targetElementId) {
    var correspondence = tool.correspondenceManager.getCorrByTarget(targetElementId);

    if(correspondence != null) {
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
            for(var j = 0; j < targetIds; j++) {
                targetCanvas.addMarker(targetIds[j], 'highlight-green');
            }
        } else if (correspondence.corrType == "zeroone") {
            targetCanvas.addMarker(targetIds, 'highlight-green');
        }
        // highlight via canvas prep

        //select all correspondence elements on canvas
        this.selectElementsInCorr(correspondence);
    } else {
        console.log("No correspondence found for element id " + targetElementId);
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
    return selectedElements;
};

ViewManager.prototype.getSelectedTarget = function () {
    var selectedElements = this.targetView.get('selection').get();
    return selectedElements;
};

ViewManager.prototype.createCorrespondenceFromSelection = function () {
    var selectedSources = this.getSelectedSource();
    var selectedTarget = this.getSelectedTarget();
    var newCorrespondenceFromSelections = tool.correspondenceManager.createCorrespondence(selectedSources, selectedTarget);
    if(newCorrespondenceFromSelections != null && newCorrespondenceFromSelections != undefined) {
        tool.correspondenceManager.addCorr(newCorrespondenceFromSelections);
    }
};