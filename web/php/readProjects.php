<?php

/*
1. Projektordner lesen -> Projektliste
2. Projektliste lesen -> Prozessliste je Projektelement
3. Prozessliste lesen -> Levels je Prozesselement
4. Levels lesen -> BPMN Files je Levelelement
*/

$projectsPath = '../../projects/';
$projects = getNodes($projectsPath, 'project');

foreach($projects as $project) {
	if($project->data['nodetype'] == 'project') {

		$abstractionLevels = getNodes($project->data['path'], 'level');

		foreach($abstractionLevels as $abstractionLevel) {
			$project->addChild($abstractionLevel);
		}
	}
}

foreach($projects as $project) {
	foreach($project->children as $abstractionLevel) {
		if($abstractionLevel->data['nodetype'] == 'level') {

			$processes = getNodes($abstractionLevel->data['path'], 'process');

			foreach($processes as $process) {
				$abstractionLevel->addChild($process);
			}
		}
	}
}

foreach($projects as $project) {
	foreach($project->children as $abstractionLevel) {
		foreach($abstractionLevel->children as $process) {

			if($process->data['nodetype'] == 'process') {
				$model = getNodes($process->data['path'], 'model');

				foreach($model as $file) {
					$process->addChild($file);
				}
			}
		}
	}
}

echo json_encode($projects, JSON_PRETTY_PRINT);

function getNodes($path, $nodetype) {
	//echo "Provided Path for Nodetype " . $nodetype . ": " . $path . "<br>";
	$nodes = Array();

	$pathFiles = array_diff(scandir($path), array('.', '..'));

	foreach ($pathFiles as $file) {
		if(is_dir($path . $file)) {
			$node = new Node($file, $nodetype, $path . $file . '/');
			array_push($nodes, $node);
		} elseif (is_file($path . $file)) {
			$info = new SplFileInfo($file);
			if($info->getExtension() == 'bpmn') {
				$node = new Node($file, 'bpmn', $path . $file);
				array_push($nodes, $node);
			} elseif ($info->getExtension() == 'pcfg') {
				$node = new Node($file, 'pcfg', $path . $file);
				array_push($nodes, $node);
			} elseif ($info->getExtension() == 'corr') {
				$node = new Node($file, 'correspondences', $path . $file);
				array_push($nodes, $node);
			} else {
				//$node = new Node($file, 'file', $path);
				//array_push($nodes, $node);
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
	public $data = array('nodetype' => null, 'path' => null);
	public $children = array();

	function __construct($text, $nodetype, $path) {
		$this->text = $text;
		$this->data['nodetype'] = $nodetype;
		$this->data['path'] = $path;
		//echo "New Node: " . $text . " " . $nodetype . " " . $path . " <br>";
	}

	function addChild($childNode) {
		array_push($this->children, $childNode);
	}


}

?>