<?php

//projects folder root
$projectsFolder = "../../projects/";
//get variables from POST
$project = $_POST['project'];
$process = $_POST['process'];
$in_level = $_POST['in_level'];
$out_level = $_POST['out_level'];
$model = $_POST['model'];

//flags
$initCorr = isset($_POST['initCorr']);
$prefix = isset($_POST['prefix']);

//path assembly
$projectPath = $projectsFolder . $project . '/';
$processPath_in = $projectPath . $in_level . '/' . $process . '/';
$processPath_out = $projectPath . $out_level . '/' . $process . '/';

$modelPath_in = $processPath_in . $model;
$modelPath_out;
$modelPrefix_in = strtolower($in_level) . '_';
$modelPrefix_out = strtolower($out_level) . '_';

//for association
$modelName_in = $model;
$modelName_out = $model;

//prefix handling; if true will replace level_in with level_out in model name
if($prefix) {
	if(strpos($model, $modelPrefix_in) !== false) {
		$modelPath_out = $processPath_out . str_replace($modelPrefix_in, $modelPrefix_out, $model);
		$modelName_out = str_replace($modelPrefix_in, $modelPrefix_out, $model);
	} else {
		$modelPath_out = $processPath_out . $modelPrefix_out . $model;
	}
} else {
	$modelPath_out = $processPath_out . $model;
}

//create correspondence file
$bpmnXML = readBPMN($modelPath_in);
$correspondenceJSON = createCorrespondences($bpmnXML);
saveCorrespondences($processPath_in, $correspondenceJSON, $model);
//copy model
saveModelOut($modelPath_in, $modelPath_out, $processPath_out);
//create association file
$associationJSON = createAssociation($modelName_in, $modelName_out, $modelPath_in, $modelPath_out);
saveAssociation($associationJSON, $processPath_in, $model);



//reads the .bpmn file and returns a simpleXML file with the bpmn namespace registered or xpath access
function readBPMN($modelPath_in) {

	$bpmnXML = null;
	if (file_exists($modelPath_in)) {
		$bpmnXML = simplexml_load_file($modelPath_in);
		$bpmnXML->registerXPathNamespace('bpmn', 'http://www.omg.org/spec/BPMN/20100524/MODEL');
	}
	return $bpmnXML;
}

//creates the correspondences and returns a JSON encoding to save as a file
function createCorrespondences($bpmnXML) {
	$elementNames = array("task", "userTask", "sendTask", "receiveTask", "manualTask", "businessRuleTask",
		"serviceTask", "scriptTask", "subProcess", "startEvent", "endEvent", "exclusiveGateway");
	$corrList = Array();
	$prefix = "//bpmn:";
	foreach($elementNames as $elementName)
		foreach ($bpmnXML->xpath($prefix . $elementName) as $element) {
			$elemId = (string) $element['id'];
			$corr = new Corr("oneone", $elemId, $elemId);
			array_push($corrList, $corr);
		}
	$corrJSON = json_encode($corrList, JSON_PRETTY_PRINT);
	return $corrJSON;
}

//saves the .corr file to the process folder where the in_model resides in
function saveCorrespondences($processPath_in, $corrModelJSON, $modelName) {
	$modelName = str_replace(".bpmn", ".corr", $modelName);
	file_put_contents($processPath_in . $modelName, $corrModelJSON, LOCK_EX);
}

//copies the in_model to the out_model path, i.e. projects/Project/out_level/Process/model.bpmn
function saveModelOut($modelPath_in, $modelPath_out, $processPath_out) {
	if (!file_exists($processPath_out)) {
		mkdir($processPath_out, 0777, true);
	}
	copy($modelPath_in, $modelPath_out);
}

//creates an association JSON encoding with the file paths of the in_model and out_model
function createAssociation($modelName_in, $modelName_out, $modelPath_in, $modelPath_out) {
	$association = new Association($modelName_in, $modelName_out, $modelPath_in, $modelPath_out);
	$assoJSON = json_encode($association, JSON_PRETTY_PRINT);
	return $assoJSON;
}

//saves the association file in the in_model path
function saveAssociation($associationJSON, $processPath_in, $model) {
	$assoFileName = str_replace(".bpmn", ".asso", $model);
	$assoFilePath = $processPath_in . $assoFileName;
	$assoJSON = $associationJSON;
	file_put_contents($assoFilePath, $assoJSON);
}

class Corr {
	public $corrType = "";
	public $source = "";
	public $target = "";
			
	function __construct($corrType, $source, $target) {
		$this->corrType = $corrType;
		$this->source = $source;
		$this->target = $target;
	}
}

class Association {
	public $sourceModel = "";
	public $targetModel = "";
	public $sourceFile = "";
	public $targetFile = "";

	function __construct($sourceName, $targetName, $sourceFilePath, $targetFilePath) {
		$this->sourceModel = $sourceName;
		$this->targetModel = $targetName;
		$this->sourceFile = $sourceFilePath;
		$this->targetFile = $targetFilePath;
	}
}


?>