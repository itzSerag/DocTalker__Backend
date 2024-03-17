const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
        FileName: {
            type: String,
            required: true,
            trim: true,
        },
        Files: [
            {
                FileName: {
                    type: String,
                    required: true,
                },
                FileKey: {
                    type: String,
                    required: true,
                },
                FileURL: {
                    // only for s3
                    type: String,
                    required: true,
                },
                Chunks: [
                    {
                        rawText: {
                            type: String,
                        },
                        embeddings: [Number],
                    },
                ],
                isProcessed: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        isProcessed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Document', documentSchema);
