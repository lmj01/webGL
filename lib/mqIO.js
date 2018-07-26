
// image data
function loadImage(url, onload) {
	var img = new Image();
	img.src = url;
	img.onload = function(){
		onload(img);
	}
	return img;
}

function loadRawData(url, callback) {
	var rawFile = new XMLHttpRequest();
	rawFile.open('GET', url, true);
	rawFile.responseType = 'blob';
	rawFile.onloadend = function() {
		var fr = new FileReader();
		fr.onload = function(){
			var buf = new Uint8Array(fr.result, 0, fr.result.byteLength);
			callback(buf);
		}
		fr.onerror = function(e) {
			console.error("FileReader error", e);
		}
		fr.readAsArrayBuffer(rawFile.response);	
	}
	rawFile.send(null);
}