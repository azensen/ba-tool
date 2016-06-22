<?php

/*echo $projectName = $_POST['projectName'];
echo '<br>';
echo $processName = $_POST['processName'];
echo '<br>';
echo $levelName = $_POST['levelName'];
echo '<br>';
echo isset($_POST['prefix']);
echo '<br>';

echo $processPath = '../../projects' . '/' . $projectName . '/' . $processName . '/';
echo '<br>';
echo $levelPath = $processPath . $levelName . '/';
echo '<br>';
echo $_FILES['bpmnFile']['name'];*/

//projects root folder path
$rootPath = '../../projects/';

//collect data
$projectName = $_POST['projectName'];
$processName = $_POST['processName'];
$levelName = $_POST['levelName'];
//create process folder
$projectPath = $rootPath . $projectName . '/'; //'../../projects/'
$processPath = $projectPath . $processName . '/'; // '../../projects/processName/

	if (!file_exists($processPath)) {
		mkdir($processPath, 0777, true);
	}

//create level in process folder
$levelPath = $processPath . $levelName . '/'; // '../../projects/processName/levelName/

	if (!file_exists($levelPath)) {
		mkdir($levelPath, 0777, true);
	}

//check prefix; if prefix then add lower case level description as prefix of file name
$fileNameIn = $_FILES['bpmnFile']['name'];
$fileNameOut = "";
	if(isset($_POST['prefix'])) {
		$prefix = strtolower($levelName);
		$fileNameOut = $prefix . '_' . $fileNameIn;
	} else {
		$fileNameOut = $fileNameIn;
	}

//move temp upload file to projects/projectName/processName/levelName/ with desired name
$fileDestination = $levelPath . $fileNameOut;
if (move_uploaded_file($_FILES['bpmnFile']['tmp_name'], $fileDestination)) {
    echo "File successfully uploaded.";
} else {
    echo "File upload failed.";
}
?>