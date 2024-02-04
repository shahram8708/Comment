const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

const uri = "mongodb+srv://ramcoding8:Shah6708@cluster0.xjzz1dy.mongodb.net/commentSystem?retryWrites=true&w=majority";
const dbName = 'commentSystem';

async function connectToMongoDB() {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
        });

        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

const commentSchema = new mongoose.Schema({
    name: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
});

const Comment = mongoose.model('Comment', commentSchema);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/comments', async (req, res) => {
    try {
        const comments = await Comment.find({}).exec();
        res.json(comments);
    } catch (error) {
        console.error('Error reading comments from MongoDB:', error);
        res.status(500).json({ success: false, message: 'Error reading comments.' });
    }
});

app.post('/comments', async (req, res) => {
    const { name, message } = req.body;

    if (name && message) {
        try {
            const newComment = new Comment({ name, message });
            await newComment.save();
            res.json({ success: true, message: 'Comment added successfully.' });
        } catch (error) {
            console.error('Error adding comment:', error);
            res.status(500).json({ success: false, message: 'Error adding comment.' });
        }
    } else {
        res.json({ success: false, message: 'Name and message are required.' });
    }
});

app.post('/comments/like', async (req, res) => {
    const { commentId } = req.body;

    try {
        const comment = await Comment.findByIdAndUpdate(commentId, { $inc: { likes: 1 } }, { new: true });
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found.' });
        }
        res.json({ success: true, message: 'Comment liked successfully.', likes: comment.likes });
    } catch (error) {
        console.error('Error liking comment:', error);
        res.status(500).json({ success: false, message: 'Error liking comment.' });
    }
});

connectToMongoDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
});
