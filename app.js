const fs = require('fs');
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const app = express();
app.use(cors());

const port = 3000;

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Function to get the next blog ID
function getNextBlogId(jsonData) {
  if (!jsonData || jsonData.length === 0) return 1;
  return Math.max(...jsonData.map((item) => item.id)) + 1;
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Get the file extension
    const ext = path.extname(file.originalname);
    // Use the blog ID from the request body
    const blogId = req.body.blogId || Date.now();
    cb(null, `blog-${blogId}${ext}`);
  },
});

const upload = multer({ storage: storage });

app.post('/add', upload.single('image'), (req, res) => {
  const body = req.body;

  fs.readFile(`${__dirname}/data.json`, 'utf-8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      return res.status(500).json({ message: 'Error reading the file!' });
    }

    let jsonData = data ? JSON.parse(data) : [];
    const nextId = getNextBlogId(jsonData);

    // Update the filename with the correct blog ID
    let imagePath = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newFilename = `blog-${nextId}${ext}`;
      const oldPath = req.file.path;
      const newPath = path.join('uploads', newFilename);

      // Rename the file to match the blog ID
      fs.renameSync(oldPath, newPath);
      imagePath = newPath;
    }

    const newBlog = {
      id: nextId,
      data: {
        ...body,
        imagePath: imagePath,
      },
    };

    jsonData.unshift(newBlog);

    fs.writeFile(
      `${__dirname}/data.json`,
      JSON.stringify(jsonData, null, 2),
      (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error writing file!' });
        }
        res.status(201).json({ message: 'Data added successfully!' });
        console.log(jsonData);
      }
    );
  });
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Serve data.json
app.get('/data.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'data.json'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
