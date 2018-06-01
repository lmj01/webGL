function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
	var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

	return {
		x: centerX + (radius * Math.cos(angleInRadians)),
		y: centerY + (radius * Math.sin(angleInRadians))
	};
}

function describeArc(x, y, radius, startAngle, endAngle) {
	var start = polarToCartesian(x, y, radius, endAngle);
	var end = polarToCartesian(x, y, radius, startAngle);

	var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

	return [
		"M", start.x, start.y,
		"A", radius, radius, 0, arcSweep, 0, end.x, end.y,
		"L", x, y,
		"L", start.x, start.y
	].join(" ");
}

document.getElementById("theSvgArc").setAttribute("d", describeArc(150, 150, 100, 0, 90));
document.getElementById("theSvgArc2").setAttribute("d", describeArc(300, 150, 100, 45, 190));
