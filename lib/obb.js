THREE.Matrix3.prototype.getColRow = function(col, row) {
    return this.elements[col*3+row];
}
THREE.Matrix3.prototype.setColRow = function(col, row, val) {
    this.elements[col*3+row] = val;
}
//oriented bounding box 方向包围盒
function mqOBB(points) {
	var self = this;
	// 协方差
	var covariance =(function(){
		var data1 = new Array(3).fill(0);
	    var data2 = new Array(3).fill(0);
		return function (points, avg, i1, i2) {
		    data2[0] = avg.x;
		    data2[1] = avg.y;
		    data2[2] = avg.z;
		    var cov = 0;
		    for(var i = 0, il = points.length; i < il; i++) {
		        data1[0] = points[i].x;
		        data1[1] = points[i].y;
		        data1[2] = points[i].z;
		        cov += (data1[i1]-data2[i1])*(data1[i2]-data2[i2]);
		    }
		    return cov/(points.length-1);
		}
	})();

	// 协方差矩阵
	function covarianceMatrix3(points, avg) {
	    var matrix = new THREE.Matrix3();
	    for(var c = 0; c < 3; c++) {
	        for(var r = c; r < 3; r++) {
	            var cov = covariance(points, avg, c, r);
	            matrix.setColRow(c, r, cov);
	            matrix.setColRow(r, c, cov);
	        }
	    }
	    return matrix;
	}

	// 雅可比迭代法求出特征向量
	function jacobiSolver(matrix){
	    var eVectors = new Array(3).fill(0).map(e=>new THREE.Vector3()); 
	    var eps1=0.00001;
	    var eps2=0.00001;
	    var eps3=0.00001;
	    
	    var INV_SQRT_TWO = 1.0 / Math.sqrt(2.0);
	    var p,q,spq;
	    var cosa = 0, sina=0;  // cos(alpha) and sin(alpha)
	    var temp;
	    var s1=0.0;    // sums of squares of diagonal
	    var s2;          // elements
	    
	    var flag=true;  // determine whether to iterate again
	    var iteration=0;   // iteration counter
	    
	    var data=new Array(3).fill(0.0);// new float[3];
	    var t=new THREE.Matrix3();// To store the product of the rotation
									// matrices.
	    do {
	    	console.log("iteration", iteration);
	        iteration++;
	        for(var i = 0; i < 2; i++) {
	            for(var j = i+1; j < 3; j++) {
	                if(Math.abs(matrix.getColRow(j, i))<eps1) {
	                    matrix.setColRow(j, i, 0.0);
	                } else {
	                    q = Math.abs(matrix.getColRow(i, i)-matrix.getColRow(j, j));
	                    if(q > eps2){
	                        p = (2.0*matrix.getColRow(j, i)*q)/(matrix.getColRow(i, i)-matrix.getColRow(j, j));
	                        spq = Math.sqrt(p*p+q*q);
	                        cosa = Math.sqrt((1.0+q/spq)/2.0);
	                        sina = p/(2.0*cosa*spq);
	                    } else {
	                        sina = cosa = INV_SQRT_TWO;
	                    }
	                    for(var k = 0; k < 3; k++) {
	                        temp = t.getColRow(i, k);
	                        t.setColRow(i, k, (temp*cosa + t.getColRow(j, k)*sina));
	                        t.setColRow(j, k, (temp*sina - t.getColRow(j, k)*cosa));
	                    }
	                    for(var k = i; k < 3; k++) {
	                        if(k > j){
	                            temp=matrix.getColRow(k, i);
	                            matrix.setColRow(k, i, (cosa*temp + sina*matrix.getColRow(k, j)));
	                            matrix.setColRow(k, j, (sina*temp - cosa*matrix.getColRow(k, j)));
	                        } else {
	                            data[k]=matrix.getColRow(k, i);
	                            matrix.setColRow(k, i, (cosa*data[k] + sina*matrix.getColRow(j, k)));
	                            
	                            if(k == j) {
	                            	matrix.setColRow(k, j, (sina*data[k] - cosa*matrix.getColRow(k, j)));
	                            }
	                        }
	                    }
	                    data[j] = sina * data[i] - cosa * data[j];
	                    
	                    for(var k = 0; k <= j; k++) {
	                        if(k <= i) {
	                            temp = matrix.getColRow(i, k);
	                            matrix.setColRow(i, k, (cosa*temp+sina*matrix.getColRow(j, k)));
	                            matrix.setColRow(j, k, (sina*temp-cosa*matrix.getColRow(j, k)));
	                        } else {
	                            matrix.setColRow(j, k, (sina*data[k] - cosa*matrix.getColRow(j, k)));
	                        }
	                    }
	                }
	            }
	        }
	        s2=0.0;
	        for(var i=0; i<3; i++) {
	            s2 += Math.pow(matrix.getColRow(i, i), 2);
	        }
	        
	        var isZero = Math.abs(s2) < 1.e-5;
	        if(isZero || Math.abs(1-s1/s2) < eps3) flag = false;
	        else s1 = s2;
	    } while(flag);
	    
	    var el = t.elements;
	    eVectors[0].set(el[0], el[1], el[2]);
	    eVectors[1].set(el[3], el[4], el[5]);
	    eVectors[2].set(el[6], el[7], el[8]);
	    
	    var cross = eVectors[0].clone().cross(eVectors[1]);  
	    if(cross.dot(eVectors[2])<0.0)  {
	    	eVectors[2].negate();
	    }
	    return eVectors;
	}

	// 施密特正交化
	function schmidtOrthogonal(v0, v1, v2){
	    v0.normalize();
	    // v1-=(v1*v0)*v0;
	    v1.sub(v0.clone().multiplyScalar(v1.dot(v0)));
	    v1.normalize();
	    v2.crossVectors(v0, v1);
	}
	
	
	var avg = points.reduce((c ,e)=>c.add(e), new THREE.Vector3()).divideScalar(points.length);
	var mat3 = covarianceMatrix3(points, avg);
// console.log("平均值中心点： ", avg);
// console.log("协方差矩阵", mat3);
	
	var dirs = jacobiSolver(mat3);
 console.log("协方差特征向量", dirs);
	schmidtOrthogonal(dirs[0], dirs[1], dirs[2]);
 console.log("施密特正交化", dirs);
	
	
	var infinity=Number.MAX_VALUE;
	var minExtents =new THREE.Vector3(infinity,infinity,infinity);
	var maxExtents=new THREE.Vector3(-infinity,-infinity,-infinity);

	var position = avg.clone();
	for(var i = 0; i < points.length; i++) {
	    var vec=points[i];
	    var displacement = vec.clone().sub(position);
	    
	    minExtents.x=Math.min(minExtents.x, displacement.dot(dirs[0]));
	    minExtents.y=Math.min(minExtents.y, displacement.dot(dirs[1]));
	    minExtents.z=Math.min(minExtents.z, displacement.dot(dirs[2]));
	    
	    maxExtents.x=Math.max(maxExtents.x, displacement.dot(dirs[0]));
	    maxExtents.y=Math.max(maxExtents.y, displacement.dot(dirs[1]));
	    maxExtents.z=Math.max(maxExtents.z, displacement.dot(dirs[2]));
	}
	// offset = (maxExtents-minExtents)/2.0f+minExtents
	var offset=maxExtents.clone().sub(minExtents).divideScalar(2.0).add(minExtents);

// console.log("-----------the offset-------------");
// console.log("offset", offset);

	// 中心点
	position.add(dirs[0].clone().multiplyScalar(offset.x));
	position.add(dirs[1].clone().multiplyScalar(offset.y));
	position.add(dirs[2].clone().multiplyScalar(offset.z));
 console.log("center", position);
	// 半长度
	var size = new THREE.Vector3();
	size.x=(maxExtents.x-minExtents.x);
	size.y=(maxExtents.y-minExtents.y);
	size.z=(maxExtents.z-minExtents.z);
 console.log("size", size);
	
	this.center = position;
	//size.multiplyScalar(0.5);
	this.size = size;
	this.dirs = dirs;
}
mqOBB.prototype.createBox = function() {
	var boxGeometry = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z);
        var boxMesh = new THREE.Mesh(boxGeometry, new THREE.MeshStandardMaterial({color: 0x00ff00, transparent:true, opacity: 0.5,
		side: THREE.DoubleSide}));
        boxMesh.position.copy(this.center);
        boxMesh.name = "OBB";
        var matrix = new THREE.Matrix4();
        axisesToMatrix(this.dirs[0], this.dirs[1], this.dirs[2], matrix);
	console.log('dirs matrix is ', matrix.elements);
        matrix.multiplyMatrices(new THREE.Matrix4().makeTranslation(this.center.x, this.center.y, this.center.z), matrix);
        boxMesh.applyMatrix(matrix);
        return boxMesh;
}
/**
 * 三个垂直方向向量，得出旋转矩阵
 * axisx, axisy, axisz至少有两个值存在，否则算不出来
 */
var axisesToMatrix = (function(){
	var matx = new THREE.Matrix4(), maty = new THREE.Matrix4(), matz = new THREE.Matrix4();
	var unit1 = new THREE.Vector3(), unit2 = new THREE.Vector3(), temp = new THREE.Vector3();
	var rot1 = new THREE.Vector3(), rot2 = new THREE.Vector3();
	var mat1 = new THREE.Matrix4(), mat2 = new THREE.Matrix4();
	return function(axisx, axisy, axisz, matrix) {
		matrix = matrix ? matrix.identity() : new THREE.Matrix4();
		var axis1, axis2;
		if(!axisx) {
			unit1.set(0, 1, 0); unit2.set(0, 0, 1);
			axis1 = axisy; axis2 = axisz;
		} else if(!axisy) {
			unit1.set(1, 0, 0); unit2.set(0, 0, 1);
			axis1 = axisx; axis2 = axisz;
		} else if(!axisz) {
			unit1.set(1, 0, 0); unit2.set(0, 1, 0);
			axis1 = axisx; axis2 = axisy;
		} else {
			unit1.set(0, 1, 0); unit2.set(0, 0, 1);
			axis1 = axisy; axis2 = axisz;
		}
		rot1.crossVectors(unit1, axis1).normalize();
		if(rot1.equals(0)) {
			rot1.addScalar(0.0001).crossVectors(unit1, axis1).normalize();
		}
		var ang1 = unit1.angleTo(axis1);
		
	    temp.copy(unit2).applyAxisAngle(rot1, ang1);
	    rot2.crossVectors(temp, axis2).normalize();
	    if(rot2.equals(0)) {
	    	rot2.addScalar(0.0001).crossVectors(temp, axis2).normalize();
		}
	    var ang2 = temp.angleTo(axis2);
	    
	    matrix.multiplyMatrices(mat1.makeRotationAxis(rot1, ang1), matrix);
	    matrix.multiplyMatrices(mat2.makeRotationAxis(rot2, ang2), matrix);
	    return matrix;
	}
})();


