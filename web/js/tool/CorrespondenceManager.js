/**
 * Created by André Zensen on 21.06.2016.
 */
"use strict";

function CorrespondenceManager () {
    this.correspondenceList = [];
    this.association = {};
};

CorrespondenceManager.prototype.loadAssociation = function (filePath) {
    var assoFile = filePath.substr(0, filePath.lastIndexOf(".")) + ".json";
    console.log(assoFile);
    //$.get(assoFile, _this.parseAssociationFile, 'text');
/*    $.getJSON(filePath, function (data) {
        console.log("Success getJSON");
        console.log(data);
    });*/
    var _this = this;
    $.getJSON(assoFile, function(data) {
        console.log("Successfully loaded asso-JSON:");
        console.log(data);
        _this.setAssociation(data);
        })
            .error(function(xhr) {
                console.log(xhr);
                console.log(Object.keys(xhr));
            });
}

CorrespondenceManager.prototype.setAssociation = function (association) {
    this.association = association;
}

CorrespondenceManager.prototype.loadCorrespondences = function (filePath) {
    var corrFile = filePath.substr(0, filePath.lastIndexOf(".")) + ".corr";
    console.log(corrFile);
    //$.get(assoFile, _this.parseAssociationFile, 'text');
    /*    $.getJSON(filePath, function (data) {
     console.log("Success getJSON");
     console.log(data);
     });*/
    var _this = this;
    $.getJSON(corrFile, function(data) {
        console.log("Successfully loaded corr-JSON:");
        console.log(data);
        _this.setCorrespondences(data);
    })
        .error(function(xhr) {
            console.log(xhr);
            console.log(Object.keys(xhr));
        });
}

CorrespondenceManager.prototype.setCorrespondences = function (data) {
    this.correspondenceList = data;
}

CorrespondenceManager.prototype.addCorr = function (corr) {
    this.corrList.push(corr);
};

CorrespondenceManager.prototype.removeCorrespondence = function (corr) {
    var corrList = this.correspondenceList;

    for(var i = 0; i < corrList.length; i++) {
        if(corr == corrList[i]) {
            corrList.splice(i, 1);
        }
    }
};

CorrespondenceManager.prototype.removeElementFromCorr = function (elementID) {
    var corrToEdit = this.getCorr(elementID);
    var corrType = corrToEdit.corrType;

    if(corrType == "oneone" || corrType == "onezero" || corrType == "zeroone") {
        this.removeCorrespondence(corrToEdit);
        //TODO Transformation
    } else if (corrType == "manyone") {

    }
};

CorrespondenceManager.prototype.getCorr = function (elementID) {
    var corrList = this.correspondenceList;
    var corr;
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
    return corr = new Correspondence("not_found", "", "");
};

CorrespondenceManager.prototype.getCorrBySource = function (elementID) {
    var corrList = this.correspondenceList;
    var corr;
    for (var i = 0; i < corrList.length; i++) {
        corr = corrList[i];
        var corrType = corr.corrType;
        //var n = str1.localeCompare(str2);
        if(corrType == "oneone") {
            if(corr.source == elementID) {
                return corr;
            }
        } else if (corrType == "onezero") {
            if(corr.source == elementID) {
                return corr;
            }
        } else if (corrType == "zeroone") {
            continue;
        } else if (corrType == "onemany") {
            if(corr.source == elementID) {
                return corr;
            } else {
                continue;
            }
        } else if (corrType == "manyone") {
            for (var k = 0; k < corr.source.length; k++) {
                if(corr.source[k] == elementID) {
                    return corr;
                } else {
                    continue;
                }
            }
        }
    }
    return corr = new Correspondence("not_found", "", "");
};

CorrespondenceManager.prototype.getCorrByTarget = function (elementID) {
    var corrList = this.correspondenceList;
    var corr;
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
            } else {
                continue;
            }
        }
    }
    return corr = new Correspondence("not_found", "", "");
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
var Correspondence = function (corrType, source, target) {

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