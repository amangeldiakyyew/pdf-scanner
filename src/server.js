// server.js - Main Hono server with API routes

import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import archiver from "archiver";
import { Hono } from "hono";
import { cors } from "hono/cors";
import multer from "multer";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";
import {
	deleteClass,
	deleteStudent,
	getClasses,
	getStudentsByClass,
	loadData,
	saveClass,
	saveStudent,
} from "./dataManager.js";
import { parsePdfForStudents, prepareStudentInfo } from "./pdfParser.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure multer for file uploads
const _upload = multer({ storage: multer.memoryStorage() });
// Initialize Hono app
const app = new Hono();

// Enable CORS
app.use("/*", cors());

// Serve static files
app.use(
	"/static/*",
	serveStatic({ root: path.join(__dirname, "..", "public") }),
);
app.use("/css/*", serveStatic({ root: path.join(__dirname, "..", "public") }));
app.use("/js/*", serveStatic({ root: path.join(__dirname, "..", "public") }));

// ==================== ROUTES ====================

// Root route - serve main page
app.get("/", (c) => {
	return c.redirect("/settings");
});

// Settings page
app.get("/settings", async (c) => {
	const html = await fs.readFile(
		path.join(__dirname, "..", "public", "settings.html"),
		"utf-8",
	);
	return c.html(html);
});

// PDF parsing page
app.get("/pdf-parsing", async (c) => {
	const html = await fs.readFile(
		path.join(__dirname, "..", "public", "pdf-parsing.html"),
		"utf-8",
	);
	return c.html(html);
});

// ==================== API ROUTES ====================

// Get all classes
app.get("/api/classes", async (c) => {
	try {
		const classes = await getClasses();
		return c.json({ success: true, classes });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// Get students for a class
app.get("/api/classes/:className/students", async (c) => {
	try {
		const className = c.req.param("className");
		const students = await getStudentsByClass(className);
		return c.json({ success: true, students });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// Create a new class
app.post("/api/classes", async (c) => {
	try {
		const { className } = await c.req.json();
		if (!className) {
			return c.json({ success: false, error: "Class name is required" }, 400);
		}

		const data = await loadData();
		if (data[className]) {
			return c.json({ success: false, error: "Class already exists" }, 400);
		}

		await saveClass(className);
		return c.json({ success: true, message: "Class created successfully" });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// Delete a class
app.delete("/api/classes/:className", async (c) => {
	try {
		const className = c.req.param("className");
		await deleteClass(className);
		return c.json({ success: true, message: "Class deleted successfully" });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// Add or update a student
app.post("/api/classes/:className/students", async (c) => {
	try {
		const className = c.req.param("className");
		const { studentName, studentInfo } = await c.req.json();

		if (!studentName || !studentInfo) {
			return c.json(
				{ success: false, error: "Student name and info are required" },
				400,
			);
		}

		await saveStudent(className, studentName, studentInfo);
		return c.json({ success: true, message: "Student saved successfully" });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// Update student (handle name changes)
app.put("/api/classes/:className/students/:oldName", async (c) => {
	try {
		const className = c.req.param("className");
		const oldName = decodeURIComponent(c.req.param("oldName"));
		const { newName, studentInfo } = await c.req.json();

		// If name changed, delete old entry
		if (oldName !== newName) {
			await deleteStudent(className, oldName);
		}

		await saveStudent(className, newName, studentInfo);
		return c.json({ success: true, message: "Student updated successfully" });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// Delete a student
app.delete("/api/classes/:className/students/:studentName", async (c) => {
	try {
		const className = c.req.param("className");
		const studentName = decodeURIComponent(c.req.param("studentName"));
		await deleteStudent(className, studentName);
		return c.json({ success: true, message: "Student deleted successfully" });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// Upload Excel file with students
app.post("/api/classes/:className/upload-excel", async (c) => {
	try {
		const className = c.req.param("className");
		const formData = await c.req.formData();
		const file = formData.get("file");

		if (!file) {
			return c.json({ success: false, error: "No file uploaded" }, 400);
		}

		const buffer = await file.arrayBuffer();
		const workbook = XLSX.read(buffer);
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];
		const data = XLSX.utils.sheet_to_json(worksheet);

		let successCount = 0;
		const students = await getStudentsByClass(className);

		for (const row of data) {
			const name = String(row["Ad Soyad"] || "").trim();
			const schoolNo = String(row["Okul No"] || "").trim();

			if (
				name &&
				schoolNo &&
				name !== "undefined" &&
				schoolNo !== "undefined"
			) {
				students[name] = {
					"Okul No": schoolNo,
					"Anne Adı Soyadı": String(row["Anne Adı Soyadı"] || "").trim(),
					"Anne E-posta": String(row["Anne E-posta"] || "").trim(),
					"Anne Telefon": String(row["Anne Telefon"] || "").trim(),
					"Baba Adı Soyadı": String(row["Baba Adı Soyadı"] || "").trim(),
					"Baba E-posta": String(row["Baba E-posta"] || "").trim(),
					"Baba Telefon": String(row["Baba Telefon"] || "").trim(),
				};
				successCount++;
			}
		}

		await saveClass(className, students);
		return c.json({
			success: true,
			count: successCount,
			message: `${successCount} students imported`,
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// Parse PDF
app.post("/api/parse-pdf", async (c) => {
	try {
		const formData = await c.req.formData();
		const file = formData.get("file");
		const className = formData.get("className");

		if (!file || !className) {
			return c.json(
				{ success: false, error: "File and class name are required" },
				400,
			);
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const classStudents = await getStudentsByClass(className);
		const studentInfo = prepareStudentInfo(classStudents);

		if (Object.keys(studentInfo).length === 0) {
			return c.json(
				{
					success: false,
					error:
						"No valid students found in class. Students need school number and at least 2 name parts.",
				},
				400,
			);
		}

		const result = await parsePdfForStudents(buffer, studentInfo);

		// Store reports in memory for download (in production, use a database or cache)
		global.lastParseResult = result;

		return c.json({
			success: true,
			foundCount: result.foundReports.length,
			missingCount: result.missingStudents.length,
			missingStudents: result.missingStudents,
			hasDuplicates: result.hasDuplicates,
			totalPages: result.totalPages,
			reports: result.foundReports.map((r) => ({
				id: r.id,
				studentName: r.studentName,
				matchedText: r.matchedText,
				fileNameSchoolNo: r.fileNameSchoolNo,
				fileNameStudent: r.fileNameStudent,
				pageNumber: r.pageNumber,
			})),
		});
	} catch (error) {
		console.error("PDF parsing error:", error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// Download single PDF
app.get("/api/download-pdf/:reportId", async (c) => {
	try {
		const reportId = c.req.param("reportId");

		if (!global.lastParseResult) {
			return c.json(
				{ success: false, error: "No parse results available" },
				404,
			);
		}

		const report = global.lastParseResult.foundReports.find(
			(r) => r.id === reportId,
		);

		if (!report) {
			return c.json({ success: false, error: "Report not found" }, 404);
		}

		return new Response(report.pdfBytes, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="${report.fileNameStudent}"`,
			},
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// Download ZIP with all PDFs (by naming mode)
app.get("/api/download-zip/:namingMode", async (c) => {
	try {
		const namingMode = c.req.param("namingMode"); // 'schoolNo' or 'name'

		if (
			!global.lastParseResult ||
			!global.lastParseResult.foundReports.length
		) {
			return c.json(
				{ success: false, error: "No parse results available" },
				404,
			);
		}

		const archive = archiver("zip", { zlib: { level: 9 } });

		// Set response headers
		const headers = {
			"Content-Type": "application/zip",
			"Content-Disposition": `attachment; filename="reports_${namingMode}.zip"`,
		};

		// Track duplicate names
		const nameCounts = {};

		for (const report of global.lastParseResult.foundReports) {
			const fileName =
				namingMode === "schoolNo"
					? report.fileNameSchoolNo
					: report.fileNameStudent;

			// Handle duplicates within ZIP
			let finalName = fileName;
			if (nameCounts[fileName]) {
				nameCounts[fileName]++;
				finalName = fileName.replace(".pdf", `_${nameCounts[fileName]}.pdf`);
			} else {
				nameCounts[fileName] = 1;
			}

			archive.append(report.pdfBytes, { name: finalName });
		}

		await archive.finalize();

		return new Response(archive, { headers });
	} catch (error) {
		console.error("ZIP generation error:", error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// Delete a report from results
app.delete("/api/reports/:reportId", async (c) => {
	try {
		const reportId = c.req.param("reportId");

		if (!global.lastParseResult) {
			return c.json(
				{ success: false, error: "No parse results available" },
				404,
			);
		}

		global.lastParseResult.foundReports =
			global.lastParseResult.foundReports.filter((r) => r.id !== reportId);

		return c.json({ success: true, message: "Report deleted successfully" });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ==================== START SERVER ====================

const port = process.env.PORT || 3000;

console.log(`🚀 Server starting on http://localhost:${port}`);

serve({
	fetch: app.fetch,
	port,
});
