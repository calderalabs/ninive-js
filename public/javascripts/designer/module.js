/**
 * @author Eugenio Depalo
 */

Module.prototype = new Shape;
Module.prototype.constructor = Module;

function Module(properties) {
	this.width = parseInt(properties.width);
	this.height = parseInt(properties.height);
	this.depth = parseInt(properties.depth);
	this.material = properties.material;
	
	Shape.apply(this, arguments);
}

Module.prototype.updatePolygons = function() {
	var sideStyle = { fill: this.material, stroke: "black" };

	// Bottom side
	this.polygons.push(new Polygon([
		Vector.create([-this.width / 2, -this.depth / 2, -this.height / 2]),
		Vector.create([this.width / 2, -this.depth / 2, -this.height / 2]),
		Vector.create([this.width / 2, this.depth / 2, -this.height / 2]),
		Vector.create([-this.width / 2, this.depth / 2, -this.height / 2])
	], sideStyle));
	
	// Back side
	this.polygons.push(new Polygon([
		Vector.create([-this.width / 2, this.depth / 2, -this.height / 2]),
		Vector.create([this.width / 2, this.depth / 2, -this.height / 2]),
		Vector.create([this.width / 2, this.depth / 2, this.height / 2]),
		Vector.create([-this.width / 2, this.depth / 2, this.height / 2])
	], sideStyle));
	
	// Right side
	this.polygons.push(new Polygon([
		Vector.create([-this.width / 2, -this.depth / 2, -this.height / 2]),
		Vector.create([-this.width / 2, this.depth / 2, -this.height / 2]),
		Vector.create([-this.width / 2, this.depth / 2, this.height / 2]),
		Vector.create([-this.width / 2, -this.depth / 2, this.height / 2])
	], sideStyle));
	
	// Left side
	this.polygons.push(new Polygon([
		Vector.create([this.width / 2, -this.depth / 2, -this.height / 2]),
		Vector.create([this.width / 2, this.depth / 2, -this.height / 2]),
		Vector.create([this.width / 2, this.depth / 2, this.height / 2]),
		Vector.create([this.width / 2, -this.depth / 2, this.height / 2])
	], sideStyle));
	
	// Front side
	this.polygons.push(new Polygon([
		Vector.create([-this.width / 2, -this.depth / 2, -this.height / 2]),
		Vector.create([this.width / 2, -this.depth / 2, -this.height / 2]),
		Vector.create([this.width / 2, -this.depth / 2, this.height / 2]),
		Vector.create([-this.width / 2, -this.depth / 2, this.height / 2])
	], sideStyle));
}
