Matrix.prototype.setColumn = function(index, column) {
	for(var i = 0; i < this.rows(); i++)
		this.elements[i][index - 1] = column.e(i + 1);
}

Matrix.prototype.setRow = function(index, row) {
	for(var i = 0; i < this.cols(); i++)
		this.elements[index][i - 1] = row.e(i + 1);
}

Vector.prototype.sum = function() {
	var sum = 0;
	
	for(var i = 0; i < this.elements.length; i++)
		sum += this.elements[i];
		
	return sum;
}
