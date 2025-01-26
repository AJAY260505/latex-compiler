const express = require('express');
const cors = require('cors');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

app.post('/compile', (req, res) => {
    try {
        const { latex } = req.body;
        const jobId = Date.now().toString();
        const jobDir = path.join(tempDir, jobId);
        
        fs.mkdirSync(jobDir);
        const texPath = path.join(jobDir, 'resume.tex');
        fs.writeFileSync(texPath, latex);

        // Compile LaTeX
        execSync(`pdflatex -interaction=nonstopmode -output-directory=${jobDir} ${texPath}`, {
            timeout: 10000
        });

        // Return PDF
        const pdf = fs.readFileSync(path.join(jobDir, 'resume.pdf'));
        res.set('Content-Type', 'application/pdf');
        res.send(pdf);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Compilation failed',
            log: error.stderr?.toString() || error.message
        });
    } finally {
        // Cleanup
        if (jobDir) fs.rmSync(jobDir, { recursive: true, force: true });
    }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Compiler running on port ${PORT}`));