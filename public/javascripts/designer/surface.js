/**
 * @author eugenio
 */

function Surface(node, config) {
	this.zoom = config.zoom;
	this.objects = []; // This is the scene graph, it contains every object in this scene
	this.width = node.getAttribute('width');
	this.height = node.getAttribute('height');
	this.space = node.getContext('2d');
	this.origin = { x: 0, y: 0 }
	this.renderTransform = Matrix.I(3); // Camera transform
	
	this.setOctant(0);
}

Surface.prototype.setOrigin = function(x, y) {
	this.origin.x = x;
	this.origin.y = y;
	
	this.render();
}

/* This method returns a projection of the 2D point passed as argument to the 3D space */

Surface.prototype.getPoint = function(point) {
	var pointTransform = this.renderTransform.inverse();
	
	var realPoint = Vector.create([point.e(1) - this.origin.x, point.e(2) - this.origin.y, point.e(3)]);
	
	var normalizedPoint = Vector.create([realPoint.e(1) / this.width, realPoint.e(2) / this.height]);

	var nearPoint = Vector.create([normalizedPoint.e(1), normalizedPoint.e(2), -1]);
	var farPoint = Vector.create([normalizedPoint.e(1), normalizedPoint.e(2), 1]);

	nearPoint = pointTransform.multiply(nearPoint);
	farPoint = pointTransform.multiply(farPoint);
	
	var direction = farPoint.subtract(nearPoint);
	var eyeLine = Line.create(nearPoint, direction);
	
	var surfacePoint = Plane.XY.intersectionWith(eyeLine);
		
	surfacePoint = Vector.create([surfacePoint.e(1) * this.width, surfacePoint.e(2) * this.height], 0);
	
	return surfacePoint.multiply(1 / this.zoom);
}

Surface.prototype.getOctantPoint = function(point) {
	var alpha = this.octant * 90 * Math.PI / 180;
	
	return Vector.create([Math.round(Math.cos(alpha) * point.e(1) - Math.sin(alpha) * point.e(2)),
						  Math.round(Math.sin(alpha) * point.e(1) + Math.cos(alpha) * point.e(2)), 
						  point.e(3)
	]);
	
}

Surface.prototype.setOctant = function(octant) {
	octant = octant % 4;
		
	var alpha = Math.asin(Math.tan(30 * Math.PI / 180));
	var beta = (45 + octant * 90) * Math.PI / 180;
	
	this.octant = octant;
	
	this.renderTransform = Matrix.RotationX(alpha).multiply(Matrix.RotationZ(beta));

	this.render();
}

Surface.prototype.setZoom = function(zoom) {
	if(zoom < 1)
		zoom = 1;
		
	this.zoom = zoom;
	
	this.render();
}

Surface.prototype.addObject = function(object) {
	this.objects.push(object);
	
	var self = this;
	
	object.onchanged = function() {
		self.render();
	}
	
	this.render();
}

Surface.prototype.removeObject = function(object) {
	this.objects.splice($.inArray(object, this.objects), 1);
	
	object.onchanged = null;
	
	this.render();
}

Surface.prototype.sortObjects = function() {
	var self = this;

	this.objects.sort(function(a, b) {
		if(!a.sortable && b.sortable)
			return -1;
		else if(!b.sortable && a.sortable)
			return 1;
		else if(!a.sortable && !b.sortable)
			return 0;
			
		var bboxA = a.getOctantBoundingBox(self);
		var bboxB = b.getOctantBoundingBox(self);
		
		if(bboxA.min.e(3) < bboxB.min.e(3))
			return -1;
			
		if(bboxA.min.e(3) > bboxB.min.e(3))
			return 1;
			
		if(bboxA.min.e(1) >= bboxB.max.e(1) || bboxA.min.e(2) >= bboxB.max.e(2))
			return -1;
		
		return 1;
	});			
}

Surface.prototype.render = function(){
	this.space.clearRect(0, 0, this.width, this.height);
	
	this.space.save();
	
	this.space.translate(this.origin.x, this.height - this.origin.y);

	for (var i = 0; i < this.objects.length; i++) 
		this.objects[i].sortPolygons(this);

	this.sortObjects();

	for (var i = 0; i < this.objects.length; i++) 
		this.objects[i].render(this);
		
	this.space.restore();
}

Surface.prototype.getObjectsAt = function(point) {
	var objects = [];
	
	for (var i = 0; i < this.objects.length; i++) {
		var objectBoundingBox = this.objects[i].getBoundingBox();
		
		if (point.e(1) > objectBoundingBox.min.e(1) && point.e(1) < objectBoundingBox.max.e(1) &&
		point.e(2) > objectBoundingBox.min.e(2) &&
		point.e(2) < objectBoundingBox.max.e(2)) {
			objects.push(this.objects[i]);
		}
	}
	
	return objects;
}

Surface.prototype.getCollidingObjects = function(boundingBox) {
	var objects = [];

	for (var i = 0; i < this.objects.length; i++) {
		var objectBoundingBox = this.objects[i].getBoundingBox();
		
		if (boundingBox.max.e(1) > objectBoundingBox.min.e(1) && boundingBox.min.e(1) < objectBoundingBox.max.e(1) &&
		boundingBox.max.e(2) > objectBoundingBox.min.e(2) &&
		boundingBox.min.e(2) < objectBoundingBox.max.e(2)) {
			objects.push(this.objects[i]);
		}
	}

	return objects;
}
