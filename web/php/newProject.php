<?php
	/*
	$projectName = $_POST['name'];
	$levels = $_POST['levels'];
	echo $projectName . '<br>';
	foreach($levels as $currLevel) {
		echo $currLevel . '<br>';
	}
	echo dirname(__DIR__) . '<br>';
	$projectPath = '../../projects' . '/' . $projectName;
	echo $projectPath;
	$levelsFile = 'levels.cfg';
	
	if (!file_exists($projectPath)) {
		echo 'OKAY';
		
		mkdir($projectPath, 0777, true);
		
		if(file_exists($projectPath . '/' . $levelsFile))
			file_put_contents($projectPath . '/' . $levelsFile , ' ');
		
		foreach($levels as $level) {
			file_put_contents($projectPath . '/' . $levelsFile, $level . "\n", FILE_APPEND | LOCK_EX);
		}
	
	}
	*/

	//input
	$projectName = $_POST['name'];
	//container for levels
	$levelNames = $_POST['levels'];
	$levelsOut = Array();

	//create levels objects
	foreach($levelNames as $currLevel) {
		$level = new Level($currLevel);
		array_push($levelsOut, $level);
	}
	
	$levelsJSON = json_encode($levelsOut, JSON_PRETTY_PRINT);
	
	//write levels.json in proper path
	$projectPath = '../../projects' . '/' . $projectName;
	$levelsFile = 'project.pcfg';
	
	if (!file_exists($projectPath)) {
		mkdir($projectPath, 0777, true);
	}
	file_put_contents($projectPath . '/' . $levelsFile, $levelsJSON, LOCK_EX);

	//create levels folders
	foreach($levelNames as $currLevel) {
        $levelPath = $projectPath . '/' . $currLevel . '/';
        if (!file_exists($levelPath)) {
            mkdir($levelPath, 0777, true);
        }
	}

	echo "Project " . $projectName . " created successfully.";
	
/* //create level folders
	foreach($levelNames as $levelName) {
		$levelPath = $projectPath . '/' . $levelName;
		if (!file_exists($levelPath) || !is_dir($levelPath)) {
			mkdir($levelPath, 0777, true);
		}			
	}
*/
	
	
	class Level {
		public $name;
		
		function __construct($name) {
			$this->name = $name;
		}
	}	

?>