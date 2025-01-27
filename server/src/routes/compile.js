// server/src/routes/compile.js
const auth = require('../middleware/auth');

router.post('/compile', auth, async (req, res) => {
  const job = await compileQueue.add({
    latex: req.body.latex,
    userId: req.user._id
  });
  
  job.on('completed', (result) => {
    res.json({ pdfUrl: `/download/${job.id}` });
  });
  
  job.on('failed', (error) => {
    res.status(500).json({ error: error.message });
  });
});