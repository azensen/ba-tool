/**
 * Created by André Zensen on 21.06.2016.
 */
"use strict";

function CorrespondenceManager () {
    this.correspondenceList = null;
    this.association = null;
};

CorrespondenceManager.prototype.loadAssociation = function (filePath) {
    var assoFile = filePath.substr(0, filePath.lastIndexOf(".")) + ".asso";
    console.log(assoFile);
    //$.get(assoFile, _this.parseAssociationFile, 'text');

    var _this = this;
    $.getJSON(assoFile, function(data) {
        console.log("Successfully loaded associations.");
        //console.log(data);
        _this.setAssociation(data);
        })
            .error(function(xhr) {
                console.log("Unable to load associations from .asso at " + assoFile);
                console.log(xhr);
                console.log(Object.keys(xhr));
            });
};

CorrespondenceManager.prototype.setAssociation = function (association) {
    this.association = association;
};

CorrespondenceManager.prototype.loadCorrespondences = function (filePath) {
    var corrFile = filePath.substr(0, filePath.lastIndexOf(".")) + ".corr";
    console.log(corrFile);
    //$.get(assoFile, _this.parseAssociationFile, 'text');

    var _this = this;
    $.getJSON(corrFile, function(data) {
        console.log("Successfully loaded correspondences.");
        //console.log(data);
        _this.setCorrespondences(data);
    })
        .error(function(xhr) {
            console.log("Unable to load correspondences from .corr at " + corrFile);
            console.log(xhr);
            console.log(Object.keys(xhr));
        });
};

CorrespondenceManager.prototype.setCorrespondences = function (data) {
    var newCorrList = [];
    for(var i = 0; i < data.length; i++) {
        newCorrList.push($.extend(new Correspondence(), data[i]));
    }
    this.correspondenceList = newCorrList;
};

CorrespondenceManager.prototype.getCorrespondencesAsJSON = function () {
    var JSONcorrs = JSON.stringify(this.correspondenceList, null, "\t");
    return JSONcorrs;
};

//TODO Save .CORR
CorrespondenceManager.prototype.saveCorrespondenceFile = function (correspondenceJSON, corrFilePath) {
    console.log("Saving .corr as JSON to " + corrFilePath + " with content:");
    console.log(correspondenceJSON);
    $.ajax({
        type     : "POST",
        url      : "../php/saveCorrespondences.php",
        data     : { corrList : correspondenceJSON, filePath : corrFilePath},
        success  : function(msg){ console.log('Successfully saved .CORR.'); } ,
        error    : function(msg) { console.error('Failed saving .CORR: ' + msg); }
    });
};

CorrespondenceManager.prototype.addCorrespondence = function (newCorrespondence) {
    var newCorrType = newCorrespondence.corrType;
    var sourceId = null;
    var targetId = null;
    var foundCorr = null;

    if(newCorrType == "oneone") {
        sourceId = newCorrespondence.source;
        targetId = newCorrespondence.target;
        //fetch corr by id, then delete id from found corr
        foundCorr = this.getCorrBySource(sourceId);
        if (foundCorr != null) {
            this.removeSourceElementFromCorrespondence(foundCorr, sourceId);
        }
        foundCorr = this.getCorrByTarget(targetId);
        if (foundCorr != null) {
            this.removeTargetElementFromCorrespondence(foundCorr, targetId);
        }

    } else if (newCorrType == "onezero") {
        sourceId = newCorrespondence.source;
        foundCorr = this.getCorrBySource(sourceId);
        if (foundCorr != null) {
            this.removeSourceElementFromCorrespondence(foundCorr, sourceId);
        }
    } else if (newCorrType == "zeroone") {
        targetId = newCorrespondence.target;
        foundCorr = this.getCorrByTarget(targetId);
        if (foundCorr != null) {
            this.removeTargetElementFromCorrespondence(foundCorr, targetId);
        }
    } else if (newCorrType == "manyone") {
        sourceId = newCorrespondence.source; //should be array with id strings
        targetId = newCorrespondence.target; //should be single id string
        for(var i = 0; i < sourceId.length; i++) {
            foundCorr = this.getCorrBySource(sourceId[i]);
            if (foundCorr != null) {
                this.removeSourceElementFromCorrespondence(foundCorr, sourceId[i]);
            }
        }
        foundCorr = this.getCorrByTarget(targetId);
        if (foundCorr != null) {
            this.removeTargetElementFromCorrespondence(foundCorr, targetId);
        }
    } else if (newCorrType == "onemany") {
        sourceId = newCorrespondence.source; //should be single id string
        targetId = newCorrespondence.target; //should be array with id strings
        foundCorr = this.getCorrBySource(sourceId);
        if (foundCorr != null) {
            this.removeSourceElementFromCorrespondence(foundCorr, sourceId);
        }
        for(var j = 0; j < targetId.length; j++) {
            foundCorr = this.getCorrByTarget(targetId[j]);
            if (foundCorr != null) {
                this.removeTargetElementFromCorrespondence(foundCorr, targetId[j]);
            }
        }
    }
    this.correspondenceList.push(newCorrespondence);
};

CorrespondenceManager.prototype.addCorr = function (newCorr) {
    // will contain existing corrs by matching source / target
    var existingCorrMatchesBySource = [];
    var existingCorrMatchesByTarget = [];

    if(newCorr.corrType == 'oneone') {
        //get both corrs by source and target, push one, check for equality, if not equal push other corr as well
        var existingSource = this.getCorrBySource(newCorr.source);
        var existingTarget = this.getCorrByTarget(newCorr.target);

        console.log("Pushing existing corr by source:");
        console.log(existingSource);

        if(existingSource != null) {
            existingCorrMatchesBySource.push(existingSource);
            if(existingTarget != null) {
                if(existingSource != existingTarget) {
                    existingCorrMatchesByTarget.push(existingTarget);
                    console.log("Pushing existing corr by target:");
                    console.log(existingTarget);
                }
            }
        } else if (existingSource == null && existingTarget != null) {
            existingCorrMatchesByTarget.push(existingTarget);
            console.log("Pushing existing corr by target:");
            console.log(existingTarget);
        }

    } else if (newCorr.corrType == 'onemany') {
        //get corr by source, get corrs by target and check each for equality with found source corr, push if not equal
        var existingSource = this.getCorrBySource(newCorr.source);
        existingCorrMatchesBySource.push(existingSource);
        for(var i = 0; i < newCorr.target.length; i++) {
            var existingTargetCorr = this.getCorrByTarget(newCorr.target[i]);
            if(existingSource != existingTargetCorr) {
                existingCorrMatchesByTarget.push(existingTargetCorr);
            }
        }
    } else if (newCorr.corrType == 'manyone') {
        //get corr by target, get corrs by source and check each for equality with found target corr, push if not equal
        var existingTargetCorr = this.getCorrByTarget(newCorr.target);
        existingCorrMatchesByTarget.push(existingTargetCorr);
        for(var i = 0; newCorr.source.length; i++) {
            var existingSourceCorr = this.getCorrBySource(newCorr.source[i]);
            if(existingTargetCorr != existingSourceCorr) {
                existingCorrMatchesBySource.push(existingSourceCorr);
            }
        }
    }
    console.log("Number of CorrMatchesBySource: " + existingCorrMatchesBySource.length);
    console.log("Number of CorrMatchesByTarget: " + existingCorrMatchesByTarget.length);
    //remove or transform matching correspondences
    for(var k = 0; k < existingCorrMatchesBySource.length; k++) {
        //TODO transformations first if matching corr != oneone or onemany
        if(existingCorrMatchesBySource[k] == null) {
            continue;
        } else {
            console.log("Removing source element from correspondence:");
            console.log(existingCorrMatchesBySource[k]);
            if(newCorr.corrType == 'oneone' || newCorr.corrType == 'onezero') {
                this.removeSourceElementFromCorrespondence(existingCorrMatchesBySource[k], newCorr.source);
            } else if ( newCorr.corrType == 'manyone') {
                for(var m = 0; m < newCorr.source; m++) {
                    this.removeSourceElementFromCorrespondence(existingCorrMatchesBySource[k], newCorr.source[m]);
                }
            }

        }
    }
    for(var l = 0; l < existingCorrMatchesByTarget.length; l++) {
        if(existingCorrMatchesByTarget[l] == null) {
            continue;
        } else {
            //TODO transformations first if matching corr != oneone or manyone
            console.log("Removing target element from correspondence:");
            console.log(existingCorrMatchesByTarget[l]);
            console.log(Object.keys(existingCorrMatchesByTarget[l]));
            if(newCorr.corrType == 'oneone' || newCorr.corrType == 'zeroone') {
                this.removeTargetElementFromCorrespondence(existingCorrMatchesByTarget[l], newCorr.target);
            } else if (newCorr.corrType == 'manyone') {
                for(var n = 0; n < newCorr.target; n++) {
                    this.removeTargetElementFromCorrespondence(existingCorrMatchesByTarget[l], newCorr.target[n]);
                }
            }

        }
    }
    this.correspondenceList.push(newCorr);
};

CorrespondenceManager.prototype.removeSourceElementFromCorrespondence = function(existingCorrMatchBySource, idToRemove) {
    var currentCorrWithSource = existingCorrMatchBySource;
    var idToRemove = idToRemove;

    if(currentCorrWithSource.corrType == "oneone") {
        //TODO what to do with resulting 0-1?
        //currentCorrWithSource.source = null;
        //delete currentCorrWithSource.source;
        //currentCorrWithSource.source = "";
        //currentCorrWithSource.corrType = "zeroone";
        this.removeCorrespondence(currentCorrWithSource);

    } else if (currentCorrWithSource.corrType == "onemany") {

        //TODO what to do with resulting 0-m?
        //currentCorrWithSource.corrType = "zeromany";
        //delete currentCorrWithSource.source;
        this.removeCorrespondence(currentCorrWithSource);

    } else if (currentCorrWithSource.corrType == "manyone") {
        // splice source from sources
        for(var i = 0; i < currentCorrWithSource.source.length; i++) {
            if(currentCorrWithSource.source[i] == idToRemove) {
               currentCorrWithSource.source.splice(i, 1);
            }
        }
        //if remaining sources = 1 turn corr into 1-1 type
        if(currentCorrWithSource.source.length == 1) {
            currentCorrWithSource.corrType = "oneone";
            currentCorrWithSource.source = currentCorrWithSource.source[0];
        }

    } else if (currentCorrWithSource.corrType == "onezero") {
        this.removeCorrespondence(currentCorrWithSource);
    }
};

CorrespondenceManager.prototype.removeTargetElementFromCorrespondence = function(existingCorrMatchByTarget, idToRemove) {
    var currentCorrWithTarget = existingCorrMatchByTarget;
    var idToRemove = idToRemove;

    if(currentCorrWithTarget.corrType == "oneone") {
        //TODO what to do with resulting 0-1?
        //currentCorrWithSource.source = null;
        //delete currentCorrWithTarget.target;
        //currentCorrWithTarget.target = "";
        //currentCorrWithTarget.corrType = "onezero";
        this.removeCorrespondence(currentCorrWithTarget);

    } else if (currentCorrWithTarget.corrType == "onemany") {

        //TODO what to do with resulting 0-m?

        //splice target from targets
        for(var i = 0; i < currentCorrWithTarget.target.length; i++) {
            if(currentCorrWithTarget.target[i] == idToRemove) {
                currentCorrWithTarget.target.splice(i, 1);
            }
        }
        //if remaining targets = 1 then turn into 1-1 type
        if(currentCorrWithTarget.target.length == 1) {
            currentCorrWithTarget.corrType = "oneone";
            currentCorrWithTarget.target = currentCorrWithTarget.target[0];
        }

    } else if (currentCorrWithTarget.corrType == "manyone") {
        //TODO think about this
        //target lost, so delete?
        this.removeCorrespondence(currentCorrWithTarget);

    } else if (currentCorrWithTarget.corrType == "zeroone") {
        this.removeCorrespondence(currentCorrWithTarget);
    }
};

CorrespondenceManager.prototype.removeCorrespondence = function (corr) {
    var corrList = this.correspondenceList;

    for(var i = 0; i < corrList.length; i++) {
        if(corr == corrList[i]) {
            corrList.splice(i, 1);
        }
    }
};

//discarded due to possible duplicate unique ID in respective models
/*CorrespondenceManager.prototype.removeElementFromCorr = function (sourceId, targetId) {
    var corrToEdit = this.getCorr(elementID);
    var corrType = corrToEdit.corrType;

    if(corrType == "oneone" || corrType == "onezero" || corrType == "zeroone") {
        this.removeCorrespondence(corrToEdit);
    } else if (corrType == "manyone") {

    } else if (corrType == "onemany") {
        
    }
};*/

CorrespondenceManager.prototype.getCorr = function (elementID) {
    var corrList = this.correspondenceList;
    var corr = null;
    for (var i = 0; i < corrList.length; i++) {
        corr = corrList[i];
        var corrType = corr.corrType;
        //var n = str1.localeCompare(str2);
        if(corrType == "oneone") {
            if(corr.source == elementID || corr.target == elementID) {
                return corr;
            }
        } else if (corrType == "onezero") {
            if(corr.source == elementID) {
                return corr;
            }
        } else if (corrType == "zeroone") {
            if(corr.target == elementID) {
                return corr;
            }
        } else if (corrType == "onemany") {
            if(corr.source == elementID) {
                return corr;
            } else {
                for (var j = 0; j < corr.target.length; j++) {
                    if(corr.target[j] == elementID) {
                        return corr;
                    }
                }
            }
        } else if (corrType == "manyone") {
            if(corr.target == elementID) {
                return corr;
            } else {
                for (var k = 0; k < corr.source.length; k++) {
                    if(corr.source[k] == elementID) {
                        return corr;
                    }
                }
            }
        }
    }
    console.log("No CorrespondenceById found.");
    return corr;
};

CorrespondenceManager.prototype.getCorrBySource = function (elementID) {
    var corrList = this.correspondenceList;
    var corr = null;
    //iterate through list to find a matching correspondence for the elementID
    for (var i = 0; i < corrList.length; i++) {
        if(corrList[i] != null) {
            corr = corrList[i];
            var corrType = corr.corrType;
            //var n = str1.localeCompare(str2);
            if (corrType == "oneone") {
                if (corr.source == elementID) {
                    return corr;
                }
            } else if (corrType == "onezero") {
                if (corr.source == elementID) {
                    return corr;
                }
            } else if (corrType == "zeroone") {
                //return null;
            } else if (corrType == "onemany") {
                if (corr.source == elementID) {
                    return corr;
                }
            } else if (corrType == "manyone") {
                for (var k = 0; k < corr.source.length; k++) {
                    if (corr.source[k] == elementID) {
                        return corr;
                    }
                }
            }
        }
    }
console.log("No CorrespondenceBySource found.");
return null;
};

CorrespondenceManager.prototype.getCorrByTarget = function (elementID) {
    var corrList = this.correspondenceList;
    var corr = null;
    //iterate through list to find matching correspondence for elementID
    for (var i = 0; i < corrList.length; i++) {
        if(corrList[i] != null) {
            corr = corrList[i];
            var corrType = corr.corrType;
            //var n = str1.localeCompare(str2);
            if (corrType == "oneone") {
                if (corr.target == elementID) {
                    return corr;
                }
            } else if (corrType == "onezero") {

            } else if (corrType == "zeroone") {
                if (corr.target == elementID) {
                    return corr;
                }
            } else if (corrType == "onemany") {
                for (var j = 0; j < corr.target.length; j++) {
                    if (corr.target[j] == elementID) {
                        return corr;
                    }
                }
            } else if (corrType == "manyone") {
                if (corr.target == elementID) {
                    return corr;
                }
            }
        }
    }
    console.log("No CorrespondenceByTarget found.");
    return null;
};
/*
 Structure of correspondence types

 //1-1
 var corrType = "oneone";
 var source = "TaskID";
 var target = "TaskID";

 var oneone = new Correspondence("oneone", "TaskID", "TaskID");

 var oneone = {
 type : "oneone",
 source : "TaskID",
 target : "TaskID"
 }

 //1-m
 var corrType = "onemany";
 var source = "TaskID";
 var target = ["TaskID", "TaskID2"];

 var onemany = new Correspondence("onemany", "TaskID", ["TaskID", "TaskID2"]);

 var onemany = {
 type : "onemany",
 source : "TaskID",
 target : ["TaskID", "TaskID2"]
 }
 */
/*
 Input: correspondence type, source(s) and target(s) as single object / elementID or array of objects / elementIDs
 Output: correspondence according to type
 */
function Correspondence(corrType, source, target) {

    this.corrType = corrType;

    //init
    switch(corrType) {
        case "onezero":
            this.source = source;
            break;
        case "zeroone":
            this.target = target;
            break;
        default:
            this.source = source;
            this.target = target;
    }
};

CorrespondenceManager.prototype.createCorrespondence = function (selectionSource, selectionTarget) {
    //for storing element IDs of selections
    var newSources = [];
    var newTargets = [];

    //collect IDs of selected elements, [i].id for Shape elements etc
    for (var i = 0; i < selectionSource.length; i++) {
        if(typeof selectionSource[i] === "string") {
            newSources.push(selectionSource[i]);
        } else {
            newSources.push(selectionSource[i].id);
        }
    }
    for (var j = 0; j < selectionTarget.length; j++) {
        if(typeof selectionTarget[j] === 'string') {
            newTargets.push(selectionTarget[j]);
        } else {
            newTargets.push(selectionTarget[j].id);
        }
    }
    console.log("Source and target selections for new correspondence:");
    console.log(newSources);
    console.log(newTargets);
    //create correspondence according to correspondence definition
    if(newSources.length > 1 && newTargets.length > 1) {
        console.log("Error: Only 1-m or m-1 permitted, m-m selected.");
        return null;
    } else if (newSources.length == 1 && newTargets.length == 1) {
        var newCorr = new Correspondence("oneone", newSources[0], newTargets[0]);
        return newCorr;
    } else if (newSources.length == 1 && newTargets.length > 1) {
        var newCorr = new Correspondence("onemany", newSources[0], newTargets);
        return newCorr;
    } else if (newSources.length > 1 && newTargets.length == 1) {
        var newCorr = new Correspondence("manyone", newSources, newTargets[0]);
        return newCorr;
    } else if (newSources.length == 0 && newTargets.length == 1) {
        var newCorr = new Correspondence("zeroone", null, newTargets[0]);
        return newCorr;
    } else if (newSources.length == 1 && newTargets.length == 0) {
        var newCorr = new Correspondence("onezero", newSources[0], null);
        return newCorr;
    } else {
        return null;
    }
};

/*
Transformations
1-1 to 1-m
1-1 to m-1
1-m to 1-1
m-1 to 1-1
 */
CorrespondenceManager.prototype.transformCorr = function (newCorr, oldCorr) {

};