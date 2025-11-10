// settings.js - Frontend JavaScript for Student Management

let currentClass = "";
let currentStudents = {};
let selectedStudentForEdit = "";

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
	loadClasses();
	setupEventListeners();
});

function setupEventListeners() {
	document.getElementById("classSelect").addEventListener("change", (e) => {
		const value = e.target.value;
		if (value === "NEW_CLASS") {
			document.getElementById("newClassForm").style.display = "block";
			document.getElementById("deleteClassSection").style.display = "none";
			document.getElementById("studentSection").style.display = "none";
			currentClass = "";
		} else if (value) {
			document.getElementById("newClassForm").style.display = "none";
			document.getElementById("deleteClassSection").style.display = "block";
			document.getElementById("studentSection").style.display = "block";
			currentClass = value;
			loadStudents(value);
		} else {
			document.getElementById("newClassForm").style.display = "none";
			document.getElementById("deleteClassSection").style.display = "none";
			document.getElementById("studentSection").style.display = "none";
			currentClass = "";
		}
	});

	document.getElementById("pdfFile")?.addEventListener("change", (e) => {
		if (e.target.files.length > 0) {
			document.getElementById("parseButton").disabled = false;
		}
	});
}

// Load all classes
async function loadClasses() {
	try {
		const response = await fetch("/api/classes");
		const data = await response.json();

		if (data.success) {
			const select = document.getElementById("classSelect");
			select.innerHTML = '<option value="">-- Sınıf Seçin --</option>';

			data.classes.sort().forEach((className) => {
				const option = document.createElement("option");
				option.value = className;
				option.textContent = className;
				select.appendChild(option);
			});

			const newOption = document.createElement("option");
			newOption.value = "NEW_CLASS";
			newOption.textContent = "--- Yeni Sınıf Ekle ---";
			select.appendChild(newOption);
		}
	} catch (_error) {
		showNotification("Sınıflar yüklenirken hata oluştu", "error");
	}
}

// Create new class
async function createClass() {
	const className = document.getElementById("newClassName").value.trim();

	if (!className) {
		showNotification("Lütfen sınıf adı girin", "error");
		return;
	}

	try {
		const response = await fetch("/api/classes", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ className }),
		});

		const data = await response.json();

		if (data.success) {
			showNotification(`Sınıf '${className}' başarıyla oluşturuldu`, "success");
			document.getElementById("newClassName").value = "";
			await loadClasses();
			document.getElementById("classSelect").value = className;
			document.getElementById("classSelect").dispatchEvent(new Event("change"));
		} else {
			showNotification(data.error || "Sınıf oluşturulamadı", "error");
		}
	} catch (_error) {
		showNotification("Sınıf oluşturulurken hata oluştu", "error");
	}
}

// Delete class
async function deleteClass() {
	if (!currentClass) return;

	if (
		!confirm(
			`'${currentClass}' sınıfını ve tüm öğrencilerini silmek istediğinizden emin misiniz?`,
		)
	) {
		return;
	}

	try {
		const response = await fetch(
			`/api/classes/${encodeURIComponent(currentClass)}`,
			{
				method: "DELETE",
			},
		);

		const data = await response.json();

		if (data.success) {
			showNotification(`Sınıf '${currentClass}' silindi`, "success");
			currentClass = "";
			await loadClasses();
			document.getElementById("classSelect").value = "";
			document.getElementById("classSelect").dispatchEvent(new Event("change"));
		} else {
			showNotification(data.error || "Sınıf silinemedi", "error");
		}
	} catch (_error) {
		showNotification("Sınıf silinirken hata oluştu", "error");
	}
}

// Load students for a class
async function loadStudents(className) {
	try {
		const response = await fetch(
			`/api/classes/${encodeURIComponent(className)}/students`,
		);
		const data = await response.json();

		if (data.success) {
			currentStudents = data.students;
			updateStudentSection(className);
			populateEditStudentSelect();
			displayStudentsTable();
		}
	} catch (_error) {
		showNotification("Öğrenciler yüklenirken hata oluştu", "error");
	}
}

// Update student section title
function updateStudentSection(className) {
	document.getElementById("studentSectionTitle").textContent =
		`2. '${className}' Sınıfı Öğrenci İşlemleri`;
}

// Populate edit student select dropdown
function populateEditStudentSelect() {
	const select = document.getElementById("editStudentSelect");
	select.innerHTML = '<option value="">-- Öğrenci Seçin --</option>';

	Object.keys(currentStudents)
		.sort()
		.forEach((name) => {
			const option = document.createElement("option");
			option.value = name;
			option.textContent = name;
			select.appendChild(option);
		});
}

// Display students in table
function displayStudentsTable() {
	const tbody = document.getElementById("studentsTableBody");
	tbody.innerHTML = "";

	const studentCount = Object.keys(currentStudents).length;

	if (studentCount === 0) {
		document.getElementById("studentsTableCard").style.display = "none";
		return;
	}

	document.getElementById("studentsTableCard").style.display = "block";
	document.getElementById("studentsTableTitle").textContent =
		`Tüm Kayıtlar Tablosu (${studentCount} Öğrenci)`;

	Object.entries(currentStudents).forEach(([name, info]) => {
		const row = document.createElement("tr");
		row.innerHTML = `
            <td>${name}</td>
            <td>${info["Okul No"] || ""}</td>
            <td>${info["Anne Adı Soyadı"] || ""}</td>
            <td>${info["Anne E-posta"] || ""}</td>
            <td>${info["Anne Telefon"] || ""}</td>
            <td>${info["Baba Adı Soyadı"] || ""}</td>
            <td>${info["Baba E-posta"] || ""}</td>
            <td>${info["Baba Telefon"] || ""}</td>
        `;
		tbody.appendChild(row);
	});
}

// Switch tabs
function switchTab(tabName) {
	// Update tab buttons
	document
		.querySelectorAll(".tab-button")
		?.forEach((btn) => btn.classList.remove("active")) ?? [];
	event.target.classList.add("active");

	// Update tab content
	document
		.querySelectorAll(".tab-content")
		?.forEach((content) => content.classList.remove("active")) ?? [];
	document.getElementById(`${tabName}Tab`)?.classList.add("active");
}

// Add student
async function addStudent(event) {
	event.preventDefault();

	if (!currentClass) {
		showNotification("Lütfen önce bir sınıf seçin", "error");
		return;
	}

	const studentName = document.getElementById("addName").value.trim();
	const studentInfo = {
		"Okul No": document.getElementById("addSchoolNo").value.trim(),
		"Anne Adı Soyadı": document.getElementById("addMotherName").value.trim(),
		"Anne E-posta": document.getElementById("addMotherEmail").value.trim(),
		"Anne Telefon": document.getElementById("addMotherPhone").value.trim(),
		"Baba Adı Soyadı": document.getElementById("addFatherName").value.trim(),
		"Baba E-posta": document.getElementById("addFatherEmail").value.trim(),
		"Baba Telefon": document.getElementById("addFatherPhone").value.trim(),
	};

	try {
		const response = await fetch(
			`/api/classes/${encodeURIComponent(currentClass)}/students`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ studentName, studentInfo }),
			},
		);

		const data = await response.json();

		if (data.success) {
			showNotification(
				`Öğrenci '${studentName}' başarıyla kaydedildi`,
				"success",
			);
			document.getElementById("addStudentForm").reset();
			await loadStudents(currentClass);
		} else {
			showNotification(data.error || "Öğrenci kaydedilemedi", "error");
		}
	} catch (_error) {
		showNotification("Öğrenci kaydedilirken hata oluştu", "error");
	}
}

// Load student data for editing
function loadStudentForEdit() {
	const select = document.getElementById("editStudentSelect");
	const studentName = select.value;

	if (!studentName) {
		document.getElementById("editStudentForm").style.display = "none";
		return;
	}

	selectedStudentForEdit = studentName;
	const studentInfo = currentStudents[studentName];

	document.getElementById("editName").value = studentName;
	document.getElementById("editSchoolNo").value = studentInfo["Okul No"] || "";
	document.getElementById("editMotherName").value =
		studentInfo["Anne Adı Soyadı"] || "";
	document.getElementById("editMotherEmail").value =
		studentInfo["Anne E-posta"] || "";
	document.getElementById("editMotherPhone").value =
		studentInfo["Anne Telefon"] || "";
	document.getElementById("editFatherName").value =
		studentInfo["Baba Adı Soyadı"] || "";
	document.getElementById("editFatherEmail").value =
		studentInfo["Baba E-posta"] || "";
	document.getElementById("editFatherPhone").value =
		studentInfo["Baba Telefon"] || "";

	document.getElementById("editStudentForm").style.display = "block";
}

// Update student
async function updateStudent(event) {
	event.preventDefault();

	if (!currentClass || !selectedStudentForEdit) {
		showNotification("Geçersiz işlem", "error");
		return;
	}

	const newName = document.getElementById("editName").value.trim();
	const studentInfo = {
		"Okul No": document.getElementById("editSchoolNo").value.trim(),
		"Anne Adı Soyadı": document.getElementById("editMotherName").value.trim(),
		"Anne E-posta": document.getElementById("editMotherEmail").value.trim(),
		"Anne Telefon": document.getElementById("editMotherPhone").value.trim(),
		"Baba Adı Soyadı": document.getElementById("editFatherName").value.trim(),
		"Baba E-posta": document.getElementById("editFatherEmail").value.trim(),
		"Baba Telefon": document.getElementById("editFatherPhone").value.trim(),
	};

	// Check if name already exists (if name changed)
	if (selectedStudentForEdit !== newName && currentStudents[newName]) {
		showNotification("Bu isimde bir öğrenci zaten mevcut", "error");
		return;
	}

	try {
		const response = await fetch(
			`/api/classes/${encodeURIComponent(currentClass)}/students/${encodeURIComponent(selectedStudentForEdit)}`,
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ newName, studentInfo }),
			},
		);

		const data = await response.json();

		if (data.success) {
			showNotification(`Öğrenci '${newName}' başarıyla güncellendi`, "success");
			await loadStudents(currentClass);
			document.getElementById("editStudentSelect").value = "";
			document.getElementById("editStudentForm").style.display = "none";
			selectedStudentForEdit = "";
		} else {
			showNotification(data.error || "Öğrenci güncellenemedi", "error");
		}
	} catch (_error) {
		showNotification("Öğrenci güncellenirken hata oluştu", "error");
	}
}

// Delete student
async function deleteStudent() {
	if (!currentClass || !selectedStudentForEdit) {
		showNotification("Geçersiz işlem", "error");
		return;
	}

	if (
		!confirm(
			`'${selectedStudentForEdit}' öğrencisini silmek istediğinizden emin misiniz?`,
		)
	) {
		return;
	}

	try {
		const response = await fetch(
			`/api/classes/${encodeURIComponent(currentClass)}/students/${encodeURIComponent(selectedStudentForEdit)}`,
			{ method: "DELETE" },
		);

		const data = await response.json();

		if (data.success) {
			showNotification(
				`Öğrenci '${selectedStudentForEdit}' silindi`,
				"success",
			);
			await loadStudents(currentClass);
			document.getElementById("editStudentSelect").value = "";
			document.getElementById("editStudentForm").style.display = "none";
			selectedStudentForEdit = "";
		} else {
			showNotification(data.error || "Öğrenci silinemedi", "error");
		}
	} catch (_error) {
		showNotification("Öğrenci silinirken hata oluştu", "error");
	}
}

// Upload Excel file
	async function uploadExcel() {
	const fileInput = document.getElementById("excelFile");
	const file = fileInput.files[0];

	if (!file) {
		showNotification("Lütfen bir Excel dosyası seçin", "error");
		return;
	}

	if (!currentClass) {
		showNotification("Lütfen önce bir sınıf seçin", "error");
		return;
	}

	const formData = new FormData();
	formData.append("file", file);

	try {
		const response = await fetch(
			`/api/classes/${encodeURIComponent(currentClass)}/upload-excel`,
			{
				method: "POST",
				body: formData,
			},
		);

		const data = await response.json();

		if (data.success) {
			showNotification(
				`${data.count} öğrenci başarıyla içe aktarıldı`,
				"success",
			);
			fileInput.value = "";
			await loadStudents(currentClass);
		} else {
			showNotification(data.error || "Excel dosyası işlenemedi", "error");
		}
	} catch (_error) {
		showNotification("Excel dosyası yüklenirken hata oluştu", "error");
	}
}

// Show notification
function showNotification(message, type = "info") {
	const notification = document.getElementById("notification");
	notification.textContent = message;
	notification.className = `notification ${type}`;
	notification.classList.add("show");

	setTimeout(() => {
		notification.classList.remove("show");
	}, 3000);
}
