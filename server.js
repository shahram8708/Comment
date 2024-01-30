const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

const uri = "mongodb+srv://ramcoding8:Shah6708@cluster0.xjzz1dy.mongodb.net/commentSystem?retryWrites=true&w=majority";
const dbName = 'commentSystem';
const collectionName = 'comments';

let client;

async function connectToMongoDB() {
    try {
        client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

async function readComments() {
    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        return await collection.find({}).toArray();
    } catch (error) {
        console.error('Error reading comments from MongoDB:', error);
        return [];
    }
}

async function writeComments(comments) {
    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        await collection.deleteMany({});
        await collection.insertMany(comments);
    } catch (error) {
        console.error('Error writing comments to MongoDB:', error);
    }
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/comments', async (req, res) => {
    const comments = await readComments();
    res.json(comments);
});

app.post('/comments', async (req, res) => {
    const { name, message } = req.body;

    if (name && message) {
        const newComment = { name, message };

        const comments = await readComments();
        comments.push(newComment);
        await writeComments(comments);

        res.json({ success: true, message: 'Comment added successfully.' });
    } else {
        res.json({ success: false, message: 'Name and message are required.' });
    }
})

connectToMongoDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
});
