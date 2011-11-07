/**
 * @author Eugenio Depalo
 */

function Polygon(points, style) {
	this.points = points;
	this.stroke = style.stroke ? style.stroke : 'black';
	this.fill = style.fill ? style.fill : 'white';
}

Polygon.prototype.getOctantPolygon = function(surface) {
	var point = surface.getOctantPoint(this.points[0]);
							   
	var minX = point.e(1);
	var minY = point.e(2);
	var maxX = point.e(1);
	var maxY = point.e(2);
	var minZ = point.e(3);
	var maxZ = point.e(3);
	
	for (var i = 0; i < this.points.length; i++) {
		point = surface.getOctantPoint(this.points[i]);
		
		if(point.e(3) < minZ)
			minZ = point.e(3);
		if(point.e(3) > maxZ)
			maxZ = point.e(3);
			
		if (point.e(1) < minX) 
			minX = point.e(1);
		if (point.e(2) < minY)
			minY = point.e(2);
			
		if (point.e(1) > maxX) 
			maxX = point.e(1);
		if (point.e(2) > maxY)
			maxY = point.e(2);
	}

	return {
		min: Vector.create([minX, minY, minZ]),
		max: Vector.create([maxX, maxY, maxZ])
	}
}

function Shape(properties) {
	if(arguments.length < 1)
		return;
	
	this.transform = Matrix.I(4);
	
	if(properties.sortable != null)
		this.sortable = properties.sortable;
	else
		this.sortable = true;
		
	this.polygons = [];
	this.updatePolygons();
}

Shape.prototype.setProperty = function(name, value) {
	this[name] = value;
	
	this.polygons = [];
	this.updatePolygons();
	
	if(this.onchanged)
		this.onchanged(this);
}

Shape.prototype.getRotation = function() {
	return this.transform.minor(1, 1, 3, 3);
}

Shape.prototype.getPosition = function() {
	var position = this.transform.col(4);

	return Vector.create([position.e(1), position.e(2), position.e(3)]);
}

Shape.prototype.getTransform = function() {
	return this.transform.dup();
}

Shape.prototype.setTransform = function(transform) {
	this.transform = transform;

	if(this.onchanged)
		this.onchanged(this);
}

Shape.prototype.getBoundingBox = function() {
	var position = this.getPosition();

	var point = this.polygons[0].points[0].add(position);
							   
	var minX = point.e(1);
	var minY = point.e(2);
	var maxX = point.e(1);
	var maxY = point.e(2);
	var minZ = point.e(3);
	var maxZ = point.e(3);

	for(var i = 0; i < this.polygons.length; i++)
		for(var j = 0; j < this.polygons[i].points.length; j++) {
			point = this.polygons[i].points[j].add(position);
			
			if(point.e(3) < minZ)
				minZ = point.e(3);
			if(point.e(3) > maxZ)
				maxZ = point.e(3);
				
			if (point.e(1) < minX) 
				minX = point.e(1);
			if (point.e(2) < minY)
				minY = point.e(2);

			if (point.e(1) > maxX)
				maxX = point.e(1);
			if (point.e(2) > maxY)
				maxY = point.e(2);
		}

	return {
		min: Vector.create([minX, minY, minZ]),
		max: Vector.create([maxX, maxY, maxZ])
	}
}

Shape.prototype.getOctantBoundingBox = function(surface) {
	var boundingBox = this.getBoundingBox();

	var origin = surface.getOctantPoint(boundingBox.min);
	var bounds = surface.getOctantPoint(boundingBox.max);
	
	var min = Vector.create([0, 0, origin.e(3)]);
	var max = Vector.create([0, 0, bounds.e(3)]);
	
	if (origin.e(1) > bounds.e(1)) {
		min.elements[0] = bounds.e(1);
		max.elements[0] = origin.e(1);
	}
	else {
		min.elements[0] = origin.e(1);
		max.elements[0] = bounds.e(1);
	}
	
	if (origin.e(2) > bounds.e(2)) {
		min.elements[1] = bounds.e(2);
		max.elements[1] = origin.e(2);
	}
	else {
		min.elements[1] = origin.e(2);
		max.elements[1] = bounds.e(2);
	}
	
	return {
		min: min,
		max: max
	}
}

Shape.prototype.render = function(surface) {
	var rotation = this.getRotation();
	var position = this.getPosition();
	
	for (var i = 0; i < this.polygons.length; i++) {
		surface.space.save();
		
		surface.space.fillStyle = this.polygons[i].fill;
		surface.space.strokeStyle = this.polygons[i].stroke;

		surface.space.beginPath();
		
		var point = this.polygons[i].points[0].add(position);
		point.elements[2] = -point.elements[2];
		
		var renderedPoint = surface.renderTransform.multiply(rotation).multiply(point).multiply(surface.zoom);
		
		surface.space.moveTo(renderedPoint.e(1), -renderedPoint.e(2));
		
		for (var j = 1; j < this.polygons[i].points.length; j++) {
			point = this.polygons[i].points[j].add(position);
			point.elements[2] = -point.elements[2];
			
			renderedPoint = surface.renderTransform.multiply(rotation).multiply(point).multiply(surface.zoom);
			
			surface.space.lineTo(renderedPoint.e(1), -renderedPoint.e(2));
		}
		
		surface.space.closePath();
		
		surface.space.fill();
		surface.space.stroke();
			
		surface.space.restore();
	}
}

Shape.prototype.updatePolygons = function() {
	// Abstract method, must be implemented by subclass
}

Shape.prototype.sortPolygons = function(surface) {
	this.polygons.sort(function(a, b) {
		var bboxA = a.getOctantPolygon(surface);
		var bboxB = b.getOctantPolygon(surface);	

		if(bboxA.min.e(3) > bboxB.min.e(3))
			return -1;

		if(bboxA.min.e(3) < bboxB.min.e(3))
			return 1;

		if (bboxA.max.e(1) > bboxB.min.e(1) && bboxA.min.e(1) < bboxB.max.e(1) &&
		bboxA.max.e(2) > bboxB.min.e(2) &&
		bboxA.min.e(2) < bboxB.max.e(2)) {
			return 0;
		}
		
		if(bboxA.min.e(1) >= bboxB.max.e(1) || bboxA.min.e(2) >= bboxB.max.e(2))
			return -1;
		
		return 1;
	});	
}

Shape.prototype.clone = function(surface) {
	var newShape = $.extend({}, this);
	surface.addObject(newShape);
	
	return newShape;
}
