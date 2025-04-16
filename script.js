// Initialize CodeMirror
let editor = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
    mode: 'text/x-c++src',
    theme: 'monokai',
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    lineWrapping: true,
    extraKeys: {
        "Ctrl-Space": "autocomplete"
    }
});

// Set initial content
editor.setValue(`#include <iostream>
#include <cstring>

int main() {
    char buffer[10];
    // Your code here
    return 0;
}`);

// DOM Elements
const uploadBtn = document.getElementById('uploadBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const riskLevel = document.getElementById('riskLevel');
const riskScore = document.getElementById('riskScore');
const vulnerabilities = document.getElementById('vulnerabilities');

// File Upload Handler
uploadBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.cpp,.c,.h,.hpp';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                editor.setValue(e.target.result);
            };
            reader.readAsText(file);
        }
    };
    input.click();
});

// Check server status
async function checkServerStatus() {
    try {
        const response = await fetch('http://localhost:3000/health');
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Analysis Handler
analyzeBtn.addEventListener('click', async () => {
    const code = editor.getValue();
    
    // Show loading state
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<span class="loading"></span> Analyzing...';
    
    try {
        // Check server status first
        const isServerRunning = await checkServerStatus();
        if (!isServerRunning) {
            throw new Error('Server is not running. Please follow these steps:\n1. Open PowerShell\n2. Navigate to project directory\n3. Run "npm install"\n4. Run "npm start"');
        }

        const response = await fetch('http://localhost:3000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Update UI with results
        updateResults(data);
    } catch (error) {
        console.error('Error:', error);
        vulnerabilities.innerHTML = `
            <div class="bg-red-900 bg-opacity-50 p-4 rounded">
                <p class="font-semibold text-red-500">Error: ${error.message}</p>
                <p class="text-sm text-gray-300 mt-2">Please make sure:</p>
                <ul class="list-disc list-inside text-sm text-gray-300 mt-2">
                    <li>The server is running (use "npm start" in the terminal)</li>
                    <li>You're connected to the internet</li>
                    <li>The code is valid C/C++ code</li>
                </ul>
                <div class="mt-4 p-4 bg-gray-700 rounded">
                    <p class="font-semibold">To start the server:</p>
                    <ol class="list-decimal list-inside text-sm text-gray-300 mt-2">
                        <li>Open PowerShell</li>
                        <li>Navigate to: C:\\Users\\aryan\\OneDrive\\Desktop\\OS</li>
                        <li>Run: npm install</li>
                        <li>Run: npm start</li>
                    </ol>
                </div>
            </div>
        `;
        
        // Reset risk indicators
        riskLevel.textContent = '-';
        riskLevel.className = 'text-3xl font-bold text-center';
        riskScore.textContent = '-';
    } finally {
        // Reset button state
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Code';
    }
});

// Update Results UI
function updateResults(data) {
    // Update risk level
    riskLevel.textContent = data.riskLevel;
    riskLevel.className = `text-3xl font-bold text-center risk-${data.riskLevel.toLowerCase()}`;
    
    // Update risk score
    riskScore.textContent = `${data.riskScore}%`;
    
    // Update vulnerabilities
    if (data.vulnerabilities && data.vulnerabilities.length > 0) {
        vulnerabilities.innerHTML = data.vulnerabilities.map(vuln => `
            <div class="bg-red-900 bg-opacity-50 p-3 rounded">
                <p class="font-semibold">${vuln.type}</p>
                <p class="text-sm text-gray-300">${vuln.description}</p>
                <p class="text-xs text-gray-400">Line: ${vuln.line}</p>
            </div>
        `).join('');
    } else {
        vulnerabilities.innerHTML = '<p class="text-green-500">No vulnerabilities found!</p>';
    }
} 