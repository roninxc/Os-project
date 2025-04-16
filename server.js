const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Helper function to analyze code for buffer overflow vulnerabilities
function analyzeCode(code) {
    const vulnerabilities = [];
    let riskScore = 0;
    
    // Basic heuristic analysis
    const lines = code.split('\n');
    
    // Check for unsafe functions
    const unsafeFunctions = [
        'strcpy', 'strcat', 'gets', 'sprintf', 'scanf', 'fgets'
    ];
    
    lines.forEach((line, index) => {
        // Check for unsafe function calls
        unsafeFunctions.forEach(func => {
            if (line.includes(func)) {
                vulnerabilities.push({
                    type: 'Unsafe Function Usage',
                    description: `Usage of unsafe function '${func}' detected`,
                    line: index + 1
                });
                riskScore += 20;
            }
        });
        
        // Check for fixed-size buffers
        const bufferMatch = line.match(/char\s+\w+\s*\[\s*(\d+)\s*\]/);
        if (bufferMatch) {
            const size = parseInt(bufferMatch[1]);
            if (size < 32) {
                vulnerabilities.push({
                    type: 'Small Buffer Size',
                    description: `Small fixed-size buffer (${size} bytes) detected`,
                    line: index + 1
                });
                riskScore += 15;
            }
        }
        
        // Check for potential buffer overflow in loops
        if (line.includes('while') || line.includes('for')) {
            const nextLine = lines[index + 1];
            if (nextLine && (nextLine.includes('buffer') || nextLine.includes('array'))) {
                vulnerabilities.push({
                    type: 'Potential Loop Overflow',
                    description: 'Loop operation on buffer without bounds checking',
                    line: index + 1
                });
                riskScore += 25;
            }
        }
    });
    
    // Determine risk level
    let riskLevel = 'LOW';
    if (riskScore >= 60) {
        riskLevel = 'HIGH';
    } else if (riskScore >= 30) {
        riskLevel = 'MEDIUM';
    }
    
    return {
        riskLevel,
        riskScore: Math.min(riskScore, 100),
        vulnerabilities
    };
}

// API endpoint for code analysis
app.post('/analyze', (req, res) => {
    const { code } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }
    
    try {
        const analysis = analyzeCode(code);
        res.json(analysis);
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Error analyzing code' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Press Ctrl+C to stop the server');
}); 