
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
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'blob';
	//xhr.responseType = 'arraybuffer';
	xhr.onloadend = function() {
		var fr = new FileReader();
		fr.onload = function(){
			var buf = new Uint8Array(fr.result, 0, fr.result.byteLength);
			callback(buf, fr.result.byteLength);
		}
		fr.onerror = function(e) {
			console.error("FileReader error", e);
		}
		fr.readAsArrayBuffer(xhr.response);	
	}
	xhr.send(null);
}