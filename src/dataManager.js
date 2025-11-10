// dataManager.js - Handle JSON data storage for student information

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'data', 'student_data.json');

/**
 * Load student data from JSON file
 * @returns {Promise<Object>} Student data object
 */
export async function loadData() {
    try {
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return empty object
            return {};
        }
        console.error('Error loading data:', error);
        return {};
    }
}

/**
 * Save student data to JSON file
 * @param {Object} data - Student data object to save
 * @returns {Promise<void>}
 */
export async function saveData(data) {
    try {
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 4), 'utf-8');
    } catch (error) {
        console.error('Error saving data:', error);
        throw error;
    }
}

/**
 * Get all classes
 * @returns {Promise<string[]>} Array of class names
 */
export async function getClasses() {
    const data = await loadData();
    return Object.keys(data);
}

/**
 * Get students for a specific class
 * @param {string} className - Name of the class
 * @returns {Promise<Object>} Students object
 */
export async function getStudentsByClass(className) {
    const data = await loadData();
    return data[className] || {};
}

/**
 * Add or update a class
 * @param {string} className - Name of the class
 * @param {Object} students - Students object (optional)
 * @returns {Promise<void>}
 */
export async function saveClass(className, students = {}) {
    const data = await loadData();
    data[className] = students;
    await saveData(data);
}

/**
 * Delete a class
 * @param {string} className - Name of the class to delete
 * @returns {Promise<void>}
 */
export async function deleteClass(className) {
    const data = await loadData();
    delete data[className];
    await saveData(data);
}

/**
 * Add or update a student in a class
 * @param {string} className - Name of the class
 * @param {string} studentName - Name of the student
 * @param {Object} studentInfo - Student information
 * @returns {Promise<void>}
 */
export async function saveStudent(className, studentName, studentInfo) {
    const data = await loadData();
    if (!data[className]) {
        data[className] = {};
    }
    data[className][studentName] = studentInfo;
    await saveData(data);
}

/**
 * Delete a student from a class
 * @param {string} className - Name of the class
 * @param {string} studentName - Name of the student
 * @returns {Promise<void>}
 */
export async function deleteStudent(className, studentName) {
    const data = await loadData();
    if (data[className]) {
        delete data[className][studentName];
        await saveData(data);
    }
}

