import * as XLSX from "xlsx";

export async function loadProducts() {
	const response = await fetch("/products.xlsx");

	console.log("Status:", response.status);
	console.log("Content-Type:", response.headers.get("content-type"));

	const buffer = await response.arrayBuffer();

	console.log("Buffer size:", buffer.byteLength);

	const workbook = XLSX.read(buffer, {
		type: "array"
	});

	console.log("Sheet names:", workbook.SheetNames);

	const sheet = workbook.Sheets[workbook.SheetNames[0]];

	const data = XLSX.utils.sheet_to_json(sheet);

	console.log("Rows loaded:", data.length);
	console.log("First row:", data[0]);

	return data;
}