/**
 * @author Eugenio Depalo
 */
Grid.prototype = new Shape;
Grid.prototype.constructor = Grid;

function Grid(properties){
    this.lines = properties.lines;
    this.unit = properties.unit;

	properties.sortable = false;
	
    Shape.apply(this, arguments);
}

Grid.prototype.updatePolygons = function(){
    var gridStyle = {
        stroke: "#ccc"
    };
    
    var origin = this.unit * (this.lines - 1) / 2;
    
    for (var i = 0; i < this.lines; i++) {
        this.polygons.push(new Polygon([Vector.create([i * this.unit - origin, -origin, 0]),
										Vector.create([i * this.unit - origin, origin, 0])], gridStyle));
										
        this.polygons.push(new Polygon([Vector.create([-origin, i * this.unit - origin, 0]),
										Vector.create([origin, i * this.unit - origin, 0])], gridStyle));
    }
}
