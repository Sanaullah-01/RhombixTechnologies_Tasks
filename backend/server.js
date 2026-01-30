import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    }
});

// Endpoint to get a secure upload URL 
app.get('/api/upload-url', async (req, res) => {
    const fileName = `photo-${Date.now()}.jpg`;
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        ContentType: 'image/jpeg',
        ACL: 'public-read' // Vital for images to show in the gallery
    });

    try {
        const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
        res.json({ uploadUrl: url, key: fileName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to list all photos 
app.get('/api/photos', async (req, res) => {
    const command = new ListObjectsV2Command({ Bucket: process.env.S3_BUCKET_NAME });
    try {
        const { Contents } = await s3Client.send(command);
        const urls = Contents ? Contents.map(item => 
            `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`
        ) : [];
        res.json(urls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to delete a photo
app.delete('/api/photos/:key', async (req, res) => {
    const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: req.params.key,
    });

    try {
        await s3Client.send(command);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () => console.log('Server running on port 5000'));