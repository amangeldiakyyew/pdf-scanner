// pdfParser.js - PDF parsing and student page extraction

import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';

const EXACT_MATCH_LIMIT = 10;
const CONTEXT_CHAR_LIMIT = 10;

/**
 * Extract text from a single PDF page
 * @param {PDFDocument} pdfDoc - Already loaded PDF document
 * @param {number} pageNum - Page number (0-indexed)
 * @returns {Promise<string>} Page text
 */
async function extractPageText(pdfDoc, pageNum) {
    // Suppress console warnings from pdf-parse
    const originalWarn = console.warn;
    const originalError = console.error;
    console.warn = () => {};
    console.error = (msg) => {
        // Only suppress "TT:" warnings, allow other errors
        if (typeof msg === 'string' && msg.startsWith('TT:')) {
            return;
        }
        originalError(msg);
    };

    try {
        const options = {
            max: 1,
            pagerender: (pageData) => {
                return pageData.getTextContent().then((textContent) => {
                    return textContent.items.map(item => item.str).join(' ');
                });
            }
        };

        // Create single-page PDF
        const singlePageDoc = await PDFDocument.create();
        const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [pageNum]);
        singlePageDoc.addPage(copiedPage);
        const singlePageBytes = await singlePageDoc.save();
        
        const data = await pdfParse(singlePageBytes, options);
        return data.text;
    } finally {
        console.warn = originalWarn;
        console.error = originalError;
    }
}

/**
 * Parse PDF and extract individual student pages
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {Object} studentInfo - Student information object
 * @returns {Promise<Object>} Result object with found reports and missing students
 */
export async function parsePdfForStudents(pdfBuffer, studentInfo) {
    try {
        // Load PDF document once
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const totalPages = pdfDoc.getPageCount();

        const foundReports = [];
        const foundStudents = new Set();
        const schoolNumberCounts = {};
        let hasDuplicates = false;

        // Prepare search patterns for each student
        const searchPatterns = {};
        for (const [fullName, info] of Object.entries(studentInfo)) {
            const nameParts = info.nameParts.map(p => p.toLowerCase());
            const patterns = [];

            // Forward pattern
            const forwardPattern = nameParts.join('\\s*');
            patterns.push(forwardPattern);

            // Reverse pattern
            const reversePattern = [...nameParts].reverse().join('\\s*');
            patterns.push(reversePattern);

            searchPatterns[fullName] = {
                patterns,
                schoolNo: info.schoolNo
            };
        }

        // Extract text for each page and find matches
        for (let pageNum = 0; pageNum < totalPages; pageNum++) {
            try {
                // Extract text from the page
                const pageText = await extractPageText(pdfDoc, pageNum);
                const pageTextLower = pageText.toLowerCase();

                let matchedStudent = null;
                let matchedText = '';

                // Try to find a matching student
                for (const [fullName, searchInfo] of Object.entries(searchPatterns)) {
                    let found = false;

                    for (const pattern of searchInfo.patterns) {
                        const regex = new RegExp(pattern, 'i');
                        const match = pageTextLower.match(regex);

                        if (match) {
                            matchedStudent = fullName;
                            const matchStart = match.index;
                            const matchEnd = matchStart + match[0].length;

                            const preMatchLen = matchStart;
                            const postMatchLen = pageTextLower.length - matchEnd;

                            // Exact match priority
                            if (preMatchLen <= EXACT_MATCH_LIMIT && postMatchLen <= EXACT_MATCH_LIMIT) {
                                matchedText = pageText.substring(matchStart, matchEnd).trim();
                            } else {
                                // Context-based match
                                const startIndex = Math.max(0, matchStart - CONTEXT_CHAR_LIMIT);
                                const endIndex = Math.min(pageText.length, matchEnd + CONTEXT_CHAR_LIMIT);
                                matchedText = pageText.substring(startIndex, endIndex).trim();
                            }

                            found = true;
                            break;
                        }
                    }

                    if (found) break;
                }

                if (matchedStudent) {
                    const schoolNo = searchPatterns[matchedStudent].schoolNo;
                    
                    // Count occurrences of this school number
                    schoolNumberCounts[schoolNo] = (schoolNumberCounts[schoolNo] || 0) + 1;
                    const count = schoolNumberCounts[schoolNo];

                    // Create file names
                    let fileNameSchoolNo, fileNameStudent;
                    if (count > 1) {
                        hasDuplicates = true;
                        fileNameSchoolNo = `${schoolNo}_${count - 1}.pdf`;
                        fileNameStudent = `${matchedStudent}_${count - 1}.pdf`;
                    } else {
                        fileNameSchoolNo = `${schoolNo}.pdf`;
                        fileNameStudent = `${matchedStudent}.pdf`;
                    }

                    // Extract single page PDF
                    const outputDoc = await PDFDocument.create();
                    const [page] = await outputDoc.copyPages(pdfDoc, [pageNum]);
                    outputDoc.addPage(page);
                    const pdfBytes = await outputDoc.save();

                    foundReports.push({
                        id: uuidv4(),
                        studentName: matchedStudent,
                        matchedText: matchedText,
                        fileNameSchoolNo: fileNameSchoolNo,
                        fileNameStudent: fileNameStudent,
                        pdfBytes: Buffer.from(pdfBytes),
                        pageNumber: pageNum + 1
                    });

                    foundStudents.add(matchedStudent);
                }
            } catch (pageError) {
                console.error(`Error processing page ${pageNum + 1}:`, pageError);
            }
        }

        // Find missing students
        const allStudentNames = Object.keys(studentInfo);
        const missingStudents = allStudentNames.filter(name => !foundStudents.has(name));

        return {
            foundReports,
            missingStudents,
            hasDuplicates,
            totalPages
        };
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw error;
    }
}

/**
 * Prepare student information for parsing
 * @param {Object} classStudents - Students object from class
 * @returns {Object} Prepared student info
 */
export function prepareStudentInfo(classStudents) {
    const prepared = {};

    for (const [fullName, details] of Object.entries(classStudents)) {
        const schoolNo = String(details['Okul No'] || '');
        const nameParts = fullName.trim().split(/\s+/);

        // Only include students with valid school number and at least 2 name parts
        if (schoolNo && schoolNo !== 'undefined' && nameParts.length >= 2) {
            prepared[fullName] = {
                schoolNo: schoolNo,
                nameParts: nameParts
            };
        }
    }

    return prepared;
}

