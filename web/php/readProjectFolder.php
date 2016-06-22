<?php

/*
1. Projektordner lesen -> Projektliste
2. Projektliste lesen -> Prozessliste je Projektelement
3. Prozessliste lesen -> Levels je Prozesselement
4. Levels lesen -> BPMN Files je Levelelement
*/

//1.
$projectPath = '../../projects/';
$projectNodes = getNodes($projectPath, 'project');
//2.
foreach($projectNodes as $projectNode) {
	$processNodes = getNodes($projectPath . $projectNode->text . '/', 'process');
	
	foreach($processNodes as $processNode) {
		$projectNode->addChild($processNode);
	}
}
//3.
foreach($projectNodes as $project) {
	foreach($project->children as $process) {
		$path = $process->data['path'] . $process->text . '/';
		
		if($process->data['nodetype'] == 'process') {
			$childNodes = getNodes($path, 'level');
		
			foreach($childNodes as $childNode) {
				$process->addChild($childNode);
			}	
		}
	}
}
//4.
foreach($projectNodes as $project) {
	foreach($project->children as $process) {
		foreach($process->children as $level) {
			$path = $level->data['path'] . $level->text . '/';
			$childNodes = getNodes($path, 'bpmn');
			
			foreach($childNodes as $childNode) {
				$level->addChild($childNode);
			}
		}
	}
}
echo json_encode($projectNodes, JSON_PRETTY_PRINT);


function getNodes($path, $nodetype) {
	$nodes = Array();
	
	$pathFiles = array_diff(scandir($path), array('.', '..'));
	
	foreach ($pathFiles as $file) {
		if(is_dir($path . $file)) {
			$node = new Node($file, $nodetype, $path);
			array_push($nodes, $node);
		} elseif (is_file($path . $file)) {
			$info = new SplFileInfo($file);
			if($info->getExtension() == 'bpmn') {
				$node = new Node($file, 'bpmn', $path);
				array_push($nodes, $node);
			} else {
				$node = new Node($file, 'file', $path);
				array_push($nodes, $node);
			}
			

		}
	}
	
	return $nodes;
}

/*
	function Node(id, text, children, nodetype, path) {
	this.id = id;
	this.text = text;
	this.children = children;
	this.data = { nodetype, path };
	this.data.nodetype = nodetype;
	this.data.path = path;
	}
*/

class Node {
	public $text;
	public $children = array();
	public $data = array('nodetype' => null, 'path' => null);	
	
	function __construct($text, $nodetype, $path) {
		$this->text = $text;
		$this->data['nodetype'] = $nodetype;
		$this->data['path'] = $path;
	}
	
	function addChild($childNode) {
		array_push($this->children, $childNode);
	}
	

}	
			
/*function readDirectory ($path) {
    
$files = scandir($projectPath);
$files = array_diff(scandir($projectPath), array('.', '..'));
	
return $retval;
}*/

?>