/**
 * Created by André Zensen on 21.06.2016.
 */
"use strict";

function CorrespondenceManager () {
    this.correspondenceList = [];
    this.association = {};
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
            console.log(xhr);
            console.log(Object.keys(xhr));
        });
};

CorrespondenceManager.prototype.setCorrespondences = function (data) {
    this.correspondenceList = data;
};

CorrespondenceManager.prototype.addCorr = function (newCorr) {
    var existingCorrMatchesBySource = [];
    var existingCorrMatchesByTarget = [];

    if(newCorr.corrType == 'oneone') {
        //get both corrs by source and target, push one, check for equality, if not equal push other corr as well
        var existingSourceCorr = this.getCorrBySource(newCorr.source);
        var existingTargetCorr = this.getCorrByTarget(newCorr.target);
        console.log("Pushing CorrMatchBySource:");
        console.log(existingSourceCorr);
        if(existingSourceCorr != null) {
            existingCorrMatchesBySource.push(existingSourceCorr);
            if(existingTargetCorr != null) {
                if(existingSourceCorr != existingTargetCorr) {
                    existingCorrMatchesByTarget.push(existingTargetCorr);
                }
            }
        }

    } else if (newCorr.corrType == 'onemany') {
        //get corr by source, get corrs by target and check each for equality with found source corr, push if not equal
        var existingSourceCorr = this.getCorrBySource(newCorr.source);
        existingCorrMatchesBySource.push(existingSourceCorr);
        for(var i = 0; i < newCorr.target.length; i++) {
            var existingTargetCorr = this.getCorrByTarget(newCorr.target[i]);
            if(existingSourceCorr != existingTargetCorr) {
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
        console.log("Removing source correspondence:");
        console.log(existingCorrMatchesBySource[k]);
        this.removeCorrespondence(existingCorrMatchesBySource[k]);
    }
    for(var l = 0; l < existingCorrMatchesByTarget.length; l++) {
        //TODO transformations first if matching corr != oneone or manyone
        console.log("Removing target correspondence:");
        console.log(existingCorrMatchesBySource[l]);
        console.log(Object.keys(existingCorrMatchesBySource[l]));
        this.removeCorrespondence(existingCorrMatchesByTarget[l]);
    }
    this.correspondenceList.push(newCorr);
};

CorrespondenceManager.prototype.removeCorrespondence = function (corr) {
    var corrList = this.correspondenceList;

    for(var i = 0; i < corrList.length; i++) {
        if(corr == corrList[i]) {
            corrList.splice(i, 1);
        }
    }
};

CorrespondenceManager.prototype.removeElementFromCorr = function (sourceId, targetId) {
    var corrToEdit = this.getCorr(elementID);
    var corrType = corrToEdit.corrType;

    if(corrType == "oneone" || corrType == "onezero" || corrType == "zeroone") {
        this.removeCorrespondence(corrToEdit);
        //TODO Transformation of existing corrs with then removed element
    } else if (corrType == "manyone") {

    } else if (corrType == "onemany") {
        
    }
};

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
    for (var i = 0; i < corrList.length; i++) {
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
            continue;
        } else if (corrType == "onemany") {
            if (corr.source == elementID) {
                return corr;
            } else if (corrType == "manyone") {
                for (var k = 0; k < corr.source.length; k++) {
                    if (corr.source[k] == elementID) {
                        return corr;
                    }
                }
            }
            console.log("No CorrespondenceBySource found.");
            return corr;
        }
    }
};

CorrespondenceManager.prototype.getCorrByTarget = function (elementID) {
    var corrList = this.correspondenceList;
    var corr = null;
    for (var i = 0; i < corrList.length; i++) {
        corr = corrList[i];
        var corrType = corr.corrType;
        //var n = str1.localeCompare(str2);
        if (corrType == "oneone") {
            if (corr.target == elementID) {
                return corr;
            }
        } else if (corrType == "onezero") {
            continue;
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
        console.log("No CorrespondenceByTarget found.");
        return corr;
    }
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
    var existingCorrespondencesWithElements = [];
    var newSources = [];
    var newTargets = [];

    for (var i = 0; i < selectionSource.length; i++) {
        newSources.push(selectionSource[i].id);
    }

    for (var j = 0; j < selectionTarget.length; j++) {
        newTargets.push(selectionTarget[j].id);
    }

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
    } else {
        console.log("Source and Target Selections:");
        console.log(newSources);
        console.log(newTargets);
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