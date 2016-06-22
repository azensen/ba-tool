<?php
	//input
	$projectName = $_POST['name'];
	//container for levels
	$levelsIn = $_POST['levels'];
	$levelsOut = Array();

	//create levels objects
	foreach($levelsIn as $currLevel) {
		$level = new Level($currLevel);
		array_push($levelsOut, $level);
	}
	
	$levelsJSON = json_encode($levels, JSON_PRETTY_PRINT);
	
	//write levels.json in proper path
	$projectPath = '../../projects' . '/' . $projectName;
	$levelsFile = 'levels.json';
	
	if (!file_exists($projectPath)) {
		mkdir($projectPath, 0777, true);
//		if(file_exists($projectPath . '/' . $levelsFile))
//			file_put_contents($projectPath . '/' . $levelsFile , ' ');
		file_put_contents($projectPath . '/' . $levelsFile, $levelsJSON, LOCK_EX);
		}
	
	}
	
	class Levels {
		public $name;
		
		function __construct($name) {
			$this->name = $name;
		}
	}	

?>