<?php

//input
$fileName = $_POST['fileName'];
$originalFileName = $_POST['originalFileName'];
$selectedLevel = $_POST['levelName'];
$filePathIn = $_POST['filePathIn']; // path to project/selected_level/process/
$filePathOut = $_POST['filePathOut']; //is equal to project/process/desired_level/
$corrModelName = $_POST['corrModelName']; //modelname.corr
$corrPath = $_POST['corrPath']; //is equal to project/process/level/ path where original model resides in
$processName = $_POST['processName'];
//$initCorr = $_POST['initCorr'];

if(isset($_POST['initCorr'])) {
	$corrModelJSON = buildModel($filePathIn);
	saveModel($corrPath, $corrModelJSON, $corrModelName);
}
if (!file_exists($filePathOut)) {
	mkdir($filePathOut, 0777, true);
}

if(isset($_POST['prefix'])) {
	$filePathOut = $filePathOut . "/" . strtolower($selectedLevel) . '_' . $originalFileName;
} else {
	$filePathOut = $filePathOut . "/" . $originalFileName;
}

if(!copy($filePathIn, $filePathOut)) {
	return "Model successfully cloned.";
} else {
	return "Model could not be cloned.";
}

function buildModel ($filePathIn) {
	if (file_exists($filePathIn)) {
		$bpmnXML = simplexml_load_file($filePathIn);
		$bpmnXML->registerXPathNamespace('bpmn', 'http://www.omg.org/spec/BPMN/20100524/MODEL');

		$elementNames = array("task", "userTask", "sendTask", "receiveTask", "manualTask", "businessRuleTask", "serviceTask", "scriptTask", "subProcess", "startEvent", "endEvent", "exclusiveGateway");
		$corrList = Array();
		$prefix = "//bpmn:";
		foreach($elementNames as $elementName)
			foreach ($bpmnXML->xpath($prefix . $elementName) as $element) {
				$elemId = (string) $element['id'];
				$corr = new Corr("oneone", $elemId, $elemId);
				array_push($corrList, $corr);
			}

		return json_encode($corrList, JSON_PRETTY_PRINT);
		
	} else {
		return 'Error';
	}
}

function saveModel($corrPath, $corrModelJSON, $modelName) {
	if (!file_exists($corrPath)) {
		mkdir($corrPath, 0777, true);
	}
	file_put_contents($corrPath . $modelName, $corrModelJSON, LOCK_EX);
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

?>