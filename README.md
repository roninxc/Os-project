AI-Assisted Buffer Overflow Detection

A modern web application that helps detect potential buffer overflow vulnerabilities in C/C++ code using AI-powered analysis.

Features

- Modern, colorful UI with real-time code analysis
- Syntax highlighting for C/C++ code
- File upload support
- Detailed vulnerability reporting
- Risk level assessment
- Interactive code editor

Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd buffer-overflow-detector
```

2. Install dependencies:
```bash
npm install
```

Usage

1. Start the server:
```bash
npm start
```

2. Open your web browser and navigate to:
```
http://localhost:3000
```

3. You can either:
   - Type or paste your C/C++ code directly into the editor
   - Upload a C/C++ source file using the "Upload File" button
   - Click "Analyze Code" to check for buffer overflow vulnerabilities

How It Works

The application uses a combination of static analysis and heuristic-based detection to identify potential buffer overflow vulnerabilities in your code. It checks for:

- Unsafe function usage (strcpy, strcat, gets, etc.)
- Small fixed-size buffers
- Potential buffer overflow in loops
- Other common buffer overflow patterns

Risk Levels

- **LOW**: 0-29% risk score
- **MEDIUM**: 30-59% risk score
- **HIGH**: 60-100% risk score
