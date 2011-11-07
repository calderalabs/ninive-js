/**
 * @author Eugenio Depalo
 */

var previewModule = null;
var stampModule = null;
var compositionSurface = null;
var previewSurface = null;
var compositionGrid = null;

var mouseX = 0;
var mouseY = 0;

var dragging = false;

var onPickToolbarClick = function(event) {
	compositionSurface.removeObject(stampModule);
	$("#composition .toolbar .actions input").unbind('.toolbar');
}

function onDragMouseDown(event) {
	dragging = true;
	
	mouseX = event.clientX;
	mouseY = event.clientY;
}

function onDragMouseMove(event) {
	if (dragging) {
		compositionSurface.setOrigin(compositionSurface.origin.x += event.clientX - mouseX, compositionSurface.origin.y -= event.clientY - mouseY);
		
		mouseX = event.clientX;
		mouseY = event.clientY;
	}
}

function onDragMouseUp(event) {
	dragging = false;
}

function onPickMouseClick(event) {
	stampModule.clone(compositionSurface);
}

function getCompositionPoint(point) {
	var layerX = point.e(1) - $("#composition-surface").offset().left;
	var layerY = compositionSurface.height - (point.e(2) - $("#composition-surface").offset().top + $(document).scrollTop());

	var layerPoint = Vector.create([layerX, layerY]);
	
	return compositionSurface.getPoint(layerPoint);
}

function onDeleteMouseClick(event) {
	var mousePosition = getCompositionPoint(Vector.create([event.clientX, event.clientY]));
	
	var objects = compositionSurface.getObjectsAt(mousePosition);
	
	objects.splice($.inArray(compositionGrid, objects), 1);
	
	for(var i = 0; i < objects.length; i++)
		compositionSurface.removeObject(objects[i]);
}

function onPickMouseMove(event) {
	var mousePosition = getCompositionPoint(Vector.create([event.clientX, event.clientY]));

	var snappedPosition = Vector.create([
		mousePosition.e(1) - (mousePosition.e(1) % compositionGrid.unit) - ((stampModule.width / 2) - (compositionGrid.unit / 2)) % compositionGrid.unit,
		mousePosition.e(2) - (mousePosition.e(2) % compositionGrid.unit) - ((stampModule.depth / 2) - (compositionGrid.unit / 2)) % compositionGrid.unit,
		0
	]);

	var oldBoundingBox = stampModule.getBoundingBox();
		
	// Check collisions with other objects
	var newBoundingBox = {
		min: snappedPosition.subtract(oldBoundingBox.max.subtract(oldBoundingBox.min).multiply(1/2)),
		max: snappedPosition.add(oldBoundingBox.max.subtract(oldBoundingBox.min).multiply(1/2))
	}

	var collidingObjects = compositionSurface.getCollidingObjects(newBoundingBox);

	var layerZ = 0;

	collidingObjects.splice($.inArray(stampModule, collidingObjects), 1);
	
	for(var i = 0; i < collidingObjects.length; i++)
		if(collidingObjects[i].getBoundingBox().max.e(3) > layerZ)
			layerZ = collidingObjects[i].getBoundingBox().max.e(3);

	snappedPosition.elements[2] = (stampModule.height / 2) + layerZ;

	var currentTransform = stampModule.getTransform();
	
	currentTransform.setColumn(4, snappedPosition);

	stampModule.setTransform(currentTransform);
}

$(document).ready(function(){
    $('#properties input').each(function(){
        $(this).click(function(){
            var property = $(this);
			
            previewModule.setProperty(property.attr("name"), property.val());
			stampModule.setProperty(property.attr("name"), property.val());
        });
    });
    
    var properties = {
        width: $('#properties input:radio[name=width]:checked').val(),
        height: $('#properties input:radio[name=height]:checked').val(),
        depth: $('#properties input:radio[name=depth]:checked').val(),
        material: $('#properties input:radio[name=material]:checked').val()
    };
    
    compositionSurface = new Surface(document.getElementById("composition-surface"), {
		zoom: 2
	});
	compositionSurface.setOrigin(compositionSurface.width / 2, compositionSurface.height / 2);
	
    compositionGrid = new Grid({
        lines: 30,
        unit: 10
    });
	compositionSurface.addObject(compositionGrid);
	
    previewSurface = new Surface(document.getElementById("preview-surface"), {
		zoom: 2
	});
	previewSurface.setOrigin(previewSurface.width / 2, previewSurface.height / 2);
	
    previewModule = new Module(properties);
	stampModule = new Module(properties);
	
    previewSurface.addObject(previewModule);
	
    $("#preview-surface").click(function(event){
        previewSurface.setZoom(previewSurface.zoom + 1);
    });
    
    $("#preview-surface").rightClick(function(event){
        previewSurface.setZoom(previewSurface.zoom - 1);
    });
	
	$("#composition .toolbar .actions input").click( function() {
		$("#composition-surface").unbind('.toolbar');
	});
	
	$("#composition .toolbar input[name=zoomIn]").click( function() {
       compositionSurface.setZoom(compositionSurface.zoom + 1);
	});
	
	$("#composition .toolbar input[name=zoomOut]").click( function() {
       compositionSurface.setZoom(compositionSurface.zoom - 1);
	});
	
	$("#composition .toolbar input[name=rotateRight]").click( function() {
		compositionSurface.setOctant(compositionSurface.octant + 1);
	});
	
	$("#composition .toolbar input[name=rotateLeft]").click( function() {
		compositionSurface.setOctant(compositionSurface.octant - 1);
	});
	
	$("#composition .toolbar .actions input[name=pick]").click( function() {
		compositionSurface.addObject(stampModule);

		$("#composition-surface").bind('mousemove.toolbar', onPickMouseMove);
		$("#composition-surface").bind('click.toolbar', onPickMouseClick);
		
		$("#composition .toolbar .actions input[name!=pick]").bind('click.toolbar', onPickToolbarClick);
	});
	
	$("#composition .toolbar .actions input[name=drag]").click( function() {
		$("#composition-surface").bind('mouseup.toolbar', onDragMouseUp);
		$("#composition-surface").bind('mousedown.toolbar', onDragMouseDown);
		$("#composition-surface").bind('mousemove.toolbar', onDragMouseMove);
	});
	
	$("#composition .toolbar .actions input[name=delete]").click( function() {
		$("#composition-surface").bind('click.toolbar', onDeleteMouseClick);
	});
	
	$("#composition .toolbar .actions input[name=pick]").trigger('click');

	$("#properties").tabs();
});
